import React, { useState, useEffect } from 'react';
import { ProductItem } from '../types';
import { saveProductToFirestore } from '../lib/firestore-products';
import {
  X,
  Save,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Check,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react';

interface EditProductModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: ProductItem) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved
}) => {
  if (!isOpen || !product) return null;

  const [formData, setFormData] = useState<ProductItem>({ ...product });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state whenever selected product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: Number(product.price) || 10,
        isAvailable: product.isAvailable !== false,
        isEnabled: product.isEnabled !== false
      });
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [product]);

  const handlePriceStep = (delta: number) => {
    setFormData((prev) => {
      const nextPrice = Math.max(0, (Number(prev.price) || 0) + delta);
      return { ...prev, price: nextPrice };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic validation
    if (!formData.nameEn.trim()) {
      setErrorMsg('Product name (English) is required.');
      return;
    }
    if (!formData.nameBn.trim()) {
      setErrorMsg('Product name (Bengali) is required.');
      return;
    }
    if (formData.price < 0 || isNaN(formData.price)) {
      setErrorMsg('Price must be a valid non-negative number.');
      return;
    }

    setSaving(true);
    try {
      const cleanProduct: ProductItem = {
        ...formData,
        price: Number(formData.price),
        nameEn: formData.nameEn.trim(),
        nameBn: formData.nameBn.trim(),
        descriptionEn: (formData.descriptionEn || '').trim(),
        descriptionBn: (formData.descriptionBn || '').trim(),
        portionEn: (formData.portionEn || 'per piece').trim(),
        portionBn: (formData.portionBn || 'প্রতি পিস').trim(),
        image: formData.image?.trim() || ''
      };

      const res = await saveProductToFirestore(cleanProduct);

      if (res.success) {
        setSuccessMsg('Product details saved to Firestore in real-time!');
        if (onSaved) onSaved(cleanProduct);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to update Firestore');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#180E08] text-stone-100 rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-500/20 bg-[#120B06] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100 flex items-center gap-2">
                <span>Edit Product Details</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  ID: {formData.id}
                </span>
              </h2>
              <p className="text-[11px] text-amber-500 font-bengali">
                {formData.nameBn || 'মিষ্টি ও খাবারের তথ্য পরিবর্তন'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Section 1: Availability & Visibility Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Availability Toggle */}
            <div
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                formData.isAvailable !== false
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-red-950/20 border-red-500/40'
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isAvailable: prev.isAvailable === false }))
              }
            >
              <div>
                <span className="text-xs font-bold block text-stone-200">
                  {formData.isAvailable !== false ? '🟢 In Stock (মজুদ আছে)' : '🔴 Out of Stock (স্টক শেষ)'}
                </span>
                <span className="text-[10px] text-stone-400">
                  {formData.isAvailable !== false
                    ? 'Customers can add this to their cart'
                    : 'Shows "Out of Stock", disables ordering'}
                </span>
              </div>
              <button
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  formData.isAvailable !== false
                    ? 'bg-emerald-500 text-stone-950 shadow-sm'
                    : 'bg-red-600 text-white shadow-sm'
                }`}
              >
                {formData.isAvailable !== false ? 'Available' : 'Sold Out'}
              </button>
            </div>

            {/* Enabled / Disabled Toggle */}
            <div
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                formData.isEnabled !== false
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-stone-900/60 border-stone-700'
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isEnabled: prev.isEnabled === false }))
              }
            >
              <div>
                <span className="text-xs font-bold block text-stone-200 flex items-center gap-1.5">
                  {formData.isEnabled !== false ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Active Menu Item</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                      <span>Hidden Item (লুকানো)</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-stone-400">
                  {formData.isEnabled !== false
                    ? 'Visible on public customer menu'
                    : 'Hidden from menu without deleting history'}
                </span>
              </div>
              <button
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  formData.isEnabled !== false
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-700 text-stone-300'
                }`}
              >
                {formData.isEnabled !== false ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Section 2: Product Names (English & Bengali) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Product Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Rosogolla"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Product Name (বাংলা) *
              </label>
              <input
                type="text"
                required
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                placeholder="যেমন: রসগোল্লা"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-sm font-bengali focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Price and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price with Stepper */}
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
                <span>Price (₹ INR) *</span>
                <span className="text-[10px] text-stone-400">Updates live in store</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePriceStep(-5)}
                  className="w-9 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center active:scale-95"
                  title="Decrease ₹5"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceStep(-1)}
                  className="w-9 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center active:scale-95"
                  title="Decrease ₹1"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-amber-400 font-mono font-bold text-base focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handlePriceStep(1)}
                  className="w-9 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center active:scale-95"
                  title="Increase ₹1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceStep(5)}
                  className="w-9 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center active:scale-95"
                  title="Increase ₹5"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as 'sweet' | 'snack' | 'dairy' | 'special'
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="sweet">Sweet (ঐতিহ্যবাহী মিষ্টি)</option>
                <option value="snack">Snack (মুচমুচে নোনতা ও টিফিন)</option>
                <option value="dairy">Dairy / দই ও ক্ষীর</option>
                <option value="special">Special Collection / উৎসবের বিশেষ</option>
              </select>
            </div>
          </div>

          {/* Section: Inventory & Low Stock Alert Threshold */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Inventory & Low Stock Alert • মজুত ও স্টক অ্যালার্ট</span>
              </span>
              {/* Live stock status badge */}
              {(() => {
                const stock = typeof formData.stockCount === 'number' ? formData.stockCount : 25;
                const threshold = typeof formData.lowStockThreshold === 'number' ? formData.lowStockThreshold : 10;
                if (stock === 0) {
                  return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      🚫 Out of Stock (0 left)
                    </span>
                  );
                }
                if (stock <= threshold) {
                  return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      ⚠️ Low Stock Alert ({stock} left)
                    </span>
                  );
                }
                return (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Healthy Stock ({stock} left)
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Current Stock Units (পণ্য মজুত সংখ্যা)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => {
                        const cur = typeof prev.stockCount === 'number' ? prev.stockCount : 25;
                        const next = Math.max(0, cur - 1);
                        return { ...prev, stockCount: next, isAvailable: next > 0 };
                      })
                    }
                    className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
                    title="Subtract 1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockCount !== undefined ? formData.stockCount : 25}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setFormData({
                        ...formData,
                        stockCount: val,
                        isAvailable: val > 0
                      });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-center font-mono font-bold text-amber-400 text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => {
                        const cur = typeof prev.stockCount === 'number' ? prev.stockCount : 25;
                        const next = cur + 1;
                        return { ...prev, stockCount: next, isAvailable: true };
                      })
                    }
                    className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold flex items-center justify-center active:scale-95"
                    title="Add 1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => {
                        const cur = typeof prev.stockCount === 'number' ? prev.stockCount : 25;
                        return { ...prev, stockCount: cur + 10, isAvailable: true };
                      })
                    }
                    className="px-2.5 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-[11px] active:scale-95"
                    title="Quick Restock +10"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Low Stock Alert Threshold (সতর্কবার্তা সীমা)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Defaults to shop threshold (10)"
                  value={formData.lowStockThreshold !== undefined && formData.lowStockThreshold !== null ? formData.lowStockThreshold : ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : Math.max(1, Number(e.target.value));
                    setFormData({ ...formData, lowStockThreshold: val });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 font-mono text-sm focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Alert triggers when inventory drops to or below this count.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Portion / Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Portion / Unit (English)
              </label>
              <input
                type="text"
                value={formData.portionEn}
                onChange={(e) => setFormData({ ...formData, portionEn: e.target.value })}
                placeholder="e.g. per piece, per 2 pcs, per 250g"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Portion / Unit (বাংলা)
              </label>
              <input
                type="text"
                value={formData.portionBn}
                onChange={(e) => setFormData({ ...formData, portionBn: e.target.value })}
                placeholder="যেমন: প্রতি পিস, প্রতি প্লেট"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-bengali focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Image URL & Live Preview */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Product Image URL</span>
              </span>
              <span className="text-[10px] text-stone-400">Direct image link (HTTPS)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-500/30 bg-stone-900 flex-shrink-0">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.nameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600 text-[10px]">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Descriptions (English & Bengali) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Description (English)
              </label>
              <textarea
                rows={2}
                value={formData.descriptionEn || ''}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Detailed English description of flavor, texture, ingredients..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                Description (বাংলা)
              </label>
              <textarea
                rows={2}
                value={formData.descriptionBn || ''}
                onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                placeholder="খাবারের স্বাদ, মিষ্টির খাঁটি ছানা ও প্রস্তুত প্রণালী সম্পর্কিত বিবরণ..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-bengali focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 7: Badges and Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Badge / Tag (English)
              </label>
              <input
                type="text"
                value={formData.badgeEn || ''}
                onChange={(e) => setFormData({ ...formData, badgeEn: e.target.value })}
                placeholder="e.g. Best Seller, Special"
                className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Badge / Tag (বাংলা)
              </label>
              <input
                type="text"
                value={formData.badgeBn || ''}
                onChange={(e) => setFormData({ ...formData, badgeBn: e.target.value })}
                placeholder="যেমন: সেরা পছন্দ, বিশেষ মিষ্টি"
                className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-bengali focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          {/* Section 8: Historical Order Preservation & Enabled Toggle Info */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-300 block">
                  Product Status: {formData.isEnabled !== false ? 'Enabled (Active)' : 'Disabled (Hidden)'}
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Instead of deleting products, toggle the enabled status. This preserves all previous customer receipts and ensures historical order prices remain immutable.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isEnabled: prev.isEnabled === false }))}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                  formData.isEnabled !== false
                    ? 'bg-stone-800 text-stone-300 border border-stone-700 hover:border-amber-500'
                    : 'bg-amber-500 text-stone-950 shadow-sm'
                }`}
              >
                {formData.isEnabled !== false ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                    <span>Disable Item</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-stone-950" />
                    <span>Enable Item</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-amber-500/20 bg-[#120B06] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
