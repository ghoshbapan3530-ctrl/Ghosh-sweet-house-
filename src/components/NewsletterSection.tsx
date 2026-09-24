import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Sparkles, CheckCircle2, BellRing, ArrowRight, Gift } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const NewsletterSection: React.FC = () => {
  const { language, theme } = useShop();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ইমেল অ্যাড্রেস লিখুন।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    try {
      const existing = localStorage.getItem('ghosh_newsletter_subscribers');
      const list: string[] = existing ? JSON.parse(existing) : [];
      if (!list.includes(email.trim().toLowerCase())) {
        list.push(email.trim().toLowerCase());
        localStorage.setItem('ghosh_newsletter_subscribers', JSON.stringify(list));
      }
    } catch {
      // LocalStorage fallback handled silently
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
    setError('');
  };

  return (
    <section
      id="newsletter-section"
      aria-label="Newsletter Signup"
      className={`relative py-14 sm:py-16 border-t overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[#180E08] via-[#1f120a] to-[#140b06] border-amber-500/20 text-stone-100'
          : 'bg-gradient-to-b from-amber-50/70 via-[#FFF9F2] to-amber-100/50 border-amber-900/10 text-stone-900'
      }`}
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'bn' ? 'উৎসব অফার ও নতুন মিষ্টির খবর' : 'Sweet Arrivals & Festive Offers'}</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-bengali tracking-tight mb-3">
          {language === 'bn' ? (
            <>
              ঘোষ সুইট হাউসের <span className="text-amber-500">নিউজলেটারে</span> যুক্ত থাকুন
            </>
          ) : (
            <>
              Subscribe to the <span className="text-amber-500">Ghosh Sweet House</span> Newsletter
            </>
          )}
        </h2>

        {/* Subtitle */}
        <p
          className={`max-w-xl mx-auto text-sm sm:text-base font-bengali leading-relaxed mb-8 ${
            isDark ? 'text-amber-200/80' : 'text-stone-600'
          }`}
        >
          {language === 'bn'
            ? 'নতুন সিজনাল মিষ্টির আগমন, দুর্গোৎসব ও দীপাবলির বিশেষ ছাড় এবং এক্সক্লুসিভ মিষ্টি পয়েন্টস অফারের আপডেট সরাসরি আপনার ইমেলে পান।'
            : 'Get instant email updates on new artisanal sweet arrivals, festive discount bundles, and seasonal celebration menus.'}
        </p>

        {/* Submission State or Input Form */}
        {isSubmitted ? (
          <div
            id="newsletter-success-box"
            className={`max-w-lg mx-auto p-6 rounded-3xl border text-center transition-all ${
              isDark
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-100'
                : 'bg-white border-amber-200 shadow-md text-stone-900'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-bengali mb-1">
              {language === 'bn' ? 'ধন্যবাদ! আপনি সফলভাবে যুক্ত হয়েছেন।' : 'Thank You for Subscribing!'}
            </h3>
            <p className="text-xs sm:text-sm font-bengali opacity-80 mb-4">
              {language === 'bn'
                ? `আমরা শীঘ্রই ${email} ঠিকানায় মিষ্টি সংবাদ ও বিশেষ অফার পাঠাব।`
                : `We'll send curated sweet news & festive treats to ${email}.`}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-amber-500 hover:text-amber-400 underline underline-offset-4"
            >
              {language === 'bn' ? 'আরেকটি ইমেল সাবস্ক্রাইব করুন' : 'Subscribe another email'}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            id="newsletter-form"
            className="max-w-xl mx-auto"
          >
            <div
              className={`flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl border transition-all shadow-sm ${
                isDark
                  ? 'bg-stone-900/90 border-amber-500/30 focus-within:border-amber-400'
                  : 'bg-white border-amber-200/90 focus-within:border-amber-500 shadow-amber-900/5'
              }`}
            >
              <div className="relative flex-1 flex items-center pl-3">
                <Mail className="w-5 h-5 text-amber-500/70 flex-shrink-0" />
                <input
                  type="email"
                  id="newsletter-email-input"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={
                    language === 'bn'
                      ? 'আপনার ইমেল লিখুন (যেমন: name@example.com)'
                      : 'Enter your email (e.g., name@example.com)'
                  }
                  required
                  aria-label="Email Address"
                  className={`w-full py-2.5 px-3 bg-transparent text-sm outline-none placeholder:text-xs sm:placeholder:text-sm ${
                    isDark
                      ? 'text-stone-100 placeholder:text-stone-500'
                      : 'text-stone-900 placeholder:text-stone-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                id="newsletter-submit-btn"
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all flex-shrink-0"
              >
                <BellRing className="w-4 h-4 text-stone-950" />
                <span className="font-bengali">
                  {language === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe'}
                </span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>

            {error && (
              <p
                id="newsletter-error"
                className="text-xs text-rose-500 font-medium text-left mt-2 pl-3 font-bengali"
              >
                {error}
              </p>
            )}

            {/* Micro badges below form */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-[11px] sm:text-xs opacity-70 font-bengali">
              <span className="inline-flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                {language === 'bn' ? 'কোনো স্প্যাম নেই' : 'Zero spam, unsubscribe anytime'}
              </span>
              <span>•</span>
              <span>
                {language === 'bn' ? 'সাপ্তাহিক ও উৎসবের সেরা আপডেট' : 'Weekly & festive specials'}
              </span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
