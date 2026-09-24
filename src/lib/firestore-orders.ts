import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export type FirebaseOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface FirebaseOrderItem {
  productId: string;
  productName: string;
  productNameBn: string;
  portion: string;
  portionBn?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface FirebaseOrder {
  id: string; // document id
  orderId: string; // GH202609240001
  customerId: string;
  customerName: string;
  phone: string;
  email?: string;
  items: FirebaseOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: FirebaseOrderStatus;
  orderType: 'delivery' | 'takeaway';
  deliveryAddress: string;
  village?: string;
  area?: string;
  pincode?: string;
  landmark?: string;
  customerNote?: string;
  ownerNote?: string;
  estimatedMinutes?: number;
  cancelReason?: string;
  notificationSent?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  acceptedAt?: string | null;
  preparedAt?: string | null;
  readyAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
}

export interface OwnerSettings {
  deliveryAvailable: boolean;
  minimumOrder: number;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  supportedPincodes: string[];
  ownerFcmTokens?: string[];
  shopPhone?: string;
  shopWhatsapp?: string;
  updatedAt?: string;
}

export const DEFAULT_OWNER_SETTINGS: OwnerSettings = {
  deliveryAvailable: true,
  minimumOrder: 100,
  deliveryCharge: 30,
  freeDeliveryAbove: 500,
  supportedPincodes: ['732201', '732206', '732207', '732208', '732205', '732209'],
  shopPhone: '9733363562',
  shopWhatsapp: '919733363562'
};

/**
 * Generates a safe, non-colliding order ID matching the pattern GH202609240001
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Unique 4-digit sequence combining milliseconds and secure random counter
  const timeSlice = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % 10000;
  const randSlice = Math.floor(Math.random() * 900) + 100;
  const seq = String((timeSlice + randSlice) % 10000).padStart(4, '0');

  return `GH${dateStr}${seq}`;
}

/**
 * Deeply strips any keys with undefined values because Firestore rejects undefined
 */
export function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefined(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = removeUndefined(value);
    }
  }
  return clean as T;
}

/**
 * Default structure of an order document in Cloud Firestore.
 * Used for comparing incoming checkout payloads, detecting undefined/missing fields,
 * and ensuring mandatory fields are strictly typed and populated.
 */
export const DEFAULT_ORDER_STRUCTURE = {
  orderId: '',
  customerId: '',
  customerName: '',
  phone: '',
  email: '',
  items: [] as FirebaseOrderItem[],
  subtotal: 0,
  deliveryCharge: 0,
  discountAmount: 0,
  totalAmount: 0,
  paymentMethod: 'cod' as 'cod' | 'online',
  paymentStatus: 'pending' as 'pending' | 'paid' | 'failed',
  status: 'PENDING' as FirebaseOrderStatus,
  orderType: 'delivery' as 'delivery' | 'takeaway',
  deliveryAddress: '',
  village: '',
  area: '',
  pincode: '',
  landmark: '',
  customerNote: '',
  ownerNote: '',
  estimatedMinutes: 0,
  cancelReason: '',
  notificationSent: false
} as const;

export type OrderStructureKey = keyof typeof DEFAULT_ORDER_STRUCTURE;

export interface MappedOrderValidationResult {
  mappedOrder: Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'> & {
    village: string;
    area: string;
    pincode: string;
    landmark: string;
    customerNote: string;
    ownerNote: string;
    email: string;
    discountAmount: number;
    estimatedMinutes: number;
    cancelReason: string;
    notificationSent: boolean;
  };
  valid: boolean;
  errors: string[];
  missingFields: string[];
  undefinedFields: string[];
}

/**
 * Utility function in the checkout logic to map and validate all mandatory
 * Firestore order fields (including village, area, pincode, deliveryAddress, etc.)
 * against the default object structure before attempting to save to Firestore.
 *
 * Adds explicit console logs for any undefined or missing fields to thoroughly
 * diagnose and prevent the Firestore 'Unsupported field value: undefined' error.
 */
