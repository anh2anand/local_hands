import React, { useState } from 'react';
import { X, Star, MapPin, ShieldCheck, Award, Wrench, IndianRupee, Clock, Calendar, CheckCircle2, MessageSquare, Phone } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const WorkerDetailsModal = ({
  isOpen,
  onClose,
  worker,
  currentUserId,
  onBookingCreated,
  onStartChat
}) => {
  const { t } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!isOpen || !worker) return null;

  const handleBookSlot = async (e) => {
    e?.preventDefault();
    if (!taskTitle.trim()) {
      alert("Please describe your required service/task.");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.createBooking({
        customer_id: currentUserId || "cust_1",
        worker_id: worker.id,
        title: taskTitle,
        price: worker.hourly_rate || 400,
        date: selectedSlot ? selectedSlot.date : "Tomorrow",
        time: selectedSlot ? selectedSlot.time : "10:00 AM - 12:00 PM"
      });

      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          onBookingCreated(res.booking);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking request failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Cover / Header */}
        <div className="bg-linear-to-r from-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{worker.name}</h2>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {worker.availability === 'available' ? 'Available' : 'Busy'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium flex items-center gap-1.5 mt-0.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-300" />
                {worker.trade} {worker.odd_jobs && '• Odd Jobs'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="flex items-center gap-1 bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-bold">
                  <Star className="w-3.5 h-3.5 fill-slate-900" /> {worker.rating}
                </span>
                <span className="text-emerald-100">({worker.reviews_count || 45} reviews)</span>
                <span>•</span>
                <span className="text-emerald-100">{worker.jobs_completed || 120} jobs done</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Prototype Verification Credentials Box */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" /> Government & Skill Verifications
              </span>
              <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                Prototype Sandbox
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
              {worker.verification_status?.eshram?.verified ? (
                <div className="bg-white p-2.5 rounded-xl border border-teal-200 space-y-0.5">
                  <div className="font-bold text-teal-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> e-SHRAM Verified
                  </div>
                  <div className="text-[11px] font-mono text-slate-600">
                    {worker.verification_status.eshram.uan}
                  </div>
                  <div className="text-[10px] text-teal-700 font-medium">e-SHRAM Verification — Prototype</div>
                </div>
              ) : (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400">
                  e-SHRAM Verification: Pending
                </div>
              )}

              {worker.verification_status?.pm_vishwakarma?.verified ? (
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-0.5">
                  <div className="font-bold text-blue-950 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" /> PM Vishwakarma Certified
                  </div>
                  <div className="text-[11px] font-mono text-slate-600">
                    {worker.verification_status.pm_vishwakarma.cert_id}
                  </div>
                  <div className="text-[10px] text-blue-700 font-medium">PM Vishwakarma — Prototype</div>
                </div>
              ) : (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400">
                  PM Vishwakarma: In Progress
                </div>
              )}
            </div>
          </div>

          {/* Bio & Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About & Experience</h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {worker.bio || "Dedicated professional skilled in home repairs, installations, and quick fixes."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
              <span className="text-sm font-bold text-slate-900">{worker.experience}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Standard Rate</span>
              <span className="text-sm font-bold text-slate-900 flex items-center justify-center">
                <IndianRupee className="w-3 h-3 text-slate-500" /> {worker.hourly_rate}/hr
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-medium">Service Radius</span>
              <span className="text-sm font-bold text-slate-900">{worker.service_radius || 5} km</span>
            </div>
          </div>

          {/* Languages & Skills */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills & Specializations</h4>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills?.map((skill, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Calendar Slots */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" /> Select an Available Time Slot
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {worker.calendar_slots?.map((slot, idx) => {
                const isBooked = slot.status === 'booked';
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition cursor-pointer ${
                      isBooked
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                        : 'bg-white hover:bg-emerald-50/50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{slot.date}</span>
                      {isBooked ? (
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">BUSY</span>
                      ) : (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>OPEN</span>
                      )}
                    </div>
                    <div className="text-[11px] mt-0.5 flex items-center gap-1 opacity-90">
                      <Clock className="w-3 h-3" /> {slot.time}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Booking Form */}
          <form onSubmit={handleBookSlot} className="space-y-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Describe the repair or job required:
              </label>
              <input
                type="text"
                placeholder="e.g. Tap leaking in kitchen / Install ceiling fan"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onStartChat(worker);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 px-4 rounded-xl transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-slate-600" /> {t.chatFirst}
              </button>

              <button
                type="submit"
                disabled={bookingLoading || bookingSuccess}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {bookingSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" /> Request Sent!
                  </>
                ) : (
                  <>
                    Request Direct Booking (₹{worker.hourly_rate || 400})
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              ℹ️ Direct booking sends a request. The worker has full control to Accept, Decline, or Propose another time. Escrow locks only after acceptance.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
