import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  UserCheck, 
  Globe2, 
  ArrowRight,
  ShieldCheck,
  Download,
  Clock
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';
import { SANCTIONS_WATCHLIST } from '../../data/mockSeed';
import { SanctionsEntry } from '../../types';

export const SanctionsView: React.FC = () => {
  const addToast = useAMLStore((s) => s.addToast);
  const transactions = useAMLStore((s) => s.transactions);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState<string>('all');
  const [screeningInput, setScreeningInput] = useState('');
  const [screeningResult, setScreeningResult] = useState<{
    matched: boolean;
    confidence: number;
    entity?: SanctionsEntry;
    query: string;
  } | null>(null);

  // Filtered Watchlist
  const filteredList = useMemo(() => {
    return SANCTIONS_WATCHLIST.filter((entry) => {
      if (selectedList !== 'all' && entry.list !== selectedList) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = entry.name.toLowerCase().includes(q);
      const matchAka = entry.aka.some((a) => a.toLowerCase().includes(q));
      const matchCountry = entry.country.toLowerCase().includes(q);
      const matchProgram = entry.program.toLowerCase().includes(q);
      return matchName || matchAka || matchCountry || matchProgram;
    });
  }, [searchQuery, selectedList]);

  // Handle live test screening
  const handleTestScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screeningInput.trim()) return;

    const q = screeningInput.toLowerCase().trim();
    // Fuzzy search match
    let bestMatch: SanctionsEntry | undefined;
    let highestScore = 0;

    SANCTIONS_WATCHLIST.forEach((entry) => {
      let score = 0;
      const entryName = entry.name.toLowerCase();
      if (entryName === q) {
        score = 100;
      } else if (entryName.includes(q) || q.includes(entryName)) {
        score = 88;
      } else {
        const words = q.split(' ');
        const entryWords = entryName.split(' ');
        const overlap = words.filter((w) => entryWords.includes(w)).length;
        if (overlap > 0) score = Math.round((overlap / Math.max(words.length, entryWords.length)) * 75);
      }

      entry.aka.forEach((a) => {
        const akaLower = a.toLowerCase();
        if (akaLower === q) score = Math.max(score, 98);
        else if (akaLower.includes(q)) score = Math.max(score, 85);
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    });

    if (highestScore >= 60 && bestMatch) {
      setScreeningResult({
        matched: true,
        confidence: highestScore,
        entity: bestMatch,
        query: screeningInput
      });
      addToast({
        title: 'Sanctions Match Detected',
        message: `High confidence match (${highestScore}%) for "${screeningInput}" on ${bestMatch.list}`,
        type: 'error'
      });
    } else {
      setScreeningResult({
        matched: false,
        confidence: 0,
        query: screeningInput
      });
      addToast({
        title: 'Clearance Granted',
        message: `No matches found for "${screeningInput}" on active watchlists`,
        type: 'success'
      });
    }
  };

  const handleExportAuditCertificate = () => {
    const cert = {
      auditReference: `CERT-OFAC-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      screenedDatabaseCount: SANCTIONS_WATCHLIST.length,
      listsIncluded: ['OFAC SDN', 'PEP Global', 'EU Consolidated', 'UN Security Council 1988/1267'],
      screeningAuditor: 'Elena Vance (Lead Compliance Officer)',
      complianceStatus: 'VERIFIED & AUDITED'
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sanctions_Clearance_${cert.auditReference}.json`;
    link.click();
    addToast({
      title: 'Certificate Downloaded',
      message: `Generated sanctions audit certificate ${cert.auditReference}`,
      type: 'success'
    });
  };

  // Recent simulated live screening events from stream
  const liveScreeningEvents = useMemo(() => {
    return transactions.slice(0, 8).map((t, idx) => ({
      id: `SCR-${t.id}`,
      entity: t.fromAccount,
      beneficiary: t.toAccount,
      country: t.fromCountry,
      matched: t.sanctionsCheck.ofacMatch || t.sanctionsCheck.pepMatch,
      status: t.sanctionsCheck.passed ? 'PASSED' : 'FLAGGED',
      timestamp: t.timestamp
    }));
  }, [transactions]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-6 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              Sanctions, PEP & Watchlist Screening
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--sage-2)]/20 text-[var(--sage-2)] font-mono font-medium border border-[var(--sage-2)]/30">
              Live OFAC/EU/UN Feeds
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Algorithmic fuzzy matching across global designated national lists, Politically Exposed Persons (PEPs), and adverse media registers.
          </p>
        </div>

        {/* Certificate Export Button */}
        <button
          onClick={handleExportAuditCertificate}
          className="pill-btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Clearance Certificate</span>
        </button>
      </div>

      {/* Manual Screening Test Bar */}
      <div className="glass-panel p-6 border border-[var(--line)]">
        <h3 className="text-sm font-medium text-white mb-1">
          Instant Algorithmic Entity Screening
        </h3>
        <p className="text-xs text-[var(--muted)] mb-4 font-light">
          Test any legal entity, individual name, or vessel IMO against consolidated OFAC, PEP, and EU databases.
        </p>

        <form onSubmit={handleTestScreen} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              value={screeningInput}
              onChange={(e) => setScreeningInput(e.target.value)}
              placeholder="e.g. Valeriy Mikhailov, Trans-Balkan Petrochemical, Ocean Wanderer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-panel bg-transparent border border-[var(--line)] text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--sage-2)] font-mono"
            />
          </div>
          <button
            type="submit"
            className="pill-btn-primary text-xs flex items-center justify-center gap-1.5 shrink-0 px-6 py-2.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Run Fuzzy Screen</span>
          </button>
        </form>

        {/* Screening Result Banner */}
        {screeningResult && (
          <div className="mt-4 animate-fadeIn">
            {screeningResult.matched && screeningResult.entity ? (
              <div className="p-4 rounded-2xl bg-[var(--risk-red)]/10 border border-[var(--risk-red)]/30 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--risk-red)] shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        WATCHLIST HIT: {screeningResult.entity.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-mono font-bold">
                        {screeningResult.confidence}% Match
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {screeningResult.entity.list} • Program: {screeningResult.entity.program} • Jurisdiction: {screeningResult.entity.country}
                    </p>
                    <div className="text-[11px] text-[var(--text)] mt-2 font-mono">
                      Known Aliases (AKAs): {screeningResult.entity.aka.join(', ')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => addToast({ title: 'SAR Triggered', message: `Pre-populated SAR draft for ${screeningResult.entity?.name}`, type: 'info' })}
                  className="pill-btn-primary text-xs bg-[var(--risk-red)] text-white hover:bg-[var(--risk-red)]/90 shrink-0"
                >
                  Block & File SAR
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--live)]/10 border border-[var(--live)]/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--live)] shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">
                      CLEARED: No matches found for "{screeningResult.query}"
                    </span>
                    <p className="text-[11px] text-[var(--muted)] font-mono">
                      Screened against 7 sanctions lists with 0 exact or fuzzy hits (Threshold: 60%).
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--live)]/20 text-[var(--live)] font-mono font-medium">
                  PASSED
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Database Search & List Table */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-white">
              Designated Watchlist Registry
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Consolidated active international screening targets
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watchlist..."
              className="px-3 py-1.5 rounded-full glass-panel bg-transparent border border-[var(--line)] text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
            />

            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="glass-panel px-3 py-1.5 text-xs text-[var(--text)] bg-transparent border border-[var(--line)] rounded-full focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0B0F0D]">All Lists</option>
              <option value="OFAC SDN" className="bg-[#0B0F0D]">OFAC SDN (US)</option>
              <option value="PEP Global" className="bg-[#0B0F0D]">PEP Global</option>
              <option value="EU Consolidated" className="bg-[#0B0F0D]">EU Consolidated</option>
              <option value="UN Security Council" className="bg-[#0B0F0D]">UN Security Council</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Entity / Target Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Designated List</th>
                <th className="py-3 px-4">Sanctions Program</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Known Aliases</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredList.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-red)]" />
                      <span>{entry.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--muted)]">{entry.entityType}</td>
                  <td className="py-3 px-4 font-mono text-[var(--sage-3)] font-semibold">{entry.list}</td>
                  <td className="py-3 px-4 font-mono text-[var(--muted)]">{entry.program}</td>
                  <td className="py-3 px-4 text-[var(--text)]">{entry.country}</td>
                  <td className="py-3 px-4 text-[var(--muted)] font-mono text-[10px]">
                    {entry.aka.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setScreeningInput(entry.name);
                        addToast({ title: 'Entity Selected', message: `Populated ${entry.name} in screening input`, type: 'info' });
                      }}
                      className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-all inline-flex items-center gap-1"
                    >
                      <span>Simulate Screen</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-Time Automated Stream Screening Log */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Automated Stream Screening Telemetry
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Continuous millisecond watchlist verification executed on incoming settlement stream
            </p>
          </div>
          <span className="label-small flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
            <span>0.8ms Latency</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)] bg-white/[0.02]">
                <th className="py-2.5 px-4">Screening ID</th>
                <th className="py-2.5 px-4">Origin Account</th>
                <th className="py-2.5 px-4">Destination Account</th>
                <th className="py-2.5 px-4">Jurisdiction</th>
                <th className="py-2.5 px-4">Match Status</th>
                <th className="py-2.5 px-4 text-right">Verification Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {liveScreeningEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/[0.01]">
                  <td className="py-2 px-4 text-[var(--muted)]">{evt.id}</td>
                  <td className="py-2 px-4 text-white">{evt.entity}</td>
                  <td className="py-2 px-4 text-white">{evt.beneficiary}</td>
                  <td className="py-2 px-4 text-[var(--text)]">{evt.country}</td>
                  <td className="py-2 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--live)]/20 text-[var(--live)] font-bold">
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right text-[var(--muted)]">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
