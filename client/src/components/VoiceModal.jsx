// client/src/components/VoiceModal.jsx
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Check, ArrowRight, X, Clock, Calendar, ShieldCheck, IndianRupee, Volume2 } from 'lucide-react';
import { api } from '../api';

export const VoiceModal = ({ isOpen, onClose, onSelectTrade, onOpenPostJobWithData, onViewWorker }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [intentResult, setIntentResult] = useState(null);
  const [micSupported, setMicSupported] = useState(true);

  const demoPhrases = [
    { text: "I need a plumber tomorrow at 10 AM", lang: "English", tag: "Plumber" },
    { text: "Mujhe kal subah ek bijli wala electrician chahiye", lang: "Hindi", tag: "Electrician" },
    { text: "Move heavy wooden cupboard and fix curtain rod", lang: "English", tag: "Odd Jobs" },
    { text: "Assemble IKEA wardrobe today under 600", lang: "English", tag: "Carpenter" },
    { text: "Kitchen deep cleaning aur balcony wash karni hai", lang: "Hinglish", tag: "Cleaner" }
  ];

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMicSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition not supported. Please use the demo voice prompts below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setIntentResult(null);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceText(text);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition initiation error:", err);
      setIsListening(false);
    }
  };

  const processVoiceText = async (text) => {
    setProcessing(true);
    setTranscript(text);
    try {
      const res = await api.processVoice(text);
      setIntentResult(res);
    } catch (err) {
      console.error("Failed to process voice text:", err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
            <Volume2 className="w-3.5 h-3.5 text-amber-300" /> Bhashini Integration — Prototype
          </div>
          <h2 className="text-2xl font-black tracking-tight">Ask LocalHands</h2>
          <p className="text-sm text-emerald-50 mt-1">
            Speak in Hindi, English or Hinglish for instant voice discovery.
          </p>
        </div>

        {/* Voice Trigger Center */}
        <div className="p-6 text-center space-y-5">
          <div className="flex flex-col items-center">
            <button
              onClick={handleStartListening}
              disabled={isListening || processing}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 scale-110'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-8 ring-emerald-50 hover:scale-105'
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>
            <p className="text-xs font-semibold text-slate-500 mt-3">
              {isListening ? "Listening... Speak now..." : "Tap microphone to speak"}
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                You said
              </span>
              <p className="text-sm font-semibold text-slate-800 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Quick Demo Voice Prompts */}
          {!intentResult && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-left">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Or try 1-click voice prompts:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Bhashini NLP</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {demoPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => processVoiceText(phrase.text)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-xs text-slate-700 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="truncate">🎙️ "{phrase.text}"</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-2">
                      {phrase.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Structured NLP Intent Result Card */}
          {intentResult && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Intent Extracted ({Math.round(intentResult.confidence * 100)}% Confidence)
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  {intentResult.language}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-medium block">Category / Trade</span>
                  <span className="font-bold text-slate-900 text-sm">{intentResult.trade}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-medium block">Preferred Time</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {intentResult.time}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-medium block">Date</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> {intentResult.date}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-medium block">Budget Estimate</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <IndianRupee className="w-3 h-3 text-slate-500" /> ₹{intentResult.budget}
                  </span>
                </div>
              </div>

              {/* Matching Workers Discovered */}
              {intentResult.matching_workers && intentResult.matching_workers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Immediate Nearby Workers Available:
                  </span>
                  {intentResult.matching_workers.map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <img src={w.avatar} alt={w.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{w.name}</div>
                          <div className="text-[10px] text-slate-500">⭐ {w.rating} • {w.approx_distance || 1.5} km</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onViewWorker(w.id);
                          onClose();
                        }}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectTrade(intentResult.trade);
                    onClose();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  View All {intentResult.trade}s <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onOpenPostJobWithData({
                      category: intentResult.trade,
                      title: transcript || `Need ${intentResult.trade}`,
                      date: intentResult.date,
                      time: intentResult.time,
                      budget_min: intentResult.budget,
                      budget_max: intentResult.budget + 200,
                      is_odd_job: intentResult.is_odd_job
                    });
                    onClose();
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer"
                >
                  Post as Job
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
