import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, Phone, Sparkles } from 'lucide-react';

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
    t
  } = useShop();

  const isDark = theme === 'dark';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [specialNote, setSpecialNote] = useState('');

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let itemsText = '';
    cart.forEach((item, idx) => {
      const name = language === 'bn' ? item.product.nameBn : item.product.nameEn;
      itemsText += `${idx + 1}. *${name}* (${item.selectedPortion}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    const msg = `*🛒 ঘোষ মিষ্টান্ন ভাণ্ডার — নতুন অর্ডার*\n` +
      `---------------------------------\n` +
      `👤 *গ্রাহকের নাম:* ${customerName || 'সম্মানীয় গ্রাহক'}\n` +
      `📞 *ফোন:* ${customerPhone || 'প্রযোজ্য নয়'}\n` +
      `📦 *অর্ডারের ধরন:* ${orderType === 'delivery' ? 'হোম ডেলিভারি' : 'দোকান থেকে সংগ্রহ (টেকওয়ে)'}\n` +
      (orderType === 'delivery' ? `📍 *ডেলিভারি ঠিকানা:* ${deliveryAddress || 'দুইসাটাবিঘি / কালিয়াচক'}\n` : '') +
      (specialNote ? `📝 *বিশেষ নির্দেশনা:* ${specialNote}\n` : '') +
      `---------------------------------\n` +
      `*অর্ডারকৃত আইটেমসমূহ:*\n${itemsText}` +
      `---------------------------------\n` +
      `*মোট প্রদেয় মূল্য: ₹${cartTotal}*\n\n` +
      `দয়া করে অর্ডারটি নিশ্চিত করুন ও আনুমানিক সময় জানান। ধন্যবাদ!`;

    const url = `https://wa.me/${shopDetails.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md flex flex-col shadow-2xl border-l ${
            isDark
              ? 'bg-[#180E08] border-amber-500/30 text-stone-200'
              : 'bg-[#FCF9F2] border-amber-800/20 text-stone-900'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold font-bengali">
                {t.cartTitle}
              </h3>
              {cart.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">
                  {cart.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
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
              <>
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
                          <span className="text-xs text-amber-500 font-semibold block">
                            {item.selectedPortion} • ₹{item.price}
                          </span>
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

                {/* Customer Details Form for Quick Order */}
                <div className={`p-4 rounded-2xl border space-y-3 mt-4 ${
                  isDark ? 'bg-stone-900/40 border-amber-500/20' : 'bg-amber-50/70 border-amber-800/15'
                }`}>
                  <div className="text-xs font-bold font-bengali text-amber-400 uppercase tracking-wider">
                    {language === 'bn' ? 'অর্ডারের বিবরণ' : 'Order Information'}
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
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 ${
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
                      {t.notes}
                    </label>
                    <input
                      type="text"
                      value={specialNote}
                      onChange={(e) => setSpecialNote(e.target.value)}
                      placeholder={language === 'bn' ? 'উদা: কম মিষ্টি বা স্পেশাল বক্স' : 'e.g. Pack separately in gift box'}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                        isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-bengali">
                  {t.subtotal}:
                </span>
                <span className="text-2xl font-black text-amber-400">
                  ₹{cartTotal}
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {/* WhatsApp Checkout */}
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  id="cart-checkout-whatsapp"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.checkoutWhatsApp}</span>
                </button>

                {/* Call to Place Order */}
                <a
                  href={`tel:${shopDetails.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.checkoutCall} ({shopDetails.phone})</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
