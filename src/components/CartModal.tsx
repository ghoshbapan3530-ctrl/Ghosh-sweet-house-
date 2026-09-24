import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Clock,
  Phone,
  Check,
  ArrowRight,
  Gift,
  ShieldCheck,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw,
  Printer,
  Sparkles
} from 'lucide-react';
import { NutritionTooltip } from './NutritionTooltip';
import { OrderTimestamp } from './OrderTimestamp';
import {
  createFirestoreOrder,
  generateOrderId,
  validateOrderPayload,
  mapAndValidateFirestoreOrder,
  DEFAULT_ORDER_STRUCTURE,
  subscribeToOwnerSettings,
  OwnerSettings,
  DEFAULT_OWNER_SETTINGS,
  FirebaseOrder
} from '../lib/firestore-orders';
import { syncOrderToServerSheets } from '../services/sheetsSyncService';

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
    addOrderToHistory,
    setTrackingOrderId
  } = useShop();

  const isDark = theme === 'dark';

  // Checkout Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Owner operational settings (live from Firestore)
  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings>(DEFAULT_OWNER_SETTINGS);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<FirebaseOrder | null>(null);

  // Subscribe to live owner delivery settings
  useEffect(() => {
    const unsub = subscribeToOwnerSettings((st) => {
      setOwnerSettings(st);
    });
    return () => unsub();
  }, []);

  // Autofill customer profile if logged in
  useEffect(() => {
    if (currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name || '');
      if (!customerPhone) setCustomerPhone(currentCustomer.mobile || '');
    }
  }, [currentCustomer]);

  if (!isCartOpen) return null;

  // 5% discount on spending above ₹100
  const isEligibleForDiscount = cartTotal >= 100;
  const discount5Percent = isEligibleForDiscount ? Number((cartTotal * 0.05).toFixed(2)) : 0;

  // Delivery charge calculation based on owner settings
  const isFreeDelivery =
    orderType === 'takeaway' ||
    cartTotal >= (ownerSettings.freeDeliveryAbove || 500);

  const deliveryCharge =
    orderType === 'takeaway'
      ? 0
      : isFreeDelivery
      ? 0
      : ownerSettings.deliveryCharge || 30;

  const finalTotal = Math.max(
    0,
    Number((cartTotal - discount5Percent + deliveryCharge).toFixed(2))
  );

  // Delivery validation
  const cleanPin = pincode.trim();
  const isPinRestricted =
    cleanPin.length === 6 &&
    ownerSettings.supportedPincodes &&
    ownerSettings.supportedPincodes.length > 0 &&
    !ownerSettings.supportedPincodes.includes(cleanPin);

  const isBelowMinOrder =
    orderType === 'delivery' &&
    ownerSettings.minimumOrder > 0 &&
    cartTotal < ownerSettings.minimumOrder;

  // Confirm and Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!customerName.trim()) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (orderType === 'delivery') {
      if (!ownerSettings.deliveryAvailable) {
        setErrorMessage(
          language === 'bn'
            ? 'বর্তমানে হোম ডেলিভারি সাময়িকভাবে বন্ধ আছে। আপনি টেকওয়ে হিসেবে নিতে পারেন অথবা দোকানে যোগাযোগ করুন।'
            : 'Home delivery is temporarily unavailable. Please select takeaway or contact the shop.'
        );
        return;
      }

      if (isBelowMinOrder) {
        setErrorMessage(
          language === 'bn'
            ? `ডেলিভারির জন্য সর্বনিম্ন অর্ডার মূল্য ₹${ownerSettings.minimumOrder}।`
            : `Minimum order for delivery is ₹${ownerSettings.minimumOrder}.`
        );
        return;
      }

      if (isPinRestricted) {
        setErrorMessage(
          language === 'bn'
            ? 'এই পিন কোডে বর্তমানে ডেলিভারি উপলব্ধ নেই। অনুগ্রহ করে ঘোষ সুইট হাউজে যোগাযোগ করুন (৯৭৩৩৩৬৩৫৬২)।'
            : 'Delivery is currently unavailable at this location. Please contact Ghosh Sweet House.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Generate Safe Unique Order ID
      const orderId = generateOrderId();

      // Determine address: if not provided by customer, set safe fallback
      const finalDeliveryAddress = deliveryAddress.trim()
        ? deliveryAddress.trim()
        : orderType === 'delivery'
        ? `Home Delivery (Contact: ${cleanPhone})`
        : 'Pickup from Ghosh Sweet House Store';

      // 2. Prepare raw payload for Firebase Cloud Firestore
      const rawOrderPayload = {
        orderId,
        customerId: currentCustomer ? currentCustomer.id : `guest_${cleanPhone}`,
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: currentCustomer?.email || '',
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.nameEn,
          productNameBn: item.product.nameBn,
          portion: item.selectedPortion,
          portionBn: item.selectedPortion,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        subtotal: cartTotal,
        deliveryCharge,
        discountAmount: discount5Percent,
        totalAmount: finalTotal,
        paymentMethod,
        paymentStatus: 'pending' as const,
        status: 'PENDING' as const,
        orderType,
        deliveryAddress: finalDeliveryAddress,
        village: village.trim(),
        area: (area.trim() || village.trim()),
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        customerNote: customerNote.trim()
      };

      // 2b. Map and validate all mandatory fields against DEFAULT_ORDER_STRUCTURE
      const { mappedOrder, valid, errors, undefinedFields, missingFields } =
        mapAndValidateFirestoreOrder(rawOrderPayload);

      console.log('[CartModal Checkout Debug] Mapped order validation:', {
        orderId: mappedOrder.orderId,
        valid,
        errors,
        undefinedFieldsCount: undefinedFields.length,
        undefinedFields,
        missingFields,
        village: mappedOrder.village,
        area: mappedOrder.area,
        pincode: mappedOrder.pincode
      });

      if (undefinedFields.length > 0) {
        console.warn(
          `[CartModal Checkout Debug] Found ${undefinedFields.length} undefined fields: [${undefinedFields.join(', ')}]. Cleaned up prior to Firestore save.`
        );
      }

      if (!valid) {
        console.error('[CartModal Checkout] Order Validation Failed:', errors);
        throw new Error(
          language === 'bn'
            ? `অর্ডার তথ্য অসম্পূর্ণ: ${errors[0]}`
            : `Order validation failed: ${errors[0]}`
        );
      }

      // 3. Write directly to Firestore with mapped payload
      const createdFirestoreOrder = await createFirestoreOrder(mappedOrder);

      // 4. Update local history and sync with Google Sheets
      const localHistoryOrder = addOrderToHistory({
        items: [...cart],
        subtotal: cartTotal,
        newCustomerDiscount: discount5Percent,
        pointsRedeemed: 0,
        discountAmount: discount5Percent,
        finalTotal,
        pointsEarned: Math.floor(finalTotal * 0.05),
        orderType,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        specialNote: customerNote.trim(),
        status: 'New Order'
      });

      // 5. Background sync to Google Sheets
      syncOrderToServerSheets(localHistoryOrder).catch((e) =>
        console.warn('Google Sheets sync notice:', e)
      );

      // 6. Set success view and clear cart
      setPlacedOrder(createdFirestoreOrder);
      clearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(
        err.message || (language === 'bn' ? 'অর্ডার জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to place order. Please retry.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTracker = () => {
    if (placedOrder) {
      setTrackingOrderId(placedOrder.orderId);
      setIsCartOpen(false);
      setPlacedOrder(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className={`w-full max-w-lg h-full overflow-y-auto flex flex-col justify-between shadow-2xl transition-all ${
          isDark
            ? 'bg-[#180E08] border-l border-amber-900/60 text-stone-100'
            : 'bg-white border-l border-stone-200 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-inherit">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base font-serif">
              {language === 'bn' ? 'আপনার ব্যাগ ও অর্ডার' : 'Your Bag & Order'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 flex-1 space-y-4">
          {placedOrder ? (
            /* ===============================================================
               SUCCESS SCREEN (Order Placed Successfully)
               =============================================================== */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold font-serif text-emerald-400">
                  Order placed successfully!
                </h4>
                <p className="text-sm font-bold font-bengali text-amber-400 mt-0.5">
                  আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 font-mono text-xs font-bold text-amber-500">
                  Order ID: #{placedOrder.orderId}
                </div>
              </div>

              {/* Order Summary Receipt Box */}
              <div
                className={`p-4 rounded-2xl border text-left text-xs space-y-2 font-sans ${
                  isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex justify-between items-center text-stone-500">
                  <span>Placed At:</span>
                  <OrderTimestamp timestamp={placedOrder.createdAt} mode="full" />
                </div>

                <div className="flex justify-between text-stone-500">
                  <span>Current Status:</span>
                  <span className="font-bold text-amber-500 uppercase tracking-wider">
                    {placedOrder.status} (Order Received)
                  </span>
                </div>

                <div className="flex justify-between text-stone-500">
                  <span>Payment Method:</span>
                  <span className="font-bold uppercase">
                    {placedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>

                <div className="flex justify-between text-stone-500">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-right max-w-[200px] truncate">
                    {placedOrder.deliveryAddress}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Ordered Sweets ({placedOrder.items.length}):
                  </span>
                  {placedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700 dark:text-stone-300">
                      <span>
                        {it.productName} ({it.portion}) × {it.quantity}
                      </span>
                      <span className="font-mono">₹{it.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between font-bold text-sm">
                  <span>Total Amount:</span>
                  <span className="text-amber-500 font-mono">₹{placedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOpenTracker}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {language === 'bn' ? 'সরাসরি অর্ডার ট্র্যাক করুন' : 'Track Order in Real-Time'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-amber-500"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'রসিদ প্রিন্ট করুন' : 'Print Invoice'}</span>
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* ===============================================================
               EMPTY CART
               =============================================================== */
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bengali text-sm text-stone-400 max-w-xs mx-auto">
                {t.cartEmpty}
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-6 py-2.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow"
              >
                {language === 'bn' ? 'মিষ্টি দেখুন' : 'Explore Sweets'}
              </button>
            </div>
          ) : (
            /* ===============================================================
               ACTIVE CART & CHECKOUT FORM
               =============================================================== */
            <>
              {/* Items List */}
              <div className="space-y-2.5">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedPortion}`}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-stone-900/60 border-amber-500/15'
                        : 'bg-white border-amber-800/15 shadow-sm'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm font-bengali truncate">
                        {language === 'bn' ? item.product.nameBn : item.product.nameEn}
                      </h4>
                      <span className="text-xs text-amber-500 font-semibold block">
                        {item.selectedPortion} • ₹{item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center border border-amber-500/30 rounded-xl overflow-hidden bg-stone-800/40">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedPortion, -1)}
                          className="p-1 hover:bg-stone-700/60 text-stone-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-amber-300">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedPortion, 1)}
                          className="p-1 hover:bg-stone-700/60 text-stone-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.selectedPortion)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery / Takeaway Switch */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    orderType === 'delivery'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'border-stone-700 text-stone-400'
                  }`}
                >
                  {language === 'bn' ? '🚚 হোম ডেলিভারি' : '🚚 Home Delivery'}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                      : 'border-stone-700 text-stone-400'
                  }`}
                >
                  {language === 'bn' ? '🏬 কাউন্টার পিকআপ' : '🏬 Counter Pickup'}
                </button>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Delivery Area Warning if applicable */}
              {orderType === 'delivery' && !ownerSettings.deliveryAvailable && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
                  {language === 'bn'
                    ? '⚠️ বর্তমানে হোম ডেলিভারি সাময়িকভাবে বন্ধ আছে। কাউন্টার পিকআপ বেছে নিতে পারেন।'
                    : '⚠️ Home delivery is temporarily unavailable. You may choose counter pickup.'}
                </div>
              )}

              {orderType === 'delivery' && isPinRestricted && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                  {language === 'bn'
                    ? 'ডেলিভারি বর্তমানে এই স্থানে উপলব্ধ নেই। অনুগ্রহ করে ঘোষ সুইট হাউজে যোগাযোগ করুন।'
                    : 'Delivery is currently unavailable at this location. Please contact Ghosh Sweet House.'}
                </div>
              )}

              {/* Customer Delivery Details Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="customerFullName" className="block text-[11px] font-semibold text-stone-400">
                        {language === 'bn' ? 'আপনার পুরো নাম *' : 'Full Name *'}
                      </label>
                      {customerName.trim().length >= 2 && (
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{language === 'bn' ? 'সঠিক' : 'Correct'}</span>
                        </span>
                      )}
                    </div>
                    <input
                      id="customerFullName"
                      name="fullName"
                      autoComplete="name"
                      type="text"
                      required
                      minLength={2}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Ghosh"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors ${
                        customerName.trim().length >= 2
                          ? isDark
                            ? 'bg-stone-900 border-emerald-500/50 text-stone-100'
                            : 'bg-stone-50 border-emerald-500/60 text-stone-900'
                          : isDark
                          ? 'bg-stone-900 border-stone-800'
                          : 'bg-stone-50 border-stone-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="10-digit number"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                        isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Optional Address & Notes Toggle */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                    className="text-[11px] text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>
                      {showMoreDetails
                        ? (language === 'bn' ? '▲ অতিরিক্ত ঠিকানা বন্ধ করুন' : '▲ Hide address details')
                        : (language === 'bn' ? '+ নির্দিষ্ট ঠিকানা বা নোট যোগ করতে চান? (ঐচ্ছিক)' : '+ Add specific address or landmark (Optional)')}
                    </span>
                  </button>
                </div>

                {showMoreDetails && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-stone-300 dark:border-stone-800">
                    {orderType === 'delivery' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                            {language === 'bn' ? 'ডেলিভারির ঠিকানা (ঐচ্ছিক)' : 'Delivery Address (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="House no., street, nearby spot..."
                            className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                              {language === 'bn' ? 'গ্রাম' : 'Village'}
                            </label>
                            <input
                              type="text"
                              value={village}
                              onChange={(e) => setVillage(e.target.value)}
                              placeholder="e.g. Duisatabighi"
                              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                              {language === 'bn' ? 'এলাকা / পাড়া' : 'Area / Locality'}
                            </label>
                            <input
                              type="text"
                              value={area}
                              onChange={(e) => setArea(e.target.value)}
                              placeholder="e.g. Ghosh Para / Station Rd"
                              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                              {language === 'bn' ? 'পিন কোড' : 'PIN Code'}
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="e.g. 732201"
                              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                              {language === 'bn' ? 'ল্যান্ডমার্ক (ঐচ্ছিক)' : 'Landmark (Optional)'}
                            </label>
                            <input
                              type="text"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              placeholder="Near school, temple..."
                              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                              }`}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Optional Note */}
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                        {language === 'bn' ? 'বিশেষ নির্দেশ (ঐচ্ছিক)' : 'Order Note (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="e.g. Extra sugar syrup, pack for gifting..."
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-300'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Payment Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                          : 'border-stone-700 text-stone-400'
                      }`}
                    >
                      <span className="block font-bold">💵 Cash on Delivery</span>
                      <span className="text-[10px] text-stone-500">Pay when delivered</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'online'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                          : 'border-stone-700 text-stone-400'
                      }`}
                    >
                      <span className="block font-bold">📱 Online Payment</span>
                      <span className="text-[10px] text-stone-500">UPI / QR Code</span>
                    </button>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {discount5Percent > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>5% Discount:</span>
                      <span>-₹{discount5Percent}</span>
                    </div>
                  )}
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-stone-500">
                      <span>Delivery Charge:</span>
                      <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-900 dark:text-stone-100 font-bold text-sm pt-1 border-t border-stone-300 dark:border-stone-700">
                    <span className="font-sans">Total Amount:</span>
                    <span className="text-amber-500">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || (orderType === 'delivery' && isPinRestricted)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'bn' ? 'অর্ডার তৈরি হচ্ছে...' : 'Processing Order...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অর্ডার নিশ্চিত করুন (Confirm Order)' : 'Confirm Order'}</span>
                      <span className="font-mono">₹{finalTotal}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
