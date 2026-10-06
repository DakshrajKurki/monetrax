import { 
  Transaction, 
  TypologyType, 
  AISuggestedAction, 
  CaseStatus, 
  SHAPFactor, 
  SHAPFeatureMap,
  Account,
  Bank,
  CountryGeo,
  PaymentFormat,
  SanctionsEntry,
  SARDraft
} from '../types';

// ============================================================================
// 12 BANKS ACROSS GLOBAL FINANCIAL HUBS
// ============================================================================
export const GLOBAL_BANKS: Bank[] = [
  { id: 'BANK-AEGIS', name: 'Aegis Sovereign Bancorp', swift: 'AEGSUS33', country: 'United States', cohort: 'Tier-1 Global', alertVolume: 412, fprRate: 0.14 },
  { id: 'BANK-APEX', name: 'Apex Horizon Trust', swift: 'APEXGB41', country: 'United Kingdom', cohort: 'Tier-1 Global', alertVolume: 388, fprRate: 0.16 },
  { id: 'BANK-MERID', name: 'Meridian International Bank', swift: 'MRDSSGSG', country: 'Singapore', cohort: 'Tier-1 Global', alertVolume: 295, fprRate: 0.11 },
  { id: 'BANK-CREST', name: 'Crestview Capital Bank', swift: 'CRSTCHZH', country: 'Switzerland', cohort: 'Offshore Private', alertVolume: 260, fprRate: 0.13 },
  { id: 'BANK-VANG', name: 'Vanguard Reserve Bank', swift: 'VNGBGB22', country: 'United Kingdom', cohort: 'Tier-1 Global', alertVolume: 230, fprRate: 0.18 },
  { id: 'BANK-SOLAR', name: 'Solaria Merchant Trust', swift: 'SLRAFR25', country: 'France', cohort: 'Tier-1 Global', alertVolume: 215, fprRate: 0.15 },
  { id: 'BANK-HELIO', name: 'Helios Commercial Bank', swift: 'HLOSDEDD', country: 'Germany', cohort: 'Tier-1 Global', alertVolume: 248, fprRate: 0.17 },
  { id: 'BANK-NOVUS', name: 'Novus Financial Bancorp', swift: 'NOVSUS33', country: 'United States', cohort: 'Tier-1 Global', alertVolume: 340, fprRate: 0.14 },
  { id: 'BANK-ZENITH', name: 'Zenith Private Bank', swift: 'ZNTHGB2L', country: 'United Kingdom', cohort: 'Tier-2 Regional', alertVolume: 195, fprRate: 0.19 },
  { id: 'BANK-ORION', name: 'Orion Custody Bank', swift: 'ORINESMM', country: 'Spain', cohort: 'Tier-2 Regional', alertVolume: 180, fprRate: 0.15 },
  { id: 'BANK-BAVAR', name: 'Bavaria Credit Union', swift: 'BAVRJPJT', country: 'Japan', cohort: 'Tier-1 Global', alertVolume: 165, fprRate: 0.10 },
  { id: 'BANK-PACIF', name: 'Pacific Rim Bancorp', swift: 'PCFNL2A', country: 'Netherlands', cohort: 'Fintech/Neobank', alertVolume: 210, fprRate: 0.20 }
];

// ============================================================================
// 25 COUNTRIES (Simulated Surveillance Geography)
// ============================================================================
export const COUNTRIES: CountryGeo[] = [
  { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129, flaggedCount: 48, totalVolume: 18450000, riskLevel: 'Low' },
  { code: 'UK', name: 'United Kingdom', lat: 55.3781, lng: -3.4360, flaggedCount: 36, totalVolume: 14200000, riskLevel: 'Low' },
  { code: 'CH', name: 'Switzerland', lat: 46.8182, lng: 8.2275, flaggedCount: 22, totalVolume: 9800000, riskLevel: 'Medium' },
  { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515, flaggedCount: 19, totalVolume: 8750000, riskLevel: 'Low' },
  { code: 'SG', name: 'Singapore', lat: 1.3521, lng: 103.8198, flaggedCount: 28, totalVolume: 11200000, riskLevel: 'Low' },
  { code: 'CY', name: 'Cyprus', lat: 35.1264, lng: 33.4299, flaggedCount: 24, totalVolume: 6400000, riskLevel: 'High' },
  { code: 'AE', name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478, flaggedCount: 31, totalVolume: 12900000, riskLevel: 'High' },
  { code: 'NL', name: 'Netherlands', lat: 52.1326, lng: 5.2913, flaggedCount: 16, totalVolume: 7100000, riskLevel: 'Low' },
  { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468, flaggedCount: 14, totalVolume: 6200000, riskLevel: 'Low' },
  { code: 'KY', name: 'Cayman Islands', lat: 19.3133, lng: -81.2546, flaggedCount: 20, totalVolume: 8900000, riskLevel: 'High' },
  { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529, flaggedCount: 12, totalVolume: 9400000, riskLevel: 'Low' },
  { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751, flaggedCount: 15, totalVolume: 5800000, riskLevel: 'Low' },
  { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137, flaggedCount: 17, totalVolume: 7600000, riskLevel: 'Low' },
  { code: 'HK', name: 'Hong Kong', lat: 22.3193, lng: 114.1694, flaggedCount: 27, totalVolume: 10800000, riskLevel: 'Medium' },
  { code: 'BR', name: 'Brazil', lat: -14.2350, lng: -51.9253, flaggedCount: 11, totalVolume: 4300000, riskLevel: 'Medium' },
  { code: 'ZA', name: 'South Africa', lat: -30.5595, lng: 22.9375, flaggedCount: 9, totalVolume: 3200000, riskLevel: 'Medium' },
  { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629, flaggedCount: 18, totalVolume: 6100000, riskLevel: 'Medium' },
  { code: 'PA', name: 'Panama', lat: 8.5379, lng: -80.7821, flaggedCount: 23, totalVolume: 7500000, riskLevel: 'High' },
  { code: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528, flaggedCount: 14, totalVolume: 4900000, riskLevel: 'Medium' },
  { code: 'ES', name: 'Spain', lat: 40.4637, lng: -3.7492, flaggedCount: 13, totalVolume: 5100000, riskLevel: 'Low' },
  { code: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674, flaggedCount: 12, totalVolume: 5400000, riskLevel: 'Low' },
  { code: 'SE', name: 'Sweden', lat: 60.1282, lng: 18.6435, flaggedCount: 8, totalVolume: 3900000, riskLevel: 'Low' },
  { code: 'KR', name: 'South Korea', lat: 35.9078, lng: 127.7669, flaggedCount: 10, totalVolume: 5200000, riskLevel: 'Low' },
  { code: 'SA', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, flaggedCount: 15, totalVolume: 6800000, riskLevel: 'Medium' },
  { code: 'NG', name: 'Nigeria', lat: 9.0820, lng: 8.6753, flaggedCount: 16, totalVolume: 3400000, riskLevel: 'High' }
];

