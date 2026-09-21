export type Language = 'bn' | 'en';
export type ThemeMode = 'dark' | 'bright';

export interface ProductItem {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'sweet' | 'snack' | 'dairy' | 'special';
  portionBn: string;
  portionEn: string;
  price: number; // base price in INR
  secondaryPrice?: {
    portionBn: string;
    portionEn: string;
    price: number;
  };
  isPerKg?: boolean;
  pricePerKg?: number;
  image: string;
  badgeBn?: string;
  badgeEn?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  descriptionBn: string;
  descriptionEn: string;
}

export interface CartItem {
  product: ProductItem;
  selectedPortion: string;
  price: number;
  quantity: number;
}

export interface ReviewItem {
  id: string;
  nameBn: string;
  nameEn: string;
  locationBn: string;
  locationEn: string;
  rating: number;
  date: string;
  commentBn: string;
  commentEn: string;
  sweetLovedBn: string;
  sweetLovedEn: string;
}

export interface GalleryItem {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'sweets' | 'snacks' | 'boxes' | 'celebration' | 'shop';
  image: string;
}

export interface ShopDetails {
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  phone: string;
  whatsapp: string;
  addressBn: string;
  addressEn: string;
  cityBn: string;
  cityEn: string;
  stateCountryBn: string;
  stateCountryEn: string;
  mapsUrl: string;
  openingHoursBn: string;
  openingHoursEn: string;
  establishedBn: string;
  establishedEn: string;
}
