import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  Eye, 
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';

export const SettingsView: React.FC = () => {
  const addToast = useAMLStore((s) => s.addToast);
  const resetStore = useAMLStore((s) => s.resetStore);

  const [alertThreshold, setAlertThreshold] = useState<number>(70);
  const [streamSpeed, setStreamSpeed] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [motionLevel, setMotionLevel] = useState<'full' | 'reduced'>('full');
  const [aiMode, setAiMode] = useState<'live' | 'offline'>('live');

  const handleSaveSettings = () => {
    addToast({
      title: 'Settings Saved',
      message: 'System operating parameters updated successfully',
      type: 'success'
    });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo transactions, cases, and draft SARs back to initial clean state?')) {
      resetStore();
      addToast({
        title: 'Data Reset Complete',
        message: 'Re-seeded initial 2,050 transactions and standard queue',
        type: 'info'
      });
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              System Settings & Configuration
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--sage-2)]/20 text-[var(--sage-2)] font-mono font-medium border border-[var(--sage-2)]/30">
              Analyst Preferences
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Calibrate detection thresholds, real-time ingestion velocity, visual motion dynamics, and Gemini AI inference modes.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="pill-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Settings Sections Grid */}
      <div className="space-y-6">
        {/* Detection Sensitivity */}
        <div className="glass-panel p-6 border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-[var(--sage-2)]" />
              <h3 className="text-sm font-medium text-white">
                ML Detection Alert Threshold
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--risk-red)]">
              ≥ {alertThreshold} / 100 Risk Score
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] font-light leading-relaxed">
            Transactions scoring at or above this threshold trigger automatic analyst alert routing and queue ingestion. Lower values increase recall but yield higher analyst review workload.
          </p>

          <input
            type="range"
            min="40"
            max="90"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>40 (High Volume / Low Precision)</span>
            <span>70 (Balanced Default)</span>
            <span>90 (Ultra-Conservative)</span>
          </div>
        </div>

        {/* Stream Simulation Speed */}
        <div className="glass-panel p-6 border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[var(--sage-2)]" />
              <h3 className="text-sm font-medium text-white">
                Stream Simulation Velocity
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--sage-3)] uppercase">
              {streamSpeed}
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] font-light">
            Controls synthetic transaction generation interval in the live event engine.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'fast', label: 'Fast (1.0s)', desc: 'Stress testing & throughput' },
              { id: 'normal', label: 'Normal (2.0s)', desc: 'Realistic financial flow' },
              { id: 'slow', label: 'Slow (4.0s)', desc: 'Detailed step observation' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStreamSpeed(opt.id as any)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  streamSpeed === opt.id
                    ? 'border-white bg-white/[0.08] text-white'
                    : 'border-[var(--line)] hover:border-white/20 text-[var(--muted)]'
                }`}
              >
                <div className="text-xs font-medium text-white">{opt.label}</div>
                <div className="text-[10px] text-[var(--muted)] mt-1 font-light">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Motion Level Preference */}
        <div className="glass-panel p-6 border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-[var(--sage-2)]" />
              <h3 className="text-sm font-medium text-white">
                Motion & Animation Dynamics
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--sage-3)] uppercase">
              {motionLevel}
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] font-light">
            Respect system accessibility preferences or adjust continuous sage orb drift and page transition blurring.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'full', label: 'Full Dynamic Motion', desc: 'Slow drifting glows, 3D orbits, particle curves' },
              { id: 'reduced', label: 'Reduced Motion', desc: 'Instantaneous transitions, static ambient background' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMotionLevel(opt.id as any)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  motionLevel === opt.id
                    ? 'border-white bg-white/[0.08] text-white'
                    : 'border-[var(--line)] hover:border-white/20 text-[var(--muted)]'
                }`}
              >
                <div className="text-xs font-medium text-white">{opt.label}</div>
                <div className="text-[10px] text-[var(--muted)] mt-1 font-light">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Operational Mode */}
        <div className="glass-panel p-6 border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[var(--sage-2)]" />
              <h3 className="text-sm font-medium text-white">
                "Risky" AI Engine Operational Mode
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--sage-3)] uppercase">
              {aiMode === 'live' ? 'Live Gemini Proxy' : 'Offline Heuristic'}
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] font-light">
            When set to Live Gemini Proxy, requests are dispatched via Express backend (/api/ai) using Google Gemini 2.5 Flash. If key is unset or offline, seamless deterministic fallback is activated.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'live', label: 'Live Gemini Engine', desc: 'Uses Express proxy with streaming reasoning' },
              { id: 'offline', label: 'Deterministic Offline Mock', desc: 'Self-contained rule engine for airgapped demos' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAiMode(opt.id as any)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  aiMode === opt.id
                    ? 'border-white bg-white/[0.08] text-white'
                    : 'border-[var(--line)] hover:border-white/20 text-[var(--muted)]'
                }`}
              >
                <div className="text-xs font-medium text-white">{opt.label}</div>
                <div className="text-[10px] text-[var(--muted)] mt-1 font-light">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="glass-panel p-6 border border-[var(--risk-red)]/30 space-y-4 bg-[var(--risk-red)]/[0.02]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--risk-red)]/20">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[var(--risk-red)]" />
              <h3 className="text-sm font-medium text-white">
                Reset Demo Data Store
              </h3>
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] font-light leading-relaxed">
            Re-seeds all 2,050 historical transactions, clears local analyst notes, resets custom SAR drafts, and restores initial case statuses.
          </p>

          <button
            onClick={handleResetData}
            className="pill-btn-secondary text-xs border-[var(--risk-red)]/40 text-[var(--risk-red)] hover:bg-[var(--risk-red)]/10"
          >
            Reset All Data to Factory Default
          </button>
        </div>
      </div>
    </motion.div>
  );
};
