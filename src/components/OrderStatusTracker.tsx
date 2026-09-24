import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  FirebaseOrder,
  subscribeToOrder,
  FirebaseOrderStatus
} from '../lib/firestore-orders';
import {
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  Printer,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { OrderTimestamp } from './OrderTimestamp';

interface OrderStatusTrackerProps {
  orderId: string;
  onBack?: () => void;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ orderId, onBack }) => {
  const { language, theme, shopDetails } = useShop();
  const isDark = theme === 'dark';

  const [order, setOrder] = useState<FirebaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToOrder(
      orderId,
      (updatedOrder) => {
        setLoading(false);
        if (updatedOrder) {
          setOrder(updatedOrder);
        } else {
          setError(
            language === 'bn'
              ? 'অর্ডারটি পাওয়া যায়নি। অনুগ্রহ করে অর্ডার আইডি সঠিক কিনা দেখুন।'
              : 'Order not found. Please check that the Order ID is correct.'
          );
        }
      },
      (err) => {
        setLoading(false);
        setError(
          language === 'bn'
            ? 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।'
            : 'Failed to connect to order server. Please try again shortly.'
        );
      }
    );

    return () => unsubscribe();
  }, [orderId, language]);

  const steps: Array<{
    key: FirebaseOrderStatus;
    labelEn: string;
    labelBn: string;
    icon: React.ElementType;
    descEn: string;
    descBn: string;
  }> = [
    {
      key: 'PENDING',
      labelEn: 'Order Received',
      labelBn: 'অর্ডার গ্রহণ করা হয়েছে',
      icon: Clock,
      descEn: 'We have received your order and sent it to the kitchen.',
      descBn: 'আমরা আপনার মিষ্টির অর্ডারটি পেয়েছি।'
    },
    {
      key: 'ACCEPTED',
      labelEn: 'Accepted',
      labelBn: 'অর্ডার গৃহীত',
      icon: CheckCircle,
      descEn: 'The sweet master has approved your order.',
      descBn: 'দোকানদার আপনার অর্ডারটি নিশ্চিত করেছেন।'
    },
    {
      key: 'PREPARING',
      labelEn: 'Preparing',
      labelBn: 'তৈরি হচ্ছে',
      icon: ChefHat,
      descEn: 'Artisanal packaging & sweet assortment in progress.',
      descBn: 'টাটকা মিষ্টি প্যাক করা হচ্ছে।'
    },
    {
      key: 'READY',
      labelEn: 'Ready',
      labelBn: 'প্রস্তুত',
      icon: ShoppingBag,
      descEn: 'Box packed and sealed with hygienic care.',
      descBn: 'মিষ্টির বক্স সম্পূর্ণ প্রস্তুত।'
    },
    {
      key: 'OUT_FOR_DELIVERY',
      labelEn: 'Out for Delivery',
      labelBn: 'ডেলিভারির জন্য বের হয়েছে',
      icon: Truck,
      descEn: 'Delivery partner is on the way to your address.',
      descBn: 'ডেলিভারি বয় আপনার ঠিকানার পথে রওনা দিয়েছে।'
    },
    {
      key: 'DELIVERED',
      labelEn: 'Delivered',
      labelBn: 'ডেলিভারি সম্পন্ন',
      icon: CheckCircle,
      descEn: 'Delivered fresh and sweet to your doorstep!',
      descBn: 'আপনার মিষ্টি সফলভাবে পৌঁছে দেওয়া হয়েছে!'
    }
  ];

  const getStepIndex = (status?: FirebaseOrderStatus): number => {
    if (!status) return 0;
    const index = steps.findIndex((s) => s.key === status);
    return index !== -1 ? index : 0;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
          {language === 'bn' ? 'অর্ডারের তথ্য লোড হচ্ছে...' : 'Loading order status...'}
        </h3>
        <p className="text-xs text-stone-500 mt-1 font-mono">#{orderId}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
          {language === 'bn' ? 'অর্ডার খুঁজে পাওয়া যায়নি' : 'Order Not Found'}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm inline-flex items-center gap-2 hover:bg-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'দোকানে ফিরে যান' : 'Back to Shop'}</span>
          </button>
        )}
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-fade-in print:p-0 print:max-w-none">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-6 print:hidden">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'ফিরে যান' : 'Back to Store'}</span>
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1.5"
            title="Print invoice / Receipt"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-8 shadow-xl ${
          isDark
            ? 'bg-[#1A1009] border-amber-900/40 text-stone-100'
            : 'bg-white border-amber-800/15 text-stone-900'
        } print:border-none print:shadow-none print:bg-white print:text-black`}
      >
        {/* Brand header */}
        <div className="border-b border-amber-500/20 pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block mb-0.5">
              Ghosh Sweet House • ঘোষ মিষ্টান্ন ভাণ্ডার
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-serif">
              {language === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Order Tracking'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-amber-500">#{order.orderId}</span>
              <span className="text-stone-400">•</span>
              <OrderTimestamp timestamp={order.createdAt} mode="badge" />
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCancelled
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                  : order.status === 'DELIVERED'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse'
              }`}
            >
              {isCancelled ? (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অর্ডার বাতিল' : 'Order Cancelled'}</span>
                </>
              ) : order.status === 'DELIVERED' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn'
                      ? steps[currentStepIdx]?.labelBn || order.status
                      : steps[currentStepIdx]?.labelEn || order.status}
                  </span>
                </>
              )}
            </span>
            {order.estimatedMinutes && !isCancelled && order.status !== 'DELIVERED' && (
              <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                {language === 'bn'
                  ? `আনুমানিক সময়: ${order.estimatedMinutes} মিনিট`
                  : `Est. time: ~${order.estimatedMinutes} mins`}
              </span>
            )}
          </div>
        </div>

        {/* Cancelled Banner if applicable */}
        {isCancelled ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mb-8">
            <div className="flex items-center gap-2 font-bold text-sm">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>{language === 'bn' ? 'এই অর্ডারটি বাতিল করা হয়েছে' : 'This order has been cancelled.'}</span>
            </div>
            {order.cancelReason && (
              <p className="text-xs mt-1 ml-7">
                {language === 'bn' ? 'কারণ: ' : 'Reason: '}
                <span className="font-semibold">{order.cancelReason}</span>
              </p>
            )}
          </div>
        ) : (
          /* Visual Progress Timeline */
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4 font-bengali">
              {language === 'bn' ? 'অর্ডারের বর্তমান অগ্রগতি' : 'Live Order Progress'}
            </h2>
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-300 dark:before:bg-stone-800">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 font-bold ring-4 ring-amber-500/20'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : isDark
                          ? 'bg-stone-800 text-stone-500'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <IconComponent className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="ml-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-amber-500'
                            : isPassed
                            ? 'text-stone-900 dark:text-stone-100'
                            : 'text-stone-400 dark:text-stone-600'
                        }`}
                      >
                        {language === 'bn' ? step.labelBn : step.labelEn}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {language === 'bn' ? step.descBn : step.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details & Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-amber-500/15">
          {/* Items List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অর্ডারকৃত মিষ্টি ও খাবার' : 'Ordered Sweets & Snacks'}</span>
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-stone-800/80 text-xs"
                >
                  <div>
                    <span className="font-semibold block text-stone-900 dark:text-stone-100">
                      {language === 'bn' ? item.productNameBn || item.productName : item.productName}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {item.portion} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-4 pt-3 space-y-1.5 text-xs border-t border-stone-200 dark:border-stone-800 font-mono">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{language === 'bn' ? 'সাবটোটাল (Subtotal):' : 'Subtotal:'}</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{language === 'bn' ? 'ছাড় (Discount):' : 'Discount:'}</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ (Delivery):' : 'Delivery Charge:'}</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-300 dark:border-stone-700">
                <span className="font-sans">{language === 'bn' ? 'সর্বমোট (Total):' : 'Total Amount:'}</span>
                <span className="text-amber-500">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডেলিভারির ঠিকানা' : 'Delivery Details'}</span>
              </h3>
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 text-xs space-y-1">
                <p className="font-bold text-stone-900 dark:text-stone-100">{order.customerName}</p>
                <p className="text-stone-600 dark:text-stone-400">
                  {language === 'bn' ? 'মোবাইল: ' : 'Phone: '}
                  <span className="font-mono font-semibold">{order.phone}</span>
                </p>
                <p className="text-stone-600 dark:text-stone-400">{order.deliveryAddress}</p>
                {order.village && (
                  <p className="text-stone-500">
                    {language === 'bn' ? 'গ্রাম: ' : 'Village: '}
                    {order.village}
                  </p>
                )}
                {order.area && order.area !== order.village && (
                  <p className="text-stone-500">
                    {language === 'bn' ? 'এলাকা/পাড়া: ' : 'Area/Locality: '}
                    {order.area}
                  </p>
                )}
                {order.landmark && (
                  <p className="text-stone-500">
                    {language === 'bn' ? 'ল্যান্ডমার্ক: ' : 'Landmark: '}
                    {order.landmark}
                  </p>
                )}
                {order.pincode && (
                  <p className="text-stone-500 font-mono">
                    {language === 'bn' ? 'পিন কোড: ' : 'PIN: '}
                    {order.pincode}
                  </p>
                )}
                <div className="pt-1 mt-1 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">{language === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment:'}</span>
                  <span className="font-bold uppercase text-amber-500">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
              </div>
            </div>

            {order.customerNote && (
              <div>
                <h4 className="text-xs font-semibold text-stone-500 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{language === 'bn' ? 'গ্রাহকের নোট' : 'Customer Note'}</span>
                </h4>
                <p className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900/40 text-xs italic text-stone-600 dark:text-stone-400">
                  "{order.customerNote}"
                </p>
              </div>
            )}

            {/* Quick Contact Buttons */}
            <div className="pt-2 print:hidden">
              <span className="text-[11px] text-stone-500 block mb-2 font-medium">
                {language === 'bn'
                  ? 'কোনো সাহায্যের জন্য সরাসরি যোগাযোগ করুন:'
                  : 'For any immediate assistance regarding this order:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${shopDetails.phone || '9733363562'}`}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Shop'}</span>
                </a>
                <a
                  href={`https://wa.me/91${shopDetails.whatsapp || '9733363562'}?text=${encodeURIComponent(
                    `Hello Ghosh Sweet House, I have an inquiry about my order #${order.orderId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
