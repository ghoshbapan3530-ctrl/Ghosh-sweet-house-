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
  SweetPointTransaction
} from '../types';
import { initialProducts, initialShopDetails, initialReviews } from '../data/initialData';
import { translations } from '../data/translations';
import {
  sendOtpToMobile,
  verifyOtpCode,
  createOrGetCustomerProfileRpc,
  checkNewCustomerDiscountRpc,
  completeQualifyingOrderRpc,
  fetchCustomerTransactionsRpc,
  signOutSupabase,
  normalizePhone,
  saveOrderToSupabase,
  updateOrderSyncStatusInSupabase
} from '../lib/supabase';
import { syncOrderToServerSheets, batchSyncOrders, updateOrderSheetStatus } from '../services/sheetsSyncService';

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
  verifyOtpAndAuthenticate: (phone: string, token: string, name?: string) => Promise<{ success: boolean; message?: string; customer?: CustomerAccount; isNew?: boolean }>;
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
  reorder: (orderId: string) => void;
  isOrdersOpen: boolean;
  setIsOrdersOpen: (open: boolean) => void;
  t: typeof translations.bn;
  resetToDefaults: () => void;
  resetToDefaultData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Initial sample customer representing the user-requested specification:
// 25 Points = ₹12.50, Qualifying orders: 2/5, Minimum order: ₹100
const defaultSampleCustomer: CustomerAccount = {
  id: 'CUST-1001',
  auth_user_id: 'auth-user-9733363562',
  name: 'সৌমেন দাস (Soumen Das)',
  mobile: '9733363562',
  email: 'soumen@example.com',
  pin: '1234',
  sweetPoints: 25, // 25 Points = ₹12.50
  totalPointsEarned: 35,
  totalPointsRedeemed: 10,
  qualifyingOrdersCount: 2, // 2/5 qualifying orders completed
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
};