export function mapAndValidateFirestoreOrder(
  rawInput: Record<string, any> | Partial<FirebaseOrder> | null | undefined
): MappedOrderValidationResult {
  const input = rawInput || {};
  const undefinedFields: string[] = [];
  const missingFields: string[] = [];
  const validationErrors: string[] = [];

  console.groupCollapsed('[Firestore Checkout Utility] Inspecting Order Payload against Default Structure');
  console.log('[Firestore Checkout Utility] Raw input received:', input);

  // 1. Audit every field in DEFAULT_ORDER_STRUCTURE for 'undefined' or missing
  (Object.keys(DEFAULT_ORDER_STRUCTURE) as OrderStructureKey[]).forEach((key) => {
    const val = input[key];
    if (val === undefined) {
      undefinedFields.push(key);
      console.warn(
        `[Firestore Order Debug] ⚠️ Undefined field detected: "${key}". Defaulting to:`,
        DEFAULT_ORDER_STRUCTURE[key]
      );
    } else if (val === null || val === '') {
      missingFields.push(key);
      console.log(
        `[Firestore Order Debug] ℹ️ Empty/null field: "${key}" (value: ${JSON.stringify(val)})`
      );
    }
  });

  if (undefinedFields.length > 0) {
    console.warn(
      `[Firestore Order Debug] Total ${undefinedFields.length} field(s) were undefined: [${undefinedFields.join(', ')}]. Safe defaults applied.`
    );
  } else {
    console.log('[Firestore Order Debug] ✅ No undefined fields found in raw payload.');
  }

  // 2. Safe mapping against defaults
  const orderId =
    typeof input.orderId === 'string' && input.orderId.trim()
      ? input.orderId.trim()
      : generateOrderId();

  const phone =
    typeof input.phone === 'string'
      ? input.phone.replace(/[^0-9]/g, '').trim()
      : '';

  const customerName =
    typeof input.customerName === 'string'
      ? input.customerName.trim()
      : '';

  const customerId =
    typeof input.customerId === 'string' && input.customerId.trim()
      ? input.customerId.trim()
      : phone
      ? `guest_${phone}`
      : 'guest';

  const email =
    typeof input.email === 'string'
      ? input.email.trim()
      : '';

  // Location fields: village, area, pincode, landmark, deliveryAddress
  const rawVillage = typeof input.village === 'string' ? input.village.trim() : '';
  const rawArea = typeof input.area === 'string' ? input.area.trim() : '';

  // Bi-directional fallback to ensure neither village nor area is blank if the other is provided
  const village = rawVillage || rawArea || '';
  const area = rawArea || rawVillage || '';

  if (!rawVillage && rawArea) {
    console.log(`[Firestore Order Debug] Auto-populating missing "village" from "area": "${rawArea}"`);
  }
  if (!rawArea && rawVillage) {
    console.log(`[Firestore Order Debug] Auto-populating missing "area" from "village": "${rawVillage}"`);
  }
  if (!village && !area) {
    console.log('[Firestore Order Debug] Notice: Both "village" and "area" are currently blank.');
  }

  const pincode =
    typeof input.pincode === 'string'
      ? input.pincode.replace(/[^0-9]/g, '').slice(0, 6)
      : '';

  const landmark =
    typeof input.landmark === 'string'
      ? input.landmark.trim()
      : '';

  const orderType: 'delivery' | 'takeaway' =
    input.orderType === 'takeaway' ? 'takeaway' : 'delivery';

  let deliveryAddress =
    typeof input.deliveryAddress === 'string'
      ? input.deliveryAddress.trim()
      : '';

  if (orderType === 'takeaway' && !deliveryAddress) {
    deliveryAddress = 'Pickup from Ghosh Sweet House Store';
  } else if (!deliveryAddress) {
    deliveryAddress = 'Direct Delivery (Contact on mobile)';
  }

  const customerNote =
    typeof input.customerNote === 'string'
      ? input.customerNote.trim()
      : '';

  const ownerNote =
    typeof input.ownerNote === 'string'
      ? input.ownerNote.trim()
      : '';

  const cancelReason =
    typeof input.cancelReason === 'string'
      ? input.cancelReason.trim()
      : '';

  const notificationSent = Boolean(input.notificationSent);

  const subtotal =
    typeof input.subtotal === 'number' && !isNaN(input.subtotal) && input.subtotal >= 0
      ? Number(input.subtotal.toFixed(2))
      : 0;

  const deliveryCharge =
    typeof input.deliveryCharge === 'number' && !isNaN(input.deliveryCharge) && input.deliveryCharge >= 0
      ? Number(input.deliveryCharge.toFixed(2))
      : 0;

  const discountAmount =
    typeof input.discountAmount === 'number' && !isNaN(input.discountAmount) && input.discountAmount >= 0
      ? Number(input.discountAmount.toFixed(2))
      : 0;

  const totalAmount =
    typeof input.totalAmount === 'number' && !isNaN(input.totalAmount) && input.totalAmount > 0
      ? Number(input.totalAmount.toFixed(2))
      : Number((subtotal - discountAmount + deliveryCharge).toFixed(2));

  const paymentMethod: 'cod' | 'online' =
    input.paymentMethod === 'online' ? 'online' : 'cod';

  const paymentStatus: 'pending' | 'paid' | 'failed' =
    ['paid', 'failed'].includes(input.paymentStatus) ? input.paymentStatus : 'pending';

  const status: FirebaseOrderStatus = input.status || 'PENDING';

  const estimatedMinutes =
    typeof input.estimatedMinutes === 'number' && !isNaN(input.estimatedMinutes)
      ? input.estimatedMinutes
      : 0;

  // Sanitize and map items
  const rawItems = Array.isArray(input.items) ? input.items : [];
  const mappedItems: FirebaseOrderItem[] = rawItems.map((item: any, idx: number) => {
    if (!item || typeof item !== 'object') {
      console.warn(`[Firestore Order Debug] items[${idx}] was not an object, replacing with safe item`);
      return {
        productId: `item_${idx}`,
        productName: 'Sweet Item',
        productNameBn: 'মিষ্টি পণ্য',
        portion: '1 pc',
        portionBn: '১ পিস',
        price: 0,
        quantity: 1,
        subtotal: 0
      };
    }

    const pId = typeof item.productId === 'string' ? item.productId : `prod_${idx}`;
    const pName = typeof item.productName === 'string' ? item.productName : 'Sweet Item';
    const pNameBn = typeof item.productNameBn === 'string' ? item.productNameBn : pName;
    const portion = typeof item.portion === 'string' ? item.portion : '1 pc';
    const portionBn = typeof item.portionBn === 'string' ? item.portionBn : portion;
    const price = typeof item.price === 'number' && !isNaN(item.price) && item.price >= 0 ? item.price : 0;
    const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    const itemSubtotal = typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : price * quantity;

    ['productId', 'productName', 'portion', 'price', 'quantity'].forEach((itemKey) => {
      if (item[itemKey] === undefined) {
        console.warn(`[Firestore Order Debug] items[${idx}].${itemKey} was undefined! Fallback assigned.`);
      }
    });

    return {
      productId: pId,
      productName: pName,
      productNameBn: pNameBn,
      portion,
      portionBn,
      price,
      quantity,
      subtotal: itemSubtotal
    };
  });

  // 3. Mandatory field validations
  if (!orderId || !/^GH[0-9]{12}$/.test(orderId)) {
    validationErrors.push(`Mandatory field "orderId" must match pattern ^GH[0-9]{12}$ (got: "${orderId}")`);
  }
  if (!customerName || customerName.length < 2) {
    validationErrors.push('Mandatory field "customerName" must be at least 2 characters');
  }
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    validationErrors.push(`Mandatory field "phone" must be exactly 10 digits (got: "${phone}")`);
  }
  if (mappedItems.length === 0) {
    validationErrors.push('Mandatory field "items" cannot be empty');
  }
  if (totalAmount <= 0) {
    validationErrors.push(`Mandatory field "totalAmount" must be greater than 0 (got: ${totalAmount})`);
  }
  if (!deliveryAddress) {
    deliveryAddress = orderType === 'takeaway'
      ? 'Pickup from Ghosh Sweet House Store'
      : 'Direct Delivery (Contact on mobile)';
  }

  const mappedOrder = {
    orderId,
    customerId,
    customerName,
    phone,
    email,
    items: mappedItems,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    paymentMethod,
    paymentStatus,
    status,
    orderType,
    deliveryAddress,
    village,
    area,
    pincode,
    landmark,
    customerNote,
    ownerNote,
    estimatedMinutes,
    cancelReason,
    notificationSent
  };

  const valid = validationErrors.length === 0;

  console.log('[Firestore Checkout Utility] Final validation summary:', {
    valid,
    errorsCount: validationErrors.length,
    errors: validationErrors,
    undefinedFieldsCount: undefinedFields.length,
    undefinedFields,
    missingFields,
    mappedOrder
  });
  console.groupEnd();

  return {
    mappedOrder,
    valid,
    errors: validationErrors,
    missingFields,
    undefinedFields
  };
}

