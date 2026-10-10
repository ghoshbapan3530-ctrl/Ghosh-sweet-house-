import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { CustomerAccount } from '../types';

export const CUSTOMERS_COLLECTION = 'customers';

export interface FirestoreCustomerDocument {
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  pinCode?: string;
  createdAt: string;
  updatedAt?: string;
  sweetPoints?: number;
  totalPointsEarned?: number;
  totalPointsRedeemed?: number;
  qualifyingOrdersCount?: number;
}

/**
 * Normalizes a 10-digit mobile number into a clean standard string
 */
export function normalizeCustomerPhone(phone: string): string {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Maps a Firestore customer document into CustomerAccount
 */
export function mapDocToCustomerAccount(uid: string, data: FirestoreCustomerDocument): CustomerAccount {
  const cleanPhone = normalizeCustomerPhone(data.phoneNumber);
  let createdTimestamp = Date.now();
  if (data.createdAt) {
    const parsed = Date.parse(data.createdAt);
    if (!isNaN(parsed)) createdTimestamp = parsed;
  }

  return {
    id: uid,
    auth_user_id: uid,
    name: data.name || 'Ghosh Sweet Customer',
    mobile: cleanPhone,
    email: data.email || '',
    address: data.address || '',
    pinCode: data.pinCode || '',
    sweetPoints: typeof data.sweetPoints === 'number' ? data.sweetPoints : 10,
    totalPointsEarned: typeof data.totalPointsEarned === 'number' ? data.totalPointsEarned : 10,
    totalPointsRedeemed: typeof data.totalPointsRedeemed === 'number' ? data.totalPointsRedeemed : 0,
    qualifyingOrdersCount: typeof data.qualifyingOrdersCount === 'number' ? data.qualifyingOrdersCount : 0,
    createdAt: createdTimestamp
  };
}

/**
 * Retrieve a customer profile by their Firebase UID
 */
export async function getCustomerProfileByUid(uid: string): Promise<CustomerAccount | null> {
  if (!uid) return null;
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return mapDocToCustomerAccount(uid, snap.data() as FirestoreCustomerDocument);
    }
    return null;
  } catch (err) {
    console.warn(`[Firestore Customers] Error fetching profile for UID ${uid}:`, err);
    return null;
  }
}

/**
 * Retrieve a customer profile by their phone number (if existing under an old or different UID)
 */
export async function getCustomerProfileByPhone(phone: string): Promise<{ uid: string; customer: CustomerAccount } | null> {
  const cleanPhone = normalizeCustomerPhone(phone);
  if (!cleanPhone) return null;

  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const q = query(colRef, where('phoneNumber', '==', cleanPhone), limit(1));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return {
        uid: docSnap.id,
        customer: mapDocToCustomerAccount(docSnap.id, docSnap.data() as FirestoreCustomerDocument)
      };
    }
    return null;
  } catch (err) {
    console.warn(`[Firestore Customers] Error finding profile by phone ${cleanPhone}:`, err);
    return null;
  }
}

/**
 * Creates or initializes a new customer profile in Firestore
 * Stored at: /customers/{Firebase UID}
 */
export async function createCustomerProfile(
  uid: string,
  params: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    pinCode?: string;
  }
): Promise<{ success: boolean; customer?: CustomerAccount; error?: string }> {
  if (!uid) {
    return { success: false, error: 'Firebase UID is required to create a customer profile.' };
  }

  const cleanPhone = normalizeCustomerPhone(params.phoneNumber);
  const now = new Date().toISOString();

  // Check if profile already exists for this UID to prevent duplicate overwrites
  const existing = await getCustomerProfileByUid(uid);
  if (existing) {
    console.log(`[Firestore Customers] Profile already exists for UID ${uid}. Not duplicating.`);
    return { success: true, customer: existing };
  }

  const payload: FirestoreCustomerDocument = {
    name: params.name.trim() || 'Ghosh Sweet Customer',
    phoneNumber: cleanPhone,
    email: params.email?.trim() || '',
    address: params.address?.trim() || '',
    pinCode: params.pinCode?.trim() || '',
    createdAt: now,
    updatedAt: now,
    sweetPoints: 10, // 10 sweet points welcome bonus
    totalPointsEarned: 10,
    totalPointsRedeemed: 0,
    qualifyingOrdersCount: 0
  };

  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
    await setDoc(docRef, payload);

    const customer = mapDocToCustomerAccount(uid, payload);
    console.log(`[Firestore Customers] Successfully created profile for UID ${uid}:`, customer);
    return { success: true, customer };
  } catch (err: any) {
    console.error(`[Firestore Customers] Error creating profile for UID ${uid}:`, err);
    return { success: false, error: err.message || 'Failed to save customer profile in Firestore' };
  }
}

/**
 * Updates an existing customer profile in Firestore
 */
export async function updateCustomerProfile(
  uid: string,
  updates: Partial<{
    name: string;
    email: string;
    address: string;
    pinCode: string;
    sweetPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    qualifyingOrdersCount: number;
  }>
): Promise<{ success: boolean; customer?: CustomerAccount; error?: string }> {
  if (!uid) return { success: false, error: 'Missing UID' };

  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
    const cleanUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.email !== undefined) cleanUpdates.email = updates.email.trim();
    if (updates.address !== undefined) cleanUpdates.address = updates.address.trim();
    if (updates.pinCode !== undefined) cleanUpdates.pinCode = updates.pinCode.trim();
    if (updates.sweetPoints !== undefined) cleanUpdates.sweetPoints = updates.sweetPoints;
    if (updates.totalPointsEarned !== undefined) cleanUpdates.totalPointsEarned = updates.totalPointsEarned;
    if (updates.totalPointsRedeemed !== undefined) cleanUpdates.totalPointsRedeemed = updates.totalPointsRedeemed;
    if (updates.qualifyingOrdersCount !== undefined) cleanUpdates.qualifyingOrdersCount = updates.qualifyingOrdersCount;

    await updateDoc(docRef, cleanUpdates);

    const updated = await getCustomerProfileByUid(uid);
    return { success: true, customer: updated || undefined };
  } catch (err: any) {
    console.error(`[Firestore Customers] Error updating profile for UID ${uid}:`, err);
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

/**
 * Subscribes to real-time updates for a customer's profile
 */
export function subscribeToCustomerProfile(
  uid: string,
  onUpdate: (customer: CustomerAccount | null) => void
): Unsubscribe {
  const docRef = doc(db, CUSTOMERS_COLLECTION, uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(mapDocToCustomerAccount(uid, snap.data() as FirestoreCustomerDocument));
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`[Firestore Customers] Error in real-time profile listener for ${uid}:`, err);
    }
  );
}
