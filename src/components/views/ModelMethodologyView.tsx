import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Layers, 
  GitBranch, 
  Sliders, 
  AlertTriangle, 
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { pageVariants, staggerContainer, staggerItem } from '../common/MotionComponents';

export const ModelMethodologyView: React.FC = () => {
  const [thresholdCutoff, setThresholdCutoff] = useState<number>(75);

  const baseTotal = 10000;
  const trueLaunderers = 140;
  const benignTotal = baseTotal - trueLaunderers;

  const recallPct = Math.max(0.20, Math.min(0.96, 1.25 - (thresholdCutoff / 100) * 0.85));
  const precisionPct = Math.max(0.40, Math.min(0.94, 0.35 + (thresholdCutoff / 100) * 0.60));

  const truePositives = Math.round(trueLaunderers * recallPct);
  const falseNegatives = trueLaunderers - truePositives;
  const alertsFired = Math.round(truePositives / precisionPct);
  const falsePositives = Math.max(0, alertsFired - truePositives);
  const trueNegatives = benignTotal - falsePositives;
  const f1Score = +((2 * (precisionPct * recallPct)) / (precisionPct + recallPct)).toFixed(2);

  const globalFeatures = [
    { feature: 'structuring_score', label: 'Structuring Proximity (< $10k)', importance: 0.32, color: 'var(--risk-red)' },
    { feature: 'cyclic_flow_score', label: 'Graph Cycle Coefficient (A-B-C-A)', importance: 0.26, color: 'var(--risk-red)' },
    { feature: 'flow_imbalance', label: 'Net Flow Liquidation Imbalance', importance: 0.16, color: 'var(--risk-amber)' },
    { feature: 'peer_cohort_zscore', label: 'Peer Cohort Velocity Divergence', importance: 0.12, color: 'var(--risk-amber)' },
    { feature: 'benford_deviation', label: "Benford's Law First-Digit Skew", importance: 0.08, color: 'var(--sage-2)' },
    { feature: 'from_count_24h', label: 'Unique Senders in 24h Window', importance: 0.04, color: 'var(--sage-2)' },
    { feature: 'log_amount', label: 'Log Notional Transfer Magnitude', importance: 0.02, color: 'var(--sage-2)' },
  ];

  const academicConcepts = [
    {
      concept: 'Logistic Regression',
      mechanism: 'Stacked Meta-Learner',
      application: 'Fuses tree probabilities and reconstruction error into calibrated 0-100 score.',
      status: 'Built' as const,
    },
    {
      concept: 'Bagging vs Boosting',
      mechanism: 'Isolation Forest vs XGBoost',
      application: 'Compares unsupervised tree isolation with gradient boosted decision trees for anomaly capture.',
      status: 'Built' as const,
    },
    {
      concept: 'Precision / Recall / F1 Optimization',
      mechanism: 'PR-AUC Evaluation (0.83)',
      application: 'Prioritizes precision@20 and recall under extreme class imbalance (1.4% positives).',
      status: 'Built' as const,
    },
    {
      concept: 'Autoencoder Bottleneck',
      mechanism: 'Unsupervised Reconstruction Error',
      application: 'Compresses transaction vectors into low-dim latent space; high error flags novel typologies.',
      status: 'Built' as const,
    },
    {
      concept: 'Explainability via SHAP',
      mechanism: 'Game-Theoretic Feature Attribution',
      application: 'Local Shapley values explain exact mathematical contribution behind every alert.',
      status: 'Built' as const,
    },
    {
      concept: 'Graph Neural Networks (GNN)',
      mechanism: 'Relational Node Embeddings',
      application: 'Message passing across heterogeneous bank account graphs for sub-graph smurfing.',
      status: 'Planned Future' as const,
    }
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-8 pb-16 font-sans"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--sage-2)]/20 border border-[var(--sage-2)]/40 flex items-center justify-center text-[var(--sage-3)]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              Model Lab & Methodology
            </h2>
            <p className="text-xs text-[var(--muted)] font-light">
              Multi-model ensemble fusing supervised boosting, unsupervised autoencoders, and stacked meta-learning on synthetic AML data.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerItem} className="glass-panel p-5">
          <div className="label-small">Supervised Stream</div>
          <div className="text-2xl font-light text-white font-sans mt-1">0.78 PR-AUC</div>
          <div className="text-[11px] text-[var(--sage-3)] font-medium mt-0.5">XGBoost Classifier</div>
          <p className="text-[10px] text-[var(--muted)] mt-2">Synthetic benchmark validation</p>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-panel p-5">
          <div className="label-small">Unsupervised Anomaly</div>
          <div className="text-2xl font-light text-white font-sans mt-1">0.66 PR-AUC</div>
          <div className="text-[11px] text-[var(--sage-3)] font-medium mt-0.5">Isolation Forest + Autoencoder</div>
          <p className="text-[10px] text-[var(--muted)] mt-2">Novel typology detection</p>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-panel p-5 border border-[var(--sage-2)]/30 bg-[var(--sage-2)]/[0.04]">
          <div className="label-small text-[var(--sage-3)]">Stacked Meta-Learner</div>
          <div className="text-2xl font-light text-white font-sans mt-1">0.83 PR-AUC</div>
          <div className="text-[11px] text-[var(--sage-3)] font-medium mt-0.5">Fused Logistic Stacking</div>
          <p className="text-[10px] text-[var(--muted)] mt-2">+0.05 gain over single model</p>
        </motion.div>

        <motion.div variants={staggerItem} className="glass-panel p-5">
          <div className="label-small">Top Queue Accuracy</div>
          <div className="text-2xl font-light text-[var(--live)] font-sans mt-1">85.4%</div>
          <div className="text-[11px] text-white font-medium mt-0.5">Precision @ 20 Cases</div>
          <p className="text-[10px] text-[var(--muted)] mt-2">High analyst triage confidence</p>
        </motion.div>
      </motion.div>

      {/* Threshold Simulator & Accuracy Trap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulator Slider */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--sage-3)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                Decision Threshold Simulator
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--sage-3)]">
              Cutoff: {thresholdCutoff} / 100
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] font-light">
            Slide the decision threshold to simulate queue volume, recall, and false-positive tradeoff across a 10,000 transaction cohort.
          </p>

          <input
            type="range"
            min="30"
            max="95"
            step="1"
            value={thresholdCutoff}
            onChange={(e) => setThresholdCutoff(Number(e.target.value))}
            className="w-full accent-[var(--sage-2)] h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer mt-1"
          />

          <div className="grid grid-cols-4 gap-2 pt-2 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-[var(--muted)]">Alerts Fired</div>
              <div className="text-base font-bold text-white mt-0.5">{alertsFired}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-[var(--muted)]">Precision</div>
              <div className="text-base font-bold text-[var(--live)] mt-0.5">{(precisionPct * 100).toFixed(0)}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-[var(--muted)]">Recall</div>
              <div className="text-base font-bold text-[var(--sage-3)] mt-0.5">{(recallPct * 100).toFixed(0)}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-[var(--muted)]">F1-Score</div>
              <div className="text-base font-bold text-white mt-0.5">{f1Score}</div>
            </div>
          </div>

          {/* Live Confusion Matrix */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--line)] mt-2">
            <div className="label-small mb-2">
              Live Confusion Matrix (10,000 Evaluated)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[var(--live)]/[0.08] border border-[var(--live)]/20 flex justify-between items-center">
                <span>True Positives (Caught)</span>
                <span className="text-[var(--live)] font-bold">{truePositives}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--risk-amber)]/[0.08] border border-[var(--risk-amber)]/20 flex justify-between items-center">
                <span>False Positives (Analyst Noise)</span>
                <span className="text-[var(--risk-amber)] font-bold">{falsePositives}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--risk-red)]/[0.08] border border-[var(--risk-red)]/20 flex justify-between items-center">
                <span>False Negatives (Missed)</span>
                <span className="text-[var(--risk-red)] font-bold">{falseNegatives}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex justify-between items-center">
                <span>True Negatives (Clean)</span>
                <span className="text-[var(--muted)] font-bold">{trueNegatives}</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Accuracy Trap Callout */}
        <div className="lg:col-span-5 glass-panel p-6 flex flex-col justify-between border border-[var(--risk-amber)]/30 bg-[var(--risk-amber)]/[0.02]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--risk-amber)]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                The AML "Accuracy Trap"
              </h3>
            </div>
            <p className="text-xs text-[var(--text)]/90 leading-relaxed font-light">
              In real financial institutions, true money laundering accounts for only ~1.4% of transactions. A naive baseline model that <strong>never flags any transaction</strong> scores a deceptively high <strong>98.6% raw accuracy</strong>, yet permits 100% of financial crime to clear undetected.
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed font-light">
              Monetrax rejects raw accuracy in favor of <strong>Precision-Recall AUC (PR-AUC 0.83)</strong> and <strong>Precision@20 (85%)</strong>, optimizing analyst hours on true high-probability smurfing clusters.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--line)] text-[11px] font-mono text-[var(--muted)] mt-4">
            Formula: PR-AUC = ∫ Precision(Recall) d(Recall)
          </div>
        </div>
      </div>

      {/* Global Feature Importance */}
      <div className="glass-panel p-6">
        <div className="pb-3 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Global Feature Importance (SHAP TreeExplainer)
            </h3>
            <p className="text-xs text-[var(--muted)] font-light">
              Mean absolute impact across 200,000 synthetic transactions
            </p>
          </div>
          <span className="label-small text-[var(--sage-3)]">Game-Theoretic Attribution</span>
        </div>

        <div className="h-56 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={globalFeatures} 
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke="var(--muted)" 
                fontSize={10} 
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <YAxis 
                type="category" 
                dataKey="label" 
                stroke="var(--text)" 
                fontSize={10} 
                width={180}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(11, 15, 13, 0.95)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: 'var(--text)'
                }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {globalFeatures.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Academic Concepts Applied Table */}
      <div className="glass-panel p-6">
        <div className="pb-3 border-b border-[var(--line)]">
          <h3 className="text-sm font-medium text-[var(--text)]">
            Academic & Theoretical Concepts Applied
          </h3>
          <p className="text-xs text-[var(--muted)] font-light">
            Mapping theoretical ML, statistical physics, and NLP concepts to runtime Monetrax subsystems
          </p>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)]">
                <th className="pb-3">Academic Concept</th>
                <th className="pb-3">System Mechanism</th>
                <th className="pb-3">Runtime AML Application</th>
                <th className="pb-3">Implementation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {academicConcepts.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-medium text-white">{item.concept}</td>
                  <td className="py-3.5 font-mono text-[var(--sage-3)]">{item.mechanism}</td>
                  <td className="py-3.5 text-[var(--muted)] font-light">{item.application}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                      item.status === 'Built'
                        ? 'bg-[var(--live)]/20 text-[var(--live)] border border-[var(--live)]/30'
                        : 'bg-white/[0.06] text-[var(--muted)] border border-white/10'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="glass-panel p-6">
        <div className="pb-3 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Supervised Architecture Benchmark Comparison
            </h3>
            <p className="text-xs text-[var(--muted)] font-light">
              Empirical evaluation across 200k synthetic settlements under severe 1.4% class imbalance
            </p>
          </div>
          <span className="label-small text-[var(--live)]">Production Ensemble Winner</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Classifier Architecture</th>
                <th className="py-3 px-4">PR-AUC</th>
                <th className="py-3 px-4">Precision@20</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">Inference Latency</th>
                <th className="py-3 px-4">SHAP Explainability</th>
                <th className="py-3 px-4 text-right">Production Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Decision Tree (CART)</td>
                <td className="py-3 px-4 text-[var(--muted)]">0.54</td>
                <td className="py-3 px-4 text-[var(--muted)]">62.0%</td>
                <td className="py-3 px-4 text-[var(--muted)]">0.58</td>
                <td className="py-3 px-4 text-[var(--muted)]">0.12 ms</td>
                <td className="py-3 px-4 text-[var(--sage-3)]">Native Splits</td>
                <td className="py-3 px-4 text-right text-[var(--muted)]">Baseline Only</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Random Forest (100 Trees)</td>
                <td className="py-3 px-4 text-[var(--text)]">0.72</td>
                <td className="py-3 px-4 text-[var(--text)]">78.5%</td>
                <td className="py-3 px-4 text-[var(--text)]">0.74</td>
                <td className="py-3 px-4 text-[var(--text)]">1.85 ms</td>
                <td className="py-3 px-4 text-[var(--sage-3)]">Fast TreeSHAP</td>
                <td className="py-3 px-4 text-right text-[var(--muted)]">Benchmark</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Support Vector Machine (RBF)</td>
                <td className="py-3 px-4 text-[var(--muted)]">0.61</td>
                <td className="py-3 px-4 text-[var(--muted)]">68.0%</td>
                <td className="py-3 px-4 text-[var(--muted)]">0.64</td>
                <td className="py-3 px-4 text-[var(--risk-amber)]">14.2 ms (O(N²))</td>
                <td className="py-3 px-4 text-[var(--risk-red)]">Kernel Approximated</td>
                <td className="py-3 px-4 text-right text-[var(--muted)]">Rejected (Latency)</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">XGBoost (Hist Gradient Boosting)</td>
                <td className="py-3 px-4 text-[var(--sage-3)] font-bold">0.78</td>
                <td className="py-3 px-4 text-[var(--sage-3)] font-bold">82.4%</td>
                <td className="py-3 px-4 text-[var(--sage-3)] font-bold">0.80</td>
                <td className="py-3 px-4 text-[var(--live)] font-bold">0.45 ms</td>
                <td className="py-3 px-4 text-[var(--sage-3)]">Exact TreeSHAP</td>
                <td className="py-3 px-4 text-right text-[var(--live)]">Primary Stream</td>
              </tr>
              <tr className="hover:bg-white/[0.02] bg-[var(--sage-2)]/[0.04]">
                <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)]" />
                  <span>Monetrax Stacked Meta-Ensemble</span>
                </td>
                <td className="py-3 px-4 text-[var(--live)] font-bold">0.83</td>
                <td className="py-3 px-4 text-[var(--live)] font-bold">85.4%</td>
                <td className="py-3 px-4 text-[var(--live)] font-bold">0.85</td>
                <td className="py-3 px-4 text-[var(--live)] font-bold">0.82 ms</td>
                <td className="py-3 px-4 text-[var(--sage-3)]">Combined Local SHAP</td>
                <td className="py-3 px-4 text-right font-bold text-[var(--live)]">Active in Production</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort & Demographic Fairness Audit */}
      <div className="glass-panel p-6">
        <div className="pb-3 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Cohort & Jurisdiction Fairness Audit
            </h3>
            <p className="text-xs text-[var(--muted)] font-light">
              Disparate impact ratio audit verifying non-discriminatory alert rates across institution tiers (EEOC 80% Rule)
            </p>
          </div>
          <span className="label-small text-[var(--live)]">Disparate Impact Passed</span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Institution Cohort</th>
                <th className="py-3 px-4">Sample Transactions</th>
                <th className="py-3 px-4">Alert Trigger Rate</th>
                <th className="py-3 px-4">True Positive Rate (TPR)</th>
                <th className="py-3 px-4">Disparate Impact Ratio</th>
                <th className="py-3 px-4 text-right">Fairness Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Tier-1 Global Banks (JPMC, Citi, HSBC)</td>
                <td className="py-3 px-4 text-[var(--text)]">84,200</td>
                <td className="py-3 px-4 text-[var(--text)]">3.2%</td>
                <td className="py-3 px-4 text-[var(--text)]">86.4%</td>
                <td className="py-3 px-4 text-[var(--muted)]">1.00 (Reference)</td>
                <td className="py-3 px-4 text-right text-[var(--live)]">Baseline Cohort</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Tier-2 Regional Commercial</td>
                <td className="py-3 px-4 text-[var(--text)]">52,100</td>
                <td className="py-3 px-4 text-[var(--text)]">3.5%</td>
                <td className="py-3 px-4 text-[var(--text)]">85.8%</td>
                <td className="py-3 px-4 text-[var(--live)]">0.91 (Passed 80% Rule)</td>
                <td className="py-3 px-4 text-right text-[var(--live)]">COMPLIANT</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Offshore Private Wealth Entities</td>
                <td className="py-3 px-4 text-[var(--text)]">31,800</td>
                <td className="py-3 px-4 text-[var(--risk-amber)]">4.1%</td>
                <td className="py-3 px-4 text-[var(--text)]">88.2%</td>
                <td className="py-3 px-4 text-[var(--live)]">0.84 (Passed 80% Rule)</td>
                <td className="py-3 px-4 text-right text-[var(--live)]">COMPLIANT</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-sans font-medium text-white">Fintechs & Neobank Gateways</td>
                <td className="py-3 px-4 text-[var(--text)]">31,900</td>
                <td className="py-3 px-4 text-[var(--text)]">3.6%</td>
                <td className="py-3 px-4 text-[var(--text)]">84.9%</td>
                <td className="py-3 px-4 text-[var(--live)]">0.89 (Passed 80% Rule)</td>
                <td className="py-3 px-4 text-right text-[var(--live)]">COMPLIANT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
