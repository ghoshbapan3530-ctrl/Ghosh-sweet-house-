import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  User,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Mail,
  RefreshCw,
  Gift,
  KeyRound,
  FileCheck2
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    sendOtp,
    verifyOtpAndAuthenticate,
    completeProfileForCustomer,
    language,
    theme,
    setIsDashboardOpen
  } = useShop();

  const isDark = theme === 'dark';

  // Screen modes:
  // 'selection': The 2-button welcome chooser screen
  // 'signup_form': The New Customer registration form
  // 'signin_form': The Existing Customer phone input form
  // 'otp_verification': The 6-digit OTP verification screen
  // 'complete_profile': For existing auth user whose profile is missing in Firestore
  const [screen, setScreen] = useState<'selection' | 'signup_form' | 'signin_form' | 'otp_verification' | 'complete_profile'>('selection');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pinCode, setPinCode] = useState('');

  // OTP Fields
  const [otpCode, setOtpCode] = useState('');
  const [activeFlow, setActiveFlow] = useState<'signup' | 'signin'>('signup');

  // Feedback & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSentHint, setOtpSentHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync with authModalMode if opened with specific intent
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setOtpCode('');
      if (authModalMode === 'signup') {
        setScreen('signup_form');
        setActiveFlow('signup');
      } else if (authModalMode === 'login') {
        setScreen('signin_form');
        setActiveFlow('signin');
      } else {
        setScreen('selection');
      }
    }
  }, [isAuthModalOpen, authModalMode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setScreen('selection');
    setErrorMsg('');
    setSuccessMsg('');
    setOtpSentHint(null);
  };

  const sanitizeMobile = (val: string) => {
    return val.replace(/[^0-9]/g, '').slice(0, 10);
  };

  const sanitizePin = (val: string) => {
    return val.replace(/[^0-9]/g, '').slice(0, 6);
  };

  // =========================================================================
  // FLOW 1: NEW CUSTOMER — SEND OTP
  // =========================================================================
  const handleNewCustomerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your Full Name.');
      return;
    }

    const cleanMobile = sanitizeMobile(mobileNumber);
    if (cleanMobile.length !== 10) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ডেলিভারি ঠিকানা লিখুন।' : 'Please provide your Delivery Address.');
      return;
    }

    if (pinCode.trim().length < 6) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে সঠিক ৬ সংখ্যার পিন কোড লিখুন।' : 'Please enter a valid 6-digit PIN code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(cleanMobile);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      setOtpSentHint(res.testOtp || '123456');
      setActiveFlow('signup');
      setScreen('otp_verification');
      setResendCooldown(30);
      setSuccessMsg(
        language === 'bn'
          ? `+91 ${cleanMobile} নম্বরে ওটিপি পাঠানো হয়েছে!`
          : `OTP sent to +91 ${cleanMobile}!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // FLOW 2: EXISTING CUSTOMER — SEND OTP
  // =========================================================================
  const handleExistingCustomerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanMobile = sanitizeMobile(mobileNumber);
    if (cleanMobile.length !== 10) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(cleanMobile);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      setOtpSentHint(res.testOtp || '123456');
      setActiveFlow('signin');
      setScreen('otp_verification');
      setResendCooldown(30);
      setSuccessMsg(
        language === 'bn'
          ? `+91 ${cleanMobile} নম্বরে ওটিপি পাঠানো হয়েছে!`
          : `OTP sent to +91 ${cleanMobile}!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // FLOW 3: VERIFY OTP CODE
  // =========================================================================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 4) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ওটিপি কোড লিখুন।' : 'Please enter the OTP verification code.');
      return;
    }

    const cleanMobile = sanitizeMobile(mobileNumber);

    setIsLoading(true);
    try {
      // If we are in New Customer flow, pass the completed registration data
      const newCustomerPayload = activeFlow === 'signup'
        ? {
            name: fullName.trim(),
            email: email.trim(),
            address: deliveryAddress.trim(),
            pinCode: pinCode.trim()
          }
        : undefined;

      const res = await verifyOtpAndAuthenticate(cleanMobile, cleanOtp, newCustomerPayload);

      if (!res.success) {
        setErrorMsg(res.message || 'OTP verification failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check whether profile exists
      if (res.customer) {
        // Customer profile exists in Firestore
        setSuccessMsg(
          res.isNew
            ? (language === 'bn' ? 'স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।' : 'Welcome to Ghosh Sweet House! Your account has been created.')
            : (language === 'bn' ? 'স্বাগতম! লগইন সফল হয়েছে।' : 'Welcome back! Login successful.')
        );

        setTimeout(() => {
          handleClose();
          setIsDashboardOpen(true);
        }, 900);
      } else {
        // First-Time / Missing Profile for this phone number: Prompt to complete profile
        setScreen('complete_profile');
        setSuccessMsg(
          language === 'bn'
            ? 'স্বাগতম ঘোষ মিষ্টান্ন ভাণ্ডারে! অনুগ্রহ করে আপনার প্রোফাইল সম্পূর্ণ করুন।'
            : 'Welcome to Ghosh Sweet House! Please complete your profile.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // FLOW 4: COMPLETE PROFILE (If existing Auth account has no profile in Firestore)
  // =========================================================================
  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your Full Name.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await completeProfileForCustomer({
        name: fullName.trim(),
        email: email.trim(),
        address: deliveryAddress.trim(),
        pinCode: pinCode.trim()
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Could not save profile in Firestore.');
        return;
      }

      setSuccessMsg(
        language === 'bn'
          ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! অ্যাকাউন্টে প্রবেশ করা হচ্ছে...'
          : 'Profile saved successfully! Redirecting to My Account...'
      );

      setTimeout(() => {
        handleClose();
        setIsDashboardOpen(true);
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP helper
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await sendOtp(sanitizeMobile(mobileNumber));
      if (res.success) {
        setOtpSentHint(res.testOtp || '123456');
        setResendCooldown(30);
        setSuccessMsg(language === 'bn' ? 'নতুন ওটিপি পাঠানো হয়েছে!' : 'New OTP has been sent!');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      id="auth-modal"
    >
      <div
        className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 max-h-[92vh] flex flex-col ${
          isDark
            ? 'bg-[#180E08] border-amber-500/30 text-amber-50'
            : 'bg-white border-amber-900/15 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Invisible ReCAPTCHA container for Firebase Phone Auth */}
        <div id="recaptcha-container" />

        {/* Mobile Pull-Down Indicator */}
        <div className="w-12 h-1 bg-stone-700/40 rounded-full mx-auto mt-2 -mb-1 sm:hidden z-10" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/20 hover:bg-stone-950/30 text-stone-950 transition-colors"
            title="Close"
            id="auth-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-950 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-950 font-serif">
              GHOSH SWEET HOUSE
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-serif leading-tight">
            {language === 'bn' ? 'স্বাগতম!' : 'Welcome!'}
          </h2>
          <p className="text-xs font-semibold text-stone-900/90 mt-0.5">
            {language === 'bn' ? 'ঘোষ মিষ্টান্ন ভাণ্ডার — খাঁটি মিষ্টি ও ঐতিহ্যের স্বাদ' : 'Ghosh Sweet House — Artisanal Bengali Confections'}
          </p>
        </div>

        {/* Global Feedback Messages */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Screen Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* ================================================================= */}
          {/* SCREEN 1: WELCOME CHOOSER (New Customer vs Existing Customer)     */}
          {/* ================================================================= */}
          {screen === 'selection' && (
            <div className="space-y-5 animate-fade-in py-1">
              <div className="text-center space-y-1 mb-6">
                <span className="text-xs uppercase tracking-wider text-amber-500 font-bold font-royal">
                  {language === 'bn' ? 'লগইন বা সাইন আপ নির্বাচন করুন' : 'Select an Authentication Option'}
                </span>
                <p className="text-xs text-stone-400">
                  {language === 'bn'
                    ? 'আপনার মোবাইল নম্বর দিয়ে সহজেই অ্যাকাউন্ট তৈরি বা সাইন ইন করুন।'
                    : 'Choose your customer option to access orders & loyalty points.'}
                </p>
              </div>

              {/* Option 1: New Customer — Create Account */}
              <button
                type="button"
                onClick={() => {
                  setScreen('signup_form');
                  setActiveFlow('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                id="auth-choose-new-customer"
                className="w-full p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent hover:border-amber-400 hover:from-amber-500/25 text-left transition-all active:scale-[0.98] shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block font-mono">
                        {language === 'bn' ? '👤 নতুন গ্রাহক' : '👤 New Customer'}
                      </span>
                      <h3 className="text-base font-bold text-stone-100 font-serif">
                        {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
                      </h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {language === 'bn'
                          ? 'নাম, ঠিকানা ও পিন কোড দিয়ে নতুন প্রোফাইল তৈরি করুন (+১০ পয়েন্ট উপহার)'
                          : 'Sign up with name & address to earn 10 Sweet Points'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Existing Customer — Sign In */}
              <button
                type="button"
                onClick={() => {
                  setScreen('signin_form');
                  setActiveFlow('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                id="auth-choose-existing-customer"
                className="w-full p-4 rounded-2xl border-2 border-stone-700 bg-stone-900/60 hover:border-amber-500/50 hover:bg-stone-900/90 text-left transition-all active:scale-[0.98] shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-stone-800 border border-stone-700 text-amber-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 block font-mono">
                        {language === 'bn' ? '🔐 পুরনো গ্রাহক' : '🔐 Existing Customer'}
                      </span>
                      <h3 className="text-base font-bold text-stone-100 font-serif">
                        {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
                      </h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {language === 'bn'
                          ? 'শুধুমাত্র মোবাইল নম্বরে ওটিপি দিয়ে তাৎক্ষণিক লগইন'
                          : 'Quick 1-step sign in with your verified mobile number'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
                </div>
              </button>

              {/* Divider & Security Badge */}
              <div className="pt-4 border-t border-amber-500/15 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {language === 'bn'
                      ? 'মোবাইল OTP দ্বারা নিরাপদ লগইন'
                      : 'Secure login with mobile OTP'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 2: NEW CUSTOMER — SIGN UP FORM                             */}
          {/* ================================================================= */}
          {screen === 'signup_form' && (
            <form onSubmit={handleNewCustomerSendOtp} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/15">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                    {language === 'bn' ? 'নতুন গ্রাহক?' : 'New Customer?'}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-100">
                    {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen('selection')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অন্য অপশন' : 'Back'}</span>
                </button>
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'পুরো নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: বাপ্পান ঘোষ' : 'e.g. Rahul Sharma'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর (১০ সংখ্যা) *' : 'Mobile Number (10 digits) *'}
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl bg-stone-800 border border-r-0 border-stone-700 text-amber-400 font-mono text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(sanitizeMobile(e.target.value))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 rounded-r-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold tracking-wider focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Optional Email */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  {language === 'bn' ? 'ইমেল (ঐচ্ছিক)' : 'Optional Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'ডেলিভারি ঠিকানা (গ্রাম / এলাকা / বাড়ি) *' : 'Delivery Address *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'বাড়ি নম্বর, গ্রাম, ল্যান্ডমার্ক ইত্যাদি...'
                        : 'House No, Village/Area, Landmark...'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 5. PIN Code */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'পিন কোড (PIN Code - ৬ সংখ্যা) *' : 'PIN Code *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(sanitizePin(e.target.value))}
                  placeholder="732201"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold tracking-widest focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="signup-send-otp-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>{language === 'bn' ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>{language === 'bn' ? 'OTP পাঠান' : 'Send OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScreen('signin_form');
                    setActiveFlow('signin');
                  }}
                  className="text-xs text-stone-400 hover:text-amber-400"
                >
                  {language === 'bn'
                    ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন'
                    : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* SCREEN 3: EXISTING CUSTOMER — SIGN IN FORM                        */}
          {/* ================================================================= */}
          {screen === 'signin_form' && (
            <form onSubmit={handleExistingCustomerSendOtp} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/15">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                    {language === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-100">
                    {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen('selection')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অন্য অপশন' : 'Back'}</span>
                </button>
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'নিবন্ধিত মোবাইল নম্বর *' : 'Registered Mobile Number *'}
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl bg-stone-800 border border-r-0 border-stone-700 text-amber-400 font-mono text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(sanitizeMobile(e.target.value))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 rounded-r-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold tracking-wider focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {language === 'bn'
                    ? 'আপনার মোবাইল নম্বরে ৬ সংখ্যার ওটিপি কোড পাঠানো হবে।'
                    : 'We will send a 6-digit OTP code to verify your identity.'}
                </p>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="signin-send-otp-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>{language === 'bn' ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{language === 'bn' ? 'Send OTP / ওটিপি পাঠান' : 'Send OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScreen('signup_form');
                    setActiveFlow('signup');
                  }}
                  className="text-xs text-stone-400 hover:text-amber-400"
                >
                  {language === 'bn'
                    ? 'নতুন গ্রাহক? অ্যাকাউন্ট তৈরি করুন'
                    : 'New Customer? Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* SCREEN 4: OTP VERIFICATION                                        */}
          {/* ================================================================= */}
          {screen === 'otp_verification' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/15">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                    {activeFlow === 'signup' ? 'Sign Up Verification' : 'Sign In Verification'}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-100">
                    {language === 'bn' ? 'ওটিপি যাচাই করুন' : 'Verify Mobile OTP'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen(activeFlow === 'signup' ? 'signup_form' : 'signin_form')}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নম্বর পরিবর্তন' : 'Change Phone'}</span>
                </button>
              </div>

              {/* Number Badge */}
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span className="font-mono font-bold text-xs text-stone-200">
                    +91 {mobileNumber}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'bn' ? 'ওটিপি প্রেরিত' : 'OTP Dispatched'}</span>
                </span>
              </div>

              {/* Preview Code Hint */}
              {otpSentHint && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-center justify-between">
                  <span>
                    {language === 'bn' ? 'পরীক্ষামূলক কোড (Test OTP):' : 'Preview Test Code:'}
                  </span>
                  <span className="font-mono font-extrabold tracking-widest text-amber-400 text-xs">
                    {otpSentHint}
                  </span>
                </div>
              )}

              {/* OTP Input Field */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">
                  {language === 'bn' ? '৬ সংখ্যার ওটিপি কোড লিখুন *' : 'Enter 6-digit OTP *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-stone-900 border border-amber-500/40 text-amber-400 text-center font-mono font-extrabold text-lg tracking-[0.35em] focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-400">
                  {language === 'bn' ? 'কোড পাননি?' : "Didn't receive code?"}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-amber-400 hover:text-amber-300 font-semibold disabled:opacity-50"
                >
                  {resendCooldown > 0
                    ? `${language === 'bn' ? 'পুনরায় পাঠান' : 'Resend in'} (${resendCooldown}s)`
                    : language === 'bn' ? 'আবার ওটিপি পাঠান' : 'Resend OTP'}
                </button>
              </div>

              {/* Submit Verification Button */}
              <button
                type="submit"
                disabled={isLoading}
                id="otp-verify-submit-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>{language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying with Firebase...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {activeFlow === 'signup'
                        ? language === 'bn' ? 'যাচাই ও অ্যাকাউন্ট তৈরি করুন' : 'Verify & Create Account'
                        : language === 'bn' ? 'যাচাই ও লগইন করুন' : 'Verify & Sign In'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================================= */}
          {/* SCREEN 5: COMPLETE PROFILE (If Auth user has no Firestore profile)*/}
          {/* ================================================================= */}
          {screen === 'complete_profile' && (
            <form onSubmit={handleCompleteProfileSubmit} className="space-y-4 animate-fade-in">
              <div className="pb-2 border-b border-amber-500/15">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                  {language === 'bn' ? 'প্রথমবার স্বাগতম!' : 'First-time Welcome!'}
                </span>
                <h3 className="text-base font-bold font-serif text-stone-100">
                  {language === 'bn' ? 'আপনার প্রোফাইল সম্পূর্ণ করুন' : 'Please Complete Your Profile'}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {language === 'bn'
                    ? 'আপনার মোবাইল নম্বর সফলভাবে যাচাই হয়েছে। মিষ্টি ডেলিভারি ও লয়্যালটি উপহারের জন্য তথ্য দিন।'
                    : 'Phone verified! Please enter your details for delivery and loyalty rewards.'}
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'পুরো নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: বাপ্পান ঘোষ' : 'e.g. Rahul Sharma'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'ডেলিভারি ঠিকানা *' : 'Delivery Address *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'বাড়ি নম্বর, গ্রাম, এলাকা, ল্যান্ডমার্ক...'
                        : 'House No, Village/Area, Landmark...'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {language === 'bn' ? 'পিন কোড (PIN Code) *' : 'PIN Code *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(sanitizePin(e.target.value))}
                  placeholder="732201"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold tracking-widest focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  {language === 'bn' ? 'ইমেল (ঐচ্ছিক)' : 'Optional Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                id="complete-profile-submit-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Profile in Firestore...'}</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'প্রোফাইল সংরক্ষণ করুন ও অ্যাকাউন্টে যান' : 'Save Profile & Open Account'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
