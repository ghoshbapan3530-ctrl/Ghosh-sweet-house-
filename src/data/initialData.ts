import { ProductItem, ReviewItem, GalleryItem, ShopDetails } from '../types';

export const initialShopDetails: ShopDetails = {
  nameBn: 'ঘোষ মিষ্টান্ন ভাণ্ডার',
  nameEn: 'GHOSH SWEET HOUSE',
  taglineBn: 'খাঁটি স্বাদ • ঐতিহ্যের মিষ্টতা',
  taglineEn: 'Pure Sweets • Fresh Joy',
  phone: '9733363562',
  whatsapp: '919733363562',
  addressBn: 'দুইসাটাবিঘি, কালিয়াচক, মালদা',
  addressEn: 'Duisatabighi, Kaliachak, Malda',
  cityBn: 'মালদা, পশ্চিমবঙ্গ',
  cityEn: 'Malda, West Bengal',
  stateCountryBn: 'পশ্চিমবঙ্গ, ভারত',
  stateCountryEn: 'West Bengal, India',
  mapsUrl: 'https://share.google/R4PQhBVdyhnxs9Hxj',
  openingHoursBn: 'প্রতিদিন সকাল ৬:০০ - রাত ১০:০০',
  openingHoursEn: 'Everyday 6:00 AM - 10:00 PM',
  establishedBn: 'ঐতিহ্যের স্বাদ ও বিশুদ্ধতার প্রতীক',
  establishedEn: 'Traditional Taste Since Always',
  registrationNo: 'UDYAM-I-WB-11-4412198'
};