export const MAJOR_CORRIDORS = [
  { fromCountry: 'United States', fromCountryCode: 'US', fromCity: 'New York', fromLat: 40.7128, fromLng: -74.0060, toCountry: 'United Kingdom', toCountryCode: 'UK', toCity: 'London', toLat: 51.5074, toLng: -0.1278 },
  { fromCountry: 'United Kingdom', fromCountryCode: 'UK', fromCity: 'London', fromLat: 51.5074, fromLng: -0.1278, toCountry: 'Switzerland', toCountryCode: 'CH', toCity: 'Zurich', toLat: 47.3769, toLng: 8.5417 },
  { fromCountry: 'Germany', fromCountryCode: 'DE', fromCity: 'Frankfurt', fromLat: 50.1109, fromLng: 8.6821, toCountry: 'Singapore', toCountryCode: 'SG', toCity: 'Singapore', toLat: 1.3521, toLng: 103.8198 },
  { fromCountry: 'United States', fromCountryCode: 'US', fromCity: 'Miami', fromLat: 25.7617, fromLng: -80.1918, toCountry: 'Panama', toCountryCode: 'PA', toCity: 'Panama City', toLat: 8.9824, toLng: -79.5199 },
  { fromCountry: 'United Arab Emirates', fromCountryCode: 'AE', fromCity: 'Dubai', fromLat: 25.2048, fromLng: 55.2708, toCountry: 'Cyprus', toCountryCode: 'CY', toCity: 'Limassol', toLat: 34.6786, toLng: 33.0413 },
  { fromCountry: 'Singapore', fromCountryCode: 'SG', fromCity: 'Singapore', fromLat: 1.3521, fromLng: 103.8198, toCountry: 'Hong Kong', toCountryCode: 'HK', toCity: 'Hong Kong', toLat: 22.3193, toLng: 114.1694 },
  { fromCountry: 'Netherlands', fromCountryCode: 'NL', fromCity: 'Amsterdam', fromLat: 52.3676, fromLng: 4.9041, toCountry: 'Luxembourg', toCountryCode: 'LU', toCity: 'Luxembourg', toLat: 49.8153, toLng: 6.1296 },
  { fromCountry: 'Canada', fromCountryCode: 'CA', fromCity: 'Toronto', fromLat: 43.6532, fromLng: -79.3832, toCountry: 'Cayman Islands', toCountryCode: 'KY', toCity: 'George Town', toLat: 19.2869, toLng: -81.3674 },
  { fromCountry: 'Japan', fromCountryCode: 'JP', fromCity: 'Tokyo', fromLat: 35.6762, fromLng: 139.6503, toCountry: 'United States', toCountryCode: 'US', toCity: 'San Francisco', toLat: 37.7749, toLng: -122.4194 },
  { fromCountry: 'Australia', fromCountryCode: 'AU', fromCity: 'Sydney', fromLat: -33.8688, fromLng: 151.2093, toCountry: 'Singapore', toCountryCode: 'SG', toCity: 'Singapore', toLat: 1.3521, toLng: 103.8198 },
  { fromCountry: 'France', fromCountryCode: 'FR', fromCity: 'Paris', fromLat: 48.8566, fromLng: 2.3522, toCountry: 'United Arab Emirates', toCountryCode: 'AE', toCity: 'Dubai', toLat: 25.2048, toLng: 55.2708 },
  { fromCountry: 'Nigeria', fromCountryCode: 'NG', fromCity: 'Lagos', fromLat: 6.5244, fromLng: 3.3792, toCountry: 'United Kingdom', toCountryCode: 'UK', toCity: 'London', toLat: 51.5074, toLng: -0.1278 }
];

