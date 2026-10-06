import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './components/common/MotionComponents';
import { useLiveStreamEngine } from './hooks/useLiveStreamEngine';
import { HeaderNav } from './components/layout/HeaderNav';
import { IntegrationsStrip } from './components/layout/IntegrationsStrip';
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

  // 1. CURSOR SPOTLIGHT EFFECT: Interactive glow following pointer across all pages
  useEffect(() => {
    let rafId: number | null = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

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

  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Interactive Cursor Spotlight Glow (fixed full-viewport, pointer-events: none) */}
      <div ref={spotlightRef} className="cursor-spotlight" aria-hidden="true" />

      {/* Subtle background ambient streaks (pointer-events-none) */}
      <div className="ambient-streak left-[15%] h-52" style={{ animationDelay: '0s' }} />
      <div className="ambient-streak left-[75%] h-44" style={{ animationDelay: '3s' }} />

      {/* =========================================================================
          MAIN ROUNDED GLASS STAGE FRAME (Exact Reference Architecture)
          ========================================================================= */}
      <div className="stage-frame w-full max-w-[1440px] mx-auto min-h-[820px] p-4 sm:p-8 flex flex-col relative">
        {/* Soft Blurred Drifting Sage Orbs Behind Content (pointer-events-none) */}
        <div className="sage-glow-highlight" />
        <div className="sage-glow-1 top-24 right-12" />
        <div className="sage-glow-2 top-72 right-48" />

        {/* Top Header Navigation (inside top of stage) */}
        <HeaderNav />

        {/* Dynamic Route Content with Framer Motion Page Transitions */}
        <div className="relative z-10 w-full flex-1 flex flex-col pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-1 flex flex-col"
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
        </div>
      </div>

      {/* Row of Invented Generic Names Below Stage */}
      <IntegrationsStrip />

      {/* Persistent Floating AI Assistant ("Risky") at Bottom Right */}
      <RiskyAssistant />
    </div>
  );
}
