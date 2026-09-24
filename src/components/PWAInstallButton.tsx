import React, { useState } from 'react';
import { Download, Sparkles, X, Smartphone, CheckCircle, ExternalLink, AlertTriangle, ShieldCheck, HelpCircle, ArrowLeft } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useShop } from '../context/ShopContext';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'nav' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const { language, theme } = useShop();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [defaultTab, setDefaultTab] = useState<'steps' | 'security'>('steps');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const isDark = theme === 'dark';

  // If already installed as standalone PWA or dismissed for banner, don't show
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        // User dismissed prompt or it failed
      }
    } else {
      // Browser didn't provide beforeinstallprompt (e.g. desktop safari, iframe, or already prompted)
      setDefaultTab('steps');
      setShowGuideModal(true);
    }
  };

  const handleSecurityHelpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDefaultTab('security');
    setShowGuideModal(true);
  };

  const buttonText = language === 'bn' 
    ? '📱 Ghosh Sweet House অ্যাপ ইনস্টল করুন' 
    : '📱 Install Ghosh Sweet House App';

  // Compact variant for Navbar
  if (variant === 'nav') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          id="pwa-install-nav-btn"
          aria-label={buttonText}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 border cursor-pointer ${
            isDark
              ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
          } ${className}`}
        >
          <span className="text-sm">📱</span>
          <span className="font-semibold truncate max-w-[170px] xl:max-w-none">
            {language === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}
          </span>
          <span className="px-1.5 py-0.2 text-[9px] uppercase tracking-wider rounded bg-amber-500 text-stone-950 font-black">
            PWA
          </span>
        </button>

        {showGuideModal && (
          <InstallGuideModal
            onClose={() => setShowGuideModal(false)}
            language={language}
            isDark={isDark}
            isIOS={isIOS}
            initialTab={defaultTab}
          />
        )}
      </>
    );
  }

  // Top banner variant for mobile
  if (variant === 'banner') {
    if (isDismissed) return null;

    return (
      <>
        <div
          id="pwa-install-banner"
          className={`w-full py-2 px-3 sm:px-4 border-b flex items-center justify-between gap-2 text-xs transition-all z-30 ${
            isDark
              ? 'bg-gradient-to-r from-[#20130B] via-[#2A180E] to-[#20130B] border-amber-500/25 text-amber-200'
              : 'bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-amber-200 text-amber-950'
          } ${className}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-shrink-0">📱</span>
            <div className="truncate">
              <span className="font-bold block truncate">
                {language === 'bn' ? 'ঘোষ সুইট হাউস অ্যান্ড্রয়েড অ্যাপ' : 'Ghosh Sweet House Android App'}
              </span>
              <span className="text-[10px] opacity-80 block truncate">
                {language === 'bn' ? 'দ্রুত অর্ডার • অফলাইন সাপোর্ট • কোনো বিজ্ঞাপন নেই' : 'Fast Ordering • Offline Support • 100% Safe'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleSecurityHelpClick}
              id="pwa-security-help-badge"
              title="Security Test Help"
              className="hidden xs:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>{language === 'bn' ? 'সিকিউরিটি সতর্কতা?' : 'Security test?'}</span>
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              id="pwa-banner-install-btn"
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow transition-all active:scale-95 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss"
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showGuideModal && (
          <InstallGuideModal
            onClose={() => setShowGuideModal(false)}
            language={language}
            isDark={isDark}
            isIOS={isIOS}
            initialTab={defaultTab}
          />
        )}
      </>
    );
  }

  // Primary prominent standalone button
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          id="pwa-install-primary-btn"
          className={`group relative inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-amber-500/25 active:scale-95 overflow-hidden cursor-pointer ${
            isDark
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 border border-amber-300/40 hover:brightness-105'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 border border-amber-600/30 hover:brightness-105'
          } ${className}`}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">📱</span>
          <span className="font-extrabold tracking-wide font-bengali">
            {buttonText}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-stone-950 text-amber-400 text-[10px] font-black uppercase tracking-wider">
            PWA
          </span>
        </button>

        <button
          type="button"
          onClick={handleSecurityHelpClick}
          id="pwa-guide-subtext-btn"
          className="text-xs text-amber-400/90 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 font-bengali transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>
            {language === 'bn'
              ? 'ফোনে "Security test: Unable to find information" দেখাচ্ছে? এখানে ক্লিক করুন'
              : 'Seeing "Security test: Unable to find information"? Click here for guide'}
          </span>
        </button>
      </div>

      {showGuideModal && (
        <InstallGuideModal
          onClose={() => setShowGuideModal(false)}
          language={language}
          isDark={isDark}
          isIOS={isIOS}
          initialTab={defaultTab}
        />
      )}
    </>
  );
};

