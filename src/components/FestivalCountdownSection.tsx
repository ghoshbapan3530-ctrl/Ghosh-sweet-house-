import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Clock,
  Sparkles,
  Gift,
  Calendar,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Flame,
  Tag,
  Store,
  Truck,
  Heart,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import { FestivalSweetBox, PreOrderModal } from './PreOrderModal';
import { ScrollReveal } from './ScrollReveal';

interface FestivalData {
  id: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  targetDate: string; // ISO date string
  badgeBn: string;
  badgeEn: string;
  descriptionBn: string;
  descriptionEn: string;
  boxes: FestivalSweetBox[];
}

export const FestivalCountdownSection: React.FC = () => {
  const { language, theme, addToCart, t } = useShop();
  const isDark = theme === 'dark';

  // Selected festival sweet box for the Pre-Order Modal
  const [selectedBox, setSelectedBox] = useState<FestivalSweetBox | null>(null);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  const [activeFestivalId, setActiveFestivalId] = useState<'durgapuja' | 'kalipuja' | 'bhaiphota' | 'nababarsho'>('durgapuja');

  // Bengali Festivals Catalog
  const festivals: FestivalData[] = [
    {
      id: 'durgapuja',
      nameBn: 'শারদীয় দুর্গোৎসব ২০২৬',
      nameEn: 'Sharodiya Durga Puja 2026',
      taglineBn: 'মা আসছেন! আগমনীর সুরে মিষ্টিমুখের প্রস্তুতি • অগ্রিম বুকিং শুরু',
      taglineEn: 'Maa Durga Arrives! Pre-order handcrafted bhog thalis & royal festive gift boxes',
      targetDate: '2026-10-18T06:00:00', // Maha Sasthi
      badgeBn: 'প্রধান শারদ উৎসব',
      badgeEn: 'Grand Autumn Festival',
      descriptionBn: 'কাশফুলের দোলা আর ঢাকের আওয়াজে বঙ্গে শারদোৎসবের আনন্দ। মহাষ্টমীর পবিত্র পুষ্পাঞ্জলি ভোগ ও বিজয়া দশমীর আন্তরিক প্রীতিসম্মিলনী মিষ্টির চাহিদা তুঙ্গে থাকে। ভিড় এড়াতে এখনই প্রি-অর্ডার করুন বিশেষ ছাড়ে।',
      descriptionEn: 'As the autumn skies clear and dhak beats echo across Bengal, celebrate Durga Puja with our authentic heritage sweets. Avoid the festive rush by securing your puja bhog and family hampers in advance.',
      boxes: [
        {
          id: 'sharod-shrestho-box',
          nameBn: 'শারদ শ্রেষ্ঠ রাজকীয় মিষ্টি বাক্স',
          nameEn: 'Sharod Shrestho Royal Festive Box',
          taglineBn: 'কেশর রাজভোগ, নলেন গুড়ের সন্দেশ ও কাজু বরফির সমাহার',
          taglineEn: 'Assortment of Kesar Rajbhog, Nolen Gur Sandesh & Kaju Barfi',
          weightBn: '১ কেজি রাজকীয় থালি',
          weightEn: '1.0 Kg Royal Collection',
          originalPrice: 650,
          preOrderPrice: 550,
          discountPercent: 15,
          festivalType: 'Durga Puja',
          isPopular: true,
          idealForBn: 'বিজয়া দশমী উপহার ও পারিবারিক আড্ডা',
          idealForEn: 'Bijoya Dashami Gifts & Family Feasts',
          itemsBn: [
            'খাঁটি কেশর রাজভোগ (২ পিস)',
            'নলেন গুড়ের নরম পাক সন্দেশ (৪ পিস)',
            'রসালো মালাই চমচম (২ পিস)',
            'রুপোলি তবক দেওয়া কাজু বরফি (৪ পিস)',
            'ঐতিহ্যবাহী চন্দ্রপুলি (২ পিস)',
            'দেশি গাওয়া ঘিয়ের ক্ষীরকদম (৪ পিস)'
          ],
          itemsEn: [
            'Pure Kesar Rajbhog (2 pcs)',
            'Aromatic Nolen Gur Sandesh (4 pcs)',
            'Juicy Malai Chamcham (2 pcs)',
            'Silver-foiled Kaju Barfi (4 pcs)',
            'Traditional Chandrapuli (2 pcs)',
            'Pure Desi Ghee Kheer Kadam (4 pcs)'
          ],
          descriptionBn: 'শারদোৎসবের শ্রেষ্ঠ মিষ্টান্ন দিয়ে সাজানো রয়্যাল উপহার বাক্স। স্বজনদের শুভেচ্ছা জানাতে বা ঠাকুর ঘরে নিবেদনে সেরা পছন্দ।',
          descriptionEn: 'The ultimate Durga Puja gift box featuring our master confectioners signature heritage creations.',
          badgeBn: 'সেরা উপহার থালি',
          badgeEn: 'Bestselling Gift Box'
        },
        {
          id: 'ashtami-bhog-thali',
          nameBn: 'মহাষ্টমী পুষ্পাঞ্জলি ভোগ থালি',
          nameEn: 'Maha Ashtami Sacred Bhog Thali',
          taglineBn: '১০০% খাঁটি গাওয়া ঘি ও টাটকা ছানায় তৈরি পূজোর বিশেষ ভোগ',
          taglineEn: '100% Pure Desi Ghee traditional offerings for Maha Ashtami Puja',
          weightBn: '৮০০ গ্রাম পবিত্র ভোগ',
          weightEn: '800g Sacred Bhog Thali',
          originalPrice: 480,
          preOrderPrice: 410,
          discountPercent: 15,
          festivalType: 'Durga Puja',
          idealForBn: 'অষ্টমীর সকালে দেবীকে ভোগ নিবেদন',
          idealForEn: 'Sacred Maha Ashtami Morning Puja Bhog',
          itemsBn: [
            'ঘিয়ে ভাজা খাঁটি মালদা মিহিদানা (২৫০ গ্রাম)',
            'রসে টইটম্বুর কামারপুকুর বোঁদে (২০০ গ্রাম)',
            'শাহী মতিচুর লাড্ডু (৪ পিস)',
            'মুচমুচে সাবেকি ছানার জিলিপি (৪ পিস)',
            'দেশি ঘিয়ের কুড়মুড়ে খাজা (৪ পিস)'
          ],
          itemsEn: [
            'Pure Ghee Maldahi Mihidana (250g)',
            'Juicy Kamarpukur Bonde (200g)',
            'Shahi Motichoor Laddu (4 pcs)',
            'Crisp Traditional Chanar Jilapi (4 pcs)',
            'Pure Ghee Layered Khaja (4 pcs)'
          ],
          descriptionBn: 'মহাষ্টমীর দেবীর চরণে নৈবেদ্য অর্পণে সম্পুর্ণ শুচিতাপূর্ণ দেশি ঘি ও গঙ্গাজলের স্নিগ্ধতায় তৈরি পবিত্র ভোগ থালি।',
          descriptionEn: 'Specially crafted pure vegetarian bhog prepared strictly with pure desi ghee for Maha Ashtami pushpanjali.',
          badgeBn: 'পবিত্র ভোগ স্পেশাল',
          badgeEn: 'Sacred Puja Bhog'
        },
        {
          id: 'bijoya-sammilani-hamper',
          nameBn: 'বিজয়া সম্মিলনী প্রীতি উপহার হ্যাম্পার',
          nameEn: 'Bijoya Dashami Sammilani Hamper',
          taglineBn: 'শুভ বিজয়ার মিষ্টিমুখ ও গুরুজনদের প্রণাম নিবেদনের জন্য',
          taglineEn: 'Sweet blessings & cordial greetings for Shubho Bijoya Dashami',
          weightBn: '১.২ কেজি পারিবারিক হ্যাম্পার',
          weightEn: '1.2 Kg Grand Hamper',
          originalPrice: 780,
          preOrderPrice: 660,
          discountPercent: 15,
          festivalType: 'Durga Puja',
          idealForBn: 'আত্মীয়স্বজন ও বন্ধুদের বাড়িতে বিজয়ার কোলাকুলি',
          idealForEn: 'Visiting Relatives & Corporate Greetings',
          itemsBn: [
            'বেকড স্পঞ্জ রসগোল্লা (৪ পিস)',
            'স্পেশাল দানাদার (৪ পিস)',
            'পেস্তা কাঠবাদাম সন্দেশ (৪ পিস)',
            'শক্তিগড়ের শাহী ল্যাংচা (৪ পিস)',
            'হালকা মিষ্টির কাঁচাগোল্লা (৪ পিস)'
          ],
          itemsEn: [
            'Creamy Baked Spongy Rosogolla (4 pcs)',
            'Special Malda Danadar (4 pcs)',
            'Pistachio Almond Sandesh (4 pcs)',
            'Shahi Lengcha (4 pcs)',
            'Tender Soft Kacha Golla (4 pcs)'
          ],
          descriptionBn: 'মা দুর্গার বিদায়বেলায় বিজয়ার মিষ্টিমুখে বড়দের আশীর্বাদ ও ছোটদের স্নেহের উপহার দিতে এই প্রিমিয়াম হ্যাম্পার অনন্য।',
          descriptionEn: 'The quintessential Bijoya Dashami celebratory hamper for family get-togethers and welcoming festive guests.',
          badgeBn: 'বিজয়া স্পেশাল',
          badgeEn: 'Bijoya Favorite'
        },
        {
          id: 'anandamoyee-mini-box',
          nameBn: 'আনন্দময়ী পূজা মিষ্টি বক্স',
          nameEn: 'Anandamoyee Mini Puja Box',
          taglineBn: 'সাশ্রয়ী মূল্যে ঐতিহ্যবাহী খাঁটি মিষ্টির প্রিয় চার পদ',
          taglineEn: 'Four beloved classic Bengali sweets at an affordable pre-order rate',
          weightBn: '৫০০ গ্রাম কিউট বক্স',
          weightEn: '500g Mini Box',
          originalPrice: 320,
          preOrderPrice: 270,
          discountPercent: 16,
          festivalType: 'Durga Puja',
          idealForBn: 'ব্যক্তিগত উপহার ও প্রতিবেশী মিষ্টিমুখ',
          idealForEn: 'Personal Gifts & Friendly Neighborhood Exchange',
          itemsBn: [
            'ঘিয়ের ছোট লাড্ডু (৪ পিস)',
            'ছোট নরম চমচম (৪ পিস)',
            'তালশাঁস সন্দেশ (২ পিস)',
            'নরম তুলতুলে ছোট রসগোল্লা (৪ পিস)'
          ],
          itemsEn: [
            'Pure Ghee Mini Laddu (4 pcs)',
            'Soft Mini Chamcham (4 pcs)',
            'Talshwas Sandesh (2 pcs)',
            'Spongy Mini Rosogolla (4 pcs)'
          ],
          descriptionBn: 'ছোট পরিবার বা বন্ধুদের সাথে পুজোর আড্ডায় মিষ্টিমুখ করার জন্য পরিমিত ও স্বাস্থ্যকর মিষ্টির মিষ্টি বাক্স।',
          descriptionEn: 'A sweet and compact box ideal for casual festive visits and sweetening everyday puja celebrations.',
          badgeBn: 'বাজেট ফ্রেন্ডলি',
          badgeEn: 'Budget Sweet Box'
        }
      ]
    },
    {
      id: 'kalipuja',
      nameBn: 'শ্রী শ্রী কালীপূজা ও দীপাবলি ২০২৬',
      nameEn: 'Kali Puja & Diwali 2026',
      taglineBn: 'আলোর উৎসবে আলোর রোশনাই আর মিষ্টির সুবাস',
      taglineEn: 'Festival of Lights illuminated with traditional ghee sweets',
      targetDate: '2026-11-08T18:00:00',
      badgeBn: 'শ্যামাপূজা উৎসব',
      badgeEn: 'Festival of Lights',
      descriptionBn: 'কালীপূজার অমাবস্যার রাতে প্রদীপের আলোয় মিষ্টি ভোগের পবিত্র সম্ভার। আতসবাজির আনন্দের সাথে ঘরে ঘরে পৌঁছে যাবে খাঁটি ঘিয়ের লাড্ডু ও কাজু বরফি।',
      descriptionEn: 'Celebrate the triumph of light with handcrafted Motichoor laddus, Kaju Katli, and rich mawa sweets made with pure cow ghee.',
      boxes: [
        {
          id: 'diwali-deepshikha-box',
          nameBn: 'দীপশিখা কাজু ও ক্ষীর রয়্যাল থালি',
          nameEn: 'Deepshikha Kaju & Mawa Royal Box',
          taglineBn: 'দীপাবলির স্পেশাল কাজু বরফি, কালাকাঁদ ও কেশর লাড্ডু',
          taglineEn: 'Diwali Special Kaju Katli, Kalakand & Kesar Motichoor',
          weightBn: '১ কেজি গিফট বক্স',
          weightEn: '1.0 Kg Royal Gift Box',
          originalPrice: 680,
          preOrderPrice: 580,
          discountPercent: 15,
          festivalType: 'Kali Puja',
          idealForBn: 'কালীপূজা ও দীপাবলি শুভেচ্ছা উপহার',
          idealForEn: 'Diwali Corporate & Family Gifting',
          itemsBn: ['কাজু বরফি (৮ পিস)', 'কেশর মতিচুর লাড্ডু (৬ পিস)', 'কালাকাঁদ (৪ পিস)', 'ড্রাই ফ্রুটস পেঁড়া (৪ পিস)'],
          itemsEn: ['Kaju Katli (8 pcs)', 'Kesar Motichoor Laddu (6 pcs)', 'Kalakand (4 pcs)', 'Dry Fruit Peda (4 pcs)'],
          descriptionBn: 'আলোর উৎসবের আভিজাত্যে তৈরি উজ্জ্বল উপহার সম্ভার।',
          descriptionEn: 'Luxurious Diwali gift box packed with rich dry-fruit and ghee specialties.',
          badgeBn: 'দীপাবলি স্পেশাল',
          badgeEn: 'Diwali Special'
        }
      ]
    },
    {
      id: 'bhaiphota',
      nameBn: 'ভ্রাতৃদ্বিতীয়া / ভাইফোঁটা ২০২৬',
      nameEn: 'Bhai Phota 2026',
      taglineBn: 'ভাইয়ের কপালে দিলাম ফোঁটা, যমের দুয়ারে পড়ল কাঁটা',
      taglineEn: 'Celebrate sibling love with special Bhai Phota Sandesh thali',
      targetDate: '2026-11-10T08:00:00',
      badgeBn: 'ভ্রাতৃদ্বিতীয়া',
      badgeEn: 'Sibling Celebration',
      descriptionBn: 'ভাইফোঁটার সকালে দিদি-বোনেদের হাতের আশীর্বাদের থালায় চাই মালদার সেরা কড়া পাকের সন্দেশ, রসকদম্ব ও রাজকীয় মিষ্টি।',
      descriptionEn: 'Blessings of sisters and the joyful laughter of brothers accompanied by traditional Bengali Sandesh and Rosokadamba.',
      boxes: [
        {
          id: 'bhaiphota-snehathali',
          nameBn: 'স্নেহের ভাইফোঁটা স্পেশাল মিষ্টি থালি',
          nameEn: 'Sneher Bhai Phota Special Sandesh Thali',
          taglineBn: 'ভাইয়ের প্রিয় শঙ্খ সন্দেশ, রসকদম্ব ও ক্ষীর চমচম',
          taglineEn: 'Brother\'s favorite Shankha Sandesh, Rosokadamba & Malai Chamcham',
          weightBn: '৮০০ গ্রাম থালি',
          weightEn: '800g Special Thali',
          originalPrice: 520,
          preOrderPrice: 440,
          discountPercent: 15,
          festivalType: 'Bhai Phota',
          idealForBn: 'ভাইফোঁটার মিষ্টিমুখ ও আশীর্বাদ পর্ব',
          idealForEn: 'Traditional Bhai Phota Rituals',
          itemsBn: ['শঙ্খ ছাঁচ সন্দেশ (৪ পিস)', 'মালদা রসকদম্ব (৪ পিস)', 'ক্ষীর চমচম (৪ পিস)', 'রসগোল্লা (৪ পিস)'],
          itemsEn: ['Conch Shell Sandesh (4 pcs)', 'Malda Rosokadamba (4 pcs)', 'Kheer Chamcham (4 pcs)', 'Rosogolla (4 pcs)'],
          descriptionBn: 'ভাইয়ের দীর্ঘায়ু কামনায় দিদি-বোনেদের পছন্দের সেরা মিষ্টি সম্ভার।',
          descriptionEn: 'The traditional Bhai Phota sweet tray to celebrate unconditional sibling affection.',
          badgeBn: 'ভাইফোঁটা বেস্টসেলার',
          badgeEn: 'Bhai Phota Favorite'
        }
      ]
    },
    {
      id: 'nababarsho',
      nameBn: 'পয়লা বৈশাখ ১৪৩৪',
      nameEn: 'Poila Boishakh (Bengali New Year)',
      taglineBn: 'নতুন বছরের আগমনীতে মিষ্টিমুখ ও শুভ হালখাতা',
      taglineEn: 'Welcome the Bengali New Year with traditional Haalkhata sweets',
      targetDate: '2027-04-15T06:00:00',
      badgeBn: 'নববর্ষের শুভ হালখাতা',
      badgeEn: 'Bengali New Year',
      descriptionBn: 'বৈশাখী প্রভাতে নতুন পোশাকের সুবাসে ও নতুন বছরের প্রার্থনায় ঘোষ সুইট হাউজের নলেন গুড়ের মিষ্টি ও ছানার পায়েশ সবার প্রিয়।',
      descriptionEn: 'Ring in the prosperous Bengali New Year with auspicious sweets for Hal-khata and new beginnings.',
      boxes: [
        {
          id: 'nababarsho-milan-box',
          nameBn: 'নববর্ষ মিলন মিষ্টি উপহার বাক্স',
          nameEn: 'Nababarsho Milan Sweets Box',
          taglineBn: 'নতুন বছরের শুভেচ্ছা ও হালখাতার মিষ্টি সম্ভার',
          taglineEn: 'Celebratory sweets for Bengali New Year greetings',
          weightBn: '৭৫০ গ্রাম বক্স',
          weightEn: '750g Sweet Box',
          originalPrice: 490,
          preOrderPrice: 420,
          discountPercent: 14,
          festivalType: 'Poila Boishakh',
          idealForBn: 'হালখাতা ও নতুন বছরের শুভেচ্ছা বিনিময়',
          idealForEn: 'Haalkhata & New Year Hospitality',
          itemsBn: ['সন্দেশ (৪ পিস)', 'রসগোল্লা (৪ পিস)', 'লাড্ডু (৪ পিস)', 'চমচম (৪ পিস)'],
          itemsEn: ['Sandesh (4 pcs)', 'Rosogolla (4 pcs)', 'Laddu (4 pcs)', 'Chamcham (4 pcs)'],
          descriptionBn: 'নতুন বছরের হালখাতা ও অতিথি আপ্যায়নে নিখুঁত মিষ্টির বাক্স।',
          descriptionEn: 'Traditional sweets to kickstart the joyous Bengali New Year.',
          badgeBn: 'নববর্ষ স্পেশাল',
          badgeEn: 'New Year Special'
        }
      ]
    }
  ];

  const currentFestival = festivals.find(f => f.id === activeFestivalId) || festivals[0];

  // Real-time live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = new Date(currentFestival.targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [currentFestival.targetDate]);

  const handleOpenPreOrder = (box: FestivalSweetBox) => {
    setSelectedBox(box);
    setIsPreOrderModalOpen(true);
  };

  const handleQuickAdd = (box: FestivalSweetBox) => {
    addToCart(
      {
        id: `preorder-${box.id}`,
        nameBn: `[অগ্রিম বুকিং] ${box.nameBn}`,
        nameEn: `[Pre-Order] ${box.nameEn}`,
        category: 'special',
        portionBn: box.weightBn,
        portionEn: box.weightEn,
        price: box.preOrderPrice,
        secondaryPrice: {
          portionBn: 'নিয়মিত মূল্য',
          portionEn: 'Regular Price',
          price: box.originalPrice
        },
        badgeBn: `পূজো প্রি-অর্ডার • ${box.discountPercent}% ছাড়`,
        badgeEn: `Puja Pre-Order • ${box.discountPercent}% OFF`,
        isBestSeller: true,
        isFeatured: true,
        descriptionBn: box.descriptionBn,
        descriptionEn: box.descriptionEn,
        image: ''
      },
      `${language === 'bn' ? box.weightBn : box.weightEn} • ${language === 'bn' ? 'পূজো প্রি-অর্ডার' : 'Puja Pre-Order'}`,
      box.preOrderPrice
    );
  };

  return (
    <section
      id="festivals"
      className="py-16 sm:py-24 relative overflow-hidden transition-colors"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% 15%, rgba(120, 30, 20, 0.25) 0%, rgba(21, 13, 8, 1) 75%)'
          : 'radial-gradient(ellipse at 50% 15%, rgba(254, 243, 199, 0.7) 0%, rgba(252, 249, 244, 1) 75%)'
      }}
    >
      {/* Decorative Autumn Kash Phool & Diya Floating Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-10 left-8 text-amber-500/20 text-7xl font-serif select-none">🪔</div>
        <div className="absolute top-40 right-10 text-amber-500/15 text-8xl font-serif select-none">🌾</div>
        <div className="absolute bottom-20 left-16 text-amber-500/15 text-8xl font-serif select-none">🥁</div>
        <div className="absolute bottom-10 right-20 text-amber-500/20 text-7xl font-serif select-none">🌺</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header & Festive Tabs */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            {/* Festival Switcher Segmented Control */}
            <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-stone-900/10 dark:bg-stone-900/70 border border-amber-500/20 backdrop-blur-md mb-6 max-w-full overflow-x-auto">
              {festivals.map((fest) => {
                const isActive = activeFestivalId === fest.id;
                return (
                  <button
                    key={fest.id}
                    type="button"
                    onClick={() => setActiveFestivalId(fest.id as any)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                        : isDark
                        ? 'text-stone-400 hover:text-stone-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'bn' ? fest.nameBn : fest.nameEn}
                  </button>
                );
              })}
            </div>

            {/* Editorial Title */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-amber-500 text-lg">🪔</span>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 font-serif">
                {language === 'bn' ? currentFestival.badgeBn : currentFestival.badgeEn}
              </span>
              <span className="text-amber-500 text-lg">🪔</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-bengali tracking-tight text-stone-900 dark:text-amber-100">
              {language === 'bn' ? currentFestival.nameBn : currentFestival.nameEn}
            </h2>

            <p className="mt-3 text-sm sm:text-base text-stone-600 dark:text-stone-300 font-bengali leading-relaxed">
              {language === 'bn' ? currentFestival.taglineBn : currentFestival.taglineEn}
            </p>
          </div>
        </ScrollReveal>

        {/* Real-time Festival Countdown Clock Card */}
        <ScrollReveal>
          <div
            className={`max-w-4xl mx-auto rounded-3xl p-5 sm:p-8 border relative overflow-hidden shadow-2xl mb-12 sm:mb-16 ${
              isDark
                ? 'bg-gradient-to-br from-[#24130A] via-[#1A0E08] to-[#120905] border-amber-500/30'
                : 'bg-gradient-to-br from-[#FFFBF2] via-[#FFF6E5] to-[#FDF0D5] border-amber-700/20'
            }`}
          >
            {/* Traditional Bengali Pattern Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Countdown Context */}
              <div className="md:max-w-xs space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'উৎসব শুরু হতে বাকি' : 'Festival Countdown'}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-bengali text-stone-900 dark:text-amber-200">
                  {language === 'bn' ? 'মহাষষ্ঠীর পুজো শুভলগ্ন' : 'Puja Mahashasthi Arrival'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-bengali leading-snug">
                  {language === 'bn'
                    ? 'অগ্রিম বুকিং করে নিশ্চিত করুন প্রিয় ভোগ থালি ও সীমিত সংস্করণের মিষ্টি উপহার।'
                    : 'Pre-order now to secure handcrafted bhog thalis and skip festival counter rush.'}
                </p>
              </div>

              {/* Live Numeric Ticker Boxes */}
              <div className="grid grid-cols-4 gap-2 sm:gap-4 flex-1 max-w-lg mx-auto md:mx-0">
                {/* 1. Days */}
                <div
                  className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col justify-center transition-all ${
                    isDark
                      ? 'bg-stone-900/80 border-amber-500/20 text-amber-300'
                      : 'bg-white border-amber-200 text-amber-900 shadow-sm'
                  }`}
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums leading-none">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1 font-bengali">
                    {language === 'bn' ? 'দিন' : 'Days'}
                  </span>
                </div>

                {/* 2. Hours */}
                <div
                  className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col justify-center transition-all ${
                    isDark
                      ? 'bg-stone-900/80 border-amber-500/20 text-amber-300'
                      : 'bg-white border-amber-200 text-amber-900 shadow-sm'
                  }`}
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1 font-bengali">
                    {language === 'bn' ? 'ঘণ্টা' : 'Hours'}
                  </span>
                </div>

                {/* 3. Minutes */}
                <div
                  className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col justify-center transition-all ${
                    isDark
                      ? 'bg-stone-900/80 border-amber-500/20 text-amber-300'
                      : 'bg-white border-amber-200 text-amber-900 shadow-sm'
                  }`}
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1 font-bengali">
                    {language === 'bn' ? 'মিনিট' : 'Mins'}
                  </span>
                </div>

                {/* 4. Seconds */}
                <div
                  className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col justify-center transition-all ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-amber-100/60 border-amber-300 text-amber-900 shadow-sm'
                  }`}
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums leading-none animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-1 font-bengali">
                    {language === 'bn' ? 'সেকেন্ড' : 'Secs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Puja Pre-Order Privilege Badges */}
            <div className="mt-6 pt-5 border-t border-amber-500/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="font-semibold font-bengali text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? '১৫% ফ্ল্যাট আর্লি ছাড়' : 'Flat 15% Pre-Order Off'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="font-semibold font-bengali text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'ফ্রি বিজয়া শুভেচ্ছা কার্ড' : 'Free Greeting Card'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="font-semibold font-bengali text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'লাইনহীন এক্সপ্রেস পিকআপ' : 'Priority Counter Pickup'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="font-semibold font-bengali text-stone-700 dark:text-stone-300">
                  {language === 'bn' ? 'নির্ধারিত দিনে ডেলিভারি' : 'Guaranteed Day Delivery'}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Section Heading for Limited Edition Pre-Order Boxes */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-serif block">
              {language === 'bn' ? 'শারদীয়া বিশেষ কালেকশন' : 'Exclusive Limited Edition'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-bengali text-stone-900 dark:text-amber-100">
              {language === 'bn' ? 'অগ্রিম বুকিংয়ের মিষ্টি বাক্স ও ভোগ থালি' : 'Pre-Order Sweet Boxes & Bhog Thalis'}
            </h3>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 font-bengali max-w-sm">
            {language === 'bn'
              ? 'পুজোর দিনগুলোতে সেরা মানের টাটকা মিষ্টি পাওয়ার জন্য আজই অগ্রিম বুকিং করে রাখুন।'
              : 'Handcrafted fresh daily during festival days with guaranteed quality and purity.'}
          </p>
        </div>

        {/* Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentFestival.boxes.map((box) => (
            <div
              key={box.id}
              className={`rounded-3xl overflow-hidden border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl group ${
                isDark
                  ? 'bg-[#1C110B] border-amber-500/25 hover:border-amber-500/60'
                  : 'bg-white border-amber-700/15 hover:border-amber-700/40 shadow-stone-200/50'
              }`}
            >
              {/* Box Top Header / Artistic Festive Visual Plate */}
              <div className="relative p-5 pb-4 bg-gradient-to-br from-amber-600/20 via-red-600/10 to-transparent border-b border-amber-500/15">
                {/* Traditional Decorative Alpana Corner Motifs */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bengali shadow-sm">
                    {language === 'bn' ? box.badgeBn : box.badgeEn}
                  </span>

                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {box.discountPercent}% OFF
                  </span>
                </div>

                {/* Box Title */}
                <h4 className="text-lg font-bold font-bengali text-stone-900 dark:text-amber-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {language === 'bn' ? box.nameBn : box.nameEn}
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400 font-bengali mt-1 line-clamp-2">
                  {language === 'bn' ? box.taglineBn : box.taglineEn}
                </p>

                {/* Weight / Portion & Occasion Note */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300 pt-2 border-t border-amber-500/15">
                  <span className="font-mono font-semibold">
                    Net: {language === 'bn' ? box.weightBn : box.weightEn}
                  </span>
                  <span className="font-bengali truncate text-amber-700 dark:text-amber-300">
                    {language === 'bn' ? box.idealForBn : box.idealForEn}
                  </span>
                </div>
              </div>

              {/* Box Content Items List */}
              <div className="p-4 sm:p-5 flex-1 space-y-3 text-xs">
                <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block font-bengali">
                  {language === 'bn' ? 'বাক্সে যা যা থাকছে:' : 'Curated Sweets Included:'}
                </span>

                <ul className="space-y-1.5 text-stone-700 dark:text-stone-300">
                  {(language === 'bn' ? box.itemsBn : box.itemsEn).slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-bengali">
                      <span className="text-amber-500 font-bold">•</span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                  {box.itemsBn.length > 4 && (
                    <li className="text-[11px] text-amber-600 dark:text-amber-400 font-bengali italic pl-3">
                      {language === 'bn'
                        ? `+ আরও ${(box.itemsBn.length - 4)}টি বিশেষ মিষ্টি...`
                        : `+ ${(box.itemsBn.length - 4)} more festive sweets...`}
                    </li>
                  )}
                </ul>
              </div>

              {/* Price & Action Section */}
              <div
                className={`p-4 sm:p-5 pt-3 border-t transition-colors ${
                  isDark ? 'border-amber-500/15 bg-stone-900/30' : 'border-stone-100 bg-stone-50/50'
                }`}
              >
                <div className="flex items-baseline justify-between mb-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block font-bengali">
                      {language === 'bn' ? 'প্রি-অর্ডার রেট' : 'Pre-Order Price'}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                        ₹{box.preOrderPrice}
                      </span>
                      <span className="text-xs font-mono text-stone-400 line-through">
                        ₹{box.originalPrice}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-bengali">
                    {language === 'bn'
                      ? `সাশ্রয় ₹${box.originalPrice - box.preOrderPrice}`
                      : `Save ₹${box.originalPrice - box.preOrderPrice}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPreOrder(box)}
                    id={`preorder-open-btn-${box.id}`}
                    className="w-full py-2.5 px-3 rounded-xl font-bold font-bengali text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'অগ্রিম বুকিং করুন' : 'Pre-Order Now'}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(box)}
                    id={`quick-add-btn-${box.id}`}
                    className={`w-full py-2 px-3 rounded-xl font-semibold font-bengali text-xs border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                      isDark
                        ? 'border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3 text-amber-500" />
                    <span>{language === 'bn' ? 'দ্রুত কার্টে নিন' : 'Quick Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Festive Notice */}
        <div className="mt-12 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400 font-bengali flex items-center justify-center gap-2">
            <span>🪔</span>
            <span>
              {language === 'bn'
                ? 'দুর্গোৎসবের দিনগুলোতে মিষ্টির খাঁটি স্বাদ ও মান রক্ষায় আমাদের কারিগরেরা সার্বক্ষণিক প্রস্তুত। বাল্ক বা কর্পোরেট অর্ডারের জন্য সরাসরি দোকানে বা ফোনে যোগাযোগ করুন।'
                : 'Bulk pandal and corporate puja gift hampers available. Call or WhatsApp our shop for custom inquiries.'}
            </span>
            <span>🪔</span>
          </p>
        </div>
      </div>

      {/* Pre-Order Customizer Modal */}
      <PreOrderModal
        isOpen={isPreOrderModalOpen}
        onClose={() => setIsPreOrderModalOpen(false)}
        box={selectedBox}
        festivalNameBn={currentFestival.nameBn}
        festivalNameEn={currentFestival.nameEn}
      />
    </section>
  );
};
