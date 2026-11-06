// client/src/views/WorkerView.jsx
import React, { useState, useEffect } from 'react';
import {
  Wrench, CheckCircle2, Clock, MapPin, IndianRupee, Star,
  ShieldCheck, Award, MessageSquare, Phone, Calendar,
  AlertCircle, RefreshCw, XCircle, Tag, Check, ArrowRight, Edit3, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const WorkerView = ({
  currentUser,
  workerProfile,
  refreshWorkerProfile,
  onOpenChat,
  onTriggerCall,
  onOpenRating
}) => {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'active' | 'calendar' | 'profile'
  const [availability, setAvailability] = useState(workerProfile?.availability || 'available');
  const [openJobs, setOpenJobs] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [calendarSlots, setCalendarSlots] = useState(workerProfile?.calendar_slots || []);
  const [loading, setLoading] = useState(true);

  // Response Offer Modal for Marketplace jobs
  const [selectedJobToOffer, setSelectedJobToOffer] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Direct Booking Action Modals
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('Currently busy at this time');
  const [negotiateModalBooking, setNegotiateModalBooking] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterTime, setCounterTime] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  // Worker Profile Edit Modal
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editHourlyRate, setEditHourlyRate] = useState(workerProfile?.hourly_rate || 450);
  const [editExperience, setEditExperience] = useState(workerProfile?.experience || '5 years');
  const [editBio, setEditBio] = useState(workerProfile?.bio || '');
  const [editServiceRadius, setEditServiceRadius] = useState(workerProfile?.service_radius || 5);
  const [editOddJobs, setEditOddJobs] = useState(Boolean(workerProfile?.odd_jobs));
  const [editSkills, setEditSkills] = useState(workerProfile?.skills?.join(', ') || '');

  useEffect(() => {
    if (workerProfile) {
      setAvailability(workerProfile.availability || 'available');
      setCalendarSlots(workerProfile.calendar_slots || []);
      setEditHourlyRate(workerProfile.hourly_rate || 450);
      setEditExperience(workerProfile.experience || '5 years');
      setEditBio(workerProfile.bio || '');
      setEditServiceRadius(workerProfile.service_radius || 5);
      setEditOddJobs(Boolean(workerProfile.odd_jobs));
      setEditSkills(workerProfile.skills?.join(', ') || '');
      loadWorkerData();
    }
  }, [workerProfile]);

  const loadWorkerData = async () => {
    if (!workerProfile) return;
    setLoading(true);
    try {
      // 1. Fetch open marketplace jobs matching worker's trade or Odd Jobs
      const jobsRes = await api.getJobs({ worker_id: workerProfile.id });
      const relevant = (jobsRes.jobs || []).filter(j =>
        j.status === 'OPEN' && (
          j.category.toLowerCase() === workerProfile.trade.toLowerCase() ||
          (workerProfile.odd_jobs && (j.is_odd_job || j.category.toLowerCase() === 'odd jobs'))
        )
      );
      setOpenJobs(relevant);

      // 2. Fetch worker's active and upcoming bookings
      const bookingsRes = await api.getBookings({ worker_id: workerProfile.id });
      setAllBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error("Error loading worker data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter direct booking requests (pending decision)
  const pendingDirectBookings = allBookings.filter(b => b.status === 'REQUESTED' || b.status === 'NEGOTIATING');
  // Confirmed and active jobs
  const activeBookings = allBookings.filter(b => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED'].includes(b.status));

  const handleUpdateAvailability = async (newStatus) => {
    if (!workerProfile) return;
    setAvailability(newStatus);
    try {
      await api.updateAvailability(workerProfile.id, newStatus);
      if (refreshWorkerProfile) refreshWorkerProfile();
    } catch (err) {
      console.error("Error updating availability:", err);
    }
  };

  // Worker Accepts Direct Booking Request
  const handleAcceptDirectBooking = async (bookingId) => {
    try {
      const res = await api.acceptBooking(bookingId);
      if (res.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        alert("🎉 Booking confirmed! Calendar slot locked and Mock Escrow is locked.");
        await loadWorkerData();
        if (refreshWorkerProfile) refreshWorkerProfile();
      }
    } catch (err) {
      console.error("Error accepting booking:", err);
      alert("Failed to accept booking.");
    }
  };

  // Worker Rejects Direct Booking Request
  const handleRejectDirectBooking = async (e) => {
    e?.preventDefault();
    if (!rejectModalBooking) return;
    try {
      const res = await api.rejectBooking(rejectModalBooking.id, { reason: rejectReason });
      if (res.success) {
        alert("Booking request declined. Customer has been notified.");
        setRejectModalBooking(null);
        await loadWorkerData();
        if (refreshWorkerProfile) refreshWorkerProfile();
      }
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert("Failed to decline booking.");
    }
  };

  // Worker Proposes Change / New Time or Price for Direct Booking
  const handleProposeChangeBooking = async (e) => {
    e?.preventDefault();
    if (!negotiateModalBooking) return;
    try {
      const res = await api.negotiateBooking(negotiateModalBooking.id, {
        sender_id: workerProfile.id,
        proposed_price: counterPrice ? Number(counterPrice) : negotiateModalBooking.price,
        proposed_time: counterTime || negotiateModalBooking.time,
        message: counterMessage || `I can come at ${counterTime || negotiateModalBooking.time} for ₹${counterPrice || negotiateModalBooking.price}.`
      });
      if (res.success) {
        alert("Proposed changes sent to customer! Booking status is now NEGOTIATING.");
        setNegotiateModalBooking(null);
        await loadWorkerData();
      }
    } catch (err) {
      console.error("Error proposing change:", err);
      alert("Failed to propose change.");
    }
  };

  // Marketplace Job Offer
  const handleAcceptJobOffer = async (e) => {
    e.preventDefault();
    if (!selectedJobToOffer || !proposedPrice) return;

    setSubmittingOffer(true);
    try {
      const res = await api.respondToJob(selectedJobToOffer.id, {
        worker_id: workerProfile.id,
        proposed_price: Number(proposedPrice),
        proposed_time: proposedTime || selectedJobToOffer.time,
        message: offerMessage || `Namaste! I am available and can do this for ₹${proposedPrice}.`
      });

      if (res.success) {
        alert("Offer sent to customer! The customer will compare and select.");
        setSelectedJobToOffer(null);
        setProposedPrice('');
        setProposedTime('');
        setOfferMessage('');
        loadWorkerData();
      }
    } catch (err) {
      console.error("Error sending offer:", err);
      alert("Failed to send offer.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await api.rejectJob(jobId, workerProfile.id);
      setOpenJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error("Error rejecting job:", err);
    }
  };

  const handleStartJob = async (bookingId) => {
    try {
      await api.startBooking(bookingId);
      loadWorkerData();
    } catch (err) {
      console.error("Error starting booking:", err);
    }
  };

  const handleCompleteJob = async (bookingId) => {
    try {
      const res = await api.completeBooking(bookingId);
      if (res.success) {
        alert("Job marked as COMPLETED! Customer notified for Escrow release approval.");
        loadWorkerData();
      }
    } catch (err) {
      console.error("Error completing booking:", err);
    }
  };

  const handleToggleVerification = async (type) => {
    try {
      const res = await api.toggleVerification(workerProfile.id, type);
      if (res.success) {
        if (refreshWorkerProfile) refreshWorkerProfile();
      }
    } catch (err) {
      console.error("Error toggling verification:", err);
    }
  };

  // Save Worker Profile Updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = editSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.updateProfile(workerProfile.id, {
        hourly_rate: Number(editHourlyRate),
        experience: editExperience,
        bio: editBio,
        service_radius: Number(editServiceRadius),
        odd_jobs: editOddJobs,
        skills: skillsArray
      });
      if (res.success) {
        alert("Profile updated successfully!");
        setEditProfileModalOpen(false);
        if (refreshWorkerProfile) refreshWorkerProfile();
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to update profile.");
    }
  };

  const totalNewRequests = openJobs.length + pendingDirectBookings.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Worker Greeting & KPI Dashboard */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={workerProfile?.avatar || currentUser?.avatar}
            alt={workerProfile?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <Wrench className="w-3.5 h-3.5" /> {t.partnerDashboard}
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              {t.goodMorning}, {workerProfile?.name?.split(' ')[0] || "Partner"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.trades?.[workerProfile?.trade] || workerProfile?.trade} • {workerProfile?.location} • {workerProfile?.jobs_completed || 140} {t.jobsCompleted}
            </p>
          </div>
        </div>

        {/* Live Availability Toggle */}
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl flex flex-col gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t.myAvailabilityStatus}
          </span>
          <div className="flex gap-1.5">
            {[
              { id: 'available', label: t.available, bg: 'bg-emerald-600 text-white' },
              { id: 'busy', label: t.busy, bg: 'bg-amber-600 text-white' },
              { id: 'offline', label: t.offline, bg: 'bg-slate-700 text-slate-300' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => handleUpdateAvailability(status.id)}
                className={`text-xs font-bold py-1.5 px-3 rounded-xl transition cursor-pointer ${
                  availability === status.id ? status.bg : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">{t.newJobRequests}</span>
          <span className="text-2xl font-black text-slate-900">{totalNewRequests}</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
            {pendingDirectBookings.length > 0 ? `⚡ ${pendingDirectBookings.length} direct requests!` : t.readyForOffers}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">{t.confirmedBookingsCount}</span>
          <span className="text-2xl font-black text-slate-900">
            {activeBookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length}
          </span>
          <span className="text-[11px] text-blue-600 block mt-1 font-semibold">Active & Upcoming</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">{t.rating}</span>
          <span className="text-2xl font-black text-slate-900 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            {workerProfile?.rating || 4.8}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1 font-semibold">
            {workerProfile?.reviews_count || 64} {t.reviews}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px] font-bold uppercase block">Government Status</span>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {workerProfile?.verification_status?.eshram?.verified ? `✓ ${t.eshramVerified}` : "Pending Check"}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Prototype Verification</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'requests' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {t.requestsAndMarketplace} ({totalNewRequests})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'active' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {t.activeConfirmedJobs} ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'calendar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {t.manageCalendar}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {t.profileAndVerification}
        </button>
      </div>

      {/* TAB 1: REQUESTS & MARKETPLACE */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* SECTION 1A: DIRECT BOOKING REQUESTS (PRIVATE TO THIS WORKER) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {t.directRequestsTitle} ({pendingDirectBookings.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.directRequestsDesc}
                </p>
              </div>
            </div>

            {pendingDirectBookings.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <p className="text-xs text-slate-500">{t.noDirectRequests}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDirectBookings.map((b) => {
                  const isNegotiating = b.status === 'NEGOTIATING';
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl border-2 border-emerald-400 p-5 shadow-md flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                            📩 Private Direct Request
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isNegotiating ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base">{b.title}</h3>

                        {/* Customer details */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2.5 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{b.customer_name}</span>
                            <span className="text-base font-black text-emerald-700 flex items-center">
                              <IndianRupee className="w-3.5 h-3.5" /> {b.price}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.customer_location}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {b.date} • {b.time}
                          </div>
                          {b.message && b.message !== b.title && (
                            <p className="text-slate-700 italic pt-1 border-t border-slate-200 text-[11px]">
                              "{b.message}"
                            </p>
                          )}
                        </div>

                        {/* Escrow status notice */}
                        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 font-medium">
                          🔒 {t.escrowPending}
                        </div>
                      </div>

                      {/* WORKER ACTION BUTTONS: Accept / Propose Change / Decline / Chat */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenChat({
                              booking_id: b.id,
                              customer_id: b.customer_id,
                              worker_id: workerProfile.id
                            })}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer flex items-center gap-1"
                            title={t.message}
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> {t.message}
                          </button>

                          <button
                            onClick={() => {
                              setNegotiateModalBooking(b);
                              setCounterPrice(b.price);
                              setCounterTime(b.time);
                              setCounterMessage('');
                            }}
                            className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-700" /> {t.proposeAnotherTime}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRejectModalBooking(b);
                              setRejectReason('Currently busy at this requested time');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" /> {t.declineDirectRequest}
                          </button>

                          <button
                            onClick={() => handleAcceptDirectBooking(b.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> {t.acceptDirectRequest}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 1B: OPEN MARKETPLACE JOBS */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">
                Open Marketplace Jobs in Your Radius ({openJobs.length})
              </h2>
              <span className="text-xs text-slate-500">
                Rule 1 & 2: You can respond with counter-offers without becoming busy.
              </span>
            </div>

            {openJobs.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">All caught up on open jobs!</h3>
                <p className="text-xs text-slate-500 mt-1">No pending marketplace posts in your trade right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openJobs.map((job) => {
                  const hasResponded = job.worker_response !== null;
                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                            {t.trades?.[job.category] || job.category}
                          </span>
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location_approx}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{job.description}</p>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Customer Budget</span>
                            <span className="font-black text-slate-900 flex items-center">
                              <IndianRupee className="w-3 h-3 text-slate-600" />
                              {job.budget_min}–{job.budget_max}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Schedule</span>
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {job.date} • {job.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {hasResponded ? (
                          <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> {t.offerSubmitted}
                              </span>
                              <span className="text-[11px] text-emerald-800">
                                {t.proposed}: ₹{job.worker_response.proposed_price} ({job.worker_response.status})
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedJobToOffer(job);
                                setProposedPrice(job.worker_response.proposed_price);
                              }}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                            >
                              {t.updateOffer}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectJob(job.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Reject / Dismiss"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => onOpenChat({
                                job_id: job.id,
                                customer_id: job.customer_id,
                                worker_id: workerProfile.id
                              })}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> {t.negotiate}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedJobToOffer(job);
                                setProposedPrice(job.budget_min);
                              }}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              {t.accept} & Offer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE & CONFIRMED JOBS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-900">
            {t.activeConfirmedJobs} ({activeBookings.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => {
              const isConfirmed = b.status === 'CONFIRMED';
              const isInProgress = b.status === 'IN_PROGRESS';
              const isCompleted = b.status === 'COMPLETED';
              const isApproved = b.status === 'APPROVED';

              return (
                <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">{b.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCompleted
                          ? 'bg-amber-100 text-amber-900'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-900 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{b.title}</h3>

                    {/* Customer Info */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{b.customer_name}</span>
                        <span className="text-sm font-black text-emerald-700">₹{b.price}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {b.customer_location}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {b.date} at {b.time}
                      </div>
                    </div>

                    {/* Escrow status */}
                    <div className="mt-3 bg-teal-50 border border-teal-200 rounded-2xl p-2.5 text-xs text-teal-900 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        Escrow: ₹{b.price} {isApproved ? 'RELEASED' : 'LOCKED'}
                      </span>
                      <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full font-mono">
                        {b.escrow?.upi_ref || "UPI-ESCROW-LOCKED"}
                      </span>
                    </div>
                  </div>

                  {/* Operational buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpenChat({
                        booking_id: b.id,
                        customer_id: b.customer_id,
                        worker_id: workerProfile.id
                      })}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {t.message}
                    </button>

                    <button
                      onClick={() => onTriggerCall({
                        name: b.customer_name,
                        mobile: b.customer_mobile,
                        trade: t.customer
                      })}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {t.call}
                    </button>

                    {/* Status change actions */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleStartJob(b.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        {t.startWork}
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleCompleteJob(b.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {t.markCompleted}
                      </button>
                    )}

                    {isCompleted && (
                      <div className="w-full bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-xl text-center text-xs font-bold">
                        ⏳ Awaiting Customer Approval to Release Escrow
                      </div>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => onOpenRating(b, b.customer_id, b.customer_name, 'customer')}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-900" /> {t.rateCustomer}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR MANAGEMENT */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Worker Calendar & Slot Locks</h2>
              <p className="text-xs text-slate-500">
                Rule 8 & 9: Confirmed bookings lock their respective time slot to prevent double-booking.
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold">
              {calendarSlots.filter(s => s.status === 'booked').length} Slots Locked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {calendarSlots.map((slot, idx) => {
              const isBooked = slot.status === 'booked';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition ${
                    isBooked
                      ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                      : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{slot.date}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isBooked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {isBooked ? 'BUSY / LOCKED' : 'AVAILABLE'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {slot.time}
                  </div>
                  {slot.booking_id && (
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">
                      Ref: {slot.booking_id}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & VERIFICATIONS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Government Verification Sandbox Card */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-teal-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-700" />
                  Government & Skilled Worker Verifications
                </h3>
                <p className="text-xs text-teal-800">
                  Interactive Prototype Sandbox: Toggle verification states to test customer badge updates!
                </p>
              </div>
              <span className="text-xs bg-teal-200 text-teal-900 px-3 py-1 rounded-full font-bold">
                {t.prototypeSandbox}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* e-SHRAM Card */}
              <div className="bg-white p-4 rounded-2xl border border-teal-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">e-SHRAM Verification</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      workerProfile?.verification_status?.eshram?.verified
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {workerProfile?.verification_status?.eshram?.verified ? 'Verified (Prototype)' : 'Unverified'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    National database for unorganized skilled laborers with 12-digit UAN.
                  </p>
                  {workerProfile?.verification_status?.eshram?.uan && (
                    <div className="text-xs font-mono font-bold text-teal-800 mt-2 bg-teal-50 p-2 rounded-lg">
                      UAN: {workerProfile.verification_status.eshram.uan}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleToggleVerification('eshram')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                >
                  Toggle e-SHRAM Status
                </button>
              </div>

              {/* PM Vishwakarma Card */}
              <div className="bg-white p-4 rounded-2xl border border-blue-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">PM Vishwakarma Scheme</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      workerProfile?.verification_status?.pm_vishwakarma?.verified
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {workerProfile?.verification_status?.pm_vishwakarma?.verified ? 'Certified (Prototype)' : 'Unverified'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Traditional artisan and skilled craftsman certification & modern tool support.
                  </p>
                  {workerProfile?.verification_status?.pm_vishwakarma?.cert_id && (
                    <div className="text-xs font-mono font-bold text-blue-800 mt-2 bg-blue-50 p-2 rounded-lg">
                      Cert ID: {workerProfile.verification_status.pm_vishwakarma.cert_id}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleToggleVerification('pm_vishwakarma')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                >
                  Toggle PM Vishwakarma Status
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details Card with Edit Trigger */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Trade Profile Information</h3>
              <button
                onClick={() => setEditProfileModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> {t.editProfile}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Trade</span>
                <span className="font-bold text-slate-900 text-sm">
                  {t.trades?.[workerProfile?.trade] || workerProfile?.trade}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Standard Hourly Rate</span>
                <span className="font-bold text-slate-900 text-sm">₹{workerProfile?.hourly_rate}/hr</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
                <span className="font-bold text-slate-900 text-sm">{workerProfile?.experience}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Odd Jobs Service</span>
                <span className="font-bold text-slate-900 text-sm">
                  {workerProfile?.odd_jobs ? '✓ Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {workerProfile?.bio && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">About & Bio</span>
                <p className="text-xs text-slate-700 mt-0.5">{workerProfile.bio}</p>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">Specialized Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {workerProfile?.skills?.map((s, i) => (
                  <span key={i} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-rose-600 p-5 text-white relative">
              <button
                onClick={() => setRejectModalBooking(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-black text-lg">Decline Request</h3>
              <p className="text-xs text-rose-100">{rejectModalBooking.title}</p>
            </div>

            <form onSubmit={handleRejectDirectBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Declining
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Currently busy at this time">Currently busy at this time</option>
                  <option value="Outside my service area today">Outside my service area today</option>
                  <option value="Do not have required tools for this specific job">Do not have required tools for this specific job</option>
                  <option value="Emergency personal leave">Emergency personal leave</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalBooking(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Change / Counter-Terms Modal for Direct Booking */}
      {negotiateModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-amber-600 p-5 text-white relative">
              <button
                onClick={() => setNegotiateModalBooking(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-black text-lg">Propose Change / Counter-Offer</h3>
              <p className="text-xs text-amber-100">{negotiateModalBooking.title}</p>
            </div>

            <form onSubmit={handleProposeChangeBooking} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Proposed Price (₹)
                  </label>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder={negotiateModalBooking.price}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Proposed Time
                  </label>
                  <input
                    type="text"
                    value={counterTime}
                    onChange={(e) => setCounterTime(e.target.value)}
                    placeholder="e.g. Tomorrow 04:00 PM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message to Customer
                </label>
                <textarea
                  rows={2}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. I have another job in the morning, can visit at 4 PM instead."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNegotiateModalBooking(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Submission Dialog Modal for Marketplace Job */}
      {selectedJobToOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-600 p-5 text-white relative">
              <button
                onClick={() => setSelectedJobToOffer(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <h3 className="font-black text-lg">Send Job Offer</h3>
              <p className="text-xs text-emerald-100">{selectedJobToOffer.title}</p>
            </div>

            <form onSubmit={handleAcceptJobOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Proposed Price (Customer Budget: ₹{selectedJobToOffer.budget_min}–{selectedJobToOffer.budget_max})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Visit Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow at 10:30 AM"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message to Customer (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. I have proper tools and can complete within 1 hour."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobToOffer(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  {submittingOffer ? "Sending..." : "Send Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-5 text-white relative">
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-black text-lg">{t.editProfile}</h3>
              <p className="text-xs text-slate-300">Update rates, skills, service radius, and bio</p>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standard Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    value={editServiceRadius}
                    onChange={(e) => setEditServiceRadius(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Years of Field Experience
                </label>
                <input
                  type="text"
                  value={editExperience}
                  onChange={(e) => setEditExperience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specialized Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Tap Repair, Pipe Fitting, Geyser"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  About & Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Briefly describe your experience and work quality..."
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  id="oddJobsToggle"
                  checked={editOddJobs}
                  onChange={(e) => setEditOddJobs(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="oddJobsToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Accept Odd Jobs / Quick Chores (Move Furniture, Minor Fixes)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  {t.saveProfile}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
