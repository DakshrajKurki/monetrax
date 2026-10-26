import React from 'react';

export type StatusPillType = 
  | 'critical' 
  | 'medium' 
  | 'low' 
  | 'benign'
  | 'new'
  | 'under_review'
  | 'escalated'
  | 'cleared'
  | 'sar_filed'
  | 'active'
  | 'inactive'
  | 'custom';

interface StatusPillProps {
  status?: string;
  type?: StatusPillType;
  label?: string;
  score?: number;
  showDot?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  type = 'custom',
  label,
  score,
  showDot = false,
  size = 'sm',
  className = ''
}) => {
  // Infer type from status string if provided
  let effectiveType = type;
  let displayLabel = label || status;

  if (status) {
    const s = status.toLowerCase();
    if (s === 'new') effectiveType = 'new';
    else if (s.includes('review')) effectiveType = 'under_review';
    else if (s.includes('escalat')) effectiveType = 'escalated';
    else if (s.includes('sar')) effectiveType = 'sar_filed';
    else if (s.includes('clear')) effectiveType = 'cleared';
    else if (s.includes('critical')) effectiveType = 'critical';
    else if (s.includes('medium')) effectiveType = 'medium';
    else if (s.includes('benign') || s.includes('low') || s.includes('active')) effectiveType = 'benign';
  } else if (score !== undefined) {
    if (score >= 70) effectiveType = 'critical';
    else if (score >= 40) effectiveType = 'medium';
    else effectiveType = 'benign';
  }

  // Define styling per semantic type
  let colorStyles = 'bg-white/10 text-white border-white/20';
  let dotColor = '#FFFFFF';
  if (!displayLabel) displayLabel = label;

  switch (effectiveType) {
    case 'critical':
      colorStyles = 'bg-[#E5484D]/15 text-[#FF7075] border-[#E5484D]/30';
      dotColor = '#E5484D';
      displayLabel = label || (score !== undefined ? `${score} Critical` : 'Critical');
      break;
    case 'medium':
    case 'under_review':
      colorStyles = 'bg-[#F5C04A]/15 text-[#FAD375] border-[#F5C04A]/30';
      dotColor = '#F5C04A';
      displayLabel = label || (score !== undefined ? `${score} Medium` : 'Medium');
      break;
    case 'low':
    case 'benign':
    case 'cleared':
    case 'active':
      colorStyles = 'bg-[#4ADE9A]/15 text-[#6EE7B7] border-[#4ADE9A]/30';
      dotColor = '#4ADE9A';
      displayLabel = label || (score !== undefined ? `${score} Low` : 'Active');
      break;
    case 'new':
      colorStyles = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      dotColor = '#06B6D4';
      displayLabel = label || 'New';
      break;
    case 'escalated':
    case 'sar_filed':
      colorStyles = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      dotColor = '#A855F7';
      displayLabel = label || (effectiveType === 'sar_filed' ? 'SAR Filed' : 'Escalated');
      break;
    case 'inactive':
      colorStyles = 'bg-white/[0.06] text-[var(--muted)] border-white/10';
      dotColor = 'rgba(255,255,255,0.4)';
      displayLabel = label || 'Inactive';
      break;
    default:
      displayLabel = label || 'Normal';
  }

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border shadow-sm whitespace-nowrap ${sizeClasses} ${colorStyles} ${className}`}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
