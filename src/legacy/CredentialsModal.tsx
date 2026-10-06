import React from 'react';
import { Shield, Key, Lock, CheckCircle2, X, Copy } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose, onToast }) => {
  if (!isOpen) return null;

  const copyHash = () => {
    navigator.clipboard.writeText('0x9F4B31E9D7C2A85764964BF59577E4BDA449B45F');
    onToast('Encrypted Session Fingerprint copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-command-border bg-command-panel p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-command-muted hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-command-teal/20 border border-command-teal/40 flex items-center justify-center text-command-tealGlow">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Operator Security Credentials</h3>
            <p className="text-xs text-command-muted">FinCEN Regulatory Clearance & FIU Authority</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-command-dark/60 border border-command-border/60 mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-command-teal to-command-border flex items-center justify-center font-bold text-white text-base shadow-glow-teal border border-command-tealGlow/40">
            DS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">Dakshraj Singh</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-command-tealGlow text-command-dark">
                (Owner)
              </span>
            </div>
            <p className="text-xs text-command-muted">Head of Financial Intelligence & System Architecture</p>
          </div>
        </div>

        <div className="space-y-3 text-xs bg-command-dark/40 rounded-lg p-4 border border-command-border/40 mb-6 font-mono">
          <div className="flex justify-between items-center py-1.5 border-b border-command-border/30">
            <span className="text-command-muted font-sans">Role Level:</span>
            <span className="text-command-tealGlow font-bold">System Owner (Superuser / Full FinCEN SAR Filing Authority)</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-command-border/30">
            <span className="text-command-muted font-sans">Clearance Tier:</span>
            <span className="text-white">Tier-4 Lead Investigator</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-command-border/30">
            <span className="text-command-muted font-sans">Authentication:</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Hardware FIDO2 Authenticated
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-command-border/30">
            <span className="text-command-muted font-sans">Cipher Protocol:</span>
            <span className="text-white">AES-256-GCM / TLS 1.3 Active</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-command-muted font-sans">Session ID:</span>
            <span className="text-command-tealGlow">MON-ROOT-88492-DS</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={copyHash}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-command-border hover:bg-command-subtle transition-colors text-command-text"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Session Fingerprint
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-command-teal text-white hover:bg-command-tealGlow hover:text-command-dark transition-all duration-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
