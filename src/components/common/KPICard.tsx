import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedCounter } from './MotionComponents';

interface KPICardProps {
  label?: string;
  title?: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: number | string;
  deltaLabel?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  sparklineData?: number[];
  filterParam?: { key: string; value: string };
  icon?: React.ReactNode;
  accentColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  delta,
  deltaLabel = 'vs previous period',
  deltaType,
  subtitle,
  sparklineData = [10, 15, 12, 18, 22, 20, 24, 28],
  filterParam,
  icon,
  accentColor = 'var(--text)'
}) => {
  const displayLabel = title || label || '';
  const navigate = useNavigate();

  const handleClick = () => {
    if (filterParam) {
      navigate(`/queue?${filterParam.key}=${encodeURIComponent(filterParam.value)}`);
    } else {
      navigate('/queue');
    }
  };

  // Sparkline coordinates
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  
  const points = sparklineData.map((d, i) => {
    const x = (i / (sparklineData.length - 1)) * width;
    const y = height - ((d - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = deltaType === 'positive' || (typeof delta === 'number' && delta >= 0);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={`Click to view corresponding queue cases (${displayLabel})`}
      className="glass-panel p-4 flex flex-col justify-between cursor-pointer hover:border-[var(--sage-2)]/40 hover:bg-white/[0.04] transition-all group border border-[var(--line)] relative overflow-hidden"
    >
      {/* Top Label & Icon */}
      <div className="flex items-center justify-between pb-2">
        <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
          {displayLabel}
        </span>
        {icon && (
          <span className="text-[var(--muted)] group-hover:text-white transition-colors">
            {icon}
          </span>
        )}
      </div>

      {/* Main Metric Value & Sparkline */}
      <div className="flex items-end justify-between gap-3 pt-1">
        <div className="text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight tabular-nums flex items-baseline">
          {prefix && <span className="text-lg opacity-80 mr-0.5">{prefix}</span>}
          {typeof value === 'number' ? (
            <AnimatedCounter value={value} decimals={decimals} />
          ) : (
            <span>{value}</span>
          )}
          {suffix && <span className="text-sm text-[var(--muted)] ml-1 font-normal">{suffix}</span>}
        </div>

        {/* Sparkline SVG */}
        <div className="flex flex-col items-end">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke="var(--sage-2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Delta Row */}
      {delta !== undefined && (
        <div className="flex items-center gap-1.5 pt-2 text-[10px] font-mono">
          <span className={`inline-flex items-center gap-0.5 font-medium ${
            deltaType === 'positive' || (typeof delta === 'number' && delta >= 0)
              ? 'text-[var(--live)]'
              : 'text-[var(--risk-red)]'
          }`}>
            {(deltaType === 'positive' || (typeof delta === 'number' && delta >= 0)) ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{typeof delta === 'number' ? `${Math.abs(delta)}%` : delta}</span>
          </span>
          <span className="text-[var(--muted)] truncate">{deltaLabel}</span>
        </div>
      )}

      {subtitle && (
        <p className="text-[10px] text-[var(--muted)] font-light mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
