import React from 'react';
import { useShop } from '../context/ShopContext';
import { Star, MessageCircleHeart, CheckCircle, Sparkles } from 'lucide-react';
import { ReviewItem } from '../types';
import { ScrollReveal } from './ScrollReveal';

export const CustomerReviews: React.FC = () => {
  const { language, theme, reviews, t, setIsAdminOpen } = useShop();
  const isDark = theme === 'dark';

  return (
    <section id="reviews" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
                <MessageCircleHeart className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সরাসরি ক্রেতা পর্যালোচনা' : 'Patron Testimonials'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {language === 'bn' ? (
                  <span className="font-bengali text-amber-400">
                    {t.reviewsTitle}
                  </span>
                ) : (
                  <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                    {t.reviewsTitle}
                  </span>
                )}
              </h2>

              <p className={`text-sm sm:text-base mt-2 max-w-xl ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                {t.reviewsSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className={`text-xs px-4 py-2 rounded-xl border transition-all ${
                isDark
                  ? 'border-amber-500/30 text-amber-300 hover:bg-amber-950/40'
                  : 'border-amber-800/20 text-stone-700 hover:bg-amber-100'
              }`}
            >
              {language === 'bn' ? '✎ রিভিউ পরিবর্তন বা যোগ করুন' : '✎ Edit or Add Reviews'}
            </button>
          </div>
        </ScrollReveal>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev: ReviewItem, idx: number) => (
            <ScrollReveal
              key={rev.id}
              direction="up"
              distance={20}
              delay={idx * 0.08}
              duration={0.5}
              className="h-full flex flex-col"
            >
            <div
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-full ${
                isDark
                  ? 'bg-[#1F130C] border-amber-500/25 hover:border-amber-400/50 shadow-xl'
                  : 'bg-white border-amber-800/15 hover:border-amber-500/40 shadow-md'
              }`}
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] opacity-70 ml-2 font-semibold">
                    {rev.date}
                  </span>
                </div>

                {/* Comment */}
                <p className={`text-xs sm:text-sm leading-relaxed mb-6 font-bengali italic ${
                  isDark ? 'text-stone-200' : 'text-stone-700'
                }`}>
                  “{language === 'bn' ? rev.commentBn : rev.commentEn}”
                </p>
              </div>

              <div className="pt-4 border-t border-amber-500/15">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm font-bengali">
                    <span className={isDark ? 'text-amber-200' : 'text-stone-900'}>
                      {language === 'bn' ? rev.nameBn : rev.nameEn}
                    </span>
                  </h4>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    <span>{t.verifiedCustomer}</span>
                  </span>
                </div>

                <div className="text-[11px] opacity-70 mb-2">
                  {language === 'bn' ? rev.locationBn : rev.locationEn}
                </div>

                <div className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium font-bengali">
                  ❤️ {language === 'bn' ? rev.sweetLovedBn : rev.sweetLovedEn}
                </div>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
