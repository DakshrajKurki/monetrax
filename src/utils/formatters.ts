/**
 * Monetrax Formatting Helpers
 * Strict compliance with tabular formatting, symbol conventions, and human-readable units.
 */

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'EUR' | 'GBP' = 'USD',
  compact = false
): string {
  if (isNaN(amount)) return '$0';

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const sym = symbols[currency] || '$';

  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${sym}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `${sym}${(amount / 1_000).toFixed(1)}K`;
  }

  return `${sym}${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatCompact(value: number): string {
  if (isNaN(value)) return '0';
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString('en-US');
}

export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return Math.round(value).toLocaleString('en-US');
}

export interface RelativeTimeResult {
  relative: string;
  exact: string;
}

export function formatRelativeTime(isoString: string): RelativeTimeResult {
  if (!isoString) return { relative: 'Just now', exact: 'N/A' };
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  const exact = date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  if (diffSec < 15) return { relative: 'Just now', exact };
  if (diffSec < 60) return { relative: `${diffSec}s ago`, exact };
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return { relative: `${diffMin}m ago`, exact };
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return { relative: `${diffHour}h ago`, exact };
  
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 30) return { relative: `${diffDays}d ago`, exact };

  return { relative: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), exact };
}

export function formatSLA(secondsRemaining: number): { text: string; isUrgent: boolean } {
  if (secondsRemaining <= 0) return { text: 'Breached', isUrgent: true };
  const h = Math.floor(secondsRemaining / 3600);
  const m = Math.floor((secondsRemaining % 3600) / 60);
  if (h > 0) {
    return { text: `${h}h ${m}m`, isUrgent: h < 1 };
  }
  return { text: `${m}m`, isUrgent: true };
}
