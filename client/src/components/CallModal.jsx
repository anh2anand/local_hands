// client/src/components/CallModal.jsx
import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Shield, User } from 'lucide-react';

export const CallModal = ({ isOpen, onClose, targetUser, targetRole = "Worker" }) => {
  const [callStatus, setCallStatus] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    let timer;
    let connectTimer;

    if (isOpen) {
      setCallStatus('ringing');
      setDuration(0);

      // Connect after 1.8 seconds to simulate realistic pickup
      connectTimer = setTimeout(() => {
        setCallStatus('connected');
      }, 1800);
    }

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen || !targetUser) return null;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center text-white shadow-2xl flex flex-col items-center">
        {/* Privacy protected notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium mb-6">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> Masked Call — Privacy Protected
        </div>

        {/* Avatar with pulsing rings */}
        <div className="relative mb-6">
          <div className={`w-28 h-28 rounded-full overflow-hidden border-4 border-slate-700 relative z-10 shadow-xl ${
            callStatus === 'ringing' ? 'animate-bounce' : ''
          }`}>
            <img
              src={targetUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={targetUser.name}
              className="w-full h-full object-cover"
            />
          </div>
          {callStatus === 'ringing' && (
            <>
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping -z-0" />
              <div className="absolute -inset-3 rounded-full bg-emerald-500/10 animate-pulse -z-0" />
            </>
          )}
        </div>

        {/* Contact Info */}
        <h3 className="text-xl font-black tracking-tight">{targetUser.name}</h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {targetRole} • {targetUser.trade || targetUser.location || "LocalHands Network"}
        </p>

        {/* Call State / Duration */}
        <div className="mt-4 mb-8">
          {callStatus === 'ringing' && (
            <span className="text-sm font-semibold text-emerald-400 animate-pulse flex items-center justify-center gap-1.5">
              <Phone className="w-4 h-4 animate-spin" /> Calling...
            </span>
          )}
          {callStatus === 'connected' && (
            <span className="text-sm font-mono font-bold text-slate-200 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {formatTime(duration)}
            </span>
          )}
          {callStatus === 'ended' && (
            <span className="text-sm font-semibold text-rose-400">
              Call Ended
            </span>
          )}
        </div>

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              isMuted ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-3.5 rounded-full flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              isSpeaker ? 'bg-emerald-500 text-slate-900 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px]">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
          </button>

          <a
            href={`tel:${targetUser.mobile || "9811122233"}`}
            className="p-3.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex flex-col items-center justify-center gap-1 transition"
            title="Cellular network dialer"
          >
            <Phone className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px]">Real Dial</span>
          </a>
        </div>

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