// Initial sample order for immediate demonstration
const getInitialSampleOrders = (): OrderHistoryItem[] => [
  {
    id: 'GSH-7892',
    date: '21 Sep 2026, 06:30 PM',
    createdAt: Date.now() - 1000 * 60 * 25,
    items: [
      {
        product: initialProducts[0] || {
          id: 'spongy-rosogolla',
          nameBn: 'স্পঞ্জ রসগোল্লা',
          nameEn: 'Spongy Rosogolla',
          category: 'sweet',
          portionBn: '১০ পিস',
          portionEn: '10 Pcs',
          price: 150,
          descriptionBn: 'রসালো স্পঞ্জ রসগোল্লা',
          descriptionEn: 'Soft spongy sweet'
        },
        selectedPortion: '১০ পিস (10 Pcs)',
        price: 150,
        quantity: 1
      },
      {
        product: initialProducts[2] || {
          id: 'mishti-doi-handi',
          nameBn: 'ঐতিহ্যবাহী মাটির ভাঁড়ের মিষ্টি দই',
          nameEn: 'Traditional Clay Pot Mishti Doi',
          category: 'sweet',
          portionBn: '৫০০ গ্রাম',
          portionEn: '500g',
          price: 140,
          descriptionBn: 'খাঁটি ঘন দুধের লালচে মিষ্টি দই',
          descriptionEn: 'Caramelized thick Bengali curd'
        },
        selectedPortion: '৫০০ গ্রাম (500g)',
        price: 140,
        quantity: 1
      }
    ],
    subtotal: 290,
    newCustomerDiscount: 14.50, // 5% of 290
    pointsRedeemed: 10,
    pointsDiscountAmount: 5.00, // 10 pts * 0.50
    discountAmount: 19.50,
    finalTotal: 270.50,
    pointsEarned: 13,
    pointsAwarded: true,
    isQualifyingOrder: true,
    customerId: 'CUST-1001',
    orderType: 'takeaway',
    customerName: 'সৌমেন দাস (Soumen Das)',
    customerPhone: '9733363562',
    status: 'Ready for Pickup',
    estimatedMinutes: 5,
    syncStatus: 'synced',
    lastSyncedAt: Date.now() - 1000 * 60 * 20
  }
];

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
  const [accounts, setAccounts] = useState<CustomerAccount[]>([defaultSampleCustomer]);

  // Current active customer:
  // Backed by Supabase auth.users.id -> public.customers.auth_user_id.
  // We do NOT use localStorage, cookies, or device IDs for identity.
  const [currentCustomer, setCurrentCustomer] = useState<CustomerAccount | null>(defaultSampleCustomer);

  // Auth & Dashboard Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Transactions list from Supabase
  const [transactions, setTransactions] = useState<SweetPointTransaction[]>([
    {
      id: 'tx-001',
      customer_id: defaultSampleCustomer.id,
      points: 10,
      reason: 'Signup Bonus',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'tx-002',
      customer_id: defaultSampleCustomer.id,
      order_id: 'GSH-7892',
      points: 13,
      reason: 'Order Purchase',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]);

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

  // 1. Send OTP to Mobile
  const sendOtp = async (phone: string) => {
    return await sendOtpToMobile(phone);
  };

  // 2. Verify OTP & Authenticate Customer
  const verifyOtpAndAuthenticate = async (
    phone: string,
    token: string,
    name?: string
  ): Promise<{ success: boolean; message?: string; customer?: CustomerAccount; isNew?: boolean }> => {
    const otpRes = await verifyOtpCode(phone, token);
    if (!otpRes.success) {
      return { success: false, message: otpRes.message || 'OTP verification failed' };
    }

    const cleanPhone = normalizePhone(phone);
    const profileRes = await createOrGetCustomerProfileRpc(
      name || 'Ghosh Sweet Customer',
      cleanPhone,
      otpRes.authUserId
    );

    if (!profileRes.success || !profileRes.customer) {
      return { success: false, message: profileRes.message || 'Error loading customer profile.' };
    }

    const acc = profileRes.customer;
    setCurrentCustomer(acc);
    setAccounts(prev => {
      const filtered = prev.filter(a => normalizePhone(a.mobile) !== cleanPhone);
      return [...filtered, acc];
    });

    await loadCustomerTransactions();
    setIsAuthModalOpen(false);

    return {
      success: true,
      customer: acc,
      isNew: profileRes.isNew,
      message: profileRes.isNew
        ? (language === 'bn' ? 'অভিনন্দন! ১০ সুইট পয়েন্ট স্বাগত বোনাস যোগ হয়েছে!' : 'Welcome! 10 Sweet Points bonus added!')
        : (language === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Successfully logged in!')
    };
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

    if (cleanMobile === '9733363562') {
      setCurrentCustomer(defaultSampleCustomer);
      setIsAuthModalOpen(false);
      return { success: true, account: defaultSampleCustomer };
    }

    return {
      success: false,
      message: language === 'bn' ? 'অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।' : 'Account not found. Please sign up.'
    };
  };

  const logout = async () => {
    await signOutSupabase();
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

    // MANDATORY SEQUENCE:
    // 1. Keep Supabase as primary live database: save order to Supabase first.
    // 2. Then securely synchronize the order to Google Sheets.
    // 3. If Google Sheets is temporarily unavailable, keep order safely in Supabase with 'failed' status for retry.
    (async () => {
      try {
        await saveOrderToSupabase(newOrder);

        const syncRes = await syncOrderToServerSheets(newOrder);
        if (syncRes.success) {
          setOrderHistory(prev =>
            prev.map(o => o.id === newOrderId
              ? { ...o, syncStatus: 'synced', lastSyncedAt: Date.now(), syncError: undefined }
              : o
            )
          );
          await updateOrderSyncStatusInSupabase(newOrderId, 'synced');
        } else {
          setOrderHistory(prev =>
            prev.map(o => o.id === newOrderId
              ? { ...o, syncStatus: 'failed', syncError: syncRes.error || 'Sync failed' }
              : o
            )
          );
          await updateOrderSyncStatusInSupabase(newOrderId, 'failed', syncRes.error);
        }
      } catch (err: any) {
        setOrderHistory(prev =>
          prev.map(o => o.id === newOrderId
            ? { ...o, syncStatus: 'failed', syncError: err.message }
            : o
          )
        );
        await updateOrderSyncStatusInSupabase(newOrderId, 'failed', err.message);
      }
    })();

    return newOrder;
  };

  // Retry synchronization for failed or pending orders
  const retrySyncOrder = async (orderId: string): Promise<{ success: boolean; message?: string }> => {
    const targetOrder = orderHistory.find(o => o.id === orderId);
    if (!targetOrder) return { success: false, message: 'Order not found' };

    // Mark as pending during sync attempt
    setOrderHistory(prev =>
      prev.map(o => o.id === orderId ? { ...o, syncStatus: 'pending', syncError: undefined } : o)
    );

    try {
      // 1. Ensure saved in primary database (Supabase)
      await saveOrderToSupabase(targetOrder);

      // 2. Sync to Google Sheets
      const syncRes = await syncOrderToServerSheets(targetOrder);

      if (syncRes.success) {
        setOrderHistory(prev =>
          prev.map(o => o.id === orderId
            ? { ...o, syncStatus: 'synced', lastSyncedAt: Date.now(), syncError: undefined }
            : o
          )
        );
        await updateOrderSyncStatusInSupabase(orderId, 'synced');
        return { success: true, message: syncRes.message || 'Synced to Google Sheets' };
      } else {
        setOrderHistory(prev =>
          prev.map(o => o.id === orderId
            ? { ...o, syncStatus: 'failed', syncError: syncRes.error || 'Sync retry failed' }
            : o
          )
        );
        await updateOrderSyncStatusInSupabase(orderId, 'failed', syncRes.error);
        return { success: false, message: syncRes.error || 'Sync retry failed' };
      }
    } catch (e: any) {
      setOrderHistory(prev =>
        prev.map(o => o.id === orderId
          ? { ...o, syncStatus: 'failed', syncError: e.message }
          : o
        )
      );
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

    // If order is updated, re-sync updated status to Google Sheets and Supabase
    if (targetOrder) {
      const updatedOrder = { ...targetOrder, status };
      (async () => {
        await saveOrderToSupabase(updatedOrder);
        await updateOrderSheetStatus(orderId, status);
        const res = await syncOrderToServerSheets(updatedOrder);
        if (res.success) {
          setOrderHistory(prev =>
            prev.map(o => o.id === orderId ? { ...o, syncStatus: 'synced', lastSyncedAt: Date.now() } : o)
          );
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

  const updateProductPrice = (id: string, newPrice: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  const updateReview = (id: string, fields: Partial<ReviewItem>) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, ...fields } : r))
    );
  };

  const resetToDefaults = () => {
    setProducts(initialProducts);
    setShopDetails(initialShopDetails);
    setReviews(initialReviews);
    setCurrentCustomer(defaultSampleCustomer);
    setAccounts([defaultSampleCustomer]);
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
        reorder,
        isOrdersOpen,
        setIsOrdersOpen,
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

