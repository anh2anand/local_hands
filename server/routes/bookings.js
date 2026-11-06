// server/routes/bookings.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Create Direct / Private Booking Request (Customer requests a worker directly)
// IMPORTANT RULE: A private/direct booking is a REQUEST and must NOT automatically confirm or lock escrow.
router.post('/', (req, res) => {
  const { customer_id, worker_id, date, time, price, title, location, message } = req.body;

  if (!customer_id || !worker_id || !title) {
    return res.status(400).json({ error: "Missing required fields: customer_id, worker_id, title." });
  }

  const customer = store.getUserById(customer_id);
  const worker = store.getWorkerById(worker_id) || store.getWorkers().find(w => w.user_id === worker_id);

  if (!worker) {
    return res.status(404).json({ error: "Worker not found." });
  }

  const bookingDate = date || "Tomorrow";
  const bookingTime = time || "10:00 AM - 12:00 PM";

  // CALENDAR RULE: Prevent booking if slot is already permanently BOOKED (BUSY) by another confirmed booking
  const existingSlots = worker.calendar_slots || [];
  const bookedSlot = existingSlots.find(s => 
    s.status === 'booked' && 
    (s.date === bookingDate || s.time.includes(bookingTime) || bookingTime.includes(s.time))
  );

  if (bookedSlot) {
    return res.status(400).json({
      error: `The slot (${bookingDate} ${bookingTime}) is already booked and busy. Please select another available time.`
    });
  }

  const newBooking = {
    id: "bk_" + Date.now(),
    job_id: null,
    customer_id,
    customer_name: customer ? customer.name : "Customer",
    customer_mobile: customer ? customer.mobile : "9876543210",
    customer_location: location || (customer ? customer.location : "Green Park, South Delhi (approx. 1.2 km away)"),
    worker_id: worker.id,
    worker_name: worker.name,
    worker_mobile: worker.mobile || (store.getUserById(worker.user_id)?.mobile || "9811122233"),
    worker_trade: worker.trade,
    title,
    service: worker.trade,
    message: message || title,
    date: bookingDate,
    time: bookingTime,
    price: Number(price) || worker.hourly_rate || 450,
    status: "REQUESTED", // Direct request needs worker decision (Accept / Negotiate / Reject)
    escrow_id: null, // Escrow is NOT locked until worker accepts or agreement reached!
    rejection_reason: null,
    created_at: new Date().toISOString()
  };

  store.addBooking(newBooking);

  // CALENDAR RULE: Mark the slot as 'pending' (temporary request state, NOT permanently busy!)
  let slotUpdated = false;
  const updatedSlots = existingSlots.map(s => {
    if (!slotUpdated && (s.date === bookingDate || s.time.includes(bookingTime) || bookingTime.includes(s.time))) {
      slotUpdated = true;
      return { ...s, status: "pending", booking_id: newBooking.id };
    }
    return s;
  });

  if (!slotUpdated) {
    updatedSlots.push({
      id: "slot_req_" + Date.now(),
      date: bookingDate,
      time: bookingTime,
      status: "pending",
      booking_id: newBooking.id
    });
  }

  store.updateWorker(worker.id, { calendar_slots: updatedSlots });

  // Initialize conversation
  const conv = store.findOrCreateConversation(null, newBooking.id, customer_id, worker.id);
  store.addMessage({
    id: "msg_init_" + Date.now(),
    conversation_id: conv.id,
    sender_id: "system",
    sender_name: "LocalHands System",
    message: `📩 Private Booking Request sent by ${newBooking.customer_name}: "${newBooking.title}" for ₹${newBooking.price} on ${newBooking.date} (${newBooking.time}). Awaiting worker decision.`,
    is_proposal: false,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: "Private booking request sent to worker. Worker can Accept, Negotiate, or Reject.",
    booking: newBooking
  });
});

// List Bookings
router.get('/', (req, res) => {
  let bookings = store.getBookings();
  const { customer_id, worker_id, status } = req.query;

  if (customer_id) {
    bookings = bookings.filter(b => b.customer_id === customer_id);
  }

  if (worker_id) {
    bookings = bookings.filter(b => b.worker_id === worker_id);
  }

  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }

  // Enrich with Escrow details
  const enriched = bookings.map(b => {
    const escrow = b.escrow_id ? store.getEscrows().find(e => e.id === b.escrow_id) : store.getEscrowByBookingId(b.id);
    return {
      ...b,
      escrow: escrow || null
    };
  });

  res.json({
    count: enriched.length,
    bookings: enriched
  });
});

