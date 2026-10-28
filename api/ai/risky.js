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

      // Build context incorporating real features of the active selected case (only essential fields)
      let caseContext = '';
      if (selectedCase) {
        const caseId = selectedCase.id || 'N/A';
        const score = selectedCase.score ?? selectedCase.riskScore ?? 'N/A';
        const typology = selectedCase.typology || selectedCase.typologyLabel || 'Unknown';
        const amount = selectedCase.amount ? `$${Number(selectedCase.amount).toLocaleString()} USD` : 'N/A';
        const corridor = selectedCase.corridor || (selectedCase.fromCity ? `${selectedCase.fromCity} ➔ ${selectedCase.toCity}` : 'N/A');
        
        let drivers = 'Elevated risk indicators';
        if (Array.isArray(selectedCase.topDrivers) && selectedCase.topDrivers.length > 0) {
          drivers = selectedCase.topDrivers.slice(0, 3).join(', ');
        } else if (Array.isArray(selectedCase.factors) && selectedCase.factors.length > 0) {
          drivers = selectedCase.factors.slice(0, 3).map(f => f.label || f.name || String(f)).join(', ');
        } else if (selectedCase.features && typeof selectedCase.features === 'object') {
          drivers = Object.entries(selectedCase.features).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ');
        }

        caseContext = `
ACTIVE CASE:
- Case ID: #${caseId}
- Unified Risk Score: ${score}/100
- Typology: ${typology}
- Amount: ${amount}
- Corridor: ${corridor}
- Top 3 Drivers: ${drivers}`;
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

      const systemInstruction = `You are Risky, an AML copilot. Answer in at most 60 words, or at most 4 short bullet points. Lead with the direct answer. Do not repeat the case summary or list every feature value unless asked. End with one short suggested next action. Never use markdown symbols such as ** or ###.
When the user explicitly requests an action (such as opening a case, flying to a corridor/globe location, drafting a SAR, screening an entity, replaying network hops, or running auto-triage), invoke the appropriate function call tool. Otherwise, provide direct analytical answers without calling tools.`;

      // Candidate models for graceful fallback if primary model hits quota/rate-limit
      const candidateModels = [model, 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].filter((m, i, arr) => arr.indexOf(m) === i);
      let response = null;
      let usedModel = model;

      for (const m of candidateModels) {
        try {
          const config = {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 350,
            tools
          };
          if (!m.includes('lite')) {
            config.thinkingConfig = { thinkingBudget: 0 };
          }
          response = await ai.models.generateContent({
            model: m,
            contents,
            config
          });
          usedModel = m;
          break;
        } catch (mErr) {
          console.warn(`Gemini model ${m} failed:`, mErr.message);
          if (mErr.status === 429 || mErr.status === 404 || mErr.status === 503) {
            continue;
          }
          throw mErr;
        }
      }

      if (!response) {
        throw new Error('All Gemini candidate models failed');
      }

      const candidate = response.candidates?.[0];
      let toolCall = null;
      let replyText = '';
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            replyText += part.text;
          }
          if (part.functionCall) {
            toolCall = {
              name: part.functionCall.name,
              arguments: part.functionCall.args || {}
            };
          }
        }
      }

      if (!replyText.trim()) {
        replyText = response.text || (toolCall ? `Executing ${toolCall.name.replace(/_/g, ' ')}...` : "Analysis completed.");
      }

      // Sanitize text to remove raw markdown symbols (** or ###)
      replyText = replyText.replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').trim();

      return res.status(200).json({
        text: replyText,
        toolCall,
        sources: [`${usedModel} (Live Reasoning)`, 'Monetrax Feature Attribution'],
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
