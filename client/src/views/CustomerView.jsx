// client/src/views/CustomerView.jsx
import React, { useState, useEffect } from 'react';
import {
  Mic, Search, PlusCircle, Wrench, Zap, Hammer, Paintbrush, Sparkles,
  ShieldCheck, Star, MapPin, IndianRupee, Clock, CheckCircle2, AlertCircle,
  MessageSquare, Phone, ChevronRight, Filter, RefreshCw, ThumbsUp, XCircle, Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { WorkerCard } from '../components/WorkerCard';
import { useAuth } from '../context/AuthContext';

export const CustomerView = ({
  currentUser,
  onOpenVoiceModal,
  onOpenPostJob,
  onOpenInstantMatch,
  onViewWorker,
  onDirectBook,
  onOpenChat,
  onTriggerCall,
  onOpenCancel,
  onOpenRating
}) => {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'my_jobs' | 'bookings'
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState('');

  // Jobs and Bookings
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobForReview, setSelectedJobForReview] = useState(null);
  const [jobResponses, setJobResponses] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const trades = [
    { name: "All", icon: Wrench },
    { name: "Electrician", icon: Zap },
    { name: "Plumber", icon: Wrench },
    { name: "Carpenter", icon: Hammer },
    { name: "Painter", icon: Paintbrush },
    { name: "Cleaner", icon: Sparkles },
    { name: "Odd Jobs", icon: Users },
    { name: "AC Technician", icon: Wrench },
    { name: "Appliance Repair", icon: Wrench },
    { name: "Mason", icon: Hammer },
    { name: "Gardener", icon: Sparkles }
  ];

  useEffect(() => {
    loadWorkers();
    loadMyJobs();
    loadMyBookings();
  }, [selectedTrade, availableOnly, verifiedOnly, minRating]);

  const loadWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const params = {};
      if (selectedTrade !== 'All') params.trade = selectedTrade;
      if (searchQuery) params.search = searchQuery;
      if (availableOnly) params.available_only = 'true';
      if (verifiedOnly) params.verified_only = 'true';
      if (minRating) params.min_rating = minRating;

      const res = await api.getWorkers(params);
      setWorkers(res.workers || []);
    } catch (err) {
      console.error("Error loading workers:", err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const loadMyJobs = async () => {
    try {
      const res = await api.getJobs({ customer_id: currentUser?.id || "cust_1" });
      setMyJobs(res.jobs || []);
      // If a job is currently viewed, refresh its responses too
      if (selectedJobForReview) {
        handleViewJobResponses(selectedJobForReview.id);
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
    }
  };

  const loadMyBookings = async () => {
    try {
      const res = await api.getBookings({ customer_id: currentUser?.id || "cust_1" });
      setMyBookings(res.bookings || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadWorkers(), loadMyJobs(), loadMyBookings()]);
    setRefreshing(false);
  };

  const handleViewJobResponses = async (jobId) => {
    try {
      const res = await api.getJob(jobId);
      setSelectedJobForReview(res.job);
      setJobResponses(res.responses || []);
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  };

  // Customer selects a worker from responses
  const handleSelectWorker = async (jobId, workerId) => {
    try {
      const res = await api.selectWorker(jobId, workerId);
      if (res.success) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        alert(`🎉 Booking confirmed with ${res.selected_worker}! Escrow locked.`);
        await loadMyJobs();
        await loadMyBookings();
        setActiveTab('bookings');
      }
    } catch (err) {
      console.error("Error selecting worker:", err);
      alert("Failed to confirm worker selection.");
    }
  };

  // Customer approves completed work & releases escrow payment!
  const handleApproveWork = async (bookingId) => {
    try {
      const res = await api.approveBooking(bookingId);
      if (res.success) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        alert("🎉 Work approved! Escrow payment has been released to the worker.");
        await loadMyBookings();
      }
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Error approving booking.");
    }
  };

  // Customer accepts worker's proposed counter-terms for direct booking
  const handleConfirmAgreement = async (bookingId, agreedPrice, agreedTime) => {
    try {
      const res = await api.confirmBookingAgreement(bookingId, {
        agreed_price: agreedPrice,
        agreed_time: agreedTime
      });
      if (res.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        alert("🎉 Booking confirmed with agreed terms! Worker calendar and mock escrow are now locked.");
        await loadMyBookings();
      }
    } catch (err) {
      console.error("Error confirming agreement:", err);
      alert("Error confirming agreement.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Voice-First Hero */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> India's Unorganized Skilled Labor Network
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            How can LocalHands help you today?
          </h1>
          <p className="text-sm sm:text-base text-emerald-100">
            Connect directly with verified local plumbers, electricians, carpenters, painters, and odd jobs helpers.
          </p>

          {/* Large Voice Action Trigger (Section 5 Spec) */}
          <div className="pt-2">
            <button
              onClick={onOpenVoiceModal}
              className="bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm sm:text-base px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center transition">
                <Mic className="w-5 h-5 animate-bounce" />
              </div>
              <div className="text-left">
                <div className="font-black text-slate-900 flex items-center gap-2">
                  🎙️ Ask LocalHands
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    Bhashini AI
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-normal">
                  "I need a plumber tomorrow morning" • Hindi / English
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Background decorative artwork */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:flex items-center justify-center">
          <Wrench className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('explore')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer shadow-xs ${
            activeTab === 'explore'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <Search className="w-4 h-4" />
          </div>
          <div className="text-xs font-extrabold">{t.findWorkers}</div>
          <div className="text-[11px] text-slate-500 font-medium">Browse verified profiles</div>
        </button>

        <button
          onClick={() => onOpenPostJob(false)}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div className="text-xs font-extrabold text-slate-900">{t.postJob}</div>
          <div className="text-[11px] text-slate-500 font-medium">Receive worker offers</div>
        </button>

        <button
          onClick={() => onOpenPostJob(true)}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xs font-extrabold text-slate-900">{t.trades?.["Odd Jobs"] || "Odd Jobs"}</div>
          <div className="text-[11px] text-slate-500 font-medium">Move cupboard, assemble</div>
        </button>

        <button
          onClick={onOpenInstantMatch}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition cursor-pointer shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-extrabold text-slate-900">{t.findSomeoneForMe}</div>
          <div className="text-[11px] text-slate-500 font-medium">AI instant match</div>
        </button>
      </div>

      {/* Main Tab Controller */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t.findWorkers} ({workers.length})
          </button>
          <button
            onClick={() => setActiveTab('my_jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
              activeTab === 'my_jobs'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t.myJobsMarketplace}
            {myJobs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
                {myJobs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
              activeTab === 'bookings'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t.activeBookings}
            {myBookings.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-extrabold">
                {myBookings.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={refreshing}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* TAB 1: EXPLORE WORKERS */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Popular Trade Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {trades.map((tr, idx) => {
              const Icon = tr.icon;
              const isSelected = selectedTrade.toLowerCase() === tr.name.toLowerCase();
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTrade(tr.name)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.trades?.[tr.name] || tr.name}
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadWorkers()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                {t.availableOnly}
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t.verifiedOnly}
              </label>

              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any Rating</option>
                <option value="4.5">⭐ 4.5+ Stars</option>
                <option value="4.8">⭐ 4.8+ Stars</option>
              </select>
            </div>
          </div>

          {/* Workers Grid */}
          {loadingWorkers ? (
            <div className="text-center py-12 text-slate-400 font-medium text-xs">
              Loading verified skilled workers...
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No workers found matching your filters</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the trade or search terms.</p>
              <button
                onClick={() => {
                  setSelectedTrade('All');
                  setSearchQuery('');
                  setAvailableOnly(false);
                  setVerifiedOnly(false);
                  setMinRating('');
                }}
                className="mt-3 text-xs bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((w) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  onViewDetails={onViewWorker}
                  onDirectBook={onDirectBook}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY POSTED JOBS & OFFERS COMPARISON */}
      {activeTab === 'my_jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Marketplace Jobs & Worker Responses</h2>
              <p className="text-xs text-slate-500">
                Compare responses from nearby workers. <strong>Customer always has the final choice.</strong>
              </p>
            </div>
            <button
              onClick={() => onOpenPostJob(false)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Post New Job
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: List of Posted Jobs */}
            <div className="space-y-3">
              {myJobs.map((job) => {
                const isSelected = selectedJobForReview?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => handleViewJobResponses(job.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {job.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        job.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{job.description}</p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Budget: ₹{job.budget_min}–{job.budget_max}</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        {job.responses_count || 0} Responses <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Side-by-Side Worker Response Comparison View (Section 16 Spec) */}
            <div className="lg:col-span-2">
              {selectedJobForReview ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comparing Offers for</span>
                    <h3 className="text-lg font-black text-slate-900">{selectedJobForReview.title}</h3>
                    <p className="text-xs text-slate-500">{selectedJobForReview.date} • {selectedJobForReview.time} • Budget: ₹{selectedJobForReview.budget_min}–{selectedJobForReview.budget_max}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      {jobResponses.length} Workers Responded
                    </span>
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                      Select 1 worker to confirm & close others automatically
                    </span>
                  </div>

                  {jobResponses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium">
                      Waiting for nearby workers to review and submit offers...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {jobResponses.map((resp) => {
                        const isSelected = resp.status === 'SELECTED';
                        const isClosed = resp.status === 'CLOSED';
                        return (
                          <div
                            key={resp.id}
                            className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300'
                                : isClosed
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-white border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-extrabold text-slate-900 text-sm">{resp.worker_name}</h4>
                                  <p className="text-xs text-slate-500">{resp.worker_trade}</p>
                                </div>
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  {resp.worker_rating}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-medium">Proposed Price</span>
                                  <span className="text-base font-black text-slate-900 flex items-center">
                                    <IndianRupee className="w-3.5 h-3.5" /> {resp.proposed_price}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block font-medium">Distance</span>
                                  <span className="text-xs font-bold text-slate-700">
                                    📍 {resp.worker_distance || 1.4} km away
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-700 italic mt-2.5 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                "{resp.message}"
                              </p>
                              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" /> {resp.proposed_time}
                              </div>
                            </div>

                            {/* Response Actions (Section 16 Spec) */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                              {isSelected ? (
                                <span className="w-full text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-2 rounded-xl flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Worker Selected & Booking Active
                                </span>
                              ) : isClosed ? (
                                <span className="w-full text-center text-xs font-medium text-slate-400 py-1.5">
                                  Offer Closed
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onOpenChat({
                                      job_id: selectedJobForReview.id,
                                      customer_id: currentUser?.id || "cust_1",
                                      worker_id: resp.worker_id
                                    })}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                                  </button>
                                  <button
                                    onClick={() => handleSelectWorker(selectedJobForReview.id, resp.worker_id)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer shadow-xs"
                                  >
                                    Select Worker
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
                  Select a posted job on the left to compare worker responses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY BOOKINGS & ESCROW TRACKER */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Active Bookings & Escrow System</h2>
            <p className="text-xs text-slate-500">
              Track confirmed bookings. Payment remains safely locked in mock Escrow until you approve the completed work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map((b) => {
              const isRequested = b.status === 'REQUESTED';
              const isNegotiating = b.status === 'NEGOTIATING';
              const isRejected = b.status === 'REJECTED';
              const isConfirmed = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status);
              const isCompleted = b.status === 'COMPLETED';
              const isApproved = b.status === 'APPROVED';
              const isCancelled = b.status === 'CANCELLED';

              return (
                <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    {/* Status & Escrow Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">{b.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCompleted
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : isCancelled || isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : isNegotiating
                          ? 'bg-amber-100 text-amber-900'
                          : isRequested
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isRequested ? `${t.statusRequested} (${t.statusRequestedDesc})` :
                         isNegotiating ? `${t.statusNegotiating} (Worker Proposed Change)` :
                         isRejected ? t.statusRejected :
                         b.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{b.title}</h3>

                    {/* Worker Info */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{b.worker_name}</div>
                        <div className="text-[11px] text-slate-500">{t.trades?.[b.worker_trade] || b.worker_trade} • {b.date} at {b.time}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {isNegotiating ? "Proposed Fee" : "Agreed Fee"}
                        </span>
                        <span className="text-sm font-black text-slate-900">₹{b.price}</span>
                      </div>
                    </div>

                    {/* Rejection notice if declined */}
                    {isRejected && (
                      <div className="mt-3 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-900 space-y-1">
                        <div className="font-bold">⚠️ Worker was unable to accept this request</div>
                        <p className="text-[11px] text-rose-700">Reason: {b.rejection_reason || "Unavailable at this time"}</p>
                      </div>
                    )}

                    {/* Negotiation proposal banner */}
                    {isNegotiating && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-950 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Worker Proposed New Terms:
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Worker proposed ₹{b.price} for {b.time}. Review below and confirm to lock the booking.
                        </p>
                      </div>
                    )}

                    {/* Escrow Status Card */}
                    {(!isRequested && !isNegotiating && !isRejected) ? (
                      <div className="mt-3 bg-teal-50 border border-teal-200 rounded-2xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-teal-950">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-teal-600" />
                            UPI / Escrow — Prototype
                          </span>
                          <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full uppercase">
                            {b.escrow?.status || (isApproved ? 'RELEASED' : 'LOCKED')}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-teal-900">
                          UPI Ref: {b.escrow?.upi_ref || "UPI-LH-992147823"}
                        </div>
                        <p className="text-[10px] text-teal-800">
                          {isApproved
                            ? "✓ Payment released directly to worker's UPI account upon your approval."
                            : "✓ ₹" + b.price + " " + t.escrowSafeMessage}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-slate-500" />
                            UPI / Escrow Status
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full uppercase">
                            {isRejected ? 'NOT CHARGED' : 'PENDING ACCEPTANCE'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {isRejected
                            ? "Booking was declined. No payment was locked or deducted."
                            : isNegotiating
                            ? "Escrow will lock only when you accept the proposed terms."
                            : t.escrowPending}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Booking Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {/* If negotiating, allow customer to confirm proposed terms */}
                    {isNegotiating && (
                      <button
                        onClick={() => handleConfirmAgreement(b.id, b.price, b.time)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept Proposed Terms & Confirm Booking (₹{b.price} • {b.time})
                      </button>
                    )}

                    <button
                      onClick={() => onOpenChat({
                        booking_id: b.id,
                        customer_id: b.customer_id,
                        worker_id: b.worker_id
                      })}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {t.message}
                    </button>

                    {isConfirmed && (
                      <button
                        onClick={() => onTriggerCall({
                          name: b.worker_name,
                          trade: b.worker_trade,
                          mobile: b.worker_mobile
                        })}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {t.call}
                      </button>
                    )}

                    {/* Approve Completed Work Button */}
                    {isCompleted && (
                      <button
                        onClick={() => handleApproveWork(b.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {t.approveWork} (₹{b.price})
                      </button>
                    )}

                    {/* Rate Worker Button */}
                    {isApproved && (
                      <button
                        onClick={() => onOpenRating(b, b.worker_id, b.worker_name, 'worker')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" /> {t.rateWorker}
                      </button>
                    )}

                    {/* Rejection fallback button */}
                    {isRejected && (
                      <button
                        onClick={() => setActiveTab('explore')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                      >
                        Find Another Worker
                      </button>
                    )}

                    {/* Cancel Booking Button */}
                    {!isApproved && !isCancelled && !isRejected && (
                      <button
                        onClick={() => onOpenCancel(b, 'customer')}
                        className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
                      >
                        {isRequested ? "Cancel Request" : t.cancelBooking}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
