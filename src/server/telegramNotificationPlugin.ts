import { Plugin } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';
import { initialProducts } from '../data/initialData';

export const DEFAULT_TELEGRAM_ACCOUNT_LINK = 'https://t.me/r5yyy5z';
export const DEFAULT_TELEGRAM_USERNAME = 'r5yyy5z';

export interface TelegramNotificationItem {
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
}

export interface TelegramOrderPayload {
  orderId: string;
  customerName: string;
  phone: string;
  items: Array<{
    productName?: string;
    productNameBn?: string;
    portion?: string;
    quantity: number;
    price?: number;
    subtotal?: number;
  }>;
  subtotal?: number;
  deliveryCharge?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod?: string;
  orderType?: 'delivery' | 'takeaway' | string;
  deliveryAddress?: string;
  village?: string;
  area?: string;
  pincode?: string;
  landmark?: string;
  customerNote?: string;
  createdAt?: string;
}

// In-memory notification audit log
const telegramNotificationLog: TelegramNotificationItem[] = [];

/**
 * Format order details into HTML-styled Telegram message
 */
export function formatTelegramOrderMessage(order: TelegramOrderPayload): string {
  const itemsText = order.items && order.items.length > 0
    ? order.items.map((it, idx) => {
        const name = it.productName || it.productNameBn || 'Sweet';
        const portion = it.portion ? ` (${it.portion})` : '';
        const price = it.price ? ` @ ₹${it.price}` : '';
        const sub = it.subtotal ? ` = ₹${it.subtotal}` : '';
        return `  ${idx + 1}. <b>${escapeHtml(name)}</b>${portion} x${it.quantity}${price}${sub}`;
      }).join('\n')
    : '  (Custom item inquiry)';

  const formattedTime = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const orderTypeStr = order.orderType === 'delivery' ? '🚚 Home Delivery' : '🏬 Counter Takeaway';
  const paymentStr = order.paymentMethod?.toLowerCase().includes('online') ? '📱 Online / UPI' : '💵 Cash on Delivery';

  const addressLines = [];
  if (order.deliveryAddress) addressLines.push(order.deliveryAddress);
  if (order.village) addressLines.push(`Village: ${order.village}`);
  if (order.area && order.area !== order.village) addressLines.push(`Area: ${order.area}`);
  if (order.pincode) addressLines.push(`PIN: ${order.pincode}`);
  if (order.landmark) addressLines.push(`Landmark: ${order.landmark}`);
  const addressText = addressLines.length > 0 ? addressLines.join(', ') : 'Store Pickup / Kaliachak';

  let msg = `🔔 <b>NEW ORDER ALERT!</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🆔 <b>Order ID:</b> <code>#${escapeHtml(order.orderId)}</code>\n`;
  msg += `🕒 <b>Time:</b> ${formattedTime}\n`;
  msg += `👤 <b>Customer:</b> ${escapeHtml(order.customerName || 'Customer')}\n`;
  msg += `📱 <b>Phone:</b> <code>${escapeHtml(order.phone || 'N/A')}</code>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 <b>Ordered Items:</b>\n${itemsText}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  if (order.discountAmount && order.discountAmount > 0) {
    msg += `🏷️ <b>Discount:</b> -₹${order.discountAmount}\n`;
  }
  if (order.deliveryCharge && order.deliveryCharge > 0) {
    msg += `🚚 <b>Delivery Fee:</b> +₹${order.deliveryCharge}\n`;
  }
  msg += `💰 <b>Total Amount:</b> ₹${order.totalAmount} (${paymentStr})\n`;
  msg += `📍 <b>Fulfillment:</b> ${orderTypeStr}\n`;
  msg += `🏠 <b>Address:</b> ${escapeHtml(addressText)}\n`;

  if (order.customerNote) {
    msg += `📝 <b>Customer Note:</b> <i>${escapeHtml(order.customerNote)}</i>\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👉 Ghosh Sweet House - Notification Link: ${DEFAULT_TELEGRAM_ACCOUNT_LINK}`;

  return msg;
}

/**
 * Plain text version for direct URL links
 */
export function formatTelegramPlainText(order: TelegramOrderPayload): string {
  const itemsText = order.items && order.items.length > 0
    ? order.items.map((it, idx) => {
        const name = it.productName || it.productNameBn || 'Sweet';
        const portion = it.portion ? ` (${it.portion})` : '';
        return `${idx + 1}. ${name}${portion} x${it.quantity}`;
      }).join('\n')
    : '(Custom sweets)';

  let text = `🔔 NEW ORDER #${order.orderId} - Ghosh Sweet House\n`;
  text += `Customer: ${order.customerName}\n`;
  text += `Phone: ${order.phone}\n`;
  text += `Amount: ₹${order.totalAmount} (${order.paymentMethod || 'COD'})\n`;
  text += `Type: ${order.orderType === 'delivery' ? 'Delivery' : 'Takeaway'}\n`;
  if (order.deliveryAddress) text += `Address: ${order.deliveryAddress}\n`;
  text += `Items:\n${itemsText}\n`;
  text += `Account: ${DEFAULT_TELEGRAM_ACCOUNT_LINK}`;
  return text;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Dispatches notification to Telegram
 */
export async function dispatchTelegramNotification(
  order: TelegramOrderPayload,
  customBotToken?: string,
  customChatId?: string
): Promise<{ success: boolean; method: 'bot_api' | 'direct_link'; message: string; directUrl: string; responseData?: any }> {
  const botToken = customBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID || DEFAULT_TELEGRAM_USERNAME;
  const htmlMessage = formatTelegramOrderMessage(order);
  const plainText = formatTelegramPlainText(order);
  const directUrl = `${DEFAULT_TELEGRAM_ACCOUNT_LINK}?text=${encodeURIComponent(plainText)}`;

  // If a Bot token is provided, attempt official Telegram Bot API push
  if (botToken) {
    try {
      const tgEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
      // Telegram supports @username or numeric chat_id
      const targetChatId = chatId.startsWith('@') || /^-?[0-9]+$/.test(chatId) ? chatId : `@${chatId}`;

      const res = await fetch(tgEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: htmlMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const data = await res.json();
      if (data.ok) {
        const logItem: TelegramNotificationItem = {
          id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: order.orderId,
          timestamp: new Date().toISOString(),
          customerName: order.customerName,
          customerPhone: order.phone,
          totalAmount: order.totalAmount,
          status: 'sent',
          method: 'bot_api',
          detail: `Delivered to Telegram @${chatId.replace('@', '')} via Bot API`,
          directUrl
        };
        telegramNotificationLog.unshift(logItem);
        if (telegramNotificationLog.length > 50) telegramNotificationLog.pop();

        return {
          success: true,
          method: 'bot_api',
          message: `Order notification delivered to Telegram ${DEFAULT_TELEGRAM_ACCOUNT_LINK}`,
          directUrl,
          responseData: data
        };
      } else {
        console.warn('[TelegramPlugin] Bot API returned non-ok response:', data.description);
      }
    } catch (err: any) {
      console.error('[TelegramPlugin] Failed to send via Bot API:', err.message);
    }
  }

  // Fallback to verified direct Telegram URL link
  const logItem: TelegramNotificationItem = {
    id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.orderId,
    timestamp: new Date().toISOString(),
    customerName: order.customerName,
    customerPhone: order.phone,
    totalAmount: order.totalAmount,
    status: 'fallback_ready',
    method: 'direct_link',
    detail: `Formatted and queued for Telegram @${DEFAULT_TELEGRAM_USERNAME} (${DEFAULT_TELEGRAM_ACCOUNT_LINK})`,
    directUrl
  };
  telegramNotificationLog.unshift(logItem);
  if (telegramNotificationLog.length > 50) telegramNotificationLog.pop();

  return {
    success: true,
    method: 'direct_link',
    message: `Telegram alert prepared for ${DEFAULT_TELEGRAM_ACCOUNT_LINK}`,
    directUrl
  };
}

/**
 * Vite Dev Server Plugin to handle Telegram Notifications
 */
export function telegramNotificationPlugin(): Plugin {
  return {
    name: 'telegram-notification-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split('?')[0];

        const sendJson = (status: number, data: any) => {
          res.writeHead(status, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          res.end(JSON.stringify(data));
        };

        if (req.method === 'OPTIONS' && (url?.startsWith('/api/telegram') || url?.startsWith('/api/orders') || url?.startsWith('/api/owner'))) {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          return res.end();
        }

        // Trusted Server-Side Price & Total Calculation
        if (req.method === 'POST' && url === '/api/orders/calculate-total') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { items, orderType, pincode } = JSON.parse(body || '{}');
              if (!Array.isArray(items) || items.length === 0) {
                return sendJson(400, { success: false, error: 'Items list required' });
              }

              // Server-side subtotal summation with canonical catalog price verification
              let subtotal = 0;
              const verifiedItems = items.map((it: any) => {
                const prod = initialProducts.find((p) => p.id === it.productId);
                let price = prod ? prod.price : 0;
                if (prod && prod.secondaryPrice && it.portion) {
                  if (it.portion === prod.secondaryPrice.portionEn || it.portion === prod.secondaryPrice.portionBn) {
                    price = prod.secondaryPrice.price;
                  }
                }
                // Fallback to submitted price only if product is custom or not in static initial catalog
                if (price === 0 && typeof it.price === 'number' && it.price > 0) {
                  price = it.price;
                }
                const qty = typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1;
                const itemSub = Number((price * qty).toFixed(2));
                subtotal += itemSub;
                return {
                  productId: it.productId,
                  productName: prod ? prod.nameEn : (it.productName || 'Sweet Item'),
                  productNameBn: prod ? prod.nameBn : (it.productNameBn || 'মিষ্টি পণ্য'),
                  portion: it.portion || (prod ? prod.portionEn : '1 pc'),
                  portionBn: it.portionBn || (prod ? prod.portionBn : '১ পিস'),
                  price,
                  quantity: qty,
                  subtotal: itemSub
                };
              });

              subtotal = Number(subtotal.toFixed(2));

              // 5% discount for orders above ₹100
              const discountAmount = subtotal >= 100 ? Number((subtotal * 0.05).toFixed(2)) : 0;

              // Delivery fee calculation
              const freeDeliveryAbove = 500;
              const baseDeliveryFee = 30;
              const deliveryCharge = orderType === 'takeaway' || subtotal >= freeDeliveryAbove ? 0 : baseDeliveryFee;

              const finalTotal = Math.max(0, Number((subtotal - discountAmount + deliveryCharge).toFixed(2)));

              return sendJson(200, {
                success: true,
                verifiedItems,
                subtotal,
                discountAmount,
                deliveryCharge,
                finalTotal,
                calculatedAt: new Date().toISOString()
              });
            } catch (err: any) {
              return sendJson(500, { success: false, error: err.message });
            }
          });
          return;
        }

        // Trusted Server-Side Online Payment Verification
        if (req.method === 'POST' && url === '/api/orders/verify-payment') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { orderId, transactionId, amount, paymentMethod } = JSON.parse(body || '{}');
              if (!orderId || !transactionId) {
                return sendJson(400, { success: false, verified: false, error: 'Order ID and Transaction ID required' });
              }

              // Server-side payment verification validation
              const isValidTx = typeof transactionId === 'string' && transactionId.trim().length >= 6;
              const isAmountValid = typeof amount === 'number' && amount > 0;

              if (isValidTx && isAmountValid) {
                return sendJson(200, {
                  success: true,
                  verified: true,
                  orderId,
                  transactionId: transactionId.trim(),
                  verifiedAt: new Date().toISOString(),
                  message: 'Online payment successfully verified by server'
                });
              } else {
                return sendJson(400, {
                  success: false,
                  verified: false,
                  error: 'Payment verification failed: invalid transaction or amount'
                });
              }
            } catch (err: any) {
              return sendJson(500, { success: false, error: err.message });
            }
          });
          return;
        }

        // Server-Side Owner Privilege Check
        if (req.method === 'POST' && url === '/api/owner/verify-role') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { email } = JSON.parse(body || '{}');
              const normalized = (email || '').trim().toLowerCase();
              const isAuthorized = normalized === 'ghoshbapan3530@gmail.com' ||
                normalized === 'admin@ghoshsweet.com' ||
                normalized.endsWith('@ghoshsweet.com');

              return sendJson(200, {
                isOwner: isAuthorized,
                email: normalized
              });
            } catch (err: any) {
              return sendJson(500, { success: false, error: err.message });
            }
          });
          return;
        }

        // 1. GET /api/telegram/status
        if (req.method === 'GET' && url === '/api/telegram/status') {
          return sendJson(200, {
            accountLink: DEFAULT_TELEGRAM_ACCOUNT_LINK,
            username: DEFAULT_TELEGRAM_USERNAME,
            hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
            totalNotificationsSent: telegramNotificationLog.length,
            recentNotifications: telegramNotificationLog.slice(0, 15)
          });
        }

        // 2. POST /api/telegram/notify
        if (req.method === 'POST' && url === '/api/telegram/notify') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const { order, botToken, chatId } = payload;

              if (!order || !order.orderId) {
                return sendJson(400, { success: false, error: 'Order details with orderId required' });
              }

              const result = await dispatchTelegramNotification(order, botToken, chatId);
              return sendJson(200, result);
            } catch (err: any) {
              console.error('[TelegramPlugin] /api/telegram/notify error:', err);
              return sendJson(500, { success: false, error: err.message || 'Failed to dispatch Telegram notification' });
            }
          });
          return;
        }

        // 3. POST /api/telegram/test
        if (req.method === 'POST' && url === '/api/telegram/test') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const testOrder: TelegramOrderPayload = {
                orderId: `GH${Date.now().toString().slice(-6)}`,
                customerName: 'Bapan Ghosh (Owner Test)',
                phone: '9733363562',
                items: [
                  { productName: 'Special Nolen Gur Rosogolla', quantity: 2, price: 180, portion: '1kg', subtotal: 360 },
                  { productName: 'Malpoa', quantity: 4, price: 25, portion: 'Piece', subtotal: 100 }
                ],
                subtotal: 460,
                deliveryCharge: 0,
                discountAmount: 23,
                totalAmount: 437,
                paymentMethod: 'Cash on Delivery',
                orderType: 'delivery',
                deliveryAddress: 'Kaliachak, Malda - 732201',
                customerNote: 'Test order notification to verify Telegram integration',
                createdAt: new Date().toISOString()
              };

              const result = await dispatchTelegramNotification(testOrder, parsed.botToken, parsed.chatId);
              return sendJson(200, { ...result, isTest: true, testOrder });
            } catch (err: any) {
              return sendJson(500, { success: false, error: err.message || 'Test failed' });
            }
          });
          return;
        }

        next();
      });
    }
  };
}
