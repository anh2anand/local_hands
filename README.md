# LocalHands — Voice-First Skilled Labor Marketplace (MVP Prototype)

> **One-line Concept:** LocalHands is a voice-first marketplace connecting Indian households with trusted local skilled workers (plumbers, electricians, carpenters, painters, cleaners, odd jobs specialists) enabling discovery, job posting, negotiation, booking, communication, escrow-style payment, and mutual ratings.

---

## 🏷️ Prototype Integrations Disclaimer

This application is an early-stage startup MVP prototype. All external government, payment, and external AI services are simulated with realistic mock responses behind fully functional REST APIs:

* **Bhashini Integration — Prototype** (Speech recognition intent extraction for English, Hindi, and Hinglish queries)
* **e-SHRAM Verification — Prototype** (Simulated Ministry of Labour & Employment UAN verification badges)
* **PM Vishwakarma Verification — Prototype** (Simulated traditional artisan and craftsman certification)
* **UPI / Escrow — Prototype** (Simulated mock escrow locking, unique UPI reference IDs, and customer-triggered payment release)

---

## 👥 Demo Accounts (**DEMO ONLY**)

The platform features a persistent **1-Click Persona Switcher** in the top navigation bar to seamlessly test all roles without re-authenticating, as well as a Mobile OTP login modal.

All prototype credentials:
* **Default Demo OTP:** `1234`

| Persona | Role | Mobile Number | Focus Area / Demo State |
| :--- | :--- | :--- | :--- |
| **Anita Sharma** | Customer | `9876543210` | South Delhi, has active job offers & bookings |
| **Rajesh Patel** | Customer | `9876543211` | Mumbai, has a cancellation case under dispute |
| **Ramesh Kumar** | Worker (Plumber) | `9811122233` | 4.8★, e-SHRAM & PM Vishwakarma verified |
| **Vikram Singh** | Worker (Electrician) | `9822233344` | 4.9★, PM Vishwakarma certified |
| **Sunita Devi** | Worker (Cleaner & Odd Jobs) | `9855566677` | 4.9★, e-SHRAM verified, Odd Jobs specialist |
| **Suresh Sharma** | Worker (Carpenter & Odd Jobs) | `9833344455` | 4.7★, furniture assembly & odd repairs |
| **Operations Admin** | Platform Admin | `9999999999` | Review disputes, inspect cancellations, release refunds |

*Admin Login Credentials:* Username: `admin` | Password: `localhands123` (or Mobile: `9999999999` with OTP `1234`).

---

## 🚀 Running the Application

### Prerequisites
* Node.js (v18+)
* npm (v9+)

### Single-Port Unified Run (Recommended)
The Express server on port 5000 serves both the backend REST APIs and the built production client bundle:
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Development Mode (Concurrent)
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Frontend Client with Vite Hot Reload (Port 3000)
npm run client
```

---

## 🧪 Automated Test Suites

The project includes two end-to-end automated test suites:

### 1. Complete Backend Test Suite
Verifies all 10 endpoint modules, trade counts, NLP voice parsing, odd jobs marketplace, and state transitions:
```bash
node test_backend.js
```
*(Result: 29 passed, 0 failed)*

### 2. Section 50 Final Acceptance Test Suite
Verifies the exact three sequences mandated in Section 50 of the specification:
```bash
node test_acceptance.js
```
*(Result: 24 passed, 0 failed)*

#### Sequence 1 Verified:
`Customer Login → Search Worker → View Profile & Calendar → Direct Booking Request → Worker Accepts → Booking Confirmed → Calendar Locked → Escrow Locked → Worker Completes → Customer Approves → Escrow Released → Customer Rates Worker → Worker Rates Customer`

#### Sequence 2 Verified:
`Customer Posts Odd Job → Multiple Workers Respond (Accept/Negotiate) → Customer Compares Responses Side-by-Side → Customer Selects Worker → Other Worker Responses Automatically Closed → Selected Worker Confirmed → Calendar Locked → Escrow Locked → Completion → Payment Released`

#### Sequence 3 Verified:
`Confirmed Booking → Cancellation Triggered → Reason Mandatory (Rejected if empty) → Admin Registered → Admin Reviews & Approves Refund → Escrow Refunded`

---

## 🛠️ Architecture & Key Features

### 1. Voice-First Discovery (`/api/voice/process`)
* Utilizes the browser's Web Speech API with animated microphone interaction.
* Pre-configured quick-voice prompts for instant testing.
* Intent classifier extracts trade, preferred time slot, date, budget estimate, and language with confidence scoring.

### 2. Marketplace & Customer Comparison (Rule 1–6)
* A customer posting a job does **not** auto-book the first worker who accepts.
* The customer compares all responses side-by-side (proposed price, proposed time, worker distance, rating, message).
* When the customer selects a worker, the platform **automatically closes all other pending responses** and dispatches polite notifications.

### 3. Worker Controls Availability & Calendar Slot Locking (Rule 8 & 9)
* Workers toggle their status between **🟢 Available**, **🟡 Busy**, and **⚪ Offline**.
* A worker can receive multiple job requests without becoming busy.
* Only a confirmed booking locks the worker's calendar slot to prevent double-booking.

### 4. In-Chat Negotiation (Rule 10)
* Lightweight messaging system supporting text and structured price/time counter-proposals (`[Accept Proposal]` chip).

### 5. Simulated Masked Calling (Section 19)
* Realistic phone call interface with ringing animation, connection timer, mute, speaker, and `tel:` fallback.
* Private contact details remain masked prior to booking confirmation.

### 6. Escrow Payment State Machine (Rule 11 & 12)
* Escrow is locked only upon booking confirmation with a generated UPI reference (`UPI-LH-XXXXXXXXX`).
* Payment is released to the worker's account only after explicit customer approval.

### 7. Cancellation Protocol & Admin Dispute Arbitration
* Cancellations require a mandatory explanation.
* Disputed escrow funds are placed on hold.
* Admin dashboard allows operators to inspect cases, view reasons, and execute full refunds or payouts.