interface InstallGuideModalProps {
  onClose: () => void;
  language: string;
  isDark: boolean;
  isIOS: boolean;
  initialTab?: 'steps' | 'security';
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  onClose,
  language,
  isDark,
  isIOS,
  initialTab = 'steps'
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'security'>(initialTab);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? 'bg-[#1D1109] border-amber-500/40 text-stone-100'
            : 'bg-white border-amber-800/20 text-stone-800'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-stone-500/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0">
            📱
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-bengali leading-snug text-amber-400">
              {language === 'bn' ? 'অ্যাপ ইনস্টলেশন ও সিকিউরিটি টেস্ট গাইড' : 'App Install & Security Test Guide'}
            </h3>
            <p className="text-xs opacity-75 font-bengali">
              Ghosh Sweet • Official Progressive Web App (PWA)
            </p>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-900/40 border border-amber-500/20 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'steps'
                ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '১. ইনস্টল করার নিয়ম' : '1. Install Steps'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>{language === 'bn' ? '২. সিকিউরিটি টেস্ট সতর্কতা?' : '2. Security Test Warning?'}</span>
          </button>
        </div>

        {activeTab === 'steps' ? (
          <>
            {/* Step-by-step instructions */}
            <div className="space-y-3 mb-5 text-sm font-bengali">
              {isIOS ? (
                <>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'}`}>
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">১</span>
                    <div>
                      <p className="font-semibold">Safari ব্রাউজারের নিচের <strong>Share</strong> বোতামে চাপুন।</p>
                      <p className="text-xs opacity-75">Tap the Safari Share button at the bottom.</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'}`}>
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">২</span>
                    <div>
                      <p className="font-semibold">মেনু থেকে <strong>Add to Home Screen</strong> নির্বাচন করুন।</p>
                      <p className="text-xs opacity-75">Select "Add to Home Screen" from the menu.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'}`}>
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">১</span>
                    <div>
                      <p className="font-semibold">
                        {language === 'bn' ? 'Chrome ব্রাউজারের উপরে ডানদিকের তিনটি ডট (⋮) মেনুতে চাপুন।' : 'Tap the three dots (⋮) menu in Chrome.'}
                      </p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'}`}>
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">২</span>
                    <div>
                      <p className="font-semibold">
                        {language === 'bn' ? 'মেনু থেকে "Install app" বা "Add to Home screen" নির্বাচন করুন।' : 'Select "Install app" or "Add to Home screen".'}
                      </p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'}`}>
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">৩</span>
                    <div>
                      <p className="font-semibold">
                        {language === 'bn' ? 'হোম স্ক্রিনে সরাসরি Ghosh Sweet আইকন তৈরি হবে এবং মিষ্টি বুকিং করতে পারবেন।' : 'Ghosh Sweet will be added to your home screen instantly!'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick alert to check security warning if encountered */}
            <div
              onClick={() => setActiveTab('security')}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs mb-5 cursor-pointer transition-all ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15 text-amber-200'
                  : 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-semibold">
                  {language === 'bn'
                    ? 'ইনস্টল করার সময় "Security test: Unable to find information" দেখাচ্ছে?'
                    : 'Got a "Security test: Unable to find information" notice?'}
                </span>
              </div>
              <span className="text-[11px] underline font-bold whitespace-nowrap text-amber-400">
                {language === 'bn' ? 'সমাধান দেখুন →' : 'See Fix →'}
              </span>
            </div>
          </>
        ) : (
          /* Security Warning Troubleshooting Tab */
          <div className="space-y-4 mb-5 text-xs sm:text-sm font-bengali">
            {/* The Notice Explanation Box */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-950/30 border-amber-500/30' : 'bg-amber-50 border-amber-300'}`}>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-400 text-sm mb-1">
                    {language === 'bn'
                      ? '⚠️ "Unable to find information for this app" — এটি কোনো এরর নয়!'
                      : '⚠️ "Unable to find information for this app" is NOT an error!'}
                  </h4>
                  <p className="opacity-90 leading-relaxed text-xs">
                    {language === 'bn'
                      ? 'Xiaomi (Redmi/Poco), Realme বা Vivo ফোনে গুগল ক্রোম থেকে কোনো PWA বা WebAPK ইনস্টল করলে তাদের নিজস্ব "Security test" এই সতর্কবার্তা ও বিজ্ঞাপন দেখায়। কারণ অ্যাপটি তাদের চায়নিজ GetApps স্টোর থেকে ডাউনলোড করা হয়নি।'
                      : 'Phones like Xiaomi, Redmi, Poco, Realme, and Vivo have a built-in security scanner that automatically scans newly added web apps. Because Ghosh Sweet is installed directly via Google Chrome rather than their proprietary store (GetApps), it shows this caution message along with ads.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-step resolution */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                {language === 'bn' ? 'কীভাবে অ্যাপটি চালু করবেন (৩টি সহজ ধাপ):' : 'How to open & use Ghosh Sweet (3 Easy Steps):'}
              </h5>

              <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/70 border-stone-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ১
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm">
                    {language === 'bn'
                      ? 'উপরে বাঁদিকের তীর (← Security test) চাপুন অথবা ফোনের Home বাটন চাপুন।'
                      : 'Tap the top-left Back arrow (←) or press your phone\'s Home button.'}
                  </p>
                  <p className="text-[11px] opacity-75">
                    {language === 'bn'
                      ? 'নিচের Rapido বা অন্যান্য গেমসের বিজ্ঞাপনে ক্লিক করার প্রয়োজন নেই।'
                      : 'Ignore the ads (Rapido, Games) shown by the phone manufacturer.'}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/70 border-stone-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ২
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm">
                    {language === 'bn'
                      ? 'আপনার ফোনের হোম স্ক্রিন বা অ্যাপ ড্রয়ারে দেখুন "Ghosh Sweet" আইকন রয়েছে।'
                      : 'Look at your home screen or app drawer: "Ghosh Sweet" is already installed!'}
                  </p>
                  <p className="text-[11px] opacity-75">
                    {language === 'bn'
                      ? 'অ্যাপটি ইতিমধ্যে সফলভাবে আপনার ফোনে ইনস্টল হয়ে গেছে।'
                      : 'The app has already completed installation onto your phone.'}
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-stone-900/70 border-stone-700/60' : 'bg-stone-50 border-stone-200'}`}>
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  ৩
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm">
                    {language === 'bn'
                      ? 'আইকনে ক্লিক করে সরাসরি ফুল-স্ক্রিনে মিষ্টি ও খাবার অর্ডার করুন।'
                      : 'Tap the Ghosh Sweet icon to launch in full-screen standalone mode.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 100% Safe Badge */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>
                {language === 'bn'
                  ? '১০০% সুরক্ষিত ও খাঁটি: Ghosh Sweet House-এর সুরক্ষিত অফিসিয়াল প্রোগ্রেসিভ ওয়েব অ্যাপ।'
                  : '100% Safe & Secure: Official verified web application for Ghosh Sweet House.'}
              </span>
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="flex items-center justify-around py-2.5 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs mb-4">
          <div className="flex items-center gap-1.5 text-amber-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-bold">{language === 'bn' ? 'তাত্ক্ষণিক লোডিং' : 'Instant Launch'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-bold">{language === 'bn' ? 'অফলাইন সুবিধা' : 'Offline Mode'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-bold">{language === 'bn' ? 'ফুল স্ক্রিন' : 'Standalone'}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {language === 'bn' ? 'বুঝেছি (বন্ধ করুন)' : 'Got It, Close'}
        </button>
      </div>
    </div>
  );
};

