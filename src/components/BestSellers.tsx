import React, { useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';

export const BestSellers: React.FC = () => {
  const { language, theme, products, addToCart, t } = useShop();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // The requested signature best sellers
  const bestSellerIds = ['small-rosogolla', 'big-rosogolla', 'golapjamun', 'lal-rosogolla', 'rosogodam', 'laddu', 'chamcham'];
  const bestSellerProducts = products.filter(p => bestSellerIds.includes(p.id));

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="bestsellers" className="py-12 md:py-18 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-royal">
                {language === 'bn' ? 'আমাদের বিশেষ গৌরব' : 'Signature Delicacies'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              {language === 'bn' ? (
                <span className="font-bengali text-amber-400">
                  {t.bestSellersTitle}
                </span>
              ) : (
                <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  {t.bestSellersTitle}
                </span>
              )}
            </h2>
            <p className={`text-sm sm:text-base mt-2 max-w-xl ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {t.bestSellersSubtitle}
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => handleScroll('left')}
              className={`p-2.5 rounded-full border transition-all ${
                isDark
                  ? 'border-amber-500/30 text-amber-300 hover:bg-amber-950/50 hover:border-amber-400'
                  : 'border-amber-800/30 text-stone-800 hover:bg-amber-100 hover:border-amber-800'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className={`p-2.5 rounded-full border transition-all ${
                isDark
                  ? 'border-amber-500/30 text-amber-300 hover:bg-amber-950/50 hover:border-amber-400'
                  : 'border-amber-800/30 text-stone-800 hover:bg-amber-100 hover:border-amber-800'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Items Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bestSellerProducts.map((item: ProductItem) => (
            <div
              key={item.id}
              className={`flex-none w-[280px] sm:w-[320px] rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between snap-start group ${
                isDark
                  ? 'bg-[#20140D] border-amber-500/25 hover:border-amber-400/60 shadow-xl shadow-black/40'
                  : 'bg-white border-amber-800/15 hover:border-amber-500/60 shadow-md hover:shadow-xl'
              }`}
            >
              <div>
                {/* Top Badges Row */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold shadow-sm">
                    <Star className="w-3 h-3 fill-stone-950" />
                    <span>{language === 'bn' ? (item.badgeBn || 'জনপ্রিয়') : (item.badgeEn || 'Best Seller')}</span>
                  </div>

                  <div className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                    isDark ? 'bg-stone-950/70 border-amber-500/30 text-amber-300' : 'bg-amber-100/70 border-amber-800/20 text-stone-800'
                  }`}>
                    {language === 'bn' ? item.portionBn : item.portionEn}
                  </div>
                </div>

                {/* Royal Sweets Emblem Banner */}
                <div className={`p-4 rounded-xl mb-3.5 border flex items-center gap-3 transition-colors ${
                  isDark
                    ? 'bg-amber-950/20 border-amber-500/20 group-hover:border-amber-400/40'
                    : 'bg-amber-50 border-amber-800/15 group-hover:border-amber-500/40'
                }`}>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 text-base">
                    {item.id === 'small-rosogolla' ? '⚪' : item.id === 'big-rosogolla' ? '👑' : '🍬'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-bengali leading-snug">
                      <span className={isDark ? 'text-amber-100' : 'text-stone-900'}>
                        {item.nameBn}
                      </span>
                    </h3>
                    <div className="text-xs font-medium text-amber-500/90 font-serif-luxury">
                      {item.nameEn}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                  {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                </p>
              </div>

              {/* Price & Action Row */}
              <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                    {language === 'bn' ? 'মূল্য' : 'PRICE'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-amber-400">
                      ₹{item.price}
                    </span>
                    <span className="text-xs opacity-75">
                      / {language === 'bn' ? item.portionBn : item.portionEn}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  id={`bestseller-order-${item.id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.addToCart}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
