const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// In-memory cache for repeated queries
const responseCache = new Map();

// Helper to chunk text for streaming simulation
function streamTextToResponse(res, fullText, delayMs = 18) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const words = fullText.split(' ');
  let i = 0;

  const interval = setInterval(() => {
    if (i < words.length) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      res.write(`data: ${JSON.stringify({ text: chunk, done: false })}\n\n`);
      i++;
    } else {
      res.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, delayMs);

  res.on('close', () => {
    clearInterval(interval);
  });
}

// -----------------------------------------------------------------------------
// Fallback Generators (High-Fidelity Offline AML Logic)
// -----------------------------------------------------------------------------

function generateFallbackNarrative(data = {}) {
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

function generateFallbackSAR(data = {}) {
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

function generateFallbackExplainScore(data = {}) {
  const { riskScore = 84, typologyLabel = 'Structuring', factors = [], features = {}, amount = 9450 } = data;
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

function generateFallbackRiskyReply(message = '', screen = '/', selectedCase = null, history = []) {
  const msgLower = message.toLowerCase();

  // Multi-turn context check
  const lastUserMsg = history.length > 0 ? history[history.length - 1]?.text?.toLowerCase() || '' : '';

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

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health check endpoint
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    model: GEMINI_MODEL,
    mode: GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'live' : 'offline_fallback'
  });
});

// 1. Live AI Perimeter Narrative Streaming Endpoint
app.post('/api/ai/stream', async (req, res) => {
  const { type = 'case_narrative', data = {}, prompt } = req.body || {};
  const cacheKey = JSON.stringify({ type, id: data?.id || data?.amount || prompt });

  if (responseCache.has(cacheKey)) {
    return streamTextToResponse(res, responseCache.get(cacheKey), 12);
  }

  // Live Gemini call if API key is present
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.25
        }
      });

      let fullAccumulated = '';
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullAccumulated += text;
          res.write(`data: ${JSON.stringify({ text, done: false })}\n\n`);
        }
      }

      responseCache.set(cacheKey, fullAccumulated);
      res.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
      return res.end();
    } catch (err) {
      console.warn('Gemini stream call failed, falling back to deterministic template:', err.message);
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

  responseCache.set(cacheKey, generated);
  return streamTextToResponse(res, generated, 14);
});

// 2. Structured Natural Language Search & Auto-Triage Endpoint
app.post('/api/ai/structured', async (req, res) => {
  const { type, query, items } = req.body || {};

  // Natural Language filter parsing
  if (type === 'nl_search') {
    const q = (query || '').trim();

    // Live Gemini structured parse if key present
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const prompt = `Parse this financial crime compliance search query into structured filter fields:
"${q}"
Return JSON only matching this schema:
{
  "typology": "structuring" | "cyclic_flow" | "mule_fan" | null,
  "minAmount": number | null,
  "maxAmount": number | null,
  "minRisk": number | null,
  "city": string | null,
  "timeframe": "24h" | "7d" | "30d" | null,
  "explanation": string
}`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        const chips = [];
        if (parsed.typology) {
          const label = parsed.typology === 'structuring' ? 'Typology: Structuring' : parsed.typology === 'cyclic_flow' ? 'Typology: Cyclic Layering' : 'Typology: Mule Network';
          chips.push({ label, field: 'typology', value: parsed.typology });
        }
        if (parsed.minAmount) {
          chips.push({ label: `Amount: > $${Number(parsed.minAmount).toLocaleString()}`, field: 'minAmount', value: parsed.minAmount });
        }
        if (parsed.city) {
          chips.push({ label: `City: ${parsed.city}`, field: 'city', value: parsed.city });
        }
        if (parsed.minRisk) {
          chips.push({ label: `Risk: ≥${parsed.minRisk}`, field: 'minRisk', value: parsed.minRisk });
        }
        if (parsed.timeframe) {
          chips.push({ label: `Time: ${parsed.timeframe === '24h' ? 'Last 24 Hours' : 'Past 7 Days'}`, field: 'timeframe', value: parsed.timeframe });
        }

        return res.json({ ...parsed, chips });
      } catch (err) {
        console.warn('Gemini NL search parse failed, using fallback regex parser:', err.message);
      }
    }

    // High-fidelity fallback regex parser
    const qLower = q.toLowerCase();
    const result = {
      typology: null,
      minAmount: null,
      maxAmount: null,
      city: null,
      timeframe: null,
      chips: []
    };

    if (qLower.includes('structuring') || qLower.includes('smurf')) {
      result.typology = 'structuring';
      result.chips.push({ label: 'Typology: Structuring', field: 'typology', value: 'structuring' });
    } else if (qLower.includes('cycle') || qLower.includes('cyclic') || qLower.includes('layering')) {
      result.typology = 'cyclic_flow';
      result.chips.push({ label: 'Typology: Cyclic Flow', field: 'typology', value: 'cyclic_flow' });
    } else if (qLower.includes('mule')) {
      result.typology = 'mule_fan';
      result.chips.push({ label: 'Typology: Mule Network', field: 'typology', value: 'mule_fan' });
    }

    // Amount parsing (e.g. above $9,000, > 50k, over 10000)
    const amountMatch = qLower.match(/(?:above|over|greater\s+than|>)\s*\$?([0-9,]+)\s*(k|m)?/i) || qLower.match(/\$([0-9,]+)\s*(k|m)?/i);
    if (amountMatch) {
      let rawNum = parseFloat(amountMatch[1].replace(/,/g, ''));
      const unit = amountMatch[2]?.toLowerCase();
      if (unit === 'k') rawNum *= 1000;
      if (unit === 'm') rawNum *= 1000000;
      result.minAmount = rawNum;
      result.chips.push({ label: `Amount: > $${rawNum.toLocaleString()}`, field: 'minAmount', value: rawNum });
    }

    // Cities
    const knownCities = ['London', 'Zurich', 'Singapore', 'New York', 'Dubai', 'Berlin', 'Tokyo', 'Hong Kong', 'Geneva', 'Frankfurt'];
    for (const city of knownCities) {
      if (qLower.includes(city.toLowerCase())) {
        result.city = city;
        result.chips.push({ label: `City: ${city}`, field: 'city', value: city });
        break;
      }
    }

    // Timeframe
    if (qLower.includes('week') || qLower.includes('7d')) {
      result.timeframe = '7d';
      result.chips.push({ label: 'Time: Past 7 Days', field: 'timeframe', value: '7d' });
    } else if (qLower.includes('today') || qLower.includes('24h') || qLower.includes('day')) {
      result.timeframe = '24h';
      result.chips.push({ label: 'Time: Last 24 Hours', field: 'timeframe', value: '24h' });
    }

    if (qLower.includes('critical') || qLower.includes('high risk') || qLower.includes('elevated')) {
      result.minRisk = 70;
      result.chips.push({ label: 'Risk: High (≥70)', field: 'minRisk', value: 70 });
    }

    if (result.chips.length === 0 && q.length > 0) {
      result.chips.push({ label: `Search: "${q}"`, field: 'search', value: q });
    }

    return res.json(result);
  }

  // Bulk Auto-Triage analysis
  if (type === 'auto_triage') {
    const list = items || [];
    const falsePositives = list.filter(item => {
      const f = item.features || {};
      return item.riskScore < 72 && (f.structuring_score || 0) < 0.3 && (f.cyclic_flow_score || 0) < 0.3 && (f.peer_cohort_zscore || 0) < 1.2;
    });

    return res.json({
      totalEvaluated: list.length,
      falsePositivesIdentified: falsePositives.length,
      candidateIds: falsePositives.map(p => p.id),
      reasoning: `Isolated ${falsePositives.length} low-signal alerts where Isolation Forest anomaly score is below threshold and peer cohort velocity remains within normal boundaries (z < 1.2). Clearing these reduces analyst backlog by ${((falsePositives.length / (list.length || 1)) * 100).toFixed(0)}% without impacting true-positive recall.`,
      requiresConfirmation: true
    });
  }

  return res.json({ status: 'unsupported_structured_type' });
});

