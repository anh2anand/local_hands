// client/src/components/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Wrench, Shield, Globe, RefreshCw, ChevronDown, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export const Header = ({ onOpenLogin, onResetData }) => {
  const { currentUser, currentRole, workerProfile, demoAccounts, switchPersona, language, setLanguage, t } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await api.resetData();
    window.location.reload();
  };

  const getRoleBadge = () => {
    if (currentRole === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <Shield className="w-3.5 h-3.5 text-purple-600" /> {t.admin}
        </span>
      );
    }
    if (currentRole === 'worker') {
      const tradeName = t.trades?.[workerProfile?.trade] || workerProfile?.trade || 'Skilled';
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Wrench className="w-3.5 h-3.5 text-blue-600" /> {t.worker} ({tradeName})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <User className="w-3.5 h-3.5 text-emerald-600" /> {t.customer}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Prototype Disclaimer Banner */}
      <div className="bg-amber-500 text-slate-900 text-xs py-1.5 px-4 font-medium flex items-center justify-between overflow-x-auto gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            {t.demoOnly}
          </span>
          <span>
            {t.integrationsSimulated}
          </span>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          title="Reset database to original seed state"
          className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} /> {t.resetSeedData}
        </button>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md tracking-tight">
            LH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">LocalHands</span>
              <span className="hidden sm:inline-block text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                MVP Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Current Persona & 1-Click Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle (Bhashini AI Prototype) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Bhashini AI Language Translation (Prototype)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</span>
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl text-left transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                  alt={currentUser?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {currentUser?.name || t.selectPersona}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {getRoleBadge()}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    {t.selectPersona}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                    {t.instantDemo}
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto py-1 space-y-1">
                  {demoAccounts.map((acc, idx) => {
                    const isSelected = currentUser?.mobile === acc.mobile;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          switchPersona(acc);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5">
                            {acc.name}
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="font-semibold text-slate-700">{acc.role_label}</span> • {acc.location}
                          </div>
                          <div className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                            {acc.badge}
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-200 px-2 py-1 rounded-md font-mono text-slate-600 shrink-0">
                          {acc.mobile}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenLogin();
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {t.customOtpLogin} →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
