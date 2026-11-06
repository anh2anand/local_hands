// server/routes/jobs.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Create a new job or Odd Job
router.post('/', (req, res) => {
  const {
    customer_id,
    category,
    title,
    description,
    date = "Tomorrow",
    time = "10:00 AM - 12:00 PM",
    location_approx,
    radius = 3,
    budget_min = 400,
    budget_max = 600,
    negotiable = true,
    is_odd_job = false
  } = req.body;

  if (!customer_id || !title || !category) {
    return res.status(400).json({ error: "Missing required fields: customer_id, title, category." });
  }

  const customer = store.getUserById(customer_id);

  const newJob = {
    id: "job_" + Date.now(),
    customer_id,
    customer_name: customer ? customer.name : "Customer",
    customer_mobile: customer ? customer.mobile : "9876543210",
    category,
    title,
    description: description || title,
    date,
    time,
    location_approx: location_approx || (customer ? customer.location : "South Delhi (Approx. 2 km)"),
    radius: Number(radius),
    budget_min: Number(budget_min),
    budget_max: Number(budget_max),
    negotiable: Boolean(negotiable),
    is_odd_job: Boolean(is_odd_job || category.toLowerCase() === 'odd jobs'),
    status: "OPEN", // OPEN, ASSIGNED, COMPLETED, CANCELLED
    created_at: new Date().toISOString()
  };

  store.addJob(newJob);

  // Automatically find matching nearby workers to simulate notifying them
  const allWorkers = store.getWorkers();
  const matchingWorkers = allWorkers.filter(w => {
    if (newJob.is_odd_job) return w.odd_jobs === true;
    return w.trade.toLowerCase() === category.toLowerCase();
  });

  res.status(201).json({
    success: true,
    message: "Job posted successfully to marketplace. Nearby workers have been notified.",
    job: newJob,
    notified_workers_count: matchingWorkers.length,
    notified_workers: matchingWorkers.slice(0, 4).map(w => ({ id: w.id, name: w.name, trade: w.trade }))
  });
});

// List jobs with optional filters
router.get('/', (req, res) => {
  let jobs = store.getJobs();
  const { customer_id, category, is_odd_job, worker_id, status } = req.query;

  if (customer_id) {
    jobs = jobs.filter(j => j.customer_id === customer_id);
  }

  if (category && category !== 'all') {
    jobs = jobs.filter(j => j.category.toLowerCase() === category.toLowerCase());
  }

  if (is_odd_job === 'true') {
    jobs = jobs.filter(j => j.is_odd_job === true || j.category.toLowerCase() === 'odd jobs');
  }

  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }

  // If worker_id requested, enrich each job with whether this worker already responded
  const enrichedJobs = jobs.map(j => {
    const responses = store.getJobResponses(j.id);
    let worker_response = null;
    if (worker_id) {
      worker_response = responses.find(r => r.worker_id === worker_id) || null;
    }
    return {
      ...j,
      responses_count: responses.length,
      worker_response
    };
  });

  res.json({
    count: enrichedJobs.length,
    jobs: enrichedJobs
  });
});

// Get job details with all worker responses (for customer comparison)
router.get('/:id', (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const responses = store.getJobResponses(job.id);

  res.json({
    job,
    responses,
    responses_count: responses.length,
    selection_instructions: "Customer chooses the worker. Selecting a worker will confirm the booking, lock their calendar, lock mock escrow, and politely close all other pending responses."
  });
});

