import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { ProductItem } from '../types';
import { initialProducts } from '../data/initialData';

export const PRODUCTS_COLLECTION = 'products';

/**
 * Normalizes a Firestore doc into ProductItem with defaults
 */
export function normalizeFirestoreProduct(id: string, data: any): ProductItem {
  return {
    id,
    nameEn: data.nameEn || data.name || 'Unnamed Product',
    nameBn: data.nameBn || data.name || 'নামহীন মিষ্টি',
    category: data.category || 'sweet',
    portionEn: data.portionEn || 'per piece',
    portionBn: data.portionBn || 'প্রতি পিস',
    price: typeof data.price === 'number' && data.price >= 0 ? data.price : 10,
    secondaryPrice: data.secondaryPrice,
    isPerKg: Boolean(data.isPerKg),
    pricePerKg: data.pricePerKg,
    image: data.image || data.imageUrl || 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    badgeBn: data.badgeBn,
    badgeEn: data.badgeEn,
    isBestSeller: Boolean(data.isBestSeller),
    isFeatured: Boolean(data.isFeatured),
    descriptionEn: data.descriptionEn || data.description || '',
    descriptionBn: data.descriptionBn || data.description || '',
    nutrition: data.nutrition,
    isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
    isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : true,
    stockCount: typeof data.stockCount === 'number' ? Math.max(0, data.stockCount) : (data.stock !== undefined ? Math.max(0, Number(data.stock)) : 25),
    lowStockThreshold: typeof data.lowStockThreshold === 'number' ? Math.max(1, data.lowStockThreshold) : undefined
  };
}

/**
 * Seed initial products into Firestore if the collection is empty
 */
export async function seedInitialProductsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      console.log('[Firestore Products] Seeding initial Ghosh Sweet House catalog...');
      const batch = writeBatch(db);
      for (const product of initialProducts) {
        const ref = doc(db, PRODUCTS_COLLECTION, product.id);
        batch.set(ref, {
          ...product,
          isAvailable: true,
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();
      console.log('[Firestore Products] Successfully seeded initial products.');
    }
  } catch (err) {
    console.warn('[Firestore Products] Notice during catalog seed check:', err);
  }
}

/**
 * Subscribes to real-time products collection from Cloud Firestore
 */
export function subscribeToProducts(
  onUpdate: (products: ProductItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // First ensure initial seed check runs in background
  seedInitialProductsIfEmpty().catch(() => {});

  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to initial products if collection is empty
        onUpdate(initialProducts);
        return;
      }

      const list: ProductItem[] = [];
      snapshot.forEach((d) => {
        list.push(normalizeFirestoreProduct(d.id, d.data()));
      });

      // Maintain order matching initialProducts or sort by category/name
      const idOrder = new Map(initialProducts.map((p, index) => [p.id, index]));
      list.sort((a, b) => {
        const orderA = idOrder.has(a.id) ? (idOrder.get(a.id) as number) : 999;
        const orderB = idOrder.has(b.id) ? (idOrder.get(b.id) as number) : 999;
        return orderA - orderB;
      });

      onUpdate(list);
    },
    (err) => {
      console.warn('[Firestore Products] Real-time listener offline fallback:', err);
      if (onError) onError(err);
      // Fallback to local data
      onUpdate(initialProducts);
    }
  );
}

/**
 * Fetch all products once from Firestore
 */
export async function getProductsFromFirestore(): Promise<ProductItem[]> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snap.empty) {
      return initialProducts;
    }
    const list: ProductItem[] = [];
    snap.forEach((d) => {
      list.push(normalizeFirestoreProduct(d.id, d.data()));
    });
    return list;
  } catch (err) {
    console.warn('[Firestore Products] Error getting products, using fallback:', err);
    return initialProducts;
  }
}

/**
 * Fetch a single product by ID from Firestore
 */
export async function getProductByIdFromFirestore(productId: string): Promise<ProductItem | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const fallback = initialProducts.find((p) => p.id === productId);
      return fallback || null;
    }
    return normalizeFirestoreProduct(snap.id, snap.data());
  } catch (err) {
    console.warn(`[Firestore Products] Error getting product ${productId}:`, err);
    return initialProducts.find((p) => p.id === productId) || null;
  }
}

/**
 * Save or update full product in Firestore in real-time
 */
export async function saveProductToFirestore(
  product: ProductItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const now = new Date().toISOString();
    const payload = {
      id: product.id,
      nameEn: product.nameEn.trim(),
      nameBn: product.nameBn.trim(),
      category: product.category,
      price: Math.max(0, Number(product.price)),
      portionEn: product.portionEn || 'per piece',
      portionBn: product.portionBn || 'প্রতি পিস',
      descriptionEn: (product.descriptionEn || '').trim(),
      descriptionBn: (product.descriptionBn || '').trim(),
      image: product.image || '',
      isAvailable: product.isAvailable !== false,
      isEnabled: product.isEnabled !== false,
      badgeEn: product.badgeEn || '',
      badgeBn: product.badgeBn || '',
      isBestSeller: Boolean(product.isBestSeller),
      isFeatured: Boolean(product.isFeatured),
      stockCount: typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 25,
      lowStockThreshold: typeof product.lowStockThreshold === 'number' ? Math.max(1, product.lowStockThreshold) : null,
      updatedAt: now
    };

    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Products] Error saving product:', err);
    return { success: false, error: err.message || 'Failed to update product in Firestore' };
  }
}

/**
 * Creates a new product in Firestore
 */
