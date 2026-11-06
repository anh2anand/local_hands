// server/routes/admin.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Admin Dashboard Metrics
router.get('/dashboard', (req, res) => {
  const users = store.getUsers();
  const workers = store.getWorkers();
  const bookings = store.getBookings();
  const jobs = store.getJobs();
  const escrows = store.getEscrows();
  const cancellations = store.getCancellations();

  // Financial aggregates
  const totalGMV = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const escrowLocked = escrows.filter(e => e.status === 'LOCKED').reduce((sum, e) => sum + e.amount, 0);
  const escrowReleased = escrows.filter(e => e.status === 'RELEASED').reduce((sum, e) => sum + e.amount, 0);
  const escrowDisputed = escrows.filter(e => e.status === 'DISPUTED').reduce((sum, e) => sum + e.amount, 0);

  // Status breakdown
  const activeBookings = bookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length;
  const pendingRequests = bookings.filter(b => b.status === 'REQUESTED').length;
  const completedBookings = bookings.filter(b => ['COMPLETED', 'APPROVED'].includes(b.status)).length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

  res.json({
    metrics: {
      total_gmv: totalGMV,
      escrow_locked: escrowLocked,
      escrow_released: escrowReleased,
      escrow_disputed: escrowDisputed,
      total_users: users.length,
      total_workers: workers.length,
      active_bookings: activeBookings,
      pending_requests: pendingRequests,
      completed_bookings: completedBookings,
      cancelled_bookings: cancelledBookings,
      open_jobs: jobs.filter(j => j.status === 'OPEN').length,
      pending_cancellations: cancellations.filter(c => c.status === 'PENDING_REVIEW').length
    },
    prototype_integrations: {
      eshram: "e-SHRAM Verification — Prototype",
      pm_vishwakarma: "PM Vishwakarma Verification — Prototype",
      bhashini: "Bhashini Integration — Prototype",
      escrow: "UPI / Escrow — Prototype"
    }
  });
});

// List all cancellations with reasons
router.get('/cancellations', (req, res) => {
  const cancellations = store.getCancellations();
  
  // Enrich with booking & escrow details
  const enriched = cancellations.map(c => {
    const booking = store.getBookingById(c.booking_id);
    const escrow = booking ? (store.getEscrows().find(e => e.id === booking.escrow_id) || store.getEscrowByBookingId(booking.id)) : null;
    return {
      ...c,
      booking,
      escrow
    };
  });

  res.json({
    count: enriched.length,
    cancellations: enriched
  });
});

// List disputes
router.get('/disputes', (req, res) => {
  const cancellations = store.getCancellations().filter(c => c.status === 'PENDING_REVIEW' || c.status === 'REVIEWED');
  const disputedEscrows = store.getEscrows().filter(e => e.status === 'DISPUTED');

  res.json({
    dispute_count: cancellations.length,
    disputes: cancellations,
    disputed_escrows: disputedEscrows
  });
});

// Review cancellation / dispute case
router.post('/cancellations/:id/review', (req, res) => {
  const cancellation = store.getCancellationById(req.params.id);
  if (!cancellation) {
    return res.status(404).json({ error: "Cancellation record not found." });
  }

  const { status, admin_notes, resolution_action } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Review status is required." });
  }

  const updatedCancellation = store.updateCancellation(cancellation.id, {
    status, // REFUND_APPROVED, PAY_WORKER, DISPUTE_RESOLVED, DISMISSED
    admin_notes: admin_notes || "Reviewed and resolved by operations admin.",
    reviewed_at: new Date().toISOString()
  });

  // Handle financial action on Escrow if specified
  const booking = store.getBookingById(cancellation.booking_id);
  let updatedEscrow = null;
  if (booking) {
    const escrow = store.getEscrowByBookingId(booking.id);
    if (escrow) {
      if (resolution_action === 'REFUND_CUSTOMER' || status === 'REFUND_APPROVED') {
        updatedEscrow = store.updateEscrow(escrow.id, {
          status: "REFUNDED",
          released_at: new Date().toISOString()
        });
      } else if (resolution_action === 'PAY_WORKER') {
        updatedEscrow = store.updateEscrow(escrow.id, {
          status: "RELEASED",
          released_at: new Date().toISOString()
        });
      }
    }
  }

  res.json({
    success: true,
    message: `Cancellation case reviewed. Decision: ${status}.`,
    cancellation: updatedCancellation,
    escrow: updatedEscrow
  });
});

export default router;
