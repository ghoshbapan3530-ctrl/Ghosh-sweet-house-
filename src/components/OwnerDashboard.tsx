import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import {
  FirebaseOrder,
  FirebaseOrderStatus,
  subscribeToAllOrders,
  updateOrderStatusInFirestore,
  subscribeToOwnerSettings,
  saveOwnerSettings,
  OwnerSettings,
  DEFAULT_OWNER_SETTINGS,
  playOrderAlertSound
} from '../lib/firestore-orders';
import {
  requestNotificationPermission,
  getFCMToken,
  saveOwnerFCMToken
} from '../lib/firebase-messaging';
import { auth } from '../lib/firebase';
import { signOutOwner, assertOwnerAuthorized, isOwnerAuthorized, useOwnerAuth } from '../lib/auth';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  LogOut,
  RefreshCw,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  TrendingUp,
  Users,
  Settings,
  Sliders,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Filter,
  Package,
  Calendar,
  Eye,
  Check,
  X,
  Plus,
  Printer,
  LayoutGrid,
  List,
  ArrowUpDown,
  Send,
  ExternalLink,
  Edit3,
  EyeOff,
  Minus,
  Star
} from 'lucide-react';
import { ProductItem } from '../types';
import { EditProductModal } from './EditProductModal';
import { OwnerSalesCharts } from './OwnerSalesCharts';
import {
  updateProductPriceInFirestore,
  toggleProductAvailabilityInFirestore,
  toggleProductEnabledInFirestore,
  updateProductStockInFirestore
} from '../lib/firestore-products';
import { OrderTimestamp } from './OrderTimestamp';
import { InvoiceModal } from './InvoiceModal';
import {
  getDirectTelegramOrderLink,
  sendTelegramOrderNotification,
  sendTelegramTestAlert,
  getTelegramStatus,
  TelegramServerStatus
} from '../services/telegramService';
import {
  parseOrderDate,
  formatOrderDateTime,
  formatOrderTimeOnly,
  formatOrderDateOnly,
  getTimeAgo,
  isOrderToday
} from '../lib/date-utils';

