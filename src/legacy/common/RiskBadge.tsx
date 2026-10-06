import React from 'react';

interface RiskBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, size = 'md' }) => {
  let colorClasses = 'bg-command-teal/20 text-command-tealGlow border-command-teal/40';
  let label = 'LOW';

  if (score >= 90) {
    colorClasses = 'bg-command-red/25 text-[#FF6B6B] border-command-red/60 shadow-glow-red animate-pulse';
    label = 'CRITICAL';
  } else if (score >= 70) {
    colorClasses = 'bg-command-amber/20 text-command-amber border-command-amber/50 shadow-glow-amber';
    label = 'HIGH';
  } else if (score >= 40) {
    colorClasses = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    label = 'MEDIUM';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold border transition-all duration-200 ${colorClasses} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{score.toFixed(1)}</span>
      <span className="text-[9px] font-sans tracking-wider opacity-80 uppercase">{label}</span>
    </span>
  );
};
