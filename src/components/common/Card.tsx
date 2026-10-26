import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  style
}) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`fintech-card ${hoverable ? 'fintech-card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
