import React from 'react';
import { useShop } from '../context/ShopContext';
import { MessageSquare, Phone, ShoppingBag, Download } from 'lucide-react';

export const FloatingMobileBar: React.FC = () => {
  const { language, theme, cartCount, setIsCartOpen, setIsInstallModalOpen, shopDetails, t } = useShop();
  const isDark = theme === 'dark';

  const defaultMsg = language === 'bn'
    ? 'নমস্কার, আমি ঘোষ মিষ্টান্ন ভাণ্ডার থেকে মিষ্টি অর্ডার করতে চাই।'
    : 'Hello, I would like to place a sweet order with Ghosh Sweet House.';

  const whatsappUrl = `https://wa.me/${shopDetails.whatsapp}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 xl:hidden p-2.5 bg-[#180E08]/95 dark:bg-[#120A05]/95 backdrop-blur-lg border-t border-amber-500/30 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="mobile-bottom-whatsapp"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow transition-all active:scale-95 text-center"
        >
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">WhatsApp</span>
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

        {/* App / APK Install Button */}
        <button
          type="button"
          onClick={() => setIsInstallModalOpen(true)}
          id="mobile-bottom-apk"
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] shadow transition-all active:scale-95 text-center"
        >
          <Download className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">{language === 'bn' ? 'APK' : 'APK'}</span>
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

