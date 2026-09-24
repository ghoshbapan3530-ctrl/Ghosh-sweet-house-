import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, FileSpreadsheet, Phone, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const CelebrationOrders: React.FC = () => {
  const { language, theme, shopDetails, t, addOrderToHistory } = useShop();
  const isDark = theme === 'dark';

  const [occasion, setOccasion] = useState(language === 'bn' ? 'বিয়ে ও প্রীতিভোজ' : 'Wedding');
  const [guestCount, setGuestCount] = useState('100');
  const [sweetPref, setSweetPref] = useState(language === 'bn' ? 'রসগোল্লা, চমচম ও লাড্ডু' : 'Rosogolla, Chamcham & Laddu');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const occasions = [
    { id: 'wedding', label: t.occasionWedding, icon: '💍' },
    { id: 'birthday', label: t.occasionBirthday, icon: '🎂' },
    { id: 'puja', label: t.occasionPuja, icon: '🙏' },
    { id: 'festival', label: t.occasionFestival, icon: '🎊' },
    { id: 'office', label: t.occasionOffice, icon: '🏢' },
    { id: 'custom', label: t.occasionCustom, icon: '🎁' }
  ];

  const handleDirectCelebrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone) return;

    setIsSubmitting(true);
    try {
      // Record directly into order history and synchronize directly to Google Sheets
      addOrderToHistory({
        items: [
          {
            product: {
              id: 'bulk-event-order',
              nameBn: `বাল্ক উৎসব ইনকোয়ারি: ${occasion}`,
              nameEn: `Bulk Event Inquiry: ${occasion}`,
              category: 'special',
              portionBn: 'বাল্ক / কাস্টম',
              portionEn: 'Bulk / Custom',
              price: 0,
              descriptionBn: `উৎসবের মিষ্টির বাল্ক অর্ডার ইনকোয়ারি (${occasion})`,
              descriptionEn: `Bulk event sweet order inquiry (${occasion})`,
              image: '',
              isBestSeller: false
            },
            quantity: 1,
            selectedPortion: `${guestCount} (অতিথি/কেজি)`,
            price: 0
          }
        ],
        subtotal: 0,
        discountAmount: 0,
        pointsRedeemed: 0,
        finalTotal: 0,
        pointsEarned: 0,
        orderType: 'delivery',
        customerName: customerName || 'সম্মানীয় গ্রাহক',
        customerPhone,
        deliveryAddress: 'Duisatabighi / Kaliachak Event Venue',
        specialNote: `[উৎসব বাল্ক ইনকোয়ারি] অনুষ্ঠান: ${occasion} | পরিমাণ: ${guestCount} | পছন্দ: ${sweetPref}`
      });

      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Failed to submit celebration inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="celebration" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`rounded-3xl p-8 sm:p-12 md:p-16 border relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#29170E] via-[#1C1008] to-[#120B06] border-amber-500/30 shadow-2xl'
            : 'bg-gradient-to-br from-[#FFF9F2] via-[#F8EFE3] to-[#F2E5D3] border-amber-800/20 shadow-xl'
        }`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Occasion Pills */}
            <div className="lg:col-span-6 text-left">
              <ScrollReveal direction="left" distance={24} duration={0.6}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Heart className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{language === 'bn' ? 'উৎসব ও সামাজিক আয়োজন' : 'Grand Celebrations & Events'}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                  {language === 'bn' ? (
                    <span className="font-bengali text-amber-300">
                      {t.celebrationTitle}
                    </span>
                  ) : (
                    <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                      {t.celebrationTitle}
                    </span>
                  )}
                </h2>

                <p className={`text-base leading-relaxed mb-8 ${isDark ? 'text-amber-100/80 font-bengali' : 'text-stone-700 font-bengali'}`}>
                  {t.celebrationSubtitle}
                </p>

                {/* Grid of occasions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {occasions.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.label)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        occasion === occ.label
                          ? 'bg-amber-500/25 border-amber-500 shadow-md ring-1 ring-amber-400'
                          : isDark
                          ? 'bg-stone-900/60 border-amber-500/15 hover:border-amber-400/40'
                          : 'bg-white/80 border-amber-800/15 hover:border-amber-500/40'
                      }`}
                    >
                      <span className="text-2xl mb-1">{occ.icon}</span>
                      <span className="text-xs font-bold font-bengali leading-snug">
                        {occ.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Bulk assurances */}
                <div className="flex flex-wrap gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'বিশেষ পাইকারি দর' : 'Wholesale Event Pricing'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'নির্দিষ্ট সময়ে নিখুঁত প্রস্তুতি' : 'On-Time Guaranteed Preparation'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'bn' ? 'কাস্টম প্যাকেজিং ও ডেলিভারি' : 'Custom Event Packaging'}</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Direct Google Sheets Bulk Booking Form */}
            <div className="lg:col-span-6">
              <ScrollReveal direction="right" distance={24} duration={0.6}>
                <div className={`p-6 sm:p-8 rounded-3xl border ${
                  isDark
                    ? 'bg-[#180E08]/90 border-amber-500/30 backdrop-blur-md shadow-2xl'
                    : 'bg-white/95 border-amber-800/15 backdrop-blur-md shadow-xl'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-bengali">
                      <span className={isDark ? 'text-amber-200' : 'text-stone-900'}>
                        {t.celebrationCta}
                      </span>
                    </h3>
                    <span className="text-xs opacity-80 font-bengali">
                      {language === 'bn' ? 'সরাসরি Google Sheets ও দোকানে ইনকোয়ারি জমা দিন' : 'Directly record inquiry into Google Sheets'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>

                {submittedSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-bengali text-amber-300">
                        {language === 'bn' ? 'ইনকোয়ারি সফলভাবে জমা হয়েছে!' : 'Inquiry Submitted Successfully!'}
                      </h4>
                      <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs text-left">
                        <p className="font-semibold flex items-center gap-1.5 text-emerald-300">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'Google Sheets-এ সরাসরি নথিবদ্ধ' : 'Recorded in Google Sheets'}</span>
                        </p>
                        <p className="text-[11px] text-emerald-100/80 mt-1">
                          {language === 'bn'
                            ? `আপনার দেওয়া মোবাইল নম্বরে (${customerPhone}) ঘোষ মিষ্টান্ন ভাণ্ডারের প্রধান পরিচালক খুব শীঘ্রই বিশেষ পাইকারি দর ও মেনু নিয়ে কল করবেন।`
                            : `Ghosh Sweet House management will call your number (${customerPhone}) shortly with wholesale quotes.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedSuccess(false);
                        setCustomerPhone('');
                        setCustomerName('');
                      }}
                      className="px-5 py-2 rounded-xl text-xs font-semibold border border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                    >
                      {language === 'bn' ? 'নতুন ইনকোয়ারি পাঠান' : 'Submit Another Inquiry'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDirectCelebrationSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-amber-400 mb-1 font-bengali">
                        {t.celebrationFormName}
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={language === 'bn' ? 'উদা: রাহুল ঘোষ' : 'e.g. Rahul Ghosh'}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          isDark ? 'bg-stone-900/80 border-amber-500/30 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-amber-400 mb-1 font-bengali">
                          {t.celebrationFormPhone}
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="9733363562"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            isDark ? 'bg-stone-900/80 border-amber-500/30 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-amber-400 mb-1 font-bengali">
                          {t.celebrationFormQty}
                        </label>
                        <input
                          type="text"
                          value={guestCount}
                          onChange={(e) => setGuestCount(e.target.value)}
                          placeholder="e.g. 200 pcs / 20 kg"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            isDark ? 'bg-stone-900/80 border-amber-500/30 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-amber-400 mb-1 font-bengali">
                        {language === 'bn' ? 'পছন্দের মিষ্টি বা বিশেষ নোট' : 'Preferred Sweets / Special Note'}
                      </label>
                      <input
                        type="text"
                        value={sweetPref}
                        onChange={(e) => setSweetPref(e.target.value)}
                        placeholder={language === 'bn' ? 'রসগোল্লা, চমচম, লাড্ডু' : 'Rosogolla, Chamcham, Laddu'}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          isDark ? 'bg-stone-900/80 border-amber-500/30 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                        }`}
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        id="celebration-submit-direct"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-950/40 active:scale-95 transition-all disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                            <span>{language === 'bn' ? 'Google Sheets-এ পাঠানো হচ্ছে...' : 'Sending to Google Sheets...'}</span>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-4 h-4 text-stone-950" />
                            <span>{t.celebrationFormSend}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`tel:${shopDetails.phone}`}
                        className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm border transition-all ${
                          isDark
                            ? 'border-amber-500/40 text-amber-300 hover:bg-amber-950/40'
                            : 'border-amber-800/30 text-amber-950 hover:bg-amber-100'
                        }`}
                      >
                        <Phone className="w-4 h-4 text-amber-500" />
                        <span>{language === 'bn' ? 'ফোন করুন' : 'Call Directly'}</span>
                      </a>
                    </div>
                  </form>
                )}
              </div>
              </ScrollReveal>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
