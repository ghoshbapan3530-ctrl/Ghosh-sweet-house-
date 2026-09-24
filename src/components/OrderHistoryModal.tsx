import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Clock,
  RotateCcw,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  Truck,
  FileSpreadsheet,
  RefreshCw,
  Printer,
  FileText,
  Gift
} from 'lucide-react';
import { OrderStatus, OrderHistoryItem } from '../types';
import { SyncStatusBadge } from './SyncStatusBadge';
import { InvoiceModal } from './InvoiceModal';

export const OrderHistoryModal: React.FC = () => {
  const {
    isOrdersOpen,
    setIsOrdersOpen,
    orderHistory,
    reorder,
    simulateNextOrderStatus,
    retrySyncOrder,
    language,
    theme,
    t,
    setIsCartOpen
  } = useShop();

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderHistoryItem | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  if (!isOrdersOpen) return null;

  const isDark = theme === 'dark';

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return {
          icon: <ChefHat className="w-3.5 h-3.5 animate-pulse text-amber-400" />,
          label: language === 'bn' ? 'রসুইঘরে তৈরি হচ্ছে' : 'Preparing in Kitchen',
          badgeClass: isDark
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-amber-100 text-amber-800 border-amber-300',
          step: 1
        };
      case 'Out for Delivery':
        return {
          icon: <Truck className="w-3.5 h-3.5 text-blue-400" />,
          label: language === 'bn' ? 'ডেলিভারির পথে' : 'Out for Delivery',
          badgeClass: isDark
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            : 'bg-blue-100 text-blue-800 border-blue-300',
          step: 2
        };
      case 'Ready for Pickup':
        return {
          icon: <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />,
          label: language === 'bn' ? 'গ্রহণের জন্য প্রস্তুত' : 'Ready for Pickup',
          badgeClass: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          step: 2
        };
      case 'Delivered':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered',
          badgeClass: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300',
          step: 3
        };
      case 'Completed':
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />,
          label: language === 'bn' ? 'অর্ডার সম্পন্ন' : 'Completed',
          badgeClass: isDark
            ? 'bg-stone-800 text-stone-300 border-stone-700'
            : 'bg-stone-200 text-stone-700 border-stone-300',
          step: 3
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOrdersOpen(false)}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        <div
          className={`w-full max-w-2xl rounded-3xl shadow-2xl border text-left overflow-hidden transform transition-all relative z-10 flex flex-col max-h-[90vh] ${
            isDark
              ? 'bg-[#180E08] border-amber-500/30 text-stone-200'
              : 'bg-[#FCF9F4] border-amber-800/20 text-stone-900'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-amber-500/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-bengali">
                  {language === 'bn' ? 'মিষ্টি পয়েন্টস ও অর্ডার হিস্ট্রি' : 'Sweet Points & Order History'}
                </h3>
                <p className="text-xs text-stone-400 font-bengali">
                  {language === 'bn'
                    ? 'আপনার অর্জিত লয়্যালটি রিওয়ার্ডস এবং বিগত অর্ডারের লাইভ ট্র্যাকিং'
                    : 'Your loyalty points balance & live tracking of past sweet orders'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOrdersOpen(false)}
              className="p-2 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* VIP Ghosh Sweet Club Special 5% Discount Card */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border relative overflow-hidden shadow-lg ${
                isDark
                  ? 'bg-gradient-to-br from-amber-950/70 via-stone-900 to-amber-950/40 border-amber-500/40'
                  : 'bg-gradient-to-br from-amber-100 via-white to-amber-50 border-amber-300'
              }`}
            >
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950">
                      {language === 'bn' ? 'ঘোষ মেম্বারশিপ' : 'Ghosh Sweet Club'}
                    </span>
                    <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {language === 'bn' ? 'সক্রিয় সুবিধা' : 'Active Privileges'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      5% OFF
                    </span>
                    <span className="text-sm font-bold font-bengali text-amber-300">
                      {language === 'bn' ? 'ফ্ল্যাট ছাড় (₹১০০+ অর্ডারে)' : 'Flat Discount on ₹100+ Orders'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 font-bengali mt-1">
                    {language === 'bn'
                      ? 'যেকোনো ১০০ টাকার বেশি অর্ডারে সরাসরি ৫% নগদ ছাড় এবং প্রতিটি অর্ডারে প্রিন্টযোগ্য ইনভয়েস রসিদ।'
                      : 'Enjoy flat 5% instant cash discount on every order over ₹100 with official printable invoice.'}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end justify-center gap-2 bg-amber-500/10 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrdersOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'নতুন মিষ্টি অর্ডার করুন' : 'Order More Sweets'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Order History Header */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm sm:text-base font-bengali">
                  {language === 'bn' ? 'বিগত অর্ডার ও ট্র্যাকিং' : 'Past Orders & Status Tracking'}
                </h4>
              </div>
              <span className="text-xs text-stone-400 font-mono">
                {orderHistory.length} {language === 'bn' ? 'টি অর্ডার' : 'orders'}
              </span>
            </div>

            {/* Orders List */}
            {orderHistory.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-amber-500/20 rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-amber-500/40 mx-auto mb-2" />
                <p className="text-sm font-bengali text-stone-400 max-w-sm mx-auto">
                  {t.orderHistoryEmpty}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOrdersOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400"
                >
                  {language === 'bn' ? 'মেনু থেকে মিষ্টি যোগ করুন' : 'Browse Sweets'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const isPreparing = order.status === 'Preparing';
                  const isOutForDelivery = order.status === 'Out for Delivery';
                  const isReady = order.status === 'Ready for Pickup';
                  const isDelivered = order.status === 'Delivered' || order.status === 'Completed';

                  return (
                    <div
                      key={order.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isDark
                          ? 'bg-stone-900/60 border-amber-500/20 hover:border-amber-500/40'
                          : 'bg-white border-amber-800/15 shadow-sm'
                      }`}
                    >
                      {/* Top Bar: Order ID, Date, Sheets Sync Status & Kitchen Status Pill */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-500/15">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-mono font-bold text-xs sm:text-sm text-amber-400">
                            #{order.id}
                          </span>
                          <span className="text-[11px] text-stone-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {order.date}
                          </span>

                          {/* Google Sheets Real-time Sync Status Indicator */}
                          <div className="flex items-center gap-1 pl-1 border-l border-amber-500/20">
                            <span className="text-[10px] text-stone-400 font-mono hidden md:inline">Sheets:</span>
                            <SyncStatusBadge
                              status={order.syncStatus || 'pending'}
                              orderId={order.id}
                              onRetry={retrySyncOrder}
                              language={language}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.badgeClass}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>

                          {/* Quick Simulator button to test status updates */}
                          <button
                            type="button"
                            onClick={() => simulateNextOrderStatus(order.id)}
                            title={language === 'bn' ? 'পরবর্তী স্ট্যাটাস টেস্ট করুন' : 'Simulate Next Status'}
                            className="text-[11px] px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
                          >
                            {t.simulateStatusBtn}
                          </button>
                        </div>
                      </div>

                      {/* Visual Status Progression Tracker */}
                      <div className="py-4">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-2 font-bengali text-stone-400">
                          <span className={isPreparing || isOutForDelivery || isReady || isDelivered ? 'text-amber-400 font-bold' : ''}>
                            ১. {language === 'bn' ? 'তৈরি হচ্ছে (Preparing)' : '1. Preparing'}
                          </span>
                          <span className={isOutForDelivery || isReady || isDelivered ? 'text-blue-400 font-bold' : ''}>
                            ২. {order.orderType === 'takeaway'
                              ? language === 'bn' ? 'গ্রহণের জন্য প্রস্তুত' : '2. Ready for Pickup'
                              : language === 'bn' ? 'ডেলিভারির পথে (Out for Delivery)' : '2. Out for Delivery'}
                          </span>
                          <span className={isDelivered ? 'text-emerald-400 font-bold' : ''}>
                            ৩. {language === 'bn' ? 'ডেলিভারি সম্পন্ন (Delivered)' : '3. Delivered'}
                          </span>
                        </div>

                        {/* Progress Line */}
                        <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isDelivered
                                ? 'w-full bg-emerald-500'
                                : isOutForDelivery || isReady
                                ? 'w-[66%] bg-gradient-to-r from-amber-500 to-blue-400'
                                : 'w-[33%] bg-amber-500 animate-pulse'
                            }`}
                          />
                        </div>

                        {/* Helpful Status Notice */}
                        <div className="mt-2 text-xs font-bengali text-stone-400 flex items-center gap-1.5">
                          {isPreparing && (
                            <>
                              <ChefHat className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />
                              <span>{t.statusPreparingDesc}</span>
                            </>
                          )}
                          {isOutForDelivery && (
                            <>
                              <Truck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 animate-bounce" />
                              <span className="text-blue-400 font-medium">
                                {language === 'bn'
                                  ? 'ডেলিভারি পার্টনার আপনার মিষ্টি নিয়ে রওনা হয়েছেন।'
                                  : 'Delivery partner is on the way with your sweets.'}
                              </span>
                            </>
                          )}
                          {isReady && (
                            <>
                              <PackageCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="text-emerald-400 font-medium">{t.statusReadyDesc}</span>
                            </>
                          )}
                          {isDelivered && (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span>{language === 'bn' ? 'আপনার মিষ্টি সফলভাবে পৌঁছে দেওয়া হয়েছে। ধন্যবাদ!' : 'Order delivered successfully. Enjoy the authentic taste!'}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="space-y-1.5 pt-1 pb-3 text-xs">
                        <span className="text-stone-400 block font-semibold font-bengali text-[11px]">
                          {language === 'bn' ? 'অর্ডারকৃত আইটেম:' : 'Ordered Items:'}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl flex items-center justify-between border ${
                                isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold font-bengali block truncate">
                                  {language === 'bn' ? item.product.nameBn : item.product.nameEn}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  {item.selectedPortion} × {item.quantity}
                                </span>
                              </div>
                              <span className="font-semibold text-amber-400 font-mono">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Breakdown & Sweet Points info */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/10 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <span className="text-stone-400 text-[11px] block">
                              {language === 'bn' ? 'মোট প্রদেয়:' : 'Total Paid:'}
                            </span>
                            <span className="text-base font-bold text-amber-400 font-mono">
                              ₹{order.finalTotal}
                            </span>
                          </div>

                          {order.pointsRedeemed > 0 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px]">
                              -{order.pointsRedeemed} {language === 'bn' ? 'পয়েন্ট ছাড়' : 'pts off'}
                            </span>
                          )}

                          {order.pointsEarned > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              +{order.pointsEarned} {language === 'bn' ? 'পয়েন্ট অর্জিত' : 'pts earned'}
                            </span>
                          )}
                        </div>

                        {/* ROW ACTIONS: PRINT INVOICE, RETRY SYNC & REORDER BUTTON */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoiceOrder(order);
                              setIsInvoiceOpen(true);
                            }}
                            id={`print-invoice-btn-${order.id}`}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all active:scale-95 shadow-sm ${
                              isDark
                                ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30'
                                : 'bg-stone-100 hover:bg-stone-200 text-amber-900 border-stone-300'
                            }`}
                            title={language === 'bn' ? 'অর্ডার রসিদ / ইনভয়েস প্রিন্ট করুন' : 'Print Order Invoice / Save as PDF'}
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-bengali">
                              {language === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Invoice'}
                            </span>
                          </button>

                          {order.syncStatus === 'failed' && (
                            <button
                              type="button"
                              onClick={() => retrySyncOrder(order.id)}
                              id={`retry-sync-btn-${order.id}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 active:scale-95 transition-all shadow-md shadow-rose-500/10"
                              title={language === 'bn' ? 'গুগল শিটসে পুনরায় সিঙ্ক করুন' : 'Retry Google Sheets Sync'}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span className="font-bengali">
                                {language === 'bn' ? '🔴 পুনরায় সিঙ্ক' : '🔴 Retry Sync'}
                              </span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => reorder(order.id)}
                            id={`reorder-btn-${order.id}`}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95 transition-all shadow-md shadow-amber-500/10"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="font-bengali">{t.reorderBtn}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Printable PDF-like Order Invoice Modal */}
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
