import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { 
  FileText, 
  Clock, 
  Send, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  Edit3,
  Calendar,
  Building,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';
import { PageHeader } from '../common/PageHeader';
import { SARDraft } from '../../types';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export const SARCenterView: React.FC = () => {
  const sarDrafts = useAMLStore((s) => s.sarDrafts);
  const addToast = useAMLStore((s) => s.addToast);
  const transactions = useAMLStore((s) => s.transactions);
  const createSARDraft = useAMLStore((s) => s.createSARDraft);

  const [selectedDraftId, setSelectedDraftId] = useState<string>(sarDrafts[0]?.id || 'SAR-2026-084');
  const [isEditingNarrative, setIsEditingNarrative] = useState<boolean>(false);
  const [editedNarrative, setEditedNarrative] = useState<string>('');
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // New Draft modal state
  const [newCaseId, setNewCaseId] = useState<string>('');

  const newDraftModalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(newDraftModalRef, () => setIsNewModalOpen(false), { enabled: isNewModalOpen });

  useEffect(() => {
    if (isNewModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isNewModalOpen]);

  const activeDraft = useMemo(() => {
    return sarDrafts.find((d) => d.id === selectedDraftId) || sarDrafts[0];
  }, [selectedDraftId, sarDrafts]);

  // Sync edited narrative when active draft changes
  React.useEffect(() => {
    if (activeDraft) {
      setEditedNarrative(activeDraft.narrative);
      setIsEditingNarrative(false);
    }
  }, [activeDraft]);

  const [isDraftingAI, setIsDraftingAI] = useState(false);

  const handleDraftWithAI = async () => {
    if (!activeDraft) return;
    setIsDraftingAI(true);
    try {
      const matchTxn = transactions.find(t => t.id === activeDraft.caseId) || transactions[0];
      const res = await fetch('/api/ai/draft_sar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeDraft.caseId,
          amount: activeDraft.amount,
          typologyLabel: activeDraft.typology,
          fromAccount: activeDraft.accountId,
          features: matchTxn?.features,
          fromCity: matchTxn?.fromCity || 'London',
          toCity: matchTxn?.toCity || 'Zurich',
          riskScore: matchTxn?.riskScore || 84
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.narrative) {
          setEditedNarrative(data.narrative);
          setIsEditingNarrative(true);
          addToast({
            title: 'SAR Drafted with AI',
            message: `Generated formal FinCEN Form 111 narrative for ${activeDraft.id}. Review and edit below.`,
            type: 'success'
          });
        }
      }
    } catch (err) {
      addToast({
        title: 'Drafting Failed',
        message: 'Could not draft narrative via AI proxy',
        type: 'error'
      });
    } finally {
      setIsDraftingAI(false);
    }
  };

  const handleSaveNarrative = () => {
    activeDraft.narrative = editedNarrative;
    setIsEditingNarrative(false);
    addToast({
      title: 'Narrative Saved',
      message: `Updated FinCEN narrative draft for ${activeDraft.id}`,
      type: 'success'
    });
  };

  const handleSubmitSAR = () => {
    activeDraft.status = 'Filed';
    addToast({
      title: 'SAR Filed with FinCEN',
      message: `Electronic filing confirmation generated: BSA-EFILE-${Date.now().toString(36).toUpperCase()}`,
      type: 'success'
    });
  };

  const handlePrintExport = () => {
    window.print();
  };

  const handleCreateNewDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTxn = transactions.find(t => t.id === newCaseId) || transactions.find(t => t.riskScore >= 70);
    if (!targetTxn) return;

    createSARDraft(targetTxn);
    setIsNewModalOpen(false);
    addToast({
      title: 'SAR Draft Initialized',
      message: `Generated SAR draft for case #${targetTxn.id}`,
      type: 'success'
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-6 pb-16"
    >
      {/* Header Toolbar */}
      <PageHeader
        title="SAR Filing & FinCEN Command Center"
        subtitle="Preparation, review, and electronic filing of Suspicious Activity Reports (Form 111) adhering to 31 U.S.C. 5318(g)."
        actions={
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="pill-btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create SAR Draft</span>
          </button>
        }
        showPeriodPicker={false}
      />

      {/* Main Two-Column View: Drafts List & Formatted Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drafts Queue (5 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="fintech-card p-4 border border-[var(--line)] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-white">Active Filing Queue</span>
            <span className="label-small">{sarDrafts.length} Documents</span>
          </div>

          <div className="space-y-2">
            {sarDrafts.map((draft) => {
              const isSelected = draft.id === selectedDraftId;

              return (
                <div
                  key={draft.id}
                  onClick={() => setSelectedDraftId(draft.id)}
                  className={`fintech-card p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--brand-orange)]/60 bg-white/[0.05] shadow-lg'
                      : 'border-[var(--line)] hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      {draft.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        draft.status === 'Filed'
                          ? 'bg-[var(--risk-green)]/20 text-[var(--risk-green)] border border-[var(--risk-green)]/30'
                          : 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30'
                      }`}
                    >
                      {draft.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-[var(--text)] font-medium mt-2">
                    {draft.accountName}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] font-mono">
                    Case #{draft.caseId} • {draft.accountId}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-3 pt-2.5 border-t border-[var(--line)]">
                    <span className="text-[var(--brand-orange)] font-bold">
                      {formatCurrency(draft.amount)}
                    </span>
                    <div className="flex items-center gap-1 text-[var(--muted)]">
                      <Clock className="w-3 h-3 text-[var(--risk-yellow)]" />
                      <span>Due: {new Date(draft.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: FinCEN Formatted Document Preview (8 cols) */}
        {activeDraft && (
          <div className="lg:col-span-8 fintech-card p-6 sm:p-8 border border-[var(--line)] space-y-6 print:border-none print:p-0">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono uppercase font-bold">
                    FinCEN FORM 111 (SAR-DI)
                  </span>
                  <span className="text-xs font-mono text-[var(--muted)]">
                    DOC ID: {activeDraft.id}
                  </span>
                </div>
                <h3 className="text-lg font-light text-white tracking-tight mt-1">
                  Suspicious Activity Report Record
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrintExport}
                  className="pill-btn-secondary text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>

                {activeDraft.status !== 'Filed' ? (
                  <button
                    onClick={handleSubmitSAR}
                    className="pill-btn-primary text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>File to FinCEN</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--risk-green)]/20 text-[var(--risk-green)] text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>E-FILED CONFIRMED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase block">Part I: Primary Subject</span>
                <span className="text-white font-bold block mt-1">{activeDraft.accountName}</span>
                <span className="text-[11px] text-[var(--muted)]">{activeDraft.accountId}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase block">Part II: Total Exposure</span>
                <span className="text-white font-bold block mt-1">{formatCurrency(activeDraft.amount)}</span>
                <span className="text-[11px] text-[var(--brand-orange)]">Typology: {activeDraft.typology.toUpperCase()}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--line)]">
                <span className="text-[10px] text-[var(--muted)] uppercase block">Part III: Filing Officer</span>
                <span className="text-white font-bold block mt-1">{activeDraft.filingOfficer}</span>
                <span className="text-[11px] text-[var(--muted)]">BSA/AML Compliance Division</span>
              </div>
            </div>

            {/* Part IV: FinCEN Narrative Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--brand-orange)]" />
                  <h4 className="text-sm font-medium text-white">
                    Part IV: Narrative Explanation of Suspicious Activity
                  </h4>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={handleDraftWithAI}
                    disabled={isDraftingAI}
                    className="pill-btn-secondary text-[11px] py-1 px-3 flex items-center gap-1.5 border-[var(--brand-orange)]/30 text-[var(--brand-orange)] hover:text-white"
                    title="Generate first-draft regulatory SAR narrative via Gemini AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--brand-orange)]" />
                    <span>{isDraftingAI ? 'Drafting...' : 'Draft with AI'}</span>
                  </button>

                  {!isEditingNarrative ? (
                    <button
                      onClick={() => setIsEditingNarrative(true)}
                      className="pill-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Narrative</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingNarrative(false)}
                        className="text-xs text-[var(--muted)] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNarrative}
                        className="pill-btn-primary text-[11px] py-1 px-3"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isEditingNarrative ? (
                <textarea
                  value={editedNarrative}
                  onChange={(e) => setEditedNarrative(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-xl fintech-card bg-transparent border border-[var(--line)] text-xs text-[var(--text)] font-mono leading-relaxed focus:outline-none focus:border-[var(--brand-orange)]"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-[var(--line)] text-xs text-[var(--text)] font-light leading-relaxed whitespace-pre-wrap">
                  {activeDraft.narrative}
                </div>
              )}
            </div>

            {/* Regulatory Certification Footer */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-[var(--line)] text-[11px] font-mono text-[var(--muted)] flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[var(--brand-orange)] shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium block">Mandatory Confidentiality Warning (31 U.S.C. 5318(g)(2))</span>
                No financial institution, director, officer, employee, or agent of any financial institution shall disclose to any person involved in the transaction that the transaction has been reported.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create New Draft Modal - Portaled to document.body */}
      {isNewModalOpen && createPortal(
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            ref={newDraftModalRef}
            className="fintech-card p-6 border border-white/20 w-full max-w-md shadow-2xl bg-[#111113]"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-medium text-white">
                Initialize New SAR Draft
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1 rounded-md transition-colors text-xs font-mono"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mb-4 font-light">
              Select a flagged compliance case to populate FinCEN Form 111 with automated narrative attribution.
            </p>

            <form onSubmit={handleCreateNewDraft} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[var(--muted)] block mb-1">Select Case ID</label>
                <select
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white bg-[#141416] border border-[var(--line)] rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#141416]">Select elevated risk case...</option>
                  {transactions.filter(t => t.riskScore >= 70).slice(0, 15).map(t => (
                    <option key={t.id} value={t.id} className="bg-[#141416]">
                      #{t.id} - ${t.amount.toLocaleString()} ({t.typologyLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="pill-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pill-btn-primary text-xs"
                >
                  Create SAR Draft
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </motion.div>
  );
};
