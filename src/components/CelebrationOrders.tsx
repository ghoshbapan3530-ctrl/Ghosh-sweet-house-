import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Send, Phone, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';

export const CelebrationOrders: React.FC = () => {
  const { language, theme, shopDetails, t } = useShop();
  const isDark = theme === 'dark';

  const [occasion, setOccasion] = useState(language === 'bn' ? 'বিয়ে ও প্রীতিভোজ' : 'Wedding');
  const [guestCount, setGuestCount] = useState('100');
  const [sweetPref, setSweetPref] = useState(language === 'bn' ? 'রসগোল্লা, চমচম ও লাড্ডু' : 'Rosogolla, Chamcham & Laddu');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const occasions = [
    { id: 'wedding', label: t.occasionWedding, icon: '💍' },
    { id: 'birthday', label: t.occasionBirthday, icon: '🎂' },
    { id: 'puja', label: t.occasionPuja, icon: '🙏' },
    { id: 'festival', label: t.occasionFestival, icon: '🎊' },
    { id: 'office', label: t.occasionOffice, icon: '🏢' },
    { id: 'custom', label: t.occasionCustom, icon: '🎁' }
  ];

  const handleWhatsAppInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*বাল্ক মিষ্টির অর্ডার ইনকোয়ারি (Ghosh Sweet House)*\n\n` +
      `👤 *নাম:* ${customerName || 'গ্রাহক'}\n` +
      `📞 *ফোন:* ${customerPhone || 'প্রযোজ্য নয়'}\n` +
      `🎉 *অনুষ্ঠান:* ${occasion}\n` +
      `👥 *অতিথির সংখ্যা / পরিমাণ:* ${guestCount} জন / কেজি\n` +
      `🍬 *পছন্দের মিষ্টি:* ${sweetPref}\n\n` +
      `দয়া করে বিস্তারিত খরচ ও অফার জানিয়ে সাহায্য করুন।`;

    const url = `https://wa.me/${shopDetails.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
            </div>

            {/* Right Column: Quick WhatsApp Bulk Booking Form */}
            <div className="lg:col-span-6">
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
                      {language === 'bn' ? 'সরাসরি দোকানের মালিকের সঙ্গে কথা বলুন' : 'Connect directly with Ghosh Sweet House team'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>

                <form onSubmit={handleWhatsAppInquiry} className="space-y-4">
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
                      id="celebration-submit-whatsapp"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t.celebrationFormSend}</span>
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
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
