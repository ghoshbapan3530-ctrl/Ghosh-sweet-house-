import React from 'react';
import { useShop } from '../context/ShopContext';
import { GhoshLogo } from './GhoshLogo';
import { Phone, MessageSquare, MapPin, Clock, Heart, Shield, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, theme, shopDetails, t, setIsAdminOpen } = useShop();
  const isDark = theme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? 'bg-[#120A05] border-amber-500/20 text-stone-300'
          : 'bg-[#221309] border-amber-900/30 text-stone-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-amber-500/15">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-4 text-left">
            <GhoshLogo variant="compact" theme="dark" className="mb-4" />
            
            <p className="text-sm font-bengali text-amber-200/90 leading-relaxed mb-4">
              {language === 'bn'
                ? 'ঘোষ মিষ্টান্ন ভাণ্ডার — খাঁটি বাঙালি ঐতিহ্য, বিশুদ্ধ ছানা, দেশি ঘি ও ঘরোয়া ভালোবাসায় তৈরি প্রিমিয়াম মিষ্টি ও তাজা জলখাবার।'
                : 'Ghosh Sweet House — Traditional Bengali sweets crafted with pure country cow milk chana, desi ghee, and time-honored artisanal passion.'}
            </p>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bengali">
              <span className="font-bold">“{t.footerTagline}”</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 font-royal mb-4">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#home" className="hover:text-amber-300 transition-colors font-bengali">
                  {t.navHome}
                </a>
              </li>
              <li>
                <a href="#bestsellers" className="hover:text-amber-300 transition-colors font-bengali">
                  {t.bestSellersTitle}
                </a>
              </li>
              <li>
                <a href="#sweets" className="hover:text-amber-300 transition-colors font-bengali">
                  {t.navSweets}
                </a>
              </li>
              <li>
                <a href="#snacks" className="hover:text-amber-300 transition-colors font-bengali">
                  {t.navSnacks}
                </a>
              </li>
              <li>
                <a href="#special" className="hover:text-amber-300 transition-colors font-bengali">
                  {t.navSpecial}
                </a>
              </li>
              <li>
                <a href="#celebration" className="hover:text-amber-300 transition-colors font-bengali">
                  {language === 'bn' ? 'অনুষ্ঠানের অর্ডার' : 'Celebration Orders'}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-300 transition-colors font-bengali">
                  {t.navAbout}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Sweets Highlights */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 font-royal mb-4">
              {language === 'bn' ? 'আমাদের বিশেষ মিষ্টি' : 'Signature Menu'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-300 font-bengali">
              <li>• স্পঞ্জি রসগোল্লা (Rosogolla)</li>
              <li>• গোলাপজামুন (Golapjamun)</li>
              <li>• মালদার রসোগোদাম (Rosogodam)</li>
              <li>• খাঁটি মিষ্টি দই (Mishti Doi)</li>
              <li>• জাফরানি মতিচুর লাড্ডু (Desi Ghee Laddu)</li>
              <li>• ফিশ লেগস ক্ষীর মিষ্টি (Fish Legs Kheer)</li>
              <li>• পুরি ও পরোটা সবজি (Puri Sabji)</li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 font-royal mb-4">
              {t.contactInfo}
            </h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="font-bengali">
                  {language === 'bn' ? shopDetails.addressBn : shopDetails.addressEn},{' '}
                  {language === 'bn' ? shopDetails.stateCountryBn : shopDetails.stateCountryEn}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href={`tel:${shopDetails.phone}`} className="text-amber-300 font-bold hover:underline">
                  {shopDetails.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-bengali">
                  {language === 'bn' ? shopDetails.openingHoursBn : shopDetails.openingHoursEn}
                </span>
              </div>

              <div className="pt-2">
                <a
                  href={shopDetails.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
                >
                  <span>{language === 'bn' ? 'গুগল ম্যাপে লোকেশন লিঙ্ক' : 'Google Maps Location'}</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="font-bengali">
            {t.footerCopyright}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-amber-300 transition-colors underline"
            >
              {language === 'bn' ? 'ম্যানেজমেন্ট প্যানেল' : 'Owner Admin'}
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <span>{language === 'bn' ? 'উপরে যান' : 'Back to Top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
