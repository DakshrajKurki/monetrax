import { create } from 'zustand';
import { 
  Transaction, 
  ViewType, 
  LiveKPIStats, 
  AgentStatus, 
  AuditLogEntry, 
  FilterChip, 
  CaseStatus,
  Account,
  Bank,
  CountryGeo,
  GlobalFilters,
  SanctionsEntry,
  SARDraft,
  TypologyType
} from '../types';
import { 
  generateSeedTransactions, 
  generateAccounts, 
  GLOBAL_BANKS, 
  COUNTRIES, 
  SANCTIONS_WATCHLIST, 
  INITIAL_SAR_DRAFTS 
} from '../data/mockSeed';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AMLStoreState {
  currentView: ViewType;
  transactions: Transaction[];
  accounts: Account[];
  banks: Bank[];
  countries: CountryGeo[];
  sanctionsWatchlist: SanctionsEntry[];
  sarDrafts: SARDraft[];
  selectedTxnId: string;
  selectedAccountId: string;
  flyToCaseId: string | null;
  isLiveStreaming: boolean;
  liveSeq: number;
  
  // Real-time KPIs
  liveKPIs: LiveKPIStats;
  
  // AI Agents state
  agentStatuses: AgentStatus[];
  
  // Alert Ticker & Notifications
  liveAlertTicker: Transaction | null;
  notifications: Transaction[];
  unreadAlertCount: number;
  toasts: ToastNotification[];
  
  // Audit Trail
  auditLogs: AuditLogEntry[];
  
  // Global Filters
  globalFilters: GlobalFilters;
  filterChips: FilterChip[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addFilterChip: (chip: FilterChip) => void;
  
  // Auto-Triage Modal State
  autoTriageCandidates: Transaction[];
  isAutoTriageModalOpen: boolean;
  autoTriageReasoning: string;

  // AI Situation Brief
  situationBrief: string;
  isBriefGenerating: boolean;

  // Replay State for Typologies
  isReplayingTypology: boolean;
  activeReplayTypology: TypologyType | null;
  activeReplayStep: number;
  replayCaseId: string | null;

  // Actions
  setView: (view: ViewType) => void;
  selectTxn: (id: string) => void;
  selectAccount: (id: string) => void;
  flyToCase: (id: string) => void;
  clearFlyTo: () => void;
  toggleLiveStream: () => void;
  setStreamState: (active: boolean) => void;
  
  // Filtering
  setGlobalFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  setGlobalFilters: (filters: Partial<GlobalFilters>) => void;
  removeFilterChip: (chipId: string) => void;
  clearAllFilters: () => void;
  
  // Case Actions
  updateCaseStatus: (id: string, status: CaseStatus, notes: string, operator?: string) => void;
  bulkUpdateCaseStatus: (ids: string[], status: CaseStatus, notes: string) => void;
  recomputeCounterfactual: (id: string, amount: number, spreadHours: number) => void;
  
  // SAR
  createSARDraft: (caseOrTxn: string | Transaction, narrative?: string) => SARDraft;
  updateSARDraft: (id: string, narrative: string, status: SARDraft['status']) => void;
  
  // Triage
  openAutoTriageModal: () => void;
  closeAutoTriageModal: () => void;
  confirmAutoTriage: () => void;
  
  // Replay
  triggerReplayTypology: (typology?: TypologyType, caseId?: string) => void;
  stopReplayTypology: () => void;
  stepReplay: (step: number) => void;
  
  // Toasts & Notifications
  addToast: (titleOrObj: string | { title: string; message: string; type?: ToastNotification['type'] }, message?: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;
  clearAlertNotifications: () => void;
  refreshSituationBrief: () => void;
  resetDemoData: () => void;
  resetStore: () => void;
}

function calculateLiveKPIs(txns: Transaction[]): LiveKPIStats {
  const flagged = txns.filter(t => t.riskScore >= 70);
  const openCases = flagged.filter(t => t.status === 'New' || t.status === 'Under Review');
  const now = Date.now();
  const past24h = txns.filter(t => (now - new Date(t.timestamp).getTime()) <= 86400000);
  const flaggedToday = past24h.filter(t => t.riskScore >= 70);
  const totalVolume24h = past24h.reduce((acc, t) => acc + t.amount, 0);

  return {
    transactionsPerMin: 1420,
    flaggedToday: flaggedToday.length || 42,
    openCases: openCases.length || 14,
    modelPrAuc: 0.83,
    avgTimeToTriageMinutes: 1.4,
    totalVolume24h: totalVolume24h || 18450000,
    throughputDelta: +3.8,
    flaggedDelta: +12.4,
    openCasesDelta: -5.2,
    sparklineThroughput: [1200, 1250, 1310, 1280, 1390, 1420, 1450, 1420],
    sparklineFlagged: [28, 34, 31, 39, 44, 40, 45, 42],
    sparklineOpenCases: [22, 19, 18, 17, 16, 15, 14, 14]
  };
}

const initialTransactions = generateSeedTransactions();
const initialAccounts = generateAccounts();
const initialFlagged = initialTransactions.filter(t => t.riskScore >= 70);

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    caseId: 'TXN-84200',
    action: 'ESCALATE_SAR',
    operator: 'Elena Vance (Lead)',
    notes: 'Structuring cluster confirmed across 7 transfers under $10,000 threshold. SAR report drafted for FinCEN transmission.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    caseId: 'TXN-84300',
    action: 'ADD_NOTE',
    operator: 'System AI Engine',
    notes: 'Closed cyclic flow detected with 0.94 graph cycle coefficient. High correlation with designated high-risk offshore corridor.'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    caseId: 'TXN-85002',
    action: 'CLEAR_ALERT',
    operator: 'Marcus Chen',
    notes: 'Wholesaler commercial payroll batch verified against validated corporate documentation. Anomaly cleared as false positive.'
  }
];

