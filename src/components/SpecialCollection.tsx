import React from 'react';
import { useShop } from '../context/ShopContext';
import { Crown, Sparkles, Gift, HeartHandshake, ShieldCheck, ShoppingBag } from 'lucide-react';
import { NutritionTooltip } from './NutritionTooltip';
import { ScrollReveal } from './ScrollReveal';

export const SpecialCollection: React.FC = () => {
  const { language, theme, products, addToCart, t } = useShop();
  const isDark = theme === 'dark';

  const dairyProducts = products.filter(p => p.category === 'dairy');
  const specialBoxes = products.filter(p => p.category === 'special');

  const specialCategories = [
    {
      titleBn: 'ঐতিহ্যবাহী নলেন গুড় ও ছানার মিষ্টি',
      titleEn: 'Heritage Special Bengali Sweets',
      descBn: 'ঋতুভিত্তিক খাঁটি খেজুর গুড় ও টাটকা ছানার মিশ্রণে প্রস্তুত অনন্য সৃষ্টি।',
      descEn: 'Seasonal delicacies made of unrefined natural date-palm jaggery and freshly drained chenna.',
      badgeBn: 'বাঙালি সংস্কৃতি',
      badgeEn: 'Bengal Heritage'
    },
    {
      titleBn: 'মালদার বিখ্যাত রসকদম্ব ও সন্দেশ',
      titleEn: 'Malda Heritage Confections',
      descBn: 'খাঁটি ছানা, খোয়া ক্ষীর ও পোস্তদানার আবরণে তৈরি প্রাচীন মালদার ঐতিহ্যবাহী সুস্বাদু মিষ্টান্ন।',
      descEn: 'Legendary regional sweets of Malda crafted with rich artisanal chana, mawa, and poppy seeds.',
      badgeBn: 'মালদার ঐতিহ্য',
      badgeEn: 'Malda Legend'
    },
    {
      titleBn: 'খাঁটি মালাই ও ঘন ক্ষীরের পদ',
      titleEn: 'Fresh Kheer & Malai Items',
      descBn: 'ঘণ্টার পর ঘণ্টা ফুটানো দুধের সর, জাফরান ও ক্ষীরে ডুবানো লোভনীয় পদসমূহ।',
      descEn: 'Slow-simmered rich reduced milk delicacies with royal saffron and silver garnish.',
      badgeBn: 'ঘরোয়া ক্ষীর',
      badgeEn: 'Artisanal Rabdi'
    },
    {
      titleBn: 'কাস্টম রাজকীয় মিষ্টির গিফট বক্স',
      titleEn: 'Luxury Custom Sweet Gift Boxes',
      descBn: 'সোনালী ফয়েল ও কারুকাজ খচিত অভিজাত বক্সে আপনার পছন্দের মিষ্টি সাজিয়ে নিন।',
      descEn: 'Elegantly packaged royal sweet hampers designed for wedding invitations and VIP gifts.',
      badgeBn: 'উপহার বক্স',
      badgeEn: 'Premium Gift'
    }
  ];

  return (
    <section id="special" className="py-14 md:py-22 relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'রাজকীয় মিষ্টি সংগ্রহ' : 'The Royal Confectionery'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {language === 'bn' ? (
                <span className="font-bengali text-amber-400">
                  {t.specialTitle}
                </span>
              ) : (
                <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  {t.specialTitle}
                </span>
              )}
            </h2>

            <p className={`text-base max-w-2xl mx-auto ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
              {t.specialSubtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Premium Gold Framed Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {specialCategories.map((cat, idx) => (
            <ScrollReveal
              key={idx}
              direction="up"
              distance={20}
              delay={idx * 0.08}
              duration={0.5}
            >
            <div
              className={`relative rounded-3xl p-6 border transition-all duration-300 overflow-hidden group flex flex-col sm:flex-row gap-5 items-start sm:items-center h-full ${
                isDark
                  ? 'bg-gradient-to-br from-[#241710] to-[#180E08] border-amber-500/30 hover:border-amber-400/70 shadow-2xl shadow-black/60'
                  : 'bg-gradient-to-br from-[#FFFBF7] to-[#F5ECE0] border-amber-800/20 hover:border-amber-500/60 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Royal Emblem Icon Frame */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                {idx === 0 && <Crown className="w-8 h-8" />}
                {idx === 1 && <Sparkles className="w-8 h-8" />}
                {idx === 2 && <ShieldCheck className="w-8 h-8" />}
                {idx === 3 && <Gift className="w-8 h-8" />}
              </div>

              {/* Text content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md text-amber-300 font-bold text-[10px] border border-amber-500/20">
                    {language === 'bn' ? cat.badgeBn : cat.badgeEn}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-bengali mb-1.5 leading-snug">
                  <span className={isDark ? 'text-amber-100' : 'text-stone-900'}>
                    {language === 'bn' ? cat.titleBn : cat.titleEn}
                  </span>
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                  {language === 'bn' ? cat.descBn : cat.descEn}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অর্ডারে তৈরি' : 'Fresh on Request'}</span>
                  </span>
                </div>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Section C: Dairy and Fresh Raw Essentials (from the Ghosh board) */}
        <div className="mb-14">
          <ScrollReveal direction="up" distance={16} duration={0.5}>
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold font-bengali">
                  <span className={isDark ? 'text-amber-300' : 'text-stone-900'}>
                    {t.dairySectionTitle}
                  </span>
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-stone-400 font-bengali' : 'text-stone-600 font-bengali'}`}>
                  {t.dairySectionSubtitle}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dairyProducts.map((item, dIdx) => (
              <ScrollReveal
                key={item.id}
                direction="up"
                distance={18}
                delay={dIdx * 0.06}
                duration={0.45}
              >
              <div
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between h-full ${
                  isDark
                    ? 'bg-[#1C120B] border-amber-500/20 hover:border-amber-400/40'
                    : 'bg-white border-amber-800/15 hover:border-amber-500/40 shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm font-bengali leading-snug">
                      <span className={isDark ? 'text-stone-200' : 'text-stone-900'}>
                        {language === 'bn' ? item.nameBn : item.nameEn}
                      </span>
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-amber-500 font-bold">
                        ₹{item.price} <span className="text-[10px] opacity-80 font-normal">/ {language === 'bn' ? item.portionBn : item.portionEn}</span>
                      </span>
                      {item.nutrition && (
                        <NutritionTooltip
                          nutrition={item.nutrition}
                          language={language}
                          theme={theme}
                          itemName={language === 'bn' ? item.nameBn : item.nameEn}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  id={`dairy-order-${item.id}`}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-stone-950 text-amber-400 border border-amber-500/30 transition-all"
                  title={t.addToCart}
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Section D: Special Party & Celebration Bulk Boxes */}
        <div>
          <ScrollReveal direction="up" distance={16} duration={0.5}>
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="text-2xl font-bold font-bengali">
                  <span className={isDark ? 'text-amber-300' : 'text-stone-900'}>
                    {t.customBoxesTitle}
                  </span>
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-stone-400 font-bengali' : 'text-stone-600 font-bengali'}`}>
                  {language === 'bn' ? 'অনুষ্ঠান ও উপহারের জন্য প্রস্তুত কাস্টমাইজড বক্স' : 'Curated celebration packages for events and gifts'}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialBoxes.map((item, bIdx) => (
              <ScrollReveal
                key={item.id}
                direction="up"
                distance={20}
                delay={bIdx * 0.08}
                duration={0.5}
                className="h-full flex flex-col"
              >
              <div
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between h-full ${
                  isDark
                    ? 'bg-[#20140D] border-amber-500/25 hover:border-amber-400/60 shadow-lg'
                    : 'bg-white border-amber-800/15 hover:border-amber-500/50 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px]">
                      {language === 'bn' ? item.badgeBn : item.badgeEn}
                    </span>
                    <span className="text-xs font-semibold text-amber-500">
                      {language === 'bn' ? item.portionBn : item.portionEn}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold font-bengali mb-1.5 leading-snug">
                    <span className={isDark ? 'text-amber-100' : 'text-stone-900'}>
                      {language === 'bn' ? item.nameBn : item.nameEn}
                    </span>
                  </h4>

                  <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                    {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-amber-400">
                        ₹{item.price}
                      </span>
                      <span className="text-[10px] opacity-75">
                        / {language === 'bn' ? item.portionBn : item.portionEn}
                      </span>
                    </div>
                    {item.nutrition && (
                      <NutritionTooltip
                        nutrition={item.nutrition}
                        language={language}
                        theme={theme}
                        itemName={language === 'bn' ? item.nameBn : item.nameEn}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    id={`special-order-${item.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t.addToCart}</span>
                  </button>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
