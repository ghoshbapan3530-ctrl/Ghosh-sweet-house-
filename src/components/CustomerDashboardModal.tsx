import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  User,
  ShoppingBag,
  MapPin,
  Edit3,
  LogOut,
  Sparkles,
  Gift,
  Coins,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Printer,
  ChevronRight,
  Phone,
  Mail,
  Home,
  Star,
  Download
} from 'lucide-react';
import { SyncStatusBadge } from './SyncStatusBadge';
import { InvoiceModal } from './InvoiceModal';
import { PostOrderFeedbackModal } from './PostOrderFeedbackModal';
import { downloadOrderInvoicePdf } from '../lib/pdf-invoice';
import { OrderHistoryItem } from '../types';

export const CustomerDashboardModal: React.FC = () => {
  const {
    isDashboardOpen,
    setIsDashboardOpen,
    currentCustomer,
    updateCurrentCustomerProfile,
    logout,
    openSignUpModal,
    openLoginModal,
    pointsToRupees,
    orderHistory,
    reorder,
    retrySyncOrder,
    language,
    theme,
    setIsCartOpen
  } = useShop();

  const isDark = theme === 'dark';

  // Navigation tab state: 'orders' | 'address' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'profile'>('orders');

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentCustomer?.name || '');
  const [editEmail, setEditEmail] = useState(currentCustomer?.email || '');
  const [editAddress, setEditAddress] = useState(currentCustomer?.address || '');
  const [editPinCode, setEditPinCode] = useState(currentCustomer?.pinCode || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Selected Order for Printable Invoice Modal
  const [invoiceOrder, setInvoiceOrder] = useState<OrderHistoryItem | null>(null);

  // Selected Order for Post-Order Feedback Modal
  const [feedbackOrder, setFeedbackOrder] = useState<OrderHistoryItem | null>(null);

  // Logout Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync edit state with currentCustomer whenever it changes
  React.useEffect(() => {
    if (currentCustomer) {
      setEditName(currentCustomer.name || '');
      setEditEmail(currentCustomer.email || '');
      setEditAddress(currentCustomer.address || '');
      setEditPinCode(currentCustomer.pinCode || '');
    }
  }, [currentCustomer]);

  if (!isDashboardOpen) return null;

  const handleClose = () => {
    setIsDashboardOpen(false);
    setProfileFeedback(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    setProfileFeedback(null);

    if (!editName.trim()) {
      setProfileFeedback({
        type: 'error',
        msg: language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Name is required.'
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateCurrentCustomerProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
        pinCode: editPinCode.trim()
      });

      if (res.success) {
        setProfileFeedback({
          type: 'success',
          msg: language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully in Firestore!'
        });
        setTimeout(() => setProfileFeedback(null), 3000);
      } else {
        setProfileFeedback({
          type: 'error',
          msg: res.error || 'Failed to update profile.'
        });
      }
    } catch (err: any) {
      setProfileFeedback({
        type: 'error',
        msg: err.message || 'Error saving changes.'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const customerOrders = currentCustomer
    ? orderHistory.filter(
        (ord) =>
          ord.customerId === currentCustomer.id ||
          ord.customerPhone === currentCustomer.mobile
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      id="customer-dashboard-modal"
    >
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 max-h-[92vh] flex flex-col ${
          isDark
            ? 'bg-[#180E08] border-amber-500/30 text-amber-50'
            : 'bg-white border-amber-900/15 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon: 👤 My Account / আমার অ্যাকাউন্ট */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/20 hover:bg-stone-950/30 text-stone-950 transition-colors"
            title="Close"
            id="dashboard-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-950 text-amber-300 flex items-center gap-1.5 shadow-sm">
              <User className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '👤 আমার অ্যাকাউন্ট' : '👤 My Account'}</span>
            </span>
            {currentCustomer && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-900/20 text-stone-950 font-bold border border-stone-950/20">
                UID: {currentCustomer.id.slice(0, 10)}...
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-serif leading-tight">
                {currentCustomer
                  ? currentCustomer.name
                  : language === 'bn'
                  ? 'অতিথি গ্রাহক (লগইন করা নেই)'
                  : 'Guest Customer (Not Logged In)'}
              </h2>
              {currentCustomer && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-stone-950/90 mt-1">
                  <span>📱 +91 {currentCustomer.mobile}</span>
                  {currentCustomer.email && (
                    <span className="font-sans font-normal opacity-80 truncate max-w-[200px]">
                      • {currentCustomer.email}
                    </span>
                  )}
                </div>
              )}
            </div>

            {currentCustomer ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                id="dashboard-logout-btn"
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-stone-950/20 hover:bg-stone-950/35 text-stone-950 border border-stone-950/30 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title={language === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট করুন' : 'Logout from Account'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '🚪 লগআউট' : '🚪 Logout'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openSignUpModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-950 text-amber-300 hover:bg-stone-900 flex items-center gap-1.5 shadow"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Sign Up'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openLoginModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-200 text-stone-950 hover:bg-amber-100 flex items-center gap-1.5 shadow"
                >
                  <span>{language === 'bn' ? 'লগইন' : 'Sign In'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Core Account Navigation Tabs */}
        {currentCustomer && (
          <div
            className={`flex border-b text-xs sm:text-sm font-bold flex-shrink-0 overflow-x-auto scrollbar-none ${
              isDark ? 'border-amber-500/20 bg-stone-950/80' : 'border-amber-900/10 bg-amber-50/60'
            }`}
          >
            {/* Tab 1: 📦 My Orders */}
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              id="acc-tab-orders"
              className={`flex-1 py-3 px-3 text-center transition-all border-b-2 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'border-amber-500 text-amber-400 font-extrabold bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'bn' ? '📦 আমার অর্ডার' : '📦 My Orders'}</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                {customerOrders.length}
              </span>
            </button>

            {/* Tab 2: 🏠 Delivery Address */}
            <button
              type="button"
              onClick={() => setActiveTab('address')}
              id="acc-tab-address"
              className={`flex-1 py-3 px-3 text-center transition-all border-b-2 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'address'
                  ? 'border-amber-500 text-amber-400 font-extrabold bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{language === 'bn' ? '🏠 ডেলিভারি ঠিকানা' : '🏠 Delivery Address'}</span>
            </button>

            {/* Tab 3: ✏️ Edit Profile */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              id="acc-tab-profile"
              className={`flex-1 py-3 px-3 text-center transition-all border-b-2 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-amber-500 text-amber-400 font-extrabold bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{language === 'bn' ? '✏️ প্রোফাইল পরিবর্তন' : '✏️ Edit Profile'}</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Sweet Points Quick Summary Bar */}
          {currentCustomer && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-sm ${
                isDark
                  ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-stone-900 border-amber-500/30'
                  : 'bg-gradient-to-r from-amber-50 to-amber-100/60 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-stone-200">
                    {language === 'bn' ? 'মিষ্টি লয়্যালটি ব্যালেন্স' : 'Sweet Loyalty Balance'}
                  </span>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {currentCustomer.sweetPoints} Pts = ₹{pointsToRupees(currentCustomer.sweetPoints).toFixed(2)} cash discount
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setIsCartOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all active:scale-95"
              >
                {language === 'bn' ? 'অর্ডার করুন' : 'Order Sweets'}
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: 📦 MY ORDERS                                              */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-serif flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Order History'}</span>
                </h3>
                <span className="text-xs text-stone-400 font-mono">
                  {customerOrders.length} {language === 'bn' ? 'টি অর্ডার' : 'orders'}
                </span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-stone-800 bg-[#140C07] text-stone-400 space-y-3">
                  <ShoppingBag className="w-10 h-10 mx-auto text-amber-500/60" />
                  <p className="text-xs font-semibold">
                    {language === 'bn'
                      ? 'এখনো কোনো অর্ডার করা হয়নি। খাঁটি মিষ্টি অর্ডার করুন!'
                      : 'You have not placed any orders yet. Explore our freshly made sweets!'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      setIsCartOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                  >
                    {language === 'bn' ? 'মিষ্টি মেনু দেখুন' : 'Explore Menu'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((ord) => {
                    const statusStr = (ord.status || '').toLowerCase();
                    const isDeliveredOrCollected =
                      statusStr === 'delivered' ||
                      statusStr === 'collected' ||
                      statusStr === 'completed' ||
                      ord.status === 'Delivered' ||
                      ord.status === 'Completed';

                    return (
                      <div
                        key={ord.id}
                        className={`p-4 rounded-2xl border transition-all text-xs ${
                          isDark ? 'bg-[#180E08] border-stone-800 hover:border-amber-500/40' : 'bg-white border-stone-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-stone-800/60 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              #{ord.id}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {ord.date}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {ord.status}
                          </span>
                        </div>

                        {/* Items summary */}
                        <p className="text-stone-300 font-medium truncate mb-2">
                          {ord.items.map((it) => `${language === 'bn' ? it.product.nameBn : it.product.nameEn} (x${it.quantity})`).join(', ')}
                        </p>

                        {/* Post-Order Feedback Mechanism for Delivered or Collected Orders */}
                        {isDeliveredOrCollected && (
                          ord.feedback ? (
                            <div className="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center text-amber-400">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${
                                        s <= ord.feedback!.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-stone-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] font-bold font-mono text-amber-400">
                                  {ord.feedback.rating}/5
                                </span>
                                {ord.feedback.tags && ord.feedback.tags.length > 0 && (
                                  <span className="text-[10px] text-stone-300 font-semibold truncate max-w-[140px]">
                                    • {ord.feedback.tags[0]}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setFeedbackOrder(ord)}
                                id={`edit-feedback-btn-${ord.id}`}
                                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                              >
                                {language === 'bn' ? 'মতামত পরিবর্তন' : 'Edit Review'}
                              </button>
                            </div>
                          ) : (
                            <div className="mb-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-amber-300 font-bengali">
                                  {language === 'bn' ? 'মিষ্টি কেমন লাগলো? অভিজ্ঞতা রেটিং দিন' : 'Rate Your Sweet Experience'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFeedbackOrder(ord)}
                                id={`rate-order-btn-${ord.id}`}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm shadow-amber-500/20"
                              >
                                <Star className="w-3 h-3 fill-stone-950" />
                                <span>{language === 'bn' ? 'রেটিং দিন' : 'Rate Order'}</span>
                              </button>
                            </div>
                          )
                        )}

                      <div className="flex items-center justify-between pt-2 border-t border-stone-800/40">
                        <span className="font-bold text-amber-400 font-mono text-sm">
                          ₹{ord.finalTotal.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadOrderInvoicePdf(ord)}
                            className="p-1.5 rounded-lg border border-amber-500/40 text-amber-300 hover:text-amber-200 bg-amber-500/10 text-xs flex items-center gap-1 active:scale-95 transition-all"
                            title={language === 'bn' ? 'সরাসরি PDF ইনভয়েস ডাউনলোড করুন' : 'Download PDF Invoice'}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInvoiceOrder(ord)}
                            className="p-1.5 rounded-lg border border-stone-700 text-stone-300 hover:text-amber-400 text-xs flex items-center gap-1"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'রসিদ' : 'Invoice'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              reorder(ord.id);
                              handleClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'আবার অর্ডার' : 'Reorder'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: 🏠 DELIVERY ADDRESS                                        */}
          {/* ================================================================= */}
          {activeTab === 'address' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-serif flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'সংরক্ষিত ডেলিভারি ঠিকানা' : 'Saved Delivery Address'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ঠিকানা পরিবর্তন' : 'Edit Address'}</span>
                </button>
              </div>

              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block font-mono">
                      {language === 'bn' ? 'ডিফল্ট হোম ডেলিভারি ঠিকানা' : 'Primary Delivery Location'}
                    </span>
                    <p className="text-sm font-semibold text-stone-100">
                      {currentCustomer?.address || (language === 'bn' ? 'কোনো ঠিকানা সংরক্ষিত নেই।' : 'No delivery address saved yet.')}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs text-stone-400 font-mono">
                      <span>PIN Code: <strong className="text-amber-400">{currentCustomer?.pinCode || '732201'}</strong></span>
                      <span>Phone: <strong className="text-stone-300">+91 {currentCustomer?.mobile}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ঠিকানা আপডেট করুন' : 'Update Delivery Address'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: ✏️ EDIT PROFILE                                            */}
          {/* ================================================================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                <h3 className="text-sm font-bold font-serif flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'প্রোফাইল পরিবর্তন করুন' : 'Edit Profile Information'}</span>
                </h3>
                <span className="text-[11px] text-stone-400">
                  {language === 'bn' ? 'ক্লাউড ফায়ারস্টোর সিঙ্ক' : 'Firestore Real-time Sync'}
                </span>
              </div>

              {profileFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    profileFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                  }`}
                >
                  {profileFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{profileFeedback.msg}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'পুরো নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile (Read-only verified) */}
              <div>
                <label className="block text-xs font-bold text-stone-400 mb-1">
                  {language === 'bn' ? 'যাচাইকৃত মোবাইল নম্বর (অপরিবর্তনযোগ্য)' : 'Verified Mobile (Fixed)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    disabled
                    value={`+91 ${currentCustomer?.mobile || ''}`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 text-xs font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  {language === 'bn' ? 'ইমেল ঠিকানা (ঐচ্ছিক)' : 'Email Address (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'ডেলিভারি ঠিকানা *' : 'Delivery Address *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'পিন কোড (PIN Code - ৬ সংখ্যা) *' : 'PIN Code (6 digits) *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={editPinCode}
                  onChange={(e) => setEditPinCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold tracking-widest focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? '🚪 লগআউট' : '🚪 Sign Out'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Firestore...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Logout Confirmation Prompt Dialog */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowLogoutConfirm(false)}
          role="alertdialog"
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-desc"
        >
          <div
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl transition-all animate-scale-up ${
              isDark
                ? 'bg-[#180E08] border-amber-500/30 text-stone-100'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <h3 id="logout-dialog-title" className="text-base font-bold font-serif text-stone-100">
                {language === 'bn' ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Sign Out'}
              </h3>
              <p id="logout-dialog-desc" className="text-xs text-stone-400 leading-relaxed">
                {language === 'bn'
                  ? 'আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান? পুনরায় প্রবেশ করতে মোবাইল নম্বরে ওটিপি (OTP) যাচাই করতে হবে।'
                  : 'Are you sure you want to sign out from your Ghosh Sweet House account? You will need to verify with OTP to sign back in.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                id="cancel-logout-btn"
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold text-xs transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsLoggingOut(true);
                  await logout();
                  setIsLoggingOut(false);
                  setShowLogoutConfirm(false);
                  handleClose();
                }}
                disabled={isLoggingOut}
                id="confirm-logout-btn"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <span>{language === 'bn' ? 'লগআউট হচ্ছে...' : 'Signing out...'}</span>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'হ্যাঁ, লগআউট' : 'Yes, Sign Out'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          isOpen={true}
          onClose={() => setInvoiceOrder(null)}
          language={language}
          theme={theme}
        />
      )}

      {/* Post-Order Customer Rating & Feedback Modal */}
      {feedbackOrder && (
        <PostOrderFeedbackModal
          order={feedbackOrder}
          isOpen={Boolean(feedbackOrder)}
          onClose={() => setFeedbackOrder(null)}
        />
      )}
    </div>
  );
};
