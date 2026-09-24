import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Sparkles, Gift, ShieldCheck, User, Phone, ArrowRight, CheckCircle2, AlertCircle, KeyRound, RefreshCw } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    sendOtp,
    verifyOtpAndAuthenticate,
    language,
    theme,
    setIsDashboardOpen
  } = useShop();

  const isDark = theme === 'dark';

  // Step state: 'phone' -> 'otp' -> (optional 'name')
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSentHint, setOtpSentHint] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setStep('phone');
    setErrorMsg('');
    setSuccessMsg('');
    setOtpSentHint(null);
  };

  // Step 1: Send OTP to mobile
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const cleanMobile = mobile.replace(/[^0-9]/g, '').slice(-10);

    if (cleanMobile.length < 10) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(cleanMobile);
      if (!res.success) {
        setErrorMsg(res.message);
        setIsLoading(false);
        return;
      }

      setOtpSentHint(res.testOtp || '123456');
      setStep('otp');
      setSuccessMsg(
        language === 'bn'
          ? `+91 ${cleanMobile} নম্বরে ওটিপি পাঠানো হয়েছে!`
          : `OTP sent to +91 ${cleanMobile}!`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error sending OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (otpCode.trim().length < 6) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে ৬ সংখ্যার ওটিপি কোড লিখুন।'
          : 'Please enter the 6-digit OTP code.'
      );
      return;
    }

    // If in signup mode and name is not provided yet, transition to name step
    if (authModalMode === 'signup' && !name.trim()) {
      setStep('name');
      return;
    }

    await completeVerification(name.trim());
  };

  // Step 3: Complete verification and profile linking
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg(
        language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.'
      );
      return;
    }

    await completeVerification(name.trim());
  };

  const completeVerification = async (customerName: string) => {
    setIsLoading(true);
    try {
      const res = await verifyOtpAndAuthenticate(mobile, otpCode.trim(), customerName);
      if (!res.success) {
        setErrorMsg(res.message || 'OTP verification failed');
        setIsLoading(false);
        return;
      }

      if (res.isNew) {
        setSuccessMsg(
          language === 'bn'
            ? 'অভিনন্দন! আপনার প্রোফাইল তৈরি হয়েছে এবং ১০ মিষ্টি পয়েন্ট (₹৫.০০) স্বাগত উপহার যোগ হয়েছে!'
            : 'Congratulations! Your profile is created with 10 Sweet Points (₹5.00) welcome bonus!'
        );
      } else {
        setSuccessMsg(
          language === 'bn'
            ? 'স্বাগতম! আপনার লয়্যালটি প্রোফাইল সফলভাবে লোড হয়েছে।'
            : 'Welcome back! Your loyalty profile is loaded.'
        );
      }

      setTimeout(() => {
        handleClose();
        setIsDashboardOpen(true);
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoAccount = async () => {
    setMobile('9733363562');
    setOtpCode('123456');
    setName('সৌমেন দাস (Soumen Das)');
    setIsLoading(true);
    await verifyOtpAndAuthenticate('9733363562', '123456', 'সৌমেন দাস (Soumen Das)');
    setIsLoading(false);
    handleClose();
    setIsDashboardOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      id="auth-modal"
    >
      <div
        className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 max-h-[92vh] flex flex-col ${
          isDark
            ? 'bg-[#180E08] border-amber-500/30 text-amber-50'
            : 'bg-white border-amber-900/15 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon / Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/20 hover:bg-stone-950/30 text-stone-950 transition-colors"
            title="Close"
            id="auth-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-950 text-amber-300 flex items-center gap-1.5 shadow-sm">
              <Gift className="w-3.5 h-3.5" />
              {language === 'bn' ? 'লয়্যালটি পুরস্কার' : 'Loyalty Rewards'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-200 text-amber-950">
              {language === 'bn' ? '১০ পয়েন্ট ফ্রি' : '10 Pts Free'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-bengali leading-tight">
            {authModalMode === 'signup'
              ? language === 'bn'
                ? 'সাইন আপ ও মিষ্টি পয়েন্টস অর্জন করুন'
                : 'Sign Up & Get Sweet Points'
              : language === 'bn'
              ? 'গ্রাহক অ্যাকাউন্টে লগইন'
              : 'Customer Account Login'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-stone-900/90 mt-1">
            {language === 'bn'
              ? 'মোবাইল ওটিপি যাচাই করে সুরক্ষিতভাবে পয়েন্ট ও ৫% ছাড় উপভোগ করুন।'
              : 'Verify your phone via OTP to access your Sweet Points & 5% OFF.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className={`flex border-b text-xs sm:text-sm font-bold flex-shrink-0 ${
            isDark ? 'border-amber-500/20 bg-stone-950/60' : 'border-amber-900/10 bg-amber-50/50'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              setStep('phone');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            id="auth-tab-signup"
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-bengali flex items-center justify-center gap-1.5 ${
              authModalMode === 'signup'
                ? 'border-amber-500 text-amber-400 font-extrabold bg-amber-500/10'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন সাইন আপ (+১০ পয়েন্ট)' : 'Sign Up (+10 Pts)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setStep('phone');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            id="auth-tab-login"
            className={`flex-1 py-3 text-center transition-colors border-b-2 font-bengali flex items-center justify-center gap-1.5 ${
              authModalMode === 'login'
                ? 'border-amber-500 text-amber-400 font-extrabold bg-amber-500/10'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগইন (ওটিপি)' : 'Log In (OTP)'}</span>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Rules & Benefits Banner */}
          <div
            className={`p-3.5 rounded-2xl border text-xs space-y-1.5 leading-relaxed ${
              isDark ? 'bg-amber-950/20 border-amber-500/20 text-amber-200/90' : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="font-bold font-bengali flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সুইট পয়েন্টস ও ডিসকাউন্ট পলিসি:' : 'Sweet Points & Discount Policy:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 font-medium">
              <div>🍬 {language === 'bn' ? '১০ মিষ্টি পয়েন্ট (₹৫.০০) সাইন আপেই' : '10 Sweet Points (₹5.00) on signup'}</div>
              <div>🎁 {language === 'bn' ? 'প্রথম ৫টি অর্ডারে ৫% ছাড় (মিনিমাম ₹১০০)' : '5% OFF first 5 orders (Min ₹100)'}</div>
              <div>⭐ {language === 'bn' ? 'প্রতি ₹১০০ ক্রয়ে ৫ মিষ্টি পয়েন্ট' : 'Earn 5 points per ₹100 spent'}</div>
              <div>💰 {language === 'bn' ? '১ মিষ্টি পয়েন্ট = ₹০.৫০ ক্যাশ ছাড়' : '1 Sweet Point = ₹0.50 discount'}</div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-500 text-xs sm:text-sm flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Mobile Number */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4" id="auth-phone-form">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  {language === 'bn' ? '১০ সংখ্যার মোবাইল নম্বর *' : 'Mobile Number (10 Digits) *'}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 flex items-center gap-1 text-sm font-semibold opacity-60">
                    <Phone className="w-4 h-4" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9733363562"
                    className={`w-full pl-16 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors font-mono tracking-wider ${
                      isDark
                        ? 'bg-stone-900 border-amber-900/60 focus:border-amber-400 text-stone-100 placeholder-stone-500'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900 placeholder-stone-400'
                    }`}
                  />
                </div>
                <span className="text-[11px] opacity-60 mt-1 block">
                  {language === 'bn'
                    ? 'আপনার মোবাইল নম্বরে ৬ সংখ্যার ওটিপি ভেরিফিকেশন কোড পাঠানো হবে।'
                    : 'A 6-digit OTP verification code will be sent to this number.'}
                </span>
              </div>

              {authModalMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                    {language === 'bn' ? 'গ্রাহকের পুরো নাম (ঐচ্ছিক)' : 'Full Name (Optional)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: সৌমেন দাস' : 'e.g. Soumen Das'}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                        isDark
                          ? 'bg-stone-900 border-amber-900/60 focus:border-amber-400 text-stone-100 placeholder-stone-500'
                          : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900 placeholder-stone-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                id="send-otp-btn"
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4 text-stone-950" />
                )}
                <span>
                  {language === 'bn' ? 'ওটিপি পাঠান (Send OTP)' : 'Send OTP'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP Code */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4" id="auth-otp-form">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-80">
                    {language === 'bn' ? '৬ সংখ্যার ওটিপি কোড *' : '6-Digit OTP Code *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    {language === 'bn' ? 'নম্বর পরিবর্তন' : 'Change Number'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-base outline-none transition-colors font-mono tracking-widest text-center ${
                      isDark
                        ? 'bg-stone-900 border-amber-900/60 focus:border-amber-400 text-stone-100 placeholder-stone-500'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900 placeholder-stone-400'
                    }`}
                  />
                </div>
                {otpSentHint && (
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    ⚡ {language === 'bn' ? `পরীক্ষামূলক ওটিপি কোড: ${otpSentHint}` : `Test OTP Code: ${otpSentHint}`}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                id="verify-otp-btn"
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-stone-950" />
                )}
                <span>
                  {language === 'bn' ? 'ওটিপি যাচাই করুন (Verify OTP)' : 'Verify OTP'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-xs text-amber-400/90 hover:text-amber-300 underline"
                >
                  {language === 'bn' ? 'ওটিপি পাননি? পুনরায় পাঠান' : "Didn't receive OTP? Resend"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter Name (for new signups without name) */}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4" id="auth-name-form">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">
                  {language === 'bn' ? 'আপনার পুরো নাম লিখুন *' : 'Enter Your Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: সৌমেন দাস' : 'e.g. Soumen Das'}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      isDark
                        ? 'bg-stone-900 border-amber-900/60 focus:border-amber-400 text-stone-100 placeholder-stone-500'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500 text-stone-900 placeholder-stone-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                id="create-profile-btn"
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-stone-950" />
                )}
                <span>
                  {language === 'bn'
                    ? 'প্রোফাইল তৈরি করুন ও ১০ পয়েন্ট নিন'
                    : 'Create Profile & Get 10 Points'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Option for testing */}
          <div className="pt-3 border-t border-amber-500/20 text-center">
            <button
              type="button"
              onClick={handleUseDemoAccount}
              id="demo-account-login-btn"
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                isDark
                  ? 'border-amber-500/30 text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/40'
                  : 'border-amber-800/20 text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              ⚡ {language === 'bn' ? 'টেস্ট অ্যাকাউন্ট (সৌমেন দাস: ২৫ পয়েন্ট, ২/৫ অর্ডার)' : 'Test with Sample Account (Soumen: 25 Pts, 2/5 Orders)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