export const useAMLStore = create<AMLStoreState>((set, get) => ({
  currentView: 'command',
  transactions: initialTransactions,
  accounts: initialAccounts,
  banks: GLOBAL_BANKS,
  countries: COUNTRIES,
  sanctionsWatchlist: SANCTIONS_WATCHLIST,
  sarDrafts: INITIAL_SAR_DRAFTS,
  selectedTxnId: initialFlagged[0]?.id || initialTransactions[0].id,
  selectedAccountId: initialAccounts[0]?.id || 'ACCT-JPMC-100',
  flyToCaseId: null,
  isLiveStreaming: true,
  liveSeq: 1,

  liveKPIs: calculateLiveKPIs(initialTransactions),

  agentStatuses: [
    { name: 'Structuring Agent', role: 'Smurfing & Threshold Radar', activeCount: 7, unit: 'patterns', isFiring: true, lastFired: 'Just now' },
    { name: 'Cycle Detector', role: 'Graph Ring & Hop Topology', activeCount: 3, unit: 'loops', isFiring: false, lastFired: '4m ago' },
    { name: 'Mule Radar', role: 'Fan-In / Liquidation Scan', activeCount: 4, unit: 'rings', isFiring: true, lastFired: '1m ago' },
    { name: 'Sanctions Screen', role: 'OFAC & PEP List Watch', activeCount: 0, unit: 'hits', isFiring: false, lastFired: 'Live clean' }
  ],

  liveAlertTicker: initialFlagged[0] || null,
  notifications: initialFlagged.slice(0, 7),
  unreadAlertCount: initialFlagged.length,
  toasts: [],
  auditLogs: initialAuditLogs,

  globalFilters: {
    timeRange: 'all',
    riskBand: 'all',
    typology: 'all',
    country: 'all',
    status: 'all',
    searchQuery: ''
  },
  filterChips: [],
  searchQuery: '',

  setSearchQuery: (q: string) => {
    get().setGlobalFilter('searchQuery', q);
    set({ searchQuery: q });
  },

  addFilterChip: (chip: FilterChip) => {
    set((state) => ({
      filterChips: [...state.filterChips.filter(c => c.field !== chip.field), chip]
    }));
  },

  autoTriageCandidates: [],
  isAutoTriageModalOpen: false,
  autoTriageReasoning: '',

  situationBrief: "Surveillance network actively monitoring live ingestion at 1,420 tx/min across 12 global clearing banks. In the current surveillance window, 14 high-priority anomalies have been isolated, dominated by 4 sub-$10k structuring clusters and 2 closed-loop cyclic routing rings. The stacked meta-learner maintains high discriminative power with 0.83 PR-AUC. Compliance posture is stable with human-in-the-loop triage SLA averaging 1.4 minutes per flag.",
  isBriefGenerating: false,

  isReplayingTypology: false,
  activeReplayTypology: null,
  activeReplayStep: 0,
  replayCaseId: null,

  setView: (view: ViewType) => set({ currentView: view }),

  selectTxn: (id: string) => {
    set({ selectedTxnId: id });
  },

  selectAccount: (id: string) => {
    set({ selectedAccountId: id });
  },

  flyToCase: (id: string) => {
    set({
      selectedTxnId: id,
      flyToCaseId: id,
      currentView: 'globe'
    });
  },

  clearFlyTo: () => set({ flyToCaseId: null }),

  toggleLiveStream: () => set((state) => ({ isLiveStreaming: !state.isLiveStreaming })),
  setStreamState: (active: boolean) => set({ isLiveStreaming: active }),

  setGlobalFilter: (key, value) => {
    set((state) => {
      const nextFilters = { ...state.globalFilters, [key]: value };
      
      // Sync filter chips
      const chips: FilterChip[] = [];
      if (nextFilters.timeRange !== 'all') {
        chips.push({ id: 'f-time', label: `Time: ${nextFilters.timeRange}`, field: 'timeRange', value: nextFilters.timeRange });
      }
      if (nextFilters.riskBand !== 'all') {
        chips.push({ id: 'f-risk', label: `Risk: ${nextFilters.riskBand}`, field: 'riskBand', value: nextFilters.riskBand });
      }
      if (nextFilters.typology !== 'all') {
        chips.push({ id: 'f-typo', label: `Typology: ${nextFilters.typology}`, field: 'typology', value: nextFilters.typology });
      }
      if (nextFilters.country !== 'all') {
        chips.push({ id: 'f-country', label: `Country: ${nextFilters.country}`, field: 'country', value: nextFilters.country });
      }
      if (nextFilters.status !== 'all') {
        chips.push({ id: 'f-status', label: `Status: ${nextFilters.status}`, field: 'status', value: nextFilters.status });
      }
      if (nextFilters.searchQuery) {
        chips.push({ id: 'f-search', label: `"${nextFilters.searchQuery}"`, field: 'searchQuery', value: nextFilters.searchQuery });
      }

      return { globalFilters: nextFilters, filterChips: chips };
    });
  },

  setGlobalFilters: (filters) => {
    set((state) => ({ globalFilters: { ...state.globalFilters, ...filters } }));
  },

  removeFilterChip: (chipId: string) => {
    set((state) => {
      const chip = state.filterChips.find(c => c.id === chipId);
      if (!chip) return state;

      const nextFilters = { ...state.globalFilters };
      if (chip.field === 'timeRange') nextFilters.timeRange = 'all';
      if (chip.field === 'riskBand') nextFilters.riskBand = 'all';
      if (chip.field === 'typology') nextFilters.typology = 'all';
      if (chip.field === 'country') nextFilters.country = 'all';
      if (chip.field === 'status') nextFilters.status = 'all';
      if (chip.field === 'searchQuery') nextFilters.searchQuery = '';

      return {
        globalFilters: nextFilters,
        filterChips: state.filterChips.filter(c => c.id !== chipId)
      };
    });
  },

  clearAllFilters: () => set({
    globalFilters: {
      timeRange: 'all',
      riskBand: 'all',
      typology: 'all',
      country: 'all',
      status: 'all',
      searchQuery: ''
    },
    filterChips: []
  }),

  updateCaseStatus: (id: string, status: CaseStatus, notes: string, operator = 'Elena Vance (Lead)') => {
    set((state) => {
      const updatedTxns = state.transactions.map(t => {
        if (t.id === id) {
          return { ...t, status };
        }
        return t;
      });

      const actionType = status === 'Escalated' || status === 'SAR Filed' 
        ? 'ESCALATE_SAR' 
        : status === 'Cleared' 
        ? 'CLEAR_ALERT' 
        : 'STATUS_CHANGE';

      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        caseId: id,
        action: actionType,
        operator,
        notes
      };

      return {
        transactions: updatedTxns,
        auditLogs: [newLog, ...state.auditLogs],
        liveKPIs: calculateLiveKPIs(updatedTxns)
      };
    });

    get().addToast('Case Status Updated', `Case #${id} transitioned to ${status}.`, 'info');
  },

  bulkUpdateCaseStatus: (ids: string[], status: CaseStatus, notes: string) => {
    set((state) => {
      const idSet = new Set(ids);
      const updatedTxns = state.transactions.map(t => {
        if (idSet.has(t.id)) {
          return { ...t, status };
        }
        return t;
      });

      const newLogs: AuditLogEntry[] = ids.map(id => ({
        id: `log-${Date.now()}-${id}`,
        timestamp: new Date().toISOString(),
        caseId: id,
        action: 'STATUS_CHANGE',
        operator: 'Elena Vance (Lead)',
        notes: `Bulk status update: ${notes}`
      }));

      return {
        transactions: updatedTxns,
        auditLogs: [...newLogs, ...state.auditLogs],
        liveKPIs: calculateLiveKPIs(updatedTxns)
      };
    });

    get().addToast('Bulk Status Updated', `${ids.length} cases marked as ${status}.`, 'success');
  },

  createSARDraft: (caseOrTxn: string | Transaction, narrative?: string) => {
    const caseId = typeof caseOrTxn === 'string' ? caseOrTxn : caseOrTxn.id;
    const txn = typeof caseOrTxn === 'object' ? caseOrTxn : get().transactions.find(t => t.id === caseId);
    const draftId = `SAR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newDraft: SARDraft = {
      id: draftId,
      caseId,
      accountId: txn?.fromAccount || 'ACCT-JPMC-100',
      accountName: txn?.fromEntityName || 'Subject Account',
      typology: txn?.typology || 'structuring',
      narrative: narrative || txn?.narrative || 'Suspicious transactions isolated by AI surveillance.',
      status: 'Draft',
      deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
      amount: txn?.amount || 9850,
      filingOfficer: 'Elena Vance (AML Lead)',
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      sarDrafts: [newDraft, ...state.sarDrafts]
    }));

    get().addToast('SAR Draft Created', `Draft ${draftId} generated for case #${caseId}.`, 'success');
    return newDraft;
  },

  updateSARDraft: (id: string, narrative: string, status: SARDraft['status']) => {
    set((state) => ({
      sarDrafts: state.sarDrafts.map(d => d.id === id ? { ...d, narrative, status } : d)
    }));
    get().addToast('SAR Updated', `Filing ${id} status updated to ${status}.`, 'info');
  },

  recomputeCounterfactual: (id: string, amount: number, spreadHours: number) => {
    set((state) => {
      const updatedTxns = state.transactions.map((t) => {
        if (t.id === id) {
          const baseline = t.counterfactual.baselineScore;
          let delta = 0;
          if (amount < 8000) delta -= 38;
          else if (amount > 12000) delta -= 18;
          if (spreadHours > 48) delta -= 28;
          else if (spreadHours < 2) delta += 8;

          const adjustedScore = Math.max(8.0, Math.min(99.0, +(baseline + delta).toFixed(1)));
          return {
            ...t,
            counterfactual: {
              ...t.counterfactual,
              amountSlider: amount,
              spreadSliderHours: spreadHours,
              adjustedScore
            }
          };
        }
        return t;
      });

      return { transactions: updatedTxns };
    });
  },

  openAutoTriageModal: () => {
    const candidates = get().transactions.filter(
      t => t.riskScore < 60 && t.status === 'New' && t.suggestedAction === 'Likely false positive'
    ).slice(0, 12);

    set({
      autoTriageCandidates: candidates,
      isAutoTriageModalOpen: true,
      autoTriageReasoning: `Identified ${candidates.length} low-risk transactions matching known verified commercial payroll & routine clearing patterns with clean sanctions records and low graph cycle scores.`
    });
  },

  closeAutoTriageModal: () => set({ isAutoTriageModalOpen: false }),

  confirmAutoTriage: () => {
    const candidates = get().autoTriageCandidates;
    const ids = candidates.map(c => c.id);
    get().bulkUpdateCaseStatus(ids, 'Cleared', 'Auto-triaged by AI batch verification engine.');
    set({ isAutoTriageModalOpen: false, autoTriageCandidates: [] });
  },

  triggerReplayTypology: (typology: TypologyType = 'structuring', caseId?: string) => {
    set({
      isReplayingTypology: true,
      activeReplayTypology: typology,
      activeReplayStep: 0,
      replayCaseId: caseId || null
    });
    get().addToast('Typology Replay Active', `Simulating execution path for ${typology}.`, 'info');
  },

  stopReplayTypology: () => {
    set({ isReplayingTypology: false, activeReplayTypology: null, activeReplayStep: 0 });
  },

  stepReplay: (step: number) => {
    set({ activeReplayStep: step });
  },

  addToast: (titleOrObj: string | { title: string; message: string; type?: ToastNotification['type'] }, message?: string, type: ToastNotification['type'] = 'info') => {
    let title: string;
    let msg: string;
    let t: ToastNotification['type'] = 'info';

    if (typeof titleOrObj === 'object') {
      title = titleOrObj.title;
      msg = titleOrObj.message;
      t = titleOrObj.type || 'info';
    } else {
      title = titleOrObj;
      msg = message || '';
      t = type || 'info';
    }

    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = { id, title, message: msg, type: t, timestamp: new Date().toISOString() };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4500);
  },

  dismissToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  clearAlertNotifications: () => set({ unreadAlertCount: 0 }),

  refreshSituationBrief: () => {
    set({ isBriefGenerating: true });
    setTimeout(() => {
      set({
        isBriefGenerating: false,
        situationBrief: `Surveillance network actively evaluating live transaction streams across 12 tier-1 clearing banks. Current 24h window exhibits ${get().transactions.filter(t => t.riskScore >= 70).length} high-probability anomalies. Structuring evasion remains elevated on US-UK corridors, while offshore cyclic flow in Cyprus and Switzerland is quarantined. Overall system false-positive rate is nominal at 14.2%.`
      });
    }, 900);
  },

  resetDemoData: () => {
    const txns = generateSeedTransactions();
    set({
      transactions: txns,
      accounts: generateAccounts(),
      sarDrafts: INITIAL_SAR_DRAFTS,
      liveKPIs: calculateLiveKPIs(txns),
      unreadAlertCount: txns.filter(t => t.riskScore >= 70).length
    });
    get().addToast('Data Reset', 'Demo data store re-seeded successfully.', 'success');
  },

  resetStore: () => {
    get().resetDemoData();
  }
}));
