// server/routes/escrow.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Lock Escrow for a Booking
router.post('/lock', (req, res) => {
  const { booking_id, amount } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: "booking_id is required." });
  }

  const booking = store.getBookingById(booking_id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found." });
  }

  let escrow = store.getEscrowByBookingId(booking_id);
  const lockAmount = Number(amount) || booking.price || 500;

  if (escrow) {
    escrow = store.updateEscrow(escrow.id, {
      amount: lockAmount,
      status: "LOCKED",
      locked_at: new Date().toISOString()
    });
  } else {
    escrow = {
      id: "esc_" + Date.now(),
      booking_id,
      amount: lockAmount,
      status: "LOCKED",
      upi_ref: "UPI-LH-" + Math.floor(100000000 + Math.random() * 900000000),
      locked_at: new Date().toISOString(),
      released_at: null,
      prototype_badge: "UPI / Escrow — Prototype"
    };
    store.addEscrow(escrow);
  }

  store.updateBooking(booking_id, { escrow_id: escrow.id });

  res.json({
    success: true,
    message: "Escrow funds locked successfully. Money is held securely until customer approval.",
    escrow,
    prototype_badge: "UPI / Escrow — Prototype"
  });
});

// Release Escrow upon work completion & customer approval
router.post('/release', (req, res) => {
  const { booking_id } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: "booking_id is required." });
  }

  const escrow = store.getEscrowByBookingId(booking_id);
  if (!escrow) {
    return res.status(404).json({ error: "Escrow record not found for this booking." });
  }

  if (escrow.status === 'RELEASED') {
    return res.status(400).json({ error: "Escrow funds have already been released." });
  }

  const updatedEscrow = store.updateEscrow(escrow.id, {
    status: "RELEASED",
    released_at: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Escrow payment released to worker UPI/Bank account.",
    escrow: updatedEscrow,
    prototype_badge: "UPI / Escrow — Prototype"
  });
});

// Get Escrow details
router.get('/:booking_id', (req, res) => {
  const escrow = store.getEscrowByBookingId(req.params.booking_id);
  if (!escrow) {
    return res.status(404).json({ error: "No escrow record found for this booking." });
  }

  res.json({
    escrow,
    prototype_badge: "UPI / Escrow — Prototype"
  });
});

export default router;