interface OwnerDashboardProps {
  onLogout: () => void;
  onOpenStorefront?: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onLogout, onOpenStorefront }) => {
  const { language, theme, products, shopDetails } = useShop();
  const isDark = theme === 'dark';
  const ownerAuth = useOwnerAuth();

  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [settings, setSettings] = useState<OwnerSettings>(DEFAULT_OWNER_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'new' | 'active' | 'completed' | 'cancelled' | 'customers' | 'products' | 'sales' | 'notifications' | 'settings'
  >('new');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<FirebaseOrder | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<FirebaseOrder | null>(null);

  // Sound & Notifications
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // New order banner alert
  const [newOrderAlert, setNewOrderAlert] = useState<FirebaseOrder | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  // Cancellation Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<FirebaseOrder | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Settings edit state
  const [editableSettings, setEditableSettings] = useState<OwnerSettings>(DEFAULT_OWNER_SETTINGS);
  const [newPincodeInput, setNewPincodeInput] = useState('');
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Search, Sorting & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Telegram Notifications State
  const [telegramStatus, setTelegramStatus] = useState<TelegramServerStatus | null>(null);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestFeedback, setTelegramTestFeedback] = useState<string | null>(null);

  // Product Management State (Real-time Firestore Editing)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<
    'all' | 'sweet' | 'snack' | 'dairy' | 'special'
  >('all');
  const [productFeedbackToast, setProductFeedbackToast] = useState<string | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  // Low Stock Alert System State
  const currentLowStockThreshold = settings.lowStockThreshold || 10;
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'healthy'>('all');
  const [dismissedLowStockAlert, setDismissedLowStockAlert] = useState(false);
  const [quickThresholdInput, setQuickThresholdInput] = useState<number>(currentLowStockThreshold);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);

  useEffect(() => {
    if (settings.lowStockThreshold) {
      setQuickThresholdInput(settings.lowStockThreshold);
    }
  }, [settings.lowStockThreshold]);

  // Compute Low Stock & Out of Stock Products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const threshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : currentLowStockThreshold;
      const stock = typeof p.stockCount === 'number' ? p.stockCount : 25;
      return stock <= threshold;
    });
  }, [products, currentLowStockThreshold]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = typeof p.stockCount === 'number' ? p.stockCount : 25;
      return stock === 0 || p.isAvailable === false;
    });
  }, [products]);

  const healthyStockProducts = useMemo(() => {
    return products.filter((p) => {
      const threshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : currentLowStockThreshold;
      const stock = typeof p.stockCount === 'number' ? p.stockCount : 25;
      return stock > threshold && p.isAvailable !== false;
    });
  }, [products, currentLowStockThreshold]);

  const handleUpdateGlobalThreshold = async (newVal: number) => {
    const val = Math.max(1, Math.round(newVal));
    setQuickThresholdInput(val);
    setIsUpdatingThreshold(true);
    try {
      await saveOwnerSettings({ lowStockThreshold: val });
      showProductFeedback(`Low stock alert threshold set to ${val} units`);
    } catch (err: any) {
      showProductFeedback(`Error: ${err.message || 'Failed to update threshold'}`);
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  const handleQuickStockChange = async (p: ProductItem, delta: number) => {
    const curStock = typeof p.stockCount === 'number' ? p.stockCount : 25;
    const newStock = Math.max(0, curStock + delta);
    setUpdatingProductId(p.id);
    const res = await updateProductStockInFirestore(p.id, newStock);
    setUpdatingProductId(null);
    if (res.success) {
      showProductFeedback(`Stock for ${p.nameEn}: ${newStock} units`);
    } else {
      showProductFeedback(`Error: ${res.error || 'Failed to update stock'}`);
    }
  };

  const handleQuickRestock = async (p: ProductItem, addUnits: number) => {
    const curStock = typeof p.stockCount === 'number' ? p.stockCount : 25;
    const newStock = curStock + addUnits;
    setUpdatingProductId(p.id);
    const res = await updateProductStockInFirestore(p.id, newStock);
    setUpdatingProductId(null);
    if (res.success) {
      showProductFeedback(`Restocked +${addUnits} units for ${p.nameEn} (Total: ${newStock})`);
    } else {
      showProductFeedback(`Error: ${res.error || 'Failed to restock'}`);
    }
  };

  const showProductFeedback = (msg: string) => {
    setProductFeedbackToast(msg);
    setTimeout(() => setProductFeedbackToast(null), 3200);
  };

  const handleQuickPriceChange = async (p: ProductItem, delta: number) => {
    const newPrice = Math.max(0, p.price + delta);
    setUpdatingProductId(p.id);
    const res = await updateProductPriceInFirestore(p.id, newPrice);
    setUpdatingProductId(null);
    if (res.success) {
      showProductFeedback(`₹${newPrice} updated for ${p.nameEn}`);
    } else {
      showProductFeedback(`Error: ${res.error || 'Failed to update price'}`);
    }
  };

  const handleToggleProductAvailability = async (p: ProductItem) => {
    const nextVal = p.isAvailable === false;
    setUpdatingProductId(p.id);
    const res = await toggleProductAvailabilityInFirestore(p.id, nextVal);
    setUpdatingProductId(null);
    if (res.success) {
      showProductFeedback(
        `${p.nameEn} marked ${nextVal ? 'AVAILABLE 🟢' : 'OUT OF STOCK 🔴'}`
      );
    }
  };

  const handleToggleProductEnabled = async (p: ProductItem) => {
    const nextVal = p.isEnabled === false;
    setUpdatingProductId(p.id);
    const res = await toggleProductEnabledInFirestore(p.id, nextVal);
    setUpdatingProductId(null);
    if (res.success) {
      showProductFeedback(
        `${p.nameEn} is now ${nextVal ? 'ENABLED in menu 👁️' : 'HIDDEN from menu 🚫'}`
      );
    }
  };

  const handleAddNewProduct = () => {
    const newId = `product-${Date.now()}`;
    const newProd: ProductItem = {
      id: newId,
      nameEn: '',
      nameBn: '',
      category: 'sweet',
      price: 10,
      portionEn: 'per piece',
      portionBn: 'প্রতি পিস',
      descriptionEn: '',
      descriptionBn: '',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isEnabled: true
    };
    setEditingProduct(newProd);
    setIsEditProductModalOpen(true);
  };

  // Load telegram status on mount
  useEffect(() => {
    getTelegramStatus().then((s) => s && setTelegramStatus(s));
  }, []);

  const handleTestTelegramAlert = async () => {
    setIsTestingTelegram(true);
    setTelegramTestFeedback(null);
    try {
      const res = await sendTelegramTestAlert(editableSettings.telegramBotToken, editableSettings.telegramChatId);
      if (res.success) {
        setTelegramTestFeedback('✅ Test order alert prepared for https://t.me/r5yyy5z! Opening Telegram...');
        if (res.directUrl) {
          window.open(res.directUrl, '_blank');
        }
        const stat = await getTelegramStatus();
        if (stat) setTelegramStatus(stat);
      } else {
        setTelegramTestFeedback(`⚠️ ${res.error || 'Failed to send test alert'}`);
      }
    } catch (e: any) {
      setTelegramTestFeedback(`⚠️ Error: ${e.message || 'Could not reach server'}`);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // Subscribe to Orders & Settings
  useEffect(() => {
    setLoading(true);

    // Defensive fallback timer: prevents infinite loading if offline or delayed
    const timeoutTimer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const unsubOrders = subscribeToAllOrders(
      (allOrders) => {
        clearTimeout(timeoutTimer);
        setLoading(false);

        // Check if a new order just came in
        if (previousOrderIdsRef.current.size > 0) {
          const newlyAdded = allOrders.find(
            (o) => !previousOrderIdsRef.current.has(o.orderId) && o.status === 'PENDING'
          );
          if (newlyAdded) {
            setNewOrderAlert(newlyAdded);
            if (!isSoundMuted) {
              playOrderAlertSound();
            }
            // Auto dispatch Telegram notification to https://t.me/r5yyy5z
            sendTelegramOrderNotification(
              newlyAdded,
              editableSettings.telegramBotToken,
              editableSettings.telegramChatId
            ).catch(console.warn);
          }
        }

        previousOrderIdsRef.current = new Set(allOrders.map((o) => o.orderId));
        setOrders(allOrders);

        // Keep selected order in sync if currently viewed
        setSelectedOrder((prev) => {
          if (!prev) return null;
          const fresh = allOrders.find((o) => o.orderId === prev.orderId);
          return fresh || prev;
        });
      },
      (err) => {
        clearTimeout(timeoutTimer);
        console.error('[OwnerDashboard] Firestore subscription error:', err);
        setLoading(false);
      }
    );

    const unsubSettings = subscribeToOwnerSettings((st) => {
      setSettings(st);
      setEditableSettings(st);
    });

    return () => {
      clearTimeout(timeoutTimer);
      unsubOrders();
      unsubSettings();
    };
  }, [isSoundMuted]);

  // Request Push Notifications
  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        await saveOwnerFCMToken(token);
      }
    }
  };

  // Status transitions
  const handleUpdateStatus = async (
    order: FirebaseOrder,
    nextStatus: FirebaseOrderStatus,
    extra?: { cancelReason?: string; estimatedMinutes?: number }
  ) => {
    setUpdatingStatusId(order.orderId);
    try {
      await assertOwnerAuthorized();
      await updateOrderStatusInFirestore(order.orderId, nextStatus, extra);
      if (selectedOrder && selectedOrder.orderId === order.orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus, ...extra } : null));
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Could not update status. Please check your network and Firestore permissions.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    await handleUpdateStatus(cancelModalOrder, 'CANCELLED', {
      cancelReason: cancelReasonInput.trim() || 'Cancelled by store'
    });
    setCancelModalOrder(null);
    setCancelReasonInput('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assertOwnerAuthorized();
      await saveOwnerSettings(editableSettings);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      alert(err.message || 'Failed to save settings.');
    }
  };

  const handleAddPincode = () => {
    const pin = newPincodeInput.trim();
    if (pin && /^[0-9]{6}$/.test(pin) && !editableSettings.supportedPincodes.includes(pin)) {
      setEditableSettings({
        ...editableSettings,
        supportedPincodes: [...editableSettings.supportedPincodes, pin]
      });
      setNewPincodeInput('');
    }
  };

  const handleRemovePincode = (pin: string) => {
    setEditableSettings({
      ...editableSettings,
      supportedPincodes: editableSettings.supportedPincodes.filter((p) => p !== pin)
    });
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todaySales = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const acceptedOrders = orders.filter((o) => o.status === 'ACCEPTED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const outForDeliveryOrders = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
  const activeOrders = orders.filter(
    (o) =>
      o.status === 'ACCEPTED' ||
      o.status === 'PREPARING' ||
      o.status === 'READY' ||
      o.status === 'OUT_FOR_DELIVERY'
  );
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

  // Sales aggregates
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekSales = orders
    .filter((o) => o.createdAt >= sevenDaysAgo && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const monthSales = orders
    .filter((o) => o.createdAt >= thirtyDaysAgo && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered orders list based on tab & search
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === 'new') return o.status === 'PENDING';
    if (activeTab === 'active')
      return (
        o.status === 'ACCEPTED' ||
        o.status === 'PREPARING' ||
        o.status === 'READY' ||
        o.status === 'OUT_FOR_DELIVERY'
      );
    if (activeTab === 'completed') return o.status === 'DELIVERED';
    if (activeTab === 'cancelled') return o.status === 'CANCELLED';

    return true;
  });

  // Sort orders by placed timestamp or total amount to optimize dashboard organization
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const timeA = parseOrderDate(a.createdAt).getTime();
    const timeB = parseOrderDate(b.createdAt).getTime();
    if (sortBy === 'newest') return timeB - timeA;
    if (sortBy === 'oldest') return timeA - timeB;
    if (sortBy === 'amount_high') return b.totalAmount - a.totalAmount;
    if (sortBy === 'amount_low') return a.totalAmount - b.totalAmount;
    return timeB - timeA;
  });

  // Extract unique customers
  const customersMap = new Map<
    string,
    { name: string; phone: string; totalOrders: number; totalSpent: number; lastAddress: string }
  >();
  orders.forEach((o) => {
    const existing = customersMap.get(o.phone);
    if (existing) {
      existing.totalOrders += 1;
      if (o.status !== 'CANCELLED') existing.totalSpent += o.totalAmount;
      if (!existing.lastAddress && o.deliveryAddress) existing.lastAddress = o.deliveryAddress;
    } else {
      customersMap.set(o.phone, {
        name: o.customerName,
        phone: o.phone,
        totalOrders: 1,
        totalSpent: o.status !== 'CANCELLED' ? o.totalAmount : 0,
        lastAddress: o.deliveryAddress
      });
    }
  });
  const customerList = Array.from(customersMap.values());

  const handleLogout = async () => {
    await signOutOwner();
    onLogout();
  };

  // Defensive checks to prevent rendering until both owner authentication and store data loading are false
  if (ownerAuth.loading || loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${
          isDark ? 'bg-[#120B06] text-amber-500' : 'bg-[#FAF6F0] text-amber-600'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide">
          {ownerAuth.loading
            ? language === 'bn'
              ? 'মালিকের প্রমাণীকরণ যাচাই করা হচ্ছে...'
              : 'Verifying Owner Management Access...'
            : language === 'bn'
            ? 'দোকানের অর্ডার ও তথ্য লোড হচ্ছে...'
            : 'Loading Store Orders & Settings...'}
        </p>
        <p className="text-xs text-stone-500 mt-1">Connecting to Ghosh Sweet House Firebase Database</p>
      </div>
    );
  }

  if (!ownerAuth.isAuthorized) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${
          isDark ? 'bg-[#120B06] text-stone-100' : 'bg-[#FAF6F0] text-stone-900'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-serif mb-2">
          {language === 'bn' ? 'অনুমোদনহীন অ্যাক্সেস' : 'Unauthorized Access'}
        </h2>
        <p className="text-xs text-stone-400 max-w-sm text-center mb-6">
          {language === 'bn'
            ? 'এই ড্যাশবোর্ডটি শুধুমাত্র ঘোষ সুইট হাউজের অনুমোদিত মালিকদের জন্য সংরক্ষিত।'
            : 'Access restricted to authorized Ghosh Sweet House management accounts.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow"
          >
            {language === 'bn' ? 'মালিক লগইন' : 'Owner Login'}
          </button>
          {onOpenStorefront && (
            <button
              onClick={onOpenStorefront}
              className="px-4 py-2 rounded-xl border border-stone-600 text-stone-300 font-bold text-xs hover:bg-stone-800 transition-colors"
            >
              {language === 'bn' ? 'দোকানে ফিরুন' : 'Back to Store'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-[#120B06] text-stone-100' : 'bg-[#FAF6F0] text-stone-900'
      } pb-20`}
    >
      {/* Top Banner Alert when a new order arrives */}
      {newOrderAlert && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2.5 shadow-lg flex items-center justify-between sticky top-0 z-50 animate-bounce">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Bell className="w-4 h-4 animate-spin" />
            <span>
              🔔 NEW ORDER: #{newOrderAlert.orderId} • {newOrderAlert.customerName} • ₹
              {newOrderAlert.totalAmount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedOrder(newOrderAlert);
                setNewOrderAlert(null);
              }}
              className="px-3 py-1 bg-stone-950 text-white rounded-lg text-xs font-bold hover:bg-stone-800"
            >
              View Order →
            </button>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="p-1 text-stone-950 hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Low Stock Warning Alert Banner */}
      {lowStockProducts.length > 0 && !dismissedLowStockAlert && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 px-4 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 border-b border-amber-600 animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <span className="p-1 rounded-md bg-stone-950/20 text-stone-950 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </span>
            <span>
              <strong>Low Stock Alert:</strong> {lowStockProducts.length} {lowStockProducts.length === 1 ? 'sweet item is' : 'sweet items are'} at or below threshold ({currentLowStockThreshold} units).
              <span className="hidden md:inline font-normal ml-1.5 opacity-90">
                ({lowStockProducts.slice(0, 3).map((p: ProductItem) => `${p.nameEn}: ${typeof p.stockCount === 'number' ? p.stockCount : 25} left`).join(', ')}{lowStockProducts.length > 3 ? ` +${lowStockProducts.length - 3} more` : ''})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                setStockFilter('low_stock');
              }}
              className="px-3 py-1 bg-stone-950 text-amber-300 rounded-lg text-xs font-bold hover:bg-stone-900 transition-all active:scale-95 shadow-sm"
            >
              Restock Items ({lowStockProducts.length}) →
            </button>
            <button
              type="button"
              onClick={() => setDismissedLowStockAlert(true)}
              className="p-1 text-stone-950 hover:bg-stone-950/10 rounded transition-colors"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#180E08]/95 border-amber-900/40 text-stone-100'
            : 'bg-white/95 border-stone-200 text-stone-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-bold font-serif">GHOSH SWEET HOUSE</h1>
            </div>
            <p className="text-[11px] text-amber-500 font-semibold tracking-wider uppercase">
              Owner Dashboard • ঘোষ মিষ্টান্ন ভাণ্ডার
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Authenticated Owner Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[200px]" title={ownerAuth.user?.email || 'Authorized Owner'}>
                {ownerAuth.user?.email || 'Authorized Owner'}
              </span>
            </div>

            {/* Audio Mute/Unmute */}
            <button
              type="button"
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                isSoundMuted
                  ? 'border-stone-500/30 text-stone-400 hover:text-stone-300'
                  : 'border-amber-500/40 text-amber-500 bg-amber-500/10'
              }`}
              title={isSoundMuted ? 'Unmute order audio chime' : 'Mute order audio chime'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Push Notifications status */}
            {notificationPermission !== 'granted' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-500 bg-amber-500/10 text-xs font-semibold hover:bg-amber-500/20"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Push Alerts</span>
              </button>
            )}

            {/* Storefront Link */}
            {onOpenStorefront && (
              <button
                type="button"
                onClick={onOpenStorefront}
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-amber-500/10"
              >
                <span>Storefront</span>
              </button>
            )}

            {/* Telegram Notification Status Link */}
            <a
              href="https://t.me/r5yyy5z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-sky-500/40 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-semibold transition-all shadow-sm"
              title="Every order notifies https://t.me/r5yyy5z"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Telegram: @r5yyy5z</span>
              <span className="md:hidden">@r5yyy5z</span>
            </a>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none flex items-center gap-1 border-t border-amber-500/15 py-1.5">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'new'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>New Orders</span>
            {pendingOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-mono">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'active'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Active Orders</span>
            {activeOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-mono">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'completed'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Completed</span>
            <span className="text-[10px] opacity-70 font-mono">({deliveredOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'cancelled'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
            <span className="text-[10px] opacity-70 font-mono">({cancelledOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'customers'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customerList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'products'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
            {lowStockProducts.length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white animate-pulse flex items-center gap-0.5"
                title={`${lowStockProducts.length} items are low in stock`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>{lowStockProducts.length}</span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'sales'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'notifications'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-stone-950'
                : 'text-stone-600 dark:text-stone-400 hover:bg-amber-500/10'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => setActiveTab('new')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              pendingOrders.length > 0
                ? 'bg-red-500/10 border-red-500/40 text-red-500 ring-2 ring-red-500/20'
                : isDark
                ? 'bg-[#180E08] border-stone-800'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>New Orders</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono">{pendingOrders.length}</span>
          </div>

          <div
            onClick={() => setActiveTab('active')}
            className={`p-3.5 rounded-2xl border cursor-pointer ${
              isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-amber-500">
              <span>Accepted</span>
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-500">
              {acceptedOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('active')}
            className={`p-3.5 rounded-2xl border cursor-pointer ${
              isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-amber-400">
              <span>Preparing</span>
              <ChefHat className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
              {preparingOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('active')}
            className={`p-3.5 rounded-2xl border cursor-pointer ${
              isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-cyan-500">
              <span>Out for Delivery</span>
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-500">
              {outForDeliveryOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('completed')}
            className={`p-3.5 rounded-2xl border cursor-pointer ${
              isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-emerald-500">
              <span>Delivered</span>
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-500">
              {deliveredOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('sales')}
            className={`p-3.5 rounded-2xl border cursor-pointer ${
              isDark
                ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Today's Sales</span>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-mono">₹{todaySales}</span>
          </div>
        </div>

        {/* Tab 1-4: Orders Lists (New, Active, Completed, Cancelled) */}
        {(activeTab === 'new' ||
          activeTab === 'active' ||
          activeTab === 'completed' ||
          activeTab === 'cancelled') && (
          <div className="space-y-4">
            {/* Search, Sort and View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID, Customer name or Mobile..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark
                      ? 'bg-[#180E08] border-stone-800 text-stone-100 placeholder-stone-600'
                      : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {/* Sort selector by Placed Timestamp / Amount */}
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#180E08] text-stone-600 dark:text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] text-stone-400 hidden md:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="Sort orders"
                      className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-stone-800 dark:text-stone-200"
                    >
                      <option value="newest" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'}>
                        Placed: Newest first
                      </option>
                      <option value="oldest" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'}>
                        Placed: Oldest first
                      </option>
                      <option value="amount_high" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'}>
                        Amount: High to Low
                      </option>
                      <option value="amount_low" className={isDark ? 'bg-stone-900 text-white' : 'bg-white text-stone-900'}>
                        Amount: Low to High
                      </option>
                    </select>
                  </div>
                </div>

                {/* View Mode Toggle: Cards vs Table */}
                <div className="flex items-center rounded-xl p-0.5 border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
                  <button
                    onClick={() => setViewMode('cards')}
                    title="Card Grid View"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    title="Detailed Table View"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'table'
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-stone-500 font-mono px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-900">
                  {sortedOrders.length} {sortedOrders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-stone-500">Loading orders from Firestore...</p>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div
                className={`py-12 rounded-2xl border text-center p-6 ${
                  isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
                }`}
              >
                <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-40" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  No orders in this category
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Orders will appear in real-time as customers place them.
                </p>
              </div>
            ) : viewMode === 'table' ? (
              /* High-Density Table View for Superior Organization */
              <div
                className={`rounded-2xl border overflow-hidden shadow-sm ${
                  isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider text-[10px] bg-stone-50 dark:bg-stone-900/50">
                      <tr>
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Placed Timestamp</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Items</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800/60">
                      {sortedOrders.map((order) => (
                        <tr
                          key={order.orderId}
                          className={`hover:bg-amber-500/5 transition-colors ${
                            order.status === 'PENDING' ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-amber-500">
                            #{order.orderId}
                          </td>
                          <td className="py-3 px-3">
                            <OrderTimestamp timestamp={order.createdAt} mode="badge" />
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {order.customerName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                              <span className="font-mono">{order.phone}</span>
                              <a
                                href={`tel:${order.phone}`}
                                className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-amber-500"
                                title="Call customer"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(
                                  `Hello ${order.customerName}, regarding your order #${order.orderId} from Ghosh Sweet House...`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-emerald-500"
                                title="WhatsApp customer"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-[200px]">
                            <div className="truncate text-stone-600 dark:text-stone-300">
                              {order.items.map((it) => `${it.quantity}× ${it.productName}`).join(', ')}
                            </div>
                            <div className="text-[10px] text-stone-400 capitalize">
                              {order.orderType} • {order.paymentMethod.toUpperCase()}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-500">
                            ₹{order.totalAmount}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                                order.status === 'PENDING'
                                  ? 'bg-amber-500 text-stone-950 animate-pulse'
                                  : order.status === 'ACCEPTED'
                                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                                  : order.status === 'PREPARING'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                  : order.status === 'READY'
                                  ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                                  : order.status === 'OUT_FOR_DELIVERY'
                                  ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30'
                                  : order.status === 'DELIVERED'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-500 border border-red-500/30'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="py-1 px-2.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setInvoiceModalOrder(order)}
                                className="py-1 px-2 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                                title="View & Print Tax Invoice"
                              >
                                <Printer className="w-3 h-3" />
                                <span className="hidden xl:inline">Invoice</span>
                              </button>

                              {order.status === 'PENDING' && (
                                <button
                                  disabled={updatingStatusId === order.orderId}
                                  onClick={() => handleUpdateStatus(order, 'ACCEPTED')}
                                  className="py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                                >
                                  Accept
                                </button>
                              )}
                              {order.status === 'ACCEPTED' && (
                                <button
                                  disabled={updatingStatusId === order.orderId}
                                  onClick={() => handleUpdateStatus(order, 'PREPARING')}
                                  className="py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                                >
                                  Prepare
                                </button>
                              )}
                              {order.status === 'PREPARING' && (
                                <button
                                  disabled={updatingStatusId === order.orderId}
                                  onClick={() => handleUpdateStatus(order, 'READY')}
                                  className="py-1 px-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs"
                                >
                                  Ready
                                </button>
                              )}
                              {order.status === 'READY' && (
                                <button
                                  disabled={updatingStatusId === order.orderId}
                                  onClick={() => handleUpdateStatus(order, 'OUT_FOR_DELIVERY')}
                                  className="py-1 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs"
                                >
                                  Dispatch
                                </button>
                              )}
                              {order.status === 'OUT_FOR_DELIVERY' && (
                                <button
                                  disabled={updatingStatusId === order.orderId}
                                  onClick={() => handleUpdateStatus(order, 'DELIVERED')}
                                  className="py-1 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
                                >
                                  Delivered
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Card Grid View with Explicit Timestamp */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className={`rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                      order.status === 'PENDING'
                        ? 'border-amber-500/60 bg-amber-500/5'
                        : isDark
                        ? 'bg-[#180E08] border-stone-800'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div>
                      {/* Top order tag with Order ID, Timestamp & Relative Age */}
                      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-stone-200 dark:border-stone-800/80">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-xs text-amber-500 block">
                            #{order.orderId}
                          </span>
                          <OrderTimestamp timestamp={order.createdAt} mode="badge" />
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'PENDING'
                              ? 'bg-amber-500 text-stone-950 animate-pulse'
                              : order.status === 'ACCEPTED'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                              : order.status === 'PREPARING'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              : order.status === 'READY'
                              ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                              : order.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30'
                              : order.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-500 border border-red-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-2">
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
                          <span>{order.customerName}</span>
                          <span className="font-mono text-amber-500 font-bold">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold">{order.phone}</span>
                            <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                              {order.paymentMethod}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${order.phone}`}
                              className="p-1 rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              title="Call customer"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://wa.me/91${order.phone}?text=${encodeURIComponent(
                                `Hello ${order.customerName}, regarding your order #${order.orderId} from Ghosh Sweet House...`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              title="WhatsApp customer"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                          📍 {order.deliveryAddress}
                        </p>
                      </div>

                      {/* Items preview */}
                      <div className="py-1.5 border-t border-b border-stone-200 dark:border-stone-800/60 my-2 space-y-0.5 text-[11px]">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-stone-600 dark:text-stone-400">
                            <span>
                              {item.quantity}× {item.productName}
                            </span>
                            <span className="font-mono">₹{item.subtotal}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-[10px] text-stone-400 italic block">
                            +{order.items.length - 3} more items...
                          </span>
                        )}
                      </div>

                      {/* Customer Post-Order Feedback Rating Pill */}
                      {order.feedback && (
                        <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                            <span className="flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                              {order.feedback.rating}/5
                            </span>
                            {order.feedback.tags && order.feedback.tags.length > 0 && (
                              <span className="text-stone-300 font-normal font-sans truncate max-w-[130px]">
                                • {order.feedback.tags[0]}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Review
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInvoiceModalOrder(order)}
                        className="py-1.5 px-2.5 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                        title="View & Print Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      {/* Fast status actions depending on current stage */}
                      {order.status === 'PENDING' && (
                        <button
                          disabled={updatingStatusId === order.orderId}
                          onClick={() => handleUpdateStatus(order, 'ACCEPTED')}
                          className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                        >
                          Accept
                        </button>
                      )}

                      {order.status === 'ACCEPTED' && (
                        <button
                          disabled={updatingStatusId === order.orderId}
                          onClick={() => handleUpdateStatus(order, 'PREPARING')}
                          className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                        >
                          Prepare
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          disabled={updatingStatusId === order.orderId}
                          onClick={() => handleUpdateStatus(order, 'READY')}
                          className="py-1.5 px-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs"
                        >
                          Ready
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          disabled={updatingStatusId === order.orderId}
                          onClick={() => handleUpdateStatus(order, 'OUT_FOR_DELIVERY')}
                          className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs"
                        >
                          Dispatch
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          disabled={updatingStatusId === order.orderId}
                          onClick={() => handleUpdateStatus(order, 'DELIVERED')}
                          className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs"
                        >
                          Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Customers Directory */}
        {activeTab === 'customers' && (
          <div
            className={`rounded-2xl border p-4 sm:p-6 shadow-sm ${
              isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <h2 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>Customer Directory ({customerList.length})</span>
            </h2>

            {customerList.length === 0 ? (
              <p className="text-xs text-stone-500">No customer records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Customer Name</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Orders</th>
                      <th className="py-2 px-3">Total Spent</th>
                      <th className="py-2 px-3">Last Address</th>
                      <th className="py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800/60">
                    {customerList.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-amber-500/5">
                        <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-stone-100">
                          {cust.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{cust.phone}</td>
                        <td className="py-2.5 px-3 font-mono">{cust.totalOrders}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-500">
                          ₹{cust.totalSpent}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-stone-500">
                          {cust.lastAddress || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3">
                          <a
                            href={`tel:${cust.phone}`}
                            className="p-1.5 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 inline-flex items-center mr-1"
                            title="Call customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/91${cust.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 inline-flex items-center"
                            title="Message customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Header & Controls Card */}
            <div
              className={`rounded-2xl border p-4 sm:p-6 shadow-sm ${
                isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-serif flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    <span>Product Management & Inventory • পণ্য ও মজুত পরিচালনা</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Real-time Cloud Firestore catalog & inventory alert system. Changes sync live across customer screens.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Global Low Stock Threshold Control Pill */}
                  <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-stone-500 dark:text-stone-400 font-semibold">Alert Threshold:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isUpdatingThreshold || quickThresholdInput <= 1}
                        onClick={() => handleUpdateGlobalThreshold(quickThresholdInput - 1)}
                        className="w-6 h-6 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-bold flex items-center justify-center transition-colors disabled:opacity-40"
                        title="Decrease alert threshold"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="font-mono font-bold text-amber-500 px-1 text-sm">
                        {quickThresholdInput}
                      </span>
                      <button
                        type="button"
                        disabled={isUpdatingThreshold}
                        onClick={() => handleUpdateGlobalThreshold(quickThresholdInput + 1)}
                        className="w-6 h-6 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-bold flex items-center justify-center transition-colors disabled:opacity-40"
                        title="Increase alert threshold"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-stone-400">units</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewProduct}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Feedback Toast */}
              {productFeedbackToast && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{productFeedbackToast}</span>
                </div>
              )}

              {/* Status & Inventory Alert Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4 text-xs">
                <button
                  type="button"
                  onClick={() => setStockFilter('all')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stockFilter === 'all'
                      ? 'bg-stone-800 text-stone-100 border-amber-500/50 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800/80 hover:border-amber-500/30'
                  }`}
                >
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] uppercase font-bold block mb-0.5">
                    Total Catalog
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base">{products.length}</span>
                    <span className="text-[10px] text-stone-400">Items</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStockFilter('low_stock')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stockFilter === 'low_stock'
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 ring-2 ring-amber-500/30 shadow-md'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15'
                  }`}
                >
                  <span className="text-[10px] uppercase font-extrabold flex items-center gap-1 block mb-0.5">
                    <AlertTriangle className="w-3 h-3 animate-pulse" />
                    <span>Low Stock Alert</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-amber-300">
                      {lowStockProducts.length}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400/80">
                      &le; {currentLowStockThreshold} units
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStockFilter('out_of_stock')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stockFilter === 'out_of_stock'
                      ? 'bg-red-500/25 border-red-500 text-red-300 ring-2 ring-red-500/30 shadow-md'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-red-400 block mb-0.5">
                    Out of Stock
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base">{outOfStockProducts.length}</span>
                    <span className="text-[10px] text-red-400/80">0 left</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStockFilter('healthy')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stockFilter === 'healthy'
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                    Healthy Stock
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base">
                      {healthyStockProducts.length}
                    </span>
                    <span className="text-[10px] text-emerald-400/80">&gt; {currentLowStockThreshold}</span>
                  </div>
                </button>

                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
                  <span className="text-stone-500 dark:text-stone-400 text-[10px] uppercase font-bold block mb-0.5">
                    Hidden from Menu
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base">
                      {products.filter((p) => p.isEnabled === false).length}
                    </span>
                    <span className="text-[10px] text-stone-400">Disabled</span>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search sweets by English or বাংলা name..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-500'
                        : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Combined Stock & Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                  {/* Stock Filter Pills */}
                  <div className="flex items-center gap-1 pr-2 border-r border-stone-300 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setStockFilter('all')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        stockFilter === 'all'
                          ? 'bg-stone-800 text-white font-bold'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      All Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockFilter('low_stock')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                        stockFilter === 'low_stock'
                          ? 'bg-amber-500 text-stone-950 shadow-sm'
                          : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low Stock ({lowStockProducts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockFilter('out_of_stock')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        stockFilter === 'out_of_stock'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      Out of Stock ({outOfStockProducts.length})
                    </button>
                  </div>

                  {/* Category Pills */}
                  {(
                    [
                      { id: 'all', label: 'All Categories' },
                      { id: 'sweet', label: 'Sweets (মিষ্টি)' },
                      { id: 'snack', label: 'Snacks (নাস্তা)' },
                      { id: 'dairy', label: 'Dairy (দই/ক্ষীর)' },
                      { id: 'special', label: 'Special' }
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedProductCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedProductCategory === cat.id
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-amber-400 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {(() => {
              const filtered = products.filter((p) => {
                if (selectedProductCategory !== 'all' && p.category !== selectedProductCategory) {
                  return false;
                }
                if (productSearchQuery.trim()) {
                  const q = productSearchQuery.toLowerCase().trim();
                  const matchEn = p.nameEn.toLowerCase().includes(q);
                  const matchBn = p.nameBn.toLowerCase().includes(q);
                  const matchCat = p.category.toLowerCase().includes(q);
                  if (!matchEn && !matchBn && !matchCat) return false;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-8 text-center rounded-2xl border border-stone-800 bg-[#180E08] text-stone-400 text-xs space-y-2">
                    <Package className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
                    <p className="font-semibold">No products match your search or filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setProductSearchQuery('');
                        setSelectedProductCategory('all');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs"
                    >
                      Clear Filters
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filtered.map((p) => {
                    const isUpdating = updatingProductId === p.id;
                    const isOutOfStock = p.isAvailable === false;
                    const isDisabled = p.isEnabled === false;

                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-4 text-xs transition-all relative flex flex-col justify-between ${
                          isDark ? 'bg-[#180E08]' : 'bg-white'
                        } ${
                          isDisabled
                            ? 'border-stone-800 opacity-60'
                            : isOutOfStock
                            ? 'border-red-500/30'
                            : 'border-stone-200 dark:border-stone-800 hover:border-amber-500/40'
                        }`}
                      >
                        <div>
                          {/* Top Row: Thumbnail + Names + Category */}
                          <div className="flex gap-3 items-start mb-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-900 border border-amber-500/20 flex-shrink-0 relative">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.nameEn}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-600 text-[10px]">
                                  No Img
                                </div>
                              )}
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[9px] font-bold text-red-400 text-center leading-tight p-0.5">
                                  Out of Stock
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  {p.category}
                                </span>
                                {p.isBestSeller && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-amber-500 text-stone-950 font-bold">
                                    ★ Best
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate">
                                {p.nameEn}
                              </h3>
                              <p className="text-[11px] text-amber-500 font-bengali truncate">
                                {p.nameBn}
                              </p>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                {p.portionEn}
                              </span>
                            </div>
                          </div>

                          {/* Price Stepper Row */}
                          <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800/80 mb-3 flex items-center justify-between">
                            <span className="text-[11px] text-stone-400 font-medium">Price:</span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleQuickPriceChange(p, -1)}
                                className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-bold flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
                                title="Decrease ₹1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className="font-mono font-bold text-amber-500 text-sm px-2">
                                ₹{p.price}
                              </span>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleQuickPriceChange(p, 1)}
                                className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-bold flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
                                title="Increase ₹1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Availability & Visibility Toggles */}
                          <div className="grid grid-cols-2 gap-1.5 mb-3">
                            {/* Stock Availability Toggle */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleToggleProductAvailability(p)}
                              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                                !isOutOfStock
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                              }`}
                              title={
                                !isOutOfStock
                                  ? 'Click to mark Out of Stock'
                                  : 'Click to mark Available'
                              }
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  !isOutOfStock ? 'bg-emerald-400' : 'bg-red-500'
                                }`}
                              />
                              <span>{!isOutOfStock ? 'Available' : 'Out of Stock'}</span>
                            </button>

                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleToggleProductEnabled(p)}
                              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                                !isDisabled
                                  ? 'bg-stone-100 dark:bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-500'
                                  : 'bg-amber-950/20 text-stone-500 border-stone-800'
                              }`}
                              title={
                                !isDisabled
                                  ? 'Click to hide from customer menu'
                                  : 'Click to show on customer menu'
                              }
                            >
                              {!isDisabled ? (
                                <>
                                  <Eye className="w-3 h-3 text-amber-400" />
                                  <span>Enabled</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-stone-500" />
                                  <span>Hidden</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p);
                            setIsEditProductModalOpen(true);
                          }}
                          className="w-full py-2 px-3 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Product Details</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 7: Sales Summary */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
                }`}
              >
                <span className="text-xs text-stone-500 block mb-1">Today's Revenue</span>
                <span className="text-2xl font-bold font-mono text-amber-500">₹{todaySales}</span>
                <span className="text-[11px] text-stone-400 block mt-1">
                  {todayOrders.length} orders received today
                </span>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
                }`}
              >
                <span className="text-xs text-stone-500 block mb-1">Last 7 Days Revenue</span>
                <span className="text-2xl font-bold font-mono text-amber-400">₹{weekSales}</span>
                <span className="text-[11px] text-stone-400 block mt-1">Weekly sales activity</span>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
                }`}
              >
                <span className="text-xs text-stone-500 block mb-1">Last 30 Days Revenue</span>
                <span className="text-2xl font-bold font-mono text-emerald-500">₹{monthSales}</span>
                <span className="text-[11px] text-stone-400 block mt-1">Monthly sales activity</span>
              </div>
            </div>

            {/* D3 & Recharts Visualizations: Daily Revenue Trends & Most Popular Sweet Items */}
            <OwnerSalesCharts orders={orders} isDark={isDark} />

            {/* Orders Statistics */}
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <h3 className="text-sm font-bold font-serif mb-4">Total Order Status Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60">
                  <span className="text-xs text-stone-500 block">Total Orders</span>
                  <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
                    {orders.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <span className="text-xs block">Delivered Orders</span>
                  <span className="text-xl font-bold font-mono">{deliveredOrders.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <span className="text-xs block">Pending / In Progress</span>
                  <span className="text-xl font-bold font-mono">
                    {pendingOrders.length + activeOrders.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <span className="text-xs block">Cancelled Orders</span>
                  <span className="text-xl font-bold font-mono">{cancelledOrders.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Notification Status */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Telegram Notification System (Primary) */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${
                isDark ? 'bg-[#180E08] border-sky-500/30' : 'bg-white border-sky-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-sky-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-serif flex items-center gap-2">
                      <span>Telegram Order Notification System</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Every customer order automatically sends an instant notification to your Telegram
                    </p>
                  </div>
                </div>

                <a
                  href="https://t.me/r5yyy5z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-md"
                >
                  <span>Open @r5yyy5z</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Notification Details & Actions */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                    <span className="font-semibold text-stone-400 block mb-0.5">Target Telegram Account:</span>
                    <a
                      href="https://t.me/r5yyy5z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>https://t.me/r5yyy5z</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[11px] text-stone-500 block mt-1">Username: @r5yyy5z</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                    <span className="font-semibold text-stone-400 block mb-0.5">Notification Automation:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Instant Alert on Every New Order</span>
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-1">
                      Includes customer name, phone, full item breakdown, address, and timestamp
                    </span>
                  </div>
                </div>

                {/* Test Notification Trigger */}
                <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-stone-200 block">Test Telegram Alert</span>
                    <span className="text-[11px] text-stone-400">
                      Send a sample order notification to verify connection with https://t.me/r5yyy5z
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isTestingTelegram}
                    onClick={handleTestTelegramAlert}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                  >
                    {isTestingTelegram ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isTestingTelegram ? 'Preparing Alert...' : 'Send Test Alert to @r5yyy5z'}</span>
                  </button>
                </div>

                {telegramTestFeedback && (
                  <div className="p-3 rounded-xl bg-stone-900 border border-sky-500/40 text-sky-300 text-xs">
                    {telegramTestFeedback}
                  </div>
                )}

                {/* Recent Telegram Notification History Log */}
                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-stone-300">Recent Telegram Order Dispatches</span>
                    <span className="text-[11px] text-stone-500 font-mono">Target: @r5yyy5z</span>
                  </div>

                  {telegramStatus?.recentNotifications && telegramStatus.recentNotifications.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {telegramStatus.recentNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-amber-400 block truncate">
                              Order #{n.orderId} • {n.customerName} (₹{n.totalAmount})
                            </span>
                            <span className="text-stone-500 block truncate">{n.detail}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="font-mono text-stone-400 text-[10px]">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {n.directUrl && (
                              <a
                                href={n.directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-sky-400 hover:text-sky-300"
                                title="Open in Telegram"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900/40 text-center text-stone-500 text-xs">
                      No orders dispatched during this session yet. Place any order to see real-time Telegram alerts here!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Browser Push & Sound Chime Notifications */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${
                isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <h2 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>Browser Push Notifications & Sound Chime</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">Browser Push Permission</span>
                    <span className="text-stone-500 capitalize">{notificationPermission}</span>
                  </div>
                  {notificationPermission !== 'granted' && (
                    <button
                      onClick={handleEnableNotifications}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold"
                    >
                      Grant Permission
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">Sound Chime on New Orders</span>
                    <span className="text-stone-500">
                      {isSoundMuted ? 'Muted' : 'Active (plays triple bell chime on order arrival)'}
                    </span>
                  </div>
                  <button
                    onClick={() => playOrderAlertSound()}
                    className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-bold"
                  >
                    Test Sound
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60">
                  <span className="font-semibold block mb-1">Registered Device FCM Token:</span>
                  <p className="font-mono text-[10px] break-all text-stone-500">
                    {fcmToken || 'No token generated yet. Click "Grant Permission" above to register.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Settings */}
        {activeTab === 'settings' && (
          <div
            className={`rounded-2xl border p-5 sm:p-6 max-w-2xl mx-auto shadow-sm ${
              isDark ? 'bg-[#180E08] border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <h2 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <span>Delivery & Store Operations Settings</span>
            </h2>

            {settingsSavedSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Settings updated successfully in Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Delivery Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60">
                <div>
                  <span className="font-semibold block">Enable Home Delivery</span>
                  <span className="text-stone-500">
                    Turn off during rush hours or festival closures
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditableSettings({
                      ...editableSettings,
                      deliveryAvailable: !editableSettings.deliveryAvailable
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    editableSettings.deliveryAvailable ? 'bg-amber-500' : 'bg-stone-400'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      editableSettings.deliveryAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Delivery Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">Minimum Order (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editableSettings.minimumOrder}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        minimumOrder: Number(e.target.value)
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editableSettings.deliveryCharge}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        deliveryCharge: Number(e.target.value)
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editableSettings.freeDeliveryAbove}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        freeDeliveryAbove: Number(e.target.value)
                      })
                    }
                    className={`w-full p-2.5 rounded-xl border font-mono ${
                      isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                    }`}
                  />
                </div>
              </div>

              {/* Supported PIN codes */}
              <div>
                <label className="block text-stone-500 mb-1">Supported Postal PIN Codes</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editableSettings.supportedPincodes.map((pin) => (
                    <span
                      key={pin}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono flex items-center gap-1"
                    >
                      <span>{pin}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePincode(pin)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={newPincodeInput}
                    onChange={(e) => setNewPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit PIN..."
                    className={`flex-1 p-2 rounded-xl border font-mono ${
                      isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddPincode}
                    className="px-3 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add PIN</span>
                  </button>
                </div>
              </div>

              {/* Telegram Order Notification Configuration */}
              <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Send className="w-4 h-4" />
                    <span>Telegram Order Notifications</span>
                  </div>
                  <a
                    href="https://t.me/r5yyy5z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>@r5yyy5z</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-stone-500 mb-1">Telegram Account Link</label>
                  <input
                    type="text"
                    value={editableSettings.telegramAccountLink || 'https://t.me/r5yyy5z'}
                    onChange={(e) =>
                      setEditableSettings({
                        ...editableSettings,
                        telegramAccountLink: e.target.value
                      })
                    }
                    placeholder="https://t.me/r5yyy5z"
                    className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Every incoming order will automatically alert this Telegram account.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 mb-1">Telegram Chat / Username</label>
                    <input
                      type="text"
                      value={editableSettings.telegramChatId || 'r5yyy5z'}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          telegramChatId: e.target.value
                        })
                      }
                      placeholder="r5yyy5z"
                      className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                        isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-stone-500 mb-1">Bot Token (Optional for direct push)</label>
                    <input
                      type="password"
                      value={editableSettings.telegramBotToken || ''}
                      onChange={(e) =>
                        setEditableSettings({
                          ...editableSettings,
                          telegramBotToken: e.target.value
                        })
                      }
                      placeholder="Optional Telegram Bot Token"
                      className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                        isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-xs shadow-md hover:shadow-amber-500/20"
              >
                Save Settings to Firestore
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ORDER DETAILS MODAL (/owner/orders/:orderId) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 shadow-2xl relative ${
              isDark
                ? 'bg-[#180E08] border-amber-900/60 text-stone-100'
                : 'bg-white border-stone-200 text-stone-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInvoiceModalOrder(selectedOrder)}
                className="p-1.5 rounded-lg border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                title="View & Print Structured Tax Invoice"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Tax Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Header */}
            <div className="border-b border-amber-500/20 pb-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                Ghosh Sweet House • Order Management
              </span>
              <h2 className="text-xl font-bold font-serif">Order #{selectedOrder.orderId}</h2>
              <div className="mt-1">
                <OrderTimestamp timestamp={selectedOrder.createdAt} mode="detailed" />
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 space-y-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase block">
                  Customer Information
                </span>
                <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {selectedOrder.customerName}
                </p>
                <p className="font-mono">{selectedOrder.phone}</p>
                {selectedOrder.email && <p className="text-stone-500">{selectedOrder.email}</p>}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="py-1 px-2.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center gap-1 border border-amber-500/20"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/91${selectedOrder.phone}?text=${encodeURIComponent(
                      `Hello ${selectedOrder.customerName}, regarding your order #${selectedOrder.orderId} from Ghosh Sweet House...`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center gap-1 border border-emerald-500/20"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900/60 space-y-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase block">
                  Delivery Destination
                </span>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedOrder.deliveryAddress}
                </p>
                {selectedOrder.village && <p className="text-stone-500">Village: {selectedOrder.village}</p>}
                {selectedOrder.area && selectedOrder.area !== selectedOrder.village && (
                  <p className="text-stone-500">Area/Locality: {selectedOrder.area}</p>
                )}
                {selectedOrder.landmark && (
                  <p className="text-stone-500">Landmark: {selectedOrder.landmark}</p>
                )}
                {selectedOrder.pincode && (
                  <p className="font-mono text-stone-500">PIN: {selectedOrder.pincode}</p>
                )}
                <div className="pt-1 text-[11px] font-semibold text-amber-500">
                  Payment: {selectedOrder.paymentMethod.toUpperCase()} (
                  {selectedOrder.paymentStatus || 'pending'})
                </div>
              </div>
            </div>

            {selectedOrder.customerNote && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-bold text-amber-500 block mb-0.5">Customer Order Note:</span>
                <p className="italic">"{selectedOrder.customerNote}"</p>
              </div>
            )}

            {/* Customer Post-Order Feedback */}
            {selectedOrder.feedback && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-500 uppercase text-[10px] flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Customer Post-Order Feedback
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= selectedOrder.feedback!.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-600'
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 font-bold font-mono text-amber-400">
                      ({selectedOrder.feedback.rating}/5)
                    </span>
                  </div>
                </div>

                {selectedOrder.feedback.tags && selectedOrder.feedback.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedOrder.feedback.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedOrder.feedback.comment && (
                  <p className="italic text-stone-200 pt-1">
                    "{selectedOrder.feedback.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Items */}
            <div className="mb-4 text-xs border rounded-xl p-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-500 uppercase text-[10px] block mb-2">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-stone-200 dark:divide-stone-800 space-y-1">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-1.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-stone-900 dark:text-stone-100">
                        {item.productName}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {item.portion} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono font-bold">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-stone-300 dark:border-stone-700 flex justify-between font-mono font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-amber-500">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="space-y-3 pt-2 border-t border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase">
                  Change Status (Current: {selectedOrder.status})
                </span>
                {selectedOrder.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      setCancelModalOrder(selectedOrder);
                    }}
                    className="text-xs text-red-500 hover:underline font-bold"
                  >
                    Cancel Order...
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  disabled={updatingStatusId === selectedOrder.orderId}
                  onClick={() => handleUpdateStatus(selectedOrder, 'ACCEPTED')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedOrder.status === 'ACCEPTED'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10'
                  }`}
                >
                  Accept
                </button>

                <button
                  disabled={updatingStatusId === selectedOrder.orderId}
                  onClick={() => handleUpdateStatus(selectedOrder, 'PREPARING')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedOrder.status === 'PREPARING'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  Preparing
                </button>

                <button
                  disabled={updatingStatusId === selectedOrder.orderId}
                  onClick={() => handleUpdateStatus(selectedOrder, 'READY')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedOrder.status === 'READY'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-purple-500/30 text-purple-500 hover:bg-purple-500/10'
                  }`}
                >
                  Ready
                </button>

                <button
                  disabled={updatingStatusId === selectedOrder.orderId}
                  onClick={() => handleUpdateStatus(selectedOrder, 'OUT_FOR_DELIVERY')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedOrder.status === 'OUT_FOR_DELIVERY'
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
                  }`}
                >
                  Out Delivery
                </button>

                <button
                  disabled={updatingStatusId === selectedOrder.orderId}
                  onClick={() => handleUpdateStatus(selectedOrder, 'DELIVERED')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedOrder.status === 'DELIVERED'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                  }`}
                >
                  Delivered
                </button>
              </div>

              {/* Telegram Notification Direct Action */}
              <div className="pt-2">
                <a
                  href={getDirectTelegramOrderLink(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-sky-500/40 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center gap-2 transition-colors shadow-sm"
                  title="Open notification in Telegram"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Send / Open Notification in Telegram (@r5yyy5z)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setCancelModalOrder(null)}
        >
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-[#180E08] border-red-900/60 text-stone-100' : 'bg-white border-stone-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base">Cancel Order #{cancelModalOrder.orderId}</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Are you sure you want to cancel this order? Please state a reason for the customer:
            </p>

            <textarea
              rows={3}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="e.g. Out of stock item / Store closing early / Outside delivery area..."
              className={`w-full p-2.5 rounded-xl border text-xs mb-4 ${
                isDark
                  ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600'
                  : 'bg-stone-50 border-stone-300 text-stone-900'
              }`}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal (Real-time Firestore) */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={(updated) => {
          showProductFeedback(`Product "${updated.nameEn}" successfully saved to Firestore!`);
        }}
      />

      {/* Structured Tax Invoice Modal */}
      <InvoiceModal
        order={invoiceModalOrder}
        isOpen={!!invoiceModalOrder}
        onClose={() => setInvoiceModalOrder(null)}
        language={language}
        theme={theme}
      />
    </div>
  );
};
