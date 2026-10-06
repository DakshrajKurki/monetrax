export type ViewType = 
  | 'command' 
  | 'queue' 
  | 'detail' 
  | 'globe' 
  | 'network' 
  | 'account' 
  | 'typologies' 
  | 'sanctions' 
  | 'sar' 
  | 'analytics' 
  | 'model' 
  | 'system';

export type PaymentFormat = 'ACH' | 'Wire' | 'Cheque' | 'Crypto' | 'Cash' | 'Credit Card';

export type TypologyType = 
  | 'structuring' 
  | 'cyclic_flow' 
  | 'mule_fan' 
  | 'rapid_passthrough' 
  | 'dormant_burst' 
  | 'none';

export type AISuggestedAction = 'Escalate' | 'Monitor' | 'Likely false positive';

export type CaseStatus = 'New' | 'Under Review' | 'Escalated' | 'SAR Filed' | 'Cleared';

export interface LocationGeo {
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
}

export interface SHAPFeatureMap {
  structuring_score: number;
  cyclic_flow_score: number;
  peer_cohort_zscore: number;
  from_count_24h: number;
  benford_deviation: number;
  flow_imbalance: number;
  log_amount: number;
}

export interface SHAPFactor {
  feature: keyof SHAPFeatureMap | string;
  label: string;
  value: number;
  contribution: number; // positive = raises risk, negative = lowers risk
  description: string;
}

export interface PeerCohortPoint {
  accountId: string;
  volume: number;
  velocity: number;
  isSubject?: boolean;
}

export interface SanctionsResult {
  passed: boolean;
  ofacMatch: boolean;
  pepMatch: boolean;
  watchlistName?: string;
  notes: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  fromAccount: string;
  toAccount: string;
  fromEntityName?: string;
  toEntityName?: string;
  fromBank: string;
  toBank: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  paymentFormat: PaymentFormat;
  
  // Geolocation
  fromCountry: string;
  fromCountryCode: string;
  toCountry: string;
  toCountryCode: string;
  fromCity: string;
  toCity: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;

  // Unified Risk Score & AI evaluation
  riskScore: number; // 0 - 100
  priorityRank: number; // 1 = highest priority
  typology: TypologyType;
  typologyLabel: string;
  whyRanked: string;
  suggestedAction: AISuggestedAction;
  slaSecondsRemaining: number;
  slaDueDate: string;
  status: CaseStatus;
  analyst: string;

  // Real SHAP features
  features: SHAPFeatureMap;
  factors: SHAPFactor[];

  // Investigation details
  narrative?: string;
  counterfactual: {
    baselineScore: number;
    amountSlider: number;
    spreadSliderHours: number;
    adjustedScore: number;
  };
  peerCohort: {
    cohortName: string;
    points: PeerCohortPoint[];
    subjectVolume: number;
    subjectVelocity: number;
  };
  sanctionsCheck: SanctionsResult;
}

export interface Account {
  id: string;
  bank: string;
  country: string;
  countryCode: string;
  city: string;
  entityName: string;
  accountType: 'Retail' | 'Commercial' | 'Corporate' | 'Correspondent' | 'Private Wealth';
  riskScore: number;
  balance: number;
  baselineVelocity7d: number;
  currentVelocity24h: number;
  inflow: number;
  outflow: number;
  flaggedTxCount: number;
  watchlistStatus: 'Clean' | 'PEP Watch' | 'Sanctions Hit' | 'Adverse Media';
  history: { date: string; score: number }[];
  counterparties: { 
    accountId: string; 
    name: string; 
    totalAmount: number; 
    txCount: number; 
    isSuspicious?: boolean;
  }[];
}

export interface Bank {
  id: string;
  name: string;
  swift: string;
  country: string;
  cohort: 'Tier-1 Global' | 'Tier-2 Regional' | 'Offshore Private' | 'Fintech/Neobank';
  alertVolume: number;
  fprRate: number;
}

export interface CountryGeo {
  code: string;
  name: string;
  lat: number;
  lng: number;
  flaggedCount: number;
  totalVolume: number;
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface SARDraft {
  id: string;
  caseId: string;
  accountId: string;
  accountName: string;
  typology: TypologyType;
  narrative: string;
  status: 'Draft' | 'Pending Review' | 'Submitted' | 'Filed';
  deadline: string;
  amount: number;
  filingOfficer: string;
  createdAt: string;
}

export interface SanctionsEntry {
  id: string;
  name: string;
  entityType: 'Individual' | 'Corporate Entity' | 'Vessel';
  list: 'OFAC SDN' | 'EU Consolidated' | 'UN Security Council' | 'PEP Global';
  country: string;
  program: string;
  matchScore: number;
  aka: string[];
  dateAdded: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  caseId: string;
  action: 'ESCALATE_SAR' | 'CLEAR_ALERT' | 'ADD_NOTE' | 'AUTO_TRIAGE' | 'COUNTERFACTUAL_RUN' | 'STATUS_CHANGE';
  operator: string;
  notes: string;
}

export interface LiveKPIStats {
  transactionsPerMin: number;
  flaggedToday: number;
  openCases: number;
  modelPrAuc: number;
  avgTimeToTriageMinutes: number;
  totalVolume24h: number;
  throughputDelta: number;
  flaggedDelta: number;
  openCasesDelta: number;
  sparklineThroughput: number[];
  sparklineFlagged: number[];
  sparklineOpenCases: number[];
}

export interface AgentStatus {
  name: string;
  role: string;
  activeCount: number;
  unit: string;
  isFiring: boolean;
  lastFired: string;
}

export interface FilterChip {
  id: string;
  label: string;
  field: string;
  value: any;
}

export interface GlobalFilters {
  timeRange: '24h' | '7d' | '30d' | 'all';
  riskBand: 'all' | 'critical' | 'medium' | 'low';
  typology: string;
  country: string;
  status: string;
  searchQuery: string;
}

export interface AccountGraphNode {
  id: string;
  label: string;
  bank?: string;
  x: number;
  y: number;
  z?: number;
  volume: number;
  riskScore: number;
  cluster: 'suspicious' | 'legitimate' | 'mule_hub';
  inflow: number;
  outflow: number;
  flagCount: number;
}

export interface AccountGraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  typology?: TypologyType;
  flowStep?: number;
  timestamp?: string;
}
