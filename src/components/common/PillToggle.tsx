import React from 'react';
import { motion } from 'framer-motion';

export interface PillOption {
  id: string;
  label: string;
}

interface PillToggleProps {
  options: PillOption[];
  selectedId: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
  activeColor?: 'orange' | 'white';
  className?: string;
}

export const PillToggle: React.FC<PillToggleProps> = ({
  options,
  selectedId,
  onChange,
  size = 'sm',
  activeColor = 'orange',
  className = ''
}) => {
  const isSm = size === 'sm';

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full bg-[#161619] border border-white/[0.08] backdrop-blur-md shadow-inner ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`relative z-10 font-medium transition-colors duration-200 rounded-full select-none ${
              isSm ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
            } ${
              isSelected
                ? 'text-white'
                : 'text-[var(--muted)] hover:text-white'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`pill-toggle-highlight-${options.map(o => o.id).join('-')}`}
                className={`absolute inset-0 rounded-full shadow-md ${
                  activeColor === 'orange'
                    ? 'bg-gradient-to-r from-[#FF6A2B] to-[#FF4D1A] border border-white/20'
                    : 'bg-white/15 border border-white/20'
                }`}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
