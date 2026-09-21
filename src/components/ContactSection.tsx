import React from 'react';
import { useShop } from '../context/ShopContext';
import { MapPin, Phone, MessageSquare, Clock, Navigation, Sparkles } from 'lucide-react';
import { GhoshLogo } from './GhoshLogo';

export const ContactSection: React.FC = () => {
  const { language, theme, shopDetails, t } = useShop();
  const isDark = theme === 'dark';

  return (
    <section id="contact" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
            <MapPin className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'আমাদের অবস্থান' : 'Visit Our Sweet Counter'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            {language === 'bn' ? (
              <span className="font-bengali text-amber-400">
                {t.contactTitle}
              </span>
            ) : (
              <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                {t.contactTitle}
              </span>
            )}
          </h2>

          <p className={`text-sm sm:text-base ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
            {language === 'bn' ? 'দুইসাটাবিঘি, কালিয়াচক, মালদা, পশ্চিমবঙ্গ' : 'Duisatabighi, Kaliachak, Malda, West Bengal, India'}
          </p>
        </div>

        {/* Contact Grid: Info Cards + Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Info Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Shop Brand Card */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#1E130C] border-amber-500/25' : 'bg-white border-amber-850/15 shadow-md'
            }`}>
              <GhoshLogo variant="compact" theme={theme} className="mb-4" />
              
              <div className="space-y-4 pt-2">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-amber-500 mb-0.5">
                      {t.contactAddressLabel}
                    </h4>
                    <p className={`text-sm font-semibold font-bengali leading-snug ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      {language === 'bn' ? shopDetails.addressBn : shopDetails.addressEn}
                    </p>
                    <p className={`text-xs mt-0.5 font-bengali ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      {language === 'bn' ? shopDetails.stateCountryBn : shopDetails.stateCountryEn}
                    </p>
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-amber-500 mb-0.5">
                      {t.contactPhoneLabel}
                    </h4>
                    <a
                      href={`tel:${shopDetails.phone}`}
                      className="text-base font-bold text-amber-400 hover:text-amber-300 block"
                    >
                      {shopDetails.phone}
                    </a>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Enabled</span>
                    </span>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-amber-500 mb-0.5">
                      {t.contactHoursLabel}
                    </h4>
                    <p className={`text-sm font-semibold font-bengali ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      {language === 'bn' ? shopDetails.openingHoursBn : shopDetails.openingHoursEn}
                    </p>
                    <span className="text-[11px] text-amber-500/80 font-medium">
                      {language === 'bn' ? 'সপ্তাহের সাত দিনই খোলা' : 'Open all 7 days a week'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Direction Actions */}
            <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row gap-3 items-center justify-between ${
              isDark ? 'bg-[#180E08] border-amber-500/20' : 'bg-[#FAF5ED] border-amber-800/15'
            }`}>
              <div className="text-left">
                <h4 className="font-bold text-sm font-bengali">
                  {language === 'bn' ? 'সরাসরি দোকানে আসতে চান?' : 'Visiting in Person?'}
                </h4>
                <p className="text-xs opacity-75 font-bengali">
                  {language === 'bn' ? 'গুগল ম্যাপে তাৎক্ষণিক লোকেশন দেখুন' : 'Navigate using official Google Maps'}
                </p>
              </div>

              <a
                href={shopDetails.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="contact-nav-directions"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow transition-all whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.ctaGetDirections}</span>
              </a>
            </div>

          </div>

          {/* Right Map Panel */}
          <div className="lg:col-span-7">
            <div className={`h-full min-h-[380px] rounded-3xl overflow-hidden border relative flex flex-col justify-between ${
              isDark ? 'border-amber-500/30 bg-stone-900' : 'border-amber-800/20 bg-stone-100 shadow-md'
            }`}>
              {/* Google Maps Embed focused on Kaliachak / Malda */}
              <iframe
                title="Ghosh Sweet House Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14588.636605051833!2d88.0200!3d24.8500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fa422000000001%3A0x6b24df9b41846c4f!2sKaliachak%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1711000000000!5m2!1sen!2sin"
                className="w-full h-full min-h-[380px] border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              {/* Floating Map Label Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-stone-950/90 backdrop-blur-md border border-amber-500/40 text-left flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-300 font-royal">
                    GHOSH SWEET HOUSE (ঘোষ মিষ্টান্ন ভাণ্ডার)
                  </div>
                  <div className="text-[11px] text-stone-300 font-bengali">
                    Duisatabighi, Kaliachak, Malda, WB
                  </div>
                </div>

                <a
                  href={shopDetails.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  {language === 'bn' ? 'ম্যাপ খুলুন' : 'Open Link'}
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