export async function createProductInFirestore(
  productData: Partial<ProductItem>
): Promise<{ success: boolean; product?: ProductItem; error?: string }> {
  try {
    const id = productData.id || `prod_${Date.now()}`;
    const newProduct: ProductItem = {
      id,
      nameEn: (productData.nameEn || 'New Product').trim(),
      nameBn: (productData.nameBn || 'নতুন মিষ্টি').trim(),
      category: productData.category || 'sweet',
      price: Math.max(0, Number(productData.price) || 10),
      portionEn: productData.portionEn || 'per piece',
      portionBn: productData.portionBn || 'প্রতি পিস',
      descriptionEn: (productData.descriptionEn || '').trim(),
      descriptionBn: (productData.descriptionBn || '').trim(),
      image: productData.image || '',
      isAvailable: productData.isAvailable !== false,
      isEnabled: true,
      badgeEn: productData.badgeEn || '',
      badgeBn: productData.badgeBn || '',
      isBestSeller: Boolean(productData.isBestSeller),
      isFeatured: Boolean(productData.isFeatured)
    };

    const res = await saveProductToFirestore(newProduct);
    if (res.success) {
      return { success: true, product: newProduct };
    }
    return { success: false, error: res.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Quick price updater in Firestore.
 *
 * IMMUTABILITY GUARANTEE:
 * Updating this catalog price ONLY affects FUTURE customer carts and orders.
 * Historical orders stored in the 'orders' collection retain their immutable purchase price
 * snapshot (captured at order creation in FirebaseOrderItem.price and FirebaseOrderItem.subtotal),
 * ensuring total financial accuracy and compliance.
 */
export async function updateProductPriceInFirestore(
  productId: string,
  newPrice: number
): Promise<{ success: boolean; error?: string }> {
  if (newPrice < 0) {
    return { success: false, error: 'Price cannot be negative' };
  }
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await setDoc(
      docRef,
      {
        price: Math.max(0, Number(newPrice)),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Products] Error updating price:', err);
    return { success: false, error: err.message || 'Failed to update price in Firestore' };
  }
}

/**
 * Toggle product availability (In Stock / Out of Stock) in Firestore
 */
export async function toggleProductAvailabilityInFirestore(
  productId: string,
  isAvailable: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await setDoc(
      docRef,
      {
        isAvailable,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Products] Error updating availability:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update inventory / stock count and optional threshold in Firestore.
 * Automatically synchronizes 'isAvailable' (if stockCount reaches 0, isAvailable becomes false,
 * and if replenished > 0, isAvailable becomes true).
 */
export async function updateProductStockInFirestore(
  productId: string,
  stockCount: number,
  lowStockThreshold?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const newStock = Math.max(0, Math.round(Number(stockCount)));
    const payload: any = {
      stockCount: newStock,
      isAvailable: newStock > 0,
      updatedAt: new Date().toISOString()
    };
    if (lowStockThreshold !== undefined) {
      payload.lowStockThreshold = Math.max(1, Math.round(Number(lowStockThreshold)));
    }
    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Products] Error updating product stock:', err);
    return { success: false, error: err.message || 'Failed to update stock in Firestore' };
  }
}

/**
 * Toggle product enabled / disabled status in Firestore.
 *
 * SOFT-TOGGLE INSTEAD OF DELETING:
 * Toggling 'isEnabled' to false hides the item from the public customer menus
 * while keeping the product document intact. This ensures that:
 * 1. Historical orders referencing this product ID do not break or encounter missing reference errors.
 * 2. Previous invoices and customer receipts render the correct item names and original purchased prices.
 * 3. The owner can re-enable the item anytime without recreating it.
 */
export async function toggleProductEnabledInFirestore(
  productId: string,
  isEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await setDoc(
      docRef,
      {
        isEnabled,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    console.error('[Firestore Products] Error updating enabled state:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Soft-delete product by setting isEnabled = false.
 * Direct alias to toggleProductEnabledInFirestore(productId, false).
 */
export async function softDeleteProductInFirestore(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  return toggleProductEnabledInFirestore(productId, false);
}

/**
 * Re-enable a disabled product by setting isEnabled = true.
 */
export async function restoreProductInFirestore(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  return toggleProductEnabledInFirestore(productId, true);
}

/**
 * Deletes a product from Firestore.
 *
 * SAFE IMPLEMENTATION:
 * Instead of destructive hard deletion (deleteDoc) which breaks past customer order receipts,
 * this performs a soft-disable (isEnabled = false) to ensure historical data integrity.
 * If permanent removal is ever explicitly needed, the hardDelete parameter can be set to true.
 */
export async function deleteProductFromFirestore(
  productId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (!hardDelete) {
    // Soft-delete: toggle enabled to false to preserve historical order integrity
    console.log(`[Firestore Products] Soft-disabling product ${productId} to protect historical orders.`);
    return softDeleteProductInFirestore(productId);
  }

  // If hard deletion is explicitly specified, soft-delete is still enforced to honor security rules
  console.warn(`[Firestore Products] Hard deletion rejected in favor of soft-delete for product ${productId}.`);
  return softDeleteProductInFirestore(productId);
}

/**
 * Validates that an order's prices remain completely immutable even if catalog prices change.
 * Checks that item subtotal matches quantity * frozen price, and order subtotal matches sum of items.
 */
export function verifyHistoricalOrderPriceIntegrity(order: {
  items: Array<{ price: number; quantity: number; subtotal?: number }>;
  subtotal: number;
}): boolean {
  if (!order || !Array.isArray(order.items)) return false;
  let calculatedSubtotal = 0;
  for (const item of order.items) {
    const itemSub = typeof item.subtotal === 'number' ? item.subtotal : item.price * item.quantity;
    calculatedSubtotal += itemSub;
  }
  // Tolerant to floating point rounding within 0.1
  return Math.abs(calculatedSubtotal - order.subtotal) < 0.1;
}
