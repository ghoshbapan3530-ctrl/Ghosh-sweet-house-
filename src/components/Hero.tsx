import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, BookOpen, Phone, CheckCircle2, Sparkles, Award, Crown, Download, X, Smartphone, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  const { language, theme, t, shopDetails, setIsCartOpen } = useShop();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const isDark = theme === 'dark';

  const trustBadges = [
    t.trustBadge1,
    t.trustBadge2,
    t.trustBadge3,
    t.trustBadge4
  ];

  return (
    <section id="home" className="relative overflow-hidden pt-6 pb-16 md:pt-12 md:pb-24">
      {/* Subtle Luxury Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-amber-600/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Subtitles, Badges & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Royal Bengali Brand Crest Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold mb-6 ${
                isDark
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : 'bg-amber-100/80 border-amber-800/20 text-amber-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'bn' ? 'দুইসাটাবিঘি, কালিয়াচক, মালদা' : 'Duisatabighi, Kaliachak, Malda'}
              </span>
              <span className="text-amber-500">•</span>
              <span className="font-bengali">
                {language === 'bn' ? 'বিশুদ্ধ মিষ্টির ঠিকানা' : 'House of Pure Sweets'}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-6"
            >
              {language === 'bn' ? (
                <span className="font-bengali">
                  <span className="block text-stone-100 dark:text-stone-100 [text-shadow:_0_2px_12px_rgba(0,0,0,0.5)]">
                    {t.heroHeadlinePart1}
                  </span>
                  <span className="block mt-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
                    {t.heroHeadlinePart2}
                  </span>
                </span>
              ) : (
                <span className="font-serif-luxury">
                  <span className={isDark ? 'text-stone-100' : 'text-stone-900'}>
                    {t.heroHeadlinePart1}
                  </span>{' '}
                  <span className="block mt-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                    {t.heroHeadlinePart2}
                  </span>
                </span>
              )}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-lg sm:text-xl font-normal leading-relaxed mb-8 max-w-2xl ${
                isDark ? 'text-amber-100/80 font-bengali' : 'text-stone-700 font-bengali'
              }`}
            >
              {t.heroSubheading}
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 w-full sm:w-auto"
            >
              {/* Order Now Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                id="hero-order-cta"
                className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm sm:text-base bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="w-5 h-5 text-stone-950" />
                <span>{t.heroCtaOrder}</span>
              </button>

              {/* View Menu Button */}
              <a
                href="#sweets"
                id="hero-menu-cta"
                className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base border transition-all ${
                  isDark
                    ? 'border-amber-500/40 text-amber-200 hover:bg-amber-950/40 hover:border-amber-400'
                    : 'border-amber-900/30 text-amber-950 hover:bg-amber-100/80 hover:border-amber-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>{t.heroCtaMenu}</span>
              </a>

              {/* Call Now Button */}
              <a
                href={`tel:${shopDetails.phone}`}
                id="hero-call-cta"
                className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base border transition-all ${
                  isDark
                    ? 'border-stone-700/60 bg-stone-900/60 text-stone-300 hover:border-amber-500/40 hover:text-amber-300'
                    : 'border-stone-300 bg-white/80 text-stone-800 hover:border-amber-800/40 hover:text-amber-900'
                }`}
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>{t.heroCtaCall}</span>
              </a>

              {/* Install App / APK Button */}
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                id="hero-apk-cta"
                className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base border transition-all ${
                  isDark
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40'
                    : 'border-emerald-700/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'অ্যাপ / APK' : 'App / APK'}</span>
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full pt-4 border-t border-amber-500/15"
            >
              {trustBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isDark ? 'text-amber-200/90 bg-amber-950/20' : 'text-stone-800 bg-amber-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="font-bengali leading-snug">{badge}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Royal Heritage Insignia Plaque (100% Vector & Typography) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Glowing Golden Ring Frame */}
            <div className="relative w-full max-w-[440px] rounded-3xl p-6 bg-gradient-to-br from-[#241710] via-[#1A0E08] to-[#120904] border-2 border-amber-500/40 shadow-2xl backdrop-blur-md text-center">
              
              {/* Golden Ornamental Top Header */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-amber-400" />
                <span className="text-xs uppercase font-royal font-bold tracking-widest text-amber-300">
                  HERITAGE CONFECTIONERY
                </span>
                <Crown className="w-6 h-6 text-amber-400" />
              </div>

              {/* Central Seal Calligraphy */}
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-600/30 via-amber-400/20 to-amber-500/40 border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-lg mb-4">
                <span className="text-3xl font-bold font-bengali text-amber-300 tracking-wide">
                  ঘোষ
                </span>
                <span className="text-[10px] font-bold text-amber-400/90 tracking-widest font-royal mt-0.5">
                  ESTD • MALDA
                </span>
              </div>

              {/* Brand Title */}
              <h3 className="text-2xl sm:text-3xl font-extrabold font-bengali text-amber-200 mb-1 leading-snug">
                ঘোষ মিষ্টান্ন ভাণ্ডার
              </h3>
              <p className="text-xs font-serif-luxury text-amber-400/90 tracking-wider mb-4">
                GHOSH SWEET HOUSE • DUISATABIGHI
              </p>

              {/* Quality Pillars */}
              <div className="space-y-2 py-3 border-y border-amber-500/20 text-left mb-4">
                <div className="flex items-center gap-2.5 text-xs text-stone-300">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-bengali">১০০% খাঁটি দেশি গরুর দুধের ছানা ও টাটকা উপাদান</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-300">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-bengali">সকালের তাজা স্পঞ্জ রসগোল্লা, চমচম ও খাঁটি দই</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-bengali">বিবাহ, শুভ অন্নপ্রাশন ও উৎসবের স্পেশাল মিষ্টি বক্স</span>
                </div>
              </div>

              {/* Address Footer */}
              <div className="flex items-center justify-between text-[11px] text-amber-400/80 pt-1">
                <span>📍 দুইসাটাবিঘি, কালিয়াচক, মালদা</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  ● খোলা রয়েছে
                </span>
              </div>

              {/* Decorative Floating Sweet Mini Badge Bottom Right */}
              <div className="absolute -bottom-4 -right-3 sm:-right-4 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 px-3.5 py-2 rounded-xl shadow-xl border border-amber-300 flex items-center gap-2">
                <span className="text-base">🍬</span>
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-900 leading-none">
                    {language === 'bn' ? 'খাঁটি বাঙালি স্বাদ' : '100% PURE CHANA'}
                  </div>
                  <div className="text-xs font-extrabold font-bengali leading-tight">
                    {language === 'bn' ? 'সেরা মিষ্টির ঠিকানা' : 'Malda Famous'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* APK / Mobile App Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
              isDark
                ? 'bg-[#180E08] border-amber-500/40 text-stone-100'
                : 'bg-white border-amber-800/20 text-stone-800'
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-bengali text-amber-300">
                  {language === 'bn' ? 'মোবাইল অ্যাপ ও APK' : 'Mobile App & APK'}
                </h3>
                <p className="text-xs text-stone-400">
                  Ghosh Sweet House • Ghosh Sweets
                </p>
              </div>
            </div>

            {/* Option 1: Add to Home Screen / PWA */}
            <div className={`p-4 rounded-2xl border mb-3 text-left ${
              isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-amber-50 border-amber-800/15'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-amber-400 font-bengali">
                  {language === 'bn' ? '১. সরাসরি ফোনে ইনস্টল (PWA)' : '1. Instant Install (PWA)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  {language === 'bn' ? 'সুপার ফাস্ট' : 'Fastest'}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-bengali mb-3">
                {language === 'bn'
                  ? 'কোনো ডাউনলোডের ঝামেলা ছাড়াই ব্রাউজারের থ্রি-ডট (⋮) মেনু থেকে "Add to Home Screen" বা "Install App" চাপুন।'
                  : 'Tap your browser menu (⋮) and choose "Add to Home Screen" or "Install App" for full app experience.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  alert(language === 'bn' ? 'ব্রাউজারের মেনু (⋮) খুলে "Add to Home screen" বা "Install App" চাপুন।' : 'Open browser menu (⋮) and select "Add to Home Screen" or "Install App".');
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'bn' ? 'হোম স্ক্রিনে যুক্ত করুন' : 'Add to Home Screen'}</span>
              </button>
            </div>

            {/* Option 2: Request Direct APK on WhatsApp */}
            <div className={`p-4 rounded-2xl border text-left ${
              isDark ? 'bg-stone-900/60 border-emerald-500/30' : 'bg-emerald-50 border-emerald-800/15'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-emerald-400 font-bengali">
                  {language === 'bn' ? '২. সরাসরি APK ফাইল নিন' : '2. Request Direct APK'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  Android APK
                </span>
              </div>
              <p className="text-xs text-stone-300 font-bengali mb-3">
                {language === 'bn'
                  ? 'আমাদের অফিশিয়াল WhatsApp-এ মেসেজ পাঠিয়ে সরাসরি Android APK ইনস্টলেশন প্যাকেজ ও আপডেট সংগ্রহ করুন।'
                  : 'Get the standalone Android APK directly sent to your WhatsApp by contacting Ghosh Sweet House.'}
              </p>
              <a
                href={`https://wa.me/${shopDetails.whatsapp}?text=${encodeURIComponent(
                  language === 'bn'
                    ? 'নমস্কার, আমাকে ঘোষ মিষ্টান্ন ভাণ্ডারের অ্যান্ড্রয়েড APK ফাইল ও লিঙ্ক দিন।'
                    : 'Hello, please send me the Ghosh Sweet House Android APK file.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'bn' ? 'WhatsApp-এ APK চান' : 'Get APK via WhatsApp'}</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
