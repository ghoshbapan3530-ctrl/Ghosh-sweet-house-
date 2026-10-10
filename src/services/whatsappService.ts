import { CartItem, ShopDetails, Language } from '../types';

export interface WhatsAppOrderDetails {
  cart: CartItem[];
  cartTotal: number;
  shopDetails: ShopDetails;
  language?: Language;
  customerName?: string;
  customerPhone?: string;
  orderType?: 'delivery' | 'takeaway';
  deliveryAddress?: string;
  village?: string;
  area?: string;
  pincode?: string;
  customerNote?: string;
  deliveryCharge?: number;
}

/**
 * Formats a clean, readable, professional WhatsApp message for Ghosh Sweet House
 */
export function generateWhatsAppOrderMessage(details: WhatsAppOrderDetails): string {
  const {
    cart,
    cartTotal,
    shopDetails,
    language = 'bn',
    customerName,
    customerPhone,
    orderType = 'delivery',
    deliveryAddress,
    village,
    area,
    pincode,
    customerNote,
    deliveryCharge = 0
  } = details;

  const isBengali = language === 'bn';
  const shopName = `${shopDetails.nameEn || 'GHOSH SWEET HOUSE'} (${shopDetails.nameBn || 'ঘোষ মিষ্টান্ন ভাণ্ডার'})`;
  const location = `${shopDetails.addressEn || 'Duisatabighi, Kaliachak, Malda'}, WB`;

  // Case 1: Empty Cart - General Inquiry
  if (!cart || cart.length === 0) {
    return [
      `*🍬 ${shopName}*`,
      `📍 ${location}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      isBengali
        ? `নমস্কার ঘোষ সুইট হাউস! 🙏`
        : `Namaskar Ghosh Sweet House! 🙏`,
      isBengali
        ? `আমি আপনাদের অনলাইন মেনু দেখছি। আজকের তাজা মিষ্টি ও হোম ডেলিভারি সম্পর্কে জানতে চাই।`
        : `I am browsing your online menu and would like to inquire about today's fresh sweets and delivery availability.`,
      customerName ? `\n👤 *Customer:* ${customerName}` : '',
      customerPhone ? `📞 *Phone:* ${customerPhone}` : '',
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Sent from Ghosh Sweet House Online Store_`
    ]
      .filter(Boolean)
      .join('\n');
  }

  // Case 2: Cart has items - Direct Order
  const isDiscountEligible = cartTotal >= 100;
  const discount5Percent = isDiscountEligible ? Number((cartTotal * 0.05).toFixed(2)) : 0;
  const finalTotal = Math.max(0, Number((cartTotal - discount5Percent + deliveryCharge).toFixed(2)));
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const itemsList = cart
    .map((item, idx) => {
      const name = isBengali
        ? `${item.product.nameBn} (${item.product.nameEn})`
        : `${item.product.nameEn} (${item.product.nameBn})`;
      const lineTotal = item.price * item.quantity;
      return `${idx + 1}. *${name}*\n   ▫️ Portion: ${item.selectedPortion}\n   ▫️ Qty: ${item.quantity} × ₹${item.price} = *₹${lineTotal}*`;
    })
    .join('\n\n');

  const customerLines: string[] = [];
  if (customerName && customerName.trim()) {
    customerLines.push(`• *Name:* ${customerName.trim()}`);
  }
  if (customerPhone && customerPhone.trim()) {
    customerLines.push(`• *Mobile:* ${customerPhone.trim()}`);
  }
  customerLines.push(
    `• *Order Type:* ${
      orderType === 'takeaway'
        ? '🏬 Counter Pickup / টেকওয়ে'
        : '🚚 Home Delivery / হোম ডেলিভারি'
    }`
  );

  const addressParts: string[] = [];
  if (deliveryAddress && deliveryAddress.trim()) addressParts.push(deliveryAddress.trim());
  if (village && village.trim()) addressParts.push(`Vill: ${village.trim()}`);
  if (area && area.trim()) addressParts.push(`Area: ${area.trim()}`);
  if (pincode && pincode.trim()) addressParts.push(`PIN: ${pincode.trim()}`);

  if (addressParts.length > 0 && orderType === 'delivery') {
    customerLines.push(`• *Address:* ${addressParts.join(', ')}`);
  }

  if (customerNote && customerNote.trim()) {
    customerLines.push(`• *Special Note:* _${customerNote.trim()}_`);
  }

  const messageParts = [
    `*🍬 ${shopName} - NEW DIRECT ORDER*`,
    `📍 ${location}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*📦 ORDER ITEMS (${totalItemCount} items):*`,
    itemsList,
    `━━━━━━━━━━━━━━━━━━━━`,
    `*💵 BILL ESTIMATE:*`,
    `• Subtotal: *₹${cartTotal}*`,
    discount5Percent > 0 ? `• 5% Special Discount: *-₹${discount5Percent}*` : '',
    deliveryCharge > 0 ? `• Delivery Charge: *₹${deliveryCharge}*` : (orderType === 'delivery' ? '• Delivery: *FREE*' : ''),
    `• *Estimated Total: ₹${finalTotal}*`,
    customerLines.length > 0 ? `━━━━━━━━━━━━━━━━━━━━\n*👤 CUSTOMER DETAILS:*\n${customerLines.join('\n')}` : '',
    `━━━━━━━━━━━━━━━━━━━━`,
    isBengali
      ? `নমস্কার! দয়া করে আমার অর্ডারটি কনফার্ম করুন ও প্রস্তুতি/ডেলিভারির সময় জানান। ধন্যবাদ!`
      : `Namaskar! Please confirm my order availability and preparation/delivery time. Thank you!`,
    `_Sent via Ghosh Sweet House 1-Click WhatsApp Ordering_`
  ].filter(Boolean);

  return messageParts.join('\n');
}

/**
 * Builds the official WhatsApp URL (wa.me) for Ghosh Sweet House
 */
export function getWhatsAppOrderUrl(details: WhatsAppOrderDetails): string {
  const rawNumber = details.shopDetails.whatsapp || details.shopDetails.phone || '919733363562';
  // Strip non-digits
  let cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  // Ensure India country code 91 if 10-digit number
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }
  const message = generateWhatsAppOrderMessage(details);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
