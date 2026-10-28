// api/ai/explain_score.js - POST /api/ai/explain_score
import { handleCors, getGeminiClient, parseBody, generateFallbackExplainScore } from '../_lib/helpers.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const data = await parseBody(req);
  const { ai, model } = await getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are an Explainable AI (XAI) financial crime specialist. Explain why this transaction received a risk score of ${data.riskScore}/100 in plain English for a compliance analyst.
Convert the following SHAP feature importance values into a concise 1-sentence summary and 3 clear, jargon-free bullet points:
Features: ${JSON.stringify(data.factors || data.features || {})}
Typology: ${data.typologyLabel || data.typology}
Amount: $${data.amount}
Corridor: ${data.fromCity} to ${data.toCity}

Return JSON matching:
{
  "summary": string,
  "bullets": [string, string, string]
}`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.status(200).json({ ...parsed, source: 'gemini' });
    } catch (err) {
      console.warn('Gemini explain_score failed, using local breakdown:', err.message);
    }
  }

  const breakdown = generateFallbackExplainScore(data);
  return res.status(200).json({ ...breakdown, source: 'fallback' });
}
