export type Language = 'bn' | 'en';
export type ThemeMode = 'dark' | 'bright';

export interface NutritionalInfo {
  servingSizeBn: string;
  servingSizeEn: string;
  calories: number; // kcal per serving
  sugar: number; // grams per serving
  protein: number; // grams per serving
  fat?: number; // grams per serving
}

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
  image?: string;
  badgeBn?: string;
  badgeEn?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  descriptionBn: string;
  descriptionEn: string;
  nutrition?: NutritionalInfo;
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
  registrationNo?: string;
}

export type OrderStatus =
  | 'New Order'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Completed';

export interface SweetPointTransaction {
  id: string;
  customer_id: string;
  order_id?: string;
  points: number;
  reason: string;
  created_at: string;
}

export type DiscountReasonCode =
  | 'ELIGIBLE'
  | 'LOGIN_REQUIRED'
  | 'PHONE_NOT_VERIFIED'
  | 'MINIMUM_ORDER_100'
  | 'OFFER_COMPLETED';

export interface DiscountRpcResponse {
  eligible: boolean;
  discount_amount: number;
  discount_percentage: number;
  reason_code: DiscountReasonCode;
  message: string;
  qualifying_orders_count: number;
  remaining_offers: number;
}

export interface CustomerAccount {
  id: string; // public.customers.id (UUID)
  auth_user_id: string; // Permanent identity linked to Supabase auth.users.id
  name: string;
  mobile: string; // verified phone
  email?: string;
  pin?: string;
  sweetPoints: number; // Current balance
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  qualifyingOrdersCount: number; // Count of completed qualifying orders (>= ₹100, max 5 for 5% off)
  createdAt: number;
}

export type SheetsSyncStatus = 'synced' | 'pending' | 'failed';

export interface OrderHistoryItem {
  id: string;
  date: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  newCustomerDiscount?: number;
  pointsRedeemed: number;
  pointsDiscountAmount?: number;
  discountAmount: number;
  finalTotal: number;
  pointsEarned: number;
  pointsAwarded?: boolean;
  isQualifyingOrder?: boolean;
  customerId?: string;
  orderType: 'delivery' | 'takeaway';
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  specialNote?: string;
  status: OrderStatus;
  estimatedMinutes?: number;
  syncStatus?: SheetsSyncStatus;
  syncError?: string;
  lastSyncedAt?: number;
}

