// client/src/api.js
// API Client wrapper for LocalHands Backend

const API_BASE = '/api';

export const api = {
  // Health
  getHealth: () => fetch(`${API_BASE}/health`).then(r => r.json()),
  resetData: () => fetch(`${API_BASE}/reset`, { method: 'POST' }).then(r => r.json()),

  // Auth & Demo
  getDemoUsers: () => fetch(`${API_BASE}/auth/demo-users`).then(r => r.json()),
  sendOtp: (mobile) => fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile })
  }).then(r => r.json()),
  verifyOtp: (mobile, otp, role, name) => fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp, role, name })
  }).then(r => r.json()),
  adminLogin: (credentials) => fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(r => r.json()),

  // Workers
  getWorkers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/workers${query ? `?${query}` : ''}`).then(r => r.json());
  },
  getWorker: (id) => fetch(`${API_BASE}/workers/${id}`).then(r => r.json()),
  updateAvailability: (id, availability) => fetch(`${API_BASE}/workers/${id}/availability`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability })
  }).then(r => r.json()),
  updateCalendar: (id, calendar_slots) => fetch(`${API_BASE}/workers/${id}/calendar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendar_slots })
  }).then(r => r.json()),
  updateProfile: (id, data) => fetch(`${API_BASE}/workers/${id}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  instantMatch: (data) => fetch(`${API_BASE}/workers/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Jobs
  postJob: (data) => fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getJobs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/jobs${query ? `?${query}` : ''}`).then(r => r.json());
  },
  getJob: (id) => fetch(`${API_BASE}/jobs/${id}`).then(r => r.json()),
  respondToJob: (jobId, data) => fetch(`${API_BASE}/jobs/${jobId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  negotiateJob: (jobId, data) => fetch(`${API_BASE}/jobs/${jobId}/negotiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  rejectJob: (jobId, worker_id) => fetch(`${API_BASE}/jobs/${jobId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ worker_id })
  }).then(r => r.json()),
  selectWorker: (jobId, worker_id) => fetch(`${API_BASE}/jobs/${jobId}/select-worker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ worker_id })
  }).then(r => r.json()),

  // Bookings
  createBooking: (data) => fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/bookings${query ? `?${query}` : ''}`).then(r => r.json());
  },
  getBooking: (id) => fetch(`${API_BASE}/bookings/${id}`).then(r => r.json()),
  acceptBooking: (id) => fetch(`${API_BASE}/bookings/${id}/accept`, { method: 'POST' }).then(r => r.json()),
  rejectBooking: (id, data = {}) => fetch(`${API_BASE}/bookings/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  negotiateBooking: (id, data) => fetch(`${API_BASE}/bookings/${id}/negotiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  confirmBookingAgreement: (id, data) => fetch(`${API_BASE}/bookings/${id}/confirm-agreement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  startBooking: (id) => fetch(`${API_BASE}/bookings/${id}/start`, { method: 'POST' }).then(r => r.json()),
  completeBooking: (id) => fetch(`${API_BASE}/bookings/${id}/complete`, { method: 'POST' }).then(r => r.json()),
  approveBooking: (id) => fetch(`${API_BASE}/bookings/${id}/approve`, { method: 'POST' }).then(r => r.json()),
  cancelBooking: (id, data) => fetch(`${API_BASE}/bookings/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Escrow
  lockEscrow: (booking_id, amount) => fetch(`${API_BASE}/escrow/lock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id, amount })
  }).then(r => r.json()),
  releaseEscrow: (booking_id) => fetch(`${API_BASE}/escrow/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id })
  }).then(r => r.json()),
  getEscrow: (booking_id) => fetch(`${API_BASE}/escrow/${booking_id}`).then(r => r.json()),

  // Conversations
  getConversations: (userId) => fetch(`${API_BASE}/conversations?user_id=${userId}`).then(r => r.json()),
  getConversation: (id) => fetch(`${API_BASE}/conversations/${id}`).then(r => r.json()),
  startConversation: (data) => fetch(`${API_BASE}/conversations/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  sendMessage: (convId, data) => fetch(`${API_BASE}/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  acceptProposal: (convId, message_id) => fetch(`${API_BASE}/conversations/${convId}/accept-proposal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message_id })
  }).then(r => r.json()),

  // Voice
  processVoice: (text) => fetch(`${API_BASE}/voice/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  }).then(r => r.json()),

  // Ratings
  submitRating: (data) => fetch(`${API_BASE}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getRatings: (userId) => fetch(`${API_BASE}/ratings/${userId}`).then(r => r.json()),

  // Admin
  getAdminDashboard: () => fetch(`${API_BASE}/admin/dashboard`).then(r => r.json()),
  getAdminCancellations: () => fetch(`${API_BASE}/admin/cancellations`).then(r => r.json()),
  getAdminDisputes: () => fetch(`${API_BASE}/admin/disputes`).then(r => r.json()),
  reviewCancellation: (id, data) => fetch(`${API_BASE}/admin/cancellations/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Verification Mock
  toggleVerification: (worker_id, verification_type) => fetch(`${API_BASE}/verification/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ worker_id, verification_type })
  }).then(r => r.json())
};
