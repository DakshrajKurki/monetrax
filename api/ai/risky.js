// api/ai/risky.js - POST /api/ai/risky
import { handleCors, getGeminiClient, parseBody, generateFallbackRiskyReply } from '../_lib/helpers.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = await parseBody(req);
  const { message = '', screen = '/', selectedCase = null, history = [] } = body || {};

  const { ai, model, error: clientInitError } = await getGeminiClient();
  let fallbackReason = clientInitError;

  if (ai) {
    try {
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'open_case',
              description: 'Open full investigation case details',
              parameters: {
                type: 'OBJECT',
                properties: { caseId: { type: 'STRING', description: 'Case ID e.g. TXN-94021' } },
                required: ['caseId']
              }
            },
            {
              name: 'fly_to_location',
              description: 'Fly camera and dive to geographic corridor location on 3D globe / map',
              parameters: {
                type: 'OBJECT',
                properties: {
                  caseId: { type: 'STRING', description: 'Case ID' },
                  city: { type: 'STRING', description: 'Destination city name' }
                },
                required: ['caseId']
              }
            },
            {
              name: 'generate_sar',
              description: 'Open SAR Filing Center to draft a FinCEN SAR report',
              parameters: {
                type: 'OBJECT',
                properties: { caseId: { type: 'STRING', description: 'Case ID' } },
                required: ['caseId']
              }
            },
            {
              name: 'open_account',
              description: 'Open Account 360 profile dossier',
              parameters: {
                type: 'OBJECT',
                properties: { accountId: { type: 'STRING', description: 'Account ID' } },
                required: ['accountId']
              }
            },
            {
              name: 'screen_name',
              description: 'Screen counterparty or individual against OFAC SDN and sanctions',
              parameters: {
                type: 'OBJECT',
                properties: { name: { type: 'STRING', description: 'Name to screen' } },
                required: ['name']
              }
            },
            {
              name: 'replay_typology',
              description: 'Replay network graph timeline hops',
              parameters: {
                type: 'OBJECT',
                properties: {
                  caseId: { type: 'STRING', description: 'Case ID' },
                  typology: { type: 'STRING', description: 'Typology code' }
                },
                required: ['caseId']
              }
            },
            {
              name: 'run_auto_triage',
              description: 'Open AI Auto-Triage verification modal to batch clear benign false-positives',
              parameters: {
                type: 'OBJECT',
                properties: { casesToClear: { type: 'NUMBER', description: 'Number of candidate cases' } }
              }
            }
          ]
        }
      ];

      // Build context incorporating real features of the active selected case
      let caseContext = '';
      if (selectedCase) {
        const featStr = JSON.stringify(selectedCase.features || {});
        caseContext = `
ACTIVE CASE TELEMETRY & ATTRIBUTIONS:
- Case ID: #${selectedCase.id}
- Unified Risk Score: ${selectedCase.riskScore}/100
- Typology: ${selectedCase.typologyLabel || selectedCase.typology}
- Amount: $${Number(selectedCase.amount || 0).toLocaleString()} USD
- Corridor: ${selectedCase.fromCity || 'Origin'} ➔ ${selectedCase.toCity || 'Destination'}
- Anomaly Attributions & SHAP Features: ${featStr}
- Ranked Reason: ${selectedCase.whyRanked || 'Model confidence trigger'}
- Recommended Action: ${selectedCase.suggestedAction || 'Review'}`;
      }

      // Build conversation contents
      const contents = [];
      const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
      for (const h of recentHistory) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: `${message}${caseContext ? `\n\n[System Context: ${caseContext}]` : ''}` }]
      });

      const systemInstruction = `You are Risky, an expert autonomous AML compliance copilot for Monetrax.
You assist BSA/AML compliance officers in monitoring high-risk transaction streams, explaining model attributions, and taking immediate investigation actions.
When discussing cases, strictly reference the active case's real feature metrics (structuring score, velocity z-score, flow imbalance, amount).
When the user requests an action (such as opening a case, flying to a corridor/globe location, drafting a SAR, screening an entity, replaying network hops, or running auto-triage), invoke the appropriate function call tool. Keep responses concise, analytical, and professional.`;

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.25,
          tools
        }
      });

      const candidate = response.candidates?.[0];
      let toolCall = null;
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.functionCall) {
            toolCall = {
              name: part.functionCall.name,
              arguments: part.functionCall.args || {}
            };
            break;
          }
        }
      }

      const replyText = response.text || (toolCall ? `Executing ${toolCall.name.replace(/_/g, ' ')}...` : "Analysis completed.");

      return res.status(200).json({
        text: replyText,
        toolCall,
        sources: [`${model} (Live Reasoning)`, 'Monetrax Feature Attribution'],
        source: 'gemini'
      });
    } catch (err) {
      console.warn('Gemini live call in risky serverless function failed, using template fallback:', err.message);
      fallbackReason = err.message || 'Gemini API call rejected or timed out';
    }
  }

  // Deterministic local fallback
  const fallbackReply = generateFallbackRiskyReply(message, screen, selectedCase, history);
  return res.status(200).json({
    ...fallbackReply,
    source: 'fallback',
    fallbackReason: fallbackReason || 'Gemini API key not configured or call failed'
  });
}
