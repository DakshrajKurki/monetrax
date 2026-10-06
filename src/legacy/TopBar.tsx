import React from 'react';
import { Bell, Search, ShieldCheck, Activity, Play, RotateCcw, RotateCw } from 'lucide-react';
import { ViewType } from './Sidebar';
import { AlertNotification, PipelineStatus } from '../../types';

interface TopBarProps {
  currentView: ViewType;
  activeAlert: AlertNotification | null;
  notificationCount: number;
  onOpenNotifications: () => void;
  onOpenCredentials: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pipelineStatus: PipelineStatus;
  onRunPipeline: () => void;
  onResetDataset: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  activeAlert,
  notificationCount,
  onOpenNotifications,
  onOpenCredentials,
  searchQuery,
  onSearchChange,
  pipelineStatus,
  onRunPipeline,
  onResetDataset,
}) => {
  const viewTitles: Record<ViewType, string> = {
    overview: 'Overview Dashboard',
    queue: 'Case Queue & Alert Triage',
    detail: 'Transaction Forensic Detail',
    network: '3D Transaction Graph & Typology Replay',
    methodology: 'Model Architecture & Stacking Specs'
  };

  return (
    <header className="h-16 flex-shrink-0 bg-command-panel border-b border-command-border/70 flex items-center justify-between px-6 z-20">
      {/* Breadcrumbs & View Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-command-muted font-mono">
          <span className="text-command-tealGlow font-bold">MONETRAX</span>
          <span>/</span>
          <span className="text-white font-medium">{viewTitles[currentView]}</span>
        </div>

        {/* Real-time Streaming Ticker Badge */}
        {activeAlert && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-command-dark/80 border border-command-border/60 text-xs font-mono animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-command-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-command-red"></span>
            </span>
            <span className="text-command-muted text-[11px]">LIVE STREAM:</span>
            <span className="text-white font-semibold">Txn #{activeAlert.txnId}</span>
            <span className="text-command-red font-bold">({activeAlert.riskScore.toFixed(1)} Risk)</span>
            <span className="text-command-tealGlow text-[11px] truncate max-w-[180px]">{activeAlert.type}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Reset Dataset, Run Pipeline, Search, Notifications & Operator */}
      <div className="flex items-center gap-3">
        {/* Pipeline Controls: Reset & Run */}
        <div className="flex items-center gap-2">
          {/* Status Indicator Pill */}
          {pipelineStatus === 'standby' && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>STANDBY: 1,420 TXNS</span>
            </div>
          )}
          {pipelineStatus === 'running' && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-command-teal/20 border border-command-tealGlow/50 text-[11px] font-mono text-command-tealGlow">
              <RotateCw className="w-3 h-3 animate-spin" />
              <span>SCORING ENSEMBLE...</span>
            </div>
          )}
          {pipelineStatus === 'analyzed' && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>PIPELINE ACTIVE</span>
            </div>
          )}

          {/* Reset Dataset Button */}
          <button
            onClick={onResetDataset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-command-dark/70 border border-command-border/60 hover:border-red-500/50 hover:bg-red-500/10 text-command-muted hover:text-red-300 font-mono text-xs transition-all active:scale-95"
            title="Reset dataset & return pipeline to standby"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Reset Dataset</span>
          </button>

          {/* Run Pipeline Button */}
          {pipelineStatus === 'standby' ? (
            <button
              onClick={onRunPipeline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-command-teal to-teal-500 hover:from-command-tealGlow hover:to-command-teal text-white hover:text-command-dark font-mono font-bold text-xs shadow-glow-teal transition-all active:scale-95 animate-pulse"
              title="Execute XGBoost + Isolation Forest Surveillance Pipeline"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Pipeline</span>
            </button>
          ) : pipelineStatus === 'running' ? (
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-dark border border-command-tealGlow/50 text-command-tealGlow font-mono text-xs cursor-wait opacity-80"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scoring...</span>
            </button>
          ) : (
            <button
              onClick={onRunPipeline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-dark/80 border border-command-teal/60 hover:border-command-tealGlow text-command-tealGlow font-mono text-xs transition-all active:scale-95"
              title="Re-run surveillance scoring"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Re-Run</span>
            </button>
          )}
        </div>

        {/* Global Search */}
        <div className="relative w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-command-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Account, Txn..."
            className="w-full bg-command-dark/70 border border-command-border/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-command-muted focus:outline-none focus:border-command-tealGlow/70 focus:ring-1 focus:ring-command-tealGlow/30 transition-all font-mono"
          />
        </div>

        {/* Live Ingestion Health */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-command-dark/50 border border-command-border/40 text-[11px] font-mono text-command-muted">
          <Activity className="w-3.5 h-3.5 text-command-tealGlow animate-pulse" />
          <span>Ingestion: <strong className="text-white">28ms</strong></span>
        </div>

        {/* Notification Bell with animated badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-command-dark/60 border border-command-border/60 text-command-muted hover:text-white hover:border-command-border transition-all"
          title="Live Threat Alerts Feed"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-command-red text-[9px] font-bold text-white shadow-glow-red animate-bounce">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Operator Badge Trigger */}
        <button
          onClick={onOpenCredentials}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-dark/60 border border-command-border/60 hover:border-command-tealGlow/50 transition-all text-left"
        >
          <ShieldCheck className="w-4 h-4 text-command-tealGlow" />
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-bold text-white">Dakshraj Singh</span>
            <span className="text-[9px] text-command-tealGlow font-mono font-bold">(Owner) [ROOT]</span>
          </div>
        </button>
      </div>
    </header>
  );
};
