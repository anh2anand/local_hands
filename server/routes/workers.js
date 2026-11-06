// server/routes/workers.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// List / Search Workers with multi-criteria filters
router.get('/', (req, res) => {
  let workers = store.getWorkers();
  const { trade, search, min_rating, verified_only, available_only, odd_jobs, max_distance } = req.query;

  if (trade && trade.toLowerCase() !== 'all') {
    if (trade.toLowerCase() === 'odd jobs') {
      workers = workers.filter(w => w.odd_jobs === true || w.trade.toLowerCase() === 'odd jobs');
    } else {
      workers = workers.filter(w => w.trade.toLowerCase() === trade.toLowerCase());
    }
  }

  if (odd_jobs === 'true') {
    workers = workers.filter(w => w.odd_jobs === true);
  }

  if (search) {
    const q = search.toLowerCase();
    workers = workers.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.trade.toLowerCase().includes(q) ||
      w.skills.some(s => s.toLowerCase().includes(q)) ||
      w.location.toLowerCase().includes(q)
    );
  }

  if (min_rating) {
    workers = workers.filter(w => w.rating >= parseFloat(min_rating));
  }

  if (available_only === 'true') {
    workers = workers.filter(w => w.availability === 'available');
  }

  if (verified_only === 'true') {
    workers = workers.filter(w =>
      w.verification_status.eshram.verified || w.verification_status.pm_vishwakarma.verified
    );
  }

  if (max_distance) {
    workers = workers.filter(w => (w.approx_distance || 2.0) <= parseFloat(max_distance));
  }

  // Sort by rating desc, then distance asc
  workers.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return (a.approx_distance || 0) - (b.approx_distance || 0);
  });

  res.json({
    count: workers.length,
    workers,
    prototype_integrations: {
      bhashini: "Bhashini Integration — Prototype",
      eshram: "e-SHRAM Verification — Prototype",
      pm_vishwakarma: "PM Vishwakarma Verification — Prototype"
    }
  });
});

// Instant Match: "Find Someone for Me"
// Recommends the best available worker using Trade, Distance, Rating, Availability, Verification
router.post('/match', (req, res) => {
  const { trade, preferred_time, location, budget, is_odd_job } = req.body;

  let candidates = store.getWorkers();

  if (trade && trade.toLowerCase() !== 'all') {
    if (trade.toLowerCase() === 'odd jobs' || is_odd_job) {
      candidates = candidates.filter(w => w.odd_jobs === true || w.trade.toLowerCase() === 'odd jobs');
    } else {
      candidates = candidates.filter(w => w.trade.toLowerCase() === trade.toLowerCase());
    }
  } else if (is_odd_job) {
    candidates = candidates.filter(w => w.odd_jobs === true);
  }

  if (candidates.length === 0) {
    candidates = store.getWorkers(); // fallback to best available
  }

  // Score candidate workers
  const scored = candidates.map(w => {
    let score = 0;
    const reasons = [];

    // Availability score (30 pts)
    if (w.availability === 'available') {
      score += 30;
      reasons.push("Currently Available");
    } else if (w.availability === 'busy') {
      score += 10;
    }

    // Rating score (up to 25 pts)
    const ratingScore = (w.rating / 5) * 25;
    score += ratingScore;
    reasons.push(`${w.rating}★ Customer Rating`);

    // Distance score (up to 20 pts)
    const dist = w.approx_distance || 3.0;
    const distScore = Math.max(0, 20 - (dist * 3));
    score += distScore;
    reasons.push(`${dist} km away in nearby radius`);

    // Verification score (15 pts)
    if (w.verification_status?.eshram?.verified) {
      score += 8;
      reasons.push("e-SHRAM Verified");
    }
    if (w.verification_status?.pm_vishwakarma?.verified) {
      score += 7;
      reasons.push("PM Vishwakarma Certified");
    }

    // Experience score (10 pts)
    const expScore = Math.min(10, (w.experience_years || 5));
    score += expScore;
    reasons.push(`${w.experience} field experience`);

    return {
      worker: w,
      match_score: Math.round(score),
      reasons
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  const bestMatch = scored[0] || null;
  const alternates = scored.slice(1, 4).map(s => s.worker);

  res.json({
    success: true,
    recommendation_only: true,
    note: "This provides intelligent recommendations. It does NOT automatically book without customer confirmation.",
    best_match: bestMatch ? bestMatch.worker : null,
    match_score: bestMatch ? bestMatch.match_score : 0,
    match_reasons: bestMatch ? bestMatch.reasons : [],
    alternate_matches: alternates
  });
});

// Worker Details
router.get('/:id', (req, res) => {
  const worker = store.getWorkerById(req.params.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  // Get worker ratings & reviews
  const ratings = store.getRatings(worker.id) || store.getRatings(worker.user_id);

  res.json({
    worker,
    ratings,
    prototype_integrations: {
      eshram: "e-SHRAM Verification — Prototype",
      pm_vishwakarma: "PM Vishwakarma Verification — Prototype"
    }
  });
});

// Update Worker Availability
router.put('/:id/availability', (req, res) => {
  const { availability } = req.body;
  if (!['available', 'busy', 'offline'].includes(availability)) {
    return res.status(400).json({ error: "Invalid availability status. Must be available, busy, or offline." });
  }

  const updated = store.updateWorker(req.params.id, { availability });
  if (!updated) {
    return res.status(404).json({ error: "Worker not found" });
  }

  res.json({
    success: true,
    message: `Availability updated to ${availability}`,
    worker: updated
  });
});

// Update Worker Calendar Slots
router.put('/:id/calendar', (req, res) => {
  const { calendar_slots } = req.body;
  if (!calendar_slots || !Array.isArray(calendar_slots)) {
    return res.status(400).json({ error: "calendar_slots must be an array." });
  }

  const updated = store.updateWorker(req.params.id, { calendar_slots });
  if (!updated) {
    return res.status(404).json({ error: "Worker not found" });
  }

  res.json({
    success: true,
    message: "Calendar slots updated successfully",
    calendar_slots: updated.calendar_slots
  });
});

// Update Worker Profile
router.put('/:id/profile', (req, res) => {
  const { trade, skills, experience, languages, hourly_rate, service_radius, bio, odd_jobs } = req.body;

  const updates = {};
  if (trade !== undefined) updates.trade = trade;
  if (skills !== undefined) updates.skills = skills;
  if (experience !== undefined) updates.experience = experience;
  if (languages !== undefined) updates.languages = languages;
  if (hourly_rate !== undefined) updates.hourly_rate = Number(hourly_rate);
  if (service_radius !== undefined) updates.service_radius = Number(service_radius);
  if (bio !== undefined) updates.bio = bio;
  if (odd_jobs !== undefined) updates.odd_jobs = Boolean(odd_jobs);

  const updated = store.updateWorker(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Worker not found" });
  }

  res.json({
    success: true,
    message: "Worker profile updated successfully",
    worker: updated
  });
});

export default router;
