import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  SlidersHorizontal, 
  Eye, 
  SearchX,
  RotateCcw
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => any;
  className?: string;
  headerClassName?: string;
  defaultVisible?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  selectedRowId?: string;
  getRowId?: (row: T) => string;
  exportFilename?: string;
  onClearFilters?: () => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 25,
  isLoading = false,
  onRowClick,
  selectedRowId,
  getRowId = (row) => row.id || JSON.stringify(row),
  exportFilename = 'monetrax-export',
  onClearFilters,
  emptyMessage = 'No transactions match the selected surveillance criteria.'
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [visibleColKeys, setVisibleColKeys] = useState<Set<string>>(() => {
    return new Set(columns.filter(c => c.defaultVisible !== false).map(c => c.key));
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let valA = col.accessor ? col.accessor(a) : a[sortKey];
      let valB = col.accessor ? col.accessor(b) : b[sortKey];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (sortDir === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });
  }, [data, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'desc') setSortDir('asc');
      else {
        setSortKey(null);
        setSortDir('desc');
      }
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleToggleCol = (key: string) => {
    setVisibleColKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 2) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    const activeCols = columns.filter(c => visibleColKeys.has(c.key));
    const headers = activeCols.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(row => {
      return activeCols.map(c => {
        const val = c.accessor ? c.accessor(row) : row[c.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeColumns = columns.filter(c => visibleColKeys.has(c.key));

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Table Action Controls */}
      <div className="flex items-center justify-between gap-3 text-xs flex-wrap px-1">
        <div className="text-[var(--muted)] font-mono">
          Showing <span className="text-[var(--text)] font-medium tabular-nums">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> - <span className="text-[var(--text)] font-medium tabular-nums">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="text-[var(--text)] font-medium tabular-nums">{sortedData.length}</span> records
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Row Density Toggle */}
          <div className="flex items-center bg-white/[0.03] border border-[var(--line)] rounded-full p-0.5">
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${density === 'comfortable' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${density === 'compact' ? 'bg-white text-darkCanvas font-medium' : 'text-[var(--muted)] hover:text-white'}`}
            >
              Dense
            </button>
          </div>

          {/* Column Visibility Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="pill-btn-secondary text-[11px] flex items-center gap-1.5 px-3 py-1"
              title="Show / hide columns"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--sage-2)]" />
              <span>Columns</span>
            </button>

            {showColMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-panel p-2 z-40 shadow-2xl border border-[var(--line)] flex flex-col gap-1 text-xs">
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono px-2 py-1">Toggle Columns</span>
                {columns.map(c => (
                  <label key={c.key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.05] cursor-pointer text-[var(--text)]">
                    <input
                      type="checkbox"
                      checked={visibleColKeys.has(c.key)}
                      onChange={() => handleToggleCol(c.key)}
                      className="rounded accent-[var(--sage-2)]"
                    />
                    <span>{c.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="pill-btn-secondary text-[11px] flex items-center gap-1.5 px-3 py-1"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[var(--sage-2)]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full overflow-x-auto rounded-[20px] glass-panel border border-[var(--line)]">
        <table className="w-full text-left text-xs border-collapse font-sans">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-[#0B0F0D]/95 backdrop-blur-md border-b border-[var(--line)]">
            <tr>
              {activeColumns.map(col => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`py-3 px-4 font-normal text-[var(--muted)] select-none uppercase tracking-wider text-[11px] font-mono ${col.sortable !== false ? 'cursor-pointer hover:text-white transition-colors' : ''} ${col.headerClassName || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="flex flex-col text-[10px]">
                          {isSorted ? (
                            sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[var(--sage-2)]" /> : <ChevronDown className="w-3 h-3 text-[var(--sage-2)]" />
                          ) : (
                            <span className="w-3 h-3 opacity-25">↕</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-[var(--line)]">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {activeColumns.map(c => (
                    <td key={c.key} className="py-3 px-4">
                      <div className="h-3 bg-white/[0.05] rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={activeColumns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <SearchX className="w-8 h-8 text-[var(--muted)] opacity-50" />
                    <p className="text-sm text-[var(--muted)] font-light max-w-sm">
                      {emptyMessage}
                    </p>
                    {onClearFilters && (
                      <button
                        onClick={onClearFilters}
                        className="pill-btn-secondary text-xs flex items-center gap-1.5 mt-2"
                      >
                        <RotateCcw className="w-3 h-3 text-[var(--sage-2)]" />
                        <span>Clear Active Filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = getRowId(row);
                const isSelected = selectedRowId === rowId;
                const py = density === 'compact' ? 'py-2' : 'py-3.5';

                return (
                  <motion.tr
                    key={rowId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors group ${isSelected ? 'bg-white/[0.07] border-l-2 border-l-[var(--sage-2)]' : 'hover:bg-white/[0.03]'} ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {activeColumns.map(col => (
                      <td key={col.key} className={`${py} px-4 text-[var(--text)] font-sans ${col.className || ''}`}>
                        {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1">
            <span>Page</span>
            <span className="text-white font-medium tabular-nums">{currentPage}</span>
            <span>of</span>
            <span className="text-white font-medium tabular-nums">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-full border border-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/30 text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-full border border-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-white/30 text-white flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
