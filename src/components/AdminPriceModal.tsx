import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Save,
  RotateCcw,
  Edit3,
  Check,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Phone,
  Clock,
  MapPin,
  CreditCard,
  User,
  Package,
  AlertCircle,
  HelpCircle,
  LogIn,
  LogOut,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
import { ProductItem, OrderStatus, OrderHistoryItem } from '../types';
import { SyncStatusBadge } from './SyncStatusBadge';
import { InvoiceModal } from './InvoiceModal';
import {
  fetchSheetsSyncStatus,
  SheetsStatusInfo,
  fetchRecordedOrdersFromSheets,
  SheetRecordedOrder,
  updateOrderSheetStatus
} from '../services/sheetsSyncService';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  getAccessToken
} from '../services/googleAuth';
import { DEFAULT_SPREADSHEET_ID, EXPECTED_SHEET_COLUMNS } from '../server/googleSheetsPlugin';

type FilterTab = 'ALL' | 'New Order' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export const AdminPriceModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    updateProductPrice,
    resetToDefaultData,
    reviews,
    updateReview,
    orderHistory,
    retrySyncOrder,
    syncAllPendingOrders,
    updateOrderStatus,
    language,
    theme
  } = useShop();

  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'prices' | 'reviews' | 'sheetsConfig'>('orders');
  const [statusFilter, setStatusFilter] = useState<FilterTab>('ALL');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sheetsInfo, setSheetsInfo] = useState<SheetsStatusInfo | null>(null);
  const [batchSyncing, setBatchSyncing] = useState(false);
  const [batchSyncMsg, setBatchSyncMsg] = useState<string | null>(null);

  const handlePriceChange = (id: string, price: number) => {
    setEditedPrices(prev => ({ ...prev, [id]: price }));
  };

  // Google OAuth User state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // Custom Spreadsheet ID
  const [customSpreadsheetId, setCustomSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('ghosh_spreadsheet_id') || DEFAULT_SPREADSHEET_ID;
  });
  const [spreadsheetSavedMsg, setSpreadsheetSavedMsg] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Recorded orders read from Google Sheets
  const [isReadingSheets, setIsReadingSheets] = useState(false);
  const [sheetOrders, setSheetOrders] = useState<SheetRecordedOrder[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderHistoryItem | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [sheetReadSource, setSheetReadSource] = useState<string>('');

  const isDark = theme === 'dark';

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch status on open
  useEffect(() => {
    if (isAdminOpen) {
      loadSheetsInfo();
      loadSheetOrders();
    }
  }, [isAdminOpen]);

  const loadSheetsInfo = async () => {
    const info = await fetchSheetsSyncStatus();
    if (info) setSheetsInfo(info);
  };

  const loadSheetOrders = async () => {
    setIsReadingSheets(true);
    try {
      const token = await getAccessToken();
      const res = await fetchRecordedOrdersFromSheets(token || undefined, customSpreadsheetId);
      if (res.success && res.orders) {
        setSheetOrders(res.orders);
        setSheetReadSource(res.source);
      }
    } catch (e) {
      console.warn('Could not read direct sheet orders:', e);
    } finally {
      setIsReadingSheets(false);
    }
  };

  if (!isAdminOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setGoogleAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        await loadSheetsInfo();
        await loadSheetOrders();
      }
    } catch (err: any) {
      setGoogleAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      await loadSheetsInfo();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSpreadsheetId = () => {
    const trimmed = customSpreadsheetId.trim();
    if (trimmed) {
      localStorage.setItem('ghosh_spreadsheet_id', trimmed);
      setSpreadsheetSavedMsg(true);
      setTimeout(() => setSpreadsheetSavedMsg(false), 3000);
      loadSheetsInfo();
      loadSheetOrders();
    }
  };

  const handleBatchSync = async () => {
    setBatchSyncing(true);
    setBatchSyncMsg(null);
    try {
      await syncAllPendingOrders();
      setBatchSyncMsg(
        language === 'bn'
          ? 'সব অর্ডার গুগল শিটসে সিঙ্ক করা হয়েছে!'
          : 'All orders processed for Google Sheets sync!'
      );
      await loadSheetsInfo();
      await loadSheetOrders();
    } catch (e: any) {
      setBatchSyncMsg(e.message || 'Batch sync error');
    } finally {
      setBatchSyncing(false);
      setTimeout(() => setBatchSyncMsg(null), 4000);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    const token = await getAccessToken();
    await updateOrderSheetStatus(orderId, newStatus, token || undefined, customSpreadsheetId);
    // Refresh display
    setSheetOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  // Helper counts for status tabs
  const getOrdersCountByStatus = (status: OrderStatus) => {
    return orderHistory.filter(o => {
      if (status === 'New Order') {
        return o.status === 'New Order' || !o.status;
      }
      return o.status === status;
    }).length;
  };

  const newOrdersCount = getOrdersCountByStatus('New Order');
  const confirmedCount = getOrdersCountByStatus('Confirmed');
  const preparingCount = getOrdersCountByStatus('Preparing');
  const outForDeliveryCount = getOrdersCountByStatus('Out for Delivery');
  const deliveredCount = getOrdersCountByStatus('Delivered') + getOrdersCountByStatus('Completed');
  const cancelledCount = getOrdersCountByStatus('Cancelled');

  const filteredOrders = orderHistory.filter(order => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'New Order') return order.status === 'New Order' || !order.status;
    if (statusFilter === 'Delivered') return order.status === 'Delivered' || order.status === 'Completed';
    return order.status === statusFilter;
  });

  const currentSheetId = customSpreadsheetId || DEFAULT_SPREADSHEET_ID;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" id="owner-dashboard-modal">
      <div
        className={`w-full max-w-6xl max-h-[94vh] rounded-3xl overflow-hidden border flex flex-col ${
          isDark
            ? 'bg-[#180E08] border-amber-500/40 text-stone-200'
            : 'bg-white border-amber-800/20 text-stone-900 shadow-2xl'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between flex-shrink-0 bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-bengali">
                  {language === 'bn' ? 'ঘোষ সুইট হাউজ — মালিকানা ড্যাশবোর্ড' : 'Ghosh Sweet House — Owner Dashboard'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  GOOGLE SHEETS LIVE
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5 font-mono">
                <span>Spreadsheet: <strong className="text-amber-300">Ghosh Sweet House Orders</strong></span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-stone-500">Sheet: Orders</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'গুগল শিট খুলুন' : 'Open Google Sheet'}</span>
            </a>

            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="p-2 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200 transition-colors"
              id="close-owner-dashboard-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 bg-stone-950/20 flex-shrink-0">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveMainTab('orders')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeMainTab === 'orders'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-300'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'bn' ? 'অর্ডার ড্যাশবোর্ড' : 'Live Orders'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono">
                {orderHistory.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('sheetsConfig')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeMainTab === 'sheetsConfig'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'গুগল শিটস সংযোগ' : 'Google Sheets Setup'}</span>
              {googleUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('prices')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'prices'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>🍬</span>
              <span>{language === 'bn' ? 'মিষ্টির দাম' : 'Sweet Prices'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('reviews')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeMainTab === 'reviews'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-300'
              }`}
            >
              <span>⭐</span>
              <span>{language === 'bn' ? 'রিভিউ' : 'Reviews'}</span>
            </button>
          </div>

          <div className="pb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={loadSheetOrders}
              disabled={isReadingSheets}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors disabled:opacity-50"
              title="Refresh recorded orders"
            >
              <RefreshCw className={`w-3 h-3 ${isReadingSheets ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'সংযোগ নির্দেশিকা' : 'Setup Guide'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Google Sheets Connection Step-by-Step Guide */}
        {showGuide && (
          <div className="p-4 sm:p-5 bg-amber-950/40 border-b border-amber-500/30 text-xs space-y-3 flex-shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'গুগল শিট সংযোগ ও স্বয়ংক্রিয় অর্ডার রেকর্ডিং নির্দেশিকা' : 'How to Connect Your Google Sheet (Step-by-Step Guide)'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-stone-300">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-stone-900/80 border-amber-500/20' : 'bg-white border-amber-200'}`}>
                <div className="font-bold text-amber-400 mb-1">
                  1. {language === 'bn' ? 'গুগল অ্যাকাউন্ট সাইন-ইন' : 'Google Account Sign-In'}
                </div>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  {language === 'bn'
                    ? '"Google Sheets Setup" ট্যাবে গিয়ে "Sign In with Google" বাটনে ক্লিক করুন এবং আপনার Google অ্যাকাউন্টে স্প্রেডশিট অ্যাক্সেসের অনুমতি দিন।'
                    : 'Click "Google Sheets Setup" tab and click "Sign In with Google" to grant permission for reading and writing to your Google Sheets.'}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-stone-900/80 border-amber-500/20' : 'bg-white border-amber-200'}`}>
                <div className="font-bold text-amber-400 mb-1">
                  2. {language === 'bn' ? 'শিটের নাম ও কলাম বিন্যাস' : 'Sheet Name & Columns'}
                </div>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  {language === 'bn'
                    ? 'স্প্রেডশিটের নাম হবে "Ghosh Sweet House Orders", আর প্রথম শিটের নাম "Orders"। ৯টি কলাম স্বয়ংক্রিয়ভাবে প্রস্তুত থাকবে (Order ID, Date/Time, Customer Name, Phone, Address, Items, Total, Payment Method, Order Status)।'
                    : 'Spreadsheet name is "Ghosh Sweet House Orders" with sheet tab "Orders". 9 standard columns are recorded automatically in new rows.'}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-stone-900/80 border-amber-500/20' : 'bg-white border-amber-200'}`}>
                <div className="font-bold text-amber-400 mb-1">
                  3. {language === 'bn' ? 'স্বয়ংক্রিয় নতুন সারি তৈরি' : 'Automatic New Rows'}
                </div>
                <p className="text-[11px] leading-relaxed text-stone-300">
                  {language === 'bn'
                    ? 'গ্রাহক যখনই ওয়েবসাইট থেকে অর্ডার করবেন, সাথে সাথে প্রতিটি অর্ডারের সম্পূর্ণ তথ্য দিয়ে একটি নতুন সারি যোগ হবে। কোনো পুরনো অর্ডার ওভাররাইট হবে না।'
                    : 'Every completed customer order appends a brand new row with the full details. Previous order rows are permanently preserved and never overwritten.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5">
          {activeMainTab === 'orders' && (
            <div className="space-y-5">
              {/* Status Filter Cards / Tabs requested by user */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {/* 1. All */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'ALL'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500 font-bold'
                      : isDark
                      ? 'bg-stone-900/50 border-stone-800 text-stone-300 hover:border-amber-500/30'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-500/30'
                  }`}
                >
                  <span className="text-[11px] text-stone-400 font-bengali block">
                    {language === 'bn' ? 'সকল অর্ডার' : 'All Orders'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-amber-400">
                    {orderHistory.length}
                  </div>
                </button>

                {/* 2. New Orders */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('New Order')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'New Order'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-1 ring-amber-400 font-bold'
                      : isDark
                      ? 'bg-amber-950/20 border-amber-500/20 text-amber-300 hover:border-amber-500/40'
                      : 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-500/40'
                  }`}
                >
                  <span className="text-[11px] font-bengali flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>{language === 'bn' ? 'নতুন অর্ডার' : 'New Orders'}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-amber-400">
                    {newOrdersCount}
                  </div>
                </button>

                {/* 3. Confirmed */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('Confirmed')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'Confirmed'
                      ? 'bg-blue-500/25 border-blue-400 text-blue-300 ring-1 ring-blue-400 font-bold'
                      : isDark
                      ? 'bg-blue-950/20 border-blue-500/20 text-blue-300 hover:border-blue-500/40'
                      : 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-500/40'
                  }`}
                >
                  <span className="text-[11px] font-bengali flex items-center gap-1 text-blue-400">
                    <span>🔵</span>
                    <span>{language === 'bn' ? 'কনফার্মড' : 'Confirmed'}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-blue-400">
                    {confirmedCount}
                  </div>
                </button>

                {/* 4. Preparing */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('Preparing')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'Preparing'
                      ? 'bg-amber-600/25 border-amber-500 text-amber-200 ring-1 ring-amber-500 font-bold'
                      : isDark
                      ? 'bg-stone-900/50 border-stone-800 text-amber-300 hover:border-amber-500/30'
                      : 'bg-orange-50 border-orange-200 text-orange-900 hover:border-orange-500/30'
                  }`}
                >
                  <span className="text-[11px] font-bengali flex items-center gap-1 text-orange-400">
                    <span>🧑‍🍳</span>
                    <span>{language === 'bn' ? 'প্রস্তুত হচ্ছে' : 'Preparing'}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-orange-400">
                    {preparingCount}
                  </div>
                </button>

                {/* 5. Out for Delivery */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('Out for Delivery')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'Out for Delivery'
                      ? 'bg-purple-500/25 border-purple-400 text-purple-300 ring-1 ring-purple-400 font-bold'
                      : isDark
                      ? 'bg-purple-950/20 border-purple-500/20 text-purple-300 hover:border-purple-500/40'
                      : 'bg-purple-50 border-purple-200 text-purple-900 hover:border-purple-500/40'
                  }`}
                >
                  <span className="text-[11px] font-bengali flex items-center gap-1 text-purple-400">
                    <span>🛵</span>
                    <span>{language === 'bn' ? 'ডেলিভারিতে' : 'Out for Delivery'}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-purple-400">
                    {outForDeliveryCount}
                  </div>
                </button>

                {/* 6. Delivered */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('Delivered')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'Delivered'
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400 font-bold'
                      : isDark
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-500/40'
                  }`}
                >
                  <span className="text-[11px] font-bengali flex items-center gap-1 text-emerald-400">
                    <span>🟢</span>
                    <span>{language === 'bn' ? 'ডেলিভার্ড' : 'Delivered'}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-emerald-400">
                    {deliveredCount}
                  </div>
                </button>

                {/* 7. Cancelled */}
                <button
                  type="button"
                  onClick={() => setStatusFilter('Cancelled')}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    statusFilter === 'Cancelled'
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300 ring-1 ring-rose-400 font-bold'
                      : isDark
                      ? 'bg-rose-950/20 border-rose-500/20 text-rose-300 hover:border-rose-500/40'
                      : 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-500/40'
                  }`}
                >
                  <span className="text-[11px] font-bengali flex items-center gap-1 text-rose-400">
                    <span>❌</span>
                    <span>{language === 'bn' ? 'বাতিল' : 'Cancelled'}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-rose-400">
                    {cancelledCount}
                  </div>
                </button>
              </div>

              {/* Sync Action & Summary Bar */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'bg-stone-950/70 border-amber-500/20' : 'bg-amber-500/5 border-amber-500/20'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-stone-200">
                      {language === 'bn'
                        ? `ফিল্টার: ${statusFilter === 'ALL' ? 'সকল অর্ডার' : statusFilter} (${filteredOrders.length} টি পাওয়া গেছে)`
                        : `Viewing: ${statusFilter === 'ALL' ? 'All Orders' : statusFilter} (${filteredOrders.length} orders)`}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                      {sheetReadSource === 'google_sheets'
                        ? '🟢 Direct Google Sheets live synchronization active'
                        : '🔄 Multi-database persistent fallback active'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {batchSyncMsg && (
                    <span className="text-xs text-emerald-400 font-medium font-bengali">
                      {batchSyncMsg}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleBatchSync}
                    disabled={batchSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${batchSyncing ? 'animate-spin' : ''}`} />
                    <span>{language === 'bn' ? 'পুনরায় শিটসে সিঙ্ক' : 'Retry Pending'}</span>
                  </button>
                </div>
              </div>

              {/* Orders List: Responsive Mobile Cards + Desktop Table */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-700 rounded-3xl p-6">
                  <Package className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-stone-300 font-bengali">
                    {language === 'bn'
                      ? 'এই স্ট্যাটাসে কোনো অর্ডার নেই।'
                      : 'No orders found matching this status.'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {language === 'bn'
                      ? 'নতুন অর্ডারের জন্য অপেক্ষা করা হচ্ছে।'
                      : 'Waiting for customers to place new orders.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* MOBILE CARDS VIEW (< sm) */}
                  <div className="block sm:hidden space-y-3">
                    {filteredOrders.map((order) => {
                      const itemsStr = order.items && order.items.length > 0
                        ? order.items.map(it => `${it.product?.nameEn || 'Item'} x${it.quantity}`).join(', ')
                        : 'Custom Sweets';

                      return (
                        <div
                          key={order.id}
                          className={`p-4 rounded-2xl border space-y-3 ${
                            isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-white border-stone-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              {order.date}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-stone-400 flex items-center gap-1 font-sans font-medium text-stone-200">
                                <User className="w-3.5 h-3.5 text-amber-400" />
                                {order.customerName || 'Customer'}
                              </span>
                              {order.customerPhone && (
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="text-amber-400 hover:underline flex items-center gap-1 font-mono font-bold"
                                >
                                  <Phone className="w-3 h-3" />
                                  {order.customerPhone}
                                </a>
                              )}
                            </div>

                            {order.deliveryAddress && (
                              <div className="flex items-start gap-1 text-[11px] text-stone-400 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{order.deliveryAddress}</span>
                              </div>
                            )}

                            <div className="flex items-start gap-1 text-[11px] text-stone-300 pt-1">
                              <Package className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                              <span className="font-medium">{itemsStr}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                              <div className="flex items-center gap-1 text-xs text-stone-400">
                                <CreditCard className="w-3 h-3 text-emerald-400" />
                                <span>{order.paymentMethod || 'Cash on Delivery'}</span>
                              </div>
                              <span className="text-sm font-bold font-mono text-amber-400">
                                ₹{order.finalTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Mobile Status Selector & Print Invoice */}
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-800/80">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceOrder(order);
                                setIsInvoiceOpen(true);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                              title="Print Invoice / PDF"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-400" />
                              <span>{language === 'bn' ? 'রসিদ' : 'Print'}</span>
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-semibold py-1.5 px-3 rounded-xl border focus:outline-none ${
                                order.status === 'Delivered' || order.status === 'Completed'
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                  : order.status === 'Cancelled'
                                  ? 'bg-rose-950 border-rose-500 text-rose-300'
                                  : order.status === 'Confirmed'
                                  ? 'bg-blue-950 border-blue-500 text-blue-300'
                                  : order.status === 'Preparing'
                                  ? 'bg-orange-950 border-orange-500 text-orange-300'
                                  : order.status === 'Out for Delivery'
                                  ? 'bg-purple-950 border-purple-500 text-purple-300'
                                  : 'bg-amber-950 border-amber-500 text-amber-300'
                              }`}
                            >
                              <option value="New Order">New Order</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE VIEW (>= sm) */}
                  <div className="hidden sm:block overflow-x-auto rounded-2xl border border-amber-500/20">
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b text-[11px] uppercase tracking-wider font-mono ${
                        isDark ? 'bg-stone-900/80 border-amber-500/20 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}>
                        <tr>
                          <th className="py-3 px-3">Order ID</th>
                          <th className="py-3 px-3">Date/Time</th>
                          <th className="py-3 px-3">Customer Name</th>
                          <th className="py-3 px-3">Phone</th>
                          <th className="py-3 px-3">Address</th>
                          <th className="py-3 px-3">Items and quantities</th>
                          <th className="py-3 px-3">Total Amount</th>
                          <th className="py-3 px-3">Payment Method</th>
                          <th className="py-3 px-3">Order Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10 font-mono">
                        {filteredOrders.map((order) => {
                          const itemsText = order.items && order.items.length > 0
                            ? order.items.map(it => `${it.product?.nameEn || 'Item'} x${it.quantity}`).join(', ')
                            : 'Custom Items';

                          return (
                            <tr
                              key={order.id}
                              className={`hover:bg-amber-500/5 transition-colors ${
                                isDark ? 'bg-stone-950/40' : 'bg-white'
                              }`}
                            >
                              {/* 1. Order ID */}
                              <td className="py-3 px-3 font-bold text-amber-400 whitespace-nowrap">
                                #{order.id}
                              </td>

                              {/* 2. Date/Time */}
                              <td className="py-3 px-3 text-[11px] text-stone-400 whitespace-nowrap">
                                {order.date}
                              </td>

                              {/* 3. Customer Name */}
                              <td className="py-3 px-3 font-sans truncate max-w-[120px] font-semibold text-stone-200">
                                {order.customerName || 'Guest Customer'}
                              </td>

                              {/* 4. Phone */}
                              <td className="py-3 px-3 text-stone-300 whitespace-nowrap">
                                {order.customerPhone ? (
                                  <a
                                    href={`tel:${order.customerPhone}`}
                                    className="hover:text-amber-400 hover:underline flex items-center gap-1 font-mono"
                                  >
                                    <Phone className="w-3 h-3 text-amber-400" />
                                    <span>{order.customerPhone}</span>
                                  </a>
                                ) : (
                                  <span className="text-stone-500">N/A</span>
                                )}
                              </td>

                              {/* 5. Address */}
                              <td className="py-3 px-3 font-sans truncate max-w-[140px] text-stone-300 text-[11px]" title={order.deliveryAddress}>
                                {order.deliveryAddress || (order.orderType === 'takeaway' ? 'Store Counter' : 'Kaliachak / Malda')}
                              </td>

                              {/* 6. Items and quantities */}
                              <td className="py-3 px-3 font-sans truncate max-w-[170px] text-[11px]" title={itemsText}>
                                {itemsText}
                              </td>

                              {/* 7. Total Amount */}
                              <td className="py-3 px-3 font-bold text-amber-300 whitespace-nowrap">
                                ₹{order.finalTotal.toFixed(2)}
                              </td>

                              {/* 8. Payment Method */}
                              <td className="py-3 px-3 text-[11px] font-sans text-stone-300 whitespace-nowrap">
                                {order.paymentMethod || 'Cash on Delivery'}
                              </td>

                              {/* 9. Order Status Selector */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                  className={`text-xs font-semibold py-1 px-2 rounded-lg border font-sans focus:outline-none ${
                                    order.status === 'Delivered' || order.status === 'Completed'
                                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                      : order.status === 'Cancelled'
                                      ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                                      : order.status === 'Confirmed'
                                      ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                                      : order.status === 'Preparing'
                                      ? 'bg-orange-950/80 border-orange-500/50 text-orange-300'
                                      : order.status === 'Out for Delivery'
                                      ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                                      : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                                  }`}
                                >
                                  <option value="New Order">New Order</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Preparing">Preparing</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoiceOrder(order);
                                    setIsInvoiceOpen(true);
                                  }}
                                  title="Print Order Invoice / PDF"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                                >
                                  <Printer className="w-3 h-3 text-amber-400" />
                                  <span>Print</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => retrySyncOrder(order.id)}
                                  title="Sync row to Google Sheets"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Sync</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Google Sheets Setup & Live Connection Settings */}
          {activeMainTab === 'sheetsConfig' && (
            <div className="space-y-6 max-w-3xl">
              {/* Google OAuth Account Card */}
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-stone-900/60 border-amber-500/25' : 'bg-white border-stone-200'}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base font-bengali text-amber-300">
                        {language === 'bn' ? 'Google অ্যাকাউন্ট ও ওয়ার্কস্পেস অনুমোদন' : 'Google Account & Sheets OAuth'}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {googleUser
                          ? `Connected as ${googleUser.email || googleUser.displayName || 'Google Owner'}`
                          : 'Not connected with personal Google account yet'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {googleUser ? (
                      <button
                        type="button"
                        onClick={handleGoogleSignOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-rose-950/60 text-stone-300 hover:text-rose-300 border border-stone-700 text-xs font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{language === 'bn' ? 'লগআউট করুন' : 'Disconnect'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isSigningInGoogle}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-60"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>
                          {isSigningInGoogle
                            ? (language === 'bn' ? 'সংযুক্ত হচ্ছে...' : 'Connecting...')
                            : (language === 'bn' ? 'Sign in with Google' : 'Sign in with Google')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {googleAuthError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{googleAuthError}</span>
                  </div>
                )}
              </div>

              {/* Spreadsheet ID & Direct Sheet Configuration */}
              <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-stone-900/60 border-amber-500/25' : 'bg-white border-stone-200'}`}>
                <div>
                  <h4 className="font-bold text-sm font-bengali text-amber-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'bn' ? 'টার্গেট স্প্রেডশিট কনফিগারেশন' : 'Target Google Spreadsheet Configuration'}</span>
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    {language === 'bn'
                      ? 'ডিফল্ট স্প্রেডশিট "Ghosh Sweet House Orders"-এ অর্ডার সংরক্ষণ করা হয়। আপনি চাইলে আপনার তৈরি শিটের আইডি বা ইউআরএল এখানে দিতে পারেন।'
                      : 'Orders are sent automatically to "Ghosh Sweet House Orders". You can also specify your own custom Spreadsheet ID or URL here.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    Spreadsheet ID:
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={customSpreadsheetId}
                      onChange={(e) => setCustomSpreadsheetId(e.target.value)}
                      placeholder="1RfwlEcYJSQPTpON9-MUW-b6dsA120PzQ-srrVvmkZH8"
                      className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                        isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleSaveSpreadsheetId}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save ID'}</span>
                    </button>

                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'শিট খুলুন' : 'Open Sheet'}</span>
                    </a>
                  </div>

                  {spreadsheetSavedMsg && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'স্প্রেডশিট আইডি সফলভাবে আপডেট হয়েছে!' : 'Spreadsheet ID saved successfully!'}</span>
                    </p>
                  )}
                </div>

                {/* Recorded Column Structure preview */}
                <div className="pt-3 border-t border-stone-800 space-y-2">
                  <span className="text-xs font-semibold text-stone-300 block font-bengali">
                    {language === 'bn' ? '৯টি নির্দিষ্ট কলাম বিন্যাস (Columns):' : '9 Recorded Columns:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPECTED_SHEET_COLUMNS.map((col, idx) => (
                      <span
                        key={col}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-[11px] font-mono text-stone-300"
                      >
                        {idx + 1}. {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Sweet Prices */}
          {activeMainTab === 'prices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-amber-500/10">
                <span>আইটেমের নাম (Item)</span>
                <span>পরিমাণ (Portion)</span>
                <span>বর্তমান মূল্য (Price ₹)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((item: ProductItem) => {
                  const currentVal = editedPrices[item.id] !== undefined ? editedPrices[item.id] : item.price;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? 'bg-stone-900/50 border-amber-500/15' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-amber-300 font-bengali truncate">
                          {language === 'bn' ? item.nameBn : item.nameEn}
                        </p>
                        <p className="text-[10px] text-stone-400 font-bengali">
                          {language === 'bn' ? item.portionBn : item.portionEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-mono text-stone-400">₹</span>
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                          className={`w-20 px-2 py-1 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-amber-500/15">
                <button
                  type="button"
                  onClick={resetToDefaultData}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 border border-stone-700 hover:border-stone-500 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডিফল্ট দাম ফিরিয়ে আনুন' : 'Reset to Defaults'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold font-bengali flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'দাম আপডেট হয়েছে!' : 'Prices updated!'}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      Object.entries(editedPrices).forEach(([id, price]) => {
                        updateProductPrice(id, price);
                      });
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2500);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সব দাম সেভ করুন' : 'Save All Prices'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeMainTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-stone-900/50 border-amber-500/15' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-amber-300 font-bengali">
                        {language === 'bn' ? rev.nameBn : rev.nameEn}
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        {language === 'bn' ? rev.locationBn : rev.locationEn} • {rev.date}
                      </p>
                    </div>
                    <span className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p className="text-xs text-stone-300 font-bengali mt-2">
                    "{language === 'bn' ? rev.commentBn : rev.commentEn}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Owner Printable Invoice View */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        language={language}
        theme={theme}
      />
    </div>
  );
};