// Worker responds to a job (ACCEPT with proposed price/time/message)
router.post('/:id/respond', (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.status !== 'OPEN') {
    return res.status(400).json({ error: `Cannot respond. This job is already ${job.status}.` });
  }

  const { worker_id, proposed_price, proposed_time, message } = req.body;
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required." });
  }

  const worker = store.getWorkerById(worker_id) || store.getWorkers().find(w => w.user_id === worker_id);
  if (!worker) {
    return res.status(404).json({ error: "Worker profile not found." });
  }

  // Check if worker already responded
  const existing = store.getJobResponses(job.id).find(r => r.worker_id === worker.id);
  if (existing) {
    const updated = store.updateJobResponse(existing.id, {
      status: "ACCEPTED",
      proposed_price: Number(proposed_price) || job.budget_min,
      proposed_time: proposed_time || job.time,
      message: message || "I can complete this job with high quality workmanship."
    });
    return res.json({
      success: true,
      message: "Offer updated successfully.",
      response: updated
    });
  }

  const newResponse = {
    id: "resp_" + Date.now(),
    job_id: job.id,
    worker_id: worker.id,
    worker_name: worker.name,
    worker_trade: worker.trade,
    worker_rating: worker.rating,
    worker_distance: worker.approx_distance || 1.5,
    status: "ACCEPTED", // PENDING, ACCEPTED, NEGOTIATING, REJECTED, SELECTED, CLOSED
    proposed_price: Number(proposed_price) || job.budget_min,
    proposed_time: proposed_time || job.time,
    message: message || `Namaste! I am available and can do this for ₹${proposed_price || job.budget_min}.`,
    created_at: new Date().toISOString()
  };

  store.addJobResponse(newResponse);

  // NOTE: Rule 2: Receiving a request or responding does NOT make the worker BUSY.
  // Worker becomes BUSY only after confirmed selection/booking!

  res.status(201).json({
    success: true,
    message: "Offer submitted! The customer will compare all responses and choose.",
    response: newResponse
  });
});

// Worker or Customer negotiates (Counter-offer / proposed price or time change)
router.post('/:id/negotiate', (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const { worker_id, customer_id, proposed_price, proposed_time, message } = req.body;
  const targetWorkerId = worker_id;

  const response = store.getJobResponses(job.id).find(r => r.worker_id === targetWorkerId);
  if (!response) {
    return res.status(404).json({ error: "No response found for this worker on this job." });
  }

  const updated = store.updateJobResponse(response.id, {
    status: "NEGOTIATING",
    proposed_price: Number(proposed_price) || response.proposed_price,
    proposed_time: proposed_time || response.proposed_time,
    message: message || `Counter-proposal: ₹${proposed_price}`
  });

  // Also record message in conversation
  const conv = store.findOrCreateConversation(job.id, null, job.customer_id, targetWorkerId);
  store.addMessage({
    id: "msg_" + Date.now(),
    conversation_id: conv.id,
    sender_id: customer_id ? job.customer_id : targetWorkerId,
    sender_name: customer_id ? job.customer_name : response.worker_name,
    message: message || `Counter proposal: ₹${proposed_price} at ${proposed_time}`,
    proposed_price: Number(proposed_price),
    proposed_time: proposed_time || null,
    is_proposal: true,
    proposal_status: "PENDING",
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Negotiation offer recorded in chat and response card.",
    response: updated,
    conversation_id: conv.id
  });
});

// Worker rejects job
router.post('/:id/reject', (req, res) => {
  const { worker_id } = req.body;
  const response = store.getJobResponses(req.params.id).find(r => r.worker_id === worker_id);

  if (response) {
    store.updateJobResponse(response.id, { status: "REJECTED" });
  }

  res.json({
    success: true,
    message: "Job rejected / removed from worker queue."
  });
});

