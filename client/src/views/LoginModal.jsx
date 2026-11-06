// client/src/views/LoginModal.jsx
import React, { useState } from 'react';
import { X, Smartphone, KeyRound, Shield, CheckCircle2, User, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const LoginModal = ({ isOpen, onClose }) => {
  const { demoAccounts, switchPersona } = useAuth();
  const [step, setStep] = useState('mobile'); // 'mobile' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('1234');
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (mobile.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(mobile);
      if (res.success) {
        setStep('otp');
        setMessage(res.notice || "PROTOTYPE OTP: Use 1234 to verify.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.verifyOtp(mobile, otp, role, name);
      if (res.success) {
        // Switch to newly authenticated session
        await switchPersona({ mobile, role, name: res.user.name, user_id: res.user.id });
        onClose();
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("Verification failed. Please use 1234.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-2">
            DEMO ONLY
          </div>
          <h2 className="text-xl font-black">Mobile OTP Authentication</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Prototype authentication system. Any mobile number with OTP <strong>1234</strong> will authenticate.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Personas 1-Click login */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Instant 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.slice(0, 4).map((acc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    switchPersona(acc);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition cursor-pointer text-xs"
                >
                  <div className="font-bold text-slate-900 truncate">{acc.name}</div>
                  <div className="text-[10px] text-slate-500">{acc.role_label}</div>
                  <div className="text-[9px] font-mono text-emerald-700 mt-1">📱 {acc.mobile}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-[10px] font-bold text-slate-400 uppercase">Or test manual flow</span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Step 1: Mobile Input */}
          {step === 'mobile' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-3.5 py-2 text-xs font-mono text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'customer'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    role === 'worker'
                      ? 'bg-blue-50 border-blue-400 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-blue-600" /> Skilled Worker
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length < 10}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
              >
                {loading ? "Sending..." : "Send Prototype OTP →"}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950 font-medium">
                {message || "Prototype OTP: Use 1234 to login."}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 4-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-center text-lg font-mono tracking-widest font-black text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('mobile')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Enter"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
