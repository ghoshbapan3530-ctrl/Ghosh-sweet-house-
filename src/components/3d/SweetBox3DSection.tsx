import React, { useState } from 'react';
import { Sweet3DCanvas } from './Sweet3DCanvas';
import { SweetModelType, SWEET_3D_CATALOG } from './sweetModels';
import { Sparkles, Gift, ShoppingBag, ShieldCheck, Check, Heart, Crown, Award } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ScrollReveal } from '../ScrollReveal';

export const SweetBox3DSection: React.FC = () => {
  const { language, theme, addToCart } = useShop();
  const isDark = theme === 'dark';

  const [activePlatter, setActivePlatter] = useState<'sweet_box' | 'mithai_thali'>('sweet_box');
  const [selectedWeight, setSelectedWeight] = useState<'500g' | '1kg' | '2kg'>('1kg');
  const [addedToast, setAddedToast] = useState(false);

  const priceMap: Record<string, { price: number; nameEn: string; nameBn: string }> = {
    'sweet_box-500g': { price: 380, nameEn: 'Royal Sweet Box (500g)', nameBn: 'রাজকীয় মিষ্টি গিফট বক্স (৫০০ গ্রাম)' },
    'sweet_box-1kg': { price: 720, nameEn: 'Royal Sweet Box (1kg)', nameBn: 'রাজকীয় মিষ্টি গিফট বক্স (১ কেজি)' },
    'sweet_box-2kg': { price: 1400, nameEn: 'Royal Celebration Box (2kg)', nameBn: 'বিবাহ ও উৎসবের মিষ্টি বক্স (২ কেজি)' },
    'mithai_thali-500g': { price: 450, nameEn: 'Grand Brass Thali (Mini)', nameBn: 'পিতলের মিষ্টি থালা (মিনি)' },
    'mithai_thali-1kg': { price: 850, nameEn: 'Grand Brass Mithai Thali (1kg)', nameBn: 'ঐতিহ্যবাহী পিতলের মিষ্টি থালা (১ কেজি)' },
    'mithai_thali-2kg': { price: 1650, nameEn: 'Royal Wedding Brass Thali (2kg)', nameBn: 'রাজকীয় বিবাহ স্পেশাল পিতলের থালা (২ কেজি)' }
  };

  const key = `${activePlatter}-${selectedWeight}`;
  const currentPricing = priceMap[key] || { price: 720, nameEn: 'Royal Box', nameBn: 'রাজকীয় বক্স' };

  const handleOrderBox = () => {
    addToCart(
      {
        id: `3d-${activePlatter}-${selectedWeight}`,
        nameEn: currentPricing.nameEn,
        nameBn: currentPricing.nameBn,
        descriptionEn: 'Handpicked Bengal pure sweets in 3D inspected festive packaging',
        descriptionBn: 'খাঁটি দেশি ঘিয়ে ভাজা ও তাজা ছানার মিষ্টির রাজকীয় উপহার বক্স',
        price: currentPricing.price,
        portionEn: selectedWeight,
        portionBn: selectedWeight === '500g' ? '৫০০ গ্রাম' : selectedWeight === '1kg' ? '১ কেজি' : '২ কেজি',
        category: 'sweet',
        isAvailable: true,
        badgeEn: '3D Custom Box',
        badgeBn: '৩ডি কাস্টম বক্স'
      },
      selectedWeight,
      currentPricing.price
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <section id="sweet-box-3d" className="py-16 sm:py-20 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? '৩ডি মিষ্টি বক্স ও থালা কাস্টমাইজার' : '3D Royal Sweet Box & Platter Studio'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-bengali tracking-tight">
              {language === 'bn' ? (
                <>
                  <span className={isDark ? 'text-stone-100' : 'text-stone-900'}>
                    উৎসব ও অনুষ্ঠানের জন্য{' '}
                  </span>
                  <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    ৩৬০° ৩ডি মিষ্টি বক্স দর্শন
                  </span>
                </>
              ) : (
                <>
                  <span className={isDark ? 'text-stone-100' : 'text-stone-900'}>
                    Handcrafted Gift Boxes in{' '}
                  </span>
                  <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    Interactive 3D
                  </span>
                </>
              )}
            </h2>
            <p className={`mt-3 text-sm sm:text-base font-bengali leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {language === 'bn'
                ? 'আপনার পরিবারের যেকোনো শুভ অনুষ্ঠানে সম্পূর্ণ ৩ডি মডেলে মিষ্টির বক্স বা পিতলের থালা ঘুরিয়ে দেখুন এবং অর্ডার করুন।'
                : 'Inspect the authentic Ghosh Sweet House festive boxes and brass platters in real-time 3D before placing your order.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 3D Interactive Platter Container */}
        <div
          className={`rounded-3xl border-2 p-5 sm:p-8 backdrop-blur-xl shadow-2xl transition-all ${
            isDark
              ? 'bg-gradient-to-br from-[#20130A] via-[#160B06] to-[#0E0603] border-amber-500/30'
              : 'bg-white border-amber-800/20 shadow-amber-900/10'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 3D WebGL Canvas */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-black/40 border border-amber-500/20 min-h-[380px] sm:min-h-[440px] flex items-center justify-center p-2">
              <Sweet3DCanvas
                modelType={activePlatter}
                height={420}
                autoRotateDefault={true}
                allowControls={true}
                showOverlayTools={true}
                lightingTheme="royal"
              />

              {/* Tag bottom left */}
              <div className="absolute bottom-3 left-3 z-10 hidden sm:block">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-300 border border-amber-500/25">
                  Drag to inspect lid & arranged sweets
                </span>
              </div>
            </div>

            {/* Right Column: Platter & Box Customizer Controls */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {/* Type Switcher */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block mb-2 font-mono">
                  STEP 1: SELECT 3D CONTAINER TYPE
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActivePlatter('sweet_box')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePlatter === 'sweet_box'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                        : isDark
                        ? 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs font-bengali">
                        {language === 'bn' ? 'রাজকীয় মিষ্টি বক্স' : 'Royal Sweet Box'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      {language === 'bn' ? 'সোনালী এমবসড উপহার বাক্স' : 'Gold embossed gift box'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePlatter('mithai_thali')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activePlatter === 'mithai_thali'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                        : isDark
                        ? 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs font-bengali">
                        {language === 'bn' ? 'পিতলের মিষ্টি থালা' : 'Brass Mithai Thali'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      {language === 'bn' ? 'পূজা ও রাজকীয় উৎসব থালা' : 'Festive decorative brass plate'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Weight / Pack Size Selector */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block mb-2 font-mono">
                  STEP 2: SELECT WEIGHT / QUANTITY
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['500g', '1kg', '2kg'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`py-2 px-3 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        selectedWeight === w
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-102'
                          : isDark
                          ? 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{w}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5 text-xs text-stone-300 border-t border-b border-amber-500/15 py-3">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bengali">রসগোল্লা, গোলাপ জামুন, সন্দেশ ও কাজু বরফির সমাহার</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bengali">১০০% খাঁটি দেশি গরুর দুধের ছানা ও গাওয়া ঘি</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bengali">কালিয়াচক ও আশেপাশের এলাকায় স্পেশাল হোম ডেলিভারি</span>
                </div>
              </div>

              {/* Price & Order Action */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Special Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-amber-400 font-mono">
                      ₹{currentPricing.price}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">/ {selectedWeight}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOrderBox}
                  className={`flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
                    addedToast
                      ? 'bg-emerald-500 text-stone-950'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20'
                  }`}
                >
                  {addedToast ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অর্ডারে যোগ হয়েছে!' : 'Added to Cart!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{language === 'bn' ? 'এই বক্সটি অর্ডার করুন' : 'Add 3D Box to Order'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
