import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Bell, 
  Share2, 
  Menu, 
  User, 
  Sliders, 
  LogOut, 
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactions = useAMLStore((s) => s.transactions);
  const liveKPIs = useAMLStore((s) => s.liveKPIs);
  const addToast = useAMLStore((s) => s.addToast);
  const isLiveStreaming = useAMLStore((s) => s.isLiveStreaming);

  // Profile Menu State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileCoords, setProfileCoords] = useState({ top: 0, left: 0 });
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Notification Menu State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifCoords, setNotifCoords] = useState({ top: 0, left: 0 });
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Calculate live notification alerts
  const criticalAlerts = transactions.filter(t => t.riskScore >= 70).slice(0, 5);

  // Page title mapping for breadcrumbs
  const getPageTitle = (pathname: string) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/queue')) return 'Case Queue';
    if (pathname.startsWith('/detail')) return 'Investigation Detail';
    if (pathname.startsWith('/globe')) return '3D Global Surveillance';
    if (pathname.startsWith('/model')) return 'Model Lab & Methodology';
    if (pathname.startsWith('/network')) return 'Network Graph & Replay';
    if (pathname.startsWith('/account')) return 'Account 360';
    if (pathname.startsWith('/typologies')) return 'Typology Library';
    if (pathname.startsWith('/sanctions')) return 'Sanctions & PEP';
    if (pathname.startsWith('/sar')) return 'SAR Filing Center';
    if (pathname.startsWith('/analytics')) return 'Analytics & Reports';
    if (pathname.startsWith('/system')) return 'System Health';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Command Center';
  };

  const updateProfilePosition = useCallback(() => {
    if (!profileTriggerRef.current) return;
    const rect = profileTriggerRef.current.getBoundingClientRect();
    setProfileCoords({
      top: rect.bottom + window.scrollY + 8,
      left: Math.max(16, rect.right + window.scrollX - 260)
    });
  }, []);

  const updateNotifPosition = useCallback(() => {
    if (!notifTriggerRef.current) return;
    const rect = notifTriggerRef.current.getBoundingClientRect();
    setNotifCoords({
      top: rect.bottom + window.scrollY + 8,
      left: Math.max(16, rect.right + window.scrollX - 280)
    });
  }, []);

  const toggleProfile = () => {
    if (!isProfileOpen) {
      updateProfilePosition();
      setIsNotificationsOpen(false);
      setIsProfileOpen(true);
    } else {
      setIsProfileOpen(false);
    }
  };

  const toggleNotifications = () => {
    if (!isNotificationsOpen) {
      updateNotifPosition();
      setIsProfileOpen(false);
      setIsNotificationsOpen(true);
    } else {
      setIsNotificationsOpen(false);
    }
  };

  useOnClickOutside(profileMenuRef, () => setIsProfileOpen(false), {
    enabled: isProfileOpen,
    ignoreRefs: [profileTriggerRef]
  });

  useOnClickOutside(notifMenuRef, () => setIsNotificationsOpen(false), {
    enabled: isNotificationsOpen,
    ignoreRefs: [notifTriggerRef]
  });

  // Export report action
  const handleExportReport = () => {
    addToast({
      title: 'Report Generated',
      message: 'Comprehensive AML surveillance brief & SAR logs downloaded as CSV/PDF package.',
      type: 'success'
    });
  };

  return (
    <header className="w-full h-16 bg-[#0B0B0C] border-b border-white/[0.07] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
      {/* Left Area: Mobile Menu + Navigation Buttons + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden w-8 h-8 rounded-lg bg-[#161619] border border-white/[0.08] text-[var(--muted)] hover:text-white flex items-center justify-center shrink-0"
          title="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Back / Forward Buttons */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 rounded-[8px] bg-[#161619] border border-white/[0.08] hover:border-white/20 text-[var(--muted)] hover:text-white flex items-center justify-center transition-colors"
            title="Go back"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-7 h-7 rounded-[8px] bg-[#161619] border border-white/[0.08] hover:border-white/20 text-[var(--muted)] hover:text-white flex items-center justify-center transition-colors"
            title="Go forward"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Breadcrumb matching Reference: Fintrixity > Dashboard */}
        <div className="flex items-center gap-1.5 text-xs font-medium min-w-0">
          <span className="text-[var(--caption)] hover:text-white cursor-pointer" onClick={() => navigate('/')}>
            Monetrax
          </span>
          <span className="text-[var(--caption)]">›</span>
          <span className="text-white font-semibold truncate">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right Area: Help + Notifications + Live Status + Profile + Export */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Help Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-8 h-8 rounded-full bg-[#161619] border border-white/[0.08] hover:border-white/20 text-[var(--muted)] hover:text-white flex items-center justify-center transition-colors"
          title="Help & AML Guidelines"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Bell with Count Badge */}
        <button
          ref={notifTriggerRef}
          onClick={toggleNotifications}
          className="relative w-8 h-8 rounded-full bg-[#161619] border border-white/[0.08] hover:border-white/20 text-[var(--muted)] hover:text-white flex items-center justify-center transition-colors"
          title="Alert Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF4D1A] text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#111113]">
              {criticalAlerts.length}
            </span>
          )}
        </button>

        {/* Live Status Chip matching reference */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161619] border border-white/[0.08] text-[11px] font-mono text-white/90 shadow-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-[#4ADE9A] animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-[var(--caption)] uppercase font-semibold">Live</span>
          <span className="font-semibold text-white">{liveKPIs.transactionsPerMin.toLocaleString()} tx/m</span>
        </div>

        {/* Profile Avatar Chip */}
        <button
          ref={profileTriggerRef}
          onClick={toggleProfile}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#161619] border border-white/[0.08] hover:border-white/20 transition-all select-none group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF6A2B] to-[#FF4D1A] text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
            DS
          </div>
          <span className="hidden sm:inline text-xs font-medium text-white truncate max-w-[90px]">
            Dakshraj
          </span>
        </button>

        {/* Primary Orange "Export Report" Button matching reference's "Share" button */}
        <button
          onClick={handleExportReport}
          className="pill-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-md"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* PORTALED NOTIFICATION DROPDOWN */}
      {isNotificationsOpen &&
        createPortal(
          <div
            ref={notifMenuRef}
            style={{
              position: 'absolute',
              top: `${notifCoords.top}px`,
              left: `${notifCoords.left}px`,
              zIndex: 1100
            }}
            className="w-72 p-3 rounded-[16px] bg-[#141417]/95 border border-white/10 shadow-2xl backdrop-blur-xl animate-fadeIn text-xs"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <span className="font-semibold text-white">Live Threat Alerts</span>
              <span className="text-[10px] font-mono text-[var(--brand-orange)] font-medium">
                {criticalAlerts.length} Critical
              </span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {criticalAlerts.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    navigate(`/detail/${t.id}`);
                    setIsNotificationsOpen(false);
                  }}
                  className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-white font-semibold text-[11px]">#{t.id}</span>
                    <span className="text-[10px] font-mono font-bold text-[#E5484D]">{t.riskScore} Risk</span>
                  </div>
                  <div className="text-[11px] text-[var(--muted)] truncate">
                    {t.fromCity} ➔ {t.toCity} (${t.amount.toLocaleString()})
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}

      {/* PORTALED PROFILE DROPDOWN */}
      {isProfileOpen &&
        createPortal(
          <div
            ref={profileMenuRef}
            style={{
              position: 'absolute',
              top: `${profileCoords.top}px`,
              left: `${profileCoords.left}px`,
              zIndex: 1100
            }}
            className="w-64 p-3.5 rounded-[16px] bg-[#141417]/95 border border-white/10 shadow-2xl backdrop-blur-xl animate-fadeIn text-xs flex flex-col gap-3"
          >
            {/* Header: User Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6A2B] to-[#FF4D1A] text-white font-bold text-sm flex items-center justify-center shadow-md shrink-0">
                DS
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white truncate text-sm">Dakshraj Singh</div>
                <div className="text-[11px] text-[var(--muted)] font-mono">ANALYST-0142</div>
                <div className="text-[10px] text-[var(--caption)]">Financial Crime Unit</div>
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-3 gap-1.5 py-1 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <div className="text-[9px] text-[var(--caption)]">Reviewed</div>
                <div className="text-xs font-bold text-white">48</div>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <div className="text-[9px] text-[var(--caption)]">SARs</div>
                <div className="text-xs font-bold text-[var(--brand-orange)]">12</div>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <div className="text-[9px] text-[var(--caption)]">SLA</div>
                <div className="text-xs font-bold text-[#4ADE9A]">1.4m</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-0.5 pt-1 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsProfileOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-[var(--text)] hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>Settings & Preferences</span>
              </button>

              <button
                onClick={() => {
                  addToast({
                    title: 'Appearance',
                    message: 'Theme: Modern Dark Fintech (#0B0B0C & #111113)',
                    type: 'info'
                  });
                  setIsProfileOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-[var(--text)] hover:text-white hover:bg-white/[0.06] flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--brand-orange)]" />
                <span>Theme: Dark Fintech</span>
              </button>

              <button
                onClick={() => {
                  addToast({
                    title: 'Session Notice',
                    message: 'Simulated compliance session active.',
                    type: 'info'
                  });
                  setIsProfileOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-[#E5484D] hover:bg-[#E5484D]/15 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* HELP & AML GUIDELINES MODAL */}
      {isHelpOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <div className="max-w-md w-full p-6 rounded-[20px] bg-[#121215] border border-white/10 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[var(--brand-orange)]" />
                  <h3 className="text-sm font-semibold text-white">Monetrax AML Quick Guide</h3>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="text-[var(--caption)] hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-[var(--muted)] leading-relaxed">
                <p>
                  <strong className="text-white">Command Center:</strong> Monitors real-time financial telemetry, open high-risk cases, and suspicious corridor velocity.
                </p>
                <p>
                  <strong className="text-white">3D Globe & Satellite Handoff:</strong> Inspect cross-border transfers. Click any corridor row or case to fly dynamically from 3D space down to high-resolution satellite clearing locations.
                </p>
                <p>
                  <strong className="text-white">Auto-Triage & Risky AI:</strong> Autonomous ML triage clears recurring low-risk batches, while Risky Copilot provides contextual investigation insights.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setIsHelpOpen(false)} className="pill-btn-primary text-xs py-1.5 px-4">
                  Got it
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
