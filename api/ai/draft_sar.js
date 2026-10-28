// api/ai/draft_sar.js - POST /api/ai/draft_sar
import { handleCors, getGeminiClient, parseBody, generateFallbackSAR } from '../_lib/helpers.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const caseData = await parseBody(req);
  const { id = 'TXN-94021', amount = 9450, typologyLabel = 'Structuring', fromCity = 'London', toCity = 'Zurich' } = caseData || {};

  const { ai, model } = await getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are a Senior BSA/AML Compliance Officer drafting FinCEN Form 111 (Suspicious Activity Report).
Draft a formal, comprehensive 4-paragraph SAR narrative based on this case:
Case ID: #${id}
Amount: $${Number(amount).toLocaleString()} USD
Typology: ${typologyLabel}
Corridor: ${fromCity} to ${toCity}
Features: ${JSON.stringify(caseData.features || {})}
Risk Score: ${caseData.riskScore || 84}/100

Structure with 4 formal headers:
PART I: SUMMARY OF SUSPICIOUS ACTIVITY
PART II: TRANSACTION CHRONOLOGY & FINANCIAL PATTERNS
PART III: TYPOLOGY ANALYSIS & EVIDENCE OF ILLICIT INTENT
PART IV: INSTITUTIONAL ACTIONS TAKEN & LAW ENFORCEMENT RECOMMENDATION`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { temperature: 0.2 }
      });

      if (response.text) {
        return res.status(200).json({ narrative: response.text, source: 'gemini' });
      }
    } catch (err) {
      console.warn('Gemini SAR drafting failed, falling back to local template:', err.message);
    }
  }

  const narrative = generateFallbackSAR(caseData);
  return res.status(200).json({ narrative, source: 'fallback' });
}
