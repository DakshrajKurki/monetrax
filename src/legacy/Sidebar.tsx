import React from 'react';
import { LayoutDashboard, Inbox, FileSearch, Share2, Cpu, ShieldAlert, Zap } from 'lucide-react';

export type ViewType = 'overview' | 'queue' | 'detail' | 'network' | 'methodology';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  highRiskCount: number;
  onOpenCredentials: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  highRiskCount,
  onOpenCredentials,
}) => {
  const navItems = [
    {
      id: 'overview' as ViewType,
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'queue' as ViewType,
      label: 'Case Queue',
      icon: Inbox,
      badge: highRiskCount > 0 ? highRiskCount : null,
      badgeColor: 'bg-command-red text-white shadow-glow-red'
    },
    {
      id: 'detail' as ViewType,
      label: 'Transaction Detail',
      icon: FileSearch,
      badge: null
    },
    {
      id: 'network' as ViewType,
      label: '3D Network View',
      icon: Share2,
      badge: '3D R3F',
      badgeColor: 'bg-command-teal text-white'
    },
    {
      id: 'methodology' as ViewType,
      label: 'Model & Methodology',
      icon: Cpu,
      badge: 'PR 0.83',
      badgeColor: 'bg-command-subtle text-command-tealGlow border border-command-teal/30'
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-command-dark border-r border-command-border/70 flex flex-col justify-between select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-command-border/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-command-teal to-command-border flex items-center justify-center text-command-tealGlow shadow-glow-teal border border-command-tealGlow/30 relative">
            <Zap className="w-5 h-5 fill-command-tealGlow/30" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-command-tealGlow animate-ping" />
          </div>
          <div>
            <div className="text-xl font-serif font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>MONETRAX</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-command-tealGlow uppercase font-semibold">
              AML Command Center
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="p-3">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-command-muted font-bold">
            Live Threat Surveillance
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-command-teal/20 text-white border border-command-teal/50 shadow-glow-teal font-semibold'
                      : 'text-command-muted hover:text-white hover:bg-command-panel/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md transition-colors ${
                      isActive ? 'bg-command-teal text-white' : 'bg-command-subtle text-command-muted group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-command-subtle text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Real-time System Telemetry */}
        <div className="mx-4 mt-2 p-3 rounded-lg bg-command-panel/50 border border-command-border/40 text-[11px] font-mono">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-command-muted">Ensemble Pipeline:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-command-muted">Fused Meta-Model:</span>
            <span className="text-command-tealGlow font-bold">v2.4 Stacking</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-command-muted">Benchmark PR-AUC:</span>
            <span className="text-white font-bold">0.83 (IBM Kaggle)</span>
          </div>
        </div>
      </div>

      {/* Operator Credentials Footer (Dakshraj Singh - Owner) */}
      <div className="p-3 border-t border-command-border/60 bg-command-panel/40">
        <button
          onClick={onOpenCredentials}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-command-subtle/80 transition-all duration-200 text-left group border border-transparent hover:border-command-border/60"
        >
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-command-panel to-command-teal flex items-center justify-center text-xs font-bold text-white border border-command-tealGlow/50 shadow-glow-teal">
            DS
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-command-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">Dakshraj Singh</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-command-tealGlow text-command-dark uppercase">
                Owner
              </span>
            </div>
            <div className="text-[10px] text-command-muted truncate group-hover:text-command-tealGlow transition-colors">
              Head of Financial Intelligence
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
