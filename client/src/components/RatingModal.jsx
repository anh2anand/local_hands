// client/src/components/RatingModal.jsx
import React, { useState } from 'react';
import { X, Star, CheckCircle2, HeartHandshake } from 'lucide-react';
import { api } from '../api';

export const RatingModal = ({
  isOpen,
  onClose,
  booking,
  currentUserId,
  targetUserId,
  targetUserName,
  targetRole = "worker",
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitRating({
        booking_id: booking.id,
        from_user: currentUserId,
        to_user: targetUserId || (targetRole === 'worker' ? booking.worker_id : booking.customer_id),
        rating: Number(rating),
        comment: comment || (rating >= 4 ? "Excellent and courteous service!" : "Service completed.")
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onRatingSubmitted(res.rating);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Error submitting rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-center">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-500 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-black text-lg">Rate Experience</h3>
          <p className="text-xs text-amber-100">
            How was your experience with {targetUserName || "the skilled partner"}?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Star Selection */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-xs font-bold text-slate-700">
            {rating === 5 && "⭐ Outstanding service & workmanship!"}
            {rating === 4 && "⭐ Great & timely experience"}
            {rating === 3 && "⭐ Satisfactory service"}
            {rating === 2 && "⭐ Below expectations"}
            {rating === 1 && "⭐ Needs major improvement"}
          </div>

          <div>
            <textarea
              rows={3}
              placeholder="Leave a helpful review or feedback for the community..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Thank you! Rating recorded.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md transition cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit Mutual Rating"}
          </button>
        </form>
      </div>
    </div>
  );
};