// Get Booking by ID
router.get('/:id', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found." });
  }

  const escrow = booking.escrow_id ? store.getEscrows().find(e => e.id === booking.escrow_id) : store.getEscrowByBookingId(booking.id);
  const worker = store.getWorkerById(booking.worker_id);
  const cancellation = store.getCancellations().find(c => c.booking_id === booking.id);

  res.json({
    booking,
    escrow,
    worker,
    cancellation: cancellation || null,
    can_call: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status),
    prototype_integrations: {
      escrow: "UPI / Escrow — Prototype",
      verification: "e-SHRAM & PM Vishwakarma — Prototype"
    }
  });
});

// WORKER ACCEPTS private booking request
// Transition: REQUESTED / NEGOTIATING -> CONFIRMED -> Calendar BUSY -> Escrow LOCKED
router.post('/:id/accept', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found." });
  }

  if (booking.status !== 'REQUESTED' && booking.status !== 'NEGOTIATING') {
    return res.status(400).json({ error: `Cannot accept. Current status is ${booking.status}.` });
  }

  const worker = store.getWorkerById(booking.worker_id);

  // 1. Lock calendar slot to 'booked' (BUSY)
  if (worker) {
    const slots = worker.calendar_slots || [];
    let matched = false;
    const updatedSlots = slots.map(s => {
      if (!matched && (s.booking_id === booking.id || (s.date === booking.date && s.time.includes(booking.time)))) {
        matched = true;
        return { ...s, status: "booked", booking_id: booking.id };
      }
      return s;
    });
    if (!matched) {
      updatedSlots.push({
        id: "slot_" + Date.now(),
        date: booking.date,
        time: booking.time,
        status: "booked",
        booking_id: booking.id
      });
    }
    store.updateWorker(worker.id, { calendar_slots: updatedSlots });
  }

  // 2. Create & Lock Escrow
  const escrow = {
    id: "esc_" + Date.now(),
    booking_id: booking.id,
    amount: booking.price,
    status: "LOCKED",
    upi_ref: "UPI-LH-" + Math.floor(100000000 + Math.random() * 900000000),
    locked_at: new Date().toISOString(),
    released_at: null,
    prototype_badge: "UPI / Escrow — Prototype"
  };
  store.addEscrow(escrow);

  // 3. Update Booking to CONFIRMED
  const updatedBooking = store.updateBooking(booking.id, {
    status: "CONFIRMED",
    escrow_id: escrow.id
  });

  // 4. Send chat message notification
  const conv = store.findOrCreateConversation(null, booking.id, booking.customer_id, booking.worker_id);
  store.addMessage({
    id: "msg_acc_" + Date.now(),
    conversation_id: conv.id,
    sender_id: "system",
    sender_name: "LocalHands System",
    message: `🎉 Booking confirmed! Worker ${booking.worker_name} has accepted. Calendar slot is now BUSY. Mock Escrow ₹${booking.price} locked. You can now chat or call!`,
    is_proposal: false,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Booking confirmed! Worker calendar slot is now BUSY and Mock Escrow is locked.",
    booking: updatedBooking,
    escrow
  });
});

