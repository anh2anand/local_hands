// client/src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { CustomerView } from './views/CustomerView';
import { WorkerView } from './views/WorkerView';
import { AdminView } from './views/AdminView';
import { LoginModal } from './views/LoginModal';
import { VoiceModal } from './components/VoiceModal';
import { PostJobModal } from './components/PostJobModal';
import { InstantMatchModal } from './components/InstantMatchModal';
import { WorkerDetailsModal } from './components/WorkerDetailsModal';
import { ChatModal } from './components/ChatModal';
import { CallModal } from './components/CallModal';
import { CancelModal } from './components/CancelModal';
import { RatingModal } from './components/RatingModal';
import { Smartphone, Monitor } from 'lucide-react';

const AppContent = () => {
  const { currentUser, currentRole, workerProfile, refreshWorkerProfile } = useAuth();

  // Mobile Frame Simulation Toggle
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Global Modals State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [postJobInitialData, setPostJobInitialData] = useState(null);
  const [instantMatchOpen, setInstantMatchOpen] = useState(false);
  const [selectedWorkerDetails, setSelectedWorkerDetails] = useState(null);

  // Chat State
  const [chatParams, setChatParams] = useState(null);

  // Call State
  const [callParams, setCallParams] = useState(null);

  // Cancel State
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelRole, setCancelRole] = useState('customer');

  // Rating State
  const [ratingData, setRatingData] = useState(null);

  const handleOpenPostJob = (isOddJob = false, prefill = null) => {
    setPostJobInitialData(prefill || (isOddJob ? { is_odd_job: true, category: 'Odd Jobs' } : null));
    setPostJobModalOpen(true);
  };

  const handleViewWorker = (worker) => {
    setSelectedWorkerDetails(worker);
  };

  const handleDirectBook = (worker) => {
    setSelectedWorkerDetails(worker);
  };

  const handleOpenChat = (params) => {
    setChatParams(params);
  };

  const handleTriggerCall = (contact) => {
    setCallParams(contact);
  };

  const handleOpenCancel = (booking, role) => {
    setCancelBooking(booking);
    setCancelRole(role);
  };

  const handleOpenRating = (booking, targetUserId, targetUserName, targetRole) => {
    setRatingData({ booking, targetUserId, targetUserName, targetRole });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Application Header */}
      <Header
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Frame Mode Bar */}
      <div className="bg-slate-200/80 border-b border-slate-300 py-1 px-4 text-center flex items-center justify-center gap-4 text-xs font-semibold text-slate-700">
        <span className="hidden sm:inline">Responsive Layout:</span>
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md cursor-pointer transition ${
            !isMobileFrame ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-300 text-slate-600'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Full Desktop View
        </button>
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md cursor-pointer transition ${
            isMobileFrame ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-300 text-slate-600'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile Screen Frame
        </button>
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all ${isMobileFrame ? 'max-w-md mx-auto my-4 bg-slate-50 border-4 border-slate-800 rounded-[40px] shadow-2xl overflow-hidden' : 'w-full'}`}>
        {currentRole === 'customer' && (
          <CustomerView
            currentUser={currentUser}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            onOpenPostJob={handleOpenPostJob}
            onOpenInstantMatch={() => setInstantMatchOpen(true)}
            onViewWorker={handleViewWorker}
            onDirectBook={handleDirectBook}
            onOpenChat={handleOpenChat}
            onTriggerCall={handleTriggerCall}
            onOpenCancel={handleOpenCancel}
            onOpenRating={handleOpenRating}
          />
        )}

        {currentRole === 'worker' && (
          <WorkerView
            currentUser={currentUser}
            workerProfile={workerProfile}
            refreshWorkerProfile={refreshWorkerProfile}
            onOpenChat={handleOpenChat}
            onTriggerCall={handleTriggerCall}
            onOpenRating={handleOpenRating}
          />
        )}

        {currentRole === 'admin' && (
          <AdminView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">LocalHands — Voice-First Skilled Labor Marketplace Prototype</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Prototype integrations labeled: Bhashini Voice AI (Mock) • e-SHRAM (Mock) • PM Vishwakarma (Mock) • UPI / Escrow (Mock)
        </p>
      </footer>

      {/* Modals Container */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onSelectTrade={(trade) => {
          // Handled via customer view
        }}
        onOpenPostJobWithData={(data) => {
          handleOpenPostJob(data.is_odd_job, data);
        }}
        onViewWorker={(workerId) => {
          // Open details
          api.getWorker(workerId).then(res => {
            if (res.worker) setSelectedWorkerDetails(res.worker);
          });
        }}
      />

      <PostJobModal
        isOpen={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        initialData={postJobInitialData}
        currentUserId={currentUser?.id}
        onJobCreated={() => {
          window.location.reload();
        }}
      />

      <InstantMatchModal
        isOpen={instantMatchOpen}
        onClose={() => setInstantMatchOpen(false)}
        onViewWorker={handleViewWorker}
        onDirectBook={handleDirectBook}
      />

      <WorkerDetailsModal
        isOpen={!!selectedWorkerDetails}
        onClose={() => setSelectedWorkerDetails(null)}
        worker={selectedWorkerDetails}
        currentUserId={currentUser?.id}
        onBookingCreated={() => {
          window.location.reload();
        }}
        onStartChat={(worker) => {
          handleOpenChat({
            customer_id: currentUser?.id || "cust_1",
            worker_id: worker.id
          });
        }}
      />

      <ChatModal
        isOpen={!!chatParams}
        onClose={() => setChatParams(null)}
        conversationId={chatParams?.conversation_id}
        jobId={chatParams?.job_id}
        bookingId={chatParams?.booking_id}
        customerId={chatParams?.customer_id}
        workerId={chatParams?.worker_id}
        currentUserId={currentUser?.id || (workerProfile?.id || "cust_1")}
        onTriggerCall={handleTriggerCall}
      />

      <CallModal
        isOpen={!!callParams}
        onClose={() => setCallParams(null)}
        targetUser={callParams}
        targetRole={callParams?.trade || "Partner"}
      />

      <CancelModal
        isOpen={!!cancelBooking}
        onClose={() => setCancelBooking(null)}
        booking={cancelBooking}
        currentUserId={currentUser?.id}
        userRole={cancelRole}
        onCancelled={() => {
          window.location.reload();
        }}
      />

      <RatingModal
        isOpen={!!ratingData}
        onClose={() => setRatingData(null)}
        booking={ratingData?.booking}
        currentUserId={currentUser?.id || workerProfile?.id}
        targetUserId={ratingData?.targetUserId}
        targetUserName={ratingData?.targetUserName}
        targetRole={ratingData?.targetRole}
        onRatingSubmitted={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
