import { jsPDF } from 'jspdf';
import { OrderHistoryItem } from '../types';
import { FirebaseOrder } from './firestore-orders';

/**
 * Converts numeric rupee amount into standard Indian currency words.
 */
export function numberToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded <= 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred) res += singleDigits[hundred] + ' Hundred';
    if (rest) res += (res ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  let words = '';
  if (crore) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder) words += convertThreeDigits(remainder);

  return 'Rupees ' + words.trim() + ' Only';
}

export interface NormalizedInvoiceItem {
  nameEn: string;
  nameBn?: string;
  portion: string;
  price: number;
  quantity: number;
  subtotal: number;
  hsnCode: string;
}

export interface NormalizedInvoiceData {
  id: string;
  orderNumber: string;
  date: string;
  dateTimeStr: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  orderType: 'delivery' | 'takeaway';
  paymentMethod: string;
  status: string;
  specialNote?: string;
  items: NormalizedInvoiceItem[];
  grossSubtotal: number;
  discountAmount: number;
  pointsRedeemed: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTaxAmount: number;
  deliveryCharge: number;
  finalTotal: number;
  wordsAmount: string;
  pointsEarned: number;
}

/**
 * Normalizes either an OrderHistoryItem or a FirebaseOrder into a clean, standardized invoice structure.
 */
export function normalizeInvoiceData(order: OrderHistoryItem | FirebaseOrder | any): NormalizedInvoiceData {
  const isFirebaseOrder = 'orderId' in order && !('finalTotal' in order && !('totalAmount' in order));

  const id = isFirebaseOrder ? (order.orderId || order.id) : (order.id || 'GH-ORD');
  const orderNumber = String(id).startsWith('#') ? String(id) : `#${id}`;

  let dateStr = '';
  let dateTimeStr = '';
  if (order.createdAt) {
    const d = typeof order.createdAt === 'number' ? new Date(order.createdAt) : new Date(order.createdAt);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      dateTimeStr = d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  }
  if (!dateStr) {
    dateStr = order.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    dateTimeStr = dateStr;
  }

  // Customer Name display
  const rawCustomerName = order.customerName ? String(order.customerName).trim() : '';
  const customerName = rawCustomerName || 'Valued Customer / সম্মানিত গ্রাহক';

  const customerPhone = order.customerPhone || order.phone || '';
  const deliveryAddress = order.deliveryAddress || '';
  const orderType: 'delivery' | 'takeaway' = order.orderType === 'takeaway' ? 'takeaway' : 'delivery';
  
  const paymentMethod = order.paymentMethod
    ? order.paymentMethod === 'cod'
      ? 'Cash on Delivery (নগদ)'
      : order.paymentMethod === 'online'
      ? 'Online Payment (UPI/Card)'
      : String(order.paymentMethod)
    : 'Cash on Delivery (নগদ)';

  const status = order.status || 'Completed';
  const specialNote = order.specialNote || order.customerNote || '';

  // Items normalization
  const items: NormalizedInvoiceItem[] = [];
  if (Array.isArray(order.items)) {
    order.items.forEach((it: any) => {
      const nameEn = it.product?.nameEn || it.productName || 'Ghosh Sweet Item';
      const nameBn = it.product?.nameBn || it.productNameBn || '';
      const portion = it.selectedPortion || it.portion || '1 pc';
      const price = Number(it.price) || 0;
      const quantity = Number(it.quantity) || 1;
      const subtotal = Number(it.subtotal) || (price * quantity);
      
      // Determine HSN code: 2106 for traditional sweets/chhena, 1905 for savoury snacks, 0403 for curd/doi
      let hsnCode = '2106';
      const lower = (nameEn + ' ' + nameBn).toLowerCase();
      if (lower.includes('singara') || lower.includes('kachori') || lower.includes('nimki') || lower.includes('samosa')) {
        hsnCode = '1905';
      } else if (lower.includes('doi') || lower.includes('curd') || lower.includes('yogurt')) {
        hsnCode = '0403';
      }

      items.push({
        nameEn,
        nameBn,
        portion,
        price,
        quantity,
        subtotal,
        hsnCode
      });
    });
  }

  const rawGrossSubtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const grossSubtotal = Number(order.subtotal) || rawGrossSubtotal;

  const finalTotal = Number(order.finalTotal ?? order.totalAmount) || (grossSubtotal > 0 ? grossSubtotal : 0);
  const discountAmount = Number(order.discountAmount || order.newCustomerDiscount || (grossSubtotal > finalTotal ? grossSubtotal - finalTotal : 0));
  const pointsRedeemed = Number(order.pointsRedeemed) || 0;
  const deliveryCharge = Number(order.deliveryCharge) || 0;

  // Indian GST 5% breakdown (CGST 2.5% + SGST 2.5%)
  // Prices in food/sweets are GST inclusive
  const netBeforeTax = Math.max(0, finalTotal - deliveryCharge);
  const taxableAmount = Number((netBeforeTax / 1.05).toFixed(2));
  const totalTaxAmount = Number((netBeforeTax - taxableAmount).toFixed(2));
  const cgstAmount = Number((totalTaxAmount / 2).toFixed(2));
  const sgstAmount = Number((totalTaxAmount - cgstAmount).toFixed(2));

  const wordsAmount = numberToWords(finalTotal);
  const pointsEarned = Number(order.pointsEarned) || Math.floor(finalTotal / 20);

  return {
    id,
    orderNumber,
    date: dateStr,
    dateTimeStr,
    customerName,
    customerPhone,
    deliveryAddress,
    orderType,
    paymentMethod,
    status,
    specialNote,
    items,
    grossSubtotal,
    discountAmount,
    pointsRedeemed,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    totalTaxAmount,
    deliveryCharge,
    finalTotal,
    wordsAmount,
    pointsEarned
  };
}

