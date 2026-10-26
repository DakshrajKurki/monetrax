import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';
import { Modal } from './Modal';
import { StatusPill } from './StatusPill';

export const AutoTriageModal: React.FC = () => {
  const isAutoTriageModalOpen = useAMLStore((s) => s.isAutoTriageModalOpen);
  const autoTriageCandidates = useAMLStore((s) => s.autoTriageCandidates);
  const autoTriageReasoning = useAMLStore((s) => s.autoTriageReasoning);
  const closeAutoTriageModal = useAMLStore((s) => s.closeAutoTriageModal);
  const confirmAutoTriage = useAMLStore((s) => s.confirmAutoTriage);

  return (
    <Modal
      isOpen={isAutoTriageModalOpen}
      onClose={closeAutoTriageModal}
      maxWidth="max-w-lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF6A2B]/20 text-[#FF6A2B] border border-[#FF6A2B]/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Auto-Triage Verification</h2>
            <p className="text-xs text-[var(--caption)]">Autonomous low-risk false positive clearance</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Reasoning explanation */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[var(--muted)] leading-relaxed">
          {autoTriageReasoning || 'Identified low-risk batch of recurring payroll and cleared treasury transfers meeting automated triage confidence threshold.'}
        </div>

        {/* Candidate cases list */}
        <div>
          <div className="text-xs font-medium text-[var(--caption)] uppercase tracking-wider mb-2">
            Candidates for Clearance ({autoTriageCandidates.length})
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl p-2 bg-[#161619]/60 scrollbar-thin">
            {autoTriageCandidates.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--muted)]">
                No active candidate cases in current queue.
              </div>
            ) : (
              autoTriageCandidates.map((c) => (
                <div key={c.id} className="py-2.5 px-2 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-white font-medium">#{c.id}</span>
                    <span className="text-[var(--muted)] ml-2 truncate">
                      {c.fromCity} ➔ {c.toCity}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="font-mono text-white/90 font-medium">
                      ${c.amount.toLocaleString()}
                    </span>
                    <StatusPill type="benign" label={`${c.riskScore.toFixed(0)} Benign`} size="xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={closeAutoTriageModal}
            className="pill-btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            onClick={confirmAutoTriage}
            disabled={autoTriageCandidates.length === 0}
            className="pill-btn-primary text-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confirm Auto-Clear ({autoTriageCandidates.length})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
