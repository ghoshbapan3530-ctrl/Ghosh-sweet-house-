/**
 * Robust date & timestamp utilities for Ghosh Sweet House
 * Safely handles Firestore Timestamps, ISO strings, unix numbers, and edge cases.
 */

export function parseOrderDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? new Date() : val;
  }
  // Firestore Timestamp with toDate()
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    try {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch {
      // ignore
    }
  }
  // Firestore Timestamp with seconds
  if (typeof val === 'object' && typeof val.seconds === 'number') {
    const d = new Date(val.seconds * 1000);
    if (!isNaN(d.getTime())) return d;
  }
  // Unix timestamp (milliseconds)
  if (typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  // String timestamp
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Returns human-readable relative time (e.g. "Just now", "4m ago", "1h ago", "Yesterday", "2d ago")
 */
export function getTimeAgo(val: any): string {
  const date = parseOrderDate(val);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 0) return 'Just now';
  if (diffSec < 60) return 'Just now';
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Returns full formatted timestamp: "24 Sep 2026, 02:45 PM"
 */
export function formatOrderDateTime(val: any): string {
  const d = parseOrderDate(val);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Returns formatted time only: "02:45 PM"
 */
export function formatOrderTimeOnly(val: any): string {
  const d = parseOrderDate(val);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Returns formatted date only: "24 Sep 2026"
 */
export function formatOrderDateOnly(val: any): string {
  const d = parseOrderDate(val);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Checks if timestamp belongs to today
 */
export function isOrderToday(val: any): boolean {
  const d = parseOrderDate(val);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Compact info object for dashboard order cards
 */
export function getOrderTimestampInfo(val: any) {
  const date = parseOrderDate(val);
  const isToday = isOrderToday(date);
  const timeStr = formatOrderTimeOnly(date);
  const dateStr = formatOrderDateOnly(date);
  const relativeStr = getTimeAgo(date);
  const fullDateTime = formatOrderDateTime(date);

  return {
    date,
    isToday,
    timeStr,
    dateStr,
    relativeStr,
    fullDateTime,
    displayLabel: isToday ? `Today, ${timeStr}` : `${dateStr}, ${timeStr}`
  };
}
