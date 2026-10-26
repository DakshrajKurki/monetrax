import React from 'react';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import { AnimatedCounter } from './MotionComponents';

interface StatCardProps {
  variant?: 'orange' | 'glass';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  delta?: string;
  deltaPositive?: boolean;
  footerText: string;
  onFooterClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  variant = 'glass',
  icon,
  title,
  subtitle,
  value,
  prefix = '',
  suffix = '',
  delta,
  deltaPositive = true,
  footerText,
  onFooterClick,
  onMenuClick,
  className = ''
}) => {
  const isOrange = variant === 'orange';

  return (
    <div
      onClick={onFooterClick}
      className={`group relative flex flex-col justify-between cursor-pointer rounded-[16px] transition-all duration-200 ${
        isOrange ? 'fintech-card-hero' : 'fintech-card fintech-card-hover'
      } ${className}`}
    >
      {/* Top Content Area */}
      <div className="p-5 pb-4">
        {/* Header row: Icon tile + Titles + "..." button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon Tile */}
            <div
              className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm ${
                isOrange
                  ? 'bg-white/20 text-white backdrop-blur-sm border border-white/25'
                  : 'bg-white/[0.06] text-white border border-white/10'
              }`}
            >
              {icon}
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <h3 className={`text-sm font-medium tracking-tight truncate ${isOrange ? 'text-white' : 'text-[#F5F5F6]'}`}>
                {title}
              </h3>
              <p className={`text-xs truncate ${isOrange ? 'text-white/80' : 'text-[var(--caption)]'}`}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Context Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.();
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              isOrange
                ? 'text-white/70 hover:text-white hover:bg-white/15'
                : 'text-[var(--caption)] hover:text-white hover:bg-white/10'
            }`}
            title="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Value + Delta Pill Row */}
        <div className="flex items-baseline gap-2.5 mt-2">
          <div className={`text-2xl sm:text-3xl font-semibold tracking-tight font-mono ${isOrange ? 'text-white' : 'text-[#F5F5F6]'}`}>
            {prefix}
            {typeof value === 'number' ? (
              <AnimatedCounter value={value} />
            ) : (
              <span>{value}</span>
            )}
            {suffix}
          </div>

          {delta && (
            <span
              className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                isOrange
                  ? 'bg-white/25 text-white border border-white/20 backdrop-blur-sm'
                  : deltaPositive
                  ? 'bg-[#4ADE9A]/15 text-[#4ADE9A] border border-[#4ADE9A]/25'
                  : 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/25'
              }`}
            >
              {delta}
            </span>
          )}
        </div>
      </div>

      {/* Distinct Footer Strip with Hover-Sliding Arrow */}
      <div
        className={`px-5 py-3 border-t text-xs font-medium flex items-center justify-between transition-colors ${
          isOrange
            ? 'border-white/15 text-white/90 bg-black/10 hover:bg-black/15'
            : 'border-white/[0.06] text-[var(--muted)] hover:text-white bg-white/[0.015] hover:bg-white/[0.03]'
        }`}
      >
        <span>{footerText}</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </div>
  );
};
