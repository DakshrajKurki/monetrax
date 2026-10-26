import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  className = '',
  showCloseButton = true
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6">
          {/* Dimmed Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card Surface */}
          <motion.div
            ref={modalContentRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`relative z-10 w-full ${maxWidth} rounded-[20px] bg-[#121215] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${className}`}
          >
            {/* Modal Header */}
            {(title || showCloseButton) && (
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-white/[0.015]">
                <div>
                  {typeof title === 'string' ? (
                    <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs text-[var(--caption)] mt-0.5">{subtitle}</p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