/**
 * Generates and downloads a clean, print-formatted A4 PDF invoice.
 */
export function generateOrderInvoicePdf(rawOrder: OrderHistoryItem | FirebaseOrder | any): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const invoice = normalizeInvoiceData(rawOrder);

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Brand Colors
  const amberDark = [120, 53, 15]; // #78350f
  const amberGold = [217, 119, 6]; // #d97706
  const stone900 = [28, 25, 23];   // #1c1917
  const stone600 = [87, 83, 78];   // #57534e
  const stone100 = [245, 245, 244]; // #f5f5f4
  const emerald700 = [4, 120, 87];  // #047857

  // 1. Top Decorative Brand Bar
  doc.setFillColor(amberGold[0], amberGold[1], amberGold[2]);
  doc.rect(margin, 10, contentWidth, 2.5, 'F');

  // 2. Shop Details & Title Header
  let y = 19;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.text('GHOSH SWEET HOUSE', margin, y);

  // Tagline
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(amberGold[0], amberGold[1], amberGold[2]);
  doc.text('Heritage Bengal Sweets & Pure Ghee Delicacies - Estd. 1978', margin, y);

  // Address & Contacts
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('Main Road, Kaliachak, Malda, West Bengal - Pin: 732201', margin, y);

  y += 3.8;
  doc.text('Phone: +91 97333 63562  |  Email: orders@ghoshsweethouse.in', margin, y);

  y += 3.8;
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN: 19AAEPG8923M1Z5  |  FSSAI Lic: 12821013000192  |  State: West Bengal (19)', margin, y);

  // Tax Invoice Badge on Right
  doc.setFillColor(254, 243, 199); // #fef3c7
  doc.setDrawColor(amberGold[0], amberGold[1], amberGold[2]);
  doc.roundedRect(pageWidth - margin - 58, 15, 58, 9, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.text('TAX INVOICE / CASH MEMO', pageWidth - margin - 29, 20.5, { align: 'center' });

  // Invoice & Date details on Right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text(`Invoice No: ${invoice.orderNumber}`, pageWidth - margin, 29, { align: 'right' });
  doc.text(`Date & Time: ${invoice.dateTimeStr}`, pageWidth - margin, 33, { align: 'right' });
  doc.text(`Order Type: ${invoice.orderType === 'takeaway' ? 'Store Takeaway' : 'Home Delivery'}`, pageWidth - margin, 37, { align: 'right' });

  // Divider Line
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. Billing & Customer Details Box
  y += 4;
  const boxHeight = 26;
  doc.setFillColor(stone100[0], stone100[1], stone100[2]);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

  // Customer column (Left)
  const col1X = margin + 4;
  let boxY = y + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('BILLED & DELIVERED TO (CUSTOMER):', col1X, boxY);

  boxY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(stone900[0], stone900[1], stone900[2]);
  doc.text(invoice.customerName, col1X, boxY);

  boxY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  if (invoice.customerPhone) {
    doc.text(`Mobile: +91 ${invoice.customerPhone}`, col1X, boxY);
    boxY += 3.8;
  }
  if (invoice.deliveryAddress) {
    const addressLines = doc.splitTextToSize(`Address: ${invoice.deliveryAddress}`, 100);
    doc.text(addressLines, col1X, boxY);
  }

  // Payment column (Right)
  const col2X = margin + 110;
  let payY = y + 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('PAYMENT & SUPPLY DETAILS:', col2X, payY);

  payY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(stone900[0], stone900[1], stone900[2]);
  doc.text(`Payment Mode: ${invoice.paymentMethod}`, col2X, payY);

  payY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emerald700[0], emerald700[1], emerald700[2]);
  doc.text(`Order Status: ${invoice.status}`, col2X, payY);

  payY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('Place of Supply: West Bengal (19)', col2X, payY);

  // 4. Items Table
  y += boxHeight + 5;

  // Table Headers
  const thY = y;
  const thHeight = 7;
  doc.setFillColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.rect(margin, thY, contentWidth, thHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  const colX = {
    sl: margin + 3,
    desc: margin + 12,
    portion: margin + 85,
    hsn: margin + 110,
    rate: margin + 133,
    qty: margin + 155,
    total: pageWidth - margin - 3
  };

  doc.text('#', colX.sl, thY + 4.8);
  doc.text('Item Description', colX.desc, thY + 4.8);
  doc.text('Portion', colX.portion, thY + 4.8);
  doc.text('HSN', colX.hsn, thY + 4.8);
  doc.text('Rate (Rs)', colX.rate, thY + 4.8, { align: 'right' });
  doc.text('Qty', colX.qty, thY + 4.8, { align: 'center' });
  doc.text('Total (Rs)', colX.total, thY + 4.8, { align: 'right' });

  // Table Body Rows
  y += thHeight;
  const items = invoice.items.length > 0 ? invoice.items : [];

  items.forEach((item, idx) => {
    const rowY = y;
    const rowHeight = 7;

    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 249);
      doc.rect(margin, rowY, contentWidth, rowHeight, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone900[0], stone900[1], stone900[2]);

    // Sl No
    doc.text(`${idx + 1}`, colX.sl, rowY + 4.6);

    // Name
    const truncatedName = item.nameEn.length > 38 ? item.nameEn.slice(0, 36) + '...' : item.nameEn;
    doc.setFont('helvetica', 'bold');
    doc.text(truncatedName, colX.desc, rowY + 4.6);

    // Portion
    doc.setFont('helvetica', 'normal');
    doc.text(item.portion || '1 pc', colX.portion, rowY + 4.6);

    // HSN Code
    doc.text(item.hsnCode || '2106', colX.hsn, rowY + 4.6);

    // Rate
    doc.text(item.price.toFixed(2), colX.rate, rowY + 4.6, { align: 'right' });

    // Quantity
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.quantity}`, colX.qty, rowY + 4.6, { align: 'center' });

    // Line Total
    doc.text(item.subtotal.toFixed(2), colX.total, rowY + 4.6, { align: 'right' });

    // Bottom separator
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, rowY + rowHeight, pageWidth - margin, rowY + rowHeight);

    y += rowHeight;
  });

  // Table Outer Frame Box
  const tableTotalHeight = (items.length * 7) + thHeight;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, thY, contentWidth, tableTotalHeight);

  // 5. Statutory Tax Breakdown Table & Totals Summary
  y += 5;

  // Left Column: GST Breakdown Table & Amount in Words
  const leftColY = y;
  const leftColWidth = 105;

  // GST Statutory Breakdown Box
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, leftColY, leftColWidth, 23, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.text('GST STATUTORY TAX BREAKDOWN (5% GST):', margin + 3, leftColY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(stone900[0], stone900[1], stone900[2]);
  let taxRowY = leftColY + 9;
  doc.text(`Taxable Amount: Rs ${invoice.taxableAmount.toFixed(2)}`, margin + 3, taxRowY);
  doc.text(`Total Tax: Rs ${invoice.totalTaxAmount.toFixed(2)}`, margin + 65, taxRowY);

  taxRowY += 4.5;
  doc.text(`CGST @ 2.5%: Rs ${invoice.cgstAmount.toFixed(2)}`, margin + 3, taxRowY);
  doc.text(`SGST @ 2.5%: Rs ${invoice.sgstAmount.toFixed(2)}`, margin + 45, taxRowY);

  taxRowY += 4.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('*Confectionery & Sweets GST (2.5% Central + 2.5% West Bengal State)', margin + 3, taxRowY);

  // Amount in words box below
  const wordsBoxY = leftColY + 25;
  doc.setFillColor(stone100[0], stone100[1], stone100[2]);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, wordsBoxY, leftColWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.text('AMOUNT IN WORDS:', margin + 3, wordsBoxY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(stone900[0], stone900[1], stone900[2]);
  const wordsLines = doc.splitTextToSize(invoice.wordsAmount, 98);
  doc.text(wordsLines, margin + 3, wordsBoxY + 9);

  // Right Column: Financial Figures
  const rightBoxX = margin + 112;
  const rightBoxWidth = contentWidth - 112; // 70mm
  let figY = y + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('Items Subtotal:', rightBoxX, figY);
  doc.text(`Rs ${invoice.grossSubtotal.toFixed(2)}`, pageWidth - margin, figY, { align: 'right' });

  if (invoice.discountAmount > 0) {
    figY += 4.5;
    doc.setTextColor(emerald700[0], emerald700[1], emerald700[2]);
    doc.text('Special Discount (5%):', rightBoxX, figY);
    doc.text(`- Rs ${invoice.discountAmount.toFixed(2)}`, pageWidth - margin, figY, { align: 'right' });
  }

  if (invoice.pointsRedeemed > 0) {
    figY += 4.5;
    doc.setTextColor(emerald700[0], emerald700[1], emerald700[2]);
    doc.text('Sweet Points Redeemed:', rightBoxX, figY);
    doc.text(`-${invoice.pointsRedeemed} pts`, pageWidth - margin, figY, { align: 'right' });
  }

  figY += 4.5;
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('Net Taxable Value:', rightBoxX, figY);
  doc.text(`Rs ${invoice.taxableAmount.toFixed(2)}`, pageWidth - margin, figY, { align: 'right' });

  figY += 4.5;
  doc.text('CGST (2.5%):', rightBoxX, figY);
  doc.text(`Rs ${invoice.cgstAmount.toFixed(2)}`, pageWidth - margin, figY, { align: 'right' });

  figY += 4.5;
  doc.text('SGST (2.5%):', rightBoxX, figY);
  doc.text(`Rs ${invoice.sgstAmount.toFixed(2)}`, pageWidth - margin, figY, { align: 'right' });

  figY += 4.5;
  doc.text('Delivery Charges:', rightBoxX, figY);
  doc.setTextColor(emerald700[0], emerald700[1], emerald700[2]);
  doc.text('FREE', pageWidth - margin, figY, { align: 'right' });

  // Grand Total Highlighted Box
  figY += 4.5;
  doc.setFillColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.roundedRect(rightBoxX - 2, figY, rightBoxWidth + 2, 9, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total:', rightBoxX + 2, figY + 6);
  doc.text(`Rs ${invoice.finalTotal.toFixed(2)}`, pageWidth - margin - 2, figY + 6, { align: 'right' });

  // 6. Food Safety Terms & Footer
  let footerY = Math.max(wordsBoxY + 18, figY + 14);

  // Terms and Notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('Terms & Notes: 1. Food items once delivered cannot be returned. 2. Store sweets refrigerated below 4 deg C and consume within 48h. 3. Pure desi ghee & fresh chhena guaranteed.', margin, footerY);

  footerY += 4;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Signature Block
  footerY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('This is a computer generated tax invoice. Valid without physical signature.', margin, footerY);
  doc.text('Ghosh Sweet House - Serving Authentic Taste with Love & Purity.', margin, footerY + 4);

  // Authorized Signatory Stamp
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(amberDark[0], amberDark[1], amberDark[2]);
  doc.text('For GHOSH SWEET HOUSE', pageWidth - margin, footerY, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(stone600[0], stone600[1], stone600[2]);
  doc.text('Authorized Signatory', pageWidth - margin, footerY + 5, { align: 'right' });

  // Bottom Branding Line
  doc.setFillColor(amberGold[0], amberGold[1], amberGold[2]);
  doc.rect(margin, pageHeight - 8, contentWidth, 1.5, 'F');

  return doc;
}

/**
 * Generates and immediately triggers browser file download for the order invoice.
 */
export function downloadOrderInvoicePdf(order: OrderHistoryItem | FirebaseOrder | any): void {
  try {
    const doc = generateOrderInvoicePdf(order);
    const invoice = normalizeInvoiceData(order);
    const cleanId = (invoice.id || 'Order').replace(/[^a-zA-Z0-9-_]/g, '');
    const filename = `Ghosh_Sweet_House_Invoice_${cleanId}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('[PDF Invoice] Failed to download PDF:', err);
    throw err;
  }
}
