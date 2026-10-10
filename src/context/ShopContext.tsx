import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ProductItem,
  CartItem,
  Language,
  ThemeMode,
  ShopDetails,
  ReviewItem,
  OrderHistoryItem,
  OrderStatus,
  CustomerAccount,
  DiscountRpcResponse,
  SweetPointTransaction,
  OrderFeedback
} from '../types';
import { initialProducts, initialShopDetails, initialReviews } from '../data/initialData';
import { translations } from '../data/translations';
import {
  checkNewCustomerDiscountRpc,
  completeQualifyingOrderRpc,
  fetchCustomerTransactionsRpc,
  normalizePhone,
  saveOrderToSupabase,
  updateOrderSyncStatusInSupabase
} from '../lib/supabase';
import {
  subscribeToProducts,
  updateProductPriceInFirestore
} from '../lib/firestore-products';
import {
  submitOrderFeedbackInFirestore,
  subscribeToCustomerOrders
} from '../lib/firestore-orders';
import {
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
  signCustomerOut
} from '../lib/firebase-phone-auth';
import {
  getCustomerProfileByUid,
  createCustomerProfile,
  updateCustomerProfile,
  subscribeToCustomerProfile
} from '../lib/firestore-customers';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ShopContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  updateProductPrice: (id: string, newPrice: number) => void;
  shopDetails: ShopDetails;
  setShopDetails: React.Dispatch<React.SetStateAction<ShopDetails>>;
  reviews: ReviewItem[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewItem[]>>;
  updateReview: (id: string, fields: Partial<ReviewItem>) => void;
  cart: CartItem[];
  addToCart: (product: ProductItem, selectedPortion?: string, customPrice?: number) => void;
  removeFromCart: (productId: string, portion: string) => void;
  updateQuantity: (productId: string, portion: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  // Loyalty Sweet Points & Accounts (Supabase Auth & Identity)
  currentCustomer: CustomerAccount | null;
  accounts: CustomerAccount[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signup' | 'login';
  setAuthModalMode: (mode: 'signup' | 'login') => void;
  openSignUpModal: () => void;
  openLoginModal: () => void;
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; testOtp?: string }>;
  verifyOtpAndAuthenticate: (
    phone: string,
    token: string,
    newCustomerData?: { name: string; email?: string; address?: string; pinCode?: string }
  ) => Promise<{ success: boolean; message?: string; customer?: CustomerAccount | null; isNew?: boolean; firebaseUser?: any }>;
  updateCurrentCustomerProfile: (updates: Partial<{ name: string; email: string; address: string; pinCode: string }>) => Promise<{ success: boolean; error?: string }>;
  completeProfileForCustomer: (data: { name: string; email?: string; address?: string; pinCode?: string }) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { name: string; mobile: string; email?: string; pin: string }) => { success: boolean; message?: string; account?: CustomerAccount };
  login: (mobile: string, pin: string) => { success: boolean; message?: string; account?: CustomerAccount };
  logout: () => void;
  sweetPoints: number;
  pointsToRupees: (points: number) => number;
  addSweetPoints: (pts: number) => void;
  redeemSweetPoints: (pts: number) => void;
  calculateEarnablePoints: (amount: number) => number;
  isNewCustomerEligibleForDiscount: (subtotal: number) => boolean;
  calculateNewCustomerDiscount: (subtotal: number) => number;
  checkDiscountRpc: (subtotal: number) => Promise<DiscountRpcResponse>;
  discountRpcState: DiscountRpcResponse | null;
  transactions: SweetPointTransaction[];
  loadCustomerTransactions: () => Promise<void>;
  // Order History & Status
  orderHistory: OrderHistoryItem[];
  addOrderToHistory: (orderData: {
    items: CartItem[];
    subtotal: number;
    newCustomerDiscount?: number;
    pointsRedeemed: number;
    pointsDiscountAmount?: number;
    discountAmount: number;
    finalTotal: number;
    pointsEarned: number;
    orderType: 'delivery' | 'takeaway';
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    paymentMethod?: string;
    specialNote?: string;
    status?: OrderStatus;
  }) => OrderHistoryItem;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateNextOrderStatus: (orderId: string) => void;
  retrySyncOrder: (orderId: string) => Promise<{ success: boolean; message?: string }>;
  syncAllPendingOrders: () => Promise<void>;
  submitOrderFeedback: (
    orderId: string,
    feedback: {
      rating: number;
      tags?: string[];
      comment?: string;
      customerName?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  reorder: (orderId: string) => void;
  isOrdersOpen: boolean;
  setIsOrdersOpen: (open: boolean) => void;
  // Live Firestore Order Tracking & Owner Portal
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;
  isOwnerPortalOpen: boolean;
  setIsOwnerPortalOpen: (open: boolean) => void;
  t: typeof translations.bn;
  resetToDefaults: () => void;
  resetToDefaultData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Initial sample order list starts empty
const getInitialSampleOrders = (): OrderHistoryItem[] => [];

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language: Default is Bengali 'bn' as strictly requested
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ghosh_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  // Theme: Dark vs Bright (Light)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ghosh_theme');
    return (saved === 'bright' || saved === 'dark') ? saved : 'dark';
  });

  // Products
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const savedV6 = localStorage.getItem('ghosh_products_v6');
    if (savedV6) {
      try {
        const parsed = JSON.parse(savedV6);
        if (Array.isArray(parsed) && parsed.some((p: ProductItem) => p.id === 'rosmalai' && p.price === 20)) {
          // Merge nutrition and fields from initialProducts if missing in cached storage
          return parsed.map((item: ProductItem) => {
            const defaultItem = initialProducts.find(p => p.id === item.id);
            return {
              ...defaultItem,
              ...item,
              nutrition: item.nutrition || defaultItem?.nutrition
            };
          });
        }
      } catch (e) {
        console.error('Error parsing saved products v6', e);
      }
    }
    // Clean up older v5, v4 and v3 cache so new Rosmalai ₹20 takes effect immediately
    localStorage.removeItem('ghosh_products_v5');
    localStorage.removeItem('ghosh_products_v4');
    localStorage.removeItem('ghosh_products_v3');
    return initialProducts;
  });

  // Shop details (phone, address, etc.)
  const [shopDetails, setShopDetails] = useState<ShopDetails>(() => {
    const saved = localStorage.getItem('ghosh_shop_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved shop details', e);
      }
    }
    return initialShopDetails;
  });

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem('ghosh_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved reviews', e);
      }
    }
    return initialReviews;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ghosh_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved cart', e);
      }
    }
    return [];
  });

  // Customer Loyalty Accounts (in-memory session state)
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);

  // Current active customer:
  // Backed by Supabase auth.users.id -> public.customers.auth_user_id.
  // We do NOT use localStorage, cookies, or device IDs for identity.
  const [currentCustomer, setCurrentCustomer] = useState<CustomerAccount | null>(null);

  // Auth & Dashboard Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Transactions list from Supabase
  const [transactions, setTransactions] = useState<SweetPointTransaction[]>([]);

  // Order History & Status
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>(() => {
    const saved = localStorage.getItem('ghosh_order_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing order history', e);
      }
    }
    return getInitialSampleOrders();
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/^\/order\/([A-Za-z0-9_-]+)/);
      return match ? match[1] : null;
    }
    return null;
  });
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/owner');
    }
    return false;
  });
  // Discount RPC State for real-time validation via Supabase RPC
  const [discountRpcState, setDiscountRpcState] = useState<DiscountRpcResponse | null>(null);

  useEffect(() => {
    localStorage.setItem('ghosh_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('ghosh_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Real-time synchronization of Products catalog from Cloud Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProducts((firestoreProducts) => {
      if (firestoreProducts && firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Customer Orders from Cloud Firestore
  useEffect(() => {
    const activeCustomerId = auth?.currentUser?.uid || currentCustomer?.id || currentCustomer?.mobile;
    if (!activeCustomerId) return;

    const unsubscribe = subscribeToCustomerOrders(activeCustomerId, (firestoreOrders) => {
      if (!firestoreOrders || firestoreOrders.length === 0) return;

      const statusMap: Record<string, OrderStatus> = {
        PENDING: 'New Order',
        ACCEPTED: 'Confirmed',
        PREPARING: 'Preparing',
        READY: 'Ready for Pickup',
        OUT_FOR_DELIVERY: 'Out for Delivery',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled'
      };

      const mapped: OrderHistoryItem[] = firestoreOrders.map((o) => {
        const orderDateObj = o.createdAt ? new Date(o.createdAt) : new Date();
        const formattedDate = `${orderDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${orderDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        const cartItems: CartItem[] = (o.items || []).map((it) => {
          const matchedProd = products.find((p) => p.id === it.productId);
          return {
            product: matchedProd || {
              id: it.productId,
              nameBn: it.productNameBn || it.productName,
              nameEn: it.productName,
              category: 'sweet',
              portionBn: it.portionBn || it.portion,
              portionEn: it.portion,
              price: it.price,
              descriptionBn: '',
              descriptionEn: '',
              isAvailable: true,
              isEnabled: true
            },
            selectedPortion: it.portion,
            price: it.price,
            quantity: it.quantity
          };
        });

        return {
          id: o.orderId,
          date: formattedDate,
          createdAt: orderDateObj.getTime(),
          items: cartItems,
          subtotal: o.subtotal,
          newCustomerDiscount: o.discountAmount || 0,
          pointsRedeemed: 0,
          pointsDiscountAmount: 0,
          discountAmount: o.discountAmount || 0,
          finalTotal: o.totalAmount,
          pointsEarned: Math.floor(o.totalAmount * 0.05),
          pointsAwarded: o.status === 'DELIVERED',
          isQualifyingOrder: o.subtotal >= 100,
          customerId: o.customerId,
          orderType: o.orderType || 'delivery',
          customerName: o.customerName,
          customerPhone: o.phone,
          deliveryAddress: o.deliveryAddress,
          paymentMethod: o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
          specialNote: o.customerNote,
          status: statusMap[o.status] || 'New Order',
          estimatedMinutes: o.estimatedMinutes || 15,
          syncStatus: 'synced'
        };
      });

      setOrderHistory(mapped);
    });

    return () => unsubscribe();
  }, [currentCustomer, products]);

  useEffect(() => {
    localStorage.setItem('ghosh_products_v6', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ghosh_shop_details', JSON.stringify(shopDetails));
  }, [shopDetails]);

  useEffect(() => {
    localStorage.setItem('ghosh_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('ghosh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ghosh_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const openSignUpModal = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Refresh customer transactions from Supabase
  const loadCustomerTransactions = useCallback(async () => {
    if (!currentCustomer) {
      setTransactions([]);
      return;
    }
    const txs = await fetchCustomerTransactionsRpc(currentCustomer.id);
    setTransactions(txs);
  }, [currentCustomer]);

  useEffect(() => {
    if (currentCustomer) {
      loadCustomerTransactions();
    }
  }, [currentCustomer, loadCustomerTransactions]);

  // Check discount via Supabase RPC whenever cartTotal or currentCustomer changes
  useEffect(() => {
    let isCancelled = false;
    async function evaluateDiscount() {
      const res = await checkNewCustomerDiscountRpc(cartTotal, currentCustomer?.id);
      if (!isCancelled) {
        setDiscountRpcState(res);
      }
    }
    evaluateDiscount();
    return () => {
      isCancelled = true;
    };
  }, [cartTotal, currentCustomer]);

  // 1. Send OTP to Mobile via Firebase Phone Auth
  const sendOtp = async (phone: string) => {
    return await sendFirebasePhoneOtp(phone);
  };

  // 2. Verify OTP & Authenticate Customer with Firebase Auth and Firestore
  const verifyOtpAndAuthenticate = async (
    phone: string,
    token: string,
    newCustomerData?: { name: string; email?: string; address?: string; pinCode?: string }
  ): Promise<{ success: boolean; message?: string; customer?: CustomerAccount | null; isNew?: boolean; firebaseUser?: any }> => {
    const res = await verifyFirebasePhoneOtp(phone, token, newCustomerData);

    if (!res.success) {
      return { success: false, message: res.message || 'OTP verification failed' };
    }

    if (res.customer) {
      const acc = res.customer;
      setCurrentCustomer(acc);
      try {
        localStorage.setItem(
          'ghosh_customer_session',
          JSON.stringify({ uid: acc.id, phone: acc.mobile })
        );
      } catch (e) {}

      setAccounts(prev => {
        const filtered = prev.filter(a => normalizePhone(a.mobile) !== normalizePhone(acc.mobile));
        return [...filtered, acc];
      });

      await loadCustomerTransactions();
    }

    return {
      success: true,
      customer: res.customer,
      isNew: res.isNew,
      firebaseUser: res.firebaseUser,
      message: res.message
    };
  };

  // 3. Complete Profile for first-time or missing profile users
  const completeProfileForCustomer = async (data: {
    name: string;
    email?: string;
    address?: string;
    pinCode?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const activeUid = auth?.currentUser?.uid || (currentCustomer ? currentCustomer.id : null);
    const activePhone = currentCustomer?.mobile || (auth?.currentUser?.phoneNumber ? normalizePhone(auth.currentUser.phoneNumber) : '');

    if (!activeUid) {
      return { success: false, error: 'No active authenticated user session found.' };
    }

    const res = await createCustomerProfile(activeUid, {
      name: data.name,
      phoneNumber: activePhone,
      email: data.email,
      address: data.address,
      pinCode: data.pinCode
    });

    if (res.success && res.customer) {
      setCurrentCustomer(res.customer);
      try {
        localStorage.setItem(
          'ghosh_customer_session',
          JSON.stringify({ uid: res.customer.id, phone: res.customer.mobile })
        );
      } catch (e) {}
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to complete profile.' };
  };

  // 4. Update Current Customer Profile (Name, Address, PIN code, Email)
  const updateCurrentCustomerProfile = async (
    updates: Partial<{ name: string; email: string; address: string; pinCode: string }>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentCustomer) {
      return { success: false, error: 'Not logged in.' };
    }

    const res = await updateCustomerProfile(currentCustomer.id, updates);
    if (res.success && res.customer) {
      setCurrentCustomer(res.customer);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Backward-compatible signUp
  const signUp = (data: { name: string; mobile: string; email?: string; pin: string }) => {
    const cleanMobile = normalizePhone(data.mobile);
    const existing = accounts.find(a => normalizePhone(a.mobile) === cleanMobile);
    if (existing) {
      setCurrentCustomer(existing);
      setIsAuthModalOpen(false);
      return { success: true, account: existing };
    }

    const newAcc: CustomerAccount = {
      id: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
      auth_user_id: `auth-user-${cleanMobile}`,
      name: data.name.trim() || 'Ghosh Sweet Customer',
      mobile: cleanMobile,
      sweetPoints: 10,
      totalPointsEarned: 10,
      totalPointsRedeemed: 0,
      qualifyingOrdersCount: 0,
      createdAt: Date.now()
    };

    setAccounts(prev => [...prev, newAcc]);
    setCurrentCustomer(newAcc);
    setIsAuthModalOpen(false);

    return { success: true, account: newAcc };
  };

  // Backward-compatible login
  const login = (mobile: string, _pin: string) => {
    const cleanMobile = normalizePhone(mobile);
    const existing = accounts.find(a => normalizePhone(a.mobile) === cleanMobile);
    if (existing) {
      setCurrentCustomer(existing);
      setIsAuthModalOpen(false);
      return { success: true, account: existing };
    }

    return {
      success: false,
      message: language === 'bn' ? 'অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।' : 'Account not found. Please sign up.'
    };
  };

  const logout = async () => {
    await signCustomerOut();
    try {
      localStorage.removeItem('ghosh_customer_session');
    } catch (e) {}
    setCurrentCustomer(null);
    setTransactions([]);
  };

  // 1 Sweet Point = ₹0.50
  const pointsToRupees = (pts: number) => {
    return Number((pts * 0.5).toFixed(2));
  };

  // Formula: For every ₹100 actually spent, customer earns 5 Sweet Points
  // floor(eligible_spending / 100) * 5
  const calculateEarnablePoints = (amount: number) => {
    if (amount <= 0) return 0;
    return Math.floor(amount / 100) * 5;
  };

  // New Customer Discount RPC checking
  const checkDiscountRpc = async (subtotal: number): Promise<DiscountRpcResponse> => {
    const res = await checkNewCustomerDiscountRpc(subtotal, currentCustomer?.id);
    setDiscountRpcState(res);
    return res;
  };

  const isNewCustomerEligibleForDiscount = (_subtotal: number): boolean => {
    return Boolean(discountRpcState?.eligible);
  };

  const calculateNewCustomerDiscount = (_subtotal: number): number => {
    if (discountRpcState?.eligible) {
      return discountRpcState.discount_amount;
    }
    return 0;
  };

  const sweetPoints = currentCustomer ? currentCustomer.sweetPoints : 0;

  const addSweetPoints = (pts: number) => {
    if (pts <= 0 || !currentCustomer) return;
    const updated: CustomerAccount = {
      ...currentCustomer,
      sweetPoints: currentCustomer.sweetPoints + pts,
      totalPointsEarned: currentCustomer.totalPointsEarned + pts
    };
    setCurrentCustomer(updated);
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const redeemSweetPoints = (pts: number) => {
    if (pts <= 0 || !currentCustomer) return;
    const redeemed = Math.min(pts, currentCustomer.sweetPoints);
    const updated: CustomerAccount = {
      ...currentCustomer,
      sweetPoints: Math.max(0, currentCustomer.sweetPoints - redeemed),
      totalPointsRedeemed: currentCustomer.totalPointsRedeemed + redeemed
    };
    setCurrentCustomer(updated);
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const addToCart = (product: ProductItem, selectedPortion?: string, customPrice?: number) => {
    const portion = selectedPortion || (language === 'bn' ? product.portionBn : product.portionEn);
    const itemPrice = customPrice !== undefined ? customPrice : product.price;

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedPortion === portion
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += 1;
        return next;
      }
      return [...prev, { product, selectedPortion: portion, price: itemPrice, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, portion: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedPortion === portion)));
  };

  const updateQuantity = (productId: string, portion: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId && item.selectedPortion === portion) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrderToHistory = (orderData: {
    items: CartItem[];
    subtotal: number;
    newCustomerDiscount?: number;
    pointsRedeemed: number;
    pointsDiscountAmount?: number;
    discountAmount: number;
    finalTotal: number;
    pointsEarned: number;
    orderType: 'delivery' | 'takeaway';
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    paymentMethod?: string;
    specialNote?: string;
    status?: OrderStatus;
  }): OrderHistoryItem => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `GSH-${randomNum}`;
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const isQualifying = Boolean(currentCustomer && orderData.subtotal >= 100 && currentCustomer.qualifyingOrdersCount < 5);

    const newOrder: OrderHistoryItem = {
      id: newOrderId,
      date: formattedDate,
      createdAt: Date.now(),
      items: [...orderData.items],
      subtotal: orderData.subtotal,
      newCustomerDiscount: orderData.newCustomerDiscount || 0,
      pointsRedeemed: orderData.pointsRedeemed,
      pointsDiscountAmount: orderData.pointsDiscountAmount || Number((orderData.pointsRedeemed * 0.5).toFixed(2)),
      discountAmount: orderData.discountAmount,
      finalTotal: orderData.finalTotal,
      pointsEarned: orderData.pointsEarned,
      pointsAwarded: false, // In accordance with Requirement 10: only awarded when status is 'Completed'
      isQualifyingOrder: isQualifying,
      customerId: currentCustomer ? currentCustomer.id : undefined,
      orderType: orderData.orderType,
      customerName: orderData.customerName || (currentCustomer ? currentCustomer.name : undefined),
      customerPhone: orderData.customerPhone || (currentCustomer ? currentCustomer.mobile : undefined),
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery / Pay at Counter',
      specialNote: orderData.specialNote,
      status: orderData.status || 'New Order',
      estimatedMinutes: 15,
      syncStatus: 'pending'
    };

    setOrderHistory(prev => [newOrder, ...prev]);

    // If points redeemed at checkout, immediately deduct from customer balance
    if (currentCustomer && orderData.pointsRedeemed > 0) {
      redeemSweetPoints(orderData.pointsRedeemed);
    }

    // Save order securely to persistent database
    (async () => {
      try {
        await saveOrderToSupabase(newOrder);
        setOrderHistory(prev =>
          prev.map(o => o.id === newOrderId
            ? { ...o, syncStatus: 'synced', lastSyncedAt: Date.now(), syncError: undefined }
            : o
          )
        );
        await updateOrderSyncStatusInSupabase(newOrderId, 'synced');
      } catch (err: any) {
        setOrderHistory(prev =>
          prev.map(o => o.id === newOrderId
            ? { ...o, syncStatus: 'failed', syncError: err.message }
            : o
          )
        );
      }
    })();

    return newOrder;
  };

  // Retry synchronization for failed or pending orders
  const retrySyncOrder = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
    const targetOrder = orderHistory.find(o => o.id === orderId);
    if (!targetOrder) return { success: false, message: 'Order not found' };

    try {
      await saveOrderToSupabase(targetOrder);
      setOrderHistory(prev =>
        prev.map(o => o.id === orderId
          ? { ...o, syncStatus: 'synced', lastSyncedAt: Date.now(), syncError: undefined }
          : o
        )
      );
      await updateOrderSyncStatusInSupabase(orderId, 'synced');
      return { success: true, message: 'Order saved' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  // Batch sync all pending or failed orders
  const syncAllPendingOrders = async (): Promise<void> => {
    const pendingOrders = orderHistory.filter(o => o.syncStatus !== 'synced');
    for (const ord of pendingOrders) {
      await retrySyncOrder(ord.id);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const targetOrder = orderHistory.find(o => o.id === orderId);

    setOrderHistory(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );

    if (targetOrder) {
      const updatedOrder = { ...targetOrder, status };
      (async () => {
        try {
          await saveOrderToSupabase(updatedOrder);
        } catch (e) {
          console.warn('Status update sync notice:', e);
        }
      })();
    }

    // Requirement 10: Only a completed qualifying order counts toward the 5-order limit.
    // When completed: award Sweet Points for spending, increment qualifying count, and log transaction.
    if (status === 'Completed' && targetOrder && !targetOrder.pointsAwarded) {
      const res = await completeQualifyingOrderRpc(
        orderId,
        targetOrder.subtotal,
        targetOrder.customerId || currentCustomer?.id
      );

      if (res.success) {
        setOrderHistory(prev =>
          prev.map(ord =>
            ord.id === orderId
              ? {
                  ...ord,
                  status: 'Completed',
                  pointsAwarded: true,
                  pointsEarned: res.pointsAwarded,
                  isQualifyingOrder: res.isQualifying
                }
              : ord
          )
        );

        if (currentCustomer) {
          const updated: CustomerAccount = {
            ...currentCustomer,
            sweetPoints: currentCustomer.sweetPoints + res.pointsAwarded,
            totalPointsEarned: currentCustomer.totalPointsEarned + res.pointsAwarded,
            qualifyingOrdersCount: res.isQualifying
              ? Math.min(5, currentCustomer.qualifyingOrdersCount + 1)
              : currentCustomer.qualifyingOrdersCount
          };
          setCurrentCustomer(updated);
          setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
          await loadCustomerTransactions();
        }
      }
    }
  };

  const simulateNextOrderStatus = (orderId: string) => {
    const ord = orderHistory.find(o => o.id === orderId);
    if (!ord) return;
    if (ord.status === 'Preparing') {
      updateOrderStatus(orderId, 'Ready for Pickup');
    } else if (ord.status === 'Ready for Pickup') {
      updateOrderStatus(orderId, 'Completed');
    } else {
      updateOrderStatus(orderId, 'Preparing');
    }
  };

  const reorder = (orderId: string) => {
    const targetOrder = orderHistory.find(ord => ord.id === orderId);
    if (!targetOrder || targetOrder.items.length === 0) return;

    setCart([...targetOrder.items]);
    setIsOrdersOpen(false);
    setIsCartOpen(true);
  };

  /**
   * Post-order customer rating and feedback submission.
   * Updates local orderHistory item and persists to Firestore.
   */
  const submitOrderFeedback = async (
    orderId: string,
    feedback: {
      rating: number;
      tags?: string[];
      comment?: string;
      customerName?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const now = new Date().toISOString();
      const feedbackPayload: OrderFeedback = {
        rating: Math.min(5, Math.max(1, Math.round(feedback.rating || 5))),
        tags: Array.isArray(feedback.tags) ? feedback.tags : [],
        comment: (feedback.comment || '').trim(),
        createdAt: now,
        customerName: (feedback.customerName || currentCustomer?.name || 'Customer').trim()
      };

      // Update local state in orderHistory immediately
      setOrderHistory(prev =>
        prev.map(ord => (ord.id === orderId ? { ...ord, feedback: feedbackPayload } : ord))
      );

      // Persist to Firestore
      const res = await submitOrderFeedbackInFirestore(orderId, feedbackPayload);
      return res;
    } catch (err: any) {
      console.error('[ShopContext] Error submitting order feedback:', err);
      return { success: false, error: err.message || 'Failed to submit feedback' };
    }
  };

  const updateProductPrice = (id: string, newPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, price: newPrice } : p))
    );
    updateProductPriceInFirestore(id, newPrice).catch((e) => {
      console.warn('[ShopContext] Firestore price sync notice:', e);
    });
  };

  const updateReview = (id: string, fields: Partial<ReviewItem>) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, ...fields } : r))
    );
  };

  // Auto-restore customer session from Firebase Auth and localStorage
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const saved = localStorage.getItem('ghosh_customer_session');
        if (saved) {
          const { uid } = JSON.parse(saved);
          if (uid) {
            const profile = await getCustomerProfileByUid(uid);
            if (profile && isMounted) {
              setCurrentCustomer(profile);
            }
          }
        }
      } catch (err) {
        console.warn('[ShopContext] Error restoring customer session:', err);
      }
    }

    restoreSession();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && !user.email?.includes('@')) {
        const profile = await getCustomerProfileByUid(user.uid);
        if (profile && isMounted) {
          setCurrentCustomer(profile);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  // Real-time listener for active customer profile updates (e.g. points earned/redeemed)
  useEffect(() => {
    if (!currentCustomer?.id) return;
    const unsub = subscribeToCustomerProfile(currentCustomer.id, (profile) => {
      if (profile) {
        setCurrentCustomer(profile);
      }
    });
    return () => unsub();
  }, [currentCustomer?.id]);

  const resetToDefaults = () => {
    setProducts(initialProducts);
    setShopDetails(initialShopDetails);
    setReviews(initialReviews);
    setCurrentCustomer(null);
    setAccounts([]);
    setOrderHistory(getInitialSampleOrders());
    localStorage.removeItem('ghosh_products_v6');
    localStorage.removeItem('ghosh_shop_details');
    localStorage.removeItem('ghosh_reviews');
    localStorage.removeItem('ghosh_cart');
    localStorage.removeItem('ghosh_order_history');
  };

  const resetToDefaultData = resetToDefaults;
  const t = translations[language];

  return (
    <ShopContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        products,
        setProducts,
        updateProductPrice,
        shopDetails,
        setShopDetails,
        reviews,
        setReviews,
        updateReview,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isAdminOpen,
        setIsAdminOpen,
        currentCustomer,
        accounts,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openSignUpModal,
        openLoginModal,
        isDashboardOpen,
        setIsDashboardOpen,
        sendOtp,
        verifyOtpAndAuthenticate,
        updateCurrentCustomerProfile,
        completeProfileForCustomer,
        signUp,
        login,
        logout,
        sweetPoints,
        pointsToRupees,
        addSweetPoints,
        redeemSweetPoints,
        calculateEarnablePoints,
        isNewCustomerEligibleForDiscount,
        calculateNewCustomerDiscount,
        checkDiscountRpc,
        discountRpcState,
        transactions,
        loadCustomerTransactions,
        orderHistory,
        addOrderToHistory,
        updateOrderStatus,
        simulateNextOrderStatus,
        retrySyncOrder,
        syncAllPendingOrders,
        submitOrderFeedback,
        reorder,
        isOrdersOpen,
        setIsOrdersOpen,
        trackingOrderId,
        setTrackingOrderId,
        isOwnerPortalOpen,
        setIsOwnerPortalOpen,
        t,
        resetToDefaults,
        resetToDefaultData
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

