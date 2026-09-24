import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);
  const { language } = useShop();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>
          {language === 'bn' ? 'সংযোগ পুনঃস্থাপিত হয়েছে' : 'Back Online'}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
      <span>
        {language === 'bn'
          ? 'অফলাইন মোড — ক্যাশ করা মেনু প্রদর্শিত হচ্ছে'
          : 'Offline Mode — Showing cached menu'}
      </span>
    </div>
  );
};
