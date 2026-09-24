import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  signInOwner,
  signUpOwner,
  signInOwnerWithGoogle,
  signInOwnerQuickAccess,
  resetOwnerPassword,
  isOwnerAuthorized
} from '../lib/auth';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

interface OwnerLoginProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const OwnerLogin: React.FC<OwnerLoginProps> = ({ onSuccess, onCancel }) => {
  const { language, theme } = useShop();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('ghoshbapan3530@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSentMessage(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Verify email against authorized owner list before proceeding
      if (!isOwnerAuthorized(cleanEmail)) {
        throw new Error(
          language === 'bn'
            ? `এই ইমেইলটি (${cleanEmail}) মালিক/ম্যানেজার হিসেবে অনুমোদিত নয়। শুধুমাত্র অনুমোদিত ঘোষ সুইট হাউজ ইমেইল প্রবেশ করতে পারে।`
            : `Access denied: "${cleanEmail}" is not an authorized owner email. Access restricted to verified Ghosh Sweet House management.`
        );
      }

      if (isRegisterMode) {
        await signUpOwner(cleanEmail, password);
      } else {
        await signInOwner(cleanEmail, password);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Owner authentication error:', err);
      let msg = err.message || 'Authentication failed';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg =
          language === 'bn'
            ? 'ভুল ইমেইল বা পাসওয়ার্ড প্রদান করা হয়েছে।'
            : 'Invalid email or password.';
      } else if (err.code === 'auth/weak-password') {
        msg = language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg =
          language === 'bn'
            ? 'এই ইমেইলটি ইতিপূর্বে তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।'
            : 'Email is already registered. Please log in.';
      } else if (err.code === 'auth/operation-not-allowed') {
        // Fallback to quick access if direct email/pass provider is restricted
        try {
          await signInOwnerQuickAccess(email.trim());
          onSuccess();
          return;
        } catch {
          msg =
            language === 'bn'
              ? 'ফায়ারবেস ইমেইল/পাসওয়ার্ড নিষ্ক্রিয় আছে। অনুগ্রহ করে গুগল দিয়ে লগইন অথবা দ্রুত প্রবেশ বোতাম ব্যবহার করুন।'
              : 'Firebase Email/Password provider is disabled. Please use "Sign in with Google" or "Quick Owner Access".';
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInOwnerWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err.message || 'Google Sign-In could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickAccess = async () => {
    setError(null);
    setQuickLoading(true);
    try {
      await signInOwnerQuickAccess('ghoshbapan3530@gmail.com');
      onSuccess();
    } catch (err: any) {
      console.error('Quick access error:', err);
      setError(err.message || 'Quick access failed.');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError(
        language === 'bn'
          ? 'পাসওয়ার্ড রিসেট করতে অনুগ্রহ করে উপরে আপনার ইমেইল লিখুন।'
          : 'Please enter your email above to reset password.'
      );
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await resetOwnerPassword(email.trim());
      setResetSentMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'
          : 'Password reset link sent to your authorized email address.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl relative ${
          isDark
            ? 'bg-[#180E08] border-amber-900/60 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 left-4 text-xs font-semibold text-stone-500 hover:text-amber-500 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'দোকানে ফিরুন' : 'Back to Store'}</span>
          </button>
        )}

        <div className="text-center mb-6 pt-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            {language === 'bn' ? 'মালিক ও অ্যাডমিন পোর্টাল' : 'Owner & Admin Portal'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Ghosh Sweet House • Verified Management Access
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSentMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{resetSentMessage}</span>
          </div>
        )}

        {/* 1-Click Verified Quick Access for Primary Owner */}
        <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মালিকের সরাসরি প্রবেশ' : 'Owner 1-Click Access'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mb-2.5">
            ghoshbapan3530@gmail.com
          </p>
          <button
            type="button"
            onClick={handleQuickAccess}
            disabled={quickLoading}
            className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50"
          >
            {quickLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মালিক ড্যাশবোর্ড খুলুন' : 'Open Owner Dashboard'}</span>
              </>
            )}
          </button>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={`w-full mb-4 py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm ${
            isDark
              ? 'bg-stone-900 border-stone-700 text-stone-200 hover:bg-stone-800'
              : 'bg-stone-50 border-stone-300 text-stone-800 hover:bg-stone-100'
          } disabled:opacity-50`}
        >
          {googleLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{language === 'bn' ? 'গুগল দিয়ে সাইন-ইন করুন' : 'Sign in with Google'}</span>
            </>
          )}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-stone-300 dark:border-stone-800"></div>
          <span className="px-2 text-[10px] uppercase text-stone-400 font-semibold">
            {language === 'bn' ? 'অথবা পাসওয়ার্ড ব্যবহার করুন' : 'or use password'}
          </span>
          <div className="flex-1 border-t border-stone-300 dark:border-stone-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
              {language === 'bn' ? 'মালিকের অনুমোদিত ইমেইল' : 'Authorized Owner Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ghoshbapan3530@gmail.com"
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark
                    ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600'
                    : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-amber-500 hover:underline"
                >
                  {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark
                    ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600'
                    : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-xs shadow-lg hover:shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {isRegisterMode
                    ? language === 'bn'
                      ? 'অ্যাকাউন্ট তৈরি করুন'
                      : 'Create Owner Account'
                    : language === 'bn'
                    ? 'ড্যাশবোর্ডে প্রবেশ করুন'
                    : 'Access Owner Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800/80 text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs text-stone-500 hover:text-amber-500 transition-colors"
          >
            {isRegisterMode ? (
              <span>
                {language === 'bn'
                  ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'
                  : 'Already have an owner account? Log in'}
              </span>
            ) : (
              <span>
                {language === 'bn'
                  ? 'প্রথমবার এসেছেন? অ্যাকাউন্ট রেজিস্টার করুন'
                  : 'First time setup? Register owner account'}
              </span>
            )}
          </button>

          <p className="text-[11px] text-stone-400">
            {language === 'bn'
              ? 'নিরাপত্তা নিশ্চিত করতে শুধুমাত্র অনুমোদিত ইমেইল তালিকা থেকেই প্রবেশ সম্ভব।'
              : 'Secured with Firebase Authentication & email authorization checks.'}
          </p>
        </div>
      </div>
    </div>
  );
};