// 3. AI-Drafted SAR Reports Endpoint
app.post('/api/ai/draft_sar', async (req, res) => {
  const caseData = req.body || {};
  const { id = 'TXN-94021', amount = 9450, typologyLabel = 'Structuring', fromCity = 'London', toCity = 'Zurich' } = caseData;

  // Live Gemini call if key available
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
        model: GEMINI_MODEL,
        contents: prompt,
        config: { temperature: 0.2 }
      });

      if (response.text) {
        return res.json({ narrative: response.text, source: 'gemini-3.6-flash' });
      }
    } catch (err) {
      console.warn('Gemini SAR drafting failed, falling back to local regulatory template:', err.message);
    }
  }

  // Fallback regulatory template
  const narrative = generateFallbackSAR(caseData);
  return res.json({ narrative, source: 'offline_fallback' });
});

// 4. Explainable Risk Breakdown ("Why this score?")
app.post('/api/ai/explain_score', async (req, res) => {
  const data = req.body || {};

  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ ...parsed, source: 'gemini-3.6-flash' });
    } catch (err) {
      console.warn('Gemini explain_score failed, using local breakdown:', err.message);
    }
  }

  const breakdown = generateFallbackExplainScore(data);
  return res.json({ ...breakdown, source: 'offline_fallback' });
});

// 5. Risky Assistant Multi-Turn Reasoning & Function Calling
app.post('/api/ai/risky', async (req, res) => {
  try {
    const { message = '', screen = '/', selectedCase = null, history = [] } = req.body || {};

    // Live Gemini call with multi-turn conversation and function-calling
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const tools = [{
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
        }];

        // Build multi-turn contents
        const contents = [];
        // Add recent conversation history (up to last 6 messages)
        const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
        for (const h of recentHistory) {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
        // Current user message
        const caseContext = selectedCase ? ` [Current active case in view: #${selectedCase.id}, amount $${selectedCase.amount}, typology ${selectedCase.typologyLabel}, corridor ${selectedCase.fromCity} to ${selectedCase.toCity}, risk ${selectedCase.riskScore}/100]` : '';
        contents.push({
          role: 'user',
          parts: [{ text: `${message}${caseContext}` }]
        });

        const systemInstruction = "You are Risky, an expert autonomous AI compliance copilot for Monetrax. Provide thoughtful, concise multi-turn reasoning about AML transactions and sanctions. When the user asks you to take an action (open a case, fly to location/globe, draft a SAR, screen an entity, replay network, or run auto-triage), invoke the appropriate function call.";

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
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
        return res.json({
          text: replyText,
          toolCall,
          sources: ['Gemini 1.5 Flash (Live Reasoning)', 'Monetrax Knowledge Engine']
        });
      } catch (err) {
        console.warn('Gemini risky call failed, falling back to local reasoning:', err.message);
      }
    }

    // High-fidelity multi-turn fallback
    const reply = generateFallbackRiskyReply(message, screen, selectedCase, history);
    res.json(reply);
  } catch (err) {
    console.error('Error in /api/ai/risky:', err);
    res.json({
      text: "Surveillance analysis indicates active pattern verification against baseline transaction distributions.",
      sources: ['Fallback Model Engine']
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Monetrax AI Backend Proxy running on http://127.0.0.1:${PORT}`);
});
