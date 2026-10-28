// api/ai/health.js - GET /api/ai/health
import { handleCors, getGeminiConfig } from '../_lib/helpers.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { model, hasKey } = getGeminiConfig();

  return res.status(200).json({
    status: 'ok',
    hasKey,
    model,
    mode: hasKey ? 'live' : 'offline_fallback',
    runtime: 'vercel_serverless',
    timestamp: new Date().toISOString()
  });
}