export const PAYMENT_FORMATS: PaymentFormat[] = ['ACH', 'Wire', 'Cheque', 'Crypto', 'Cash', 'Credit Card'];
export const COMPLIANCE_ANALYSTS = ['Elena Vance', 'Marcus Chen', 'Sarah Jenkins', 'Alex Rivera', 'Unassigned'];

// ============================================================================
// REAL SHAP FACTOR ENGINE
// ============================================================================
export function computeSHAPFactors(features: SHAPFeatureMap, riskScore: number): SHAPFactor[] {
  return [
    {
      feature: 'structuring_score',
      label: 'Structuring Proximity (< $10k)',
      value: features.structuring_score,
      contribution: +(features.structuring_score * 38.2).toFixed(1),
      description: 'Clustering of transfers immediately below CTR reporting threshold'
    },
    {
      feature: 'cyclic_flow_score',
      label: 'Graph Cycle Coefficient (A-B-C-A)',
      value: features.cyclic_flow_score,
      contribution: +(features.cyclic_flow_score * 32.5).toFixed(1),
      description: 'Degree of closed-loop fund recirculation across intermediary accounts'
    },
    {
      feature: 'peer_cohort_zscore',
      label: 'Peer Velocity Divergence (z-score)',
      value: features.peer_cohort_zscore,
      contribution: +(features.peer_cohort_zscore * 8.5).toFixed(1),
      description: 'Deviation in transaction velocity relative to industry/entity peer cohort'
    },
    {
      feature: 'from_count_24h',
      label: 'Unique Senders in 24h Window',
      value: features.from_count_24h,
      contribution: +(Math.min(features.from_count_24h * 1.5, 20)).toFixed(1),
      description: 'Number of counterparty accounts funneling funds to this node'
    },
    {
      feature: 'benford_deviation',
      label: "Benford's Law First-Digit Skew",
      value: features.benford_deviation,
      contribution: +(features.benford_deviation * 18.0).toFixed(1),
      description: 'Statistical departure from expected logarithmic leading-digit distribution'
    },
    {
      feature: 'flow_imbalance',
      label: 'Net Flow Imbalance Ratio',
      value: features.flow_imbalance,
      contribution: +(features.flow_imbalance * 14.0).toFixed(1),
      description: 'Asymmetry between incoming settlement volume and rapid outgoing liquidation'
    },
    {
      feature: 'log_amount',
      label: 'Logarithmic Notional Magnitude',
      value: features.log_amount,
      contribution: +((features.log_amount - 8.2) * 2.5).toFixed(1),
      description: 'Base-e magnitude of the transfer relative to portfolio mean'
    }
  ].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export function generatePeerCohort(subjectAccount: string, subjectVolume: number, subjectVelocity: number) {
  const points = [];
  const baseVol = subjectVolume * 0.45;
  const baseVel = Math.max(2, subjectVelocity * 0.35);

  for (let i = 0; i < 22; i++) {
    const volJitter = baseVol * (0.6 + (i * 17 % 100) / 80);
    const velJitter = baseVel * (0.5 + (i * 23 % 100) / 90);
    points.push({
      accountId: `ACCT-${1000 + i * 47}`,
      volume: Math.round(volJitter),
      velocity: +(velJitter.toFixed(1)),
      isSubject: false
    });
  }

  points.push({
    accountId: subjectAccount,
    volume: subjectVolume,
    velocity: subjectVelocity,
    isSubject: true
  });

  return {
    cohortName: 'Global Commercial & Treasury Tier-2',
    points,
    subjectVolume,
    subjectVelocity
  };
}

// ============================================================================
// ~80 ACCOUNTS WITH 360 PROFILES
// ============================================================================
export function generateAccounts(): Account[] {
  const accounts: Account[] = [];
  const entityTypes: Account['accountType'][] = ['Commercial', 'Corporate', 'Retail', 'Correspondent', 'Private Wealth'];
  
  // 84 unique fictional entity names — strictly zero repeats across accounts
  const entities = [
    'Apex Logistics LLC', 'Helios Energy Trading', 'Novus Import Export AG', 'Bluecrest Treasury Corp',
    'Meridian Maritime BV', 'Zenith Global Asset Mgt', 'Vanguard Holding SA', 'Solaria Solar Holdings',
    'Aethelgard Consulting', 'Orion Shipping Cyprus', 'Oasis Precious Metals DMCC', 'Vesper Technology Ltd',
    'Pacific Rim Wholesale', 'Bavaria Machinery GMBH', 'Crestview Capital Sarl', 'Titanium Global Corp',
    'Kestrel Maritime Logistics', 'Atlas Commodity Syndicate', 'Sovereign Frontier Ventures', 'Cobalt Dynamics SA',
    'Borealis Petrochemical', 'Valence BioSciences AG', 'Zephyr Aero Leasing', 'Ironclad Securities Ltd',
    'Lumina Telecommunications', 'Stratos Aerospace Corp', 'Nautilus Deepsea Mining', 'Triton Freight International',
    'Hyperion Industrial Solutions', 'Spectra Chemical Group', 'Onyx Mineral Resources', 'Vortex Global Payments',
    'Prism Synthetic Materials', 'Cygnus Infrastructure Partners', 'Astraea Environmental Holdings', 'Tempest Shipping Consortium',
    'Solstice Energy Capital', 'Aether Semiconductor Labs', 'Terra Nova Trading Group', 'Equinox Metals & Mining',
    'Castellan Asset Holdings', 'Argentum Precious Reserves', 'Veritas Global Logistics', 'Pinnacle Freight Systems',
    'Halcyon Pharmaceuticals', 'Aegis Cyber Defense BV', 'Chronos Timepiece Trading', 'Boreas Wind & Power',
    'Elysium Hospitality Holdings', 'Tiberius Commodity Brokers', 'Nexus Data Systems AG', 'Argus Maritime Surveillance',
    'Sirius Global Trading', 'Vanguard Agro Logistics', 'Altair Component Technologies', 'Centauri Satellite Networks',
    'Polaris Energy Exploration', 'Obsidian Vault Solutions', 'Thorne & Sterling Holdings', 'Kensington Merchant Syndicate',
    'Starlight Diamond Exchange', 'Valiant Marine Transport', 'Prometheus Heavy Industries', 'Oberon Microelectronics',
    'Helena Silk & Textile', 'Solomon & Vance Capital', 'Caspian Pipeline Corp', 'Admiralty Logistics Ltd',
    'Lyra Advanced Robotics', 'Vesperia Fine Metals', 'Galileo Navigation Systems', 'Olympus Mineral Group',
    'Aurora Borealis Freight', 'Titan Global Cargo', 'Perseus Security Solutions', 'Aegis Wealth Management',
    'Corinthian Stone Trading', 'Nemesis Marine Charter', 'Valkyrie Aerospace SpA', 'Hesperus Energy Grid',
    'AeroSphere Logistics', 'Pandora Precious Minerals', 'Acrobat Software Systems', 'Zeus Commercial Metals'
  ];

  for (let i = 0; i < 84; i++) {
    const bank = GLOBAL_BANKS[i % GLOBAL_BANKS.length];
    const country = COUNTRIES[i % COUNTRIES.length];
    const id = `ACCT-${bank.id.replace('BANK-', '')}-${100 + i}`;
    const isSuspicious = i === 0 || i === 1 || i === 2 || i === 3 || i === 14 || i === 27;

    const riskScore = isSuspicious 
      ? Math.round(82 + (i * 7 % 17))
      : Math.round(12 + (i * 13 % 32));

    const balance = isSuspicious
      ? Math.round(180000 + (i * 45000))
      : Math.round(45000 + (i * 18000));

    // History over last 7 intervals
    const history = [];
    for (let h = 6; h >= 0; h--) {
      const d = new Date(Date.now() - h * 86400000 * 4).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const jitter = isSuspicious ? Math.sin(h) * 12 : Math.sin(h) * 4;
      history.push({ date: d, score: Math.min(100, Math.max(10, Math.round(riskScore - (h * 4) + jitter))) });
    }

    // Direct counterparties
    const counterparties = [];
    const cpCount = 3 + (i % 5);
    for (let c = 0; c < cpCount; c++) {
      const cpBank = GLOBAL_BANKS[(i + c + 1) % GLOBAL_BANKS.length];
      const cpId = `ACCT-${cpBank.id.replace('BANK-', '')}-${100 + ((i + c * 7) % 84)}`;
      counterparties.push({
        accountId: cpId,
        name: entities[(i + c * 7 + 1) % entities.length],
        totalAmount: Math.round(45000 + (c * 28000)),
        txCount: 4 + (c * 3),
        isSuspicious: isSuspicious && c === 0
      });
    }

    accounts.push({
      id,
      bank: bank.name,
      country: country.name,
      countryCode: country.code,
      city: country.name === 'United States' ? 'New York' : country.name === 'United Kingdom' ? 'London' : 'Zurich',
      entityName: entities[i],
      accountType: entityTypes[i % entityTypes.length],
      riskScore,
      balance,
      baselineVelocity7d: Math.round(balance * 0.08),
      currentVelocity24h: Math.round(balance * (isSuspicious ? 0.35 : 0.02)),
      inflow: Math.round(balance * 0.6),
      outflow: Math.round(balance * 0.4),
      flaggedTxCount: isSuspicious ? 4 + (i % 5) : 0,
      watchlistStatus: isSuspicious ? (i % 2 === 0 ? 'Sanctions Hit' : 'PEP Watch') : 'Clean',
      history,
      counterparties
    });
  }
  return accounts;
}

// ============================================================================
// CREATE A FLAGGED TRANSACTION CASE
// ============================================================================
export function createFlaggedCase(
  id: string,
  typology: TypologyType,
  fromAcct: string,
  toAcct: string,
  amount: number,
  timestamp: string,
  corridorIndex = 0,
  status: CaseStatus = 'New',
  analyst = 'Elena Vance'
): Transaction {
  const corridor = MAJOR_CORRIDORS[corridorIndex % MAJOR_CORRIDORS.length];
  const fromBank = GLOBAL_BANKS[corridorIndex % GLOBAL_BANKS.length].name;
  const toBank = GLOBAL_BANKS[(corridorIndex + 3) % GLOBAL_BANKS.length].name;

  let riskScore = 88.4;
  let typologyLabel = 'Autonomous Pattern Anomaly';
  let whyRanked = 'Multi-feature ensemble score exceeds threshold';
  let suggestedAction: AISuggestedAction = 'Escalate';
  let features: SHAPFeatureMap = {
    structuring_score: 0.12,
    cyclic_flow_score: 0.08,
    peer_cohort_zscore: 2.4,
    from_count_24h: 3,
    benford_deviation: 0.35,
    flow_imbalance: 0.42,
    log_amount: +Math.log(amount).toFixed(2)
  };

  if (typology === 'structuring') {
    riskScore = +(91.5 + (Math.sin(amount) * 3.5)).toFixed(1);
    typologyLabel = 'Structuring (< $10k Smurfing)';
    whyRanked = 'Consecutive wire transfers immediately below $10,000 threshold within a 4h window';
    suggestedAction = 'Escalate';
    features = {
      structuring_score: 0.96,
      cyclic_flow_score: 0.15,
      peer_cohort_zscore: 3.8,
      from_count_24h: 7,
      benford_deviation: 0.82,
      flow_imbalance: 0.89,
      log_amount: +Math.log(amount).toFixed(2)
    };
  } else if (typology === 'cyclic_flow') {
    riskScore = +(89.0 + (Math.sin(amount) * 3.2)).toFixed(1);
    typologyLabel = 'Cyclic Flow (Triad Layering)';
    whyRanked = 'Closed loop A->B->C->A detected across 3 accounts with 1.8% cut per hop';
    suggestedAction = 'Escalate';
    features = {
      structuring_score: 0.18,
      cyclic_flow_score: 0.94,
      peer_cohort_zscore: 3.2,
      from_count_24h: 4,
      benford_deviation: 0.45,
      flow_imbalance: 0.14,
      log_amount: +Math.log(amount).toFixed(2)
    };
  } else if (typology === 'mule_fan') {
    riskScore = +(86.5 + (Math.sin(amount) * 3.0)).toFixed(1);
    typologyLabel = 'Mule Fan-In / Rapid Fan-Out';
    whyRanked = '18 distinct retail senders converge into node, liquidated within 45m';
    suggestedAction = 'Escalate';
    features = {
      structuring_score: 0.22,
      cyclic_flow_score: 0.28,
      peer_cohort_zscore: 4.1,
      from_count_24h: 18,
      benford_deviation: 0.77,
      flow_imbalance: 0.94,
      log_amount: +Math.log(amount).toFixed(2)
    };
  } else if (typology === 'rapid_passthrough') {
    riskScore = 84.2;
    typologyLabel = 'Rapid Pass-Through Liquidation';
    whyRanked = 'Funds settled and immediately evacuated to high-risk beneficiary in < 12 minutes';
    suggestedAction = 'Escalate';
    features = {
      structuring_score: 0.10,
      cyclic_flow_score: 0.35,
      peer_cohort_zscore: 3.5,
      from_count_24h: 2,
      benford_deviation: 0.52,
      flow_imbalance: 0.98,
      log_amount: +Math.log(amount).toFixed(2)
    };
  } else if (typology === 'dormant_burst') {
    riskScore = 82.7;
    typologyLabel = 'Dormant Account Ingestion Burst';
    whyRanked = 'Zero transactional activity for 180+ days followed by an abrupt 40x volume spike';
    suggestedAction = 'Monitor';
    features = {
      structuring_score: 0.05,
      cyclic_flow_score: 0.12,
      peer_cohort_zscore: 4.8,
      from_count_24h: 5,
      benford_deviation: 0.68,
      flow_imbalance: 0.85,
      log_amount: +Math.log(amount).toFixed(2)
    };
  }

  const factors = computeSHAPFactors(features, riskScore);
  const narrative = `Transaction #${id} carries a Unified Risk Score of ${riskScore.toFixed(1)}/100, driven by an elevated ${factors[0].label} (${factors[0].value}). Capital movement between ${corridor.fromCity} (${corridor.fromCountry}) and ${corridor.toCity} (${corridor.toCountry}) shows indicators consistent with ${typologyLabel}. Peer cohort z-score of +${features.peer_cohort_zscore} confirms severe velocity divergence.`;

  const slaSec = 3600 * (1 + (corridorIndex % 5)) + Math.floor(Math.random() * 1800);
  const slaDueDate = new Date(Date.now() + slaSec * 1000).toISOString();

  return {
    id,
    timestamp,
    fromAccount: fromAcct,
    toAccount: toAcct,
    fromEntityName: 'Commercial Entity A-' + corridorIndex,
    toEntityName: 'Beneficiary Clearing ' + corridorIndex,
    fromBank,
    toBank,
    amount,
    currency: 'USD',
    paymentFormat: 'Wire',
    fromCountry: corridor.fromCountry,
    fromCountryCode: corridor.fromCountryCode,
    toCountry: corridor.toCountry,
    toCountryCode: corridor.toCountryCode,
    fromCity: corridor.fromCity,
    toCity: corridor.toCity,
    fromLat: corridor.fromLat,
    fromLng: corridor.fromLng,
    toLat: corridor.toLat,
    toLng: corridor.toLng,
    riskScore,
    priorityRank: 1,
    typology,
    typologyLabel,
    whyRanked,
    suggestedAction,
    slaSecondsRemaining: slaSec,
    slaDueDate,
    status,
    analyst,
    features,
    factors,
    narrative,
    counterfactual: {
      baselineScore: riskScore,
      amountSlider: amount,
      spreadSliderHours: 4,
      adjustedScore: riskScore
    },
    peerCohort: generatePeerCohort(fromAcct, amount * 1.8, features.from_count_24h * 3),
    sanctionsCheck: {
      passed: typology !== 'cyclic_flow',
      ofacMatch: typology === 'cyclic_flow',
      pepMatch: typology === 'mule_fan',
      watchlistName: typology === 'cyclic_flow' ? 'OFAC SDN Non-SDN Menu-Based' : undefined,
      notes: typology === 'cyclic_flow' 
        ? 'Secondary beneficiary listed on OFAC SDN Special Screening List' 
        : 'PEP indirect association flagged on intermediary account'
    }
  };
}

// ============================================================================
// GENERATE 2,000 HISTORICAL TRANSACTIONS WITH ~150 FLAGGED CASES OVER 30 DAYS
// ============================================================================
export function generateSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = Date.now();
  const accounts = generateAccounts();

  // 1. Flagship Structuring series (< $10k)
  const structuringAmounts = [9850, 9920, 9780, 9650, 9910, 9800, 9740];
  structuringAmounts.forEach((amt, idx) => {
    const time = new Date(now - (idx * 28 + 12) * 60000).toISOString();
    transactions.push(
      createFlaggedCase(`TXN-${84200 + idx}`, 'structuring', accounts[0].id, accounts[1].id, amt, time, 0, 'New', 'Elena Vance')
    );
  });

  // 2. Cyclic flow (A -> B -> C -> A)
  const cycleTxs = [
    { from: accounts[2].id, to: accounts[3].id, amt: 48500, timeMin: 180 },
    { from: accounts[3].id, to: accounts[4].id, amt: 47600, timeMin: 120 },
    { from: accounts[4].id, to: accounts[2].id, amt: 46750, timeMin: 60 }
  ];
  cycleTxs.forEach((c, idx) => {
    const time = new Date(now - c.timeMin * 60000).toISOString();
    transactions.push(
      createFlaggedCase(`TXN-${84300 + idx}`, 'cyclic_flow', c.from, c.to, c.amt, time, 1 + idx, 'Under Review', 'Marcus Chen')
    );
  });

  // 3. Mule fan-in/fan-out
  for (let i = 0; i < 4; i++) {
    const time = new Date(now - (i * 35 + 40) * 60000).toISOString();
    transactions.push(
      createFlaggedCase(`TXN-${84400 + i}`, 'mule_fan', accounts[10 + i].id, accounts[5].id, 14200 + i * 3100, time, 3 + i, 'Escalated', 'Sarah Jenkins')
    );
  }

  // 4. Inject 140 more flagged cases spread across 30 days
  const typologiesList: TypologyType[] = ['structuring', 'cyclic_flow', 'mule_fan', 'rapid_passthrough', 'dormant_burst'];
  const statusesList: CaseStatus[] = ['New', 'Under Review', 'Escalated', 'SAR Filed', 'Cleared'];

  for (let i = 0; i < 140; i++) {
    const daysAgo = (i % 30);
    const hoursOffset = (i * 3) % 24;
    const time = new Date(now - (daysAgo * 86400000 + hoursOffset * 3600000)).toISOString();
    const typo = typologiesList[i % typologiesList.length];
    const stat = statusesList[i % statusesList.length];
    const analyst = COMPLIANCE_ANALYSTS[i % COMPLIANCE_ANALYSTS.length];
    const amt = typo === 'structuring' 
      ? 9200 + (i * 37 % 780)
      : Math.round(18000 + (i * 1250) + Math.random() * 45000);

    const fromAcct = accounts[i % accounts.length].id;
    const toAcct = accounts[(i + 7) % accounts.length].id;

    transactions.push(
      createFlaggedCase(`TXN-${85000 + i}`, typo, fromAcct, toAcct, amt, time, i % MAJOR_CORRIDORS.length, stat, analyst)
    );
  }

  // 5. Normal background transactions to reach ~2,000 total transactions
  const totalTarget = 2050;
  const normalCount = totalTarget - transactions.length;

  for (let i = 0; i < normalCount; i++) {
    const corridor = MAJOR_CORRIDORS[i % MAJOR_CORRIDORS.length];
    const daysAgo = (i % 30);
    const minsAgo = (i * 19) % 1440;
    const time = new Date(now - (daysAgo * 86400000 + minsAgo * 60000)).toISOString();

    const isMediumRisk = i % 18 === 0; // ~5% medium risk
    const riskScore = isMediumRisk 
      ? +(42 + (i % 24)).toFixed(1)
      : +(4 + (i % 26)).toFixed(1);

    const amount = isMediumRisk 
      ? Math.round(14000 + (i * 150) % 55000)
      : Math.round(180 + (i * 45) % 6500);

    const fromAcct = accounts[i % accounts.length].id;
    const toAcct = accounts[(i + 13) % accounts.length].id;
    const fromBank = GLOBAL_BANKS[i % GLOBAL_BANKS.length].name;
    const toBank = GLOBAL_BANKS[(i + 4) % GLOBAL_BANKS.length].name;

    const features: SHAPFeatureMap = {
      structuring_score: +(0.02 + (i % 15) / 100).toFixed(2),
      cyclic_flow_score: +(0.01 + (i % 12) / 100).toFixed(2),
      peer_cohort_zscore: +(isMediumRisk ? 1.8 + (i % 8) / 10 : -0.5 + (i % 10) / 10).toFixed(1),
      from_count_24h: Math.floor(1 + (i % 4)),
      benford_deviation: +(0.12 + (i % 18) / 100).toFixed(2),
      flow_imbalance: +(0.08 + (i % 20) / 100).toFixed(2),
      log_amount: +Math.log(amount).toFixed(2)
    };

    const factors = computeSHAPFactors(features, riskScore);

    transactions.push({
      id: `TXN-${50000 + i}`,
      timestamp: time,
      fromAccount: fromAcct,
      toAccount: toAcct,
      fromEntityName: accounts[i % accounts.length].entityName,
      toEntityName: accounts[(i + 13) % accounts.length].entityName,
      fromBank,
      toBank,
      amount,
      currency: 'USD',
      paymentFormat: PAYMENT_FORMATS[i % PAYMENT_FORMATS.length],
      fromCountry: corridor.fromCountry,
      fromCountryCode: corridor.fromCountryCode,
      toCountry: corridor.toCountry,
      toCountryCode: corridor.toCountryCode,
      fromCity: corridor.fromCity,
      toCity: corridor.toCity,
      fromLat: corridor.fromLat,
      fromLng: corridor.fromLng,
      toLat: corridor.toLat,
      toLng: corridor.toLng,
      riskScore,
      priorityRank: isMediumRisk ? 25 + (i % 50) : 120 + (i % 200),
      typology: 'none',
      typologyLabel: isMediumRisk ? 'Mild Velocity Divergence' : 'Standard Clearing Flow',
      whyRanked: isMediumRisk ? 'Elevated transfer volume relative to account 30d baseline' : 'Standard verified commercial clearing',
      suggestedAction: isMediumRisk ? 'Monitor' : 'Likely false positive',
      slaSecondsRemaining: isMediumRisk ? 18000 : 0,
      slaDueDate: new Date(Date.now() + 18000000).toISOString(),
      status: 'New',
      analyst: isMediumRisk ? COMPLIANCE_ANALYSTS[i % COMPLIANCE_ANALYSTS.length] : 'Unassigned',
      features,
      factors,
      narrative: `Routine retail/commercial transaction of $${amount.toLocaleString()} cleared between ${corridor.fromCity} and ${corridor.toCity}. Risk indicators remain within nominal envelope.`,
      counterfactual: {
        baselineScore: riskScore,
        amountSlider: amount,
        spreadSliderHours: 24,
        adjustedScore: riskScore
      },
      peerCohort: generatePeerCohort(fromAcct, amount * 1.5, 4),
      sanctionsCheck: {
        passed: true,
        ofacMatch: false,
        pepMatch: false,
        notes: 'No matches found on international consolidated watchlists'
      }
    });
  }

  return transactions.sort((a, b) => b.riskScore - a.riskScore);
}

