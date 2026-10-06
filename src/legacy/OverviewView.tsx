import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  ShieldAlert, AlertTriangle, FileCheck, Award, Sliders, ArrowUpRight, 
  TrendingUp, Radio, Play, RotateCcw, RotateCw, Database, Cpu, 
  CheckCircle2, Lock, Sparkles, Terminal, Activity, Layers
} from 'lucide-react';
import { Transaction, PipelineStatus } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';

interface OverviewViewProps {
  transactions: Transaction[];
  onSelectTxn: (txnId: string) => void;
  onNavigateToQueue: () => void;
  pipelineStatus: PipelineStatus;
  onRunPipeline: () => void;
  onResetDataset: () => void;
}

// 7-day trend mock data
const TREND_DATA = [
  { day: 'Jan 08', total: 1840, flagged: 4 },
  { day: 'Jan 09', total: 2210, flagged: 6 },
  { day: 'Jan 10', total: 1950, flagged: 5 },
  { day: 'Jan 11', total: 2120, flagged: 7 },
  { day: 'Jan 12', total: 2480, flagged: 9 },
  { day: 'Jan 13', total: 2390, flagged: 8 },
  { day: 'Jan 14', total: 2810, flagged: 12 }
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  transactions,
  onSelectTxn,
  onNavigateToQueue,
  pipelineStatus,
  onRunPipeline,
  onResetDataset,
}) => {
  // Animated KPI numbers on analyzed state
  const [alertsCount, setAlertsCount] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [sarsCount, setSarsCount] = useState(0);

  // False-positive threshold simulator slider
  const [threshold, setThreshold] = useState<number>(75);

  // Running progress state
  const [runProgress, setRunProgress] = useState<number>(0);
  const [runStepIndex, setRunStepIndex] = useState<number>(0);

  const RUN_STEPS = [
    'Ingesting 1,420 transaction records from IBM Kaggle AML bus...',
    'Extracting temporal features: velocity_zscore, cross_border, fan_out...',
    'Evaluating Supervised XGBoost classifier on 16 feature dimensions...',
    'Running Unsupervised Isolation Forest (100 multidimensional isolation trees)...',
    'Calibrating Stacked Meta-Learner Unified Risk Scores (0-100)...',
    'Synthesizing GenAI SAR narratives for 9 critical anomalies...',
    'Surveillance pipeline complete. Unlocking command center telemetry.'
  ];

  // Animate progress when pipeline is running
  useEffect(() => {
    if (pipelineStatus === 'running') {
      setRunProgress(5);
      setRunStepIndex(0);

      const interval = setInterval(() => {
        setRunProgress((prev) => {
          if (prev >= 98) {
            clearInterval(interval);
            return 98;
          }
          const next = prev + Math.floor(Math.random() * 18) + 10;
          return Math.min(next, 98);
        });
      }, 200);

      const stepInterval = setInterval(() => {
        setRunStepIndex((idx) => Math.min(idx + 1, RUN_STEPS.length - 1));
      }, 240);

      return () => {
        clearInterval(interval);
        clearInterval(stepInterval);
      };
    } else if (pipelineStatus === 'analyzed') {
      setRunProgress(100);
      setRunStepIndex(RUN_STEPS.length - 1);
    } else {
      setRunProgress(0);
      setRunStepIndex(0);
    }
  }, [pipelineStatus]);

  // Animate KPI counters when entering analyzed state
  useEffect(() => {
    if (pipelineStatus === 'analyzed') {
      const duration = 1000;
      const steps = 25;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setAlertsCount(Math.floor(progress * 42));
        setHighRiskCount(Math.floor(progress * 8));
        setSarsCount(Math.floor(progress * 14));

        if (step >= steps) {
          clearInterval(timer);
          setAlertsCount(42);
          setHighRiskCount(8);
          setSarsCount(14);
        }
      }, interval);

      return () => clearInterval(timer);
    } else {
      setAlertsCount(0);
      setHighRiskCount(0);
      setSarsCount(0);
    }
  }, [pipelineStatus]);

  // Threshold simulator calculations
  const simulatedAlerts = Math.max(1, Math.round(transactions.filter(t => t.risk_score >= threshold).length * (42 / 8)));
  const estimatedPrecision = Math.min(99, Math.max(45, Math.round(55 + (threshold - 30) * 0.55)));
  const estimatedRecall = Math.min(99, Math.max(40, Math.round(98 - (threshold - 30) * 0.75)));

  // Risk distribution donut data
  const DONUT_DATA = [
    { name: 'Low Risk (<40)', value: 64, color: '#0E7C86' },
    { name: 'Medium Risk (40-69)', value: 22, color: '#E8A33D' },
    { name: 'High Risk (70-89)', value: 10, color: '#F3A638' },
    { name: 'Critical (≥90)', value: 4, color: '#C1432E' }
  ];

  const recentAlerts = transactions
    .filter(t => t.risk_score >= 70)
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Top Header & Execution Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {pipelineStatus === 'analyzed' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                  Surveillance Engine Active (1,420 Scored)
                </span>
              </>
            ) : pipelineStatus === 'running' ? (
              <>
                <RotateCw className="w-3.5 h-3.5 text-command-tealGlow animate-spin" />
                <span className="text-[11px] font-mono tracking-widest text-command-tealGlow uppercase font-bold">
                  Executing Hybrid Ensemble Pipeline...
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                  Surveillance Engine Standby — Awaiting Execution
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Financial Crime Command Center
          </h1>
          <p className="text-sm text-command-muted mt-1 max-w-2xl">
            Real-time multi-model surveillance scoring transaction velocity, structuring patterns, and 3D graph topologies against the Kaggle IBM AML benchmark.
          </p>
        </div>

        {/* Action Buttons: Run Pipeline & Reset Dataset */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetDataset}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-command-panel border border-command-border/80 hover:border-red-500/50 hover:bg-red-500/10 text-command-muted hover:text-red-300 font-mono text-xs transition-all active:scale-95"
            title="Reset dataset & return to standby"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Reset Dataset</span>
          </button>

          {pipelineStatus === 'standby' ? (
            <button
              onClick={onRunPipeline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-command-teal to-teal-500 hover:from-command-tealGlow hover:to-command-teal text-white hover:text-command-dark font-mono font-bold text-xs shadow-glow-teal transition-all active:scale-95 animate-pulse"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run AML Surveillance Pipeline</span>
            </button>
          ) : pipelineStatus === 'running' ? (
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-command-dark border border-command-tealGlow/60 text-command-tealGlow font-mono text-xs cursor-wait opacity-90"
            >
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Scoring Pipeline ({runProgress}%)...</span>
            </button>
          ) : (
            <button
              onClick={onRunPipeline}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-command-dark/90 border border-command-teal/70 hover:border-command-tealGlow text-command-tealGlow font-mono text-xs transition-all active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>Re-Run Pipeline</span>
            </button>
          )}

          {pipelineStatus === 'analyzed' && (
            <button
              onClick={onNavigateToQueue}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-command-teal hover:bg-command-tealGlow text-white hover:text-command-dark font-medium text-xs shadow-glow-teal transition-all duration-200 font-mono"
            >
              <span>Case Queue (8 Urgent)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PIPELINE RUNNING: High-Tech Execution Telemetry Modal / HUD */}
      {pipelineStatus === 'running' && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-command-panel via-command-card to-command-panel border border-command-tealGlow/50 shadow-glow-teal font-mono animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-command-teal/20 text-command-tealGlow flex items-center justify-center border border-command-teal/40">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Executing Hybrid Ensemble ML Engine</span>
                  <span className="text-[10px] text-command-tealGlow bg-command-teal/20 px-2 py-0.5 rounded border border-command-teal/40">
                    LIVE CALCULATION
                  </span>
                </h3>
                <p className="text-xs text-command-muted">
                  Processing 1,420 transaction vectors across XGBoost + Isolation Forest + Stacked Meta-Learner
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-command-tealGlow">{runProgress}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-command-dark/80 rounded-full h-3 mb-4 overflow-hidden border border-command-border/60">
            <div 
              className="bg-gradient-to-r from-command-teal via-command-tealGlow to-emerald-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${runProgress}%` }}
            />
          </div>

          {/* Live Pipeline Steps Terminal Output */}
          <div className="rounded-lg bg-command-dark/90 border border-command-border/60 p-3 space-y-1.5 text-xs text-command-muted">
            <div className="flex items-center gap-2 text-command-tealGlow font-bold text-[11px] pb-1 border-b border-command-border/40">
              <Terminal className="w-3.5 h-3.5" />
              <span>KERNEL EXECUTION LOG:</span>
            </div>
            {RUN_STEPS.slice(0, runStepIndex + 1).map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className={idx === runStepIndex ? "text-white font-bold animate-pulse" : "text-command-muted"}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PIPELINE STANDBY: Dataset Specifications & Primed Staging Banner */}
      {pipelineStatus === 'standby' && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-command-panel via-command-card to-command-panel border border-amber-500/40 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                  DATASET PRIMED & STAGED
                </span>
                <span className="text-xs font-mono text-command-muted">
                  Status: Ready for Surveillance Run
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-white">
                IBM AML Kaggle Core Dataset Loaded (1,420 Transactions)
              </h2>
              <p className="text-xs text-command-muted max-w-2xl leading-relaxed">
                Raw transaction logs and network graph entities are loaded in memory. The stacked ensemble (Supervised XGBoost + Unsupervised Isolation Forest) is awaiting execution. Click <strong className="text-command-tealGlow">"Run AML Surveillance Pipeline"</strong> to process features, calculate risk distributions, and isolate money laundering typologies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onResetDataset}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-command-dark/80 border border-command-border/60 hover:border-red-500/40 text-command-muted hover:text-white font-mono text-xs transition-all"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Reset Dataset</span>
              </button>
              <button
                onClick={onRunPipeline}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-command-teal to-teal-500 hover:from-command-tealGlow hover:to-command-teal text-white hover:text-command-dark font-mono font-bold text-sm shadow-glow-teal transition-all active:scale-95 animate-pulse"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>⚡ Run AML Surveillance Pipeline</span>
              </button>
            </div>
          </div>

          {/* Staging Pipeline Architecture Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-command-border/40 font-mono text-xs">
            <div className="p-3 rounded-lg bg-command-dark/60 border border-command-border/40">
              <div className="flex items-center gap-2 text-command-muted mb-1">
                <Database className="w-3.5 h-3.5 text-command-tealGlow" />
                <span className="text-[11px] font-bold">DATASET REPOSITORY</span>
              </div>
              <div className="text-white font-bold">IBM Kaggle AML Core</div>
              <div className="text-[11px] text-command-tealGlow mt-0.5">1,420 Records / 18 Accounts</div>
            </div>

            <div className="p-3 rounded-lg bg-command-dark/60 border border-command-border/40">
              <div className="flex items-center gap-2 text-command-muted mb-1">
                <Cpu className="w-3.5 h-3.5 text-command-tealGlow" />
                <span className="text-[11px] font-bold">SUPERVISED MODEL</span>
              </div>
              <div className="text-white font-bold">XGBoost Classifier v2.4</div>
              <div className="text-[11px] text-command-muted mt-0.5">Known typologies (PR-AUC 0.78)</div>
            </div>

            <div className="p-3 rounded-lg bg-command-dark/60 border border-command-border/40">
              <div className="flex items-center gap-2 text-command-muted mb-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold">UNSUPERVISED MODEL</span>
              </div>
              <div className="text-white font-bold">Isolation Forest v1.1</div>
              <div className="text-[11px] text-command-muted mt-0.5">Zero-day outliers (PR-AUC 0.66)</div>
            </div>

            <div className="p-3 rounded-lg bg-command-dark/60 border border-command-border/40">
              <div className="flex items-center gap-2 text-command-muted mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold">FUSED ENSEMBLE</span>
              </div>
              <div className="text-white font-bold">Stacked Meta-Learner</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">PR-AUC 0.83 (+0.05 Lift)</div>
            </div>
          </div>
        </div>
      )}

      {/* PIPELINE ANALYZED: Execution Completion Header Banner */}
      {pipelineStatus === 'analyzed' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-white font-bold">Surveillance Run Complete: </span>
              <span className="text-emerald-300">1,420 Transactions Scored in 184ms | 9 Critical Anomalies Isolated | False-Positive Rate: 3.8%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDataset}
              className="px-3 py-1.5 rounded bg-command-dark/80 border border-command-border/60 hover:border-red-500/50 hover:bg-red-500/10 text-command-muted hover:text-red-300 transition-colors text-[11px]"
            >
              ↺ Reset Dataset
            </button>
            <button
              onClick={onRunPipeline}
              className="px-3 py-1.5 rounded bg-command-teal/20 border border-command-tealGlow/40 hover:bg-command-teal hover:text-white text-command-tealGlow transition-colors text-[11px] font-bold"
            >
              ↻ Re-Run
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSIGHTS SECTION: ONLY REVEALED WHEN PIPELINE IS ANALYZED */}
      {/* ========================================================================= */}

      {pipelineStatus === 'analyzed' ? (
        <div className="space-y-8 animate-fadeIn">
          {/* 4 Animated KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Alerts Today */}
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/70 relative overflow-hidden group hover:border-command-teal/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-command-muted">
                  Alerts Today
                </span>
                <div className="w-8 h-8 rounded-lg bg-command-teal/20 text-command-tealGlow flex items-center justify-center relative">
                  <Radio className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-command-tealGlow animate-ping" />
                </div>
              </div>
              <div className="text-4xl font-serif font-bold text-white mb-2 font-mono flex items-baseline gap-2">
                <span>{alertsCount}</span>
                <span className="text-xs font-sans text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  +12.4%
                </span>
              </div>
              <div className="text-xs text-command-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Streaming live from Ingestion Bus</span>
              </div>
            </div>

            {/* KPI 2: High Risk Flags */}
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/70 relative overflow-hidden group hover:border-command-red/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-command-muted">
                  High-Risk Flags
                </span>
                <div className="w-8 h-8 rounded-lg bg-command-red/20 text-[#FF6B6B] flex items-center justify-center shadow-glow-red">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-serif font-bold text-white mb-2 font-mono flex items-baseline gap-2">
                <span className="text-[#FF6B6B]">{highRiskCount}</span>
                <span className="text-xs font-sans text-command-red font-semibold bg-command-red/10 px-2 py-0.5 rounded border border-command-red/30">
                  3 Critical
                </span>
              </div>
              <div className="text-xs text-command-muted">
                Immediate SAR escalation required
              </div>
            </div>

            {/* KPI 3: SARs Filed */}
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/70 relative overflow-hidden group hover:border-command-amber/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-command-muted">
                  SARs Filed (MTD)
                </span>
                <div className="w-8 h-8 rounded-lg bg-command-amber/20 text-command-amber flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-serif font-bold text-white mb-2 font-mono flex items-baseline gap-2">
                <span>{sarsCount}</span>
                <span className="text-xs font-sans text-command-amber font-semibold bg-command-amber/10 px-2 py-0.5 rounded border border-command-amber/30">
                  +3 Today
                </span>
              </div>
              <div className="text-xs text-command-muted">
                Signed by Dakshraj Singh (Owner)
              </div>
            </div>

            {/* KPI 4: Model PR-AUC */}
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/70 relative overflow-hidden group hover:border-command-tealGlow/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-command-muted">
                  Model PR-AUC
                </span>
                <div className="w-8 h-8 rounded-lg bg-command-teal/20 text-command-tealGlow flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-serif font-bold text-white mb-2 font-mono flex items-baseline gap-2">
                <span className="text-command-tealGlow">0.83</span>
                <span className="text-xs font-sans text-command-tealGlow font-bold bg-command-teal/20 px-2 py-0.5 rounded border border-command-teal/40">
                  Fused Ensemble
                </span>
              </div>
              <div className="text-xs text-command-muted">
                XGBoost 0.78 | Isolation Forest 0.66
              </div>
            </div>
          </div>

          {/* Interactive False-Positive Threshold Simulator */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-command-panel via-command-card to-command-panel border border-command-border/80 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-command-teal/20 text-command-tealGlow border border-command-teal/40">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <span>False-Positive Threshold Simulator</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-command-subtle text-command-tealGlow">
                      Interactive Calibrator
                    </span>
                  </h3>
                  <p className="text-xs text-command-muted">
                    Simulate how adjusting the stacked meta-learner decision threshold affects analyst queue volume and precision.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div className="text-right">
                  <span className="text-command-muted block">Simulated Daily Alerts:</span>
                  <strong className="text-lg text-white font-bold">{simulatedAlerts}</strong>
                </div>
                <div className="text-right">
                  <span className="text-command-muted block">Estimated Precision:</span>
                  <strong className="text-lg text-command-tealGlow font-bold">{estimatedPrecision}%</strong>
                </div>
                <div className="text-right">
                  <span className="text-command-muted block">Estimated Recall:</span>
                  <strong className="text-lg text-emerald-400 font-bold">{estimatedRecall}%</strong>
                </div>
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-command-muted">
                <span>Aggressive (Score ≥ 30)</span>
                <span className="text-command-tealGlow font-bold">Cutoff Score: {threshold} / 100</span>
                <span>Conservative (Score ≥ 95)</span>
              </div>
              <input
                type="range"
                min={30}
                max={95}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-2 bg-command-dark rounded-lg appearance-none cursor-pointer accent-command-tealGlow"
              />
            </div>
          </div>

          {/* 2D Charts: Trend + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Area Chart (2 Cols) */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-command-panel border border-command-border/70">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    Alert Ingestion Trend (7 Days)
                  </h3>
                  <p className="text-xs text-command-muted">
                    Daily transaction processing intake vs high-risk flags
                  </p>
                </div>
                <span className="text-xs font-mono text-command-tealGlow flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +18% 7d volume
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="flaggedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C1432E" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#C1432E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0E7C86" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0E7C86" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#7C8DA0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#7C8DA0" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B1F3A', borderColor: '#1E3C66', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#E8EEF2' }}
                    />
                    <Area type="monotone" dataKey="flagged" stroke="#C1432E" strokeWidth={2.5} fillOpacity={1} fill="url(#flaggedGrad)" name="Flagged Alerts" />
                    <Area type="monotone" dataKey="total" stroke="#2DD4C8" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#totalGrad)" name="Total Ingestion (x100)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Donut (1 Col) */}
            <div className="p-6 rounded-xl bg-command-panel border border-command-border/70 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white mb-1">
                  Risk Band Distribution
                </h3>
                <p className="text-xs text-command-muted mb-4">
                  Breakdown across 1,420 current window transactions
                </p>
              </div>

              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B1F3A" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B1F3A', borderColor: '#1E3C66', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#E8EEF2' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-serif font-bold text-white font-mono">1,420</span>
                  <span className="text-[10px] uppercase tracking-wider text-command-muted">Scored</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-command-border/40">
                {DONUT_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-command-muted truncate text-[11px]">{item.name}: <strong>{item.value}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top 5 Recent Urgent Alerts Preview Table */}
          <div className="p-6 rounded-xl bg-command-panel border border-command-border/70">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Recent High-Risk Alerts (Immediate Triage Required)
                </h3>
                <p className="text-xs text-command-muted">
                  Top 5 flagged anomalies scored above 70 by the stacked meta-learner
                </p>
              </div>
              <button
                onClick={onNavigateToQueue}
                className="text-xs text-command-tealGlow hover:underline font-mono"
              >
                View Full Queue (28 Alerts) ➔
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-command-border/60 text-command-muted uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">TXN ID</th>
                    <th className="py-3 px-3">TIMESTAMP</th>
                    <th className="py-3 px-3">FROM ACCOUNT</th>
                    <th className="py-3 px-3">TO ACCOUNT</th>
                    <th className="py-3 px-3 text-right">AMOUNT ($)</th>
                    <th className="py-3 px-3">FORMAT</th>
                    <th className="py-3 px-3">RISK SCORE</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-command-border/40 font-sans">
                  {recentAlerts.map((t) => (
                    <tr
                      key={t.txn_id}
                      onClick={() => onSelectTxn(t.txn_id)}
                      className="hover:bg-command-subtle/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-white">#{t.txn_id}</td>
                      <td className="py-3 px-3 font-mono text-command-muted">{t.timestamp.replace('T', ' ')}</td>
                      <td className="py-3 px-3 font-mono text-command-tealGlow">{t.from_account}</td>
                      <td className="py-3 px-3 font-mono text-command-tealGlow">{t.to_account}</td>
                      <td className="py-3 px-3 font-mono font-bold text-right text-white">${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 font-mono text-command-muted">{t.payment_format}</td>
                      <td className="py-3 px-3">
                        <RiskBadge score={t.risk_score} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTxn(t.txn_id);
                          }}
                          className="px-2.5 py-1 rounded bg-command-subtle hover:bg-command-teal hover:text-white text-command-muted transition-colors font-mono text-[11px]"
                        >
                          Inspect ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Standby / Locked Insights Preview State (Shown BEFORE running) */
        <div className="space-y-6 animate-fadeIn">
          {/* Locked Insights Callout Container */}
          <div className="p-8 rounded-xl bg-command-panel/60 border border-command-border/80 text-center relative overflow-hidden backdrop-blur-sm">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-command-teal/10 border border-command-teal/30 text-command-tealGlow flex items-center justify-center mx-auto shadow-glow-teal">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Surveillance Insights & Telemetry Awaiting Execution
              </h3>
              <p className="text-xs text-command-muted leading-relaxed">
                To prevent stale intelligence from presenting before evaluation, all real-time KPI metrics, 7-day ingestion curves, risk band donut distributions, threshold simulators, and high-risk case triages will be populated <strong>only when you run the pipeline</strong>.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onRunPipeline}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-command-teal to-teal-500 hover:from-command-tealGlow hover:to-command-teal text-white hover:text-command-dark font-mono font-bold text-xs shadow-glow-teal transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Surveillance Pipeline (Reveal Insights)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dormant / Staged Preview Placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 opacity-40">
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/50">
              <span className="text-xs font-mono font-bold uppercase text-command-muted block mb-2">Alerts Today</span>
              <div className="text-3xl font-mono text-command-muted font-bold">---</div>
              <span className="text-[10px] font-mono text-command-muted mt-1 block">Awaiting pipeline run</span>
            </div>
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/50">
              <span className="text-xs font-mono font-bold uppercase text-command-muted block mb-2">High-Risk Flags</span>
              <div className="text-3xl font-mono text-command-muted font-bold">---</div>
              <span className="text-[10px] font-mono text-command-muted mt-1 block">Awaiting pipeline run</span>
            </div>
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/50">
              <span className="text-xs font-mono font-bold uppercase text-command-muted block mb-2">SARs Filed (MTD)</span>
              <div className="text-3xl font-mono text-command-muted font-bold">---</div>
              <span className="text-[10px] font-mono text-command-muted mt-1 block">Awaiting pipeline run</span>
            </div>
            <div className="p-5 rounded-xl bg-command-panel border border-command-border/50">
              <span className="text-xs font-mono font-bold uppercase text-command-muted block mb-2">Model PR-AUC</span>
              <div className="text-3xl font-mono text-command-muted font-bold">0.83</div>
              <span className="text-[10px] font-mono text-command-muted mt-1 block">Primed architecture</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
