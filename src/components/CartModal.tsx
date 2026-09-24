import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  FileSpreadsheet,
  RefreshCw,
  Phone,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  RotateCcw,
  Gift,
  Coins,
  ShieldCheck,
  User
} from 'lucide-react';
import { NutritionTooltip } from './NutritionTooltip';

export const CartModal: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    language,
    theme,
    shopDetails,
    t,
    currentCustomer,
    openSignUpModal,
    openLoginModal,
    sweetPoints,
    pointsToRupees,
    calculateEarnablePoints,
    isNewCustomerEligibleForDiscount,
    calculateNewCustomerDiscount,
    addOrderToHistory,
    setIsOrdersOpen,
    setIsDashboardOpen
  } = useShop();

  const isDark = theme === 'dark';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [specialNote, setSpecialNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');

  // Loyalty points redemption state
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const [pointsInput, setPointsInput] = useState<number>(0);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Auto-fill customer details if logged in
  useEffect(() => {
    if (currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name);
      if (!customerPhone) setCustomerPhone(currentCustomer.mobile);
    }
  }, [currentCustomer]);

  if (!isCartOpen) return null;

  // New Customer 5% Discount
  // 5% OFF on the first 5 qualifying orders (Minimum order value: ₹100)
  const isEligibleForNewCustomerDiscount = isNewCustomerEligibleForDiscount(cartTotal);
  const newCustomerDiscount = isEligibleForNewCustomerDiscount ? calculateNewCustomerDiscount(cartTotal) : 0;
  const remainingBeforePoints = Math.max(0, cartTotal - newCustomerDiscount);

  // Sweet Points calculation: 1 Sweet Point = ₹0.50
  // Max redeemable cannot exceed user points or remaining total
  const maxPointsCoveringTotal = Math.floor(remainingBeforePoints / 0.5);
  const maxRedeemablePoints = Math.min(sweetPoints, maxPointsCoveringTotal);

  const effectivePointsRedeemed = isRedeemingPoints
    ? Math.min(pointsInput || maxRedeemablePoints, maxRedeemablePoints)
    : 0;

  const pointsDiscountAmount = Number((effectivePointsRedeemed * 0.5).toFixed(2));
  const totalDiscount = Number((newCustomerDiscount + pointsDiscountAmount).toFixed(2));
  const finalTotal = Math.max(0, Number((cartTotal - totalDiscount).toFixed(2)));

  // For every ₹100 actually spent, customer earns 5 Sweet Points
  const pointsToEarn = calculateEarnablePoints(finalTotal);

  const handleToggleRedeem = () => {
    if (!isRedeemingPoints) {
      setIsRedeemingPoints(true);
      setPointsInput(maxRedeemablePoints);
    } else {
      setIsRedeemingPoints(false);
      setPointsInput(0);
    }
  };

  const handleDirectOrderCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmittingOrder(true);

    try {
      // Record order in history & update customer stats
      // Automatically synchronizes to Google Sheets via server API
      const createdOrder = addOrderToHistory({
        items: [...cart],
        subtotal: cartTotal,
        newCustomerDiscount,
        pointsRedeemed: effectivePointsRedeemed,
        pointsDiscountAmount,
        discountAmount: totalDiscount,
        finalTotal,
        pointsEarned: pointsToEarn,
        orderType,
        customerName: customerName.trim() || (currentCustomer ? currentCustomer.name : undefined),
        customerPhone: customerPhone.trim() || (currentCustomer ? currentCustomer.mobile : undefined),
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: paymentMethod === 'cod'
          ? (language === 'bn' ? 'নগদ / কাউন্টারে প্রদেয়' : 'Cash on Delivery')
          : (language === 'bn' ? 'ইউপিআই / অনলাইন কিউআর' : 'UPI / Online QR'),
        specialNote: specialNote.trim(),
        status: 'New Order'
      });

      setOrderSuccessId(createdOrder.id);
      clearCart();
    } catch (err) {
      console.error('Failed to submit order directly:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePhoneCheckout = () => {
    if (cart.length === 0) return;

    const createdOrder = addOrderToHistory({
      items: [...cart],
      subtotal: cartTotal,
      newCustomerDiscount,
      pointsRedeemed: effectivePointsRedeemed,
      pointsDiscountAmount,
      discountAmount: totalDiscount,
      finalTotal,
      pointsEarned: pointsToEarn,
      orderType,
      customerName: customerName.trim() || (currentCustomer ? currentCustomer.name : undefined),
      customerPhone: customerPhone.trim() || (currentCustomer ? currentCustomer.mobile : undefined),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: paymentMethod === 'cod'
        ? (language === 'bn' ? 'নগদ / কাউন্টারে প্রদেয়' : 'Cash on Delivery')
        : (language === 'bn' ? 'ইউপিআই / অনলাইন কিউআর' : 'UPI / Online QR'),
      specialNote: specialNote.trim(),
      status: 'New Order'
    });

    setOrderSuccessId(createdOrder.id);
    clearCart();
    window.location.href = `tel:${shopDetails.phone}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-modal">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md flex flex-col shadow-2xl border-l ${
            isDark
              ? 'bg-[#180E08] border-amber-500/30 text-stone-200'
              : 'bg-[#FCF9F2] border-amber-800/20 text-stone-900'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold font-bengali">{t.cartTitle}</h3>
              {cart.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">
                  {cart.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Dashboard / Past orders trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsDashboardOpen(true);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex items-center gap-1"
                title={language === 'bn' ? 'মিষ্টি ড্যাশবোর্ড' : 'Points Dashboard'}
                id="cart-dashboard-btn"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bengali">
                  {language === 'bn' ? 'পয়েন্টস' : 'Points'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200 transition-colors"
                id="cart-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {orderSuccessId ? (
              /* ORDER CONFIRMATION VIEW */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold font-bengali text-amber-400">
                    {language === 'bn' ? 'অর্ডার সফলভাবে জমা হয়েছে!' : 'Order Placed Successfully!'}
                  </h4>
                  <p className="text-xs text-stone-400 font-mono mt-1">
                    Order ID: #{orderSuccessId}
                  </p>

                  {/* Direct Google Sheets Confirmation */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-left space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <FileSpreadsheet className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>{language === 'bn' ? 'সরাসরি Google Sheets-এ নথিবদ্ধ' : 'Directly Sent to Google Sheets'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-100/80 leading-relaxed font-bengali">
                      {language === 'bn'
                        ? 'আপনার মিষ্টির অর্ডারটি কোনো WhatsApp মেসেজের অপেক্ষা ছাড়াই সরাসরি দোকানের Google Sheets ও রসুইঘরে সংরক্ষিত হয়েছে।'
                        : 'Your order was sent directly to our official Google Sheets and kitchen queue without needing any WhatsApp message.'}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Sheet: Orders • Status: Live Synchronized</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 font-bengali mt-3 max-w-xs mx-auto">
                    {language === 'bn'
                      ? 'রসুইঘরে খাঁটি উপাদানে আপনার মিষ্টি প্রস্তুত হচ্ছে (Preparing)। লাইভ স্ট্যাটাস দেখতে নিচের বাটনে ক্লিক করুন।'
                      : 'Your sweet treats are now being freshly prepared in our kitchen. You can track real-time status now.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsOrdersOpen(true);
                      setOrderSuccessId(null);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{language === 'bn' ? 'অর্ডার স্ট্যাটাস ট্র্যাক করুন' : 'Track Order Status'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderSuccessId(null)}
                    className="w-full py-2.5 rounded-xl border border-stone-700 text-xs text-stone-300 hover:text-white transition-colors"
                  >
                    {language === 'bn' ? 'নতুন মিষ্টি যোগ করুন' : 'Continue Shopping'}
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bengali text-sm text-stone-400 max-w-xs mx-auto">
                  {t.cartEmpty}
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow"
                  >
                    {language === 'bn' ? 'মিষ্টি দেখুন' : 'Explore Sweets'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsOrdersOpen(true);
                    }}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bengali mt-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পূর্বের অর্ডার থেকে রিঅর্ডার করুন' : 'Reorder from Past Orders'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Account / Loyalty Notification Banner */}
                {!currentCustomer ? (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
                      <div>
                        <span className="text-xs font-bold block font-bengali">
                          {language === 'bn' ? '১০ মিষ্টি পয়েন্ট ও ৫% ছাড় চান?' : 'Want 10 Sweet Points & 5% OFF?'}
                        </span>
                        <span className="text-[11px] opacity-75 block">
                          {language === 'bn' ? 'সাইন আপ করলেই সরাসরি ক্যাশ ছাড়!' : 'Sign up now to unlock discounts!'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openSignUpModal()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 flex-shrink-0 shadow-sm transition-all"
                      id="cart-signup-prompt-btn"
                    >
                      {language === 'bn' ? 'সাইন আপ' : 'Sign Up'}
                    </button>
                  </div>
                ) : (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold block font-bengali">
                          {currentCustomer.name} (
                          {language === 'bn' ? 'লয়্যালটি গ্রাহক' : 'Loyalty Member'})
                        </span>
                        <span className="text-[11px] opacity-80 block">
                          {language === 'bn'
                            ? `উপলব্ধ: ${sweetPoints} পয়েন্ট = ₹${pointsToRupees(sweetPoints).toFixed(2)}`
                            : `Available: ${sweetPoints} pts = ₹${pointsToRupees(sweetPoints).toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDashboardOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold border border-amber-500/30 font-bengali"
                    >
                      {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                    </button>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedPortion}`}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-stone-900/60 border-amber-500/15' : 'bg-white border-amber-800/15 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 text-sm">
                          🍬
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm font-bengali truncate">
                            {language === 'bn' ? item.product.nameBn : item.product.nameEn}
                          </h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-amber-500 font-semibold block">
                              {item.selectedPortion} • ₹{item.price}
                            </span>
                            {item.product.nutrition && (
                              <NutritionTooltip
                                nutrition={item.product.nutrition}
                                language={language}
                                theme={theme}
                                itemName={language === 'bn' ? item.product.nameBn : item.product.nameEn}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controller & Remove */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center border border-amber-500/30 rounded-xl overflow-hidden bg-stone-800/40">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.selectedPortion, -1)}
                            className="p-1.5 hover:bg-stone-700/60 text-stone-300"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-amber-300">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.selectedPortion, 1)}
                            className="p-1.5 hover:bg-stone-700/60 text-stone-300"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.selectedPortion)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New Customer 5% Discount Banner */}
                {isEligibleForNewCustomerDiscount ? (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">
                          {language === 'bn' ? '🎉 নতুন গ্রাহকের ৫% ছাড় প্রয়োগ হয়েছে!' : '🎉 New Customer 5% Discount Applied!'}
                        </span>
                        <span className="text-[11px] opacity-80 block">
                          {language === 'bn'
                            ? `প্রথম ৫টি অর্ডারের ${((currentCustomer?.qualifyingOrdersCount || 0) + 1)} নম্বর অর্ডার (-₹${newCustomerDiscount.toFixed(2)})`
                            : `Order ${(currentCustomer?.qualifyingOrdersCount || 0) + 1} of 5 qualifying orders (-₹${newCustomerDiscount.toFixed(2)})`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-500 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg">
                      -5%
                    </span>
                  </div>
                ) : currentCustomer && currentCustomer.qualifyingOrdersCount < 5 && cartTotal < 100 ? (
                  <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {language === 'bn'
                        ? `আর মাত্র ₹${(100 - cartTotal)} টাকার মিষ্টি যোগ করলেই পাবেন ৫% ছাড়!`
                        : `Add sweets worth ₹${100 - cartTotal} more to unlock 5% new customer discount!`}
                    </span>
                  </div>
                ) : null}

                {/* Redeem Sweet Points for Cash Discount Box */}
                {sweetPoints > 0 && maxRedeemablePoints > 0 ? (
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isRedeemingPoints
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : isDark
                        ? 'bg-stone-900/40 border-stone-800'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold font-bengali block">
                            {language === 'bn' ? 'মিষ্টি পয়েন্টস রিডিম করুন' : 'Redeem Sweet Points'}
                          </span>
                          <span className="text-[11px] text-stone-400 block">
                            {language === 'bn'
                              ? `১ পয়েন্ট = ₹০.৫০ (সর্বোচ্চ ₹${pointsToRupees(maxRedeemablePoints).toFixed(2)} ছাড়)`
                              : `1 Point = ₹0.50 (Max ₹${pointsToRupees(maxRedeemablePoints).toFixed(2)} off)`}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleRedeem}
                        id="cart-apply-points-btn"
                        className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                          isRedeemingPoints
                            ? 'bg-emerald-500 text-stone-950 shadow'
                            : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                        }`}
                      >
                        {isRedeemingPoints
                          ? (language === 'bn' ? 'প্রযুক্ত ✓' : 'Applied ✓')
                          : (language === 'bn' ? 'ব্যবহার করুন' : 'Apply')}
                      </button>
                    </div>

                    {isRedeemingPoints && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-300 font-bengali">
                            {language === 'bn' ? 'রিডিম করার পরিমাণ:' : 'Points to Redeem:'}
                          </span>
                          <span className="font-bold text-amber-400 font-mono">
                            {effectivePointsRedeemed} pts (= ₹{pointsDiscountAmount.toFixed(2)} ছাড়)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max={maxRedeemablePoints}
                          value={effectivePointsRedeemed}
                          onChange={(e) => setPointsInput(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-stone-500">
                          <span>1 pt (₹0.50)</span>
                          <span>{maxRedeemablePoints} pts (₹{pointsToRupees(maxRedeemablePoints).toFixed(2)})</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Customer Details Form for Quick Order */}
                <div
                  className={`p-4 rounded-2xl border space-y-3 mt-4 ${
                    isDark ? 'bg-stone-900/40 border-amber-500/20' : 'bg-amber-50/70 border-amber-800/15'
                  }`}
                >
                  <div className="text-xs font-bold font-bengali text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === 'bn' ? 'অর্ডারের বিবরণ' : 'Order Information'}</span>
                    {currentCustomer && (
                      <span className="text-[11px] text-emerald-400 lowercase font-normal flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {language === 'bn' ? 'অ্যাকাউন্ট সংযুক্ত' : 'Account linked'}
                      </span>
                    )}
                  </div>

                  {/* Delivery vs Takeaway */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`py-1.5 rounded-xl font-bold border transition-all ${
                        orderType === 'delivery'
                          ? 'bg-amber-500 text-stone-950 border-amber-500'
                          : 'border-stone-700 text-stone-400'
                      }`}
                    >
                      {language === 'bn' ? 'ডেলিভারি' : 'Delivery'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`py-1.5 rounded-xl font-bold border transition-all ${
                        orderType === 'takeaway'
                          ? 'bg-amber-500 text-stone-950 border-amber-500'
                          : 'border-stone-700 text-stone-400'
                      }`}
                    >
                      {language === 'bn' ? 'টেকওয়ে (দোকান)' : 'Takeaway'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-300 mb-1 font-bengali">
                      {t.yourName}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার পুরো নাম' : 'Your name'}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                        isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-300 mb-1 font-bengali">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="9733363562"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono ${
                        isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>

                  {orderType === 'delivery' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1 font-bengali">
                        {t.deliveryAddress}
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder={language === 'bn' ? 'গ্রাম/এলাকা, দুইসাটাবিঘি, কালিয়াচক' : 'Area/Village, Kaliachak, Malda'}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                          isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-300 mb-1 font-bengali">
                      {language === 'bn' ? 'মূল্য পরিশোধ পদ্ধতি (Payment Method)' : 'Payment Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2 rounded-xl text-left border text-xs transition-all flex flex-col gap-0.5 ${
                          paymentMethod === 'cod'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500'
                            : isDark
                            ? 'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/40'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-500/40'
                        }`}
                      >
                        <span className="font-bengali text-xs">
                          {language === 'bn' ? '💵 নগদ / কাউন্টারে' : '💵 Cash / Counter'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          {language === 'bn' ? 'ডেলিভারি বা তোলার সময়' : 'Pay at delivery/pickup'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2 rounded-xl text-left border text-xs transition-all flex flex-col gap-0.5 ${
                          paymentMethod === 'upi'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500'
                            : isDark
                            ? 'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/40'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-500/40'
                        }`}
                      >
                        <span className="font-bengali text-xs">
                          {language === 'bn' ? '📱 ইউপিআই / কিউআর' : '📱 UPI / QR Online'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-normal">
                          {language === 'bn' ? 'GPay, PhonePe, Paytm' : 'Online instant QR'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer with Complete Transparent Breakdown */}
          {cart.length > 0 && !orderSuccessId && (
            <div className="p-4 sm:p-5 border-t border-amber-500/20 space-y-3 flex-shrink-0">
              {/* Cost Summary Breakdown matching all user requirements */}
              <div className="space-y-1.5 text-xs">
                {/* 1. Subtotal */}
                <div className="flex items-center justify-between text-stone-400">
                  <span className="font-bengali">{t.subtotal}:</span>
                  <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
                </div>

                {/* 2. New Customer Discount */}
                {newCustomerDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span className="font-bengali flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      {language === 'bn' ? 'নতুন গ্রাহকের ৫% ছাড়:' : 'New Customer 5% Discount:'}
                    </span>
                    <span className="font-mono font-bold">-₹{newCustomerDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* 3. Sweet Points Used */}
                {effectivePointsRedeemed > 0 && (
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <span className="font-bengali flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {language === 'bn'
                        ? `ব্যবহৃত মিষ্টি পয়েন্টস (${effectivePointsRedeemed} pts):`
                        : `Sweet Points Used (${effectivePointsRedeemed} pts):`}
                    </span>
                    <span className="font-mono font-bold">-₹{pointsDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* 4. Final Amount */}
                <div className="flex items-center justify-between pt-1.5 border-t border-amber-500/15">
                  <span className="text-sm font-bold font-bengali">
                    {language === 'bn' ? 'চূড়ান্ত প্রদেয় মূল্য:' : 'Final Amount:'}
                  </span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Points to be earned notice */}
                {pointsToEarn > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>
                      {language === 'bn'
                        ? `এই অর্ডারে পাবেন +${pointsToEarn} মিষ্টি পয়েন্ট (মূল্য: ₹${(pointsToEarn * 0.5).toFixed(2)})!`
                        : `You will earn +${pointsToEarn} Sweet Points (₹${(pointsToEarn * 0.5).toFixed(2)} value)!`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {/* Direct Google Sheets Checkout */}
                <button
                  type="button"
                  onClick={handleDirectOrderCheckout}
                  disabled={isSubmittingOrder}
                  id="cart-checkout-direct"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSubmittingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                      <span>{language === 'bn' ? 'Google Sheets-এ অর্ডার পাঠানো হচ্ছে...' : 'Sending to Google Sheets...'}</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4 text-stone-950" />
                      <span>{t.checkoutWhatsApp}</span>
                    </>
                  )}
                </button>

                {/* Call to Place Order */}
                <button
                  type="button"
                  onClick={handlePhoneCheckout}
                  id="cart-checkout-call"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.checkoutCall} ({shopDetails.phone})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