// CRITICAL FEATURE: Customer Selects Worker!
// Implements Specification Rules 5, 6, 7, 8, 9, 11
router.post('/:id/select-worker', (req, res) => {
  const job = store.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const { worker_id } = req.body;
  if (!worker_id) {
    return res.status(400).json({ error: "worker_id is required to select." });
  }

  const responses = store.getJobResponses(job.id);
  const selectedResponse = responses.find(r => r.worker_id === worker_id);

  if (!selectedResponse) {
    return res.status(404).json({ error: "Selected worker has not responded to this job." });
  }

  const worker = store.getWorkerById(worker_id);
  if (!worker) {
    return res.status(404).json({ error: "Worker details not found." });
  }

  // 1. Mark selected response as SELECTED
  store.updateJobResponse(selectedResponse.id, { status: "SELECTED" });

  // 2. Automatically mark all other pending/negotiating responses as CLOSED
  // (Customer does NOT need to manually reject each one!)
  const closedWorkersNotifications = [];
  responses.forEach(r => {
    if (r.worker_id !== worker_id && r.status !== 'REJECTED') {
      store.updateJobResponse(r.id, { status: "CLOSED" });
      closedWorkersNotifications.push({
        worker_id: r.worker_id,
        worker_name: r.worker_name,
        notification: "This job has been assigned to another worker. Thank you for responding."
      });
    }
  });

  // 3. Update Job status
  store.updateJob(job.id, {
    status: "ASSIGNED",
    assigned_worker_id: worker.id,
    assigned_worker_name: worker.name,
    agreed_price: selectedResponse.proposed_price
  });

  // 4. Create Confirmed Booking
  const agreedPrice = selectedResponse.proposed_price || job.budget_min;
  const agreedTime = selectedResponse.proposed_time || job.time;

  const newBooking = {
    id: "bk_" + Date.now(),
    job_id: job.id,
    customer_id: job.customer_id,
    customer_name: job.customer_name,
    customer_mobile: job.customer_mobile,
    customer_location: job.location_approx,
    worker_id: worker.id,
    worker_name: worker.name,
    worker_mobile: worker.mobile || (store.getUserById(worker.user_id)?.mobile || "9811122233"),
    worker_trade: worker.trade,
    title: job.title,
    date: job.date,
    time: agreedTime,
    price: agreedPrice,
    status: "CONFIRMED", // Booking is immediately CONFIRMED upon customer selection
    escrow_id: null,
    created_at: new Date().toISOString()
  };

  // 5. Rule 8 & 9: Lock selected worker's calendar slot & set status
  const currentSlots = worker.calendar_slots || [];
  let slotMatched = false;
  const updatedSlots = currentSlots.map(s => {
    if (!slotMatched && (s.date === job.date || s.time.includes(agreedTime))) {
      slotMatched = true;
      return { ...s, status: "booked", booking_id: newBooking.id };
    }
    return s;
  });

  if (!slotMatched) {
    updatedSlots.push({
      id: "slot_assigned_" + Date.now(),
      date: job.date,
      time: agreedTime,
      status: "booked",
      booking_id: newBooking.id
    });
  }

  // Update worker with locked slot
  store.updateWorker(worker.id, {
    calendar_slots: updatedSlots
    // Availability remains controlled, slot is locked
  });

  // 6. Rule 11: Escrow is locked after booking confirmation
  const escrow = {
    id: "esc_" + Date.now(),
    booking_id: newBooking.id,
    amount: agreedPrice,
    status: "LOCKED",
    upi_ref: "UPI-LH-" + Math.floor(100000000 + Math.random() * 900000000),
    locked_at: new Date().toISOString(),
    released_at: null,
    prototype_badge: "UPI / Escrow — Prototype"
  };
  store.addEscrow(escrow);

  newBooking.escrow_id = escrow.id;
  store.addBooking(newBooking);

  // 7. Create/link conversation
  const conv = store.findOrCreateConversation(job.id, newBooking.id, job.customer_id, worker.id);
  store.addMessage({
    id: "msg_conf_" + Date.now(),
    conversation_id: conv.id,
    sender_id: "system",
    sender_name: "LocalHands System",
    message: `🎉 Booking confirmed with ${worker.name} for ₹${agreedPrice}. Calendar slot locked. Escrow ₹${agreedPrice} securely locked. You can now chat or call!`,
    proposed_price: null,
    proposed_time: null,
    is_proposal: false,
    proposal_status: null,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Worker successfully selected! Booking confirmed and Escrow locked.",
    booking: newBooking,
    escrow,
    selected_worker: worker.name,
    closed_workers_notifications: closedWorkersNotifications,
    prototype_integrations: {
      escrow: "UPI / Escrow — Prototype"
    }
  });
});

export default router;
