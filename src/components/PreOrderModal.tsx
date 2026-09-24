import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Gift,
  Truck,
  Store,
  CheckCircle2,
  Phone,
  MessageCircle,
  ShoppingBag,
  Heart,
  Tag
} from 'lucide-react';
import { Language, ThemeMode, ProductItem } from '../types';
import { useShop } from '../context/ShopContext';

export interface FestivalSweetBox {
  id: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  weightBn: string;
  weightEn: string;
  originalPrice: number;
  preOrderPrice: number;
  discountPercent: number;
  festivalType: string;
  isPopular?: boolean;
  idealForBn: string;
  idealForEn: string;
  itemsBn: string[];
  itemsEn: string[];
  descriptionBn: string;
  descriptionEn: string;
  badgeBn: string;
  badgeEn: string;
}

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: FestivalSweetBox | null;
  festivalNameBn: string;
  festivalNameEn: string;
}

export const PreOrderModal: React.FC<PreOrderModalProps> = ({
  isOpen,
  onClose,
  box,
  festivalNameBn,
  festivalNameEn
}) => {
  const { language, theme, addToCart, currentCustomer, shopDetails } = useShop();
  const isDark = theme === 'dark';

  // Puja Day selection
  const pujaSlots = [
    { id: 'sasthi', labelBn: 'মহাষষ্ঠী (Maha Sasthi)', labelEn: 'Maha Sasthi' },
    { id: 'saptami', labelBn: 'মহাসপ্তমী (Maha Saptami)', labelEn: 'Maha Saptami' },
    { id: 'ashtami', labelBn: 'মহাষ্টমী ভোগ (Maha Ashtami Bhog - Morning)', labelEn: 'Maha Ashtami (Morning Pushpanjali)' },
    { id: 'nabami', labelBn: 'মহানবমী (Maha Nabami)', labelEn: 'Maha Nabami' },
    { id: 'dashami', labelBn: 'বিজয়া দশমী (Bijoya Dashami)', labelEn: 'Bijoya Dashami (Sweets Exchange)' }
  ];

  const [selectedSlot, setSelectedSlot] = useState(pujaSlots[2].id);
  const [fulfillmentType, setFulfillmentType] = useState<'counter_pickup' | 'home_delivery'>('counter_pickup');
  const [quantity, setQuantity] = useState(1);
  const [senderName, setSenderName] = useState(currentCustomer?.name || '');
  const [contactMobile, setContactMobile] = useState(currentCustomer?.mobile || '');
  const [customGreeting, setCustomGreeting] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [confirmedAdded, setConfirmedAdded] = useState(false);

  if (!isOpen || !box) return null;

  const currentSlotObj = pujaSlots.find(s => s.id === selectedSlot) || pujaSlots[0];
  const totalPrice = box.preOrderPrice * quantity;
  const totalSavings = (box.originalPrice - box.preOrderPrice) * quantity;

  const handleAddToCartPreOrder = () => {
    // Construct ProductItem representation for the cart
    const portionLabel = `${language === 'bn' ? currentSlotObj.labelBn : currentSlotObj.labelEn} • ${fulfillmentType === 'counter_pickup' ? (language === 'bn' ? 'কাউন্টার পিকআপ' : 'Counter Pickup') : (language === 'bn' ? 'হোম ডেলিভারি' : 'Home Delivery')}`;

    const festivalProduct: ProductItem = {
      id: `preorder-${box.id}-${selectedSlot}`,
      nameBn: `[অগ্রিম বুকিং] ${box.nameBn}`,
      nameEn: `[Pre-Order] ${box.nameEn}`,
      category: 'special',
      portionBn: box.weightBn,
      portionEn: box.weightEn,
      price: box.preOrderPrice,
      secondaryPrice: {
        portionBn: 'নিয়মিত মূল্য',
        portionEn: 'Regular Price',
        price: box.originalPrice
      },
      badgeBn: `পূজো প্রি-অর্ডার • ${box.discountPercent}% ছাড়`,
      badgeEn: `Puja Pre-Order • ${box.discountPercent}% OFF`,
      isBestSeller: true,
      isFeatured: true,
      descriptionBn: `${box.descriptionBn} (ডেলিভারি/পিকআপ দিন: ${currentSlotObj.labelBn}${customGreeting ? ` | গ্রিটিংস নোট: "${customGreeting}"` : ''})`,
      descriptionEn: `${box.descriptionEn} (Slot: ${currentSlotObj.labelEn}${customGreeting ? ` | Greeting: "${customGreeting}"` : ''})`,
      image: ''
    };

    // Add designated quantity to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(festivalProduct, portionLabel, box.preOrderPrice);
    }

    setConfirmedAdded(true);
    setTimeout(() => {
      setConfirmedAdded(false);
      onClose();
    }, 900);
  };

  const handleWhatsAppBooking = () => {
    const slotText = language === 'bn' ? currentSlotObj.labelBn : currentSlotObj.labelEn;
    const fulfillmentText = fulfillmentType === 'counter_pickup' 
      ? 'Express Counter Pickup (দোকান থেকে সংগ্ৰহ)'
      : `Home Delivery (${deliveryArea || 'Kaliachak/Malda'})`;

    const message = `🙏 *GHOSH SWEET HOUSE — ${box.festivalType.toUpperCase()} PRE-ORDER*\n\n` +
      `📦 *Box:* ${box.nameEn} (${box.nameBn})\n` +
      `⚖️ *Weight:* ${box.weightEn}\n` +
      `🔢 *Quantity:* ${quantity} box(es)\n` +
      `💰 *Pre-Order Price:* ₹${totalPrice} (Saved ₹${totalSavings})\n` +
      `🗓️ *Preferred Puja Slot:* ${slotText}\n` +
      `🚚 *Fulfillment:* ${fulfillmentText}\n` +
      (senderName ? `👤 *Customer Name:* ${senderName}\n` : '') +
      (contactMobile ? `📞 *Phone:* ${contactMobile}\n` : '') +
      (customGreeting ? `💌 *Bijoya Greeting Note:* "${customGreeting}"\n` : '') +
      `\nদয়া করে আমার দুর্গোৎসবের স্পেশাল মিষ্টির এই প্রি-অর্ডারটি কনফার্ম করুন। ধন্যবাদ!`;

    const url = `https://wa.me/91${shopDetails.whatsapp || '9733363562'}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border transition-all ${
          isDark
            ? 'bg-[#190F0A] border-amber-500/30 text-stone-100'
            : 'bg-white border-amber-700/20 text-stone-900'
        }`}
      >
        {/* Header with Festival Festive Garland Banner */}
        <div className="relative bg-gradient-to-r from-amber-700 via-red-800 to-amber-900 p-5 sm:p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🪔</span>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300 font-serif">
              {language === 'bn' ? festivalNameBn : festivalNameEn} • LIMITED EDITION
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-bengali tracking-tight">
            {language === 'bn' ? box.nameBn : box.nameEn}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 font-bengali">
            {language === 'bn' ? box.taglineBn : box.taglineEn}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black font-mono shadow">
              {box.discountPercent}% OFF PRE-ORDER
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/40 text-amber-200 font-mono">
              Net: {language === 'bn' ? box.weightBn : box.weightEn}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-black/40 text-emerald-300">
              ✓ {language === 'bn' ? box.idealForBn : box.idealForEn}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Sweets Assortment Included */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border ${
              isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-amber-50/60 border-amber-200/70'
            }`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold font-bengali text-amber-600 dark:text-amber-400">
                {language === 'bn' ? 'মিষ্টির বাক্সে যা যা থাকছে:' : 'Curated Sweets in this Festive Box:'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(language === 'bn' ? box.itemsBn : box.itemsEn).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Options */}
          <div className="space-y-4 text-xs">
            {/* 1. Select Puja Festival Day Slot */}
            <div>
              <label className="block font-bold text-stone-800 dark:text-stone-200 mb-2 font-bengali flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>
                  {language === 'bn'
                    ? '১. কোন দিন গ্রহণ করতে চান? (পূজো স্লট বেছে নিন)'
                    : '1. Choose Festival Day Slot:'}
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pujaSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-2.5 rounded-xl border text-left font-bengali transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300 shadow-sm'
                          : isDark
                          ? 'border-stone-800 bg-stone-900/40 text-stone-300 hover:border-stone-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span className="truncate">{language === 'bn' ? slot.labelBn : slot.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Choose Delivery or Store Express Pickup */}
            <div>
              <label className="block font-bold text-stone-800 dark:text-stone-200 mb-2 font-bengali flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>
                  {language === 'bn' ? '২. গ্রহণের মাধ্যম:' : '2. Fulfillment Method:'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('counter_pickup')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    fulfillmentType === 'counter_pickup'
                      ? 'border-amber-500 bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300'
                      : isDark
                      ? 'border-stone-800 bg-stone-900/40 text-stone-400'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <Store className="w-5 h-5 text-amber-500" />
                  <span className="font-bengali font-bold">
                    {language === 'bn' ? 'এক্সপ্রেস কাউন্টার পিকআপ' : 'Counter Express Pickup'}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'দোকানে লাইন ছাড়াই সরাসরি গ্রহণ' : 'Zero queue at Kaliachak shop'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('home_delivery')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                    fulfillmentType === 'home_delivery'
                      ? 'border-amber-500 bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300'
                      : isDark
                      ? 'border-stone-800 bg-stone-900/40 text-stone-400'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <Truck className="w-5 h-5 text-amber-500" />
                  <span className="font-bengali font-bold">
                    {language === 'bn' ? 'হোম ডেলিভারি' : 'Home Delivery'}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'কালিয়াচক ও পার্শ্ববর্তী এলাকা' : 'Kaliachak & nearby areas'}
                  </span>
                </button>
              </div>

              {fulfillmentType === 'home_delivery' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    placeholder={language === 'bn' ? 'ডেলিভারি ঠিকানা / এলাকা লিখুন...' : 'Enter delivery address / landmark...'}
                    className={`w-full p-2.5 rounded-xl border text-xs ${
                      isDark
                        ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600'
                        : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* 3. Quantity & Custom Card Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1 font-bengali">
                  {language === 'bn' ? '৩. বাক্সের সংখ্যা (Quantity):' : '3. Box Quantity:'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-amber-500 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-mono font-bold text-sm bg-white dark:bg-stone-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-amber-500 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-stone-500 text-[11px] font-bengali">
                    {language === 'bn' ? `মোট মিষ্টি: ≈ ${box.weightBn} × ${quantity}` : `Net: ${box.weightEn} × ${quantity}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1 font-bengali">
                  {language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর:' : 'Contact Phone Number:'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="tel"
                    value={contactMobile}
                    onChange={(e) => setContactMobile(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ৯৮৭৬৫ ৪৩২১০' : 'e.g. 98765 43210'}
                    className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono ${
                      isDark
                        ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600'
                        : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Custom Greetings Card Message */}
            <div>
              <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1 font-bengali flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'bn'
                    ? 'বিজয়া গ্রিটিংস কার্ড মেসেজ (উপহারের জন্য ঐচ্ছিক):'
                    : 'Personalized Bijoya Greeting Card (Optional):'}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                  {language === 'bn' ? 'ফ্রি স্পেশাল প্রিন্ট' : 'Free Customized Print'}
                </span>
              </label>
              <input
                type="text"
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: শুভ শারদীয়ার আন্তরিক প্রীতি ও শুভেচ্ছা — ঘোষ পরিবারের পক্ষ থেকে'
                    : 'e.g., Wishing you joyful Durga Puja & Shubho Bijoya from Ghosh Family'
                }
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600'
                    : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Pricing & Savings Summary Bar */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark ? 'bg-amber-950/20 border-amber-500/20' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bengali">
                {language === 'bn' ? 'প্রি-অর্ডার বিশেষ মূল্য' : 'Festive Pre-Order Special Price'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  ₹{totalPrice}
                </span>
                <span className="text-xs text-stone-400 line-through font-mono">
                  ₹{box.originalPrice * quantity}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-bengali">
                  ({language === 'bn' ? `সাশ্রয় ₹${totalSavings}` : `Save ₹${totalSavings}`})
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-stone-500 dark:text-stone-400 font-bengali hidden sm:block">
              <p>✓ ১০০% খাঁটি ছানা ও গাওয়া ঘি</p>
              <p>✓ নিখুঁত সময়মতো প্রস্তুতের গ্যারান্টি</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCartPreOrder}
              disabled={confirmedAdded}
              id="add-preorder-to-cart-btn"
              className={`py-3 px-4 rounded-xl font-bold font-bengali text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                confirmedAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
              }`}
            >
              {confirmedAdded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ঝুড়িতে যোগ হয়েছে ✓' : 'Added to Cart ✓'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {language === 'bn' ? `ঝুড়িতে যোগ করুন (₹${totalPrice})` : `Add to Cart (₹${totalPrice})`}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppBooking}
              id="whatsapp-preorder-btn"
              className="py-3 px-4 rounded-xl font-bold font-bengali text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে বুকিং করুন' : 'Book on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
