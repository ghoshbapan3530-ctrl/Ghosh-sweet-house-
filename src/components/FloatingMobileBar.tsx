import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { Home, UtensilsCrossed, ShoppingBag, Clock, User, ShieldCheck } from 'lucide-react';

export const FloatingMobileBar: React.FC = () => {
  const {
    language,
    cartCount,
    lastCartAddedAt,
    setIsCartOpen,
    currentCustomer,
    setIsAuthModalOpen,
    setIsDashboardOpen,
    setIsOrdersOpen,
    open3DViewer
  } = useShop();

  const [isCartShaking, setIsCartShaking] = useState(false);
  const prevCartCountRef = useRef(cartCount);
  const prevLastCartAddedAtRef = useRef(lastCartAddedAt);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevCartCountRef.current = cartCount;
      prevLastCartAddedAtRef.current = lastCartAddedAt;
      return;
    }

    const hasNewItemBeenAdded =
      (lastCartAddedAt > 0 && lastCartAddedAt !== prevLastCartAddedAtRef.current) ||
      cartCount > prevCartCountRef.current;

    prevCartCountRef.current = cartCount;
    prevLastCartAddedAtRef.current = lastCartAddedAt;

    if (hasNewItemBeenAdded) {
      setIsCartShaking(true);
      const timer = setTimeout(() => {
        setIsCartShaking(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [cartCount, lastCartAddedAt]);

  const handleAccountClick = () => {
    if (currentCustomer) {
      // If logged in: open customer's Account page
      setIsDashboardOpen(true);
    } else {
      // If logged out: open Authentication selection (New Customer / Existing Customer)
      setIsAuthModalOpen(true);
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating 3D Sweet Experience Pill for Mobile */}
      <button
        type="button"
        onClick={() => open3DViewer('rasgulla')}
        className="fixed bottom-16 right-3 z-40 xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs shadow-2xl border-2 border-amber-300 active:scale-95 transition-all cursor-pointer"
        title="3D Sweet Studio"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>{language === 'bn' ? '৩৬০° ৩ডি মিষ্টি' : '3D Sweets'}</span>
      </button>

      <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] bg-[#180E08]/95 dark:bg-[#120A05]/95 backdrop-blur-lg border-t border-amber-500/30 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {/* 1. 🏠 Home */}
        <a
          href="#hero"
          onClick={handleHomeClick}
          id="mobile-nav-home"
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-[10px] shadow transition-all active:scale-95 text-center"
        >
          <Home className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate">{language === 'bn' ? 'হোম' : 'Home'}</span>
        </a>

        {/* 2. 🍬 Menu */}
        <a
          href="#sweets-menu"
          id="mobile-nav-menu"
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-[10px] shadow transition-all active:scale-95 text-center"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate">{language === 'bn' ? 'মেনু' : 'Menu'}</span>
        </a>

        {/* 3. 🛒 Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          id="mobile-nav-cart"
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-[10px] shadow-lg transition-all active:scale-95 text-center ${
            isCartShaking ? 'ring-2 ring-amber-300 scale-105 shadow-amber-400/50' : ''
          }`}
        >
          <ShoppingBag
            key={isCartShaking ? `mobile-cart-shake-${lastCartAddedAt || cartCount}` : 'mobile-cart-idle'}
            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
              isCartShaking ? 'animate-cart-shake' : ''
            }`}
          />
          <span className="truncate">{language === 'bn' ? 'কার্ট' : 'Cart'}</span>
          {cartCount > 0 && (
            <span
              key={isCartShaking ? `mobile-badge-pop-${cartCount}` : 'mobile-badge-idle'}
              className={`absolute -top-1.5 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-stone-950 text-amber-300 font-extrabold text-[9px] border border-amber-400 shadow ${
                isCartShaking ? 'animate-badge-pop bg-amber-950 text-amber-200' : ''
              }`}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* 4. 📦 Orders */}
        <button
          type="button"
          onClick={() => setIsOrdersOpen(true)}
          id="mobile-nav-orders"
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-800 font-semibold text-[10px] shadow transition-all active:scale-95 text-center"
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate">{language === 'bn' ? 'অর্ডার' : 'Orders'}</span>
        </button>

        {/* 5. 👤 Account (Logged In: Opens Account Page / Logged Out: Opens Sign Up / Sign In) */}
        <button
          type="button"
          onClick={handleAccountClick}
          id="mobile-nav-account"
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl border text-[10px] font-bold shadow transition-all active:scale-95 text-center ${
            currentCustomer
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-stone-900/80 text-stone-200 border-stone-800 hover:bg-stone-800'
          }`}
          title={
            currentCustomer
              ? (language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account')
              : (language === 'bn' ? 'লগইন বা সাইন আপ' : 'Sign Up or Sign In')
          }
        >
          <User className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate">
            {currentCustomer
              ? (language === 'bn' ? 'অ্যাকাউন্ট' : 'Account')
              : (language === 'bn' ? 'লগইন' : 'Account')}
          </span>
        </button>
      </div>
    </div>
    </>
  );
};
