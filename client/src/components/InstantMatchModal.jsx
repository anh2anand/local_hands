// client/src/components/InstantMatchModal.jsx
import React, { useState } from 'react';
import { X, Sparkles, Star, MapPin, ShieldCheck, Check, ArrowRight, Award } from 'lucide-react';
import { api } from '../api';

export const InstantMatchModal = ({ isOpen, onClose, onViewWorker, onDirectBook }) => {
  const [trade, setTrade] = useState('Plumber');
  const [preferredTime, setPreferredTime] = useState('Tomorrow 10:00 AM');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  if (!isOpen) return null;

  const handleFindMatch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.instantMatch({
        trade,
        preferred_time: preferredTime,
        location: "Green Park, South Delhi"
      });
      setMatchResult(res);
    } catch (err) {
      console.error("Match algorithm error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-700 via-emerald-700 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Instant Match Algorithm
          </div>
          <h2 className="text-xl font-black">Find Someone for Me</h2>
          <p className="text-xs text-teal-100 mt-1">
            Let LocalHands recommend the best verified and available worker nearby.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Query Form */}
          {!matchResult ? (
            <form onSubmit={handleFindMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Required Trade / Skill
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Plumber">Plumber (Taps, Pipes, Sanitary)</option>
                  <option value="Electrician">Electrician (Wiring, Fan, MCB)</option>
                  <option value="Carpenter">Carpenter (Furniture, Assembly, Doors)</option>
                  <option value="Painter">Painter (Walls, Touch-ups)</option>
                  <option value="Cleaner">Cleaner (Deep Cleaning, Terrace)</option>
                  <option value="AC Technician">AC Technician (Service, Gas, Repair)</option>
                  <option value="Odd Jobs">Odd Jobs (Move Furniture, Hang Frames)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  When do you need them?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Today within 2 hrs", "Tomorrow 10:00 AM", "Tomorrow 03:00 PM", "This Weekend"].map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreferredTime(t)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-left ${
                        preferredTime === t
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? "Analyzing Worker Profiles..." : "Find Best Worker Recommendation"}
                </button>
              </div>
            </form>
          ) : (
            /* Results View */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Top Recommended Match
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {matchResult.match_score}% Match Score
                </span>
              </div>

              {matchResult.best_match && (
                <div className="bg-slate-50 border-2 border-emerald-400 rounded-3xl p-5 relative shadow-sm">
                  <div className="flex items-start gap-4">
                    <img
                      src={matchResult.best_match.avatar}
                      alt={matchResult.best_match.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {matchResult.best_match.name}
                        </h3>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {matchResult.best_match.rating}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {matchResult.best_match.trade} • ₹{matchResult.best_match.hourly_rate}/hr
                      </p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {matchResult.best_match.approx_distance || 1.2} km away • Hauz Khas
                      </p>
                    </div>
                  </div>

                  {/* Why this match */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Why LocalHands Recommends:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {matchResult.match_reasons?.map((reason, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700 bg-white p-1.5 rounded-lg border border-slate-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onViewWorker(matchResult.best_match);
                        onClose();
                      }}
                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer"
                    >
                      View Full Profile
                    </button>
                    <button
                      onClick={() => {
                        onDirectBook(matchResult.best_match);
                        onClose();
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      Request Booking <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center italic">
                *LocalHands recommends the best match based on live distance, ratings and availability. You always retain the final choice to book.
              </p>

              <button
                onClick={() => setMatchResult(null)}
                className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-900 py-1 cursor-pointer"
              >
                ← Search Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
