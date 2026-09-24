import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Sparkles,
  Info,
  Search,
  X,
  SlidersHorizontal,
  Leaf,
  Flame,
  Zap,
  RotateCcw,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProductItem } from '../types';
import { NutritionTooltip } from './NutritionTooltip';
import { ScrollReveal } from './ScrollReveal';

type HealthPreset = 'all' | 'low-sugar' | 'low-calorie' | 'high-protein' | 'low-fat';
type SortOption = 'default' | 'sugar-asc' | 'calories-asc' | 'protein-desc' | 'price-asc' | 'price-desc';

export const SweetsMenu: React.FC = () => {
  const { language, theme, products, addToCart, t } = useShop();
  
  // State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [healthPreset, setHealthPreset] = useState<HealthPreset>('all');
  const [isSlidersOpen, setIsSlidersOpen] = useState<boolean>(false);
  const [maxSugar, setMaxSugar] = useState<number>(50);
  const [maxCalories, setMaxCalories] = useState<number>(350);
  const [minProtein, setMinProtein] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [activePortionMap, setActivePortionMap] = useState<Record<string, 'primary' | 'secondary'>>({});

  const isDark = theme === 'dark';
  const sweetProducts = useMemo(() => products.filter(p => p.category === 'sweet'), [products]);

  // Is custom slider active (non-default)?
  const isCustomSliderActive = maxSugar < 50 || maxCalories < 350 || minProtein > 0 || sortBy !== 'default';
  const isAnyFilterActive = searchQuery.trim() !== '' || selectedCategory !== 'all' || healthPreset !== 'all' || isCustomSliderActive;

  // Filter and sort sweets
  const filteredProducts = useMemo(() => {
    let result = sweetProducts.filter(item => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'rosogolla' && !(item.id.includes('rosogolla') || item.id.includes('jam'))) return false;
        if (selectedCategory === 'kheer' && !(item.id.includes('kheer') || item.id.includes('rosogodam') || item.id.includes('chamcham') || item.id.includes('durgavog') || item.id.includes('dommisri') || item.id.includes('peyera'))) return false;
        if (selectedCategory === 'doi' && !(item.id.includes('dai') || item.id.includes('rosmalai') || item.id.includes('laddu') || item.id.includes('jelebi') || item.id.includes('batasa'))) return false;
      }

      const nut = item.nutrition;

      // 2. Health Preset Filter
      if (healthPreset === 'low-sugar' && (!nut || nut.sugar > 15)) return false;
      if (healthPreset === 'low-calorie' && (!nut || nut.calories > 160)) return false;
      if (healthPreset === 'high-protein' && (!nut || nut.protein < 4.5)) return false;
      if (healthPreset === 'low-fat' && (!nut || (nut.fat ?? 99) > 5)) return false;

      // 3. Custom Sliders
      if (nut) {
        if (nut.sugar > maxSugar) return false;
        if (nut.calories > maxCalories) return false;
        if (nut.protein < minProtein) return false;
      }

      // 4. Search Query (Text & Semantic Nutritional intent)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();

        // Semantic nutrition terms check
        const isLowSugarSearch = q.includes('low sugar') || q.includes('sugar free') || q.includes('কম চিনি') || q.includes('চিনি কম') || q.includes('sugar-free') || q.includes('less sugar');
        const isLowCalSearch = q.includes('low cal') || q.includes('কম ক্যাল') || q.includes('হালকা');
        const isHighProteinSearch = q.includes('protein') || q.includes('প্রোটিন');
        const isLowFatSearch = q.includes('low fat') || q.includes('কম ফ্যাট');

        if (isLowSugarSearch && nut && nut.sugar <= 15) return true;
        if (isLowCalSearch && nut && nut.calories <= 160) return true;
        if (isHighProteinSearch && nut && nut.protein >= 4.5) return true;
        if (isLowFatSearch && nut && (nut.fat ?? 99) <= 5) return true;

        // General text search
        const matchNameBn = item.nameBn.toLowerCase().includes(q);
        const matchNameEn = item.nameEn.toLowerCase().includes(q);
        const matchDescBn = item.descriptionBn.toLowerCase().includes(q);
        const matchDescEn = item.descriptionEn.toLowerCase().includes(q);
        const matchBadgeBn = (item.badgeBn || '').toLowerCase().includes(q);
        const matchBadgeEn = (item.badgeEn || '').toLowerCase().includes(q);

        return matchNameBn || matchNameEn || matchDescBn || matchDescEn || matchBadgeBn || matchBadgeEn;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'sugar-asc') {
        return (a.nutrition?.sugar ?? 99) - (b.nutrition?.sugar ?? 99);
      }
      if (sortBy === 'calories-asc') {
        return (a.nutrition?.calories ?? 999) - (b.nutrition?.calories ?? 999);
      }
      if (sortBy === 'protein-desc') {
        return (b.nutrition?.protein ?? 0) - (a.nutrition?.protein ?? 0);
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      return 0; // default order
    });

    return result;
  }, [sweetProducts, selectedCategory, healthPreset, maxSugar, maxCalories, minProtein, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setHealthPreset('all');
    setMaxSugar(50);
    setMaxCalories(350);
    setMinProtein(0);
    setSortBy('default');
  };

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
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="text-center max-w-3xl mx-auto mb-8">
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
          </div>
        </ScrollReveal>

        {/* ------------------- NUTRITION SEARCH & HEALTH FILTERS BAR ------------------- */}
        <ScrollReveal direction="up" distance={16} delay={0.1} duration={0.5}>
          <div className={`p-4 sm:p-5 rounded-2xl border mb-8 transition-all ${
            isDark
              ? 'bg-[#180E08]/90 border-amber-500/25 shadow-xl'
              : 'bg-gradient-to-b from-amber-50/70 to-orange-50/50 border-amber-800/15 shadow-md'
          }`}>
          {/* Row 1: Search Input & Custom Sliders Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchSweetsPlaceholder}
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  isDark
                    ? 'bg-stone-900/90 border border-amber-500/30 text-stone-100 placeholder:text-stone-500'
                    : 'bg-white border border-amber-900/20 text-stone-900 placeholder:text-stone-400 shadow-inner'
                }`}
                id="sweets-nutrition-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-500 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Custom Sliders Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSlidersOpen(prev => !prev)}
              id="toggle-nutrition-sliders-btn"
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isSlidersOpen || isCustomSliderActive
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md'
                  : isDark
                  ? 'bg-stone-900 border-amber-500/30 text-amber-300 hover:border-amber-400'
                  : 'bg-white border-amber-900/20 text-amber-900 hover:bg-amber-100/50 shadow-sm'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t.customNutritionFilter}</span>
              {isCustomSliderActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {isSlidersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Row 2: Health Quick Filters (Presets) */}
          <div className="mt-3.5 pt-3 border-t border-amber-500/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500/90 font-royal">
                {language === 'bn' ? 'স্বাস্থ্য সচেতন পছন্দের ফিল্টার:' : 'Health-Conscious Quick Presets:'}
              </span>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-400 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.resetFilters}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* All */}
              <button
                type="button"
                onClick={() => setHealthPreset('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  healthPreset === 'all'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : isDark
                    ? 'bg-stone-900/80 border border-amber-500/20 text-stone-300 hover:border-amber-400/50'
                    : 'bg-white border border-amber-900/20 text-stone-700 hover:bg-amber-100/50'
                }`}
              >
                <span>{t.healthFilterAll}</span>
              </button>

              {/* Low Sugar */}
              <button
                type="button"
                onClick={() => setHealthPreset(healthPreset === 'low-sugar' ? 'all' : 'low-sugar')}
                id="filter-low-sugar-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  healthPreset === 'low-sugar'
                    ? 'bg-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-400/50'
                    : isDark
                    ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-emerald-50 border border-emerald-600/20 text-emerald-800 hover:bg-emerald-100/60'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.healthFilterLowSugar}</span>
              </button>

              {/* Low Calorie */}
              <button
                type="button"
                onClick={() => setHealthPreset(healthPreset === 'low-calorie' ? 'all' : 'low-calorie')}
                id="filter-low-calorie-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  healthPreset === 'low-calorie'
                    ? 'bg-sky-600 text-white font-bold shadow-md ring-2 ring-sky-400/50'
                    : isDark
                    ? 'bg-sky-950/30 border border-sky-500/30 text-sky-300 hover:bg-sky-900/40'
                    : 'bg-sky-50 border border-sky-600/20 text-sky-800 hover:bg-sky-100/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.healthFilterLowCalorie}</span>
              </button>

              {/* High Protein */}
              <button
                type="button"
                onClick={() => setHealthPreset(healthPreset === 'high-protein' ? 'all' : 'high-protein')}
                id="filter-high-protein-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  healthPreset === 'high-protein'
                    ? 'bg-indigo-600 text-white font-bold shadow-md ring-2 ring-indigo-400/50'
                    : isDark
                    ? 'bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40'
                    : 'bg-indigo-50 border border-indigo-600/20 text-indigo-800 hover:bg-indigo-100/60'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.healthFilterHighProtein}</span>
              </button>

              {/* Low Fat */}
              <button
                type="button"
                onClick={() => setHealthPreset(healthPreset === 'low-fat' ? 'all' : 'low-fat')}
                id="filter-low-fat-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  healthPreset === 'low-fat'
                    ? 'bg-amber-600 text-white font-bold shadow-md ring-2 ring-amber-400/50'
                    : isDark
                    ? 'bg-amber-950/30 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
                    : 'bg-amber-50 border border-amber-700/20 text-amber-900 hover:bg-amber-100/60'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.healthFilterLowFat}</span>
              </button>
            </div>
          </div>

          {/* Row 3: Collapsible Custom Sliders & Sorting */}
          {isSlidersOpen && (
            <div className={`mt-4 pt-4 border-t border-amber-500/20 animate-in fade-in duration-200 ${
              isDark ? 'bg-stone-950/60 p-4 rounded-xl' : 'bg-white/80 p-4 rounded-xl'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Max Sugar Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      {t.maxSugarLabel}:
                    </span>
                    <span className="font-bold text-amber-400">{maxSugar}g</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={maxSugar}
                    onChange={(e) => setMaxSugar(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>10g ({language === 'bn' ? 'কম' : 'Low'})</span>
                    <span>50g ({language === 'bn' ? 'সর্বোচ্চ' : 'Max'})</span>
                  </div>
                </div>

                {/* Max Calories Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-sky-500" />
                      {t.maxCaloriesLabel}:
                    </span>
                    <span className="font-bold text-amber-400">{maxCalories} kcal</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="350"
                    step="10"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>70 kcal</span>
                    <span>350 kcal</span>
                  </div>
                </div>

                {/* Min Protein Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-indigo-500" />
                      {t.minProteinLabel}:
                    </span>
                    <span className="font-bold text-amber-400">{minProtein}g+</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    step="0.5"
                    value={minProtein}
                    onChange={(e) => setMinProtein(Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>0g</span>
                    <span>7g</span>
                  </div>
                </div>

                {/* Sort By Dropdown */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    {t.sortByLabel}:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-stone-900 border-amber-500/30 text-stone-100'
                        : 'bg-white border-amber-900/20 text-stone-800'
                    }`}
                  >
                    <option value="default">{t.sortFeatured}</option>
                    <option value="sugar-asc">{t.sortLowestSugar}</option>
                    <option value="calories-asc">{t.sortLowestCalories}</option>
                    <option value="protein-desc">{t.sortHighestProtein}</option>
                    <option value="price-asc">{t.sortPriceLowHigh}</option>
                    <option value="price-desc">{t.sortPriceHighLow}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Row 4: Category Pills & Matching Count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-amber-500/15">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'rosogolla', label: t.filterRosogolla },
                { id: 'kheer', label: t.filterKheer },
                { id: 'doi', label: t.filterDoi },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : isDark
                      ? 'bg-stone-900/60 border border-amber-500/20 text-stone-300 hover:border-amber-400'
                      : 'bg-white/80 border border-amber-900/20 text-stone-800 hover:bg-amber-100/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Match Counter Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-semibold ${
                isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-900'
              }`}>
                {filteredProducts.length} {t.matchingResults}
              </span>
              {isAnyFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-stone-400 hover:text-amber-500 underline text-[11px]"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Health-Conscious Advice / Diabetic-Friendly Guidance Box */}
        <div className={`mb-8 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-colors ${
          healthPreset === 'low-sugar'
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            : isDark
            ? 'bg-amber-950/15 border-amber-500/20 text-amber-200'
            : 'bg-amber-50/80 border-amber-800/15 text-amber-900'
        }`}>
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            healthPreset === 'low-sugar' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Leaf className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
              {t.healthTipTitle}
            </h4>
            <p className="text-xs leading-relaxed opacity-90 font-bengali">
              {t.healthTipContent}
            </p>
          </div>
          {healthPreset !== 'low-sugar' && (
            <button
              type="button"
              onClick={() => setHealthPreset('low-sugar')}
              className="text-xs font-bold text-amber-400 hover:underline whitespace-nowrap self-end sm:self-center"
            >
              {language === 'bn' ? 'কম চিনির মিষ্টি দেখুন →' : 'View Low Sugar Sweets →'}
            </button>
          )}
        </div>
        </ScrollReveal>

        {/* Sweets Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-16 px-4 rounded-3xl border ${
            isDark ? 'bg-[#180E08] border-amber-500/20' : 'bg-white border-amber-800/15'
          }`}>
            <Leaf className="w-12 h-12 text-amber-500/60 mx-auto mb-3" />
            <h3 className="text-xl font-bold font-bengali mb-2">
              {t.noMatchingSweets}
            </h3>
            <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              {t.noMatchingSweetsDesc}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.resetFilters}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item, index) => {
              const currentPortion = getActivePortionDetails(item);
              const activeType = activePortionMap[item.id] || 'primary';
              const nut = item.nutrition;
              const isLowSugar = nut && nut.sugar <= 15;
              const isLowCal = nut && nut.calories <= 150;
              const isHighProtein = nut && nut.protein >= 4.5;
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
                      ? 'bg-[#1D120B] border-amber-500/20 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-black/50'
                      : 'bg-white border-amber-850/15 hover:border-amber-500/50 hover:shadow-xl'
                  }`}
                >
                  <div>
                    {/* Header Badge & Portion Row (Image-free Clean Design) */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] shadow-sm">
                        {language === 'bn' ? (item.badgeBn || 'ঐতিহ্যবাহী মিষ্টি') : (item.badgeEn || 'Signature Sweet')}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-950/85 backdrop-blur-sm border border-amber-500/30 text-amber-300 shadow">
                        {currentPortion.portion}
                      </span>
                    </div>

                    {/* Sweet Title & Embellishment */}
                    <div className="mb-2">
                      <h3 className="text-xl font-bold font-bengali leading-snug">
                        <span className={isDark ? 'text-amber-100' : 'text-stone-900'}>
                          {item.nameBn}
                        </span>
                      </h3>
                      <div className="text-xs font-medium text-amber-500/90 font-serif-luxury mt-0.5">
                        {item.nameEn}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed line-clamp-2 mb-3 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                      {language === 'bn' ? item.descriptionBn : item.descriptionEn}
                    </p>

                    {/* Prominent Nutritional Quick Highlights */}
                    {nut && (
                      <div className={`p-2 rounded-xl mb-3 border flex flex-wrap items-center gap-1.5 text-[11px] ${
                        isDark ? 'bg-stone-950/60 border-amber-500/15' : 'bg-amber-50/70 border-amber-800/10'
                      }`}>
                        {/* Sugar highlight */}
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold ${
                          isLowSugar
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                            : isDark ? 'text-stone-300' : 'text-stone-700'
                        }`}>
                          <Leaf className="w-3 h-3 text-emerald-400" />
                          <span>{nut.sugar}g {language === 'bn' ? 'চিনি' : 'sugar'}</span>
                          {isLowSugar && <span className="text-[9px] bg-emerald-600 text-white px-1 rounded">Low</span>}
                        </span>

                        {/* Calories */}
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold ${
                          isLowCal
                            ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30'
                            : isDark ? 'text-stone-300' : 'text-stone-700'
                        }`}>
                          <Zap className="w-3 h-3 text-sky-400" />
                          <span>{nut.calories} kcal</span>
                        </span>

                        {/* Protein */}
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold ${
                          isHighProtein
                            ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                            : isDark ? 'text-stone-300' : 'text-stone-700'
                        }`}>
                          <Heart className="w-3 h-3 text-indigo-400" />
                          <span>{nut.protein}g {language === 'bn' ? 'প্রোটিন' : 'prot'}</span>
                        </span>
                      </div>
                    )}

                    {/* Portion Toggle Buttons (if secondary portion exists, e.g. 1 pc vs 10 pcs) */}
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
                      id={`sweet-order-${item.id}`}
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
        )}

        {/* Notice of pure ingredients */}
        <ScrollReveal direction="up" distance={16} delay={0.1} duration={0.5}>
          <div className={`mt-10 p-4 rounded-2xl border text-center flex flex-col sm:flex-row items-center justify-center gap-3 ${
            isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-800/15 text-amber-900'
          }`}>
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-bengali">
              {language === 'bn'
                ? 'ঘোষ মিষ্টান্ন ভাণ্ডারের সকল মিষ্টি তৈরি হয় ১০০% খাঁটি গরুর দুধের ছানা এবং খাঁটি ঘিয়ে। কোনো কৃত্রিম মিষ্টি বা প্রিজারভেটিভ ব্যবহার করা হয় না।'
                : 'All sweets at Ghosh Sweet House are crafted using 100% pure cow milk cottage cheese and pure ghee without artificial additives.'}
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
