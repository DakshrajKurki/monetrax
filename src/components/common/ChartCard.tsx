import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  dataWindowCaption?: string;
  dataWindow?: string;
  isLoading?: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  dataWindowCaption,
  dataWindow,
  isLoading = false,
  headerAction,
  children,
  className = ''
}) => {
  const caption = dataWindow || dataWindowCaption || 'last 24 hours, simulated surveillance data';
  return (
    <div className={`glass-panel p-5 border border-[var(--line)] flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3">
        <div>
          <h3 className="text-sm font-medium text-[var(--text)] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[var(--muted)] font-light mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Chart Body */}
      <div className="w-full flex-1 min-h-[220px] flex items-center justify-center relative">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse">
            <div className="w-full h-36 bg-white/[0.03] rounded-lg" />
            <span className="text-[10px] text-[var(--muted)] font-mono">Loading data stream...</span>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Mandatory Caption footer stating data window */}
      <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-2)] opacity-70" />
          <span>Window: {caption}</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-[var(--muted)] opacity-60">Verified Model Stream</span>
      </div>
    </div>
  );
};
