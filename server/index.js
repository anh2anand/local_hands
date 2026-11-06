// server/index.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { store } from './data/store.js';
import authRoutes from './routes/auth.js';
import workersRoutes from './routes/workers.js';
import jobsRoutes from './routes/jobs.js';
import bookingsRoutes from './routes/bookings.js';
import escrowRoutes from './routes/escrow.js';
import conversationsRoutes from './routes/conversations.js';
import voiceRoutes from './routes/voice.js';
import ratingsRoutes from './routes/ratings.js';
import adminRoutes from './routes/admin.js';
import verificationRoutes from './routes/verification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    app: "LocalHands Prototype MVP",
    tagline: "Voice-first marketplace for skilled workers in India",
    version: "1.0.0-prototype",
    integrations_mock_notice: "DEMO ONLY: All external government & payment APIs (Bhashini, e-SHRAM, PM Vishwakarma, UPI Escrow) are simulated prototypes.",
    timestamp: new Date().toISOString()
  });
});

// Reset database endpoint for demo repeatability
app.post('/api/reset', (req, res) => {
  store.reset();
  res.json({
    success: true,
    message: "Data store reset to fresh seed state."
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);

// Serve static frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Fallback for SPA routing in Express 5
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      // In development when dist isn't built yet, return informative message
      res.status(200).send("LocalHands Backend API is running on port 5000. Run client via Vite dev server or npm run build.");
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LocalHands MVP Server running on http://localhost:${PORT}`);
  console.log(`⭐ Voice-First Indian Skilled Labor Marketplace`);
  console.log(`🏷️  Integrations: Bhashini (Mock), e-SHRAM (Mock), PM Vishwakarma (Mock), UPI Escrow (Mock)`);
  console.log(`=======================================================`);
});

export default app;
