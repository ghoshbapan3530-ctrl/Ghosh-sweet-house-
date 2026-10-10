import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare, Sparkles, Send, Heart, RefreshCw } from 'lucide-react';
import { OrderHistoryItem, OrderFeedback } from '../types';
import { useShop } from '../context/ShopContext';

interface PostOrderFeedbackModalProps {
  order: OrderHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMPLIMENT_TAGS = [
  { id: 'taste', bn: '🌟 খাঁটি ও অতুলনীয় স্বাদ', en: '🌟 Authentic Taste' },
  { id: 'fresh', bn: '🍯 তাজা ও নরম মিষ্টি', en: '🍯 Fresh Sweets' },
  { id: 'delivery', bn: '⚡ দ্রুত ডেলিভারি', en: '⚡ Fast Delivery' },
  { id: 'packaging', bn: '🎁 চমৎকার প্যাকেজিং', en: '🎁 Superb Packaging' },
  { id: 'behavior', bn: '😊 অমায়িক ব্যবহার', en: '😊 Courteous Service' },
  { id: 'value', bn: '💰 সঠিক মূল্য', en: '💰 Great Value' }
];

const RATING_LABELS = {
  1: { bn: 'খারাপ (Poor)', en: 'Poor' },
  2: { bn: 'মোটামুটি (Fair)', en: 'Fair' },
  3: { bn: 'ভালো (Good)', en: 'Good' },
  4: { bn: 'খুব ভালো (Very Good)', en: 'Very Good' },
  5: { bn: 'অসাধারণ! (Outstanding!)', en: 'Outstanding!' }
};

export const PostOrderFeedbackModal: React.FC<PostOrderFeedbackModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { language, theme, submitOrderFeedback, currentCustomer } = useShop();
  const isDark = theme === 'dark';

  const existingFeedback: OrderFeedback | undefined = order.feedback;

  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFeedback?.tags || ['🌟 খাঁটি ও অতুলনীয় স্বাদ']);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [customerName, setCustomerName] = useState<string>(
    existingFeedback?.customerName || currentCustomer?.name || order.customerName || 'Customer'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tagText: string) => {
    setSelectedTags(prev =>
      prev.includes(tagText) ? prev.filter(t => t !== tagText) : [...prev, tagText]
    );
  };

  const activeRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[activeRating as keyof typeof RATING_LABELS] || RATING_LABELS[5];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে ১ থেকে ৫ স্টার রেটিং বেছে নিন।' : 'Please choose a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitOrderFeedback(order.id, {
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        customerName: customerName.trim()
      });

      if (res.success) {
        setSubmittedSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1600);
      } else {
        setErrorMessage(res.error || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      id={`feedback-modal-${order.id}`}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl overflow-hidden border shadow-2xl transition-all duration-300 ${
          isDark
            ? 'bg-[#180E08] border-amber-500/30 text-amber-50'
            : 'bg-white border-amber-900/15 text-stone-900'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-950/20 hover:bg-stone-950/30 text-stone-950 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-stone-950 text-amber-300 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{language === 'bn' ? 'পোস্ট-অর্ডার অভিজ্ঞতা রেটিং' : 'Order Experience Feedback'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-900/20 text-stone-950 font-bold border border-stone-950/20">
              #{order.id}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-serif leading-tight">
            {language === 'bn' ? 'মিষ্টি কেমন লাগলো? জানান!' : 'How Was Your Sweet Experience?'}
          </h3>
          <p className="text-xs font-semibold text-stone-950/85 mt-1 font-bengali">
            {language === 'bn'
              ? 'আপনার মিষ্টি সফলভাবে পৌঁছেছে! আপনার সৎ মতামত আমাদের মিষ্টির গুণমান আরও উন্নত করতে সাহায্য করবে।'
              : 'Your order was delivered! Your honest rating helps us preserve authentic Bengal sweet heritage.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {submittedSuccess ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold font-serif text-amber-400">
                {language === 'bn' ? 'ধন্যবাদ! আপনার রেটিং সফলভাবে জমা হয়েছে' : 'Thank You! Your Review Is Recorded'}
              </h4>
              <p className="text-xs text-stone-300 max-w-sm mx-auto font-bengali">
                {language === 'bn'
                  ? 'ঘোষ সুইট হাউস-এর প্রতি আপনার ভালোবাসার জন্য আমরা কৃতজ্ঞ। আবার মিষ্টির স্বাদ উপভোগ করুন!'
                  : 'We are deeply grateful for your patronage. Enjoy authentic taste from Ghosh Sweet House!'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star Rating Section */}
              <div className="text-center space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {language === 'bn' ? '১. স্টার রেটিং নির্বাচন করুন' : '1. Select Star Rating'}
                </label>

                {/* Stars Row */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starNum) => {
                    const isFilled = starNum <= activeRating;
                    return (
                      <button
                        key={starNum}
                        type="button"
                        onClick={() => setRating(starNum)}
                        onMouseEnter={() => setHoverRating(starNum)}
                        onMouseLeave={() => setHoverRating(0)}
                        id={`star-btn-${starNum}`}
                        className="p-1.5 sm:p-2 transition-all transform hover:scale-125 focus:outline-none"
                        title={`${starNum} Stars`}
                      >
                        <Star
                          className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                              : 'text-stone-600 hover:text-stone-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating Qualitative Label */}
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-bengali">
                  {language === 'bn' ? ratingInfo.bn : ratingInfo.en}
                </div>
              </div>

              {/* Compliments / Tags Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {language === 'bn' ? '২. আপনার অভিজ্ঞতা কেমন ছিল? (ট্যাপ করে সিলেক্ট করুন)' : '2. What did you like best? (Tap to select)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPLIMENT_TAGS.map((tag) => {
                    const label = language === 'bn' ? tag.bn : tag.en;
                    const isSelected = selectedTags.includes(tag.bn) || selectedTags.includes(tag.en);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(language === 'bn' ? tag.bn : tag.en)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border active:scale-95 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                            : isDark
                            ? 'bg-stone-900 border-stone-800 text-stone-300 hover:border-amber-500/50'
                            : 'bg-stone-100 border-stone-200 text-stone-700 hover:border-amber-400'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Text Comment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? '৩. কোনো বিশেষ মন্তব্য (ঐচ্ছিক)' : '3. Feedback Comments (Optional)'}</span>
                  </label>
                  <span className="text-[11px] text-stone-500">{comment.length}/300</span>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder={
                    language === 'bn'
                      ? 'মিষ্টির স্বাদ, মিষ্টির গুণমান বা ডেলিভারি সম্পর্কে আপনার মতামত লিখুন...'
                      : 'Tell us how the sweets tasted or how we can make your next order even sweeter...'
                  }
                  className={`w-full p-3 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-400 block">
                  {language === 'bn' ? 'আপনার নাম:' : 'Your Name:'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Your Name"
                  className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-100'
                      : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold text-xs transition-colors"
                >
                  {language === 'bn' ? 'পরে দেব' : 'Maybe Later'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="submit-feedback-btn"
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'রেটিং জমা দিন' : 'Submit Feedback'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
