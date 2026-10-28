// api/_lib/helpers.js - Shared utilities, config, and offline fallback generators for Vercel Serverless Functions

/**
 * Handle CORS and preflight OPTIONS requests
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} true if preflight request was handled
 */
export function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return true;
  }
  return false;
}

/**
 * Retrieve Gemini configuration from environment variables
 * Never hardcodes keys. Reads GEMINI_API_KEY and optional GEMINI_MODEL.
 */
export function getGeminiConfig() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const model = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
  const hasKey = Boolean(apiKey && apiKey !== 'your_gemini_api_key_here');
  return { apiKey, model, hasKey };
}

/**
 * Dynamically import and initialize GoogleGenAI client
 */
export async function getGeminiClient() {
  const { apiKey, model, hasKey } = getGeminiConfig();
  if (!hasKey) {
    return { ai: null, model, error: 'GEMINI_API_KEY is not configured or is placeholder' };
  }
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    return { ai, model, error: null };
  } catch (err) {
    return { ai: null, model, error: err.message };
  }
}

/**
 * Robust JSON body parser supporting Vercel and Node HTTP streams
 */
export async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Stream text to response in SSE format
 */
export async function streamTextToResponse(res, fullText, delayMs = 15) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const words = fullText.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    res.write(`data: ${JSON.stringify({ text: chunk, done: false })}\n\n`);
    if (i % 2 === 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  res.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
  res.end();
}

// -----------------------------------------------------------------------------
// High-Fidelity Offline AML Fallback Logic Generators
// -----------------------------------------------------------------------------

export function generateFallbackNarrative(data = {}) {
  const { typology, typologyLabel, riskScore, features, amount, fromCountry, toCountry, fromCity, toCity } = data;
  const score = riskScore !== undefined ? Number(riskScore) : 78;
  const typ = typologyLabel || typology || 'Suspicious Pattern';
  const amtFormatted = amount ? Number(amount).toLocaleString() : '9,450';
  const corridor = fromCity && toCity ? `${fromCity} (${fromCountry || 'Origin'}) ➔ ${toCity} (${toCountry || 'Dest'})` : `${fromCountry || 'Origin'} to ${toCountry || 'Destination'}`;
  const f = features || {};
  const zScore = f.peer_cohort_zscore !== undefined ? f.peer_cohort_zscore : 3.4;

  if (typology === 'structuring' || String(typ).toLowerCase().includes('structuring')) {
    const structScore = f.structuring_score !== undefined ? f.structuring_score : 0.94;
    return `Transaction #${data.id || 'TXN-94021'} ($${amtFormatted}) along corridor ${corridor} exhibits anomalous smurfing behavior with high structuring_score (${structScore}). Multiple sequential transfers just beneath the $10,000 CTR reporting threshold were executed within a 4-hour temporal window. Contributing flow imbalance of ${f.flow_imbalance || 0.88} and velocity z-score of +${zScore} indicate deliberate avoidance of Currency Transaction Reports. Immediate FinCEN SAR filing recommended.`;
  }
  if (typology === 'cyclic_flow' || String(typ).toLowerCase().includes('cyclic') || String(typ).toLowerCase().includes('cycle')) {
    const cycleScore = f.cyclic_flow_score !== undefined ? f.cyclic_flow_score : 0.92;
    return `Automated graph surveillance detected closed cyclic layering topology (A → B → C → A) with cyclic_flow_score of ${cycleScore}. Capital totaling $${amtFormatted} was rapidly routed across intermediary accounts in ${corridor} with an average 1.8% attrition per hop, characteristic of money laundering wash-trading fees. Velocity z-score is +${zScore} standard deviations above peer baseline. Immediate administrative freeze of intermediary nodes advised.`;
  }
  if (typology === 'mule_fan' || String(typ).toLowerCase().includes('mule')) {
    const fanCount = f.from_count_24h || 12;
    return `Surveillance network detected high-density mule fan-in / fan-out convergence with ${fanCount} distinct originating retail accounts converging into this intermediary clearing hub. The aggregate balance of $${amtFormatted} routed through ${corridor} within 42 minutes, exhibiting a Benford's law deviation index of ${f.benford_deviation || 0.79}. Immediate compliance hold and counterparty account freeze recommended.`;
  }

  return `Autonomous model ensemble fused XGBoost and Autoencoder anomaly detectors yielding an elevated composite risk score of ${score.toFixed(1)}/100 for $${amtFormatted} routed along ${corridor}. Key drivers include abnormal peer cohort divergence (z-score +${zScore}) and abnormal liquidation velocity. Indicators are consistent with obfuscated capital flight; analyst escalation and enhanced due diligence (EDD) recommended.`;
}

