import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Save, RotateCcw, Plus, Trash2, Edit3, Check } from 'lucide-react';
import { ProductItem } from '../types';

export const AdminPriceModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    updateProductPrice,
    resetToDefaultData,
    reviews,
    updateReview,
    language,
    theme
  } = useShop();

  const [activeTab, setActiveTab] = useState<'prices' | 'reviews'>('prices');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDark = theme === 'dark';

  if (!isAdminOpen) return null;

  const handlePriceChange = (id: string, price: number) => {
    setEditedPrices(prev => ({ ...prev, [id]: price }));
  };

  const handleSaveAll = () => {
    Object.entries(editedPrices).forEach(([id, price]) => {
      updateProductPrice(id, price);
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border flex flex-col ${
          isDark
            ? 'bg-[#180E08] border-amber-500/40 text-stone-200'
            : 'bg-white border-amber-800/20 text-stone-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-bengali">
                {language === 'bn' ? 'দোকানের মিষ্টির মূল্য ও রিভিউ ম্যানেজমেন্ট' : 'Ghosh Sweet House Quick Price & Review Editor'}
              </h3>
              <p className="text-xs text-amber-500 font-medium">
                {language === 'bn' ? 'যে কোনো মিষ্টির দাম তাৎক্ষণিক পরিবর্তন করুন' : 'Change prices live on the website anytime'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-4 border-b border-amber-500/15">
          <button
            type="button"
            onClick={() => setActiveTab('prices')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'prices'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-300'
            }`}
          >
            {language === 'bn' ? '🍬 মিষ্টি ও খাবারের দাম (Price List)' : 'Sweet Prices'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-300'
            }`}
          >
            {language === 'bn' ? '⭐ গ্রাহকের রিভিউ (Reviews)' : 'Customer Reviews'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'prices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-amber-500/10">
                <span>আইটেমের নাম (Item)</span>
                <span>পরিমাণ (Portion)</span>
                <span>বর্তমান মূল্য (Price ₹)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((item: ProductItem) => {
                  const currentVal = editedPrices[item.id] !== undefined ? editedPrices[item.id] : item.price;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isDark ? 'bg-stone-900/50 border-amber-500/15' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm font-bengali truncate">
                          {item.nameBn}
                        </div>
                        <div className="text-xs text-amber-500/80 font-serif-luxury truncate">
                          {item.nameEn}
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-stone-400 whitespace-nowrap">
                        {item.portionBn}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-amber-400">₹</span>
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                          className={`w-20 px-2.5 py-1 text-sm font-bold rounded-lg border text-right focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            isDark ? 'bg-stone-950 border-amber-500/40 text-amber-300' : 'bg-white border-stone-300 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-400">
                {language === 'bn'
                  ? 'গ্রাহকদের দেওয়া আসল মতামত এখানে লিখতে পারবেন। পরিবর্তন করলে সরাসরি ওয়েবসাইটে দেখাবে।'
                  : 'You can customize customer reviews here to reflect authentic local feedback.'}
              </p>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                          গ্রাহকের নাম (বাংলা)
                        </label>
                        <input
                          type="text"
                          value={rev.nameBn}
                          onChange={(e) => updateReview(rev.id, { nameBn: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                            isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                          এলাকা / অবস্থান
                        </label>
                        <input
                          type="text"
                          value={rev.locationBn}
                          onChange={(e) => updateReview(rev.id, { locationBn: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                            isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-amber-400 block mb-1">
                        মন্তব্য / রিভিউ (বাংলা)
                      </label>
                      <textarea
                        value={rev.commentBn}
                        onChange={(e) => updateReview(rev.id, { commentBn: e.target.value })}
                        rows={2}
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                          isDark ? 'bg-stone-950 border-stone-700 text-white' : 'bg-white border-stone-300'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetToDefaultData}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডিফল্ট মূল্যে ফিরিয়ে নিন' : 'Reset to Default Values'}</span>
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>{language === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved Successfully!'}</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              id="admin-save-btn"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'সব সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