/**
 * Mandatory schema fields validation for new orders.
 * Checks against the Firestore schema definition in firebase-blueprint.json & firestore.rules
 */
export function validateOrderPayload(
  order: Partial<Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>>
): { valid: boolean; errors: string[] } {
  const result = mapAndValidateFirestoreOrder(order);
  return {
    valid: result.valid,
    errors: result.errors
  };
}

/**
 * Creates an order in Firestore
 */
export async function createFirestoreOrder(
  order: Partial<Omit<FirebaseOrder, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<FirebaseOrder> {
  // Map and validate all fields against default object structure
  const { mappedOrder, valid, errors, undefinedFields } = mapAndValidateFirestoreOrder(order);

  if (!valid) {
    console.error('[createFirestoreOrder] Order payload failed validation:', errors);
    throw new Error(`Order validation failed: ${errors.join('; ')}`);
  }

  if (undefinedFields.length > 0) {
    console.warn(
      `[createFirestoreOrder] Protected against undefined fields: [${undefinedFields.join(', ')}] were safely mapped to defaults.`
    );
  }

  const now = new Date().toISOString();

  const finalOrder: FirebaseOrder = removeUndefined({
    ...mappedOrder,
    id: mappedOrder.orderId,
    createdAt: now,
    updatedAt: now
  });

  const orderDocRef = doc(db, 'orders', finalOrder.orderId);
  await setDoc(orderDocRef, finalOrder);

  console.log(`[createFirestoreOrder] Successfully created order ${finalOrder.orderId} in Firestore:`, finalOrder);

  // Also record customer contact in customers collection
  if (finalOrder.phone) {
    try {
      const custRef = doc(db, 'customers', finalOrder.customerId || finalOrder.phone);
      const customerPayload = removeUndefined({
        customerId: finalOrder.customerId || finalOrder.phone,
        name: finalOrder.customerName,
        phone: finalOrder.phone,
        email: finalOrder.email,
        lastDeliveryAddress: finalOrder.deliveryAddress,
        lastVillage: finalOrder.village,
        lastArea: finalOrder.area,
        lastPincode: finalOrder.pincode,
        updatedAt: now
      });
      await setDoc(custRef, customerPayload, { merge: true });
    } catch (err) {
      console.warn('Could not save customer profile in Firestore:', err);
    }
  }

  return finalOrder;
}

/**
 * Real-time listener for a single order (Customer Live Tracking)
 */
export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: FirebaseOrder | null) => void,
  onError?: (err: Error) => void
): () => void {
  const orderDocRef = doc(db, 'orders', orderId);

  return onSnapshot(
    orderDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ ...(snap.data() as FirebaseOrder), id: snap.id });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error(`[Firestore] Error subscribing to order ${orderId}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for all orders (Owner Dashboard)
 */
export function subscribeToAllOrders(
  onUpdate: (orders: FirebaseOrder[]) => void,
  onError?: (err: Error) => void
): () => void {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ ...(d.data() as FirebaseOrder), id: d.id }));
      onUpdate(orders);
    },
    (err) => {
      console.error('[Firestore] Error subscribing to all orders:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Real-time listener for customer's previous orders
 */
export function subscribeToCustomerOrders(
  customerIdOrPhone: string,
  onUpdate: (orders: FirebaseOrder[]) => void
): () => void {
  const ordersCol = collection(db, 'orders');
  // Query by customerId or phone
  const q = query(
    ordersCol,
    where('phone', '==', customerIdOrPhone),
    orderBy('createdAt', 'desc'),
    limit(30)
  );

  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map((d) => ({ ...(d.data() as FirebaseOrder), id: d.id }));
      onUpdate(orders);
    },
    (err) => {
      console.warn('[Firestore] Error subscribing to customer orders, trying fallback:', err);
      // Fallback query if composite index is pending
      const fallbackQuery = query(ordersCol, where('phone', '==', customerIdOrPhone));
      onSnapshot(fallbackQuery, (snap2) => {
        const list = snap2.docs.map((d) => ({ ...(d.data() as FirebaseOrder), id: d.id }));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(list);
      });
    }
  );
}

/**
 * Updates order status and timestamps
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: FirebaseOrderStatus,
  extra?: {
    ownerNote?: string;
    cancelReason?: string;
    estimatedMinutes?: number;
    paymentStatus?: 'pending' | 'paid' | 'failed';
  }
): Promise<void> {
  const now = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
    ...extra
  };

  if (newStatus === 'ACCEPTED') updatePayload.acceptedAt = now;
  if (newStatus === 'PREPARING') updatePayload.preparedAt = now;
  if (newStatus === 'READY') updatePayload.readyAt = now;
  if (newStatus === 'OUT_FOR_DELIVERY') updatePayload.outForDeliveryAt = now;
  if (newStatus === 'DELIVERED') updatePayload.deliveredAt = now;
  if (newStatus === 'CANCELLED') updatePayload.cancelledAt = now;

  const cleanPayload = removeUndefined(updatePayload);
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, cleanPayload);
}

/**
 * Real-time listener for Owner Settings
 */
export function subscribeToOwnerSettings(
  onUpdate: (settings: OwnerSettings) => void
): () => void {
  const settingsDocRef = doc(db, 'owner_settings', 'config');

  return onSnapshot(
    settingsDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ ...DEFAULT_OWNER_SETTINGS, ...(snap.data() as OwnerSettings) });
      } else {
        onUpdate(DEFAULT_OWNER_SETTINGS);
      }
    },
    (err) => {
      console.warn('[Firestore] Owner settings read fallback:', err);
      onUpdate(DEFAULT_OWNER_SETTINGS);
    }
  );
}

/**
 * Updates Owner Settings in Firestore
 */
export async function saveOwnerSettings(settings: Partial<OwnerSettings>): Promise<void> {
  const settingsDocRef = doc(db, 'owner_settings', 'config');
  const cleanSettings = removeUndefined({
    ...settings,
    updatedAt: new Date().toISOString()
  });
  await setDoc(settingsDocRef, cleanSettings, { merge: true });
}

/**
 * Web Audio API synthesizer for clean notification chimes when new orders arrive
 */
export function playOrderAlertSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 melody
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.36);
    });
  } catch (e) {
    // Autoplay policy or unsupported audio
  }
}