// ============================================================================
// LIVE STREAM SYNTHESIZER
// ============================================================================
export function synthesizeLiveTransaction(seqNumber: number): Transaction {
  const corridor = MAJOR_CORRIDORS[seqNumber % MAJOR_CORRIDORS.length];
  const now = new Date().toISOString();
  
  // 4% probability of flagged anomaly
  const isFlagged = Math.random() < 0.04;
  const accounts = generateAccounts();
  const fromAcct = accounts[seqNumber % accounts.length].id;
  const toAcct = accounts[(seqNumber + 5) % accounts.length].id;

  if (isFlagged) {
    const typologies: TypologyType[] = ['structuring', 'cyclic_flow', 'mule_fan', 'rapid_passthrough', 'dormant_burst'];
    const chosenTypo = typologies[seqNumber % typologies.length];
    const amount = chosenTypo === 'structuring'
      ? 9700 + Math.round(Math.random() * 240)
      : Math.round(18000 + Math.random() * 45000);

    return createFlaggedCase(
      `TXN-${90000 + seqNumber}`,
      chosenTypo,
      fromAcct,
      toAcct,
      amount,
      now,
      seqNumber % MAJOR_CORRIDORS.length,
      'New',
      'Unassigned'
    );
  }

  // Normal live clearing
  const amount = Math.round(350 + Math.random() * 7500);
  const riskScore = +(4 + Math.random() * 22).toFixed(1);

  const features: SHAPFeatureMap = {
    structuring_score: +(Math.random() * 0.15).toFixed(2),
    cyclic_flow_score: +(Math.random() * 0.10).toFixed(2),
    peer_cohort_zscore: +(-0.4 + Math.random() * 1.1).toFixed(1),
    from_count_24h: 1,
    benford_deviation: +(0.1 + Math.random() * 0.2).toFixed(2),
    flow_imbalance: +(0.05 + Math.random() * 0.2).toFixed(2),
    log_amount: +Math.log(amount).toFixed(2)
  };

  const factors = computeSHAPFactors(features, riskScore);

  return {
    id: `TXN-${90000 + seqNumber}`,
    timestamp: now,
    fromAccount: fromAcct,
    toAccount: toAcct,
    fromEntityName: 'Live Clearing Node ' + (seqNumber % 50),
    toEntityName: 'Settlement Counterparty ' + (seqNumber % 30),
    fromBank: GLOBAL_BANKS[seqNumber % GLOBAL_BANKS.length].name,
    toBank: GLOBAL_BANKS[(seqNumber + 2) % GLOBAL_BANKS.length].name,
    amount,
    currency: 'USD',
    paymentFormat: PAYMENT_FORMATS[seqNumber % PAYMENT_FORMATS.length],
    fromCountry: corridor.fromCountry,
    fromCountryCode: corridor.fromCountryCode,
    toCountry: corridor.toCountry,
    toCountryCode: corridor.toCountryCode,
    fromCity: corridor.fromCity,
    toCity: corridor.toCity,
    fromLat: corridor.fromLat,
    fromLng: corridor.fromLng,
    toLat: corridor.toLat,
    toLng: corridor.toLng,
    riskScore,
    priorityRank: 150,
    typology: 'none',
    typologyLabel: 'Standard Ingestion Flow',
    whyRanked: 'Normal routine transaction cleared',
    suggestedAction: 'Likely false positive',
    slaSecondsRemaining: 0,
    slaDueDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'New',
    analyst: 'Unassigned',
    features,
    factors,
    narrative: `Live transaction of $${amount.toLocaleString()} processed via ${corridor.fromCity} corridor.`,
    counterfactual: {
      baselineScore: riskScore,
      amountSlider: amount,
      spreadSliderHours: 24,
      adjustedScore: riskScore
    },
    peerCohort: generatePeerCohort(fromAcct, amount * 1.5, 3),
    sanctionsCheck: {
      passed: true,
      ofacMatch: false,
      pepMatch: false,
      notes: 'No matches found on international consolidated watchlists'
    }
  };
}

