import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './components/common/MotionComponents';
import { useLiveStreamEngine } from './hooks/useLiveStreamEngine';
import { useAMLStore } from './store/useAMLStore';
import { SidebarNav } from './components/layout/SidebarNav';
import { TopBar } from './components/layout/TopBar';
import { CommandPalette } from './components/common/CommandPalette';
import { AutoTriageModal } from './components/common/AutoTriageModal';
import { ToastContainer } from './components/common/ToastContainer';
import { HeroCommandView } from './components/views/HeroCommandView';
import { CaseQueueView } from './components/views/CaseQueueView';
import { TransactionDetailView } from './components/views/TransactionDetailView';
import { GlobeView } from './components/views/GlobeView';
import { ModelMethodologyView } from './components/views/ModelMethodologyView';
import { NetworkGraphView } from './components/views/NetworkGraphView';
import { Account360View } from './components/views/Account360View';
import { TypologyLibraryView } from './components/views/TypologyLibraryView';
import { SanctionsView } from './components/views/SanctionsView';
import { SARCenterView } from './components/views/SARCenterView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SystemHealthView } from './components/views/SystemHealthView';
import { SettingsView } from './components/views/SettingsView';
import { RiskyAssistant } from './components/assistant/RiskyAssistant';

export default function App() {
  // Activate live real-time stream simulation
  useLiveStreamEngine();

  const location = useLocation();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global command palette state from store
  const isCommandPaletteOpen = useAMLStore((s) => s.isCommandPaletteOpen);
  const openCommandPalette = useAMLStore((s) => s.openCommandPalette);
  const closeCommandPalette = useAMLStore((s) => s.closeCommandPalette);

  // 1. CURSOR SPOTLIGHT EFFECT: Interactive warm orange glow following pointer
  useEffect(() => {
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const targetX = e.clientX;
      const targetY = e.clientY;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (spotlightRef.current) {
          spotlightRef.current.style.setProperty('--cx', `${targetX}px`);
          spotlightRef.current.style.setProperty('--cy', `${targetY}px`);
        }
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openCommandPalette]);

  // Scroll to top on pathname change
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.getElementById('main-content-area');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full bg-[#0B0B0C] text-[#F5F5F6] flex font-sans overflow-x-hidden">
      {/* Interactive Cursor Spotlight Glow (fixed full-viewport, pointer-events: none) */}
      <div ref={spotlightRef} className="cursor-spotlight" aria-hidden="true" />

      {/* Subtle background ambient streaks (pointer-events-none) */}
      <div className="ambient-streak left-[15%] h-52" style={{ animationDelay: '0s' }} />
      <div className="ambient-streak left-[75%] h-44" style={{ animationDelay: '3s' }} />

      {/* =========================================================================
          LEFT SIDEBAR (240px desktop, collapsible to 72px icon rail, drawer on mobile)
          ========================================================================= */}
      <SidebarNav
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* =========================================================================
          MAIN CONTENT AREA (TopBar + Page Content View)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar inside content area */}
        <TopBar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable Page Content Container */}
        <main
          id="main-content-area"
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin relative z-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Routes location={location}>
                <Route path="/" element={<HeroCommandView />} />
                <Route path="/queue" element={<CaseQueueView />} />
                <Route path="/detail/:id" element={<TransactionDetailView />} />
                <Route path="/detail" element={<TransactionDetailView />} />
                <Route path="/globe" element={<GlobeView />} />
                <Route path="/model" element={<ModelMethodologyView />} />
                <Route path="/network" element={<NetworkGraphView />} />
                <Route path="/account/:id" element={<Account360View />} />
                <Route path="/account" element={<Account360View />} />
                <Route path="/typologies" element={<TypologyLibraryView />} />
                <Route path="/sanctions" element={<SanctionsView />} />
                <Route path="/sar" element={<SARCenterView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/system" element={<SystemHealthView />} />
                <Route path="/settings" element={<SettingsView />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* =========================================================================
          GLOBAL OVERLAYS: Command Palette, Auto-Triage Modal, Toasts, AI Assistant
          ========================================================================= */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} />
      <AutoTriageModal />
      <ToastContainer />
      <RiskyAssistant />
    </div>
  );
}
