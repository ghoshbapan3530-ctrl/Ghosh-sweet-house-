import React, { useState } from 'react';
import { Sweet3DCanvas } from './Sweet3DCanvas';
import { SweetModelType, SWEET_3D_CATALOG } from './sweetModels';
import { Sparkles, Maximize2, ShoppingBag, Eye, Award, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

interface Hero3DShowcaseProps {
  onOpen3DStudio?: (sweetType: SweetModelType) => void;
}

export const Hero3DShowcase: React.FC<Hero3DShowcaseProps> = ({ onOpen3DStudio }) => {
  const { language, theme, addToCart } = useShop();
  const isDark = theme === 'dark';

  const [activeModel, setActiveModel] = useState<SweetModelType>('rasgulla');

  const modelsList: { id: SweetModelType; labelEn: string; labelBn: string; badge: string }[] = [
    { id: 'rasgulla', labelEn: 'Rasgulla', labelBn: 'রসগোল্লা', badge: 'Best Seller' },
    { id: 'gulab_jamun', labelEn: 'Gulab Jamun', labelBn: 'গোলাপ জামুন', badge: 'Hot Desi Ghee' },
    { id: 'sandesh', labelEn: 'Sandesh', labelBn: 'সন্দেশ', badge: 'Nolen Gur' },
    { id: 'kaju_katli', labelEn: 'Kaju Katli', labelBn: 'কাজু বরফি', badge: 'Silver Vark' },
    { id: 'mishti_doi', labelEn: 'Mishti Doi', labelBn: 'মিষ্টি দই', badge: 'Earthen Handi' },
    { id: 'sweet_box', labelEn: 'Royal Box', labelBn: 'মিষ্টির বক্স', badge: 'Gift Assortment' }
  ];

  const currentMeta = SWEET_3D_CATALOG[activeModel] || SWEET_3D_CATALOG.rasgulla;

  const handleQuickAdd = () => {
    addToCart(
      {
        id: `hero-3d-${activeModel}`,
        nameEn: currentMeta.nameEn,
        nameBn: currentMeta.nameBn,
        descriptionEn: currentMeta.taglineEn,
        descriptionBn: currentMeta.taglineBn,
        price: activeModel === 'sweet_box' ? 380 : activeModel === 'mishti_doi' ? 60 : 35,
        portionEn: activeModel === 'sweet_box' ? '500g Box' : activeModel === 'mishti_doi' ? '1 Handi (200g)' : '2 pcs',
        portionBn: activeModel === 'sweet_box' ? '৫০০ গ্রাম' : activeModel === 'mishti_doi' ? '১টি হাঁড়ি' : '২টি',
        category: 'sweet',
        isAvailable: true,
        badgeEn: '3D Featured',
        badgeBn: '৩ডি মডেল',
        nutrition: {
          calories: currentMeta.calories,
          sugar: currentMeta.sugar,
          protein: currentMeta.protein,
          fat: 6,
          servingSizeBn: '১টি',
          servingSizeEn: '1 pc'
        }
      },
      activeModel === 'sweet_box' ? '500g Box' : '2 pcs',
      activeModel === 'sweet_box' ? 380 : 35
    );
  };

  return (
    <div className="relative w-full max-w-[480px] mx-auto flex flex-col items-center">
      {/* 3D Showcase Frame Container */}
      <div
        className={`w-full rounded-3xl border-2 p-3 sm:p-4 backdrop-blur-xl transition-all duration-300 shadow-2xl relative flex flex-col ${
          isDark
            ? 'bg-gradient-to-b from-[#24150D]/90 via-[#180D07]/95 to-[#120703] border-amber-500/40 shadow-black/80'
            : 'bg-gradient-to-b from-white/95 via-[#FCF8F2] to-[#F5ECE1] border-amber-800/25 shadow-amber-900/10'
        }`}
      >
        {/* Top Header Row with Bengali Insignia & Fullscreen 3D trigger */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-amber-500/20 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
              INTERACTIVE 3D STAGE
            </span>
            <span className="text-amber-500/50">•</span>
            <span className="text-[11px] font-bold text-amber-300 font-bengali">
              {language === 'bn' ? '৩৬০° খাঁটি মিষ্টি দর্শন' : '360° Real-time Model'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpen3DStudio && onOpen3DStudio(activeModel)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
            title="Open Full 3D Inspection Studio"
          >
            <Maximize2 className="w-3 h-3 text-amber-400" />
            <span>{language === 'bn' ? 'পূর্ণ ৩ডি' : 'Expand 3D'}</span>
          </button>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-black/40 to-black/20 border border-amber-500/15">
          <Sweet3DCanvas
            modelType={activeModel}
            height={340}
            autoRotateDefault={true}
            allowControls={true}
            showOverlayTools={true}
            onModelClick={() => onOpen3DStudio && onOpen3DStudio(activeModel)}
          />

          {/* Quick Floating Action on bottom right */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অর্ডার' : 'Order'}</span>
            </button>
          </div>
        </div>

        {/* Sweet Model Fast Selector Tabs */}
        <div className="w-full pt-3">
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5 px-1 font-bengali">
            <span>{language === 'bn' ? 'মিষ্টির ৩ডি মডেল পরিবর্তন করুন:' : 'Select 3D Sweet Model:'}</span>
            <span className="text-amber-400 font-mono text-[10px]">{currentMeta.pureChhenaRatio}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {modelsList.map((m) => {
              const isSelected = activeModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveModel(m.id)}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md shadow-amber-500/30 scale-102'
                      : isDark
                      ? 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-500/30 hover:text-amber-200'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  <span className="block text-[11px] font-bengali truncate leading-tight">
                    {language === 'bn' ? m.labelBn : m.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Purity & Heritage Ribbon */}
        <div className="mt-3 pt-2.5 border-t border-amber-500/15 flex items-center justify-between text-[11px] px-1">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bengali font-bold">ঘোষ মিষ্টান্ন ভাণ্ডার • মালদা</span>
          </div>
          <span className="text-stone-400 font-mono text-[10px]">Estd. 1978 • Handcrafted</span>
        </div>
      </div>
    </div>
  );
};