export const initialProducts: ProductItem[] = [
  // 1a. Small Rosogolla (ছোট রসগোল্লা - ৫ পিস ₹60, ১০ পিস ₹110)
  {
    id: 'small-rosogolla',
    nameBn: 'ছোট রসগোল্লা',
    nameEn: 'Small Rosogolla',
    category: 'sweet',
    portionBn: '৫ পিস',
    portionEn: '5 pcs',
    price: 60,
    secondaryPrice: {
      portionBn: '১০ পিস',
      portionEn: '10 pcs',
      price: 110,
    },
    badgeBn: 'রসগোল্লা • ৫ পিস',
    badgeEn: 'Signature • 5 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'হালকা মিষ্টির তুলতুলে নরম ছোট দানার স্পঞ্জ রসগোল্লা। খাঁটি দেশি গরুর দুধের ছানায় তৈরি, রসে টইটম্বুর ও মুখে দিলেই গলে যায়।',
    descriptionEn: 'Soft, melt-in-mouth bite-sized traditional Bengali spongy cottage cheese rosogollas soaked in pure cardamom syrup.',
    nutrition: {
      servingSizeBn: '১ পিস (৩০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 30g)',
      calories: 78,
      sugar: 12.5,
      protein: 2.2,
      fat: 1.8
    }
  },
  // 1b. Big Rosogolla (বড় রসগোল্লা - ৫ পিস ₹60, ১০ পিস ₹110)
  {
    id: 'big-rosogolla',
    nameBn: 'বড় রসগোল্লা',
    nameEn: 'Big Rosogolla (King Size)',
    category: 'sweet',
    portionBn: '৫ পিস',
    portionEn: '5 pcs',
    price: 60,
    secondaryPrice: {
      portionBn: '১০ পিস',
      portionEn: '10 pcs',
      price: 110,
    },
    badgeBn: 'বড় রসগোল্লা • ৫ পিস',
    badgeEn: 'King Size • 5 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ধবধবে সাদা বড় সাইজের স্পঞ্জি ছানার রসগোল্লা। রসে ভরপুর, এলাচের মন মাতানো সুবাস ও ঘোষ মিষ্টান্ন ভাণ্ডারের প্রধান আকর্ষণ।',
    descriptionEn: 'Classic large king-sized spongy cottage cheese balls soaked in fragrant sugar syrup, prepared fresh daily.',
    nutrition: {
      servingSizeBn: '১ পিস (৬০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 60g)',
      calories: 156,
      sugar: 25.0,
      protein: 4.4,
      fat: 3.6
    }
  },
  // 2. Golapjamun (গোলাপজামুন - ৫ পিস ₹70, ১০ পিস ₹130)
  {
    id: 'golapjamun',
    nameBn: 'গোলাপজামুন',
    nameEn: 'Royal Golapjamun',
    category: 'sweet',
    portionBn: '৫ পিস',
    portionEn: '5 pcs',
    price: 70,
    secondaryPrice: {
      portionBn: '১০ পিস',
      portionEn: '10 pcs',
      price: 130,
    },
    badgeBn: 'রয়েল মিষ্টি',
    badgeEn: 'Royal Sweet',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'দেশি ঘিয়ে ভাজা রসালো ক্ষীরের সোনালী-বাদামি গোলাপজামুন। এলাচ ও গোলাপ জলের অতুলনীয় মিষ্টি।',
    descriptionEn: 'Deep-fried golden brown dumplings made of thickened milk solids soaked in rose scented syrup.',
    nutrition: {
      servingSizeBn: '১ পিস (৫০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 50g)',
      calories: 175,
      sugar: 19.0,
      protein: 3.5,
      fat: 7.2
    }
  },
  // 3. Lal Rosogolla (লাল রসগোল্লা - ৫ পিস ₹70, ১০ পিস ₹130)
  {
    id: 'lal-rosogolla',
    nameBn: 'লাল রসগোল্লা',
    nameEn: 'Lal Rosogolla',
    category: 'sweet',
    portionBn: '৫ পিস',
    portionEn: '5 pcs',
    price: 70,
    secondaryPrice: {
      portionBn: '১০ পিস',
      portionEn: '10 pcs',
      price: 130,
    },
    badgeBn: 'ঐতিহ্যবাহী',
    badgeEn: 'Heritage Special',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'নলেন গুড় ও ক্যারামেল স্বাদে প্রস্তুত বিশেষ লাল রঙের নরম তুলতুলে রসগোল্লা।',
    descriptionEn: 'Traditional caramelised aromatic red cottage cheese balls in rich fragrant syrup.',
    nutrition: {
      servingSizeBn: '১ পিস (৫৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 55g)',
      calories: 145,
      sugar: 23.0,
      protein: 4.1,
      fat: 3.2
    }
  },
  // 4. Rosogodam (রসোগোদাম - ৬ পিস ₹100)
  {
    id: 'rosogodam',
    nameBn: 'রসোগোদাম',
    nameEn: 'Rosogodam',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 100,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 195,
    },
    badgeBn: 'ঘোষ স্পেশাল • ৬ পিস',
    badgeEn: 'Ghosh Signature • 6 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'মালদার বিখ্যাত বিশেষ ক্ষীর ও পেস্তা দিয়ে তৈরি অভিনব রসোগোদাম।',
    descriptionEn: 'Our special Malda delicacy stuffed with saffron kheer and garnished with sliced pistachios.',
    nutrition: {
      servingSizeBn: '১ পিস (৬৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 65g)',
      calories: 210,
      sugar: 22.0,
      protein: 5.6,
      fat: 9.0
    }
  },
  // 5. Laddu (ঘিয়ে ভাজা লাড্ডু - ৬ পিস ₹70, ১ কেজি ₹200)
  {
    id: 'laddu',
    nameBn: 'ঘিয়ে ভাজা লাড্ডু',
    nameEn: 'Ghee Motichoor Laddu',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 70,
    secondaryPrice: {
      portionBn: '১ কেজি',
      portionEn: '1 kg',
      price: 200,
    },
    isPerKg: true,
    pricePerKg: 200,
    badgeBn: 'বিশুদ্ধ ঘি • ৬ পিস',
    badgeEn: 'Pure Desi Ghee • 6 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'খাঁটি দেশি ঘিয়ে ভাজা জাফরান মিশ্রিত মতিচুর ও বেসনের লাড্ডু।',
    descriptionEn: 'Fine gram-flour pearls fried in pure clarified butter and infused with fragrant cardamom and saffron.',
    nutrition: {
      servingSizeBn: '১ পিস (৪৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 45g)',
      calories: 185,
      sugar: 16.5,
      protein: 3.8,
      fat: 10.5
    }
  },
  // 6. Chamcham (চমচম - ৬ পিস ₹90)
  {
    id: 'chamcham',
    nameBn: 'চমচম',
    nameEn: 'Malai Chamcham',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 90,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 175,
    },
    badgeBn: 'বাঙালি ক্লাসিক • ৬ পিস',
    badgeEn: 'Bengali Classic • 6 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'তাজা ছানা ও মালাইয়ে মোড়ানো ঐতিহ্যবাহী বাঙালি পোড়া চমচম।',
    descriptionEn: 'Classic cylindrical cottage cheese delicacies rolled in dry mawa and topped with saffron malai.',
    nutrition: {
      servingSizeBn: '১ পিস (৫৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 55g)',
      calories: 165,
      sugar: 18.0,
      protein: 4.8,
      fat: 6.5
    }
  },
  // 7. Dommisri (ডমমিশ্রী / দানামিশ্রী - ৬ পিস ₹90)
  {
    id: 'dommisri',
    nameBn: 'ডমমিশ্রী',
    nameEn: 'Dammisri Sweets',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 90,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 175,
    },
    badgeBn: 'বিশেষ স্বাদ • ৬ পিস',
    badgeEn: 'Special Taste • 6 pcs',
    isBestSeller: false,
    descriptionBn: 'মিশ্রি ও খাঁটি খোয়া ক্ষীরের মেলবন্ধনে তৈরি দারুণ সুস্বাদু ডমমিশ্রী।',
    descriptionEn: 'Rich crystallized milk delicacy crafted with premium rock sugar crystals and roasted mawa.',
    nutrition: {
      servingSizeBn: '১ পিস (৫০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 50g)',
      calories: 190,
      sugar: 21.0,
      protein: 4.5,
      fat: 8.0
    }
  },
  // 8. Durgavog (দুর্গাভোগ - ৬ পিস ₹90)
  {
    id: 'durgavog',
    nameBn: 'দুর্গাভোগ',
    nameEn: 'Royal Durgavog',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 90,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 175,
    },
    badgeBn: 'পূজা স্পেশাল • ৬ পিস',
    badgeEn: 'Puja Special • 6 pcs',
    isBestSeller: false,
    isFeatured: true,
    descriptionBn: 'মা দুর্গার ভোগের জন্য প্রস্তুত পবিত্র কেশর ও ক্ষীরের লাবণ্যময় মিষ্টি।',
    descriptionEn: 'A sanctified preparation infused with natural saffron, nutmeg, and dense chana for grand occasions.',
    nutrition: {
      servingSizeBn: '১ পিস (৬০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 60g)',
      calories: 205,
      sugar: 19.5,
      protein: 5.4,
      fat: 9.2
    }
  },
  // 9. Peyara (পেয়ারা মিষ্টি - ৬ পিস ₹80)
  {
    id: 'peyera',
    nameBn: 'পেয়ারা মিষ্টি',
    nameEn: 'Peyara Sandesh',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 80,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 155,
    },
    badgeBn: 'নরম ছানা • ৬ পিস',
    badgeEn: 'Soft Sandesh • 6 pcs',
    isBestSeller: false,
    descriptionBn: 'হালকা মিষ্টির নিখুঁত ছানার গোল সন্দেশ, সুস্বাদু ও মনোরম পেয়ারা মিষ্টি।',
    descriptionEn: 'Lightly sweetened soft-dough chana sandesh styled elegantly with cardamom fragrance.',
    nutrition: {
      servingSizeBn: '১ পিস (৪০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 40g)',
      calories: 135,
      sugar: 13.0,
      protein: 4.9,
      fat: 5.1
    }
  },
  // 10. Goljam (গোলজাম - ৬ পিস ₹80)
  {
    id: 'goljam',
    nameBn: 'গোলজাম',
    nameEn: 'Goljam Sweets',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 80,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 155,
    },
    badgeBn: 'রসালো • ৬ পিস',
    badgeEn: 'Juicy • 6 pcs',
    isBestSeller: false,
    descriptionBn: 'গাঢ় রসে টইটম্বুর গোল গোল সুস্বাদু কালোজাম বা গোলজাম।',
    descriptionEn: 'Rich, caramelized dark dumplings soaked through to the core in spiced sugar nectar.',
    nutrition: {
      servingSizeBn: '১ পিস (৫৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 55g)',
      calories: 180,
      sugar: 21.5,
      protein: 3.6,
      fat: 7.5
    }
  },
  // 11. Fish legs kheer (ফিশ লেগস ক্ষীর - ৬ পিস ₹120)
  {
    id: 'fish-legs-kheer',
    nameBn: 'ফিশ লেগস (ক্ষীর)',
    nameEn: 'Fish Legs (Kheer Special)',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 120,
    secondaryPrice: {
      portionBn: '১২ পিস',
      portionEn: '12 pcs',
      price: 230,
    },
    badgeBn: 'অনবদ্য সৃষ্টি • ৬ পিস',
    badgeEn: 'Chef Specialty • 6 pcs',
    isBestSeller: false,
    isFeatured: true,
    descriptionBn: 'ঘন ক্ষীরের আবরণে তৈরি অতুলনীয় স্বাদের শৈল্পিক মিষ্টি।',
    descriptionEn: 'Artisanal sweet crafted from dense, creamy reduced milk with delicate silver foil and pistachio.',
    nutrition: {
      servingSizeBn: '১ পিস (৬০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 60g)',
      calories: 220,
      sugar: 20.0,
      protein: 6.2,
      fat: 11.0
    }
  },
  // 12. Jelebi (রসালো জিলাপি - ₹100 বা তার বেশি হওয়ায় কেজি ইউনিট: ১ কেজি ₹120)
  {
    id: 'jelebi',
    nameBn: 'রসালো জিলাপি',
    nameEn: 'Crispy & Syrupy Jalebi',
    category: 'sweet',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 120,
    isPerKg: true,
    pricePerKg: 120,
    secondaryPrice: {
      portionBn: '৫০০ গ্রাম',
      portionEn: '500g',
      price: 60,
    },
    badgeBn: 'মচমচে রসালো',
    badgeEn: 'Crispy Jalebi',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ঘিয়ে ভাজা সোনালী প্যাঁচের মচমচে গরম রসালো জিলাপি। মুখে দিলেই জাফরানি রসে মন ভরে যায়।',
    descriptionEn: 'Traditional crispy golden swirls freshly fried and soaked in saffron-cardamom sugar syrup.',
    nutrition: {
      servingSizeBn: '১০০ গ্রাম (৩-৪ প্যাঁচ)',
      servingSizeEn: '100g portion',
      calories: 290,
      sugar: 32.0,
      protein: 3.2,
      fat: 9.0
    }
  },
  // 13. Batasa (খাঁটি কদমা বাতাসা - ₹100 বা তার বেশি হওয়ায় কেজি ইউনিট: ১ কেজি ₹120)
  {
    id: 'batasa',
    nameBn: 'খাঁটি কদমা বাতাসা',
    nameEn: 'Pure Kadma Batasa',
    category: 'sweet',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 120,
    isPerKg: true,
    pricePerKg: 120,
    secondaryPrice: {
      portionBn: '৫০০ গ্রাম',
      portionEn: '500g',
      price: 60,
    },
    badgeBn: 'পূজা স্পেশাল',
    badgeEn: 'Puja Special',
    isBestSeller: false,
    descriptionBn: 'পূজা ও হরির লুটের জন্য খাঁটি চিনি ও গুড়ের তৈরি হালকা খাস্তা মুচমুচে বাতাসা।',
    descriptionEn: 'Traditional light, crisp drop-candies made from pure boiled sugar syrup for holy puja offerings.',
    nutrition: {
      servingSizeBn: '৫০ গ্রাম',
      servingSizeEn: '50g portion',
      calories: 195,
      sugar: 48.0,
      protein: 0.1,
      fat: 0.0
    }
  },
  // 14. Rosmalai (কেশরিয়া রসমলাই - ১ পিস ₹20, ২০ পিস ₹300)
  {
    id: 'rosmalai',
    nameBn: 'রসমলাই',
    nameEn: 'Kesaria Rosmalai',
    category: 'sweet',
    portionBn: '১ পিস',
    portionEn: '1 pc',
    price: 20,
    secondaryPrice: {
      portionBn: '২০ পিস (বক্স)',
      portionEn: '20 pcs (Box)',
      price: 300,
    },
    badgeBn: 'জাফরানি ক্ষীর • ১ পিস',
    badgeEn: 'Kesari Rabdi • 1 pc',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ঘন জাফরানি দুধ ও ক্ষীরে ডোবানো নরম তুলতুলে ছানার রসমলাই। মুখে দিলেই মালাইয়ের স্বাদ ছড়িয়ে পড়ে।',
    descriptionEn: 'Delicate mini paneer dumplings floating in creamy, thickened milk flavored with saffron and cardamom.',
    nutrition: {
      servingSizeBn: '১ পিস (ক্ষীর মালাই সহ)',
      servingSizeEn: '1 piece with rabdi',
      calories: 110,
      sugar: 9.5,
      protein: 3.5,
      fat: 5.0
    }
  },
  // 15. Dai (মালদার খাঁটি মিষ্টি দই - ১০ পিস ₹100, ১ কেজি ₹150)
  {
    id: 'dai',
    nameBn: 'মালদার খাঁটি মিষ্টি দই',
    nameEn: 'Malda Authentic Mishti Doi',
    category: 'sweet',
    portionBn: '১০ পিস (মাটির ভাঁড়)',
    portionEn: '10 pcs (Earthen Cups)',
    price: 100,
    isPerKg: true,
    pricePerKg: 150,
    secondaryPrice: {
      portionBn: '১ কেজি (মাটির হাঁড়ি)',
      portionEn: '1 kg (Clay Pot)',
      price: 150,
    },
    badgeBn: 'মাটির হাঁড়ি • ১০ পিস',
    badgeEn: 'Clay Pot • 10 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'মাটির পাতিলে পাতানো খাঁটি ঘন দুধের ক্ষীরসা মিষ্টি দই, সোনালী সরের স্তরযুক্ত।',
    descriptionEn: 'Authentic fermented sweet curd set in traditional earthen pots with a caramelized cream top layer.',
    nutrition: {
      servingSizeBn: '১০০ গ্রাম',
      servingSizeEn: '100g serving',
      calories: 160,
      sugar: 17.0,
      protein: 4.5,
      fat: 6.0
    }
  },

  // --- SNACKS SECTION ---
  // 16. Samosa (মুচমুচে সমুচা / সিঙাড়া - ৭ পিস ₹70)
  {
    id: 'samosa',
    nameBn: 'মুচমুচে সমুচা (সিঙাড়া)',
    nameEn: 'Crispy Singara / Samosa',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 70,
    secondaryPrice: {
      portionBn: '১৪ পিস',
      portionEn: '14 pcs',
      price: 135,
    },
    badgeBn: 'তাজা সিঙাড়া • ৭ পিস',
    badgeEn: 'Fresh Samosa • 7 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'পাঁচফোড়ন ও চিনাবাদাম মিশ্রিত আলুর পুরে ভরা খাস্তা গরম গরম বাঙালি সিঙাড়া।',
    descriptionEn: 'Bengali style crispy golden samosa filled with spiced potato cubes, roasted peanuts, and green peas.',
    nutrition: {
      servingSizeBn: '১ পিস (৭০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 70g)',
      calories: 180,
      sugar: 1.5,
      protein: 3.5,
      fat: 10.0
    }
  },
  // 17. Kachori (কলাইয়ের ডালের কচুরি - ৭ পিস ₹70)
  {
    id: 'kachori',
    nameBn: 'কলাইয়ের ডালের কচুরি',
    nameEn: 'Club Kachori / Hing Kachori',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 70,
    secondaryPrice: {
      portionBn: '১৪ পিস',
      portionEn: '14 pcs',
      price: 135,
    },
    badgeBn: 'খাস্তা কচুরি • ৭ পিস',
    badgeEn: 'Crispy Kachori • 7 pcs',
    isBestSeller: false,
    descriptionBn: 'হিং ও ডালের পুরে ঠাসা খাস্তা ফুলকো কচুরি। বিকেলের নাস্তার অতুলনীয় পদ।',
    descriptionEn: 'Crisp, puffed kachoris infused with spiced urad dal paste and aromatic asafoetida.',
    nutrition: {
      servingSizeBn: '১ পিস কচুরি',
      servingSizeEn: '1 pc kachori',
      calories: 105,
      sugar: 0.5,
      protein: 2.6,
      fat: 5.8
    }
  },
  // 18. Khaja (মুচমুচে খাজা - ৭ পিস ₹80)
  {
    id: 'khaja',
    nameBn: 'মুচমুচে খাজা',
    nameEn: 'Sweet Crispy Khaja',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 80,
    secondaryPrice: {
      portionBn: '১৪ পিস',
      portionEn: '14 pcs',
      price: 155,
    },
    badgeBn: 'লেয়ার্ড খাজা • ৭ পিস',
    badgeEn: 'Multi-Layered • 7 pcs',
    isBestSeller: false,
    descriptionBn: 'পাতলা স্তরে স্তরে ভাজা মিষ্টি চিনির সিরায় ভেজানো খাস্তা মুচমুচে খাজা।',
    descriptionEn: 'Multi-layered flaky pastry dipped in fragrant sugar glaze, crunchy on the outside.',
    nutrition: {
      servingSizeBn: '১ পিস (৫০ গ্রাম)',
      servingSizeEn: '1 pc (approx. 50g)',
      calories: 195,
      sugar: 16.0,
      protein: 2.8,
      fat: 9.0
    }
  },
  // 19. Nimki (খাস্তা বড় নিমকি - ৫ পিস ₹50, ১ কেজি ₹200)
  {
    id: 'nimki',
    nameBn: 'খাস্তা নিমকি',
    nameEn: 'Crispy Kalonji Nimki',
    category: 'snack',
    portionBn: '৫ পিস',
    portionEn: '5 pcs',
    price: 50,
    secondaryPrice: {
      portionBn: '১ কেজি',
      portionEn: '1 kg',
      price: 200,
    },
    badgeBn: 'চা এর সঙ্গী • ৫ পিস',
    badgeEn: 'Tea-Time Snack • 5 pcs',
    isBestSeller: false,
    descriptionBn: 'কালোজিরে ও জোয়ান দিয়ে তৈরি মুচমুচে নোনতা খাস্তা বড় নিমকি।',
    descriptionEn: 'Crisp diamond-shaped savory tea-time crackers spiced with nigella seeds and ajwain.',
    nutrition: {
      servingSizeBn: '১ পিস (২৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 25g)',
      calories: 120,
      sugar: 0.4,
      protein: 2.6,
      fat: 6.5
    }
  },
  // 20. Choto Nimki (খাস্তা ছোট নিমকি - ১ কেজি ₹200)
  {
    id: 'choto-nimki',
    nameBn: 'খাস্তা ছোট নিমকি',
    nameEn: 'Crispy Mini Kalonji Nimki',
    category: 'snack',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 200,
    isPerKg: true,
    pricePerKg: 200,
    secondaryPrice: {
      portionBn: '৫০০ গ্রাম',
      portionEn: '500g',
      price: 100,
    },
    badgeBn: 'খাস্তা ছোট নিমকি',
    badgeEn: 'Crispy Mini Nimki',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'কালোজিরে ও জোয়ানের সুবাসে তৈরি খাস্তা কুড়মুড়ে ছোট দানার নিমকি। প্রতিদিন চায়ের সঙ্গে সেরা।',
    descriptionEn: 'Bite-sized miniature diamond savory crunchy crackers spiced with nigella seeds and ajwain.',
    nutrition: {
      servingSizeBn: '৫০ গ্রাম (১ পরিবেশন)',
      servingSizeEn: '50g (1 serving)',
      calories: 230,
      sugar: 0.8,
      protein: 4.8,
      fat: 12.0
    }
  },
  // 21. Sabji (স্পেশাল আলুর তরকারি - ১ কেজি ₹100)
  {
    id: 'sabji',
    nameBn: 'স্পেশাল আলুর তরকারি',
    nameEn: 'Special Sabji Curry',
    category: 'snack',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 100,
    isPerKg: true,
    pricePerKg: 100,
    secondaryPrice: {
      portionBn: '৫০০ গ্রাম',
      portionEn: '500g',
      price: 50,
    },
    badgeBn: 'গরম তরকারি',
    badgeEn: 'Spicy Curry',
    isFeatured: true,
    descriptionBn: 'হিঙের ফোড়ন ও স্পেশাল পাঁচফোড়নে রান্না সুস্বাদু খাঁটি আলুর চচ্চড়ি ও রসা তরকারি।',
    descriptionEn: 'Traditional spiced country potato-chana curry prepared with freshly tempered Bengali spices.',
    nutrition: {
      servingSizeBn: '২০০ গ্রাম',
      servingSizeEn: '200g portion',
      calories: 180,
      sugar: 3.5,
      protein: 4.2,
      fat: 6.8
    }
  },
  // 22. Luchi (বাঙালি গরম লুচি - ১০ পিস ₹90)
  {
    id: 'luchi',
    nameBn: 'বাঙালি গরম লুচি',
    nameEn: 'Hot Bengali Luchi',
    category: 'snack',
    portionBn: '১০ পিস',
    portionEn: '10 pcs',
    price: 90,
    secondaryPrice: {
      portionBn: '২০ পিস',
      portionEn: '20 pcs',
      price: 175,
    },
    badgeBn: 'সাদা ফুলকো • ১০ পিস',
    badgeEn: 'Crispy & Fluffy • 10 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ময়দার ধবধবে সাদা ফুলকো তুলতুলে লুচি, মুখে দিলেই আনন্দ ও তৃপ্তি।',
    descriptionEn: 'Classic Bengali snow-white, delicate deep-fried flatbreads, light as air.',
    nutrition: {
      servingSizeBn: '১০০ গ্রাম (৪-৫ পিস)',
      servingSizeEn: '100g (approx 4-5 pcs)',
      calories: 280,
      sugar: 1.2,
      protein: 5.1,
      fat: 14.0
    }
  },
  // 23. Chop (আলুর চপ / ভেজিটেবল চপ - ৭ পিস ₹70)
  {
    id: 'chop',
    nameBn: 'আলুর চপ / ভেজিটেবল চপ',
    nameEn: 'Bengali Aloo & Vegetable Chop',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 70,
    secondaryPrice: {
      portionBn: '১৪ পিস',
      portionEn: '14 pcs',
      price: 135,
    },
    badgeBn: 'গরম চপ • ৭ পিস',
    badgeEn: 'Hot & Spicy • 7 pcs',
    isBestSeller: false,
    descriptionBn: 'ভাজা মশলা ও বিট-গাজরের পুর মিশ্রিত গরম মুচমুচে বাঙালি চপ।',
    descriptionEn: 'Traditional spiced potato and beetroot croquettes crumbed and fried to deep golden perfection.',
    nutrition: {
      servingSizeBn: '১ পিস (৬৫ গ্রাম)',
      servingSizeEn: '1 pc (approx. 65g)',
      calories: 155,
      sugar: 2.8,
      protein: 3.0,
      fat: 7.5
    }
  },
  // 24. Puri sabji (পুরি সবজি প্লেট - ৭ পিস ₹70)
  {
    id: 'puri-sabji',
    nameBn: 'পুরি সবজি (প্লেট)',
    nameEn: 'Puri Sabji Plate',
    category: 'snack',
    portionBn: '৭ পিস (সবজি সহ)',
    portionEn: '7 puris + sabji',
    price: 70,
    badgeBn: 'সকালের জলখাবার • ৭ পিস',
    badgeEn: 'Morning Breakfast • 7 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'গরম গরম ফুলকো পুরির সঙ্গে মিষ্টি-ঝাল আলু চচ্চড়ির স্পেশাল তরকারি।',
    descriptionEn: 'Piping hot, puffed golden puris served with traditional spicy Bengali potato-chana curry.',
    nutrition: {
      servingSizeBn: '১ প্লেট',
      servingSizeEn: '1 plate portion',
      calories: 260,
      sugar: 2.5,
      protein: 5.5,
      fat: 12.0
    }
  },
  // 25. Porata sabji (পরোটা সবজি প্লেট - ৭ পিস ₹80)
  {
    id: 'porata-sabji',
    nameBn: 'পরোটা সবজি (প্লেট)',
    nameEn: 'Paratha Sabji Plate',
    category: 'snack',
    portionBn: '৭ পিস (সবজি সহ)',
    portionEn: '7 parathas + sabji',
    price: 80,
    badgeBn: 'তাজা ভাজা • ৭ পিস',
    badgeEn: 'Freshly Griddled • 7 pcs',
    isBestSeller: false,
    descriptionBn: 'মুচমুচে স্তরযুক্ত পরোটার সাথে গরম ঝাল ঝাল চনচনে তরকারি।',
    descriptionEn: 'Flaky layered hand-tossed parathas accompanied by freshly tempered country vegetable curry.',
    nutrition: {
      servingSizeBn: '১ প্লেট',
      servingSizeEn: '1 plate portion',
      calories: 290,
      sugar: 2.0,
      protein: 6.2,
      fat: 13.5
    }
  },

  // --- DAIRY & RAW SPECIALS ---
  // 26. Milk (দুধ - ১ কেজি/লিটার ₹80)
  {
    id: 'fresh-milk',
    nameBn: 'খাঁটি গরুর দুধ',
    nameEn: 'Pure Fresh Cow Milk',
    category: 'dairy',
    portionBn: '১ কেজি / লিটার',
    portionEn: '1 kg / litre',
    price: 80,
    isPerKg: true,
    pricePerKg: 80,
    badgeBn: '১০০% খাঁটি',
    badgeEn: '100% Pure',
    descriptionBn: 'স্থানীয় খামারের কোনো রকম ভেজালহীন টাটকা ক্রিমযুক্ত খাঁটি দুধ।',
    descriptionEn: 'Farm-fresh, non-adulterated rich whole milk collected daily from local dairy farmers.',
    nutrition: {
      servingSizeBn: '২০০ মিলি (১ গ্লাস)',
      servingSizeEn: '200 ml (1 glass)',
      calories: 130,
      sugar: 9.6,
      protein: 6.6,
      fat: 7.0
    }
  },
  // 27. Chana (টাটকা মিষ্টি ছানা - ₹100 বা তার বেশি হওয়ায় কেজি ইউনিট: ১ কেজি ₹300)
  {
    id: 'fresh-chana',
    nameBn: 'টাটকা মিষ্টি ছানা',
    nameEn: 'Fresh Sweet Chana',
    category: 'dairy',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 300,
    isPerKg: true,
    pricePerKg: 300,
    badgeBn: 'টাটকা প্রস্তুত',
    badgeEn: 'Freshly Curdled',
    descriptionBn: 'নরম ও পরিষ্কার জল ঝরানো মিষ্টি তৈরির সেরা মানের তাজা ছানা।',
    descriptionEn: 'Soft, freshly made artisanal cottage cheese curd specially drained for sweet preparation.',
    nutrition: {
      servingSizeBn: '১০০ গ্রাম',
      servingSizeEn: '100g portion',
      calories: 245,
      sugar: 2.2,
      protein: 18.2,
      fat: 16.5
    }
  },
  // 28. Kheer (ঘন খাঁটি ক্ষীর - ₹100 বা তার বেশি হওয়ায় কেজি ইউনিট: ১ কেজি ₹500)
  {
    id: 'thick-kheer',
    nameBn: 'ঘন খাঁটি ক্ষীর',
    nameEn: 'Dense Traditional Kheer / Mawa',
    category: 'dairy',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 500,
    isPerKg: true,
    pricePerKg: 500,
    badgeBn: 'ঘি-ক্ষীর সমৃদ্ধ',
    badgeEn: 'Slow Simmered',
    descriptionBn: 'ধীর আঁচে ঘণ্টার পর ঘণ্টা দুধ ফুটিয়ে ঘন করা সুগন্ধি বিশুদ্ধ ক্ষীর।',
    descriptionEn: 'Slow-simmered rich reduced milk solid, full of golden aroma for fine cooking and desserts.',
    nutrition: {
      servingSizeBn: '৫০ গ্রাম',
      servingSizeEn: '50g portion',
      calories: 190,
      sugar: 11.0,
      protein: 7.5,
      fat: 12.0
    }
  },
  // 29. Panir (টাটকা মালাই পনির - ₹100 বা তার বেশি হওয়ায় কেজি ইউনিট: ১ কেজি ₹400)
  {
    id: 'fresh-paneer',
    nameBn: 'টাটকা মালাই পনির',
    nameEn: 'Fresh Malai Paneer',
    category: 'dairy',
    portionBn: '১ কেজি',
    portionEn: '1 kg',
    price: 400,
    isPerKg: true,
    pricePerKg: 400,
    badgeBn: 'স্পঞ্জ নরম',
    badgeEn: 'Ultra Soft',
    descriptionBn: 'স্পঞ্জি ও মাখন নরম উচ্চ প্রোটিনযুক্ত টাটকা দেশি পনির।',
    descriptionEn: 'Soft, velvety premium cottage cheese blocks, perfect for curries and snacks.',
    nutrition: {
      servingSizeBn: '১০০ গ্রাম',
      servingSizeEn: '100g portion',
      calories: 295,
      sugar: 1.5,
      protein: 19.5,
      fat: 22.0
    }
  },

  // --- SPECIAL COLLECTION & BULK ---
  {
    id: 'bulk-sweet-box',
    nameBn: 'উপহারের স্পেশাল মিষ্টি বক্স',
    nameEn: 'Custom Royal Sweet Box',
    category: 'special',
    portionBn: '১ কেজি (কাস্টম বক্স)',
    portionEn: '1 kg (custom box)',
    price: 350,
    isPerKg: true,
    pricePerKg: 350,
    badgeBn: 'প্রিমিয়াম গিফট',
    badgeEn: 'Premium Gift',
    isFeatured: true,
    descriptionBn: 'বিয়ে, জন্মদিন বা পূজায় আত্মীয়স্বজনদের উপহার দেওয়ার জন্য সাজানো মিষ্টি বক্স।',
    descriptionEn: 'Beautifully arranged gift hampers containing assorted signature sweets in luxury packaging.',
    nutrition: {
      servingSizeBn: '১ পিস (গড় মিষ্টি)',
      servingSizeEn: '1 pc (avg sweet)',
      calories: 175,
      sugar: 19.0,
      protein: 4.5,
      fat: 8.0
    }
  },
  {
    id: 'bulk-luchi-order',
    nameBn: 'অনুষ্ঠানের বাল্ক লুচি ও সবজি',
    nameEn: 'Celebration Bulk Luchi & Curry',
    category: 'special',
    portionBn: 'অর্ডার অনুযায়ী (৫০+ জন)',
    portionEn: 'As per order (50+ pax)',
    price: 1500,
    badgeBn: 'অনুষ্ঠান স্পেশাল',
    badgeEn: 'Party Bulk',
    descriptionBn: 'পারিবারিক অনুষ্ঠান ও পূজায় তাজা গরম লুচি ও আলুর দমের সুব্যবস্থা।',
    descriptionEn: 'Catering bulk orders for parties, family gatherings, and holy pujas.',
    nutrition: {
      servingSizeBn: '২ পিস লুচি + তরকারি',
      servingSizeEn: '2 pcs luchi + curry',
      calories: 240,
      sugar: 1.2,
      protein: 4.8,
      fat: 11.0
    }
  },
  {
    id: 'bulk-laddu-order',
    nameBn: 'পূজা ও অনুষ্ঠানের বাল্ক লাড্ডু',
    nameEn: 'Festival Bulk Laddu Box',
    category: 'special',
    portionBn: '৫ কেজি (পবিত্র ভোগ)',
    portionEn: '5 kg (holy offering)',
    price: 1000,
    isPerKg: true,
    pricePerKg: 200,
    badgeBn: 'পবিত্র ভোগ',
    badgeEn: 'Holy Offering',
    descriptionBn: 'মন্দিরের ভোগ ও বড় অনুষ্ঠানের জন্য খাঁটি ঘিয়ে তৈরি উৎকৃষ্ট লাড্ডু।',
    descriptionEn: 'Pure ghee devotional offerings and large-scale celebration sweets.',
    nutrition: {
      servingSizeBn: '১ পিস লাড্ডু (৪৫ গ্রাম)',
      servingSizeEn: '1 pc laddu (45g)',
      calories: 185,
      sugar: 16.5,
      protein: 3.8,
      fat: 10.5
    }
  }
];

