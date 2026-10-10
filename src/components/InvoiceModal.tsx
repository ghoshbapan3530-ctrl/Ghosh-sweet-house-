import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Sparkles,
  ShoppingBag,
  FileText,
  Check,
  Building2,
  Receipt,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { OrderHistoryItem, Language, ThemeMode } from '../types';
import { FirebaseOrder } from '../lib/firestore-orders';
import { downloadOrderInvoicePdf, normalizeInvoiceData } from '../lib/pdf-invoice';

interface InvoiceModalProps {
  order: OrderHistoryItem | FirebaseOrder | any | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  language,
  theme
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !order) return null;

  const invoice = normalizeInvoiceData(order);
  const isDark = theme === 'dark';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = `Ghosh Sweet House Invoice #${invoice.id}\nCustomer: ${invoice.customerName}\nTotal Amount: ₹${invoice.finalTotal.toFixed(2)}\nDate: ${invoice.date}\nPure Bengal Sweets & Delicacies`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${invoice.id} - Ghosh Sweet House`,
          text: shareText,
          url: window.location.href
        });
        return;
      } catch (e) {
        // user cancelled or fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      id="invoice-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      {/* Printable Invoice Wrapper Modal */}
      <div className="w-full max-w-3xl max-h-[96vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative bg-stone-900 border border-stone-800">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print bg-stone-900 border-b border-amber-500/25 p-3 sm:p-4 flex items-center justify-between text-stone-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-bengali text-amber-300">
                  {language === 'bn' ? 'অর্ডার ট্যাক্স রসিদ / ক্যাশ মেমো' : 'Official Tax Invoice & Cash Memo'}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  GST Verified
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono flex items-center gap-2">
                <span>{invoice.orderNumber}</span>
                <span>•</span>
                <span>{invoice.date}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF button */}
            <button
              type="button"
              onClick={() => downloadOrderInvoicePdf(order)}
              id="download-pdf-invoice-btn"
              title="Download print-ready vector PDF"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'PDF চালান' : 'Download PDF'}</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              id="print-invoice-action-btn"
              title="Print directly or save as PDF"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            {/* Share / Copy button */}
            <button
              type="button"
              onClick={handleShare}
              title="Share invoice summary"
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-stone-300" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              id="close-invoice-modal-btn"
              className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Sheet */}
        <div className="overflow-y-auto p-3 sm:p-6 bg-stone-950/70 flex-1 flex justify-center">
          <div
            id="printable-invoice-container"
            className="w-full bg-white text-stone-900 rounded-2xl shadow-xl p-5 sm:p-8 border border-stone-200 text-xs font-sans leading-relaxed transition-all"
            style={{ minHeight: '720px' }}
          >
            {/* Header: Shop Info & Tax Invoice Title */}
            <div className="border-b-2 border-stone-800 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Shop Branding */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl select-none" role="img" aria-label="Honey">🍯</span>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-950 uppercase font-serif">
                        GHOSH SWEET HOUSE
                      </h1>
                      <h2 className="text-xs font-bold text-amber-800 font-bengali">
                        ঘোষ মিষ্টান্ন ভাণ্ডার — খাঁটি ঘি ও ঐতিহ্যবাহী ছানার মিষ্টি (Estd. 1978)
                      </h2>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 pt-0.5 leading-snug">
                    Main Road, Kaliachak, Malda, West Bengal — Pin: 732201
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    Phone: +91 97333 63562 • Email: orders@ghoshsweethouse.in • Web: ghoshsweethouse.in
                  </p>
                  
                  {/* Statutory Tax Licenses */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-stone-600 font-mono pt-1">
                    <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold text-amber-900">
                      GSTIN: 19AAEPG8923M1Z5
                    </span>
                    <span>
                      FSSAI Lic: <strong>12821013000192</strong>
                    </span>
                    <span>
                      Trade Lic: <strong>WB/MLD/KC-4491</strong>
                    </span>
                  </div>
                </div>

                {/* Right: Invoice Meta Box */}
                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-200 flex-shrink-0">
                  <div className="inline-block text-center sm:text-right">
                    <span className="inline-block px-3 py-1 rounded bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider border border-amber-300 shadow-sm">
                      TAX INVOICE / CASH MEMO
                    </span>
                    <span className="block text-[9px] uppercase font-semibold text-stone-500 mt-0.5">
                      (Original for Recipient)
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-[11px] font-mono">
                    <p>
                      Invoice No: <strong className="text-amber-900 font-bold text-xs">{invoice.orderNumber}</strong>
                    </p>
                    <p>
                      Date & Time: <strong>{invoice.dateTimeStr}</strong>
                    </p>
                    <p>
                      Order Fulfillment:{' '}
                      <span className="font-bold text-stone-800">
                        {invoice.orderType === 'takeaway' ? 'Store Takeaway' : 'Home Delivery'}
                      </span>
                    </p>
                    <p>
                      Order Status:{' '}
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {invoice.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Billing Information Box */}
            <div className="bg-stone-50 border border-stone-300 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Column */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Billed & Delivered To (Customer):</span>
                </div>
                
                {/* Highlighted Customer Name */}
                <div className="pt-0.5">
                  <span className="text-[11px] text-stone-500 block font-medium">Customer Name:</span>
                  <p className="font-black text-stone-900 text-sm tracking-wide">
                    {invoice.customerName}
                  </p>
                </div>

                {invoice.customerPhone && (
                  <p className="text-stone-700 font-mono flex items-center gap-1.5 text-[11px] pt-0.5">
                    <Phone className="w-3 h-3 text-stone-500 flex-shrink-0" />
                    <span>+91 {invoice.customerPhone}</span>
                  </p>
                )}

                {invoice.deliveryAddress ? (
                  <div className="text-stone-700 flex items-start gap-1.5 text-[11px] pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{invoice.deliveryAddress}</span>
                  </div>
                ) : (
                  <div className="text-stone-500 text-[11px] italic">
                    {invoice.orderType === 'takeaway'
                      ? 'Counter Pickup at Ghosh Sweet House, Kaliachak'
                      : 'Local Delivery in Kaliachak area'}
                  </div>
                )}

                <div className="pt-1 text-[10px] text-stone-500 font-mono">
                  <span>Customer GSTIN: <strong>Unregistered (Consumer B2C)</strong></span>
                  <span className="mx-2">•</span>
                  <span>State: <strong>West Bengal (19)</strong></span>
                </div>
              </div>

              {/* Payment & Supply Column */}
              <div className="sm:border-l sm:border-stone-200 sm:pl-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block">
                  Payment & Place of Supply:
                </span>
                
                <div className="pt-0.5">
                  <span className="text-[11px] text-stone-500 block font-medium">Payment Mode:</span>
                  <p className="font-bold text-stone-900 text-xs">
                    {invoice.paymentMethod}
                  </p>
                </div>

                <p className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px] pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Invoice Verified / Counter Authorized</span>
                </p>

                <p className="text-[11px] text-stone-600 font-mono">
                  Place of Supply: <strong>West Bengal (State Code: 19)</strong>
                </p>

                {invoice.specialNote && (
                  <div className="text-[11px] text-stone-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/80 mt-1.5">
                    <span className="font-bold text-amber-900">Order Note:</span> "{invoice.specialNote}"
                  </div>
                )}
              </div>
            </div>

            {/* Structured Order Items Table */}
            <div className="border border-stone-300 rounded-xl overflow-hidden mb-4 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-amber-950 text-amber-100 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center border-r border-amber-900/60">#</th>
                    <th className="py-2.5 px-3 border-r border-amber-900/60">Item Description & Specification</th>
                    <th className="py-2.5 px-3 text-center border-r border-amber-900/60">Portion</th>
                    <th className="py-2.5 px-3 text-center border-r border-amber-900/60">HSN</th>
                    <th className="py-2.5 px-3 text-right border-r border-amber-900/60">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-center border-r border-amber-900/60">Qty</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-stone-50/70' : 'bg-white'}>
                        <td className="py-2.5 px-3 text-center text-stone-500 font-mono border-r border-stone-200">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-stone-200">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" title="100% Pure Vegetarian" />
                            <span className="font-bold text-stone-900 text-xs">
                              {item.nameEn}
                            </span>
                          </div>
                          {item.nameBn && (
                            <span className="text-[11px] text-stone-600 font-bengali block pl-3.5 mt-0.5">
                              {item.nameBn}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-stone-600 font-mono text-[11px] border-r border-stone-200">
                          {item.portion}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-stone-500 border-r border-stone-200">
                          {item.hsnCode}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-800 border-r border-stone-200">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono text-stone-900 border-r border-stone-200">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono text-stone-900">
                          ₹{item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-stone-500 italic">
                        Traditional Sweets & Snacks Assortment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Tax Breakdown Section */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-t-2 border-stone-800 pt-3">
              {/* Left Column (7 cols): GST Statutory Table & Words */}
              <div className="sm:col-span-7 space-y-3">
                {/* GST Statutory Breakdown Table */}
                <div className="border border-amber-300 rounded-xl overflow-hidden bg-amber-50/50">
                  <div className="bg-amber-100/80 px-3 py-1.5 border-b border-amber-200 flex items-center justify-between text-[10px] font-bold text-amber-950 uppercase tracking-wider">
                    <span>Tax Breakdown Analysis (GST 5% - Sweets & Savouries)</span>
                    <span>State: WB (19)</span>
                  </div>
                  <table className="w-full text-left text-[10px] font-mono">
                    <thead className="bg-amber-50 border-b border-amber-200 text-stone-600">
                      <tr>
                        <th className="py-1 px-2.5">HSN Code</th>
                        <th className="py-1 px-2.5 text-right">Taxable Value</th>
                        <th className="py-1 px-2 text-right">CGST (2.5%)</th>
                        <th className="py-1 px-2 text-right">SGST (2.5%)</th>
                        <th className="py-1 px-2.5 text-right">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 px-2.5 font-bold text-stone-800">2106 / 1905</td>
                        <td className="py-1.5 px-2.5 text-right font-semibold text-stone-900">
                          ₹{invoice.taxableAmount.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-stone-700">
                          ₹{invoice.cgstAmount.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-stone-700">
                          ₹{invoice.sgstAmount.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-amber-950">
                          ₹{invoice.totalTaxAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="px-2.5 py-1 bg-amber-100/40 border-t border-amber-200/60 text-[9px] text-stone-500 italic">
                    *Applicable GST: Central GST @ 2.5% + West Bengal SGST @ 2.5% included in item prices.
                  </div>
                </div>

                {/* Amount in words */}
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <span className="font-bold text-stone-600 block text-[10px] uppercase tracking-wider">
                    Total Amount in Words:
                  </span>
                  <p className="font-bold text-stone-900 italic mt-0.5">
                    {invoice.wordsAmount}
                  </p>
                </div>

                {/* Sweet Points Loyalty Banner */}
                {invoice.pointsEarned > 0 && (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                    <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Sweet Points Earned:</span>
                    </span>
                    <span className="font-bold font-mono text-amber-950">
                      +{invoice.pointsEarned} Points Credited
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column (5 cols): Subtotal & Financial Breakdown */}
              <div className="sm:col-span-5 space-y-1.5 text-xs bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
                {/* Subtotal */}
                <div className="flex justify-between py-1 text-stone-700 font-medium">
                  <span>Items Subtotal:</span>
                  <span className="font-mono font-bold text-stone-900">
                    ₹{invoice.grossSubtotal.toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 font-bold bg-emerald-50 px-2 rounded border border-emerald-200">
                    <span>Special Discount (5% Off):</span>
                    <span className="font-mono">-₹{invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Points Redeemed */}
                {invoice.pointsRedeemed > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 font-semibold px-2">
                    <span>Points Discount:</span>
                    <span className="font-mono">-{invoice.pointsRedeemed} pts</span>
                  </div>
                )}

                {/* Net Taxable Value */}
                <div className="flex justify-between py-1 text-stone-600 border-t border-dashed border-stone-300 pt-1.5">
                  <span className="text-[11px]">Net Taxable Value:</span>
                  <span className="font-mono text-stone-800">
                    ₹{invoice.taxableAmount.toFixed(2)}
                  </span>
                </div>

                {/* CGST */}
                <div className="flex justify-between py-0.5 text-stone-600 text-[11px]">
                  <span>CGST (2.5%):</span>
                  <span className="font-mono text-stone-800">
                    ₹{invoice.cgstAmount.toFixed(2)}
                  </span>
                </div>

                {/* SGST */}
                <div className="flex justify-between py-0.5 text-stone-600 text-[11px]">
                  <span>SGST (2.5%):</span>
                  <span className="font-mono text-stone-800">
                    ₹{invoice.sgstAmount.toFixed(2)}
                  </span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between py-1 text-stone-600">
                  <span>Delivery Charge:</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center py-2.5 border-t-2 border-amber-900 text-sm font-black text-amber-950 bg-amber-100/60 px-2 rounded-lg mt-1">
                  <span>Grand Total (₹):</span>
                  <span className="font-mono text-base text-amber-950 font-black">
                    ₹{invoice.finalTotal.toFixed(2)}
                  </span>
                </div>

                <div className="text-[9px] text-right text-stone-500 font-mono">
                  Inclusive of all statutory taxes & GST
                </div>
              </div>
            </div>

            {/* Terms & Authorized Stamp */}
            <div className="mt-6 pt-3 border-t border-stone-300">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                {/* Terms on Left */}
                <div className="text-left space-y-0.5 max-w-sm">
                  <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                    Terms & Conditions:
                  </span>
                  <p className="text-[9.5px] text-stone-500 leading-tight">
                    1. Sweets are prepared daily with pure cow milk chhena & pure desi ghee.
                  </p>
                  <p className="text-[9.5px] text-stone-500 leading-tight">
                    2. Store in refrigerator below 4°C. Best consumed within 48 hours.
                  </p>
                  <p className="text-[9.5px] text-stone-500 leading-tight">
                    3. Perishable food items once delivered cannot be returned or exchanged.
                  </p>
                  <p className="text-[9.5px] text-stone-500 leading-tight">
                    4. Subject to Kaliachak / Malda jurisdiction only.
                  </p>
                </div>

                {/* Signatory on Right */}
                <div className="text-center sm:text-right flex-shrink-0">
                  <div className="w-40 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 pb-1">
                    <span className="text-xs text-amber-900 font-serif italic font-bold">
                      Ghosh Sweet House
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-stone-600 block">
                    Authorized Signatory
                  </span>
                  <span className="text-[9px] text-stone-400 block font-mono">
                    Computer Generated Tax Invoice
                  </span>
                </div>
              </div>

              {/* Bottom Bengali Greeting */}
              <div className="mt-4 pt-2 border-t border-stone-200 text-center">
                <p className="text-xs font-bold text-amber-900 font-bengali">
                  ঘোষ সুইট হাউজে আপনার মিষ্টি মুহূর্ত উদযাপন করার জন্য ধন্যবাদ! আবার দেখা হবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
