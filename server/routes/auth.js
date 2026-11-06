// server/routes/auth.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Get list of demo personas for 1-click easy testing
router.get('/demo-users', (req, res) => {
  const users = store.getUsers();
  const workers = store.getWorkers();

  const demoAccounts = [
    {
      role: 'customer',
      role_label: 'Customer (Household)',
      user_id: 'cust_1',
      name: 'Anita Sharma',
      mobile: '9876543210',
      demo_otp: '1234',
      badge: 'Active Jobs & Bookings',
      location: 'Green Park, South Delhi'
    },
    {
      role: 'customer',
      role_label: 'Customer (Household)',
      user_id: 'cust_2',
      name: 'Rajesh Patel',
      mobile: '9876543211',
      demo_otp: '1234',
      badge: 'Disputed Cancellation Case',
      location: 'Andheri West, Mumbai'
    },
    {
      role: 'worker',
      role_label: 'Worker — Plumber',
      user_id: 'w_user_1',
      worker_id: 'worker_1',
      name: 'Ramesh Kumar',
      mobile: '9811122233',
      demo_otp: '1234',
      trade: 'Plumber',
      rating: 4.8,
      badge: 'e-SHRAM & PM Vishwakarma (Prototype)',
      location: 'Hauz Khas, New Delhi'
    },
    {
      role: 'worker',
      role_label: 'Worker — Electrician',
      user_id: 'w_user_4',
      worker_id: 'worker_4',
      name: 'Vikram Singh',
      mobile: '9822233344',
      demo_otp: '1234',
      trade: 'Electrician',
      rating: 4.9,
      badge: 'PM Vishwakarma Certified (Prototype)',
      location: 'Saket, New Delhi'
    },
    {
      role: 'worker',
      role_label: 'Worker — Cleaner & Odd Jobs',
      user_id: 'w_user_13',
      worker_id: 'worker_13',
      name: 'Sunita Devi',
      mobile: '9855566677',
      demo_otp: '1234',
      trade: 'Cleaner & Odd Jobs',
      rating: 4.9,
      badge: 'e-SHRAM Verified (Prototype)',
      location: 'R.K. Puram, New Delhi'
    },
    {
      role: 'worker',
      role_label: 'Worker — Carpenter & Odd Jobs',
      user_id: 'w_user_7',
      worker_id: 'worker_7',
      name: 'Suresh Sharma',
      mobile: '9833344455',
      demo_otp: '1234',
      trade: 'Carpenter & Odd Jobs',
      rating: 4.7,
      badge: 'e-SHRAM & PM Vishwakarma (Prototype)',
      location: 'Munirka, New Delhi'
    },
    {
      role: 'admin',
      role_label: 'Platform Admin',
      user_id: 'admin_1',
      name: 'LocalHands Operations Admin',
      mobile: '9999999999',
      demo_otp: '1234',
      badge: 'Full Operational Control',
      location: 'Connaught Place, New Delhi'
    }
  ];

  res.json({
    prototype_notice: "DEMO ONLY: All accounts and credentials are mock data for evaluation.",
    demo_accounts: demoAccounts
  });
});

// Step 1: Send mock OTP
router.post('/otp/send', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length < 10) {
    return res.status(400).json({ error: "Please provide a valid 10-digit mobile number." });
  }

  // Any 4 digit OTP works in prototype, default is 1234
  res.json({
    success: true,
    message: "OTP sent successfully to " + mobile,
    demo_otp: "1234",
    notice: "PROTOTYPE OTP: Use 1234 to log in instantly."
  });
});

// Step 2: Verify mock OTP and login / create
router.post('/otp/verify', (req, res) => {
  const { mobile, otp, role = 'customer', name } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: "Mobile number is required." });
  }

  // Verify mock OTP (Accepts 1234 or any 4 digit OTP for convenience)
  if (!otp || otp.length < 4) {
    return res.status(400).json({ error: "Invalid OTP. Please enter 1234 for demo verification." });
  }

  let user = store.getUserByMobile(mobile);
  let workerProfile = null;

  if (!user) {
    // Auto register for demo
    user = store.addUser({
      id: "user_" + Date.now(),
      name: name || (role === 'worker' ? 'New Skilled Worker' : 'New Customer'),
      mobile,
      role: role || 'customer',
      location: 'South Delhi, New Delhi',
      city: 'New Delhi',
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    });

    if (role === 'worker') {
      workerProfile = store.updateWorker("worker_" + Date.now(), {
        id: "worker_" + Date.now(),
        user_id: user.id,
        name: user.name,
        trade: "General Technician",
        skills: ["Home Maintenance", "Odd Jobs"],
        experience: "3 years",
        experience_years: 3,
        languages: ["Hindi", "English"],
        hourly_rate: 350,
        service_radius: 5,
        location: user.location,
        approx_distance: 1.5,
        rating: 5.0,
        reviews_count: 0,
        jobs_completed: 0,
        availability: "available",
        odd_jobs: true,
        bio: "Skilled technician ready to help with local repairs.",
        avatar: user.avatar,
        verification_status: {
          eshram: { verified: true, uan: "UAN-DEMO-001", label: "e-SHRAM Verified (Prototype)" },
          pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
          bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
          police_verified: true
        },
        calendar_slots: [
          { id: "s_new1", date: "Today", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null },
          { id: "s_new2", date: "Tomorrow", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null }
        ]
      });
    }
  } else {
    if (user.role === 'worker') {
      workerProfile = store.getWorkerByUserId(user.id);
    }
  }

  res.json({
    success: true,
    token: `demo-jwt-token-${user.id}-${Date.now()}`,
    user,
    worker_profile: workerProfile,
    is_demo: true,
    credentials_notice: "DEMO ONLY — Authorized prototype session"
  });
});

// Admin login
router.post('/admin/login', (req, res) => {
  const { username, password, mobile, otp } = req.body;

  // Accepts either admin / localhands123 OR mobile 9999999999 / 1234
  if (
    (username === 'admin' && password === 'localhands123') ||
    (mobile === '9999999999' && (otp === '1234' || !otp))
  ) {
    const adminUser = store.getUserById('admin_1');
    return res.json({
      success: true,
      token: `demo-admin-token-${Date.now()}`,
      user: adminUser,
      credentials_notice: "DEMO ONLY — Prototype Admin Session"
    });
  }

  res.status(401).json({
    error: "Invalid admin credentials. Use username: admin / password: localhands123 or mobile: 9999999999 / OTP: 1234"
  });
});

export default router;
