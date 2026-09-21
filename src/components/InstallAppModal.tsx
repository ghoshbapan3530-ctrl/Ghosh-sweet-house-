import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, Copy, ExternalLink, X, Sparkles, Share2 } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { language, theme, shopDetails } = useShop();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-cnfjlldbcge3dufoo3ota4-588006108808.asia-southeast1.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl relative flex flex-col ${
          isDark
            ? 'bg-[#180E08] border-amber-500/40 text-stone-200'
            : 'bg-[#FFFDF9] border-amber-800/25 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-bengali leading-snug">
                {language === 'bn' ? 'অ্যান্ড্রয়েড অ্যাপ ইনস্টল / APK' : 'Install Android App / APK'}
              </h3>
              <p className="text-xs text-amber-500 font-semibold font-royal">
                GHOSH SWEET HOUSE (ঘোষ মিষ্টান্ন ভাণ্ডার)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-500/20 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Method 1: Instant Native PWA Install */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-800/20'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 uppercase tracking-wide">
                {language === 'bn' ? 'পদ্ধতি ১: তাৎক্ষণিক ইনস্টল' : 'Method 1: Instant Install'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সবচেয়ে সহজ ও দ্রুত' : 'Fastest & Recommended'}</span>
              </span>
            </div>

            <h4 className="font-bold text-base font-bengali mb-1">
              {language === 'bn' ? 'ফোনে সরাসরি অ্যাপ হিসেবে ইনস্টল করুন' : 'Install Directly to Home Screen'}
            </h4>
            <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
              {language === 'bn'
                ? 'কোনো আলাদা APK ফাইল খোঁজার দরকার নেই! গুগল ক্রোম (Google Chrome) ব্রাউজার থেকে সরাসরি এটি আপনার মোবাইলের স্ক্রিনে ফুলস্ক্রিন অ্যাপ আকারে ইনস্টল হয়ে যাবে।'
                : 'No manual APK download required. Installs directly onto your Android device with official logo, offline caching, and fullscreen experience.'}
            </p>

            {isInstalled ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>{language === 'bn' ? 'অ্যাপটি ইতিমধ্যেই আপনার ডিভাইসে ইনস্টল রয়েছে!' : 'App is already installed on this device!'}</span>
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={handleNativeInstall}
                id="modal-install-pwa-button"
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/30 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'bn' ? 'এখনই ইনস্টল করুন (Install App)' : 'Install App Now'}</span>
              </button>
            ) : isIOS ? (
              <div className="p-3.5 rounded-xl bg-stone-900/60 border border-amber-500/20 text-xs text-stone-300 space-y-1.5 font-bengali">
                <p className="font-bold text-amber-300">iPhone / iPad এ যেভাবে ইনস্টল করবেন:</p>
                <p>১. Safari ব্রাউজারের নিচে <strong>Share (শেয়ার)</strong> বাটনে চাপ দিন।</p>
                <p>২. স্ক্রল করে <strong>"Add to Home Screen"</strong> বেছে নিন।</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-stone-900/60 border border-amber-500/20 text-xs text-stone-300 space-y-1.5 font-bengali">
                <p className="font-bold text-amber-300">অ্যান্ড্রয়েড ফোনে ইনস্টল করার সহজ নিয়ম:</p>
                <p>১. মোবাইলের Chrome ব্রাউজারের উপরে ডানদিকের <strong>তিনটি ডট (⋮)</strong> এ চাপ দিন।</p>
                <p>২. <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> এ চাপ দিন।</p>
              </div>
            )}
          </div>

          {/* Method 2: Package APK with PWABuilder (For users wanting a standalone .apk installer) */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-stone-900/60 border-amber-500/20' : 'bg-stone-50 border-stone-200'
          }`}>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-700 text-stone-200 uppercase tracking-wide inline-block mb-2">
              {language === 'bn' ? 'পদ্ধতি ২: স্ট্যান্ডঅ্যালন APK প্যাকেজ' : 'Method 2: Generate Standalone .APK'}
            </span>

            <h4 className="font-bold text-base font-bengali mb-1">
              {language === 'bn' ? 'PWABuilder দিয়ে সরাসরি APK তৈরি করুন' : 'Generate Android .APK Package'}
            </h4>
            <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
              {language === 'bn'
                ? 'আমাদের ওয়েবসাইটটি PWA এবং Web App Manifest দিয়ে সম্পূর্ণ কনফিগার করা আছে। আপনি Microsoft PWABuilder দিয়ে ১ ক্লিকে অ্যান্ড্রয়েড APK প্যাকেজ ডাউনলোড করে ফোনে ইনস্টল বা প্লে স্টোরে আপলোড করতে পারবেন।'
                : 'Our website includes full PWA and Manifest compliance. You can generate a signed Android APK package using Microsoft PWABuilder in 1 click.'}
            </p>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs border border-amber-500/40 text-amber-300 hover:bg-amber-950/40 transition-colors w-full"
            >
              <span>{language === 'bn' ? 'PWABuilder-এ APK তৈরি করুন' : 'Generate APK via PWABuilder'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Share App URL with Customers */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-amber-400 mb-2 font-bengali">
              {language === 'bn' ? 'গ্রাহকদের পাঠানোর জন্য ওয়েবসাইটের লিংক:' : 'Shareable App Link for Customers:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none select-all ${
                  isDark ? 'bg-stone-950 border-stone-700 text-stone-200' : 'bg-white border-stone-300 text-stone-800'
                }`}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow transition-all whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি লিংক' : 'Copy')}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-500/20 bg-stone-950/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
