import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAMLStore } from '../../store/useAMLStore';
import { Filter, X, RotateCcw, Calendar, Shield, Activity, Globe, CheckCircle2 } from 'lucide-react';
import { COUNTRIES } from '../../data/mockSeed';

export const GlobalFilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const globalFilters = useAMLStore((s) => s.globalFilters);
  const filterChips = useAMLStore((s) => s.filterChips);
  const setGlobalFilter = useAMLStore((s) => s.setGlobalFilter);
  const removeFilterChip = useAMLStore((s) => s.removeFilterChip);
  const clearAllFilters = useAMLStore((s) => s.clearAllFilters);

  // Sync URL search params into store on mount or param change
  useEffect(() => {
    const risk = searchParams.get('risk');
    const typo = searchParams.get('typology');
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const time = searchParams.get('time');

    if (risk && risk !== globalFilters.riskBand) setGlobalFilter('riskBand', risk as any);
    if (typo && typo !== globalFilters.typology) setGlobalFilter('typology', typo);
    if (status && status !== globalFilters.status) setGlobalFilter('status', status);
    if (country && country !== globalFilters.country) setGlobalFilter('country', country);
    if (time && time !== globalFilters.timeRange) setGlobalFilter('timeRange', time as any);
  }, [searchParams]);

  // Handle changing a filter and updating both store and URL
  const handleFilterChange = (key: keyof typeof globalFilters, value: string) => {
    setGlobalFilter(key as any, value);
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      newParams.delete(key === 'riskBand' ? 'risk' : key);
    } else {
      newParams.set(key === 'riskBand' ? 'risk' : key, value);
    }
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    clearAllFilters();
    setSearchParams(new URLSearchParams());
  };

  const handleRemoveChip = (chipId: string) => {
    const chip = filterChips.find(c => c.id === chipId);
    if (chip) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(chip.field === 'riskBand' ? 'risk' : chip.field);
      setSearchParams(newParams);
    }
    removeFilterChip(chipId);
  };

  const hasActiveFilters = filterChips.length > 0 || Object.values(globalFilters).some(v => v !== 'all' && v !== '');

  return (
    <div className="w-full flex flex-col gap-2.5 pb-2">
      {/* Top Filter Bar Controls */}
      <div className="glass-panel px-3.5 py-2 flex items-center justify-between gap-3 flex-wrap text-xs border border-[var(--line)]">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <Filter className="w-3.5 h-3.5 text-[var(--sage-2)]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--sage-3)]">Global Scope</span>
        </div>

        {/* Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-[var(--line)] rounded-full px-2.5 py-1 text-xs">
            <Calendar className="w-3 h-3 text-[var(--muted)]" />
            <select
              value={globalFilters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="bg-transparent text-[var(--text)] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0B0F0D]">Window: All 30d</option>
              <option value="24h" className="bg-[#0B0F0D]">Last 24 Hours</option>
              <option value="7d" className="bg-[#0B0F0D]">Last 7 Days</option>
              <option value="30d" className="bg-[#0B0F0D]">Last 30 Days</option>
            </select>
          </div>

          {/* Risk Band */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-[var(--line)] rounded-full px-2.5 py-1 text-xs">
            <Shield className="w-3 h-3 text-[var(--muted)]" />
            <select
              value={globalFilters.riskBand}
              onChange={(e) => handleFilterChange('riskBand', e.target.value)}
              className="bg-transparent text-[var(--text)] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0B0F0D]">Risk: All Tiers</option>
              <option value="critical" className="bg-[#0B0F0D]">Critical (≥70)</option>
              <option value="medium" className="bg-[#0B0F0D]">Medium (40-69)</option>
              <option value="low" className="bg-[#0B0F0D]">Low (&lt;40)</option>
            </select>
          </div>

          {/* Typology */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-[var(--line)] rounded-full px-2.5 py-1 text-xs">
            <Activity className="w-3 h-3 text-[var(--muted)]" />
            <select
              value={globalFilters.typology}
              onChange={(e) => handleFilterChange('typology', e.target.value)}
              className="bg-transparent text-[var(--text)] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0B0F0D]">Typology: All Patterns</option>
              <option value="structuring" className="bg-[#0B0F0D]">Structuring (&lt;$10k)</option>
              <option value="cyclic_flow" className="bg-[#0B0F0D]">Cyclic Layering</option>
              <option value="mule_fan" className="bg-[#0B0F0D]">Mule Fan-In/Out</option>
              <option value="rapid_passthrough" className="bg-[#0B0F0D]">Rapid Pass-Through</option>
              <option value="dormant_burst" className="bg-[#0B0F0D]">Dormant Burst</option>
            </select>
          </div>

          {/* Country Jurisdiction */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-[var(--line)] rounded-full px-2.5 py-1 text-xs">
            <Globe className="w-3 h-3 text-[var(--muted)]" />
            <select
              value={globalFilters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="bg-transparent text-[var(--text)] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0B0F0D]">Country: All Jurisdictions</option>
              {COUNTRIES.slice(0, 15).map(c => (
                <option key={c.code} value={c.code} className="bg-[#0B0F0D]">{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-[var(--line)] rounded-full px-2.5 py-1 text-xs">
            <CheckCircle2 className="w-3 h-3 text-[var(--muted)]" />
            <select
              value={globalFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="bg-transparent text-[var(--text)] text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0B0F0D]">Status: All Cases</option>
              <option value="New" className="bg-[#0B0F0D]">New</option>
              <option value="Under Review" className="bg-[#0B0F0D]">Under Review</option>
              <option value="Escalated" className="bg-[#0B0F0D]">Escalated</option>
              <option value="SAR Filed" className="bg-[#0B0F0D]">SAR Filed</option>
              <option value="Cleared" className="bg-[#0B0F0D]">Cleared</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-[11px] text-[var(--muted)] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--line)] hover:border-white/30 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Removable Active Chips Row */}
      {filterChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap px-1">
          <span className="text-[10px] text-[var(--muted)] uppercase font-mono mr-1">Active Filters:</span>
          {filterChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-white/[0.05] border border-[var(--line)] text-[var(--text)] font-sans"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => handleRemoveChip(chip.id)}
                className="hover:text-[var(--risk-red)] transition-colors p-0.5"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className="text-[10px] text-[var(--muted)] hover:text-white underline ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
