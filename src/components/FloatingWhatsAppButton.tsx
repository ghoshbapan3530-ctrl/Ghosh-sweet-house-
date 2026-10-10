import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { getWhatsAppOrderUrl, generateWhatsAppOrderMessage } from '../services/whatsappService';
import {
  ShoppingBag,
  ExternalLink,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Eye,
  Send
} from 'lucide-react';

export const FloatingWhatsAppButton: React.FC = () => {
  const {
    cart,
    cartCount,
    cartTotal,
    shopDetails,
    language,
    theme,
    currentCustomer,
    setIsCartOpen
  } = useShop();

  const isDark = theme === 'dark';
  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close preview popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpenPreview(false);
      }
    };
    if (isOpenPreview) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpenPreview]);

  // Construct current order details
  const isDiscountEligible = cartTotal >= 100;
  const discount5Percent = isDiscountEligible ? Number((cartTotal * 0.05).toFixed(2)) : 0;
  const estimatedTotal = Math.max(0, Number((cartTotal - discount5Percent).toFixed(2)));

  const whatsappDetails = {
    cart,
    cartTotal,
    shopDetails,
    language,
    customerName: currentCustomer?.name || '',
    customerPhone: currentCustomer?.mobile || '',
    orderType: 'delivery' as const,
    deliveryCharge: cartTotal >= 500 ? 0 : 30
  };

  const whatsappUrl = getWhatsAppOrderUrl(whatsappDetails);
  const messagePreview = generateWhatsAppOrderMessage(whatsappDetails);

  const handleButtonClick = (e: React.MouseEvent) => {
    // If cart has items and preview is not already open, open WhatsApp directly
    // Also users can click preview anytime
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const togglePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpenPreview((prev) => !prev);
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-40 right-3 sm:right-6 bottom-28 xl:bottom-6 flex flex-col items-end select-none"
    >
      {/* 1. Quick WhatsApp Order Preview Card Popover */}
      {isOpenPreview && (
        <div
          className={`mb-3 w-[calc(100vw-28px)] sm:w-96 max-w-sm max-h-[75vh] overflow-y-auto rounded-3xl p-4 sm:p-5 shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            isDark
              ? 'bg-[#180E08]/95 border-emerald-500/30 text-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
              : 'bg-white/95 border-emerald-500/30 text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.25)]'
          }`}
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                <WhatsAppSvg className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm font-serif">
                  {language === 'bn' ? 'হোয়াটসঅ্যাপ সরাসরি অর্ডার' : 'WhatsApp Direct Order'}
                </h4>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  {language === 'bn' ? '১-ক্লিকে মেসেজ তৈরি' : '1-Click Pre-filled Order'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpenPreview(false)}
              className="p-1 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Status in Popover */}
          <div className="py-3 space-y-2.5">
            {cart.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-400">
                    {language === 'bn' ? 'কার্ট আইটেম (' + cartCount + 'টি):' : 'Cart Items (' + cartCount + '):'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenPreview(false);
                      setIsCartOpen(true);
                    }}
                    className="text-[11px] text-amber-500 hover:text-amber-400 underline underline-offset-2 flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>{language === 'bn' ? 'কার্ট সম্পাদনা' : 'Edit Cart'}</span>
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedPortion}`}
                      className={`p-2 rounded-xl text-xs flex justify-between items-center ${
                        isDark ? 'bg-stone-900/80 border border-stone-800' : 'bg-stone-100/90'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold truncate text-[11px]">
                          {language === 'bn' ? item.product.nameBn : item.product.nameEn}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {item.selectedPortion} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-amber-400 text-xs flex-shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Discount preview */}
                <div
                  className={`p-2.5 rounded-xl text-xs space-y-1 font-mono ${
                    isDark ? 'bg-stone-900/60' : 'bg-stone-50'
                  }`}
                >
                  <div className="flex justify-between text-stone-400 text-[11px]">
                    <span>Subtotal:</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {discount5Percent > 0 && (
                    <div className="flex justify-between text-emerald-400 text-[11px]">
                      <span>5% Discount:</span>
                      <span>-₹{discount5Percent}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-700/50">
                    <span className="font-sans">Est. Total:</span>
                    <span className="text-emerald-400">₹{estimatedTotal}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 text-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <p className="font-semibold text-amber-400 mb-1">
                  {language === 'bn' ? 'আপনার কার্ট খালি আছে' : 'Your cart is currently empty'}
                </p>
                <p className="text-[11px] text-stone-400 mb-2">
                  {language === 'bn'
                    ? 'হোয়াটসঅ্যাপে ক্লিক করলে ঘোষ সুইট হাউজে সরাসরি বার্তা যাবে অথবা মেনু থেকে মিষ্টি যোগ করতে পারেন।'
                    : 'Clicking WhatsApp will send a direct inquiry to Ghosh Sweet House, or you can add sweets to cart first!'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenPreview(false);
                    const el = document.getElementById('sweets-menu');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[11px] hover:bg-amber-400"
                >
                  {language === 'bn' ? 'মিষ্টি মেনু দেখুন' : 'Browse Sweets Menu'}
                </button>
              </div>
            )}

            {/* Formatted Message Code Snippet View */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                {language === 'bn' ? 'মেসেজ প্রিভিউ (WhatsApp Text):' : 'Pre-filled WhatsApp Message:'}
              </span>
              <div
                className={`p-2.5 rounded-xl font-mono text-[10px] leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap border ${
                  isDark
                    ? 'bg-stone-950/80 border-stone-800 text-emerald-300/90'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                {messagePreview}
              </div>
            </div>
          </div>

          {/* Action Launch Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpenPreview(false)}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <WhatsAppSvg className="w-4 h-4 fill-current" />
            <span>
              {cart.length > 0
                ? language === 'bn'
                  ? 'হোয়াটসঅ্যাপে অর্ডার পাঠান'
                  : 'Send Order on WhatsApp'
                : language === 'bn'
                ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান'
                : 'Chat on WhatsApp'}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      )}

      {/* 2. Floating Action Button Container */}
      <div
        className="flex items-center gap-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tooltip / Label Pill */}
        <div
          onClick={handleButtonClick}
          className={`cursor-pointer transition-all duration-300 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md shadow-xl border text-xs font-bold ${
            isDark
              ? 'bg-[#180E08]/90 text-stone-100 border-emerald-500/40 hover:border-emerald-400'
              : 'bg-white/95 text-stone-900 border-emerald-500/40 hover:border-emerald-400'
          } ${
            isHovered || cartCount > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>
            {cartCount > 0 ? (
              language === 'bn' ? (
                <>
                  কার্ট অর্ডার WhatsApp-এ <span className="text-amber-400 font-mono">({cartCount}টি • ₹{cartTotal})</span>
                </>
              ) : (
                <>
                  Order on WhatsApp <span className="text-amber-400 font-mono">({cartCount} items • ₹{cartTotal})</span>
                </>
              )
            ) : language === 'bn' ? (
              'হোয়াটসঅ্যাপে মিষ্টি অর্ডার'
            ) : (
              'Order on WhatsApp'
            )}
          </span>
          <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* The Main Round WhatsApp Action Button */}
        <div className="relative">
          {/* Subtle Ambient Pulse Ring when cart has items */}
          {cartCount > 0 && (
            <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
          )}

          {/* Quick Preview Toggle Mini Button (Small Eye badge) */}
          <button
            type="button"
            onClick={togglePreview}
            className={`absolute -top-1.5 -left-1.5 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-md border ${
              isOpenPreview
                ? 'bg-stone-900 text-stone-100 border-stone-700'
                : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-700'
            }`}
            title={language === 'bn' ? 'অর্ডার প্রিভিউ দেখুন' : 'Preview WhatsApp message'}
          >
            {isOpenPreview ? <X className="w-3 h-3" /> : <Eye className="w-3 h-3 text-amber-400" />}
          </button>

          {/* Main WhatsApp Button */}
          <button
            type="button"
            onClick={handleButtonClick}
            id="floating-whatsapp-order-btn"
            className="relative z-10 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#20ba5a] hover:from-[#0d7367] hover:to-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.65)] active:scale-95 hover:scale-105 transition-all cursor-pointer border-2 border-white/20"
            title={
              cartCount > 0
                ? `${cartCount} items in cart - Click to order via WhatsApp`
                : 'Chat & Order on WhatsApp'
            }
          >
            <WhatsAppSvg className="w-7 h-7 sm:w-7.5 sm:h-7.5 fill-current drop-shadow" />

            {/* Cart Count Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-amber-400 text-stone-950 font-black text-[11px] border-2 border-stone-950 shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * High-fidelity official WhatsApp SVG
 */
const WhatsAppSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C16.58 3.68 20.27 7.37 20.27 11.91C20.27 16.46 16.58 20.15 12.04 20.15ZM16.55 14.39C16.3 14.26 15.08 13.66 14.85 13.58C14.62 13.5 14.45 13.46 14.28 13.71C14.11 13.96 13.63 14.53 13.48 14.7C13.34 14.87 13.19 14.89 12.94 14.76C12.69 14.63 11.89 14.37 10.94 13.52C10.2 12.86 9.7 12.05 9.55 11.8C9.4 11.55 9.53 11.41 9.66 11.29C9.77 11.17 9.91 10.99 10.03 10.84C10.16 10.7 10.2 10.59 10.28 10.43C10.36 10.26 10.32 10.12 10.26 10C10.2 9.87 9.7 8.64 9.49 8.13C9.28 7.63 9.08 7.7 8.92 7.69C8.77 7.68 8.6 7.68 8.43 7.68C8.26 7.68 7.99 7.74 7.76 7.99C7.53 8.24 6.89 8.84 6.89 10.06C6.89 11.28 7.78 12.45 7.9 12.61C8.03 12.78 9.65 15.27 12.12 16.34C12.71 16.59 13.16 16.74 13.52 16.85C14.11 17.04 14.65 17.01 15.08 16.95C15.56 16.88 16.55 16.35 16.76 15.77C16.97 15.18 16.97 14.68 16.91 14.57C16.85 14.47 16.8 14.45 16.55 14.39Z" />
  </svg>
);
