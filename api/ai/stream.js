// api/ai/stream.js - POST /api/ai/stream (streaming SSE)
import { handleCors, getGeminiClient, parseBody, streamTextToResponse, generateFallbackNarrative } from '../_lib/helpers.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = await parseBody(req);
  const { type = 'case_narrative', data = {}, prompt } = body || {};

  const { ai, model } = await getGeminiClient();

  if (ai) {
    try {
      let systemInstruction = "You are Monetrax, an expert AML investigative AI. Generate an analytical, regulatory-grade investigation narrative for this transaction. Strictly ground your analysis in the provided numeric features (amount, corridor, typology score, z-score). Keep it to 2-4 sentences. Use objective compliance terminology ('indicators consistent with...', 'deviates by +X standard deviations').";
      let userPrompt = prompt || '';

      if (type === 'case_narrative') {
        const amt = data.amount ? `$${Number(data.amount).toLocaleString()}` : 'elevated amount';
        userPrompt = `Generate a concise 2-3 sentence regulatory AML investigation narrative for this transaction:
Case ID: ${data.id || 'TXN-94021'}
Typology: ${data.typologyLabel || data.typology || 'Structuring'}
Unified Risk Score: ${data.riskScore}/100
Features: ${JSON.stringify(data.features || {})}
Corridor: ${data.fromCity || 'Origin'} (${data.fromCountry || 'N/A'}) to ${data.toCity || 'Destination'} (${data.toCountry || 'N/A'})
Amount: ${amt}
Focus on why the feature values and corridor make this transaction suspicious.`;
      } else if (type === 'situation_brief') {
        userPrompt = `Generate a high-level 3-sentence AML Situation Brief for the current monitoring window:
Flagged cases: ${data.flaggedCount || 14}
Total volume: ${data.totalVolumeFormatted || '$4.8M'}
Structuring rings: ${data.structuringCount || 4}
Cycle rings: ${data.cycleCount || 2}
PR-AUC: 0.83. State what is happening right now in calm, professional investigator tone.`;
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.25
        }
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text, done: false })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
      return res.end();
    } catch (err) {
      console.warn('Gemini stream call failed in serverless function, falling back to deterministic template:', err.message);
    }
  }

  // Graceful deterministic fallback
  let generated = '';
  if (type === 'case_narrative') {
    generated = generateFallbackNarrative(data);
  } else if (type === 'situation_brief') {
    generated = `Surveillance network actively monitoring live ingestion at 1,420 tx/min. In the current surveillance window, ${data?.flaggedCount || 14} anomalies have been isolated, dominated by ${data?.structuringCount || 4} sub-$10k structuring clusters. The stacked meta-learner maintains high discriminative power with 0.83 PR-AUC.`;
  } else {
    generated = generateFallbackNarrative(data);
  }

  return streamTextToResponse(res, generated, 12);
}
