// client/src/components/CancelModal.jsx
import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export const CancelModal = ({
  isOpen,
  onClose,
  booking,
  currentUserId,
  userRole = "customer",
  onCancelled
}) => {
  const [reasonCategory, setReasonCategory] = useState('Worker got delayed without intimation');
  const [detailedReason, setDetailedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const categories = [
    "Worker got delayed without intimation",
    "Emergency repaired before arrival",
    "Disagreement over job scope or price",
    "Personal emergency / schedule conflict",
    "Other issue"
  ];

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    const finalReason = `${reasonCategory}: ${detailedReason}`.trim();

    if (finalReason.length < 5) {
      alert("A detailed cancellation reason is required for platform operations review.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.cancelBooking(booking.id, {
        requested_by: currentUserId,
        requester_role: userRole,
        reason: finalReason
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onCancelled(res.booking, res.cancellation);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Cancellation submission failed:", err);
      alert("Error submitting cancellation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-rose-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-black">Cancel Booking</h3>
          </div>
          <p className="text-xs text-rose-100">
            Mandatory operational review required for all active cancellations.
          </p>
        </div>

        <form onSubmit={handleCancelSubmit} className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-950 p-3.5 rounded-2xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              Admin Operations Dispute Protocol
            </div>
            <p className="text-[11px] text-rose-800">
              If mock Escrow payment is locked for this booking (₹{booking.price}), funds will be moved to <strong>DISPUTED</strong> status. An Admin Operator reviews reasons to approve refunds or worker compensation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Reason Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Explanation for Admin <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Please provide specific context (e.g. Worker was unreachable for 2 hours, or problem was resolved independently)..."
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cancellation registered with Admin.
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md cursor-pointer"
            >
              {submitting ? "Processing..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
