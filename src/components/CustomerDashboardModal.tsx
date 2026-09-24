import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Award,
  Sparkles,
  Gift,
  Coins,
  ArrowRight,
  LogOut,
  ShoppingBag,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { SyncStatusBadge } from './SyncStatusBadge';

export const CustomerDashboardModal: React.FC = () => {
  const {
    isDashboardOpen,
    setIsDashboardOpen,
    currentCustomer,
    logout,
    openSignUpModal,
    openLoginModal,
    pointsToRupees,
    orderHistory,
    reorder,
    retrySyncOrder,
    transactions,
    language,
    theme,
    setIsCartOpen
  } = useShop();

  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');

  if (!isDashboardOpen) return null;

  const handleClose = () => {
    setIsDashboardOpen(false);
  };

  const customerOrders = currentCustomer
    ? orderHistory.filter((ord) => ord.customerId === currentCustomer.id || ord.customerPhone === currentCustomer.mobile)
    : [];

  const remainingDiscountOrders = currentCustomer
    ? Math.max(0, 5 - currentCustomer.qualifyingOrdersCount)
    : 5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
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
        {/* Header */}
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
              <Award className="w-3.5 h-3.5" />
              {language === 'bn' ? 'মিষ্টি লয়্যালটি ড্যাশবোর্ড' : 'Sweet Loyalty Dashboard'}
            </span>
            {currentCustomer && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-200 text-amber-950 font-mono">
                {currentCustomer.id}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-bengali leading-tight">
                {currentCustomer
                  ? currentCustomer.name
                  : language === 'bn'
                  ? 'অতিথি গ্রাহক (লগইন করা নেই)'
                  : 'Guest Customer (Not Logged In)'}
              </h2>
              {currentCustomer && (
                <p className="text-xs sm:text-sm font-medium text-stone-900/90 font-mono mt-0.5">
                  📱 +91 {currentCustomer.mobile} {currentCustomer.email ? `• ${currentCustomer.email}` : ''}
                </p>
              )}
            </div>

            {currentCustomer ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  handleClose();
                }}
                id="dashboard-logout-btn"
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold bg-stone-950/20 hover:bg-stone-950/35 text-stone-950 border border-stone-950/25 flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগআউট' : 'Log Out'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openSignUpModal();
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-stone-950 text-amber-300 hover:bg-stone-900 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সাইন আপ' : 'Sign Up'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openLoginModal();
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-200 text-stone-950 hover:bg-amber-100 flex items-center gap-1.5"
                >
                  <span>{language === 'bn' ? 'লগইন' : 'Log In'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Loyalty Points Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Sweet Points Balance & Value */}
            <div
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
                isDark
                  ? 'bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-stone-900 border-amber-500/30'
                  : 'bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    {language === 'bn' ? 'উপলব্ধ মিষ্টি পয়েন্ট' : 'Available Sweet Points'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-500">
                    ১ পয়েন্ট = ₹০.৫০
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
                    {currentCustomer ? currentCustomer.sweetPoints : 0}
                  </span>
                  <span className="text-sm font-semibold opacity-75">
                    {language === 'bn' ? 'পয়েন্ট' : 'Sweet Points'}
                  </span>
                </div>

                <div className="mt-2 text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {language === 'bn' ? 'টাকার মূল্য:' : 'Rupee Value:'}{' '}
                    <strong className="text-base font-extrabold">
                      ₹{pointsToRupees(currentCustomer ? currentCustomer.sweetPoints : 0).toFixed(2)}
                    </strong>
                  </span>
                </div>

                <p className="text-xs opacity-70 mt-2">
                  {language === 'bn'
                    ? 'চেকআউটের সময় এই পয়েন্ট দিয়ে সরাসরি ক্যাশ ছাড় নিন।'
                    : 'Use points at checkout for instant cash discounts.'}
                </p>
              </div>

              {/* Mini Stats inside Card 1 */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-60 block">{language === 'bn' ? 'মোট অর্জিত:' : 'Total Earned:'}</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {currentCustomer ? currentCustomer.totalPointsEarned : 0} pts
                  </span>
                </div>
                <div>
                  <span className="opacity-60 block">{language === 'bn' ? 'ব্যবহৃত পয়েন্ট:' : 'Total Redeemed:'}</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {currentCustomer ? currentCustomer.totalPointsRedeemed : 0} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: New Customer 5% Discount Tracker */}
            <div
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all shadow-sm ${
                isDark
                  ? 'bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border-amber-500/30'
                  : 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Gift className="w-4 h-4" />
                    {language === 'bn' ? 'নতুন গ্রাহকের ৫% ছাড়' : 'New Customer 5% Offer'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950">
                    {language === 'bn' ? 'প্রথম ৫টি অর্ডার' : 'First 5 Orders'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
                    {currentCustomer ? currentCustomer.qualifyingOrdersCount : 0}/5
                  </span>
                  <span className="text-sm font-semibold opacity-75">
                    {language === 'bn' ? 'যোগ্য অর্ডার সম্পন্ন' : 'Qualifying Orders'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-500/20 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((currentCustomer?.qualifyingOrdersCount || 0) / 5) * 100)}%`
                    }}
                  />
                </div>

                <div className="mt-3 text-xs font-semibold">
                  {remainingDiscountOrders > 0 ? (
                    <span className="text-amber-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'bn'
                        ? `আরও ${remainingDiscountOrders}টি অর্ডারে ৫% ছাড় বাকি রয়েছে!`
                        : `${remainingDiscountOrders} orders remaining with 5% discount!`}
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'bn'
                        ? 'অভিনন্দন! আপনি ৫টি স্পেশাল অর্ডার সম্পন্ন করেছেন।'
                        : 'Congratulations! All 5 welcome discount orders completed.'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] opacity-70 mt-1.5">
                  <Info className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>{language === 'bn' ? 'যোগ্য অর্ডারের ন্যূনতম মান: ₹১০০' : 'Minimum order value: ₹100'}</span>
                </div>
              </div>

              {/* Order CTA */}
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setIsCartOpen(true);
                }}
                id="dashboard-order-now-btn"
                className="mt-4 w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {language === 'bn' ? 'অর্ডার করুন ও পয়েন্ট ব্যবহার করুন' : 'Order Now & Use Points'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rules & Benefits Explainer */}
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm ${
              isDark ? 'bg-[#120A05] border-amber-900/40 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {language === 'bn' ? 'মিষ্টি পয়েন্টস নিয়মাবলী ও শর্তসমূহ' : 'Sweet Points Rules & Benefits'}
            </h4>
            <ul className="space-y-1.5 text-xs opacity-90 pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  {language === 'bn'
                    ? 'প্রতিটি নতুন গ্রাহক সাইন আপ করার সাথে সাথেই ১০ মিষ্টি পয়েন্ট (₹৫.০০) স্বাগত বোনাস পাবেন।'
                    : 'Every new customer receives 10 Sweet Points (₹5.00) immediately after signup.'}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  {language === 'bn'
                    ? 'প্রতি ₹১০০ সফলভাবে খরচে ৫টি মিষ্টি পয়েন্ট অর্জিত হয় (যেমন: ₹৫০০ খরচ = ২৫ পয়েন্ট = ₹১২.৫০ ছাড়)।'
                    : 'For every ₹100 actually spent, customer earns 5 Sweet Points (e.g., ₹500 spent = 25 Points = ₹12.50 value).'}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  {language === 'bn'
                    ? '১ মিষ্টি পয়েন্ট = ₹০.৫০। কার্ট বা চেকআউটে সরাসরি ক্যাশ ডিসকাউন্ট হিসাবে ব্যবহার করা যায়।'
                    : '1 Sweet Point = ₹0.50. Use them directly during checkout for instant bill reduction.'}
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  {language === 'bn'
                    ? 'বাতিল, ব্যর্থ বা রিফান্ড হওয়া অর্ডারের জন্য কোনো পয়েন্ট দেওয়া হয় না।'
                    : 'Points are awarded only on completed, non-cancelled orders.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Orders & Sweet Points Transactions Switcher */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`text-xs sm:text-sm font-bold font-bengali px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অর্ডার হিস্ট্রি' : 'Order History'}</span>
                  <span className="text-[11px] opacity-80">({customerOrders.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className={`text-xs sm:text-sm font-bold font-bengali px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'transactions'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পয়েন্টস লেজার' : 'Points Ledger'}</span>
                  <span className="text-[11px] opacity-80">({transactions.length})</span>
                </button>
              </div>

              {currentCustomer && (
                <div className="text-[11px] font-mono opacity-60 hidden sm:block">
                  Auth ID: {currentCustomer.auth_user_id.slice(-8)}
                </div>
              )}
            </div>

            {activeTab === 'transactions' ? (
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <div
                    className={`p-6 rounded-2xl border text-center text-sm ${
                      isDark ? 'bg-stone-900/50 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
                    }`}
                  >
                    <Coins className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                    <p>{language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি।' : 'No transactions recorded yet.'}</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isDark ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            tx.points >= 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {tx.points >= 0 ? '+' : ''}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-200">
                            {tx.reason}
                            {tx.order_id && (
                              <span className="ml-1.5 opacity-60 font-mono text-[10px]">
                                ({tx.order_id})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] opacity-50 font-mono">
                            {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold font-mono text-sm ${
                            tx.points >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                        <div className="text-[10px] opacity-60 font-mono">
                          {tx.points >= 0 ? `+₹${(tx.points * 0.5).toFixed(2)}` : `-₹${(Math.abs(tx.points) * 0.5).toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : customerOrders.length === 0 ? (
              <div
                className={`p-6 rounded-2xl border text-center text-sm ${
                  isDark ? 'bg-stone-900/50 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}
              >
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                <p>
                  {language === 'bn'
                    ? 'আপনার এখনো কোনো অর্ডার নেই। মেনু থেকে পছন্দের মিষ্টি অর্ডার করুন ও পয়েন্ট অর্জন করুন!'
                    : 'No orders placed yet. Order your favorite sweets to earn Sweet Points!'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setIsCartOpen(true);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  {language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-stone-900/60 border-amber-900/30 hover:border-amber-500/40'
                        : 'bg-white border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-mono font-bold text-sm text-amber-500">
                            {order.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              order.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : order.status === 'Ready for Pickup'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {order.status}
                          </span>

                          {/* Real-time Google Sheets Sync Status indicator */}
                          <div className="flex items-center gap-1 pl-1 border-l border-amber-500/20">
                            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">Sheets:</span>
                            <SyncStatusBadge
                              status={order.syncStatus || 'pending'}
                              orderId={order.id}
                              onRetry={retrySyncOrder}
                              language={language}
                            />
                          </div>
                        </div>
                        <span className="text-xs opacity-60 block mt-0.5">{order.date}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-amber-400 font-mono">
                          ₹{order.finalTotal.toFixed(2)}
                        </span>
                        <span className="text-xs opacity-60 block">
                          ({order.items.length} {language === 'bn' ? 'টি পদ' : 'items'})
                        </span>
                      </div>
                    </div>

                    {/* Breakdown details */}
                    <div className="mt-3 pt-2.5 border-t border-stone-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="opacity-60 block">{language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                        <span className="font-bold font-mono">₹{order.subtotal}</span>
                      </div>
                      {order.newCustomerDiscount && order.newCustomerDiscount > 0 ? (
                        <div>
                          <span className="opacity-60 block text-emerald-500 font-semibold">
                            {language === 'bn' ? '৫% নতুন গ্রাহক ছাড়:' : '5% New Offer:'}
                          </span>
                          <span className="font-bold text-emerald-500 font-mono">
                            -₹{order.newCustomerDiscount.toFixed(2)}
                          </span>
                        </div>
                      ) : null}
                      {order.pointsRedeemed > 0 ? (
                        <div>
                          <span className="opacity-60 block text-amber-400 font-semibold">
                            {language === 'bn' ? 'ব্যবহৃত পয়েন্ট:' : 'Points Used:'}
                          </span>
                          <span className="font-bold text-amber-400 font-mono">
                            {order.pointsRedeemed} pts (-₹{(order.pointsDiscountAmount || order.pointsRedeemed * 0.5).toFixed(2)})
                          </span>
                        </div>
                      ) : null}
                      <div>
                        <span className="opacity-60 block text-amber-400 font-semibold">
                          {language === 'bn' ? 'অর্জিত পয়েন্ট:' : 'Points Earned:'}
                        </span>
                        <span className="font-bold text-amber-400 font-mono">
                          +{order.pointsEarned} pts
                        </span>
                      </div>
                    </div>

                    {/* Items List & Reorder / Retry Sync Buttons */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-500/10">
                      <div className="text-xs opacity-75 truncate max-w-[280px] sm:max-w-md">
                        {order.items.map((it) => `${language === 'bn' ? it.product.nameBn : it.product.nameEn} (${it.quantity})`).join(', ')}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.syncStatus === 'failed' && (
                          <button
                            type="button"
                            onClick={() => retrySyncOrder(order.id)}
                            className="px-3 py-1 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors active:scale-95"
                            title={language === 'bn' ? 'গুগল শিটসে পুনরায় সিঙ্ক করুন' : 'Retry Google Sheets Sync'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? '🔴 পুনরায় সিঙ্ক' : '🔴 Retry Sync'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            reorder(order.id);
                            handleClose();
                          }}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'পুনরায় অর্ডার' : 'Reorder'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
