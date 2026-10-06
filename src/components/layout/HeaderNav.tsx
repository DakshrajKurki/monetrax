import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  Bell, 
  Play, 
  Pause, 
  ShieldAlert, 
  ChevronRight,
  ChevronDown,
  Layers,
  Globe2,
  Cpu,
  Activity,
  Command,
  Share2,
  BookOpen,
  FileText,
  BarChart3,
  HardDrive,
  Building2,
  Sliders,
  User,
  LogOut,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CommandPalette } from '../common/CommandPalette';
import { formatRelativeTime } from '../../utils/formatters';

export const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const isLiveStreaming = useAMLStore((s) => s.isLiveStreaming);
  const toggleLiveStream = useAMLStore((s) => s.toggleLiveStream);
  const openCasesCount = useAMLStore((s) => s.liveKPIs.openCases);
  const throughput = useAMLStore((s) => s.liveKPIs.transactionsPerMin);
  const avgTimeToTriageMinutes = useAMLStore((s) => s.liveKPIs.avgTimeToTriageMinutes);
  const transactions = useAMLStore((s) => s.transactions);
  const sarDrafts = useAMLStore((s) => s.sarDrafts);
  const notifications = useAMLStore((s) => s.notifications);
  const unreadAlertCount = useAMLStore((s) => s.unreadAlertCount);
  const clearAlertNotifications = useAMLStore((s) => s.clearAlertNotifications);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const liveAlertTicker = useAMLStore((s) => s.liveAlertTicker);
  const addToast = useAMLStore((s) => s.addToast);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  // Trigger refs for position calculation
  const investigationBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const moreMenuDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [investigationPos, setInvestigationPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [profilePos, setProfilePos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  // Update positions on open or resize
  useEffect(() => {
    if (isMoreMenuOpen && investigationBtnRef.current) {
      const rect = investigationBtnRef.current.getBoundingClientRect();
      setInvestigationPos({
        top: rect.bottom + 8,
        left: Math.max(16, rect.left)
      });
    }
  }, [isMoreMenuOpen]);

  useEffect(() => {
    if (isProfileMenuOpen && profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect();
      setProfilePos({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right)
      });
    }
  }, [isProfileMenuOpen]);

  // Global Cmd+K / Ctrl+K and Escape listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsMoreMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for portaled dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isMoreMenuOpen && 
        moreMenuDropdownRef.current && 
        !moreMenuDropdownRef.current.contains(target) &&
        investigationBtnRef.current &&
        !investigationBtnRef.current.contains(target)
      ) {
        setIsMoreMenuOpen(false);
      }
      if (
        isProfileMenuOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen, isProfileMenuOpen]);

  const navItems = [
    { path: '/', label: 'Command', icon: <Activity className="w-3.5 h-3.5" /> },
    { path: '/queue', label: 'Case Queue', icon: <Layers className="w-3.5 h-3.5" />, badge: openCasesCount },
    { path: '/globe', label: '3D Globe', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { path: '/model', label: 'Model Lab', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  const moreTools = [
    { path: '/account', label: 'Account 360 Profile', icon: <Building2 className="w-3.5 h-3.5" /> },
    { path: '/network', label: 'Network Graph & Replay', icon: <Share2 className="w-3.5 h-3.5" /> },
    { path: '/typologies', label: 'Typology Library', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { path: '/sanctions', label: 'Sanctions & PEP', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { path: '/sar', label: 'SAR Center', icon: <FileText className="w-3.5 h-3.5" /> },
    { path: '/analytics', label: 'Analytics & Reports', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { path: '/system', label: 'System Health', icon: <HardDrive className="w-3.5 h-3.5" /> },
    { path: '/settings', label: 'System Settings', icon: <Sliders className="w-3.5 h-3.5" /> }
  ];

  // Analyst stats derived from store
  const casesReviewed = transactions.filter(t => t.status !== 'New').length;
  const sarsFiled = sarDrafts.filter(s => s.status === 'Submitted' || s.status === 'Pending Review').length || 14;
  const avgTimeToTriage = `${(avgTimeToTriageMinutes || 4.2).toFixed(1)}m`;

  const lastEventTime = liveAlertTicker ? formatRelativeTime(liveAlertTicker.timestamp).relative : 'Just now';

  return (
    <>
      <header className="relative w-full pt-4 pb-2 px-2 flex items-center justify-between pointer-events-auto isolate z-[1000]">
        {/* Brand Logo Top Left (matching reference circular symbol) */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 cursor-pointer group select-none pl-2"
        >
          <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-[var(--line)] flex items-center justify-center group-hover:border-[var(--sage-2)] transition-all">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.4)" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--sage-3)" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-light tracking-[0.24em] text-xs text-[var(--text)] uppercase font-sans">
              MONETRAX
            </span>
          </div>
        </div>

        {/* Centered Floating Pill Navigation matching Reference with LayoutId */}
        <nav className="nav-pill-container flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path === '/queue' && pathname.startsWith('/detail'));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors select-none flex items-center gap-2 z-10 ${
                  isActive
                    ? 'text-[#0A0D0C] font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#0A0D0C] text-white'
                        : 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* More Tools Trigger (Investigation) */}
          <button
            ref={investigationBtnRef}
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors select-none flex items-center gap-1.5 ${
              moreTools.some(t => pathname === t.path) || isMoreMenuOpen
                ? 'text-white font-medium bg-white/10' 
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>Investigation</span>
            <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </nav>

        {/* Right User Controls: Cmd+K + Stream Toggle + Notification Bell + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pr-2">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCmdPaletteOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/[0.03] border border-[var(--line)] text-[var(--muted)] hover:text-white hover:border-white/30 transition-all font-mono text-[10px]"
            title="Open Command Palette (Cmd+K)"
          >
            <Command className="w-3 h-3 text-[var(--sage-2)]" />
            <span>Search (⌘K)</span>
          </button>

          {/* Stream Toggle Pill with Live Pulse & Events/min */}
          <button
            onClick={toggleLiveStream}
            title={isLiveStreaming ? `Live stream active: ~${throughput} tx/min (Last event: ${lastEventTime}). Click to pause.` : 'Stream paused. Click to resume.'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all border ${
              isLiveStreaming
                ? 'bg-[var(--sage-2)]/[0.1] border-[var(--sage-2)]/30 text-[var(--sage-3)]'
                : 'bg-white/[0.03] border-[var(--line)] text-[var(--muted)]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLiveStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--live)] opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveStreaming ? 'bg-[var(--live)]' : 'bg-[var(--muted)]'}`} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider hidden md:inline">
              {isLiveStreaming ? `LIVE ${throughput} tx/m` : 'PAUSED'}
            </span>
            {isLiveStreaming ? <Pause className="w-3 h-3 opacity-60" /> : <Play className="w-3 h-3 opacity-60" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (unreadAlertCount > 0) clearAlertNotifications();
              }}
              className="w-8 h-8 rounded-full bg-white/[0.03] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-white transition-all relative"
              title="Threat Stream"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--risk-red)] text-[8px] text-white font-bold flex items-center justify-center animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 max-w-sm rounded-2xl glass-panel p-4 shadow-2xl border border-[var(--line)] z-50 animate-fadeIn bg-[#0B0F0D]/95">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[var(--risk-red)]" />
                    <span className="text-xs font-medium text-white">Live Threat Alerts</span>
                  </div>
                  <button
                    onClick={() => {
                      clearAlertNotifications();
                      setIsNotificationsOpen(false);
                    }}
                    className="text-[10px] text-[var(--muted)] hover:text-white font-mono"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pt-2 scrollbar-none">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[var(--muted)] font-light">
                      No active threat alerts
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          selectTxn(notif.id);
                          navigate(`/detail/${notif.id}`);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-white font-semibold">#{notif.id}</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[var(--risk-red)]/20 text-[var(--risk-red)]">
                              {notif.riskScore.toFixed(0)} Risk
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              flyToCase(notif.id);
                              navigate(`/globe?case=${notif.id}&view=map`);
                              setIsNotificationsOpen(false);
                            }}
                            className="p-1 rounded-full bg-white/[0.05] hover:bg-white/20 text-[var(--muted)] hover:text-white transition-colors"
                            title="Fly to Location on Map"
                          >
                            <Globe2 className="w-3 h-3 text-[var(--sage-3)]" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[var(--muted)] line-clamp-1">
                          {notif.typologyLabel} — ${notif.amount.toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill (Clickable trigger for portal panel) */}
          <button 
            type="button"
            data-testid="profile-btn"
            ref={profileBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }}
            className="flex items-center gap-2 pl-1 select-none cursor-pointer group p-1 rounded-full hover:bg-white/[0.04] transition-all bg-transparent border-0"
            title="Dakshraj Singh Chandawat — AML Analyst"
          >
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-xs font-mono font-medium text-[var(--sage-3)] group-hover:border-[var(--sage-2)] transition-colors">
              DS
            </div>
            <span className="hidden xl:inline text-xs text-[var(--muted)] font-light group-hover:text-white transition-colors">
              Dakshraj Singh
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          ITEM 3: SPECIALIZED MODULES DROPDOWN (Rendered via React Portal to body)
          Exact styling: rgba(10,14,12,0.96), blur(24px) saturate(140%), 1px border, radius 20px
          ========================================================================= */}
      {isMoreMenuOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={moreMenuDropdownRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: `${investigationPos.top}px`,
              left: `${investigationPos.left}px`,
              zIndex: 1100,
              width: '15.5rem'
            }}
            className="dropdown-portal-panel p-2 shadow-2xl flex flex-col gap-1 text-xs select-none"
          >
            <div className="px-3 py-1.5 border-b border-[var(--line)] mb-1 flex items-center justify-between">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono tracking-wider">
                Specialized Modules
              </span>
              <span className="text-[9px] text-[var(--sage-3)] font-mono">
                8 Engines
              </span>
            </div>
            {moreTools.map(t => (
              <button
                key={t.path}
                onClick={() => {
                  navigate(t.path);
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                  pathname === t.path 
                    ? 'bg-white/10 text-white font-medium border border-white/10' 
                    : 'text-[var(--text)] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className="text-[var(--sage-2)]">{t.icon}</span>
                <span className="font-sans text-xs">{t.label}</span>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* =========================================================================
          ITEM 7: USER PROFILE PANEL (Rendered via React Portal to body)
          Avatar "DS", "Dakshraj Singh Chandawat", "AML Analyst", "ANALYST-0142",
          stats row from store, Settings/Appearance/Sign out items.
          ========================================================================= */}
      {isProfileMenuOpen && createPortal(
        <AnimatePresence>
          <motion.div
            ref={profileDropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: `${profilePos.top}px`,
              right: `${profilePos.right}px`,
              zIndex: 1100,
              width: '19.5rem'
            }}
            className="dropdown-portal-panel p-4 shadow-2xl flex flex-col gap-3 select-none text-xs"
          >
            {/* User Identity Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--line)]">
              <div className="w-11 h-11 rounded-full bg-[var(--sage-2)]/20 border border-[var(--sage-2)]/40 flex items-center justify-center text-sm font-mono font-semibold text-[var(--sage-3)] shrink-0">
                DS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  Dakshraj Singh Chandawat
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <span>AML Analyst</span>
                  <span>•</span>
                  <span className="font-mono text-[10px] text-[var(--sage-3)]">ANALYST-0142</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]/70 font-light">
                  Financial Crime Unit
                </span>
              </div>
            </div>

            {/* Analyst Performance Stats from Store */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-white/[0.03] border border-[var(--line)] rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[10px] text-[var(--muted)] font-mono">Reviewed</span>
                <span className="text-sm font-semibold text-white font-mono tabular-nums">{casesReviewed}</span>
              </div>
              <div className="bg-white/[0.03] border border-[var(--line)] rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[10px] text-[var(--muted)] font-mono">SARs Filed</span>
                <span className="text-sm font-semibold text-[var(--sage-3)] font-mono tabular-nums">{sarsFiled}</span>
              </div>
              <div className="bg-white/[0.03] border border-[var(--line)] rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[10px] text-[var(--muted)] font-mono">Avg Triage</span>
                <span className="text-sm font-semibold text-[var(--live)] font-mono tabular-nums">{avgTimeToTriage}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1 pt-1 border-t border-[var(--line)]">
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[var(--text)] hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[var(--sage-2)]" />
                <span className="font-sans text-xs">Settings & Preferences</span>
              </button>

              <button
                onClick={() => {
                  addToast({
                    title: 'Appearance',
                    message: 'Theme locked to Dark Glass Defense (#050706)',
                    type: 'info'
                  });
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[var(--text)] hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--sage-2)]" />
                <span className="font-sans text-xs">Appearance: Dark Glass</span>
              </button>

              <button
                onClick={() => {
                  addToast({
                    title: 'Session Notice',
                    message: 'Sign out is simulated for local compliance session.',
                    type: 'info'
                  });
                  setIsProfileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[var(--risk-red)] hover:bg-[var(--risk-red)]/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="font-sans text-xs">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Global Command Palette Modal */}
      <CommandPalette 
        isOpen={isCmdPaletteOpen} 
        onClose={() => setIsCmdPaletteOpen(false)} 
      />
    </>
  );
};
