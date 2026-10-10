import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Check,
  Share2,
  ShieldCheck,
  Flame,
  Award,
  Leaf,
  Layers,
  Heart
} from 'lucide-react';
import { Sweet3DCanvas } from './Sweet3DCanvas';
import { SweetModelType, SWEET_3D_CATALOG, Sweet3DMeta } from './sweetModels';
import { useShop } from '../../context/ShopContext';
import { ProductItem } from '../../types';

interface Sweet3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSweetType?: SweetModelType;
  relatedProduct?: ProductItem | null;
}

export const Sweet3DModal: React.FC<Sweet3DModalProps> = ({
  isOpen,
  onClose,
  initialSweetType = 'rasgulla',
  relatedProduct = null
}) => {
  const { language, theme, addToCart } = useShop();
  const isDark = theme === 'dark';

  const [selectedType, setSelectedType] = useState<SweetModelType>(initialSweetType);
  const [copied, setCopied] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Sync when initialSweetType changes
  React.useEffect(() => {
    if (initialSweetType) {
      setSelectedType(initialSweetType);
    }
  }, [initialSweetType]);

  if (!isOpen) return null;

  const currentMeta: Sweet3DMeta = SWEET_3D_CATALOG[selectedType] || SWEET_3D_CATALOG.rasgulla;

  const sweetOptions: { id: SweetModelType; labelEn: string; labelBn: string; icon: string }[] = [
    { id: 'rasgulla', labelEn: 'Rasgulla', labelBn: 'রসগোল্লা', icon: '⚪' },
    { id: 'gulab_jamun', labelEn: 'Gulab Jamun', labelBn: 'গোলাপ জামুন', icon: '🟤' },
    { id: 'sandesh', labelEn: 'Sandesh', labelBn: 'সন্দেশ', icon: '🟡' },
    { id: 'kaju_katli', labelEn: 'Kaju Katli', labelBn: 'কাজু বরফি', icon: '💎' },
    { id: 'laddu', labelEn: 'Laddoo', labelBn: 'মতিচুর লাড্ডু', icon: '🟠' },
    { id: 'mishti_doi', labelEn: 'Mishti Doi', labelBn: 'মিষ্টি দই', icon: '🏺' },
    { id: 'sweet_box', labelEn: 'Sweet Box', labelBn: 'মিষ্টির বক্স', icon: '🎁' },
    { id: 'mithai_thali', labelEn: 'Brass Thali', labelBn: 'পিতলের থালা', icon: '✨' }
  ];

  const handleShare = async () => {
    const text = `Explore ${currentMeta.nameEn} in Interactive 3D at Ghosh Sweet House, Kaliachak!\n${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentMeta.nameEn} - 3D Sweet Experience`,
          text,
          url: window.location.href
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleAddToCart = () => {
    if (relatedProduct) {
      addToCart(relatedProduct, relatedProduct.portionEn || '1 pc', relatedProduct.price);
    } else {
      // Synthesize a generic cart item based on current 3D sweet
      const synthProduct: ProductItem = {
        id: `3d-${selectedType}`,
        nameEn: currentMeta.nameEn,
        nameBn: currentMeta.nameBn,
        descriptionEn: currentMeta.taglineEn,
        descriptionBn: currentMeta.taglineBn,
        price: selectedType === 'sweet_box' ? 380 : selectedType === 'mithai_thali' ? 450 : selectedType === 'mishti_doi' ? 60 : 35,
        portionEn: selectedType === 'sweet_box' ? '500g Box' : selectedType === 'mishti_doi' ? '1 Earthen Pot (200g)' : '2 pcs',
        portionBn: selectedType === 'sweet_box' ? '৫০০ গ্রাম বক্স' : selectedType === 'mishti_doi' ? '১টি মাটির হাঁড়ি' : '২টি',
        category: 'sweet',
        isAvailable: true,
        badgeEn: '3D Verified',
        badgeBn: '৩ডি মডেল',
        nutrition: {
          calories: currentMeta.calories,
          sugar: currentMeta.sugar,
          protein: currentMeta.protein,
          fat: 6,
          servingSizeBn: '১টি',
          servingSizeEn: '1 pc'
        }
      };
      addToCart(synthProduct, synthProduct.portionEn, synthProduct.price);
    }

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-4xl rounded-3xl overflow-hidden border shadow-2xl flex flex-col relative ${
          isDark
            ? 'bg-gradient-to-b from-[#1E110A] to-[#120804] border-amber-500/30 text-stone-100'
            : 'bg-gradient-to-b from-white to-[#FDF8F3] border-amber-800/20 text-stone-900'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-amber-300">
                  {language === 'bn' ? '৩ডি মিষ্টি পরিদর্শন স্টুডিও' : '3D Sweet Inspection Studio'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  360° Interactive
                </span>
              </div>
              <p className="text-xs text-stone-400 font-bengali">
                {language === 'bn'
                  ? 'ঘুরিয়ে দেখুন, জুম করুন এবং খাঁটি উপাদানের নিখুঁত বিবরণ জানুন'
                  : 'Rotate, zoom, and inspect pure handcrafted artisanal details in 3D'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-stone-800/60 text-stone-300 transition-colors cursor-pointer"
              title="Share 3D Model"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-800/60 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sweet Selector Segmented Carousel */}
        <div className="px-4 py-3 border-b border-amber-500/15 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {sweetOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedType(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === opt.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20 scale-105'
                  : isDark
                  ? 'bg-stone-900/60 hover:bg-stone-800 text-stone-300 border border-stone-800'
                  : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
              }`}
            >
              <span>{opt.icon}</span>
              <span className="font-bengali">{language === 'bn' ? opt.labelBn : opt.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Main Body: 3D Canvas Left, Specs & Purchase Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* 3D WebGL Canvas Stage */}
          <div className="lg:col-span-7 relative min-h-[360px] sm:min-h-[420px] bg-gradient-to-b from-black/40 to-black/10 flex items-center justify-center p-2">
            <Sweet3DCanvas
              modelType={selectedType}
              height="100%"
              className="min-h-[360px] sm:min-h-[420px]"
              allowControls={true}
              showOverlayTools={true}
            />

            {/* Hint at bottom */}
            <div className="absolute bottom-3 right-3 pointer-events-none z-10 text-[10px] text-stone-400 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-sm">
              Use mouse wheel to zoom in/out
            </div>
          </div>

          {/* Right Column: Sweet Specifications & Order Actions */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-amber-500/20">
            <div className="space-y-4">
              {/* Sweet Title */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 block mb-1">
                  100% PURE CHHENA & DESI GHEE
                </span>
                <h4 className="text-2xl font-bold font-bengali text-amber-200 leading-tight">
                  {language === 'bn' ? currentMeta.nameBn : currentMeta.nameEn}
                </h4>
                <p className="text-xs text-amber-400/90 font-serif-luxury mt-0.5">
                  {currentMeta.nameEn}
                </p>
                <p className="text-xs text-stone-300 font-bengali mt-2 leading-relaxed">
                  {language === 'bn' ? currentMeta.taglineBn : currentMeta.taglineEn}
                </p>
              </div>

              {/* Quality & Origin Pillars */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-stone-400 block">Purity Standard</span>
                  <span className="font-bold text-amber-300 font-bengali">{currentMeta.pureChhenaRatio}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-stone-400 block">Best Before</span>
                  <span className="font-bold text-amber-300 font-bengali">{currentMeta.shelfLife}</span>
                </div>
              </div>

              {/* Live Nutritional Scan */}
              <div className="p-3 rounded-2xl bg-black/40 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nutrition & Caloric Profile</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">Per Serving</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">Energy</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">{currentMeta.calories}</span>
                    <span className="text-[9px] text-stone-500 block">kcal</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">Natural Sugar</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">{currentMeta.sugar}g</span>
                    <span className="text-[9px] text-stone-500 block">per pc</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block">Protein</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{currentMeta.protein}g</span>
                    <span className="text-[9px] text-stone-500 block">chhena</span>
                  </div>
                </div>
              </div>

              {/* Heritage Assurance */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bengali leading-snug">
                  {language === 'bn'
                    ? 'ঘোষ সুইট হাউসের ঐতিহ্যবাহী রেসিপি — কোনো রাসায়নিক বা কৃত্রিম রং নেই।'
                    : 'Ghosh Sweet House heritage recipe — zero chemical preservatives.'}
                </span>
              </div>
            </div>

            {/* Bottom Actions: Add to Cart */}
            <div className="pt-5 mt-4 border-t border-amber-500/20 space-y-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
                  addedAnimation
                    ? 'bg-emerald-500 text-stone-950'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'bn' ? 'অর্ডারে যোগ হয়েছে!' : 'Added to Order!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {language === 'bn'
                        ? 'এই মিষ্টি কার্টে যোগ করুন (অর্ডার করুন)'
                        : 'Add this Sweet to Cart & Order'}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-stone-400 font-bengali">
                {language === 'bn'
                  ? 'তাজা গরম মিষ্টি সরাসরি কালিয়াচক দোকান থেকে হোম ডেলিভারি'
                  : 'Fresh warm sweets prepared daily with free local delivery in Kaliachak'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
