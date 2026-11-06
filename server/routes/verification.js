// server/routes/verification.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Mock e-SHRAM Verification
router.post('/eshram', (req, res) => {
  const { uan, worker_name } = req.body;

  if (!uan) {
    return res.status(400).json({ error: "Universal Account Number (UAN) is required." });
  }

  // Realistic mock response
  res.json({
    success: true,
    prototype_badge: "e-SHRAM Verification — Prototype",
    verified: true,
    uan: uan.toUpperCase(),
    worker_name: worker_name || "Ramesh Kumar",
    category: "Unorganized Skilled Construction & Maintenance Worker",
    issued_by: "Ministry of Labour & Employment (Simulated)",
    verification_timestamp: new Date().toISOString(),
    notice: "PROTOTYPE ONLY: External government database is simulated with realistic mock response."
  });
});

// Mock PM Vishwakarma Verification
router.post('/pm-vishwakarma', (req, res) => {
  const { cert_id, trade, worker_name } = req.body;

  if (!cert_id) {
    return res.status(400).json({ error: "Certificate ID / Application ID is required." });
  }

  res.json({
    success: true,
    prototype_badge: "PM Vishwakarma Verification — Prototype",
    verified: true,
    cert_id: cert_id.toUpperCase(),
    trade: trade || "Plumbing & Sanitary Works",
    worker_name: worker_name || "Ramesh Kumar",
    skill_level: "Level 2 Certified Traditional Artisan & Craftsman",
    issued_by: "Ministry of Micro, Small and Medium Enterprises (Simulated)",
    verification_timestamp: new Date().toISOString(),
    notice: "PROTOTYPE ONLY: External government database is simulated with realistic mock response."
  });
});

// Toggle verification for a worker (Interactive Demo Feature)
router.post('/toggle', (req, res) => {
  const { worker_id, verification_type } = req.body;
  const worker = store.getWorkerById(worker_id);

  if (!worker) {
    return res.status(404).json({ error: "Worker not found." });
  }

  const status = { ...worker.verification_status };

  if (verification_type === 'eshram') {
    status.eshram.verified = !status.eshram.verified;
    if (status.eshram.verified && !status.eshram.uan) {
      status.eshram.uan = "UAN-" + Math.floor(1000 + Math.random() * 9000) + "-2341-9012";
    }
  } else if (verification_type === 'pm_vishwakarma') {
    status.pm_vishwakarma.verified = !status.pm_vishwakarma.verified;
    if (status.pm_vishwakarma.verified && !status.pm_vishwakarma.cert_id) {
      status.pm_vishwakarma.cert_id = "PMV-DEL-2025-" + Math.floor(1000 + Math.random() * 9000);
    }
  }

  const updated = store.updateWorker(worker.id, { verification_status: status });

  res.json({
    success: true,
    message: `Updated ${verification_type} status`,
    verification_status: updated.verification_status
  });
});

export default router;
