// client/src/views/AdminView.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, CheckCircle2, IndianRupee, Users,
  Wrench, Calendar, Clock, RefreshCw, XCircle, FileText, Check, ArrowRight
} from 'lucide-react';
import { api } from '../api';

export const AdminView = () => {
  const [metrics, setMetrics] = useState(null);
  const [cancellations, setCancellations] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [activeTab, setActiveTab] = useState('cancellations'); // 'cancellations' | 'bookings' | 'workers'
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedCase, setSelectedCase] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('REFUND_CUSTOMER');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, cancRes, bkRes, wkRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminCancellations(),
        api.getBookings(),
        api.getWorkers()
      ]);

      setMetrics(dashRes.metrics);
      setCancellations(cancRes.cancellations || []);
      setAllBookings(bkRes.bookings || []);
      setAllWorkers(wkRes.workers || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;

    setSubmittingReview(true);
    try {
      const statusMap = {
        'REFUND_CUSTOMER': 'REFUND_APPROVED',
        'PAY_WORKER': 'PAY_WORKER',
        'DISMISS': 'DISMISSED'
      };

      const res = await api.reviewCancellation(selectedCase.id, {
        status: statusMap[resolutionAction] || 'REVIEWED',
        resolution_action: resolutionAction,
        admin_notes: adminNotes || "Case evaluated under platform dispute guidelines."
      });

      if (res.success) {
        alert(`Dispute resolved: ${res.cancellation.status}`);
        setSelectedCase(null);
        setAdminNotes('');
        loadAdminData();
      }
    } catch (err) {
      console.error("Error reviewing cancellation:", err);
      alert("Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" /> Platform Operations & Dispute Resolution
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Operations Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor live platform metrics, inspect cancellation reasons, and arbitrate escrow dispute settlements.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Dashboard
        </button>
      </div>

      {/* KPI Financial & Operational Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Platform GMV</span>
            <span className="text-2xl font-black text-slate-900">₹{metrics.total_gmv?.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Across all services</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Escrow Currently Locked</span>
            <span className="text-2xl font-black text-teal-700">₹{metrics.escrow_locked?.toLocaleString()}</span>
            <span className="text-[11px] text-teal-600 block mt-0.5 font-semibold">Active in escrow</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Disputed Escrow</span>
            <span className="text-2xl font-black text-rose-600">₹{metrics.escrow_disputed?.toLocaleString()}</span>
            <span className="text-[11px] text-rose-700 block mt-0.5 font-semibold">Pending review</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending Cancellations</span>
            <span className="text-2xl font-black text-amber-600">{metrics.pending_cancellations || 0}</span>
            <span className="text-[11px] text-amber-700 block mt-0.5 font-semibold">Requires action</span>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('cancellations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
            activeTab === 'cancellations' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Cancellations & Disputes ({cancellations.length})
          {cancellations.filter(c => c.status === 'PENDING_REVIEW').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
              {cancellations.filter(c => c.status === 'PENDING_REVIEW').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'bookings' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          All Platform Bookings ({allBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'workers' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Workers & Verifications ({allWorkers.length})
        </button>
      </div>

      {/* TAB 1: CANCELLATIONS & DISPUTES */}
      {activeTab === 'cancellations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">
              Cancellations Requiring Operational Review
            </h2>
            <span className="text-xs text-slate-500">
              Mandatory cancellation reasons and escrow arbitration
            </span>
          </div>

          <div className="space-y-3">
            {cancellations.map((canc) => {
              const isPending = canc.status === 'PENDING_REVIEW';
              return (
                <div
                  key={canc.id}
                  className={`bg-white rounded-2xl border p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
                    isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{canc.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {canc.status}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Requested by: <strong>{canc.requester_name}</strong> ({canc.requester_role})
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      Booking: {canc.booking?.title || "Home Repair Service"} (₹{canc.booking?.price || 500})
                    </div>

                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 font-medium">
                      <span className="font-bold text-rose-800 block mb-0.5">Mandatory Reason Submitted:</span>
                      "{canc.reason}"
                    </div>

                    {canc.admin_notes && (
                      <div className="text-[11px] text-slate-500 italic">
                        Operator notes: {canc.admin_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Escrow Amount</span>
                      <span className="text-base font-black text-slate-900">₹{canc.booking?.price || 500}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono block mt-0.5">
                        Status: {canc.escrow?.status || 'DISPUTED'}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedCase(canc)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Arbitrate & Review Case →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">Live Platform Bookings Register</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Task Title</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Worker</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Escrow Status</th>
                  <th className="p-3">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{b.title}</td>
                    <td className="p-3 text-slate-600">{b.customer_name}</td>
                    <td className="p-3 text-slate-600">{b.worker_name} ({b.worker_trade})</td>
                    <td className="p-3 font-black text-slate-900">₹{b.price}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {b.escrow?.status || 'LOCKED'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKERS & VERIFICATIONS */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">Registered Skilled Workers Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allWorkers.map((w) => (
              <div key={w.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <img src={w.avatar} alt={w.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">{w.name}</div>
                  <div className="text-[11px] text-slate-500">{w.trade} • {w.experience}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {w.verification_status?.eshram?.verified && (
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                        e-SHRAM
                      </span>
                    )}
                    {w.verification_status?.pm_vishwakarma?.verified && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                        PM-V
                      </span>
                    )}
                    <span className="text-[10px] text-amber-600 font-bold ml-auto">
                      ⭐ {w.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Case Arbitrate & Review Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-5 text-white relative">
              <button
                onClick={() => setSelectedCase(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <h3 className="font-black text-lg">Arbitrate Cancellation Case</h3>
              <p className="text-xs text-slate-300">Case Ref: {selectedCase.id}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block font-medium">Dispute Reason Submitted:</span>
                  <p className="font-semibold text-slate-900 italic mt-0.5">"{selectedCase.reason}"</p>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span>Escrow Amount: <strong>₹{selectedCase.booking?.price}</strong></span>
                  <span>Requester: <strong>{selectedCase.requester_name} ({selectedCase.requester_role})</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Settlement Decision
                </label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-slate-900"
                >
                  <option value="REFUND_CUSTOMER">Approve Full Refund to Customer UPI</option>
                  <option value="PAY_WORKER">Release Escrow to Worker (Late Cancellation Fee)</option>
                  <option value="DISMISS">Dismiss Dispute / Mark Reviewed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operator Justification / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Record formal operations justification for audit log..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  {submittingReview ? "Submitting Decision..." : "Execute Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
