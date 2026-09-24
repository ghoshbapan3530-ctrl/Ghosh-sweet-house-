import React from 'react';
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
  FileText
} from 'lucide-react';
import { OrderHistoryItem, Language, ThemeMode } from '../types';

interface InvoiceModalProps {
  order: OrderHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
}

// Convert numbers to Indian Rupees in words
function numberToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

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

  let crore = Math.floor(rounded / 10000000);
  let lakh = Math.floor((rounded % 10000000) / 100000);
  let thousand = Math.floor((rounded % 100000) / 1000);
  let remainder = rounded % 1000;

  let words = '';
  if (crore) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder) words += convertThreeDigits(remainder);

  return 'Rupees ' + words.trim() + ' Only';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  language,
  theme
}) => {
  if (!isOpen || !order) return null;

  const isDark = theme === 'dark';

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.subtotal || order.finalTotal;
  const discountVal = order.discountAmount || order.newCustomerDiscount || (order.subtotal > order.finalTotal ? order.subtotal - order.finalTotal : 0);
  const wordsAmount = numberToWords(order.finalTotal);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      id="invoice-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      {/* Printable Invoice Wrapper */}
      <div className="w-full max-w-3xl max-h-[96vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top Floating Control Bar (Hidden on Print) */}
        <div className="no-print bg-stone-900 border-b border-amber-500/30 p-3 sm:p-4 flex items-center justify-between text-stone-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-bengali text-amber-300">
                {language === 'bn' ? 'অর্ডার রসিদ / ইনভয়েস' : 'Order Invoice & Cash Memo'}
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                #{order.id} • {order.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              id="print-invoice-action-btn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF সেভ করুন' : 'Print / Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              id="close-invoice-modal-btn"
              className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Sheet */}
        <div className="overflow-y-auto p-3 sm:p-6 bg-stone-950/70 flex-1 flex justify-center">
          <div
            id="printable-invoice-container"
            className="w-full bg-white text-stone-900 rounded-2xl shadow-xl p-5 sm:p-8 border border-stone-200 text-xs font-sans leading-relaxed"
            style={{ minHeight: '680px' }}
          >
            {/* Header: Shop Info & Title */}
            <div className="border-b-2 border-stone-800 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍯</span>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-900 uppercase font-serif">
                        GHOSH SWEET HOUSE
                      </h1>
                      <h2 className="text-xs font-bold text-amber-800 font-bengali">
                        ঘোষ সুইট হাউজ — ঐতিহ্য ও বিশুদ্ধতার প্রতীক (Estd. 1978)
                      </h2>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1.5 max-w-sm">
                    Main Road, Kaliachak, Malda, West Bengal — Pin: 732201
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5 font-mono">
                    Phone: +91 97330 00000 • Email: orders@ghoshsweethouse.in
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    FSSAI Lic. No: <strong>12821013000192</strong> • Trade Lic: <strong>WB/MLD/KC-4491</strong>
                  </p>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                  <span className="inline-block px-3 py-1 rounded bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-wider border border-amber-300">
                    TAX INVOICE / CASH MEMO
                  </span>
                  <div className="mt-2 space-y-0.5 text-[11px] font-mono">
                    <p>
                      Invoice No: <strong className="text-amber-900">#{order.id}</strong>
                    </p>
                    <p>
                      Date: <strong>{order.date}</strong>
                    </p>
                    <p>
                      Order Type:{' '}
                      <span className="font-semibold text-stone-700">
                        {order.orderType === 'takeaway' ? 'Store Takeaway' : 'Home Delivery'}
                      </span>
                    </p>
                    <p>
                      Status:{' '}
                      <span className="font-bold text-emerald-700">
                        {order.status || 'Delivered'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Billing Information Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  Billed & Delivered To:
                </span>
                <p className="font-bold text-stone-900 text-sm">
                  {order.customerName || 'Valued Customer / সম্মানিত গ্রাহক'}
                </p>
                {order.customerPhone && (
                  <p className="text-stone-700 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{order.customerPhone}</span>
                  </p>
                )}
                {order.deliveryAddress && (
                  <p className="text-stone-600 mt-1 flex items-start gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </p>
                )}
              </div>

              <div className="sm:text-right sm:border-l sm:border-stone-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                  Payment Details:
                </span>
                <p className="font-semibold text-stone-800">
                  Method: <strong className="text-stone-900">{order.paymentMethod || 'Cash on Delivery (নগদ)'}</strong>
                </p>
                <p className="text-emerald-700 font-bold mt-0.5 flex items-center sm:justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Verified / Counter Pay</span>
                </p>
                {order.specialNote && (
                  <p className="text-[11px] text-stone-600 italic mt-1 bg-white p-1.5 rounded border border-stone-200">
                    Note: "{order.specialNote}"
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-stone-300 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/80 border-b border-stone-300 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Portion</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => {
                      const lineTotal = (item.price * item.quantity).toFixed(2);
                      return (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 text-center text-stone-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-stone-900 block">
                              {item.product?.nameEn || 'Ghosh Sweet Item'}
                            </span>
                            {item.product?.nameBn && (
                              <span className="text-[11px] text-stone-500 font-bengali block">
                                {item.product.nameBn}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center text-stone-600 text-[11px]">
                            {item.selectedPortion}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-stone-900">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-stone-900">
                            ₹{lineTotal}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-stone-500">
                        Traditional Sweets & Snacks Order
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Total Summary */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 border-t-2 border-stone-800 pt-3">
              <div className="flex-1 space-y-2">
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                    Amount in Words:
                  </span>
                  <p className="font-bold text-stone-800 italic mt-0.5">
                    {wordsAmount}
                  </p>
                </div>

                <div className="text-[10px] text-stone-500 space-y-0.5 pt-1">
                  <p>• Goods once sold cannot be returned due to food safety regulations.</p>
                  <p>• Store fresh sweets in refrigerator below 4°C. Consume within 48 hours.</p>
                  <p>• GST inclusive where applicable. Pure Ghee & Natural Ingredients Guaranteed.</p>
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between py-1 text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountVal > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 font-bold bg-emerald-50 px-2 rounded">
                    <span>5% Special Discount:</span>
                    <span className="font-mono">-₹{discountVal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 text-stone-600">
                  <span>Delivery Charge:</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between py-2 border-t-2 border-stone-800 text-sm font-black text-amber-950">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-amber-900">
                    ₹{order.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Authorized Signature Stamp */}
            <div className="mt-8 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
                  Computer Generated Invoice
                </span>
                <p className="text-[11px] font-semibold text-stone-700 font-bengali">
                  ঘোষ সুইট হাউজ — ধন্যবাদ! মিষ্টি মুখে আবার দেখা হবে।
                </p>
              </div>

              <div className="text-center sm:text-right">
                <div className="w-36 h-10 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center">
                  <span className="text-[11px] text-amber-800 font-serif italic font-bold">
                    Ghosh Sweets
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-500">
                  Authorized Signatory
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
