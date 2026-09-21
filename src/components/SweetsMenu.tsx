import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Sparkles, Check, Info } from 'lucide-react';
import { ProductItem } from '../types';

export const SweetsMenu: React.FC = () => {
  const { language, theme, products, addToCart, t } = useShop();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePortionMap, setActivePortionMap] = useState<Record<string, 'primary' | 'secondary'>>({});

  const isDark = theme === 'dark';
  const sweetProducts = products.filter(p => p.category === 'sweet');

  const filteredProducts = sweetProducts.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'rosogolla') return item.id.includes('rosogolla') || item.id.includes('jam');
    if (selectedCategory === 'kheer') return item.id.includes('kheer') || item.id.includes('rosogodam') || item.id.includes('chamcham') || item.id.includes('durgavog') || item.id.includes('dommisri');
    if (selectedCategory === 'doi') return item.id.includes('dai') || item.id.includes('rosmalai') || item.id.includes('laddu');
    return true;
  });

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
    <section id="sweets" className="py-14 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'আমাদের সিগনেচার মিষ্টি' : 'Handmade Traditional Confections'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {language === 'bn' ? (
              <span className="font-bengali text-amber-400">
                {t.sweetsTitle}
              </span>
            ) : (
              <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                {t.sweetsTitle}
              </span>
            )}
          </h2>

          <p className={`text-sm sm:text-base ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
            {t.sweetsSubtitle}
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'rosogolla', label: t.filterRosogolla },
              { id: 'kheer', label: t.filterKheer },
              { id: 'doi', label: t.filterDoi },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                    : isDark
                    ? 'bg-stone-900 border border-amber-500/20 text-stone-300 hover:border-amber-400'
                    : 'bg-amber-100/60 border border-amber-900/20 text-stone-800 hover:bg-amber-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sweets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((item) => {
            const currentPortion = getActivePortionDetails(item);
            const activeType = activePortionMap[item.id] || 'primary';

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between group ${
                  isDark
                    ? 'bg-[#1D120B] border-amber-500/20 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-black/50'
                    : 'bg-white border-amber-850/15 hover:border-amber-500/50 hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Top Bar: Badge & Portion */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[11px] shadow-sm">
                      {language === 'bn' ? (item.badgeBn || 'ঐতিহ্যবাহী মিষ্টি') : (item.badgeEn || 'Signature Sweet')}
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      isDark ? 'bg-stone-950/70 border-amber-500/30 text-amber-300' : 'bg-amber-100/70 border-amber-800/20 text-stone-800'
                    }`}>
                      {currentPortion.portion}
                    </span>
                  </div>

                  {/* Sweet Title & Embellishment */}
                  <div className="mb-2.5">
                    <h3 className="text-xl font-bold font-bengali leading-snug">
                      <span className={isDark ? 'text-amber-100' : 'text-stone-900'}>
                        {item.nameBn}
                      </span>
                    </h3>
                    <div className="text-xs font-medium text-amber-500/90 font-serif-luxury mt-0.5">
                      {item.nameEn}
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                    {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                  </p>

                  {/* Portion Toggle Buttons (if secondary portion exists, e.g. 5 pcs vs 10 pcs) */}
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

                {/* Footer: Price & Add to Order */}
                <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-500 block">
                        {language === 'bn' ? 'মূল্য' : 'PRICE'}
                      </span>
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
                      id={`sweet-order-${item.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                </div>
            );
          })}
        </div>

        {/* Notice of pure ingredients */}
        <div className={`mt-10 p-4 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-center gap-3 ${
          isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-800/15 text-amber-900'
        }`}>
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-bengali">
            {language === 'bn'
              ? 'ঘোষ মিষ্টান্ন ভাণ্ডারের সকল মিষ্টি তৈরি হয় ১০০% খাঁটি গরুর দুধের ছানা এবং খাঁটি ঘিয়ে। কোনো কৃত্রিম গন্ধ বা সংরক্ষণকারী ব্যবহার করা হয় না।'
              : 'All sweets at Ghosh Sweet House are crafted using 100% pure cow milk cottage cheese and pure ghee without artificial additives.'}
          </p>
        </div>

      </div>
    </section>
  );
};
