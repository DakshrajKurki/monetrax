import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'ghost' | 'orange';
  badge?: number | string;
  className?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  title,
  size = 'md',
  variant = 'glass',
  badge,
  className = '',
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-9 h-9 text-base'
  }[size];

  let variantStyles = 'bg-white/[0.04] text-[var(--muted)] hover:text-white hover:bg-white/[0.08] border border-white/[0.08]';
  if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-[var(--muted)] hover:text-white hover:bg-white/[0.06] border border-transparent';
  } else if (variant === 'orange') {
    variantStyles = 'bg-gradient-to-r from-[#FF6A2B] to-[#FF4D1A] text-white shadow-[0_2px_12px_rgba(255,106,43,0.35)] border border-white/20';
  }

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`relative rounded-full flex items-center justify-center transition-all duration-150 select-none ${sizeClasses} ${variantStyles} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'
      } ${className}`}
    >
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[16px] h-4 rounded-full bg-[#FF4D1A] text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#111113] shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
};