// ============================================================================
// MOCK SANCTIONS & PEP WATCHLIST
// ============================================================================
export const SANCTIONS_WATCHLIST: SanctionsEntry[] = [
  { id: 'SANC-01', name: 'Valeriy Mikhailov', entityType: 'Individual', list: 'OFAC SDN', country: 'Cyprus', program: 'UKRAINE-EO13660', matchScore: 98, aka: ['Mikhailov Trading Group', 'V. Mikhailov'], dateAdded: '2023-04-12' },
  { id: 'SANC-02', name: 'Tariq Al-Mansoor', entityType: 'Individual', list: 'PEP Global', country: 'United Arab Emirates', program: 'SENIOR-PUBLIC-FIGURE', matchScore: 94, aka: ['Sheikh Tariq', 'Al-Mansoor Logistics'], dateAdded: '2022-09-18' },
  { id: 'SANC-03', name: 'Trans-Balkan Petrochemical S.A.', entityType: 'Corporate Entity', list: 'EU Consolidated', country: 'Switzerland', program: 'SANCTIONS-EU-RUSSIA', matchScore: 91, aka: ['TBP Holding Ltd'], dateAdded: '2023-11-05' },
  { id: 'SANC-04', name: 'M/V Ocean Wanderer', entityType: 'Vessel', list: 'OFAC SDN', country: 'Panama', program: 'IRAN-EO13846', matchScore: 96, aka: ['IMO 9283741', 'Wanderer II'], dateAdded: '2024-01-20' },
  { id: 'SANC-05', name: 'Khorasan Exchange DMCC', entityType: 'Corporate Entity', list: 'UN Security Council', country: 'United Arab Emirates', program: 'UN-TALIBAN-RES-1988', matchScore: 89, aka: ['Khorasan Gold Trading'], dateAdded: '2021-08-30' },
  { id: 'SANC-06', name: 'Dmitri Voronov', entityType: 'Individual', list: 'OFAC SDN', country: 'United Kingdom', program: 'CYBER2-EO13694', matchScore: 95, aka: ['ShadowBit', 'D. Voronov'], dateAdded: '2023-06-14' },
  { id: 'SANC-07', name: 'Aethelgard Holdings Cayman', entityType: 'Corporate Entity', list: 'EU Consolidated', country: 'Cayman Islands', program: 'ANTI-CORRUPTION-GLOBAL', matchScore: 88, aka: ['Aethelgard SPV 4'], dateAdded: '2022-12-01' }
];

