import React, { useState, useEffect } from 'react';
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

  const pages = [
    { label: 'Command Center', path: '/', icon: <Activity className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Navigation' },
    { label: 'Case Queue', path: '/queue', icon: <Layers className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Navigation' },
    { label: '3D Surveillance Globe', path: '/globe', icon: <Globe2 className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Navigation' },
    { label: 'Network Graph & Replay', path: '/network', icon: <Share2 className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Investigation' },
    { label: 'Typology Library', path: '/typologies', icon: <BookOpen className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Investigation' },
    { label: 'Sanctions & PEP Screening', path: '/sanctions', icon: <ShieldAlert className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Investigation' },
    { label: 'SAR Filing Center', path: '/sar', icon: <FileText className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Compliance' },
    { label: 'Analytics & Reporting', path: '/analytics', icon: <BarChart3 className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Analytics' },
    { label: 'Account 360 Profile', path: '/account', icon: <UserCheck className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Investigation' },
    { label: 'Model Lab & Methodology', path: '/model', icon: <Cpu className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Model & ML' },
    { label: 'System Health & Pipeline', path: '/system', icon: <HardDrive className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Operations' },
    { label: 'System Settings', path: '/settings', icon: <Cpu className="w-4 h-4 text-[var(--sage-2)]" />, category: 'Operations' }
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

  const allItems = [
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

  // Keyboard navigation
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

  const executeItem = (item: typeof allItems[0]) => {
    if (item.type === 'page') {
      navigate(item.path);
    } else if (item.type === 'case') {
      selectTxn(item.id);
      navigate(`/detail/${item.id}`);
    } else if (item.type === 'account') {
      selectAccount(item.id);
      navigate(`/account/${item.id}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl glass-panel p-4 border border-white/20 shadow-2xl flex flex-col gap-3 bg-[#0B0F0D]/95 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[var(--line)]">
          <Search className="w-4 h-4 text-[var(--sage-2)]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, case #TXN-..., or account..."
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none font-sans"
          />
          <button onClick={onClose} className="text-[var(--muted)] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto flex flex-col gap-1 py-1">
          {allItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--muted)]">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/10 text-white font-medium' : 'text-[var(--text)] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.type === 'page' ? (
                      item.icon
                    ) : item.type === 'case' ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[var(--risk-red)]" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-[var(--sage-2)]" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.type === 'case' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          flyToCase(item.id);
                          navigate(`/globe?case=${item.id}&view=map`);
                          onClose();
                        }}
                        className="p-1 rounded-full bg-white/[0.06] hover:bg-white/20 text-[var(--muted)] hover:text-white transition-colors"
                        title="Fly to Location on Map"
                      >
                        <Globe2 className="w-3 h-3 text-[var(--sage-3)]" />
                      </button>
                    )}
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--muted)]">
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] text-[10px] text-[var(--muted)] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[var(--sage-3)]">Monetrax Global Command</span>
        </div>
      </div>
    </div>
  );
};
