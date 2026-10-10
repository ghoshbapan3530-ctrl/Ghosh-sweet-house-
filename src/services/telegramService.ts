import { DEFAULT_TELEGRAM_ACCOUNT_LINK, DEFAULT_TELEGRAM_USERNAME, TelegramOrderPayload } from '../server/telegramNotificationPlugin';
import { FirebaseOrder } from '../lib/firestore-orders';

export interface TelegramNotificationResult {
  success: boolean;
  method?: 'bot_api' | 'direct_link';
  message?: string;
  directUrl?: string;
  error?: string;
}

export interface TelegramServerStatus {
  accountLink: string;
  username: string;
  hasBotToken: boolean;
  totalNotificationsSent: number;
  recentNotifications: Array<{
    id: string;
    orderId: string;
    timestamp: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    status: 'sent' | 'fallback_ready' | 'failed';
    method: 'bot_api' | 'direct_link';
    detail: string;
    directUrl?: string;
  }>;
}

/**
 * Format any FirebaseOrder into TelegramOrderPayload
 */
export function mapFirebaseOrderToTelegramPayload(order: FirebaseOrder | any): TelegramOrderPayload {
  return {
    orderId: order.orderId || order.id || 'N/A',
    customerName: order.customerName || order.customer?.name || 'Customer',
    phone: order.phone || order.customerPhone || 'N/A',
    items: (order.items || []).map((it: any) => ({
      productName: it.productName || it.product?.nameEn || 'Item',
      productNameBn: it.productNameBn || it.product?.nameBn || '',
      portion: it.portion || it.selectedPortion || '',
      quantity: it.quantity || 1,
      price: it.price || 0,
      subtotal: it.subtotal || (it.price ? it.price * (it.quantity || 1) : 0)
    })),
    subtotal: order.subtotal || 0,
    deliveryCharge: order.deliveryCharge || 0,
    discountAmount: order.discountAmount || 0,
    totalAmount: order.totalAmount || order.finalTotal || 0,
    paymentMethod: order.paymentMethod || 'Cash on Delivery',
    orderType: order.orderType || 'delivery',
    deliveryAddress: order.deliveryAddress || '',
    village: order.village || '',
    area: order.area || '',
    pincode: order.pincode || '',
    landmark: order.landmark || '',
    customerNote: order.customerNote || order.specialNote || '',
    createdAt: order.createdAt || new Date().toISOString()
  };
}

/**
 * Generates a direct 1-click URL to open Telegram with pre-filled order text
 */
export function getDirectTelegramOrderLink(order: FirebaseOrder | any): string {
  const payload = mapFirebaseOrderToTelegramPayload(order);
  const itemsText = (payload.items || []).map((it, i) => `${i + 1}. ${it.productName} (${it.portion}) x${it.quantity}`).join('\n');
  const text = `🔔 NEW ORDER #${payload.orderId} - Ghosh Sweet House\n` +
    `👤 Customer: ${payload.customerName}\n` +
    `📱 Phone: ${payload.phone}\n` +
    `💰 Total: ₹${payload.totalAmount} (${payload.paymentMethod})\n` +
    `🚚 Type: ${payload.orderType === 'delivery' ? 'Home Delivery' : 'Takeaway'}\n` +
    `📍 Address: ${payload.deliveryAddress || 'Kaliachak'}\n` +
    `📦 Items:\n${itemsText}\n` +
    `🕒 Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
    `👉 Link: ${DEFAULT_TELEGRAM_ACCOUNT_LINK}`;

  return `${DEFAULT_TELEGRAM_ACCOUNT_LINK}?text=${encodeURIComponent(text)}`;
}

/**
 * Sends order notification to Telegram via server proxy
 */
export async function sendTelegramOrderNotification(
  order: FirebaseOrder | any,
  botToken?: string,
  chatId?: string
): Promise<TelegramNotificationResult> {
  const payload = mapFirebaseOrderToTelegramPayload(order);
  try {
    const res = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: payload,
        botToken,
        chatId: chatId || DEFAULT_TELEGRAM_USERNAME
      })
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('[telegramService] Server call failed, using direct URL fallback:', err);
    return {
      success: true,
      method: 'direct_link',
      directUrl: getDirectTelegramOrderLink(order),
      message: `Telegram alert prepared for ${DEFAULT_TELEGRAM_ACCOUNT_LINK}`
    };
  }
}

/**
 * Gets Telegram server status and audit logs
 */
export async function getTelegramStatus(): Promise<TelegramServerStatus | null> {
  try {
    const res = await fetch('/api/telegram/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Dispatches test notification
 */
export async function sendTelegramTestAlert(botToken?: string, chatId?: string): Promise<TelegramNotificationResult> {
  try {
    const res = await fetch('/api/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken, chatId })
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to dispatch test notification'
    };
  }
}
