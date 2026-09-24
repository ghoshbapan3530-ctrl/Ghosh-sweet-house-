import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Flame, Clock, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';
import { NutritionTooltip } from './NutritionTooltip';
import { ScrollReveal } from './ScrollReveal';

export const SnacksMenu: React.FC = () => {
  const { language, theme, products, addToCart, t } = useShop();
  const isDark = theme === 'dark';

  const [activePortionMap, setActivePortionMap] = useState<Record<string, 'primary' | 'secondary'>>({});

  const snackProducts = products.filter(p => p.category === 'snack');

  const getActivePortionDetails = (item: ProductItem) => {
    const activeType = activePortionMap[item.id] || 'primary';
    if (activeType === 'secondary' && item.secondaryPrice) {
      return {
        portion: language === 'bn' ? item.secondaryPrice.portionBn : item.secondaryPrice.portionEn,
        price: item.secondaryPrice.price
      };
    }
    return {
      portion: language === 'bn' ? item.portionBn : item.portionEn,
      price: item.price
    };
  };

  const togglePortion = (itemId: string, type: 'primary' | 'secondary') => {
    setActivePortionMap(prev => ({
      ...prev,
      [itemId]: type
    }));
  };

  return (
    <section id="snacks" className="py-14 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              {/* Fresh badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.snacksFreshBadge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {language === 'bn' ? (
                  <span className="font-bengali text-amber-400">
                    {t.snacksTitle}
                  </span>
                ) : (
                  <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                    {t.snacksTitle}
                  </span>
                )}
              </h2>

              <p className={`text-sm sm:text-base mt-2 max-w-xl ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                {t.snacksSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'সকাল ৬টা থেকে রাত ১০টা পর্যন্ত তাজা পরিবেশন' : 'Served fresh from 6 AM to 10 PM'}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Snacks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {snackProducts.map((item: ProductItem, index: number) => {
            const currentPortion = getActivePortionDetails(item);
            const activeType = activePortionMap[item.id] || 'primary';
            const staggerDelay = (index % 4) * 0.06;

            return (
              <ScrollReveal
                key={item.id}
                direction="up"
                distance={20}
                delay={staggerDelay}
                duration={0.5}
                className="h-full flex flex-col"
              >
              <div
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between group h-full ${
                  isDark
                    ? 'bg-[#1F140D] border-amber-500/20 hover:border-amber-400/50 hover:shadow-xl'
                    : 'bg-white border-amber-850/15 hover:border-amber-500/50 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Header Badge & Portion Row (Image-free Clean Design) */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] shadow-sm">
                      {language === 'bn' ? (item.badgeBn || 'তাজা নাস্তা') : (item.badgeEn || 'Fresh Snack')}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-950/85 backdrop-blur-sm border border-amber-500/30 text-amber-300 shadow">
                      {currentPortion.portion}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-2.5">
                    <h3 className="text-xl font-bold font-bengali mb-0.5 leading-snug">
                      <span className={isDark ? 'text-amber-100' : 'text-stone-900'}>
                        {item.nameBn}
                      </span>
                    </h3>
                    <div className="text-xs font-medium text-amber-500/90 font-serif-luxury mb-2">
                      {item.nameEn}
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-3 mb-3 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                      {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                    </p>

                    {/* Portion Toggle Buttons (e.g. 1 pc vs 10 pcs, or 1 kg vs 500g) */}
                    {item.secondaryPrice && (
                      <div className="mb-3 pt-2 border-t border-amber-500/10">
                        <span className="block text-[10px] font-semibold text-amber-400 mb-1">
                          {language === 'bn' ? 'পরিমাণ বেছে নিন:' : 'Select Portion:'}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePortion(item.id, 'primary')}
                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                              activeType === 'primary'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : isDark
                                ? 'border-stone-800 text-stone-400 hover:border-stone-700'
                                : 'border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            {language === 'bn' ? item.portionBn : item.portionEn}
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePortion(item.id, 'secondary')}
                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                              activeType === 'secondary'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                : isDark
                                ? 'border-stone-800 text-stone-400 hover:border-stone-700'
                                : 'border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            {language === 'bn' ? item.secondaryPrice.portionBn : item.secondaryPrice.portionEn}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between mt-auto">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-amber-500 block">
                        {language === 'bn' ? 'মূল্য' : 'PRICE'}
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-amber-400">
                        ₹{currentPortion.price}
                      </span>
                      <span className="text-[11px] opacity-75">
                        / {currentPortion.portion}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(item, currentPortion.portion, currentPortion.price)}
                    id={`snack-order-${item.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t.addToCart}</span>
                  </button>
                </div>
              </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
