import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  Search, 
  Layers, 
  Globe2, 
  Cpu, 
  Activity, 
  Share2, 
  BookOpen, 
  ShieldAlert, 
  FileText, 
  BarChart3, 
  HardDrive,
  UserCheck,
  Sparkles,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const transactions = useAMLStore((s) => s.transactions);
  const accounts = useAMLStore((s) => s.accounts);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const selectAccount = useAMLStore((s) => s.selectAccount);
  const addFilterChip = useAMLStore((s) => s.addFilterChip);

  // Lock body scroll when palette is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const pages = [
    { label: 'Command Center', path: '/', icon: <Activity className="w-4 h-4 text-[#FF6A2B]" />, category: 'Navigation' },
    { label: 'Case Queue', path: '/queue', icon: <Layers className="w-4 h-4 text-[#FF6A2B]" />, category: 'Navigation' },
    { label: '3D Surveillance Globe', path: '/globe', icon: <Globe2 className="w-4 h-4 text-[#FF6A2B]" />, category: 'Navigation' },
    { label: 'Network Graph & Replay', path: '/network', icon: <Share2 className="w-4 h-4 text-[#FF6A2B]" />, category: 'Investigation' },
    { label: 'Typology Library', path: '/typologies', icon: <BookOpen className="w-4 h-4 text-[#FF6A2B]" />, category: 'Investigation' },
    { label: 'Sanctions & PEP Screening', path: '/sanctions', icon: <ShieldAlert className="w-4 h-4 text-[#FF6A2B]" />, category: 'Investigation' },
    { label: 'SAR Filing Center', path: '/sar', icon: <FileText className="w-4 h-4 text-[#FF6A2B]" />, category: 'Compliance' },
    { label: 'Analytics & Reporting', path: '/analytics', icon: <BarChart3 className="w-4 h-4 text-[#FF6A2B]" />, category: 'Analytics' },
    { label: 'Account 360 Profile', path: '/account', icon: <UserCheck className="w-4 h-4 text-[#FF6A2B]" />, category: 'Investigation' },
    { label: 'Model Lab & Methodology', path: '/model', icon: <Cpu className="w-4 h-4 text-[#FF6A2B]" />, category: 'Model & ML' },
    { label: 'System Health & Pipeline', path: '/system', icon: <HardDrive className="w-4 h-4 text-[#FF6A2B]" />, category: 'Operations' },
    { label: 'System Settings', path: '/settings', icon: <Cpu className="w-4 h-4 text-[#FF6A2B]" />, category: 'Operations' }
  ];

  // Filter items based on query
  const filteredPages = pages.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));

  const flaggedCases = transactions
    .filter(t => t.riskScore >= 70)
    .filter(t => t.id.toLowerCase().includes(query.toLowerCase()) || t.typologyLabel.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const filteredAccounts = accounts
    .filter(a => a.id.toLowerCase().includes(query.toLowerCase()) || a.entityName.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const isNLQuery = query.trim().length >= 3 && !query.startsWith('#');

  const allItems = [
    ...(isNLQuery ? [{
      type: 'nl_query' as const,
      label: `Natural Language Case Search: "${query}"`,
      queryText: query,
      category: 'AI NLP Filter'
    }] : []),
    ...filteredPages.map(p => ({ type: 'page' as const, ...p })),
    ...flaggedCases.map(c => ({ 
      type: 'case' as const, 
      label: `Case #${c.id} — ${c.typologyLabel} ($${c.amount.toLocaleString()})`, 
      id: c.id, 
      category: 'Cases' 
    })),
    ...filteredAccounts.map(a => ({ 
      type: 'account' as const, 
      label: `${a.id} — ${a.entityName} (Risk: ${a.riskScore})`, 
      id: a.id, 
      category: 'Accounts' 
    }))
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation & Escape handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % Math.max(1, allItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + allItems.length) % Math.max(1, allItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allItems]);

  const executeItem = async (item: typeof allItems[0]) => {
    if (item.type === 'page') {
      navigate(item.path);
    } else if (item.type === 'case') {
      selectTxn(item.id);
      navigate(`/detail/${item.id}`);
    } else if (item.type === 'account') {
      selectAccount(item.id);
      navigate(`/account/${item.id}`);
    } else if (item.type === 'nl_query') {
      try {
        const res = await fetch('/api/ai/structured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'nl_search', query: item.queryText })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.chips && data.chips.length > 0) {
            data.chips.forEach((c: any) => {
              addFilterChip({
                id: `chip-${Date.now()}-${Math.random()}`,
                label: c.label,
                field: c.field || c.key,
                value: c.value !== undefined ? c.value : c.val
              });
            });
            navigate('/queue');
            onClose();
            return;
          }
        }
      } catch (err) {}
      addFilterChip({
        id: `chip-${Date.now()}`,
        label: `"${item.queryText}"`,
        field: 'raw',
        value: item.queryText.toLowerCase()
      });
      navigate('/queue');
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl p-5 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col gap-3 bg-[#121215] rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <Search className="w-4 h-4 text-[#FF6A2B] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, case #TXN-..., or natural language search..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[var(--caption)] focus:outline-none font-sans"
          />
          <button 
            onClick={onClose} 
            className="text-[var(--muted)] hover:text-white p-1 rounded-md transition-colors"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto flex flex-col gap-1 py-1 pr-2 overscroll-contain scrollbar-thin">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--caption)] font-mono">
              No matching pages, cases, or accounts found.
            </div>
          ) : (
            allItems.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={`${item.category}-${index}`}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#FF6A2B]/20 to-[#FF4D1A]/10 text-white font-medium border border-[#FF6A2B]/40 shadow-sm' 
                      : 'text-white/90 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.type === 'page' ? (
                      item.icon
                    ) : item.type === 'case' ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[#E5484D] shrink-0" />
                    ) : item.type === 'nl_query' ? (
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6A2B] shrink-0 animate-pulse" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-[#4ADE9A] shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.type === 'case' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          flyToCase(item.id);
                          navigate(`/globe?case=${item.id}&view=map`);
                          onClose();
                        }}
                        className="p-1 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                        title="Fly to Location on Map"
                      >
                        <Globe2 className="w-3 h-3 text-[#FF6A2B]" />
                      </button>
                    )}
                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/70 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.08] text-[11px] text-[var(--caption)] font-mono">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/15 font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/15 font-mono text-[10px]">↵</kbd> Select
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/15 font-mono text-[10px]">ESC</kbd> Close
            </span>
          </div>
          <span className="text-[#FF6A2B] font-sans font-medium text-[10px]">Monetrax Command (⌘K)</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
