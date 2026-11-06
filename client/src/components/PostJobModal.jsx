// client/src/components/PostJobModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Sparkles, IndianRupee, Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api';

export const PostJobModal = ({
  isOpen,
  onClose,
  initialData,
  currentUserId,
  onJobCreated
}) => {
  const [category, setCategory] = useState('Plumber');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('10:00 AM - 12:00 PM');
  const [budgetMin, setBudgetMin] = useState(450);
  const [budgetMax, setBudgetMax] = useState(650);
  const [negotiable, setNegotiable] = useState(true);
  const [radius, setRadius] = useState(3.5);
  const [isOddJob, setIsOddJob] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.category) setCategory(initialData.category);
      if (initialData.title) setTitle(initialData.title);
      if (initialData.date) setDate(initialData.date);
      if (initialData.time) setTime(initialData.time);
      if (initialData.budget_min) setBudgetMin(initialData.budget_min);
      if (initialData.budget_max) setBudgetMax(initialData.budget_max);
      if (initialData.is_odd_job) {
        setIsOddJob(true);
        setCategory('Odd Jobs');
      }
    }
  }, [initialData]);

  if (!isOpen) return null;

  const categories = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Painter",
    "Cleaner",
    "AC Technician",
    "Appliance Repair",
    "Mason",
    "Gardener",
    "Odd Jobs"
  ];

  const oddJobTemplates = [
    { title: "Move heavy cupboard & hang 2 paintings", cat: "Odd Jobs", min: 500, max: 650 },
    { title: "Assemble IKEA wardrobe in bedroom", cat: "Carpenter", min: 550, max: 750 },
    { title: "Hang 55-inch LED TV and drill shelves", cat: "Electrician", min: 400, max: 600 },
    { title: "Terrace floor scrubbing and plant repotting", cat: "Cleaner", min: 600, max: 800 }
  ];

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setDescription(`Task: ${tpl.title}. Tools and hardware to be brought by worker.`);
    setCategory(tpl.cat);
    if (tpl.cat === 'Odd Jobs') setIsOddJob(true);
    setBudgetMin(tpl.min);
    setBudgetMax(tpl.max);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.postJob({
        customer_id: currentUserId || "cust_1",
        category,
        title,
        description: description || title,
        date,
        time,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        negotiable,
        radius: Number(radius),
        is_odd_job: isOddJob || category === 'Odd Jobs'
      });

      if (res.success) {
        setSuccessResult(res);
        setTimeout(() => {
          onJobCreated(res.job);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to post job:", err);
      alert("Error posting job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Marketplace Post
          </div>
          <h2 className="text-xl font-black">
            {isOddJob || category === 'Odd Jobs' ? 'Post an Odd Job' : 'Post a Service Request'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Nearby workers will receive your request and send negotiable offers. You compare and choose!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Odd Job Templates */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Popular Quick Tasks
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {oddJobTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer"
                >
                  ⚡ {tpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category / Trade
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsOddJob(e.target.value === 'Odd Jobs');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Date
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Today">Today (Urgent)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Weekend">This Weekend</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Title / Summary
            </label>
            <input
              type="text"
              placeholder="e.g. Move heavy cupboard and hang wall paintings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={2}
              placeholder="Provide any details: dimensions, floor, tools required, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Preferred Time Slot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM", "05:00 PM - 07:00 PM"].map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                    time === t
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range & Negotiable */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> Budget & Pricing
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">Min Budget (₹)</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-medium mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                Price is negotiable in chat
              </label>
              <span className="text-[10px] text-slate-500">Service Radius: {radius} km</span>
            </div>
          </div>

          {/* Success Box Preview */}
          {successResult && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-sm">Job Broadcasted Successfully!</div>
                <div>{successResult.notified_workers_count} nearby workers notified. Offers will appear shortly.</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || successResult}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? "Broadcasting to Workers..." : "Post Job to Marketplace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
