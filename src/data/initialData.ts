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
  establishedEn: 'Traditional Taste Since Always'
};

export const initialProducts: ProductItem[] = [
  // 1a. Small Rosogolla (ছোট রসগোল্লা - 5 pcs)
  {
    id: 'small-rosogolla',
    nameBn: 'ছোট রসগোল্লা',
    nameEn: 'Small Rosogolla (5 pcs)',
    category: 'sweet',
    portionBn: '৫ পিস',
    portionEn: '5 pcs',
    price: 50,
    secondaryPrice: {
      portionBn: '১০ পিস',
      portionEn: '10 pcs',
      price: 95,
    },
    image: '',
    badgeBn: 'ছোট রসগোল্লা • ৫ পিস',
    badgeEn: 'Small Rosogolla • 5 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'হালকা মিষ্টির তুলতুলে নরম ছোট দানার স্পঞ্জ রসগোল্লা। খাঁটি দেশি গরুর দুধের ছানায় তৈরি, রসে টইটম্বুর ও মুখে দিলেই গলে যায়।',
    descriptionEn: 'Soft, melt-in-mouth bite-sized traditional Bengali spongy cottage cheese rosogollas soaked in pure cardamom syrup (5 pcs).'
  },
  // 1b. Big Rosogolla (বড় রসগোল্লা - 10 pcs)
  {
    id: 'big-rosogolla',
    nameBn: 'বড় রসগোল্লা',
    nameEn: 'Big Rosogolla (10 pcs)',
    category: 'sweet',
    portionBn: '১০ পিস',
    portionEn: '10 pcs',
    price: 120,
    secondaryPrice: {
      portionBn: '৫ পিস',
      portionEn: '5 pcs',
      price: 65,
    },
    image: '',
    badgeBn: 'বড় রসগোল্লা • ১০ পিস',
    badgeEn: 'King Size • 10 pcs',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ধবধবে সাদা বড় সাইজের স্পঞ্জি ছানার রসগোল্লা। রসে ভরপুর, এলাচের মন মাতানো সুবাস ও ঘোষ মিষ্টান্ন ভাণ্ডারের প্রধান আকর্ষণ।',
    descriptionEn: 'Classic large king-sized spongy cottage cheese balls soaked in fragrant sugar syrup, prepared fresh daily (10 pcs).'
  },
  // 2. Golapjamun
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
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'রয়েল মিষ্টি',
    badgeEn: 'Royal Sweet',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'দেশি ঘিয়ে ভাজা রসালো ক্ষীরের সোনালী-বাদামি গোলাপজামুন।',
    descriptionEn: 'Deep-fried golden brown dumplings made of thickened milk solids soaked in rose scented syrup.'
  },
  // 3. Lal Rosogolla
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'ঐতিহ্যবাহী',
    badgeEn: 'Heritage Special',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'নলেন গুড় ও ক্যারামেল স্বাদে প্রস্তুত বিশেষ লাল রঙের নরম রসগোল্লা।',
    descriptionEn: 'Traditional caramelised aromatic red cottage cheese balls in rich fragrant syrup.'
  },
  // 4. Rosogodam
  {
    id: 'rosogodam',
    nameBn: 'রসোগোদাম',
    nameEn: 'Rosogodam',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 100,
    image: 'https://images.unsplash.com/photo-1505253758473-96b46d5f69c6?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'ঘোষ স্পেশাল',
    badgeEn: 'Ghosh Signature',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'মালদার বিখ্যাত বিশেষ ক্ষীর ও পেস্তা দিয়ে তৈরি অভিনব রসোগোদাম।',
    descriptionEn: 'Our special Malda delicacy stuffed with saffron kheer and garnished with sliced pistachios.'
  },
  // 5. Laddu
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'বিশুদ্ধ ঘি',
    badgeEn: 'Pure Desi Ghee',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'খাঁটি দেশি ঘিয়ে ভাজা জাফরান মিশ্রিত মতিচুর ও বেসনের লাড্ডু।',
    descriptionEn: 'Fine gram-flour pearls fried in pure clarified butter and infused with fragrant cardamom and saffron.'
  },
  // 6. Fish legs (kheer)
  {
    id: 'fish-legs-kheer',
    nameBn: 'ফিশ লেগস (ক্ষীর)',
    nameEn: 'Fish Legs (Kheer Special)',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 120,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'অনবদ্য সৃষ্টি',
    badgeEn: 'Chef Specialty',
    isBestSeller: false,
    isFeatured: true,
    descriptionBn: 'ঘন ক্ষীরের আবরণে তৈরি অতুলনীয় স্বাদের শৈল্পিক মিষ্টি।',
    descriptionEn: 'Artisanal sweet crafted from dense, creamy reduced milk with delicate silver foil and pistachio.'
  },
  // 7. Chamcham
  {
    id: 'chamcham',
    nameBn: 'চমচম',
    nameEn: 'Malai Chamcham',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 90,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'বাঙালি ক্লাসিক',
    badgeEn: 'Bengali Classic',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'তাজা ছানা ও মালাইয়ে মোড়ানো ঐতিহ্যবাহী বাঙালি পোড়া চমচম।',
    descriptionEn: 'Classic cylindrical cottage cheese delicacies rolled in dry mawa and topped with saffron malai.'
  },
  // 8. Dommisri
  {
    id: 'dommisri',
    nameBn: 'ডমমিশ্রী',
    nameEn: 'Dommisri Sweets',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 90,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'বিশেষ স্বাদ',
    badgeEn: 'Special Taste',
    isBestSeller: false,
    descriptionBn: 'মিশ্রি ও খাঁটি খোয়া ক্ষীরের মেলবন্ধনে তৈরি দারুণ সুস্বাদু ডমমিশ্রী।',
    descriptionEn: 'Rich crystallized milk delicacy crafted with premium rock sugar crystals and roasted mawa.'
  },
  // 9. Durgavog
  {
    id: 'durgavog',
    nameBn: 'দুর্গাভোগ',
    nameEn: 'Royal Durgavog',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 90,
    image: 'https://images.unsplash.com/photo-1605197584547-c93de1a3648a?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'পূজা স্পেশাল',
    badgeEn: 'Puja Special',
    isBestSeller: false,
    isFeatured: true,
    descriptionBn: 'মা দুর্গার ভোগের জন্য প্রস্তুত পবিত্র কেশর ও ক্ষীরের লাবণ্যময় মিষ্টি।',
    descriptionEn: 'A sanctified preparation infused with natural saffron, nutmeg, and dense chana for grand occasions.'
  },
  // 10. Rosmalai
  {
    id: 'rosmalai',
    nameBn: 'রসমলাই',
    nameEn: 'Kesaria Rosmalai',
    category: 'sweet',
    portionBn: '২০ পিস',
    portionEn: '20 pcs',
    price: 300,
    image: 'https://images.unsplash.com/photo-1620801124637-2384a515fce3?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'জাফরানি ক্ষীর',
    badgeEn: 'Kesari Rabdi',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ঘন জাফরানি দুধ ও ক্ষীরে ডোবানো নরম তুলতুলে ছোট রসমলাই।',
    descriptionEn: 'Delicate mini paneer dumplings floating in creamy, thickened milk flavored with saffron and cardamom.'
  },
  // 11. Peyera
  {
    id: 'peyera',
    nameBn: 'পেয়ারা মিষ্টি',
    nameEn: 'Peyera Sandesh',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 80,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'নরম ছানা',
    badgeEn: 'Soft Sandesh',
    isBestSeller: false,
    descriptionBn: 'হালকা মিষ্টির নিখুঁত ছানার গোল সন্দেশ, সুস্বাদু ও মনোরম।',
    descriptionEn: 'Lightly sweetened soft-dough chana sandesh styled elegantly with cardamom fragrance.'
  },
  // 12. Goljam
  {
    id: 'goljam',
    nameBn: 'গোলজাম',
    nameEn: 'Goljam Jamun',
    category: 'sweet',
    portionBn: '৬ পিস',
    portionEn: '6 pcs',
    price: 80,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'রসালো',
    badgeEn: 'Juicy',
    isBestSeller: false,
    descriptionBn: 'গাঢ় রসে টইটম্বুর গোল গোল সুস্বাদু কালোজাম।',
    descriptionEn: 'Rich, caramelized dark dumplings soaked through to the core in spiced sugar nectar.'
  },
  // 13. Dai
  {
    id: 'dai',
    nameBn: 'মালদার খাঁটি মিষ্টি দই',
    nameEn: 'Malda Authentic Mishti Doi',
    category: 'sweet',
    portionBn: '১০ পিস (ছোট ভাঁড়)',
    portionEn: '10 pcs (mini cups)',
    price: 100,
    secondaryPrice: {
      portionBn: '১ কেজি (মাটির হাঁড়ি)',
      portionEn: '1 kg (clay handi)',
      price: 150,
    },
    isPerKg: true,
    pricePerKg: 150,
    image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'মাটির ভাঁড়',
    badgeEn: 'Clay Pot Fermented',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'মাটির পাতিলে পাতানো খাঁটি ঘন দুধের ক্ষীরসা মিষ্টি দই, সোনালী সরের স্তরযুক্ত।',
    descriptionEn: 'Authentic fermented sweet curd set in traditional earthen pots with a caramelized cream top layer.'
  },

  // --- SNACKS SECTION ---
  // 14. Puri sabji
  {
    id: 'puri-sabji',
    nameBn: 'পুরি সবজি',
    nameEn: 'Puri Sabji',
    category: 'snack',
    portionBn: '৭ পিস পুরি + তরকারি',
    portionEn: '7 pcs puri + sabji',
    price: 70,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'সকালের জলখাবার',
    badgeEn: 'Morning Breakfast',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'গরম গরম ফুলকো পুরির সঙ্গে মিষ্টি-ঝাল আলু চচ্চড়ির স্পেশাল তরকারি।',
    descriptionEn: 'Piping hot, puffed golden puris served with traditional spicy Bengali potato-chana curry.'
  },
  // 15. Porata sabji
  {
    id: 'porata-sabji',
    nameBn: 'পরোটা সবজি',
    nameEn: 'Porata Sabji',
    category: 'snack',
    portionBn: '৭ পিস পরোটা + তরকারি',
    portionEn: '7 pcs paratha + sabji',
    price: 80,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'তাজা ভাজা',
    badgeEn: 'Freshly Griddled',
    isBestSeller: false,
    descriptionBn: 'মুচমুচে ত্রিভুজ পরোটার সাথে গরম ঝাল ঝাল চনচনে সবজি।',
    descriptionEn: 'Flaky layered hand-tossed parathas accompanied by freshly tempered country vegetable curry.'
  },
  // 16. Luchi
  {
    id: 'luchi',
    nameBn: 'বাঙালি গরম লুচি',
    nameEn: 'Hot Bengali Luchi',
    category: 'snack',
    portionBn: '১০ পিস',
    portionEn: '10 pcs',
    price: 90,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'সাদা ফুলকো',
    badgeEn: 'Crispy & Fluffy',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'ময়দার ধবধবে সাদা ফুলকো তুলতুলে লুচি, মুখে দিলেই আনন্দ।',
    descriptionEn: 'Classic Bengali snow-white, delicate deep-fried flatbreads, light as air.'
  },
  // 17. Samosa
  {
    id: 'samosa',
    nameBn: 'মুচমুচে সমুচা (সিঙাড়া)',
    nameEn: 'Crispy Singara / Samosa',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 70,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'বিকেলের আড্ডা',
    badgeEn: 'Evening Favorite',
    isBestSeller: true,
    isFeatured: true,
    descriptionBn: 'পাঁচফোড়ন ও চিনাবাদাম মিশ্রিত আলুর পুরে ভরা খাস্তা বাঙালি সমুচা।',
    descriptionEn: 'Bengali style crispy golden samosa filled with spiced potato cubes, roasted peanuts, and green peas.'
  },
  // 18. Kachori
  {
    id: 'kachori',
    nameBn: 'কলাইয়ের ডালের কচুরি',
    nameEn: 'Club Kachori / Hing Kachori',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 70,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'খাস্তা',
    badgeEn: 'Crispy',
    isBestSeller: false,
    descriptionBn: 'হিং ও ডালের পুরে ঠাসা খাস্তা কচুরির সাথে রসালো তরকারি।',
    descriptionEn: 'Crisp, puffed kachoris infused with spiced urad dal paste and aromatic asafoetida.'
  },
  // 19. Khaja
  {
    id: 'khaja',
    nameBn: 'মুচমুচে খাজা',
    nameEn: 'Sweet Crispy Khaja',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 80,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'লেয়ার্ড মিষ্টি',
    badgeEn: 'Multi-Layered',
    isBestSeller: false,
    descriptionBn: 'পাতলা স্তরে স্তরে ভাজা মিষ্টি চিনির সিরায় ভেজানো খাস্তা খাজা।',
    descriptionEn: 'Multi-layered flaky pastry dipped in fragrant sugar glaze, crunchy on the outside.'
  },
  // 20. Chop
  {
    id: 'chop',
    nameBn: 'আলুর চপ / ভেজিটেবল চপ',
    nameEn: 'Bengali Aloo & Vegetable Chop',
    category: 'snack',
    portionBn: '৭ পিস',
    portionEn: '7 pcs',
    price: 70,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'গরম গরম',
    badgeEn: 'Hot & Spicy',
    isBestSeller: false,
    descriptionBn: 'ভাজা মশলা ও বিট-গাজরের পুর মিশ্রিত গরম মুচমুচে বাঙালি চপ।',
    descriptionEn: 'Traditional spiced potato and beetroot croquettes crumbed and fried to deep golden perfection.'
  },
  // 21. Nimki
  {
    id: 'nimki',
    nameBn: 'খাস্তা নিমকি',
    nameEn: 'Crispy Kalonji Nimki',
    category: 'snack',
    portionBn: '৫ পিস (বড় প্যাকেট)',
    portionEn: '5 pcs (large pack)',
    price: 50,
    secondaryPrice: {
      portionBn: '১ কেজি',
      portionEn: '1 kg',
      price: 200,
    },
    isPerKg: true,
    pricePerKg: 200,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'চা এর সঙ্গী',
    badgeEn: 'Tea-Time Snack',
    isBestSeller: false,
    descriptionBn: 'কালোজিরে ও জোয়ান দিয়ে তৈরি মুচমুচে নোনতা খাস্তা নিমকি।',
    descriptionEn: 'Crisp diamond-shaped savory tea-time crackers spiced with nigella seeds and ajwain.'
  },

  // --- DAIRY & RAW SPECIALS ---
  // 22. Milk
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
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=900&auto=format&fit=crop',
    badgeBn: '১০০% খাঁটি',
    badgeEn: '100% Pure',
    descriptionBn: 'স্থানীয় খামারের কোনো রকম ভেজালহীন টাটকা ক্রিমযুক্ত খাঁটি দুধ।',
    descriptionEn: 'Farm-fresh, non-adulterated rich whole milk collected daily from local dairy farmers.'
  },
  // 23. Chana
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'টাটকা প্রস্তুত',
    badgeEn: 'Freshly Curdled',
    descriptionBn: 'নরম ও পরিষ্কার জল ঝরানো মিষ্টি তৈরির সেরা মানের তাজা ছানা।',
    descriptionEn: 'Soft, freshly made artisanal cottage cheese curd specially drained for sweet preparation.'
  },
  // 24. Kheer
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
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'ঘি-ক্ষীর সমৃদ্ধ',
    badgeEn: 'Slow Simmered',
    descriptionBn: 'ধীর আঁচে ঘণ্টার পর ঘণ্টা দুধ ফুটিয়ে ঘন করা সুগন্ধি বিশুদ্ধ ক্ষীর।',
    descriptionEn: 'Slow-simmered rich reduced milk solid, full of golden aroma for fine cooking and desserts.'
  },
  // 25. Panir
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
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'স্পঞ্জ নরম',
    badgeEn: 'Ultra Soft',
    descriptionBn: 'স্পঞ্জি ও মাখন নরম উচ্চ প্রোটিনযুক্ত টাটকা দেশি পনির।',
    descriptionEn: 'Soft, velvety premium cottage cheese blocks, perfect for curries and snacks.'
  },

  // --- SPECIAL COLLECTION & BULK ---
  {
    id: 'bulk-sweet-box',
    nameBn: 'উপহারের স্পেশাল মিষ্টি বক্স',
    nameEn: 'Custom Royal Sweet Box',
    category: 'special',
    portionBn: 'অর্ডার অনুযায়ী',
    portionEn: 'As per order',
    price: 350,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'প্রিমিয়াম গিফট',
    badgeEn: 'Premium Gift',
    isFeatured: true,
    descriptionBn: 'বিয়ে, জন্মদিন বা পূজায় আত্মীয়স্বজনদের উপহার দেওয়ার জন্য সাজানো মিষ্টি বক্স।',
    descriptionEn: 'Beautifully arranged gift hampers containing assorted signature sweets in luxury packaging.'
  },
  {
    id: 'bulk-luchi-order',
    nameBn: 'অনুষ্ঠানের বাল্ক লুচি ও সবজি',
    nameEn: 'Celebration Bulk Luchi & Curry',
    category: 'special',
    portionBn: 'অর্ডার অনুযায়ী (৫০+ জন)',
    portionEn: 'As per order (50+ pax)',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'অনুষ্ঠান স্পেশাল',
    badgeEn: 'Party Bulk',
    descriptionBn: 'পারিবারিক অনুষ্ঠান ও পূজায় তাজা গরম লুচি ও আলুর দমের সুব্যবস্থা।',
    descriptionEn: 'Catering bulk orders for parties, family gatherings, and holy pujas.'
  },
  {
    id: 'bulk-laddu-order',
    nameBn: 'পূজা ও অনুষ্ঠানের বাল্ক লাড্ডু',
    nameEn: 'Festival Bulk Laddu Box',
    category: 'special',
    portionBn: 'অর্ডার অনুযায়ী (৫ কেজি+)',
    portionEn: 'As per order (5 kg+)',
    price: 1000,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=900&auto=format&fit=crop',
    badgeBn: 'পবিত্র ভোগ',
    badgeEn: 'Holy Offering',
    descriptionBn: 'মন্দিরের ভোগ ও বড় অনুষ্ঠানের জন্য খাঁটি ঘিয়ে তৈরি উৎকৃষ্ট লাড্ডু।',
    descriptionEn: 'Pure ghee devotional offerings and large-scale celebration sweets.'
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