export const initialReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    nameBn: 'সৌরভ চৌধুরী',
    nameEn: 'Sourav Chowdhury',
    locationBn: 'কালিয়াচক, মালদা',
    locationEn: 'Kaliachak, Malda',
    rating: 5,
    date: 'সেপ্টেম্বর ২০২৬',
    commentBn: 'কালিয়াচকের মধ্যে ঘোষ মিষ্টান্ন ভাণ্ডারের রসগোল্লা আর রসোগোদামের কোনো তুলনা নেই! ছানা এতটাই খাঁটি যে মুখে দিলেই মিশে যায়। আমাদের বাড়ির সব অনুষ্ঠানের মিষ্টি এখান থেকেই নিই।',
    commentEn: 'Ghosh Sweet House has the best Rosogolla and Rosogodam in Kaliachak. The cottage cheese is so fresh and authentic. We order all our family celebration sweets from here!',
    sweetLovedBn: 'ছোট ও বড় রসগোল্লা এবং রসোগোদাম',
    sweetLovedEn: 'Small & Big Rosogolla, Rosogodam'
  },
  {
    id: 'rev-2',
    nameBn: 'প্রিয়াঙ্কা সাহা',
    nameEn: 'Priyanka Saha',
    locationBn: 'মালদা টাউন',
    locationEn: 'Malda Town',
    rating: 5,
    date: 'আগস্ট ২০২৬',
    commentBn: 'এখানকার খাঁটি মিষ্টি দই আর চমচমের স্বাদ মুখে লেগে থাকার মতো। প্যাকেজিং খুব সুন্দর এবং পরিষ্কার পরিচ্ছন্নতা বজায় রাখে।',
    commentEn: 'Their authentic Mishti Doi in clay handi and Chamcham taste divine. Very clean, hygienic packaging and warm hospitality.',
    sweetLovedBn: 'মিষ্টি দই ও চমচম',
    sweetLovedEn: 'Mishti Doi & Chamcham'
  },
  {
    id: 'rev-3',
    nameBn: 'অনুপম সরকার',
    nameEn: 'Anupam Sarkar',
    locationBn: 'দুইসাটাবিঘি, মালদা',
    locationEn: 'Duisatabighi, Malda',
    rating: 5,
    date: 'জুলাই ২০২৬',
    commentBn: 'সকালের গরম ফুলকো পুরি সবজি এবং বিকেলের খাস্তা সমুচা অতুলনীয়! দামও খুব যুক্তিসঙ্গত। শুভকামনা ঘোষ সুইট হাউজকে।',
    commentEn: 'Morning hot puri sabji and evening crispy samosas are unmatched in taste and value. Proud to have Ghosh Sweet House in our Duisatabighi!',
    sweetLovedBn: 'পুরি সবজি ও গরম সমুচা',
    sweetLovedEn: 'Puri Sabji & Samosa'
  },
  {
    id: 'rev-4',
    nameBn: 'বিশ্বজিৎ ঘোষ',
    nameEn: 'Biswajit Ghosh',
    locationBn: 'মোথাবাড়ি, মালদা',
    locationEn: 'Mothabari, Malda',
    rating: 5,
    date: 'জুন ২০২৬',
    commentBn: 'বিয়ের অনুষ্ঠানে ৫০ কেজি লাড্ডু ও মিষ্টি বক্স অর্ডার করেছিলাম। সবাই মিষ্টির প্রশংসা করেছে। একদম খাঁটি উপকরণ দিয়ে তৈরি।',
    commentEn: 'Ordered 50kg laddus and customized sweet boxes for a wedding. Every single guest praised the exquisite taste and pure ghee aroma.',
    sweetLovedBn: 'ঘিয়ে ভাজা লাড্ডু ও মিষ্টি বক্স',
    sweetLovedEn: 'Ghee Laddu & Sweet Box'
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    titleBn: 'রসালো বাঙালি রসগোল্লা',
    titleEn: 'Spongy Rosogolla Platter',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-2',
    titleBn: 'ঘিয়ে ভাজা লাল গোলাপজামুন',
    titleEn: 'Ghee Fried Gulab Jamun',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-3',
    titleBn: 'জাফরানি মতিচুর লাড্ডু',
    titleEn: 'Saffron Motichoor Laddu',
    category: 'sweets',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-4',
    titleBn: 'সকালের ফুলকো পুরি ও আলুর দম',
    titleEn: 'Fresh Puffed Puri Sabji',
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-5',
    titleBn: 'বিকেলের গরম খাস্তা সিঙাড়া',
    titleEn: 'Golden Crispy Samosa',
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-6',
    titleBn: 'উৎসবের সাজানো মিষ্টির গিফট বক্স',
    titleEn: 'Luxury Festival Sweet Box',
    category: 'boxes',
    image: 'https://images.unsplash.com/photo-1605197584547-c93de1a3648a?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-7',
    titleBn: 'বিয়ে ও জন্মদিনের বাল্ক মিষ্টি অর্ডার',
    titleEn: 'Wedding & Celebration Bulk Order',
    category: 'celebration',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'gal-8',
    titleBn: 'দুইসাটাবিঘিতে আমাদের ঘোষ সুইট হাউস শপ',
    titleEn: 'Our Sweet Counter & Kitchen',
    category: 'shop',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop'
  }
];
