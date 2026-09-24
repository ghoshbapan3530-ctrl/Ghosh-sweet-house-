import React from 'react';
import { useShop } from '../context/ShopContext';
import { UtensilsCrossed, Phone, ShoppingBag, Sparkles, Gift } from 'lucide-react';

export const FloatingMobileBar: React.FC = () => {
  const {
    language,
    cartCount,
    setIsCartOpen,
    currentCustomer,
    openSignUpModal,
    setIsDashboardOpen,
    sweetPoints,
    shopDetails
  } = useShop();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden px-2.5 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] bg-[#180E08]/95 dark:bg-[#120A05]/95 backdrop-blur-lg border-t border-amber-500/30 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* Menu & Sweets Button */}
        <a
          href="#sweets-menu"
          id="mobile-bottom-menu"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-[11px] shadow transition-all active:scale-95 text-center"
        >
          <UtensilsCrossed className="w-3.5 h-3.5 flex-shrink-0 text-stone-950" />
          <span className="truncate">{language === 'bn' ? 'মিষ্টি মেনু' : 'Menu'}</span>
        </a>

        {/* Call Button */}
        <a
          href={`tel:${shopDetails.phone}`}
          id="mobile-bottom-call"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 font-bold text-[11px] shadow transition-all active:scale-95 text-center"
        >
          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span className="truncate">{language === 'bn' ? 'কল' : 'Call'}</span>
        </a>

        {/* Sweet Points & Loyalty Dashboard Button */}
        <button
          type="button"
          onClick={currentCustomer ? () => setIsDashboardOpen(true) : openSignUpModal}
          id="mobile-bottom-points"
          className="relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 font-bold text-[11px] shadow transition-all active:scale-95 text-center"
        >
          {currentCustomer ? (
            <>
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
              <span className="truncate font-mono">{sweetPoints} pts</span>
            </>
          ) : (
            <>
              <Gift className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 animate-bounce" />
              <span className="truncate text-amber-300">{language === 'bn' ? '১০ পয়েন্ট' : '+10 Pts'}</span>
            </>
          )}
        </button>

        {/* Order Cart Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          id="mobile-bottom-cart"
          className="relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-[11px] shadow-lg transition-all active:scale-95 text-center"
        >
          <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{language === 'bn' ? 'অর্ডার' : 'Order'}</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-stone-950 text-amber-300 font-extrabold text-[9px] border border-amber-400 shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};


