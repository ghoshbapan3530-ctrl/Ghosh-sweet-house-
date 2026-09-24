import React, { useState, useRef, useEffect } from 'react';
import { Info, Flame, Sparkles, Activity, X } from 'lucide-react';
import { NutritionalInfo, Language, ThemeMode } from '../types';

interface NutritionTooltipProps {
  nutrition?: NutritionalInfo;
  language: Language;
  theme: ThemeMode;
  itemName?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const NutritionTooltip: React.FC<NutritionTooltipProps> = ({
  nutrition,
  language,
  theme,
  itemName,
  className = '',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!nutrition) return null;

  const servingSize = language === 'bn' ? nutrition.servingSizeBn : nutrition.servingSizeEn;

  // Alignment classes for popover placement
  const getAlignClass = () => {
    switch (align) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      case 'left':
      default:
        return 'left-0';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        aria-label={language === 'bn' ? 'পুষ্টিগুণ তথ্য দেখুন' : 'View nutrition facts'}
        aria-expanded={isOpen}
        className={`p-1 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${
          isOpen
            ? 'bg-amber-500 text-stone-950 scale-110 shadow-sm'
            : isDark
            ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/20 active:scale-95'
            : 'text-amber-700/80 hover:text-amber-900 hover:bg-amber-100 active:scale-95'
        }`}
        title={language === 'bn' ? 'পুষ্টিগুণ তথ্য' : 'Nutrition facts'}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip Popover */}
      {isOpen && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-full mb-2.5 z-40 w-60 sm:w-64 p-3.5 rounded-2xl border shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 ${getAlignClass()} ${
            isDark
              ? 'bg-[#180E08]/95 backdrop-blur-md border-amber-500/40 text-stone-200 shadow-black/80'
              : 'bg-white/98 backdrop-blur-md border-amber-800/25 text-stone-800 shadow-amber-950/20'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-2.5 border-b border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-amber-500/15 text-amber-400">
                <Sparkles className="w-3 h-3" />
              </span>
              <div>
                <h4 className="text-xs font-bold leading-tight font-bengali text-amber-400">
                  {language === 'bn' ? 'পুষ্টিগুণ তথ্য' : 'Nutrition Facts'}
                </h4>
                {itemName && (
                  <p className="text-[10px] opacity-75 truncate max-w-[140px] font-medium">
                    {itemName}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sm:hidden p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Serving size tag */}
          <div className={`text-[10px] px-2 py-0.5 rounded-md mb-2.5 font-medium flex items-center justify-between border ${
            isDark ? 'bg-amber-950/40 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-800/15 text-amber-900'
          }`}>
            <span>{language === 'bn' ? 'পরিবেশন পরিমাণ:' : 'Serving Size:'}</span>
            <span className="font-bold">{servingSize}</span>
          </div>

          {/* 3 Core Nutritional Metrics: Calories, Sugar, Protein */}
          <div className="grid grid-cols-3 gap-1.5 text-center mb-2">
            {/* Calories */}
            <div className={`p-1.5 rounded-xl border ${
              isDark ? 'bg-stone-900/80 border-amber-500/15' : 'bg-stone-50 border-stone-200/80'
            }`}>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-0.5">
                <Flame className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                  {language === 'bn' ? 'শক্তি' : 'Cal'}
                </span>
              </div>
              <div className="text-xs font-extrabold text-amber-400">
                {nutrition.calories}
              </div>
              <div className="text-[9px] opacity-60">kcal</div>
            </div>

            {/* Sugar */}
            <div className={`p-1.5 rounded-xl border ${
              isDark ? 'bg-stone-900/80 border-amber-500/15' : 'bg-stone-50 border-stone-200/80'
            }`}>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                  {language === 'bn' ? 'চিনি' : 'Sugar'}
                </span>
              </div>
              <div className="text-xs font-extrabold text-amber-400">
                {nutrition.sugar}g
              </div>
              <div className="text-[9px] opacity-60">
                {language === 'bn' ? 'গ্রাম' : 'grams'}
              </div>
            </div>

            {/* Protein */}
            <div className={`p-1.5 rounded-xl border ${
              isDark ? 'bg-stone-900/80 border-amber-500/15' : 'bg-stone-50 border-stone-200/80'
            }`}>
              <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-0.5">
                <Activity className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                  {language === 'bn' ? 'প্রোটিন' : 'Protein'}
                </span>
              </div>
              <div className="text-xs font-extrabold text-amber-400">
                {nutrition.protein}g
              </div>
              <div className="text-[9px] opacity-60">
                {language === 'bn' ? 'গ্রাম' : 'grams'}
              </div>
            </div>
          </div>

          {/* Optional fat detail if available */}
          {nutrition.fat !== undefined && (
            <div className="flex items-center justify-between text-[10px] px-2 py-0.5 mb-2 opacity-80 border-t border-amber-500/10 pt-1">
              <span>{language === 'bn' ? 'ফ্যাট (ঘি/দুধ):' : 'Total Fat:'}</span>
              <span className="font-semibold text-amber-400">{nutrition.fat}g</span>
            </div>
          )}

          {/* Footer note */}
          <div className="text-[9px] leading-tight text-center opacity-70 font-bengali">
            {language === 'bn'
              ? '১০০% খাঁটি গরুর দুধের ছানা ও উপাদানে প্রস্তুত'
              : 'Crafted with 100% pure cow milk chana & natural ghee'}
          </div>

          {/* Arrow Indicator */}
          <div
            className={`absolute top-full -mt-1.5 w-3 h-3 rotate-45 border-b border-r ${
              align === 'left' ? 'left-3' : align === 'right' ? 'right-3' : 'left-1/2 -translate-x-1/2'
            } ${
              isDark
                ? 'bg-[#180E08] border-amber-500/40'
                : 'bg-white border-amber-800/25'
            }`}
          />
        </div>
      )}
    </div>
  );
};
