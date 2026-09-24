import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import {
  parseOrderDate,
  formatOrderDateTime,
  formatOrderTimeOnly,
  formatOrderDateOnly,
  getTimeAgo,
  isOrderToday
} from '../lib/date-utils';

interface OrderTimestampProps {
  timestamp: any;
  mode?: 'badge' | 'full' | 'compact' | 'detailed';
  showIcon?: boolean;
  className?: string;
}

export const OrderTimestamp: React.FC<OrderTimestampProps> = ({
  timestamp,
  mode = 'badge',
  showIcon = true,
  className = ''
}) => {
  const date = parseOrderDate(timestamp);
  const isToday = isOrderToday(date);
  const timeStr = formatOrderTimeOnly(date);
  const dateStr = formatOrderDateOnly(date);
  const relativeStr = getTimeAgo(date);
  const fullDateTime = formatOrderDateTime(date);

  if (mode === 'compact') {
    return (
      <span
        title={`Placed on ${fullDateTime}`}
        className={`inline-flex items-center gap-1 font-mono text-[10px] text-stone-500 dark:text-stone-400 ${className}`}
      >
        {showIcon && <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
        <span>{isToday ? timeStr : `${dateStr}, ${timeStr}`}</span>
      </span>
    );
  }

  if (mode === 'detailed') {
    return (
      <div className={`space-y-0.5 ${className}`}>
        <div className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 font-medium">
          {showIcon && <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          <span>{fullDateTime}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
            {relativeStr}
          </span>
        </div>
      </div>
    );
  }

  if (mode === 'full') {
    return (
      <span
        title={fullDateTime}
        className={`inline-flex items-center gap-1.5 font-mono text-xs text-stone-600 dark:text-stone-300 ${className}`}
      >
        {showIcon && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
        <span>{fullDateTime}</span>
        <span className="text-[10px] text-stone-400">({relativeStr})</span>
      </span>
    );
  }

  // Default: 'badge' (ideal for cards and dashboard listings)
  return (
    <div
      title={`Order placed on: ${fullDateTime}`}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <div className="flex items-center gap-1 text-[11px] font-mono text-stone-500 dark:text-stone-400">
        {showIcon && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
        <span>{isToday ? `Today, ${timeStr}` : `${dateStr}, ${timeStr}`}</span>
      </div>
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
        {relativeStr}
      </span>
    </div>
  );
};