// ============================================================================
// INITIAL SAR DRAFTS
// ============================================================================
export const INITIAL_SAR_DRAFTS: SARDraft[] = [
  {
    id: 'SAR-2026-084',
    caseId: 'TXN-84200',
    accountId: 'ACCT-JPMC-100',
    accountName: 'Apex Logistics LLC',
    typology: 'structuring',
    narrative: 'Subject entity initiated 7 consecutive outward wire settlements each strictly valued between $9,650 and $9,920 within an 8-hour window to evade CTR reporting obligations under 31 U.S.C. 5313.',
    status: 'Pending Review',
    deadline: '2026-10-05T00:00:00Z',
    amount: 68650,
    filingOfficer: 'Elena Vance (AML Lead)',
    createdAt: '2026-09-27T14:32:00Z'
  },
  {
    id: 'SAR-2026-085',
    caseId: 'TXN-84300',
    accountId: 'ACCT-UBS-102',
    accountName: 'Novus Import Export AG',
    typology: 'cyclic_flow',
    narrative: 'Automated graph intelligence uncovered a high-velocity circular settlement loop: ACCT-UBS-102 -> ACCT-DBS-103 -> ACCT-BARC-104 -> ACCT-UBS-102 with nominal economic purpose and 1.8% dissipation.',
    status: 'Draft',
    deadline: '2026-10-08T00:00:00Z',
    amount: 142850,
    filingOfficer: 'Marcus Chen',
    createdAt: '2026-09-28T09:15:00Z'
  }
];
