import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Check, Calendar } from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { Dropdown } from './Dropdown';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showPeriodPicker?: boolean;
}

const PERIOD_OPTIONS = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All Time' },
];

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showPeriodPicker = true
}) => {
  const timeRange = useAMLStore((s) => s.globalFilters.timeRange);
  const setGlobalFilter = useAMLStore((s) => s.setGlobalFilter);
  const resetDemoData = useAMLStore((s) => s.resetDemoData);
  const addToast = useAMLStore((s) => s.addToast);

  const selectedPeriod = PERIOD_OPTIONS.find((p) => p.id === timeRange) || PERIOD_OPTIONS[0];

  const handlePeriodChange = (periodId: string) => {
    setGlobalFilter('timeRange', periodId as any);
    addToast('Period Updated', `Surveillance window filtered to ${PERIOD_OPTIONS.find(p => p.id === periodId)?.label}.`, 'info');
  };

  const handleResetData = () => {
    resetDemoData();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 pt-1">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-semibold text-white tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls: Period Dropdown + Reset Data + Optional Custom Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {showPeriodPicker && (
          <>
            {/* Period Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-full bg-[#161619] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-[var(--text)] hover:text-white flex items-center gap-2 transition-all shadow-sm group"
                >
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand-orange)] opacity-85 group-hover:opacity-100" />
                  <span>{selectedPeriod.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--caption)] group-hover:text-white transition-transform" />
                </button>
              }
              items={PERIOD_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
                icon: opt.id === timeRange ? <Check className="w-3.5 h-3.5 text-[var(--brand-orange)]" /> : undefined,
                onClick: () => handlePeriodChange(opt.id)
              }))}
            />

            {/* Reset Data Button */}
            <button
              onClick={handleResetData}
              type="button"
              className="px-3 py-2 rounded-full bg-transparent hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-[var(--muted)] hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
              title="Reset sample data store"
            >
              <RotateCcw className="w-3 h-3 text-[var(--caption)]" />
              <span>Reset Data</span>
            </button>
          </>
        )}

        {actions}
      </div>
    </div>
  );
};
