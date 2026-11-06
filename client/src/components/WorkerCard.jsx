import React from 'react';
import { Star, MapPin, ShieldCheck, Award, Wrench, IndianRupee, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WorkerCard = ({ worker, onViewDetails, onDirectBook }) => {
  const { t } = useAuth();
  const isAvailable = worker.availability === 'available';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top bar: Availability & Distance */}
        <div className="flex items-center justify-between text-xs mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isAvailable ? (t.available || 'Available Now') : (t.busy || 'Busy in Slot')}
          </span>
          <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400" />
            {worker.approx_distance || 1.5} km away
          </span>
        </div>

        {/* Profile info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition"
            />
            {worker.verification_status?.eshram?.verified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-white" title="e-SHRAM Verified">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-emerald-700 transition">
              {worker.name}
            </h3>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Wrench className="w-3 h-3 text-emerald-600" />
              {t.trades?.[worker.trade] || worker.trade} {worker.odd_jobs && <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-normal text-slate-600">+ {t.trades?.["Odd Jobs"] || "Odd Jobs"}</span>}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="flex items-center gap-0.5 font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {worker.rating}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({worker.reviews_count || 40} {t.reviews || "reviews"})
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-[11px]">
                {worker.experience}
              </span>
            </div>
          </div>
        </div>

        {/* Prototype Verification Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {worker.verification_status?.eshram?.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
              <ShieldCheck className="w-3 h-3 text-teal-600" /> {t.eshramVerified}
            </span>
          )}
          {worker.verification_status?.pm_vishwakarma?.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              <Award className="w-3 h-3 text-blue-600" /> {t.pmVishwakarmaCertified}
            </span>
          )}
        </div>

        {/* Skills pill preview */}
        <div className="flex flex-wrap gap-1 mb-4">
          {worker.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              {skill}
            </span>
          ))}
          {worker.skills?.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{worker.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rate</span>
          <span className="text-sm font-extrabold text-slate-900 flex items-center">
            <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
            {worker.hourly_rate}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">/hr</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(worker)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
          >
            Profile
          </button>
          <button
            onClick={() => onDirectBook(worker)}
            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
          >
            Book <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
