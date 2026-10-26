import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Globe2, 
  Cpu, 
  UserCheck, 
  Share2, 
  Layers, 
  AlertOctagon, 
  FileText, 
  BarChart3, 
  Activity, 
  Settings, 
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';

interface SidebarNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const openCommandPalette = useAMLStore((s) => s.openCommandPalette);
  const transactions = useAMLStore((s) => s.transactions);

  // Open cases count
  const openCasesCount = transactions.filter(t => t.riskScore >= 70 && (t.status === 'New' || t.status === 'Under Review')).length;

  const mainNav = [
    { label: 'Command Center', path: '/', icon: LayoutDashboard },
    { label: 'Case Queue', path: '/queue', icon: ShieldAlert, badge: openCasesCount || 66 },
    { label: '3D Globe', path: '/globe', icon: Globe2 },
    { label: 'Model Lab', path: '/model', icon: Cpu },
  ];

  const investigationNav = [
    { label: 'Account 360', path: '/account', icon: UserCheck },
    { label: 'Network Graph & Replay', path: '/network', icon: Share2 },
    { label: 'Typology Library', path: '/typologies', icon: Layers },
    { label: 'Sanctions & PEP', path: '/sanctions', icon: AlertOctagon },
    { label: 'SAR Center', path: '/sar', icon: FileText },
    { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
  ];

  const systemNav = [
    { label: 'System Health', path: '/system', icon: Activity },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const handleOpenRisky = () => {
    window.dispatchEvent(new CustomEvent('open-risky-assistant'));
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: { label: string; path: string; icon: any; badge?: number }) => {
    const active = isActive(item.path);
    const IconComponent = item.icon;

    return (
      <button
        key={item.path}
        onClick={() => handleNavClick(item.path)}
        title={isCollapsed ? item.label : undefined}
        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all select-none group ${
          isCollapsed ? 'justify-center px-2 py-2.5' : ''
        } ${
          active
            ? 'text-white'
            : 'text-[var(--muted)] hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        {/* Active sliding background indicator */}
        {active && (
          <motion.div
            layoutId="sidebarActivePill"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF6A2B] to-[#FF4D1A] shadow-[0_4px_18px_rgba(255,106,43,0.38)] border border-white/20"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}

        {/* Icon */}
        <IconComponent
          className={`relative z-10 w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
            active ? 'text-white' : 'text-[var(--muted)] group-hover:text-white'
          }`}
        />

        {/* Label and Badge (hidden when collapsed) */}
        {!isCollapsed && (
          <div className="relative z-10 flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold shrink-0 ${
                  active
                    ? 'bg-black/25 text-white border border-white/20'
                    : 'bg-[#1D1D22] text-[var(--muted)] border border-white/10 group-hover:text-white'
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3.5 select-none overflow-y-auto scrollbar-thin">
      {/* Top Header: Logo + Brand + Collapse button */}
      <div>
        <div className="flex items-center justify-between pb-4 pt-1 px-1">
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            {/* Orange Brand Mark */}
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#FF6A2B] to-[#FF4D1A] flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_12px_rgba(255,106,43,0.45)] border border-white/25 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 18L10 6L14 14L17 9L20 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm tracking-tight text-white uppercase font-sans">
                  Monetrax
                </span>
                <span className="text-[9px] font-mono text-[var(--caption)] uppercase tracking-widest">
                  AML Defense
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button (desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[var(--caption)] hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button on Mobile Drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-[var(--caption)] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Field with ⌘K Hint */}
        <div className="mb-4 mt-1 px-0.5">
          <button
            type="button"
            onClick={openCommandPalette}
            title={isCollapsed ? 'Search (⌘K)' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#18181C] border border-white/[0.08] hover:border-white/20 text-xs text-[var(--caption)] hover:text-[var(--text)] transition-all shadow-inner group ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-white shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate">Search</span>
                <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-[var(--caption)]">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation Item Groups */}
        <div className="space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNav.map(renderNavItem)}
          </div>

          {/* Investigation Group */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 py-1 text-[10px] font-mono font-medium text-[var(--caption)] uppercase tracking-wider">
                Investigation
              </div>
            ) : (
              <div className="w-8 mx-auto my-2 border-t border-white/[0.08]" />
            )}
            <div className="space-y-1 mt-1">
              {investigationNav.map(renderNavItem)}
            </div>
          </div>

          {/* System Group */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 py-1 text-[10px] font-mono font-medium text-[var(--caption)] uppercase tracking-wider">
                System
              </div>
            ) : (
              <div className="w-8 mx-auto my-2 border-t border-white/[0.08]" />
            )}
            <div className="space-y-1 mt-1">
              {systemNav.map(renderNavItem)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: "Ask Risky, AI Copilot" (matches the bottom card from reference) */}
      <div className="pt-4 mt-4 border-t border-white/[0.08]">
        {!isCollapsed ? (
          <div className="p-3.5 rounded-[14px] bg-[#17171B] border border-white/[0.08] shadow-md flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF6A2B] to-[#FF4D1A] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <span>Ask Risky</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#FF6A2B]/20 text-[#FF6A2B] font-mono font-bold">
                    AI
                  </span>
                </h4>
                <p className="text-[10px] text-[var(--caption)] leading-tight mt-0.5 line-clamp-2">
                  Autonomous AML triage & anomaly co-pilot.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenRisky}
              className="w-full py-1.5 px-3 rounded-full bg-gradient-to-r from-[#FF6A2B] to-[#FF4D1A] text-white text-xs font-medium hover:brightness-105 shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open Risky</span>
              <Sparkles className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenRisky}
            className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-[#FF6A2B] to-[#FF4D1A] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            title="Ask Risky AI Copilot"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (240px or 72px) */}
      <aside
        className={`hidden lg:block shrink-0 bg-[#111113] border-r border-white/[0.07] h-screen sticky top-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-out Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-[260px] max-w-[85vw] bg-[#111113] border-r border-white/10 h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
