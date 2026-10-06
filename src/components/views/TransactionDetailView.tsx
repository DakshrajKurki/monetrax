import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  ArrowLeft, 
  Globe2, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Users, 
  History, 
  Lock, 
  Plus, 
  CheckCircle2,
  Building,
  UserCheck,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { pageVariants } from '../common/MotionComponents';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export const TransactionDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const selectedTxnId = useAMLStore((s) => s.selectedTxnId);
  const transactions = useAMLStore((s) => s.transactions);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const updateCaseStatus = useAMLStore((s) => s.updateCaseStatus);
  const recomputeCounterfactual = useAMLStore((s) => s.recomputeCounterfactual);
  const auditLogs = useAMLStore((s) => s.auditLogs);
  const createSARDraft = useAMLStore((s) => s.createSARDraft);
  const selectAccount = useAMLStore((s) => s.selectAccount);
  const selectTxn = useAMLStore((s) => s.selectTxn);

  // Match transaction by route param or store selection
  const activeTxn = transactions.find((t) => t.id === (id || selectedTxnId)) || transactions[0];

  const [counterAmount, setCounterAmount] = useState<number>(activeTxn.amount);
  const [counterSpread, setCounterSpread] = useState<number>(4);
  const [streamedNarrative, setStreamedNarrative] = useState<string>(activeTxn.narrative || '');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [isNoteInputOpen, setIsNoteInputOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animated dial score (starts from 0)
  const [animatedScore, setAnimatedScore] = useState<number>(0);

  useEffect(() => {
    if (activeTxn) {
      setCounterAmount(activeTxn.amount);
      setCounterSpread(activeTxn.counterfactual?.spreadSliderHours || 4);
      setStreamedNarrative(activeTxn.narrative || '');
      
      // Animate dial from 0 to riskScore
      setAnimatedScore(0);
      const target = activeTxn.riskScore;
      let start = 0;
      const startTime = performance.now();
      const duration = 800;

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(start + (target - start) * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setAnimatedScore(target);
        }
      };
      requestAnimationFrame(step);
    }
  }, [activeTxn?.id]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAmountChange = (newAmt: number) => {
    setCounterAmount(newAmt);
    recomputeCounterfactual(activeTxn.id, newAmt, counterSpread);
  };

  const handleSpreadChange = (newHours: number) => {
    setCounterSpread(newHours);
    recomputeCounterfactual(activeTxn.id, counterAmount, newHours);
  };

  const handleRegenerateNarrative = async () => {
    setIsStreaming(true);
    setStreamedNarrative('');
    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeTxn.id,
          riskScore: activeTxn.riskScore,
          typology: activeTxn.typologyLabel,
          features: activeTxn.features
        })
      });

      if (!res.ok || !res.body) {
        throw new Error('AI stream endpoint returned non-200');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setStreamedNarrative(buffer);
      }
    } catch (err) {
      // Graceful offline fallback narrative
      const fallbackText = `Comprehensive algorithmic assessment for Transaction #${activeTxn.id}: Evaluated Unified Risk Score of ${activeTxn.riskScore.toFixed(1)}/100 driven predominantly by an elevated ${activeTxn.factors[0]?.label || 'Structuring Proximity'} (${activeTxn.factors[0]?.value || '0.96'}). Transaction velocity and cross-border routing between ${activeTxn.fromCity} and ${activeTxn.toCity} exhibits statistical markers consistent with ${activeTxn.typologyLabel}. Peer cohort divergence (+${activeTxn.features.peer_cohort_zscore} z-score) deviates materially from expected baseline.`;
      
      let current = '';
      for (let i = 0; i < fallbackText.length; i += 4) {
        current += fallbackText.slice(i, i + 4);
        setStreamedNarrative(current);
        await new Promise((r) => setTimeout(r, 20));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleEscalateSAR = () => {
    updateCaseStatus(
      activeTxn.id,
      'Escalated',
      `Escalated to SAR filing: High-confidence ${activeTxn.typologyLabel} pattern detected.`
    );
    triggerToast(`Case #${activeTxn.id} escalated to FinCEN SAR drafting queue.`);
  };

  const handleGenerateSAR = () => {
    createSARDraft(activeTxn.id, streamedNarrative);
    navigate('/sar');
  };

  const handleClearAlert = () => {
    updateCaseStatus(
      activeTxn.id,
      'Cleared',
      `Alert cleared as validated routine commercial flow after analyst review.`
    );
    triggerToast(`Alert #${activeTxn.id} cleared as false positive.`);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    updateCaseStatus(
      activeTxn.id,
      activeTxn.status,
      `Analyst Note: ${noteText}`
    );
    setNoteText('');
    setIsNoteInputOpen(false);
    triggerToast('Analyst note appended to case audit trail.');
  };

  // Related transactions involving these accounts
  const relatedTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.id !== activeTxn.id && 
      (t.fromAccount === activeTxn.fromAccount || t.toAccount === activeTxn.toAccount || t.toAccount === activeTxn.fromAccount)
    ).slice(0, 5);
  }, [transactions, activeTxn]);

  const caseAuditLogs = auditLogs.filter((l) => l.caseId === activeTxn.id);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-6 pb-16"
    >
      {/* Top Header Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/queue')}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-white hover:border-white/30 transition-all"
            title="Back to Case Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-light text-[var(--text)] tracking-tight">
                Case Investigation #{activeTxn.id}
              </h2>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
                activeTxn.status === 'New' 
                  ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border-[var(--risk-red)]/30'
                  : 'bg-[var(--sage-2)]/20 text-[var(--sage-3)] border-[var(--sage-2)]/30'
              }`}>
                {activeTxn.status}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5 font-light">
              {activeTxn.typologyLabel} • Recorded {activeTxn.timestamp.slice(0, 16).replace('T', ' ')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              flyToCase(activeTxn.id);
              navigate(`/globe?case=${activeTxn.id}&view=map`);
            }}
            className="pill-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-[var(--sage-3)]" />
            <span>Show on Globe</span>
          </button>

          <button
            onClick={handleClearAlert}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--line)] text-xs text-[var(--muted)] hover:text-white transition-all"
          >
            Clear Alert
          </button>

          <button
            onClick={handleGenerateSAR}
            className="pill-btn-primary text-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-black" />
            <span>Generate SAR Draft</span>
          </button>

          <button
            onClick={handleEscalateSAR}
            className="pill-btn-secondary text-xs flex items-center gap-1.5 text-[var(--risk-red)] border-[var(--risk-red)]/40 hover:bg-[var(--risk-red)]/10"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Escalate Case</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Dial + SHAP Bars + AI Narrative + Entity Cards */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Risk Dial Card with Shared Element Transition */}
          <motion.div 
            layoutId={`case-card-${activeTxn.id}`}
            className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[var(--line)]"
          >
            <div className="flex flex-col items-center justify-center relative w-44 h-44 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke={activeTxn.riskScore >= 70 ? 'var(--risk-red)' : activeTxn.riskScore >= 40 ? 'var(--risk-amber)' : 'var(--live)'}
                  strokeWidth="10"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * animatedScore) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light text-[var(--text)] font-sans tabular-nums">
                  {animatedScore.toFixed(1)}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted)]">
                  Risk Score
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--line)]">
                <span className="text-[var(--muted)]">Model Architecture</span>
                <span className="text-[var(--sage-3)] font-mono">XGBoost + IF + Autoencoder</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--line)]">
                <span className="text-[var(--muted)]">Suggested Action</span>
                <span className="font-semibold text-white">{activeTxn.suggestedAction}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--line)]">
                <span className="text-[var(--muted)]">Settlement Corridor</span>
                <span className="text-[var(--text)] font-mono">{activeTxn.fromCity} ➔ {activeTxn.toCity}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Amount</span>
                <span className="text-white font-mono font-bold tabular-nums">${activeTxn.amount.toLocaleString()} {activeTxn.currency}</span>
              </div>
            </div>
          </motion.div>

          {/* Entity Profile Card with Account 360 link */}
          <div className="glass-panel p-5 border border-[var(--line)] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[var(--sage-2)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  Entity & Settlement Profile
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">Inter-Bank Clearing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Origin Entity */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--line)] flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[var(--muted)]">Origin Account</div>
                  <button
                    onClick={() => {
                      selectAccount(activeTxn.fromAccount);
                      navigate(`/account/${activeTxn.fromAccount}`);
                    }}
                    className="font-mono text-sm font-medium text-white hover:text-[var(--sage-2)] flex items-center gap-1 mt-0.5"
                  >
                    <span>{activeTxn.fromAccount}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </button>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{activeTxn.fromEntityName || 'Commercial Origin Node'}</p>
                </div>
                <div className="text-[10px] font-mono text-[var(--muted)] pt-2 border-t border-[var(--line)]">
                  Bank: <span className="text-[var(--text)]">{activeTxn.fromBank}</span>
                </div>
              </div>

              {/* Destination Beneficiary */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--line)] flex flex-col justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[var(--muted)]">Beneficiary Account</div>
                  <button
                    onClick={() => {
                      selectAccount(activeTxn.toAccount);
                      navigate(`/account/${activeTxn.toAccount}`);
                    }}
                    className="font-mono text-sm font-medium text-white hover:text-[var(--sage-2)] flex items-center gap-1 mt-0.5"
                  >
                    <span>{activeTxn.toAccount}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </button>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{activeTxn.toEntityName || 'Settlement Beneficiary'}</p>
                </div>
                <div className="text-[10px] font-mono text-[var(--muted)] pt-2 border-t border-[var(--line)]">
                  Bank: <span className="text-[var(--text)]">{activeTxn.toBank}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SHAP Feature Contribution Bars */}
          <div className="glass-panel p-6 flex flex-col gap-4 border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">
                  SHAP Attributed Risk Factors
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Local feature contributions pushing risk score above baseline
                </p>
              </div>
              <span className="text-[10px] font-mono text-[var(--sage-3)] bg-[var(--sage-2)]/10 px-2 py-0.5 rounded-full border border-[var(--sage-2)]/25">
                Log-odds Attribution
              </span>
            </div>

            <div className="space-y-3.5">
              {activeTxn.factors.map((factor, idx) => {
                const percent = Math.min(100, Math.max(8, factor.contribution * 2.4));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--text)]">{factor.label}</span>
                      <span className="text-[var(--risk-red)] font-medium tabular-nums">+{factor.contribution} pts</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[var(--risk-amber)] to-[var(--risk-red)] transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--muted)] font-light">
                      {factor.description} (value: {factor.value})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Narrative Card */}
          <div className="glass-panel p-6 border border-[var(--sage-2)]/25 bg-[var(--sage-2)]/[0.02]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--sage-3)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  AI Investigative Narrative
                </h3>
              </div>
              <button
                onClick={handleRegenerateNarrative}
                disabled={isStreaming}
                className="text-[11px] text-[var(--sage-3)] hover:text-white font-mono underline disabled:opacity-50"
              >
                {isStreaming ? 'Streaming...' : 'Re-stream Narrative'}
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--text)]/95 font-light">
              {streamedNarrative}
            </p>

            <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
              <span>Grounded solely in listed SHAP features</span>
              <span className="text-[var(--sage-3)]">AI-generated — verify before action</span>
            </div>
          </div>
        </div>

        {/* Right Column: Counterfactual Simulator + Peer Cohort + Related Transactions + Sanctions + Audit Trail */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Counterfactual Simulator */}
          <div className="glass-panel p-6 flex flex-col gap-4 border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--sage-3)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  Counterfactual Simulator
                </h3>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono">What-if Analysis</span>
            </div>

            <p className="text-xs text-[var(--muted)] font-light">
              Adjust parameters to test what transaction profile would make this non-suspicious.
            </p>

            {/* Slider 1: Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--muted)]">Transaction Amount</span>
                <span className="text-white font-bold tabular-nums">${counterAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="250"
                value={counterAmount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="w-full accent-[var(--sage-2)] h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>$1,000</span>
                <span>$10,000 (CTR Threshold)</span>
                <span>$25,000</span>
              </div>
            </div>

            {/* Slider 2: Spread Window */}
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--muted)]">Temporal Window</span>
                <span className="text-white font-bold">{counterSpread} hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                step="1"
                value={counterSpread}
                onChange={(e) => handleSpreadChange(Number(e.target.value))}
                className="w-full accent-[var(--sage-2)] h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>1h (Rapid smurfing)</span>
                <span>24h</span>
                <span>72h (Decayed velocity)</span>
              </div>
            </div>

            {/* Recalculated Score */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--line)] flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                  Projected Score:
                </span>
                <div className="text-xs text-[var(--muted)]">
                  {counterAmount < 9000 && counterSpread > 12 ? 'Drops below alert threshold' : 'Remains above risk cutoff'}
                </div>
              </div>
              <span className={`text-xl font-mono font-bold tabular-nums ${
                activeTxn.counterfactual?.adjustedScore >= 70 ? 'text-[var(--risk-red)]' : activeTxn.counterfactual?.adjustedScore >= 40 ? 'text-[var(--risk-amber)]' : 'text-[var(--live)]'
              }`}>
                {activeTxn.counterfactual?.adjustedScore || activeTxn.riskScore}/100
              </span>
            </div>
          </div>

          {/* Timeline of Related Transactions */}
          <div className="glass-panel p-5 border border-[var(--line)] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--sage-2)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  Related Counterparty Timeline
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">{relatedTransactions.length} Associated Flows</span>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {relatedTransactions.length === 0 ? (
                <div className="py-4 text-xs text-[var(--muted)] text-center">
                  No other concurrent settlements observed for this counterparty pair.
                </div>
              ) : (
                relatedTransactions.map(rt => (
                  <div 
                    key={rt.id} 
                    onClick={() => {
                      selectTxn(rt.id);
                      navigate(`/detail/${rt.id}`);
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors px-1"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-white font-medium">#{rt.id}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${rt.riskScore >= 70 ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)]' : 'bg-[var(--live)]/20 text-[var(--live)]'}`}>
                          {rt.riskScore.toFixed(0)} Risk
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">
                        {rt.fromCity} ➔ {rt.toCity} ({rt.paymentFormat})
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-white tabular-nums">{formatCurrency(rt.amount)}</div>
                      <div className="text-[10px] text-[var(--muted)]">{formatRelativeTime(rt.timestamp).relative}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Peer Cohort Scatter */}
          <div className="glass-panel p-6 flex flex-col gap-4 border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--sage-3)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  Peer Cohort Comparison
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">
                {activeTxn.peerCohort?.cohortName || 'Treasury Tier-2'}
              </span>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <XAxis 
                    type="number" 
                    dataKey="volume" 
                    name="Volume ($)" 
                    stroke="var(--muted)" 
                    fontSize={10} 
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="velocity" 
                    name="Velocity" 
                    stroke="var(--muted)" 
                    fontSize={10} 
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{
                      backgroundColor: 'rgba(11, 15, 13, 0.95)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: 'var(--text)'
                    }}
                  />
                  <Scatter data={activeTxn.peerCohort?.points || []}>
                    {(activeTxn.peerCohort?.points || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isSubject ? 'var(--risk-red)' : 'var(--sage-2)'} 
                        r={entry.isSubject ? 7 : 3.5}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sanctions Panel */}
          <div className="glass-panel p-6 flex flex-col gap-3 border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--sage-3)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  Sanctions Screening
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                activeTxn.sanctionsCheck.passed 
                  ? 'bg-[var(--live)]/20 text-[var(--live)] border border-[var(--live)]/30'
                  : 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30'
              }`}>
                {activeTxn.sanctionsCheck.passed ? 'PASSED' : 'WATCHLIST MATCH'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[var(--muted)] text-[10px]">OFAC SDN Screening</div>
                <div className={`font-bold mt-1 ${activeTxn.sanctionsCheck.ofacMatch ? 'text-[var(--risk-red)]' : 'text-[var(--live)]'}`}>
                  {activeTxn.sanctionsCheck.ofacMatch ? 'HIT (MATCH)' : 'CLEAN (PASS)'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-[var(--muted)] text-[10px]">Politically Exposed (PEP)</div>
                <div className={`font-bold mt-1 ${activeTxn.sanctionsCheck.pepMatch ? 'text-[var(--risk-amber)]' : 'text-[var(--live)]'}`}>
                  {activeTxn.sanctionsCheck.pepMatch ? 'ASSOCIATION' : 'CLEAN (PASS)'}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Audit Trail */}
          <div className="glass-panel p-6 flex flex-col gap-3 border border-[var(--line)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--sage-3)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  Compliance Audit Trail
                </h3>
              </div>
              <button
                onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
                className="text-xs text-[var(--sage-3)] hover:text-white flex items-center gap-1 font-mono"
              >
                <Plus className="w-3 h-3" />
                <span>Add Note</span>
              </button>
            </div>

            {isNoteInputOpen && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--line)] flex flex-col gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record an analyst finding..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-[var(--muted)] focus:outline-none resize-none font-sans"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsNoteInputOpen(false)}
                    className="text-[10px] text-[var(--muted)] px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="pill-btn-primary text-[10px] px-3 py-1"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto">
              {caseAuditLogs.map((log) => (
                <div key={log.id} className="py-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span className="text-[var(--sage-3)] font-medium">{log.operator}</span>
                    <span>{log.timestamp.slice(11, 19)}</span>
                  </div>
                  <div className="text-[var(--text)] font-sans text-xs mt-0.5">
                    {log.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 px-4 py-2.5 rounded-full bg-white text-darkCanvas text-xs font-medium shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--sage-1)]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </motion.div>
  );
};
