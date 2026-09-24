import React, { useState } from 'react';
import { SheetsSyncStatus } from '../types';
import { RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface SyncStatusBadgeProps {
  status?: SheetsSyncStatus;
  orderId: string;
  onRetry?: (orderId: string) => Promise<any> | void;
  showRetryButton?: boolean;
  language?: 'bn' | 'en';
  size?: 'sm' | 'md';
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status = 'pending',
  orderId,
  onRetry,
  showRetryButton = true,
  language = 'bn',
  size = 'sm'
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry(orderId);
    } finally {
      setTimeout(() => setRetrying(false), 500);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: '🟢',
          iconComponent: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          labelEn: 'Synced',
          labelBn: 'সিঙ্ক সম্পন্ন',
          pillClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'failed':
        return {
          icon: '🔴',
          iconComponent: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          labelEn: 'Failed',
          labelBn: 'ব্যর্থ হয়েছে',
          pillClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };
      case 'pending':
      default:
        return {
          icon: '🟡',
          iconComponent: <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />,
          labelEn: 'Pending',
          labelBn: 'অপেক্ষমাণ',
          pillClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
    }
  };

  const cfg = getStatusConfig();
  const label = language === 'bn' ? cfg.labelBn : cfg.labelEn;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        title={`Google Sheets: ${label}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.pillClass}`}
      >
        <span className="text-xs leading-none" role="img" aria-label={cfg.labelEn}>
          {cfg.icon}
        </span>
        <span className="hidden sm:inline font-bengali">{label}</span>
      </span>

      {/* Retry Sync Button if Failed or Pending */}
      {showRetryButton && (status === 'failed' || status === 'pending') && onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          title={language === 'bn' ? 'পুনরায় শিটসে সিঙ্ক করুন' : 'Retry Google Sheets Sync'}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all ${
            status === 'failed'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 active:scale-95'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 active:scale-95'
          } ${retrying ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
          <span className="font-bengali">
            {retrying
              ? language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...'
              : language === 'bn' ? 'Retry Sync' : 'Retry Sync'}
          </span>
        </button>
      )}
    </div>
  );
};
