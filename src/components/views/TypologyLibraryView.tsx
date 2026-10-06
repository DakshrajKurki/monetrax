import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Layers, 
  Share2, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';
import { TypologyType } from '../../types';

interface TypologyDefinition {
  id: TypologyType;
  name: string;
  shortCode: string;
  tagline: string;
  regulatoryRef: string;
  mechanism: string;
  indicators: string[];
  algorithmicFeatures: { name: string; weight: string; formula: string }[];
  exampleCorridor: string;
  avgAmount: string;
}

export const TypologyLibraryView: React.FC = () => {
  const navigate = useNavigate();
  const transactions = useAMLStore((s) => s.transactions);
  const setGlobalFilters = useAMLStore((s) => s.setGlobalFilters);
  const addToast = useAMLStore((s) => s.addToast);

  const [selectedTypology, setSelectedTypology] = useState<TypologyType | 'all'>('all');

  // Compute live incident counts per typology from historical transactions
  const incidentCounts = useMemo(() => {
    const counts: Record<string, number> = {
      structuring: 0,
      cyclic_flow: 0,
      mule_fan: 0,
      rapid_passthrough: 0,
      dormant_burst: 0
    };
    transactions.forEach(t => {
      if (counts[t.typology] !== undefined) {
        counts[t.typology]++;
      }
    });
    return counts;
  }, [transactions]);

  const typologies: TypologyDefinition[] = [
    {
      id: 'structuring',
      name: 'Structuring (< $10k Smurfing)',
      shortCode: 'STR-01',
      tagline: 'Deliberate fragmentation of deposits to evade mandatory CTR reporting',
      regulatoryRef: 'FinCEN 31 CFR § 1010.314 & BSA 31 U.S.C. 5324',
      mechanism: 'A primary perpetrator deploys multiple individuals (smurfs) or automated micro-settlements to deposit funds in amounts just below the $10,000 threshold (typically $9,500 - $9,950) into multiple accounts at different branches within a 24-48 hour window.',
      indicators: [
        'Multiple transactions clustered between $9,000 and $9,999 within 72 hours',
        'Abnormal first-digit distribution violating Benford\'s Law',
        'Immediate wire aggregation from multiple branch deposits into a single destination'
      ],
      algorithmicFeatures: [
        { name: 'structuring_score', weight: '+38.2%', formula: 'Exponential CTR proximity kernel: exp(-(10000 - amt) / 500)' },
        { name: 'benford_deviation', weight: '+18.0%', formula: 'Chi-square goodness-of-fit against Benford log10(1 + 1/d)' },
        { name: 'from_count_24h', weight: '+15.4%', formula: 'Count of unique originating counterparty accounts in 24h' }
      ],
      exampleCorridor: 'Miami, US ➔ Panama City, PA',
      avgAmount: '$9,820 / transfer'
    },
    {
      id: 'cyclic_flow',
      name: 'Cyclic Flow (Layering Loop)',
      shortCode: 'CYC-02',
      tagline: 'Circular funds routing (A ➔ B ➔ C ➔ A) to obscure ultimate beneficial ownership',
      regulatoryRef: 'FATF Recommendation 16 (Wire Transfers) & Wolfsberg Principles',
      mechanism: 'Illicit proceeds are passed through a chain of intermediary accounts across diverse banking jurisdictions (e.g. London ➔ Zurich ➔ Singapore ➔ Cyprus ➔ New York), with funds taking a 1-2% deduction at each hop, ultimately returning to an entity controlled by the originator.',
      indicators: [
        'Closed cycle detection in transaction graph within 7-day sliding window',
        'Consistent balance preservation (amount out ~= amount in minus fee haircut)',
        'Rapid turnaround latency (< 4 hours between inward and outward transfer)'
      ],
      algorithmicFeatures: [
        { name: 'cyclic_flow_score', weight: '+32.5%', formula: 'Johnson\'s cycle-finding algorithm over directed temporal multigraph' },
        { name: 'flow_imbalance', weight: '+22.1%', formula: '|Inflow - Outflow| / (Inflow + Outflow) close to 0' },
        { name: 'peer_cohort_zscore', weight: '+8.5%', formula: 'Standardized deviation from baseline institutional velocity' }
      ],
      exampleCorridor: 'London, UK ➔ Zurich, CH ➔ Singapore, SG',
      avgAmount: '$48,500 / hop'
    },
    {
      id: 'mule_fan',
      name: 'Mule Network (Fan-In / Fan-Out)',
      shortCode: 'MUL-03',
      tagline: 'High-degree convergence where multiple retail accounts funnel to single consolidation hub',
      regulatoryRef: 'Egmont Group Financial Intelligence Typologies & EU 5AMLD',
      mechanism: 'Multiple recruited money mules or compromised accounts receive disparate retail payments (P2P, credit card cash-outs, romance scams) and immediately forward the lump sum to a central aggregator or crypto OTC broker.',
      indicators: [
        'Fan-in ratio: >5 unique incoming accounts to 1 outgoing liquidation channel',
        'Retail accounts with sudden velocity jumps exceeding 400% of historical baseline',
        'Geographic dispersion of originators converging onto a single offshore IBAN'
      ],
      algorithmicFeatures: [
        { name: 'from_count_24h', weight: '+28.4%', formula: 'Indegree centrality over 24-hour observation horizon' },
        { name: 'peer_cohort_zscore', weight: '+24.0%', formula: 'Velocity explosion z-score compared to retail cohort' },
        { name: 'flow_imbalance', weight: '+14.6%', formula: 'High inward volume concentration followed by immediate zeroing' }
      ],
      exampleCorridor: 'Toronto, CA ➔ George Town, KY',
      avgAmount: '$14,200 / mule'
    },
    {
      id: 'rapid_passthrough',
      name: 'Rapid Pass-Through (Immediate Liquidation)',
      shortCode: 'RPT-04',
      tagline: 'Zero-dwell time accounts acting purely as frictionless transit conduits',
      regulatoryRef: 'FinCEN Advisory on Shell Companies & Correspondent Banking Guidance',
      mechanism: 'An account maintains a near-zero average balance, but receives large inbound wire transfers that are immediately cleared out via offshore wire or crypto on-ramp within minutes of settlement, leaving negligible closing balance.',
      indicators: [
        'Dwell time of funds under 15 minutes between credit and debit',
        'Near-zero end-of-day ledger balance maintained indefinitely',
        'Absence of legitimate commercial utility overhead (no payroll, utility, or tax payments)'
      ],
      algorithmicFeatures: [
        { name: 'flow_imbalance', weight: '+35.0%', formula: 'Ratio of net retained assets to gross throughput' },
        { name: 'peer_cohort_zscore', weight: '+20.5%', formula: 'Dwell time decay function: exp(-delta_t_minutes / 30)' },
        { name: 'log_amount', weight: '+12.0%', formula: 'Logarithmic magnitude of transit settlement' }
      ],
      exampleCorridor: 'Dubai, AE ➔ Limassol, CY',
      avgAmount: '$125,000 / wire'
    },
    {
      id: 'dormant_burst',
      name: 'Dormant-Then-Burst (Sleeper Activation)',
      shortCode: 'DTB-05',
      tagline: 'Aged dormant shell account suddenly awakened with extreme transactional velocity',
      regulatoryRef: 'FATF Guidance on Concealment of Beneficial Ownership',
      mechanism: 'An entity account created months or years prior with negligible activity is suddenly activated to receive multiple high-value international wires over a 48-hour period before falling dormant again or closing.',
      indicators: [
        '> 180 days of zero activity followed by > $100k throughput in 48 hours',
        'Recent sudden change of authorized corporate signatories or registered address',
        'Disproportionate volume relative to stated business incorporation purpose'
      ],
      algorithmicFeatures: [
        { name: 'peer_cohort_zscore', weight: '+42.0%', formula: 'Burst-to-quiescence ratio: Volume_24h / (Volume_180d + epsilon)' },
        { name: 'log_amount', weight: '+19.5%', formula: 'Log volume scaling above historical baseline' },
        { name: 'benford_deviation', weight: '+11.2%', formula: 'First-digit anomalous distribution on burst batch' }
      ],
      exampleCorridor: 'Frankfurt, DE ➔ Hong Kong, HK',
      avgAmount: '$210,000 / batch'
    }
  ];

  const handleFilterQueue = (typologyId: TypologyType) => {
    setGlobalFilters({ typology: typologyId });
    addToast({
      title: 'Filter Applied',
      message: `Case queue pre-filtered for ${typologyId.toUpperCase()}`,
      type: 'info'
    });
    navigate('/queue');
  };

  const handleReplayPattern = (typologyId: TypologyType) => {
    navigate('/network');
    addToast({
      title: 'Topology Loaded',
      message: `Loaded graph visualization for ${typologyId.toUpperCase()}`,
      type: 'info'
    });
  };

  const filteredTypologies = selectedTypology === 'all' 
    ? typologies 
    : typologies.filter(t => t.id === selectedTypology);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-6 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              AML Typology & Pattern Library
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--sage-2)]/20 text-[var(--sage-2)] font-mono font-medium border border-[var(--sage-2)]/30">
              5 Active Classifiers
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Algorithmic taxonomy of financial crime patterns, mathematical feature formulations, and active live incident counts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="glass-panel p-1 flex items-center gap-1 text-xs flex-wrap">
          <button
            onClick={() => setSelectedTypology('all')}
            className={`px-3 py-1 rounded-full transition-all ${selectedTypology === 'all' ? 'bg-white text-[#0A0D0C] font-semibold' : 'text-[var(--muted)] hover:text-white'}`}
          >
            All Typologies
          </button>
          {typologies.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTypology(t.id)}
              className={`px-3 py-1 rounded-full transition-all ${selectedTypology === t.id ? 'bg-white text-[#0A0D0C] font-semibold' : 'text-[var(--muted)] hover:text-white'}`}
            >
              {t.shortCode}
            </button>
          ))}
        </div>
      </div>

      {/* Typology Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTypologies.map((t) => (
          <div
            key={t.id}
            className="glass-panel p-6 border border-[var(--line)] flex flex-col justify-between hover:border-white/20 transition-all group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--risk-red)] bg-[var(--risk-red)]/10 px-2 py-0.5 rounded border border-[var(--risk-red)]/20">
                      {t.shortCode}
                    </span>
                    <h3 className="text-base font-medium text-white">
                      {t.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--muted)] font-light mt-1">
                    {t.tagline}
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="text-xl font-bold text-white block">
                    {incidentCounts[t.id] || 0}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] block">
                    Live Incidents
                  </span>
                </div>
              </div>

              {/* Regulatory Reference */}
              <div className="my-3 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[var(--line)] flex items-center gap-2 text-xs font-mono text-[var(--sage-3)]">
                <ShieldAlert className="w-3.5 h-3.5 text-[var(--sage-2)] shrink-0" />
                <span>Regulatory: {t.regulatoryRef}</span>
              </div>

              {/* Mechanism Description */}
              <div className="text-xs text-[var(--text)] font-light leading-relaxed mb-4">
                {t.mechanism}
              </div>

              {/* Algorithmic Features */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-mono text-[var(--muted)] block mb-2">
                  Key Algorithmic SHAP Attribution Weights
                </span>
                <div className="space-y-1.5">
                  {t.algorithmicFeatures.map((f, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-[var(--line)] text-xs font-mono">
                      <div className="flex justify-between items-center text-white">
                        <span className="font-medium text-[var(--sage-2)]">{f.name}</span>
                        <span className="text-[var(--risk-red)] font-bold">{f.weight}</span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5 font-light">
                        {f.formula}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Empirical Indicators */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-mono text-[var(--muted)] block mb-2">
                  Observed Behavioral Signatures
                </span>
                <ul className="space-y-1 text-xs text-[var(--muted)] font-light">
                  {t.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[var(--sage-2)] mt-1.5 shrink-0" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
              <button
                onClick={() => handleReplayPattern(t.id)}
                className="pill-btn-secondary text-xs flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-[var(--sage-2)]" />
                <span>Replay in Graph</span>
              </button>

              <button
                onClick={() => handleFilterQueue(t.id)}
                className="pill-btn-primary text-xs flex items-center gap-1.5"
              >
                <span>View Filtered Cases</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
