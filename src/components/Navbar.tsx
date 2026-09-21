import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { GhoshLogo } from './GhoshLogo';
import { ShoppingBag, Sun, Moon, Menu, X, Phone, MapPin, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme, cartCount, setIsCartOpen, setIsAdminOpen, t, shopDetails } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: t.navHome },
    { href: '#bestsellers', label: t.bestSellersTitle },
    { href: '#sweets', label: t.navSweets },
    { href: '#snacks', label: t.navSnacks },
    { href: '#special', label: t.navSpecial },
    { href: '#celebration', label: language === 'bn' ? 'অনুষ্ঠানের অর্ডার' : 'Celebrations' },
    { href: '#about', label: t.navAbout },
    { href: '#contact', label: t.navContact },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? isDark
            ? 'bg-[#180E08]/92 backdrop-blur-md shadow-2xl border-b border-amber-500/20'
            : 'bg-[#FAF6F0]/92 backdrop-blur-md shadow-lg border-b border-amber-800/10'
          : isDark
          ? 'bg-[#180E08]/80 backdrop-blur-sm border-b border-amber-500/10'
          : 'bg-[#FAF6F0]/80 backdrop-blur-sm border-b border-amber-800/5'
      }`}
    >
      {/* Top micro bar for telephone & shop notice */}
      <div
        className={`w-full py-1 px-4 text-xs flex justify-between items-center transition-colors border-b ${
          isDark
            ? 'bg-[#120B06] text-amber-200/90 border-amber-900/30'
            : 'bg-[#F2E8DC] text-amber-950/90 border-amber-200/50'
        }`}
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span>{language === 'bn' ? shopDetails.addressBn : shopDetails.addressEn}</span>
            </span>
            <span className="hidden md:inline text-amber-500/50">•</span>
            <span className="hidden md:inline font-bengali text-amber-400">
              {language === 'bn' ? 'শুদ্ধতা ও স্বাদের প্রতিশ্রুতি' : 'Traditional Taste Since Always'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${shopDetails.phone}`}
              className="flex items-center gap-1 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{shopDetails.phone}</span>
            </a>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="opacity-70 hover:opacity-100 text-[11px] underline decoration-dotted ml-2"
              title="Edit prices or details"
            >
              {language === 'bn' ? 'ম্যানেজ' : 'Manage'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-22">
          {/* Brand Logo */}
          <a href="#home" className="flex items-center group py-1" id="nav-brand-logo">
            <GhoshLogo theme={theme} variant="full" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isDark
                    ? 'text-stone-200 hover:text-amber-300 hover:bg-amber-950/40'
                    : 'text-stone-800 hover:text-amber-800 hover:bg-amber-100/70'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Controls: Language + Theme Switcher + Order CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div
              className={`flex items-center p-0.5 rounded-full border text-xs font-semibold ${
                isDark
                  ? 'bg-stone-900/80 border-amber-500/30 text-stone-300'
                  : 'bg-stone-100 border-amber-900/20 text-stone-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                  language === 'bn'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-sm'
                    : 'hover:text-amber-400'
                }`}
                title="বাংলা ভাষায় দেখুন"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-sm'
                    : 'hover:text-amber-400'
                }`}
                title="View in English"
              >
                EN
              </button>
            </div>

            {/* Theme Toggle (🌙 DARK | ☀️ BRIGHT) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
                isDark
                  ? 'bg-stone-900/90 border-amber-500/40 text-amber-200 hover:border-amber-400'
                  : 'bg-amber-50 border-amber-700/30 text-amber-900 hover:border-amber-700'
              }`}
              title={isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="hidden sm:inline">DARK</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span className="hidden sm:inline">BRIGHT</span>
                </>
              )}
            </button>

            {/* Order Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              id="header-order-btn"
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 shadow-md hover:shadow-amber-500/20 transition-all duration-200 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              <span className="hidden xs:inline">{t.navOrderNow}</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-950 text-amber-300 font-bold text-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden p-2 rounded-xl border ${
                isDark
                  ? 'border-amber-500/30 text-amber-300 bg-stone-900/60'
                  : 'border-amber-800/20 text-stone-800 bg-amber-100/50'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`xl:hidden px-4 pt-3 pb-6 border-b transition-all ${
            isDark
              ? 'bg-[#180E08] border-amber-500/20 text-stone-200'
              : 'bg-[#FAF6F0] border-amber-800/15 text-stone-900'
          }`}
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl font-medium text-base transition-colors ${
                  isDark ? 'hover:bg-amber-950/40 text-stone-200' : 'hover:bg-amber-100/70 text-stone-800'
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 border-t border-amber-500/20 flex flex-col gap-2">
              <a
                href={`tel:${shopDetails.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>{shopDetails.phone} (সরাসরি কল করুন)</span>
              </a>
              <a
                href={shopDetails.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-500/10 border border-stone-500/30 text-stone-300 font-medium text-sm"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'গুগল ম্যাপে রাস্তা দেখুন' : 'Get Directions on Google Maps'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