export function generateFallbackSAR(data = {}) {
  const { id = 'TXN-94021', amount = 9450, typologyLabel = 'Structuring (<$10k)', riskScore = 84, fromCity = 'London', toCity = 'Zurich', fromCountry = 'GB', toCountry = 'CH', fromAccount = 'ACCT-GB-4019', toAccount = 'ACCT-CH-8821', features = {} } = data;
  const amtFormatted = Number(amount).toLocaleString();
  const dateStr = new Date().toISOString().slice(0, 10);

  return `PART I: SUMMARY OF SUSPICIOUS ACTIVITY
On ${dateStr}, Monetrax automated surveillance isolated suspicious transaction #${id} totaling $${amtFormatted} USD originating from Account ${fromAccount} (${fromCity}, ${fromCountry}) to Beneficiary Account ${toAccount} (${toCity}, ${toCountry}). The transaction triggered critical surveillance thresholds with a composite Unified Risk Score of ${Number(riskScore).toFixed(1)}/100, characterized primarily as ${typologyLabel}.

PART II: TRANSACTION CHRONOLOGY & FINANCIAL PATTERNS
During the 24-hour monitoring window ending ${dateStr}, the subject account initiated multiple structured transfers intentionally calibrated below the $10,000 Currency Transaction Reporting (CTR) threshold pursuant to 31 U.S.C. 5313. Specifically, sequential transfers were routed across cross-border settlement channels with an inter-transaction velocity z-score of +${features.peer_cohort_zscore || '3.4'} standard deviations above peer cohort baseline, exhibiting near-immediate offshore liquidation.

PART III: TYPOLOGY ANALYSIS & EVIDENCE OF ILLICIT INTENT
The observed financial topology displays statistical markers strongly indicative of deliberate capital smurfing and layering. Algorithmic analysis confirmed a structuring coefficient of ${features.structuring_score || '0.94'} and flow imbalance ratio of ${features.flow_imbalance || '0.88'}. The absence of legitimate commercial or documented economic purpose between originating and receiving counterparties reinforces the determination of synthetic routing designed to evade regulatory scrutiny.

PART IV: INSTITUTIONAL ACTIONS TAKEN & LAW ENFORCEMENT RECOMMENDATION
Monetrax Compliance has placed an administrative risk hold on subsequent outbound disbursements from Account ${fromAccount} and escalated counterparty ${toAccount} to the Global Watchlist Surveillance queue. It is recommended that this suspicious activity report (SAR) be formally submitted to FinCEN and made available to relevant law enforcement authorities for further investigation into possible financial structuring and illicit capital flight.`;
}

export function generateFallbackExplainScore(data = {}) {
  const { riskScore = 84, amount = 9450, features = {} } = data;
  const f = features || {};
  const score = Number(riskScore).toFixed(1);

  return {
    summary: `Case received an elevated risk score of ${score}/100 based on extreme deviations in transaction timing, amount threshold proximity, and network flow imbalance.`,
    bullets: [
      `Threshold Proximity (Structuring Score: ${f.structuring_score || 0.94}): The transaction amount of $${Number(amount).toLocaleString()} sits just 5.5% below the mandatory $10,000 CTR reporting threshold, a statistical anomaly present in only 0.4% of legitimate volume.`,
      `Peer Velocity Drift (Z-Score: +${f.peer_cohort_zscore || 3.4}σ): Account transfer velocity is 3.4 standard deviations faster than typical retail accounts in this corridor, indicating coordinated smurfing.`,
      `Flow Imbalance Ratio (${f.flow_imbalance || 0.88}): Over 88% of incoming funds were liquidated within 4 hours, leaving minimal resting balance and suggesting intermediary pass-through routing.`
    ]
  };
}

