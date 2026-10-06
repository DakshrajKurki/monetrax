import React from 'react';
import { TxnStatus } from '../../types';

interface StatusBadgeProps {
  status: TxnStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    'New': {
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400'
    },
    'Under Review': {
      bg: 'bg-command-amber/15 text-command-amber border-command-amber/30',
      dot: 'bg-command-amber'
    },
    'Cleared': {
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400'
    },
    'SAR Filed': {
      bg: 'bg-command-red/20 text-[#FF6B6B] border-command-red/40',
      dot: 'bg-command-red'
    }
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{status}</span>
    </span>
  );
};
