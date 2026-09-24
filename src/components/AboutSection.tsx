import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Utensils, Heart, Award, ShieldCheck, Clock } from 'lucide-react';
import { GhoshLogo } from './GhoshLogo';
import { ScrollReveal } from './ScrollReveal';

export const AboutSection: React.FC = () => {
  const { language, theme, t, shopDetails } = useShop();
  const isDark = theme === 'dark';

  const pillars = [
    {
      title: t.statFreshTitle,
      subtitle: t.statFreshSub,
      icon: Clock,
      descBn: 'প্রতিদিন সকাল ও সন্ধ্যায় টাটকা দুধ জ্বাল দিয়ে তৈরি করা হয় তাজা ছানা ও মিষ্টি।',
      descEn: 'Fresh batches prepared daily morning and evening from pure country cow milk.'
    },
    {
      title: t.statTasteTitle,
      subtitle: t.statTasteSub,
      icon: Utensils,
      descBn: 'প্রাচীন মালদহ ও বাংলার খাঁটি পারিবারিক রেসিপিতে তৈরি অনাবিল স্বাদ।',
      descEn: 'Authentic regional recipes passed down with pride and cultural love.'
    },
    {
      title: t.statQualityTitle,
      subtitle: t.statQualitySub,
      icon: ShieldCheck,
      descBn: 'উচ্চমানের ছানা, খাঁটি দেশি ঘি, আসল জাফরান ও নিখাদ চিনি।',
      descEn: 'Direct farm milk, pure clarified butter (ghee), and real fragrant cardamom.'
    },
    {
      title: t.statCareTitle,
      subtitle: t.statCareSub,
      icon: Heart,
      descBn: 'প্রতিটি মিষ্টি প্রস্তুত ও পরিবেশন করা হয় পরম মমতা ও কঠোর পরিচ্ছন্নতায়।',
      descEn: 'Prepared in a spotless hygienic kitchen with heartfelt Bengali hospitality.'
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Story Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
          
          {/* Image & Visual Showcase */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <ScrollReveal direction="left" distance={24} duration={0.6}>
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl p-2 bg-gradient-to-b from-amber-500/20 to-transparent">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop"
                    alt="Ghosh Sweet House Counter and Tradition"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Overlaid Logo in Corner */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-center">
                    <GhoshLogo variant="compact" theme="dark" className="justify-center mb-2" />
                    <p className="font-bengali text-xs text-amber-300">
                      {language === 'bn'
                        ? 'দুইসাটাবিঘি, কালিয়াচক, মালদা — আপনার বিশ্বস্ত মিষ্টির আলয়'
                        : 'Duisatabighi, Kaliachak, Malda — Serving authentic Bengali sweetness'}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Story Text */}
          <div className="lg:col-span-7 text-left order-1 lg:order-2">
            <ScrollReveal direction="right" distance={24} duration={0.6}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10 mb-3 font-royal">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.aboutSubtitle}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                {language === 'bn' ? (
                  <span className="font-bengali text-amber-400">
                    {t.aboutTitle}
                  </span>
                ) : (
                  <span className="font-serif-luxury bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                    {t.aboutTitle}
                  </span>
                )}
              </h2>

              {/* Prompt exact text */}
              <div className={`text-base sm:text-lg leading-relaxed space-y-4 mb-8 font-bengali ${
                isDark ? 'text-amber-100/90' : 'text-stone-700'
              }`}>
                <p className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 italic leading-relaxed">
                  “{language === 'bn' ? t.aboutParagraph : t.aboutParagraph}”
                </p>
                <p className="text-sm sm:text-base leading-relaxed">
                  {language === 'bn'
                    ? 'মালদার কালিয়াচকের দুইসাটাবিঘিতে অবস্থিত ঘোষ মিষ্টান্ন ভাণ্ডার প্রতিটি গ্রাহকের কাছে পৌঁছে দিচ্ছে বাংলার খাঁটি মালাই, রসগোল্লা, ক্ষীর ও গরম গরম জলখাবারের অপূর্ব স্বাদ। আমাদের মূল লক্ষ্য শুদ্ধতা, তাজা প্রস্তুতি ও বিশ্বস্ত সেবা।'
                    : 'Located at Duisatabighi, Kaliachak, Malda, Ghosh Sweet House is proud to share the pinnacle of traditional Bengali confections with you and your loved ones.'}
                </p>
              </div>

              {/* Direct Phone Highlight & MSME Registration */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${shopDetails.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সরাসরি যোগাযোগ: ৯৭৩৩৩৬৩৫৬২' : `Call Us: ${shopDetails.phone}`}</span>
                </a>

                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-xs font-mono text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-sans font-bold text-emerald-400/90 block">
                      {language === 'bn' ? 'সরকারি উদ্যোগ রেজিঃ' : 'Govt. MSME Reg.'}
                    </span>
                    <span>{shopDetails.registrationNo}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>

        {/* 4 Pillars / Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal
                key={idx}
                direction="up"
                distance={20}
                delay={idx * 0.08}
                duration={0.5}
                className="h-full flex flex-col"
              >
              <div
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between h-full ${
                  isDark
                    ? 'bg-[#1C120B] border-amber-500/20 hover:border-amber-400/50 shadow-xl'
                    : 'bg-white border-amber-800/15 hover:border-amber-500/50 shadow-md'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-royal text-amber-400 mb-1">
                    {item.title}
                  </h3>
                  <div className="text-xs font-bold font-bengali text-amber-500/80 mb-2">
                    {item.subtitle}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300 font-bengali' : 'text-stone-600 font-bengali'}`}>
                    {language === 'bn' ? item.descBn : item.descEn}
                  </p>
                </div>
              </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
