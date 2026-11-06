// client/src/components/ChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, IndianRupee, Clock, Check, Phone, ShieldCheck, Tag } from 'lucide-react';
import { api } from '../api';

export const ChatModal = ({
  isOpen,
  onClose,
  conversationId,
  jobId,
  bookingId,
  customerId,
  workerId,
  currentUserId,
  onSelectWorkerConfirmed,
  onTriggerCall
}) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerTime, setOfferTime] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChat();
      const interval = setInterval(loadChat, 3000); // Polling for fast live feel
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId, jobId, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    try {
      if (conversationId) {
        const res = await api.getConversation(conversationId);
        setConversation(res.conversation);
        setMessages(res.messages || []);
      } else if (customerId && workerId) {
        const res = await api.startConversation({
          job_id: jobId,
          booking_id: bookingId,
          customer_id: customerId,
          worker_id: workerId
        });
        setConversation(res.conversation);
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error("Error loading chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !conversation) return;

    const text = inputText;
    setInputText('');

    try {
      const res = await api.sendMessage(conversation.id, {
        sender_id: currentUserId,
        message: text
      });
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSendProposal = async (e) => {
    e?.preventDefault();
    if (!offerPrice || !conversation) return;

    try {
      const res = await api.sendMessage(conversation.id, {
        sender_id: currentUserId,
        proposed_price: Number(offerPrice),
        proposed_time: offerTime || "As discussed",
        is_proposal: true,
        message: `Counter-proposal: ₹${offerPrice}${offerTime ? ` at ${offerTime}` : ''}`
      });
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        setShowOfferForm(false);
        setOfferPrice('');
        setOfferTime('');
      }
    } catch (err) {
      console.error("Error sending proposal:", err);
    }
  };

  const handleAcceptProposal = async (messageId) => {
    if (!conversation) return;
    try {
      const res = await api.acceptProposal(conversation.id, messageId);
      if (res.success) {
        loadChat();
      }
    } catch (err) {
      console.error("Error accepting proposal:", err);
    }
  };

  if (!isOpen) return null;

  const targetName = currentUserId === conversation?.customer_id
    ? conversation?.worker_name
    : conversation?.customer_name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full h-[600px] flex flex-col overflow-hidden border border-slate-200">
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-sm">
              {targetName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">{targetName || "Chat"}</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live Negotiation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onTriggerCall && (
              <button
                onClick={() => onTriggerCall({ name: targetName })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition cursor-pointer"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            const isSystem = msg.sender_id === 'system';

            if (isSystem) {
              return (
                <div key={idx} className="flex justify-center my-2">
                  <div className="bg-emerald-100 text-emerald-950 text-xs px-3.5 py-1.5 rounded-full font-medium border border-emerald-200 max-w-xs text-center shadow-xs">
                    {msg.message}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                  {isMe ? 'You' : msg.sender_name}
                </span>

                {/* Structured Proposal Card */}
                {msg.is_proposal ? (
                  <div className={`p-3.5 rounded-2xl max-w-xs border shadow-xs ${
                    isMe
                      ? 'bg-emerald-50 border-emerald-300 text-slate-900 rounded-br-xs'
                      : 'bg-white border-slate-300 text-slate-900 rounded-bl-xs'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                      <Tag className="w-3.5 h-3.5" /> Price Negotiation Proposal
                    </div>
                    <div className="text-xl font-black text-slate-900 flex items-center">
                      ₹{msg.proposed_price}
                    </div>
                    {msg.proposed_time && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {msg.proposed_time}
                      </div>
                    )}
                    <p className="text-xs text-slate-700 mt-2">{msg.message}</p>

                    {/* Action buttons if not sender and pending */}
                    {!isMe && msg.proposal_status === 'PENDING' && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex gap-2">
                        <button
                          onClick={() => handleAcceptProposal(msg.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Proposal
                        </button>
                      </div>
                    )}

                    {msg.proposal_status === 'ACCEPTED' && (
                      <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> Agreed & Accepted
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`p-3 rounded-2xl max-w-xs text-xs font-medium shadow-xs ${
                    isMe
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}>
                    {msg.message}
                  </div>
                )}
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Counter Offer Drawer */}
        {showOfferForm && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-amber-700" /> Send Price / Time Counter-Offer
              </span>
              <button
                onClick={() => setShowOfferForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSendProposal} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Offer Price (₹)"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Time (e.g. 11 AM)"
                  value={offerTime}
                  onChange={(e) => setOfferTime(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer"
              >
                Send Offer to Chat
              </button>
            </form>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          {/* Quick Offer Trigger Buttons */}
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
            <button
              onClick={() => setShowOfferForm(!showOfferForm)}
              className="text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              <IndianRupee className="w-3 h-3" /> Negotiate Price
            </button>
            <button
              onClick={() => setInputText("Can you do this for ₹500?")}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full cursor-pointer transition shrink-0"
            >
              "Can you do for ₹500?"
            </button>
            <button
              onClick={() => setInputText("Yes, I can come at 11 AM.")}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full cursor-pointer transition shrink-0"
            >
              "I can come at 11 AM"
            </button>
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message or negotiation terms..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