// WORKER REJECTS private booking request
// Transition: REQUESTED / NEGOTIATING -> REJECTED -> Calendar slot restored to AVAILABLE
router.post('/:id/reject', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found." });
  }

  const { reason = "Unavailable" } = req.body;

  // Restore worker calendar slot back to available
  const worker = store.getWorkerById(booking.worker_id);
  if (worker && worker.calendar_slots) {
    const updatedSlots = worker.calendar_slots.map(s => {
      if (s.booking_id === booking.id && s.status !== 'booked') {
        return { ...s, status: "available", booking_id: null };
      }
      return s;
    });
    store.updateWorker(worker.id, { calendar_slots: updatedSlots });
  }

  const updatedBooking = store.updateBooking(booking.id, {
    status: "REJECTED",
    rejection_reason: reason
  });

  // Notify customer in chat
  const conv = store.findOrCreateConversation(null, booking.id, booking.customer_id, booking.worker_id);
  store.addMessage({
    id: "msg_rej_" + Date.now(),
    conversation_id: conv.id,
    sender_id: "system",
    sender_name: "LocalHands System",
    message: `⚠️ ${booking.worker_name} is unable to accept this booking request. Reason: ${reason}. Calendar slot has been released.`,
    is_proposal: false,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Booking request declined. Customer notified: "${booking.worker_name} is unable to accept this booking request."`,
    booking: updatedBooking
  });
});

// WORKER OR CUSTOMER NEGOTIATES private booking request
router.post('/:id/negotiate', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found." });
  }

  const { sender_id, proposed_price, proposed_time, message } = req.body;

  const updatedBooking = store.updateBooking(booking.id, {
    status: "NEGOTIATING",
    price: proposed_price ? Number(proposed_price) : booking.price,
    time: proposed_time || booking.time
  });

  // Record in conversation
  const conv = store.findOrCreateConversation(null, booking.id, booking.customer_id, booking.worker_id);
  const sender = store.getUserById(sender_id) || store.getWorkers().find(w => w.id === sender_id || w.user_id === sender_id);
  const senderName = sender ? sender.name : (sender_id === booking.customer_id ? booking.customer_name : booking.worker_name);

  store.addMessage({
    id: "msg_neg_" + Date.now(),
    conversation_id: conv.id,
    sender_id,
    sender_name: senderName,
    message: message || `Counter-proposal: ₹${proposed_price || booking.price}${proposed_time ? ` at ${proposed_time}` : ''}`,
    proposed_price: proposed_price ? Number(proposed_price) : booking.price,
    proposed_time: proposed_time || booking.time,
    is_proposal: true,
    proposal_status: "PENDING",
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Negotiation terms submitted. Booking status is NEGOTIATING.",
    booking: updatedBooking,
    conversation_id: conv.id
  });
});

// CONFIRM AGREEMENT (When mutual proposal agreement reached in chat)
router.post('/:id/confirm-agreement', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  const { agreed_price, agreed_time } = req.body;

  const finalPrice = agreed_price ? Number(agreed_price) : booking.price;
  const finalTime = agreed_time || booking.time;

  const worker = store.getWorkerById(booking.worker_id);

  // Lock calendar slot to 'booked' (BUSY)
  if (worker) {
    const slots = worker.calendar_slots || [];
    let matched = false;
    const updatedSlots = slots.map(s => {
      if (!matched && (s.booking_id === booking.id || (s.date === booking.date && s.time.includes(finalTime)))) {
        matched = true;
        return { ...s, status: "booked", booking_id: booking.id };
      }
      return s;
    });
    if (!matched) {
      updatedSlots.push({
        id: "slot_" + Date.now(),
        date: booking.date,
        time: finalTime,
        status: "booked",
        booking_id: booking.id
      });
    }
    store.updateWorker(worker.id, { calendar_slots: updatedSlots });
  }

  // Create & Lock Escrow
  const escrow = {
    id: "esc_" + Date.now(),
    booking_id: booking.id,
    amount: finalPrice,
    status: "LOCKED",
    upi_ref: "UPI-LH-" + Math.floor(100000000 + Math.random() * 900000000),
    locked_at: new Date().toISOString(),
    released_at: null,
    prototype_badge: "UPI / Escrow — Prototype"
  };
  store.addEscrow(escrow);

  const updatedBooking = store.updateBooking(booking.id, {
    status: "CONFIRMED",
    price: finalPrice,
    time: finalTime,
    escrow_id: escrow.id
  });

  res.json({
    success: true,
    message: "Negotiation agreed! Booking confirmed, calendar slot locked, and escrow locked.",
    booking: updatedBooking,
    escrow
  });
});

// Worker marks job as IN_PROGRESS (Started work)
router.post('/:id/start', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  const updated = store.updateBooking(booking.id, { status: "IN_PROGRESS" });
  res.json({ success: true, message: "Job marked In Progress.", booking: updated });
});

// Worker marks job as COMPLETED
router.post('/:id/complete', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  if (booking.status === 'COMPLETED' || booking.status === 'APPROVED') {
    return res.status(400).json({ error: "Job is already completed." });
  }

  const updated = store.updateBooking(booking.id, {
    status: "COMPLETED",
    completed_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Job marked as COMPLETED by worker. Awaiting customer approval for Escrow payment release.",
    booking: updated
  });
});

// Customer APPROVES completed work & releases mock escrow payment!
router.post('/:id/approve', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
    return res.status(400).json({ error: `Cannot approve job with status ${booking.status}.` });
  }

  // Release Escrow
  const escrow = booking.escrow_id ? store.getEscrows().find(e => e.id === booking.escrow_id) : store.getEscrowByBookingId(booking.id);
  if (escrow) {
    store.updateEscrow(escrow.id, {
      status: "RELEASED",
      released_at: new Date().toISOString()
    });
  }

  // Update Booking status to APPROVED
  const updatedBooking = store.updateBooking(booking.id, {
    status: "APPROVED",
    approved_at: new Date().toISOString()
  });

  // Increment worker completed jobs
  const worker = store.getWorkerById(booking.worker_id);
  if (worker) {
    store.updateWorker(worker.id, {
      jobs_completed: (worker.jobs_completed || 0) + 1
    });
  }

  res.json({
    success: true,
    message: "Work approved! Mock Escrow payment released to worker's bank/UPI account.",
    booking: updatedBooking,
    escrow: escrow ? { ...escrow, status: "RELEASED" } : null,
    prototype_badge: "UPI / Escrow — Prototype"
  });
});

// Cancel Booking with Mandatory Reason (Sent to Admin Review if confirmed)
router.post('/:id/cancel', (req, res) => {
  const booking = store.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found." });

  const { requested_by, requester_role = "customer", reason } = req.body;

  // Free worker calendar slot if was pending or booked
  const worker = store.getWorkerById(booking.worker_id);
  if (worker && worker.calendar_slots) {
    const updatedSlots = worker.calendar_slots.map(s => {
      if (s.booking_id === booking.id) {
        return { ...s, status: "available", booking_id: null };
      }
      return s;
    });
    store.updateWorker(worker.id, { calendar_slots: updatedSlots });
  }

  // If request was never confirmed (still REQUESTED or NEGOTIATING), no escrow was locked
  if (booking.status === 'REQUESTED' || booking.status === 'NEGOTIATING') {
    const updatedBooking = store.updateBooking(booking.id, {
      status: "CANCELLED",
      rejection_reason: reason || "Cancelled by customer before acceptance"
    });
    return res.json({
      success: true,
      message: "Booking request cancelled. Calendar slot released.",
      booking: updatedBooking
    });
  }

  // Post-confirmation cancellation requires a valid reason and creates an Admin review event
  if (!reason || reason.trim().length < 5) {
    return res.status(400).json({
      error: "Cancellation reason is mandatory for confirmed bookings. Please provide a clear explanation for platform review."
    });
  }

  // Create formal cancellation & dispute log for Admin
  const cancellationRecord = {
    id: "canc_" + Date.now(),
    booking_id: booking.id,
    requested_by: requested_by || booking.customer_id,
    requester_name: requester_role === 'worker' ? booking.worker_name : booking.customer_name,
    requester_role,
    reason: reason.trim(),
    status: "PENDING_REVIEW", // PENDING_REVIEW, REVIEWED, REFUND_APPROVED, DISPUTE_RESOLVED, DISMISSED
    admin_notes: "Awaiting platform operator review for escrow resolution.",
    created_at: new Date().toISOString()
  };

  store.addCancellation(cancellationRecord);

  // If escrow was locked, mark escrow status to DISPUTED
  const escrow = booking.escrow_id ? store.getEscrows().find(e => e.id === booking.escrow_id) : store.getEscrowByBookingId(booking.id);
  if (escrow && escrow.status === 'LOCKED') {
    store.updateEscrow(escrow.id, { status: "DISPUTED" });
  }

  const updatedBooking = store.updateBooking(booking.id, {
    status: "CANCELLED",
    cancellation_id: cancellationRecord.id
  });

  res.json({
    success: true,
    message: "Booking cancelled. Cancellation record registered with Admin Operations for escrow review.",
    booking: updatedBooking,
    cancellation: cancellationRecord
  });
});

export default router;
