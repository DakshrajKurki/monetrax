import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  Search, 
  X, 
  Sparkles, 
  ArrowRight, 
  Globe2, 
  ShieldAlert, 
  Clock, 
  Check, 
  Info, 
  Layers, 
  CheckSquare, 
  Square, 
  LayoutList, 
  Kanban as KanbanIcon,
  ChevronRight,
  User,
  Filter,
  AlertCircle
} from 'lucide-react';
import { pageVariants } from '../common/MotionComponents';
import { GlobalFilterBar } from '../common/GlobalFilterBar';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Transaction, CaseStatus } from '../../types';
import { formatCurrency, formatSLA, formatRelativeTime } from '../../utils/formatters';

export const CaseQueueView: React.FC = () => {
  const navigate = useNavigate();
  const transactions = useAMLStore((s) => s.transactions);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const filterChips = useAMLStore((s) => s.filterChips);
  const addFilterChip = useAMLStore((s) => s.addFilterChip);
  const removeFilterChip = useAMLStore((s) => s.removeFilterChip);
  const clearAllFilters = useAMLStore((s) => s.clearAllFilters);
  const openAutoTriageModal = useAMLStore((s) => s.openAutoTriageModal);
  const isAutoTriageModalOpen = useAMLStore((s) => s.isAutoTriageModalOpen);
  const closeAutoTriageModal = useAMLStore((s) => s.closeAutoTriageModal);
  const confirmAutoTriage = useAMLStore((s) => s.confirmAutoTriage);
  const autoTriageCandidates = useAMLStore((s) => s.autoTriageCandidates);
  const autoTriageReasoning = useAMLStore((s) => s.autoTriageReasoning);
  const updateCaseStatus = useAMLStore((s) => s.updateCaseStatus);
  const bulkUpdateCaseStatus = useAMLStore((s) => s.bulkUpdateCaseStatus);
  const globalFilters = useAMLStore((s) => s.globalFilters);

  const [inputVal, setInputVal] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedView, setSavedView] = useState<'all' | 'structuring' | 'urgent_sla' | 'escalated' | 'cleared'>('all');
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);

  // Natural Language filter parser
  const handleNlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    try {
      const res = await fetch('/api/ai/structured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'nl_search', query: inputVal })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chips && data.chips.length > 0) {
          data.chips.forEach((c: any) => {
            addFilterChip({
              id: `chip-${Date.now()}-${Math.random()}`,
              label: c.label,
              field: c.key,
              value: c.val
            });
          });
          setInputVal('');
          return;
        }
      }
    } catch (err) {}

    addFilterChip({
      id: `chip-${Date.now()}`,
      label: `"${inputVal}"`,
      field: 'raw',
      value: inputVal.toLowerCase()
    });
    setInputVal('');
  };

  // Filtered dataset
  const filteredCases = useMemo(() => {
    return transactions.filter(item => {
      // Saved views
      if (savedView === 'structuring' && item.typology !== 'structuring') return false;
      if (savedView === 'urgent_sla' && item.slaSecondsRemaining > 7200) return false;
      if (savedView === 'escalated' && item.status !== 'Escalated' && item.status !== 'SAR Filed') return false;
      if (savedView === 'cleared' && item.status !== 'Cleared') return false;

      // Global filters
      if (globalFilters.riskBand === 'critical' && item.riskScore < 70) return false;
      if (globalFilters.riskBand === 'medium' && (item.riskScore < 40 || item.riskScore >= 70)) return false;
      if (globalFilters.riskBand === 'low' && item.riskScore >= 40) return false;
      if (globalFilters.typology !== 'all' && item.typology !== globalFilters.typology) return false;
      if (globalFilters.country !== 'all' && item.fromCountryCode !== globalFilters.country && item.toCountryCode !== globalFilters.country) return false;
      if (globalFilters.status !== 'all' && item.status !== globalFilters.status) return false;

      // Filter chips
      for (const chip of filterChips) {
        if (chip.field === 'typology' && item.typology !== chip.value) return false;
        if (chip.field === 'minAmount' && item.amount < chip.value) return false;
        if (chip.field === 'minRisk' && item.riskScore < chip.value) return false;
        if (chip.field === 'raw') {
          const raw = String(chip.value);
          const match = 
            item.id.toLowerCase().includes(raw) ||
            item.fromAccount.toLowerCase().includes(raw) ||
            item.toAccount.toLowerCase().includes(raw) ||
            item.typologyLabel.toLowerCase().includes(raw) ||
            item.fromCity.toLowerCase().includes(raw) ||
            item.toCity.toLowerCase().includes(raw) ||
            item.fromBank.toLowerCase().includes(raw);
          if (!match) return false;
        }
      }
      return true;
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [transactions, savedView, globalFilters, filterChips]);

  // Bulk Multi-Select Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCases.map(c => c.id)));
    }
  };

  const toggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = (status: CaseStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    bulkUpdateCaseStatus(ids, status, `Bulk updated by analyst`);
    setSelectedIds(new Set());
  };

  // Kanban Columns
  const kanbanColumns: { status: CaseStatus; title: string; color: string }[] = [
    { status: 'New', title: 'New Alerts', color: 'var(--risk-red)' },
    { status: 'Under Review', title: 'Under Review', color: 'var(--risk-amber)' },
    { status: 'Escalated', title: 'Escalated', color: '#C4D2C8' },
    { status: 'SAR Filed', title: 'SAR Filed', color: 'var(--sage-2)' },
    { status: 'Cleared', title: 'Cleared (False Pos)', color: 'var(--live)' }
  ];

  // Drag and Drop handlers for Kanban
  const handleDragStart = (id: string) => {
    setDraggedCaseId(id);
  };

  const handleDropOnColumn = (targetStatus: CaseStatus) => {
    if (draggedCaseId) {
      updateCaseStatus(draggedCaseId, targetStatus, `Moved to ${targetStatus} via Kanban board.`);
      setDraggedCaseId(null);
    }
  };

  // DataTable column definitions
  const columns: ColumnDef<Transaction>[] = [
    {
      key: 'select',
      header: '',
      sortable: false,
      headerClassName: 'w-10',
      className: 'w-10',
      render: (row) => (
        <div 
          onClick={(e) => toggleSelectRow(row.id, e)} 
          className="cursor-pointer text-[var(--muted)] hover:text-white"
        >
          {selectedIds.has(row.id) ? (
            <CheckSquare className="w-4 h-4 text-[var(--sage-2)]" />
          ) : (
            <Square className="w-4 h-4 opacity-50" />
          )}
        </div>
      )
    },
    {
      key: 'riskScore',
      header: 'Risk & Rank',
      sortable: true,
      accessor: (row) => row.riskScore,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-semibold ${
            row.riskScore >= 70
              ? 'border-[var(--risk-red)]/40 text-[var(--risk-red)] bg-[var(--risk-red)]/10'
              : 'border-[var(--risk-amber)]/40 text-[var(--risk-amber)] bg-[var(--risk-amber)]/10'
          }`}>
            {Math.round(row.riskScore)}
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] font-mono block">Rank #{row.priorityRank}</span>
            <span className="text-[11px] text-[var(--text)] line-clamp-1 max-w-[200px]" title={row.whyRanked}>
              {row.whyRanked}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'id',
      header: 'Case ID / Typology',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-mono text-white font-medium">
            <span>#{row.id}</span>
          </div>
          <span className={`text-[11px] font-sans block ${row.riskScore >= 70 ? 'text-[var(--risk-red)]' : 'text-[var(--risk-amber)]'}`}>
            {row.typologyLabel}
          </span>
        </div>
      )
    },
    {
      key: 'counterparties',
      header: 'Counterparty Flow',
      sortable: false,
      render: (row) => (
        <div>
          <div className="font-mono text-xs text-[var(--text)] flex items-center gap-1">
            <span>{row.fromAccount}</span>
            <span className="opacity-40">➔</span>
            <span>{row.toAccount}</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] font-light mt-0.5">
            {row.fromCity} ({row.fromBank.split(' ')[0]}) ➔ {row.toCity} ({row.toBank.split(' ')[0]})
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount / Method',
      sortable: true,
      accessor: (row) => row.amount,
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-medium text-white block tabular-nums">
            {formatCurrency(row.amount)}
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">
            {row.paymentFormat} • {row.currency}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => row.status,
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
          row.status === 'New' 
            ? 'bg-[var(--risk-red)]/15 border-[var(--risk-red)]/30 text-[var(--risk-red)]'
            : row.status === 'Under Review'
            ? 'bg-[var(--risk-amber)]/15 border-[var(--risk-amber)]/30 text-[var(--risk-amber)]'
            : row.status === 'Escalated' || row.status === 'SAR Filed'
            ? 'bg-[var(--sage-2)]/15 border-[var(--sage-2)]/30 text-[var(--sage-3)]'
            : 'bg-[var(--live)]/15 border-[var(--live)]/30 text-[var(--live)]'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'sla',
      header: 'SLA Countdown',
      sortable: true,
      accessor: (row) => row.slaSecondsRemaining,
      render: (row) => {
        const sla = formatSLA(row.slaSecondsRemaining);
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Clock className={`w-3.5 h-3.5 ${sla.isUrgent ? 'text-[var(--risk-red)] animate-pulse' : 'text-[var(--muted)]'}`} />
            <span className={sla.isUrgent ? 'text-[var(--risk-red)] font-semibold' : 'text-[var(--muted)]'}>
              {sla.text}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              flyToCase(row.id);
              navigate(`/globe?case=${row.id}&view=map`);
            }}
            className="w-7 h-7 rounded-full bg-white/[0.03] border border-[var(--line)] hover:border-white/30 flex items-center justify-center text-[var(--muted)] hover:text-white transition-colors"
            title="Fly to Location on Map"
          >
            <Globe2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              selectTxn(row.id);
              navigate(`/detail/${row.id}`);
            }}
            className="pill-btn-secondary text-[11px] flex items-center gap-1 py-1 px-3"
          >
            <span>Investigate</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-16">
      {/* Top Scope Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              Case Triage Queue
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-mono font-medium border border-[var(--risk-red)]/30">
              {filteredCases.length} Active Candidates
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Ranked continuously by stacked meta-learner blending risk, exposure amount, typology severity, and SLA countdown.
          </p>
        </div>

        {/* View Toggle & Auto-Triage */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Table vs Kanban Toggle */}
          <div className="flex items-center bg-white/[0.03] border border-[var(--line)] rounded-full p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${viewMode === 'table' ? 'bg-white text-darkCanvas font-medium shadow-sm' : 'text-[var(--muted)] hover:text-white'}`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${viewMode === 'kanban' ? 'bg-white text-darkCanvas font-medium shadow-sm' : 'text-[var(--muted)] hover:text-white'}`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* AI Auto-Triage Queue Button */}
          <button
            onClick={openAutoTriageModal}
            className="pill-btn-primary text-xs flex items-center gap-1.5 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>AI Auto-Triage Queue</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar Sync */}
      <GlobalFilterBar />

      {/* Natural Language Query Search Bar */}
      <form onSubmit={handleNlSearch} className="w-full relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask or filter in natural language (e.g. 'structuring cases over $50k', 'mule network high risk')..."
            className="w-full pl-11 pr-28 py-3 rounded-full bg-white/[0.02] border border-[var(--line)] focus:border-[var(--sage-2)] text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 pill-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[var(--sage-2)]" />
            <span>Parse Filter</span>
          </button>
        </div>
      </form>

      {/* Saved Views Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] text-[var(--muted)] uppercase font-mono mr-2">Views:</span>
        <button
          onClick={() => setSavedView('all')}
          className={`px-3 py-1 rounded-full transition-all ${savedView === 'all' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white bg-white/[0.02] border border-[var(--line)]'}`}
        >
          All High Priority
        </button>
        <button
          onClick={() => setSavedView('structuring')}
          className={`px-3 py-1 rounded-full transition-all ${savedView === 'structuring' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white bg-white/[0.02] border border-[var(--line)]'}`}
        >
          Structuring (&lt;$10k)
        </button>
        <button
          onClick={() => setSavedView('urgent_sla')}
          className={`px-3 py-1 rounded-full transition-all ${savedView === 'urgent_sla' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white bg-white/[0.02] border border-[var(--line)]'}`}
        >
          SLA Urgent (&lt;2h)
        </button>
        <button
          onClick={() => setSavedView('escalated')}
          className={`px-3 py-1 rounded-full transition-all ${savedView === 'escalated' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white bg-white/[0.02] border border-[var(--line)]'}`}
        >
          Escalated for SAR
        </button>
        <button
          onClick={() => setSavedView('cleared')}
          className={`px-3 py-1 rounded-full transition-all ${savedView === 'cleared' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white bg-white/[0.02] border border-[var(--line)]'}`}
        >
          Cleared
        </button>
      </div>

      {/* Bulk Multi-Select Floating Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="sticky top-4 z-30 w-full glass-panel px-4 py-2.5 rounded-full border border-white/20 bg-[#0B0F0D]/95 shadow-2xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[var(--sage-2)] text-black font-bold flex items-center justify-center text-[10px]">
                {selectedIds.size}
              </span>
              <span className="text-white font-medium">Cases Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('Escalated')}
                className="pill-btn-secondary text-[11px] py-1 px-3 text-[var(--risk-red)] border-[var(--risk-red)]/30 hover:bg-[var(--risk-red)]/10"
              >
                Bulk Escalate (SAR)
              </button>
              <button
                onClick={() => handleBulkAction('Under Review')}
                className="pill-btn-secondary text-[11px] py-1 px-3"
              >
                Mark Under Review
              </button>
              <button
                onClick={() => handleBulkAction('Cleared')}
                className="pill-btn-secondary text-[11px] py-1 px-3 text-[var(--live)] border-[var(--live)]/30 hover:bg-[var(--live)]/10"
              >
                Clear as False Pos
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[var(--muted)] hover:text-white p-1"
                title="Deselect All"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Table View vs Kanban Board */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredCases}
          columns={columns}
          pageSize={25}
          onRowClick={(row) => {
            selectTxn(row.id);
            navigate(`/detail/${row.id}`);
          }}
          onClearFilters={clearAllFilters}
          exportFilename="monetrax-cases"
        />
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4 items-start pb-8 overflow-x-auto">
          {kanbanColumns.map(col => {
            const columnCases = filteredCases.filter(c => c.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnColumn(col.status)}
                className="glass-panel p-3 border border-[var(--line)] rounded-2xl flex flex-col gap-2.5 min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-xs font-medium text-white">{col.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)] bg-white/[0.04] px-2 py-0.5 rounded-full">
                    {columnCases.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex flex-col gap-2 min-h-[350px]">
                  {columnCases.length === 0 ? (
                    <div className="py-12 text-center text-[10px] text-[var(--muted)] italic">
                      Drag cases here
                    </div>
                  ) : (
                    columnCases.map(item => (
                      <motion.div
                        layoutId={`case-card-${item.id}`}
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onClick={() => {
                          selectTxn(item.id);
                          navigate(`/detail/${item.id}`);
                        }}
                        className="glass-panel p-3 border border-[var(--line)] hover:border-[var(--sage-2)]/50 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col gap-2 bg-[#0B0F0D]/90 group"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-white font-medium">#{item.id}</span>
                          <span className={`px-1.5 py-0.2 rounded-full font-mono font-bold ${item.riskScore >= 70 ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)]' : 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)]'}`}>
                            {Math.round(item.riskScore)}
                          </span>
                        </div>

                        <p className="text-[11px] text-[var(--text)] line-clamp-2 leading-snug">
                          {item.typologyLabel}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                          <span>{formatCurrency(item.amount)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatSLA(item.slaSecondsRemaining).text}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto-Triage Confirmation Modal */}
      {isAutoTriageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-white/20 shadow-2xl bg-[#0B0F0D] flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--line)]">
              <Sparkles className="w-4 h-4 text-[var(--sage-3)]" />
              <h3 className="text-sm font-medium text-white">AI Auto-Triage Verification</h3>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {autoTriageReasoning}
            </p>

            <div className="max-h-48 overflow-y-auto divide-y divide-[var(--line)] border border-[var(--line)] rounded-xl p-2 bg-white/[0.01]">
              {autoTriageCandidates.map(c => (
                <div key={c.id} className="py-2 px-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-white font-medium">#{c.id}</span>
                    <span className="text-[var(--muted)] ml-2">{c.fromCity} ➔ {c.toCity}</span>
                  </div>
                  <span className="font-mono text-[var(--live)] font-medium">
                    {c.riskScore.toFixed(0)} Risk (Benign)
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={closeAutoTriageModal}
                className="pill-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmAutoTriage}
                className="pill-btn-primary text-xs"
              >
                Confirm Auto-Clear ({autoTriageCandidates.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
