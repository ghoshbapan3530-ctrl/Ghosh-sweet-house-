import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { initialGallery } from '../data/initialData';
import { Sparkles, ZoomIn, X } from 'lucide-react';
import { GalleryItem } from '../types';

export const GallerySection: React.FC = () => {
  const { language, theme, t } = useShop();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const isDark = theme === 'dark';

  const tabs = [
    { id: 'all', label: t.galleryAll },
    { id: 'sweets', label: t.gallerySweets, icon: '🍬' },
    { id: 'snacks', label: t.gallerySnacks, icon: '🥟' },
    { id: 'boxes', label: t.galleryBoxes, icon: '🎁' },
    { id: 'celebration', label: t.galleryCelebration, icon: '🎊' },
    { id: 'shop', label: t.galleryShop, icon: '🏪' },
  ];

  const filteredItems = initialGallery.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <section id="gallery" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'দৃশ্যপট' : 'Visual Gallery'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {language === 'bn' ? (
              <span className="font-bengali text-amber-400">
                {t.galleryTitle}
              </span>
            ) : (
              <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                {t.galleryTitle}
              </span>
            )}
          </h2>

          <p className={`text-sm sm:text-base ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
            {t.gallerySubtitle}
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : isDark
                    ? 'bg-stone-900 border border-amber-500/20 text-stone-300 hover:border-amber-400'
                    : 'bg-amber-100/60 border border-amber-900/20 text-stone-800 hover:bg-amber-200/50'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                index % 3 === 0 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-square'
              } ${
                isDark ? 'border-amber-500/20 shadow-xl' : 'border-amber-800/15 shadow-md'
              }`}
            >
              <img
                src={item.image}
                alt={item.titleBn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              {/* Hover Zoom Icon */}
              <div className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/60 backdrop-blur-md text-amber-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                <ZoomIn className="w-4 h-4" />
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <h4 className="text-base font-bold font-bengali text-white mb-0.5 leading-snug">
                  {language === 'bn' ? item.titleBn : item.titleEn}
                </h4>
                <span className="text-[11px] text-amber-300/80 font-royal uppercase tracking-wider">
                  GHOSH SWEET HOUSE
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-stone-950 rounded-3xl overflow-hidden border border-amber-500/40 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:text-amber-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.image}
              alt={selectedImage.titleBn}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold font-bengali text-amber-300">
                {language === 'bn' ? selectedImage.titleBn : selectedImage.titleEn}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                ঘোষ মিষ্টান্ন ভাণ্ডার • দুইসাটাবিঘি, কালিয়াচক, মালদা
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