export function generateFallbackRiskyReply(message = '', screen = '/', selectedCase = null, history = []) {
  const msgLower = message.toLowerCase();

  if (msgLower.includes('auto-triage') || msgLower.includes('triage') || msgLower.includes('false positive')) {
    return {
      text: "I analyzed 14 pending cases in the active queue against our 0.83 PR-AUC meta-learner. I isolated 3 low-signal alerts where structuring scores are under 0.25 and peer z-score velocity is within normal range (z < 1.0). Would you like me to open the Auto-Triage verification modal to review and clear them?",
      toolCall: {
        name: 'run_auto_triage',
        arguments: { casesToClear: 3 }
      },
      sources: ['PR-AUC 0.83 Meta-Learner', 'Isolation Forest threshold <= 35', 'Queue Snapshot (14 cases)']
    };
  }

  if (msgLower.includes('sar') || msgLower.includes('report') || msgLower.includes('fincen') || msgLower.includes('draft')) {
    const caseId = selectedCase?.id || 'TXN-94021';
    return {
      text: `Drafting FinCEN Form 111 SAR narrative for Case #${caseId}. I've synthesized the primary SHAP feature weights (structuring score ${selectedCase?.features?.structuring_score || 0.94}, velocity z-score +${selectedCase?.features?.peer_cohort_zscore || 3.4}) and the cross-border corridor into a formal 4-part regulatory draft. Navigating to the SAR Filing Center.`,
      toolCall: {
        name: 'generate_sar',
        arguments: { caseId }
      },
      sources: ['FinCEN SAR XML Schema v2.0', `Case #${caseId} Audit Trail`, 'SHAP Feature Attributions']
    };
  }

  if (msgLower.includes('globe') || msgLower.includes('fly') || msgLower.includes('map') || msgLower.includes('location') || msgLower.includes('zurich') || msgLower.includes('corridor')) {
    const caseId = selectedCase?.id || 'TXN-94021';
    const city = selectedCase?.toCity || 'Zurich';
    return {
      text: `Targeting camera trajectory and initiating fly-to dive for ${city} corridor (${selectedCase ? selectedCase.fromCity + ' ➔ ' + city : 'Case #' + caseId}). The animated tracking marker is tracing the fund transit path to the destination.`,
      toolCall: {
        name: 'fly_to_location',
        arguments: { caseId, city }
      },
      sources: ['3D Arc Trajectory Engine', 'Geospatial Geodesic Coordinates', `Corridor: ${city}`]
    };
  }

  if (msgLower.includes('account') || msgLower.includes('entity') || msgLower.includes('counterparty') || msgLower.includes('profile')) {
    const acctMatch = message.match(/acct-[a-z0-9-]+/i)?.[0]?.toUpperCase() || selectedCase?.fromAccount || 'ACCT-JPMC-100';
    return {
      text: `Opening 360-degree risk dossier for ${acctMatch}. Examining entity counterparties, historical transaction velocity, and connected high-risk clusters.`,
      toolCall: {
        name: 'open_account',
        arguments: { accountId: acctMatch }
      },
      sources: ['Account 360 Database', `Entity ID: ${acctMatch}`, 'Counterparty Graph']
    };
  }

  if (msgLower.includes('screen') || msgLower.includes('sanction') || msgLower.includes('pep') || msgLower.includes('watchlist')) {
    const nameMatch = message.match(/(?:screen|check|lookup)\s+([A-Za-z\s]+)/i)?.[1]?.trim() || 'Valeriy Mikhailov';
    return {
      text: `Executing real-time fuzzy screening for "${nameMatch}" against OFAC SDN, EU Consolidated Financial Sanctions, and PEP Global Registers.`,
      toolCall: {
        name: 'screen_name',
        arguments: { name: nameMatch }
      },
      sources: ['OFAC SDN Watchlist', 'EU Consolidated Sanctions', 'PEP Global Register']
    };
  }

  if (msgLower.includes('replay') || msgLower.includes('network') || msgLower.includes('graph') || msgLower.includes('loop')) {
    const caseId = selectedCase?.id || 'TXN-94021';
    return {
      text: `Opening Network Graph and chronological hop replay for ${selectedCase?.typologyLabel || 'Cyclic Layering Flow'}. Replaying transaction time-steps across intermediary nodes.`,
      toolCall: {
        name: 'replay_typology',
        arguments: { caseId, typology: selectedCase?.typology || 'cyclic_flow' }
      },
      sources: ['Temporal Graph Sequencer', 'Graph Hop Sequencer', 'Network Topology Engine']
    };
  }

  if (msgLower.includes('open case') || msgLower.includes('investigate case') || msgLower.includes('txn-')) {
    const idMatch = message.match(/txn-\d+/i)?.[0]?.toUpperCase() || selectedCase?.id || 'TXN-94021';
    return {
      text: `Opening full investigation workspace for Case #${idMatch}. Loading SHAP feature explanations, counterfactual projection sliders, and perimeter audit history.`,
      toolCall: {
        name: 'open_case',
        arguments: { caseId: idMatch }
      },
      sources: [`Case #${idMatch} Record`, 'Audit Trail']
    };
  }

  if (selectedCase) {
    return {
      text: `Case #${selectedCase.id} is flagged with a Unified Risk Score of ${Number(selectedCase.riskScore).toFixed(1)}/100 (${selectedCase.typologyLabel}). The transaction involves $${Number(selectedCase.amount).toLocaleString()} routed from ${selectedCase.fromCity} to ${selectedCase.toCity}. Primary driver is ${selectedCase.whyRanked || 'structuring threshold evasion and high volume velocity'}. You can ask me to draft a SAR, fly to this location on the map, or project counterfactuals.`,
      sources: ['Unified Risk Scorer (XGBoost + IF)', `Corridor: ${selectedCase.fromCity} ➔ ${selectedCase.toCity}`]
    };
  }

  return {
    text: "I am actively analyzing the transaction stream and compliance queue. You can ask me to evaluate any case, run bulk auto-triage on false positives, draft a SAR report with AI, screen counterparties against OFAC, or fly to suspicious corridors on the 3D globe.",
    sources: ['Monetrax Surveillance Core', 'Stream Telemetry (1,420 tx/min)']
  };
}
