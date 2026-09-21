import React from 'react';
import { useShop } from '../context/ShopContext';
import { Phone, MessageSquare, MapPin, Sparkles, Heart } from 'lucide-react';

export const OrderCTA: React.FC = () => {
  const { language, theme, shopDetails, t } = useShop();
  const isDark = theme === 'dark';

  const defaultWhatsappMessage = language === 'bn'
    ? 'নমস্কার, আমি ঘোষ মিষ্টান্ন ভাণ্ডার থেকে তাজা মিষ্টি ও জলখাবার অর্ডার করতে চাই।'
    : 'Hello! I would like to order fresh sweets from Ghosh Sweet House.';

  const whatsappUrl = `https://wa.me/${shopDetails.whatsapp}?text=${encodeURIComponent(defaultWhatsappMessage)}`;

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative rounded-3xl p-8 sm:p-12 md:p-16 border text-center overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#2E1A0F] via-[#20120A] to-[#140A05] border-amber-500/40 shadow-2xl shadow-amber-950/40'
            : 'bg-gradient-to-br from-[#FFF5E6] via-[#FAEBD7] to-[#F5DEB3]/50 border-amber-800/20 shadow-xl'
        }`}>
          {/* Subtle gold glow elements */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'তাজা মিষ্টির স্বাদ নিন' : 'Fresh Sweets Everyday'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {language === 'bn' ? (
                <span className="font-bengali text-amber-300">
                  {t.orderCtaTitle}
                </span>
              ) : (
                <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  {t.orderCtaTitle}
                </span>
              )}
            </h2>

            <p className={`text-base sm:text-lg mb-8 max-w-xl mx-auto font-bengali leading-relaxed ${
              isDark ? 'text-amber-100/90' : 'text-stone-700'
            }`}>
              {t.orderCtaSubtitle}
            </p>

            {/* High-conversion 3 Main Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="cta-whatsapp-order"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-full font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/30 active:scale-95 transition-all"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>{t.ctaWhatsApp}</span>
              </a>

              {/* Call Now Button */}
              <a
                href={`tel:${shopDetails.phone}`}
                id="cta-call-direct"
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-full font-bold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-xl shadow-amber-950/30 active:scale-95 transition-all"
              >
                <Phone className="w-5 h-5 fill-stone-950" />
                <span>{t.ctaCallNow} ({shopDetails.phone})</span>
              </a>

              {/* Get Directions Button */}
              <a
                href={shopDetails.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="cta-directions-maps"
                className={`flex items-center justify-center gap-2.5 px-6 py-4 rounded-full font-semibold text-sm sm:text-base border transition-all ${
                  isDark
                    ? 'border-amber-500/40 text-amber-200 hover:bg-amber-950/40'
                    : 'border-amber-800/30 text-stone-800 hover:bg-amber-100/80'
                }`}
              >
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>{t.ctaGetDirections}</span>
              </a>
            </div>

            {/* Location highlight badge */}
            <div className="mt-8 text-xs font-semibold text-amber-400/90 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'দুইসাটাবিঘি, কালিয়াচক, মালদা, পশ্চিমবঙ্গ' : 'Duisatabighi, Kaliachak, Malda, West Bengal'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
