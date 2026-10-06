import React from 'react';
import { useAMLStore } from '../../store/useAMLStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useAMLStore((s) => s.toasts);
  const dismissToast = useAMLStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto glass-panel p-3.5 border border-white/15 shadow-2xl flex items-start justify-between gap-3 bg-[#0B0F0D]/95 rounded-2xl"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-[var(--live)]" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-[var(--risk-amber)]" />}
                  {isError && <XCircle className="w-4 h-4 text-[var(--risk-red)]" />}
                  {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-[var(--sage-2)]" />}
                </span>
                <div>
                  <h4 className="text-xs font-medium text-white">{toast.title}</h4>
                  <p className="text-[11px] text-[var(--muted)] font-light mt-0.5 leading-snug">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-[var(--muted)] hover:text-white transition-colors p-1"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
