// server/data/store.js
// In-Memory store with realistic Indian skilled workers, customers, bookings, and jobs.

export const initialData = () => {
  const users = [
    // Customers
    {
      id: "cust_1",
      name: "Anita Sharma",
      mobile: "9876543210",
      role: "customer",
      location: "Green Park, South Delhi",
      city: "New Delhi",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-10T10:00:00Z"
    },
    {
      id: "cust_2",
      name: "Rajesh Patel",
      mobile: "9876543211",
      role: "customer",
      location: "Andheri West, Mumbai",
      city: "Mumbai",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-02-15T10:00:00Z"
    },
    {
      id: "cust_3",
      name: "Priya Nair",
      mobile: "9876543212",
      role: "customer",
      location: "Indiranagar, Bengaluru",
      city: "Bengaluru",
      rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-02-20T10:00:00Z"
    },

    // Admin
    {
      id: "admin_1",
      name: "LocalHands Operations Admin",
      mobile: "9999999999",
      role: "admin",
      location: "Connaught Place, New Delhi",
      city: "New Delhi",
      rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      created_at: "2025-12-01T00:00:00Z"
    },

    // Workers (Users representation)
    {
      id: "w_user_1",
      name: "Ramesh Kumar",
      mobile: "9811122233",
      role: "worker",
      location: "Hauz Khas, New Delhi",
      city: "New Delhi",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-05T08:00:00Z"
    },
    {
      id: "w_user_2",
      name: "Sunil Yadav",
      mobile: "9811122234",
      role: "worker",
      location: "Malviya Nagar, New Delhi",
      city: "New Delhi",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-08T08:00:00Z"
    },
    {
      id: "w_user_3",
      name: "Deepak Verma",
      mobile: "9811122235",
      role: "worker",
      location: "Lajpat Nagar, New Delhi",
      city: "New Delhi",
      rating: 4.6,
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-12T08:00:00Z"
    },
    {
      id: "w_user_4",
      name: "Vikram Singh",
      mobile: "9822233344",
      role: "worker",
      location: "Saket, New Delhi",
      city: "New Delhi",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-04T08:00:00Z"
    },
    {
      id: "w_user_5",
      name: "Rajesh Sharma",
      mobile: "9822233345",
      role: "worker",
      location: "Kalkaji, New Delhi",
      city: "New Delhi",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-15T08:00:00Z"
    },
    {
      id: "w_user_6",
      name: "Amit Patel",
      mobile: "9822233346",
      role: "worker",
      location: "Greater Kailash, New Delhi",
      city: "New Delhi",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-20T08:00:00Z"
    },
    {
      id: "w_user_7",
      name: "Suresh Sharma",
      mobile: "9833344455",
      role: "worker",
      location: "Munirka, New Delhi",
      city: "New Delhi",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-09T08:00:00Z"
    },
    {
      id: "w_user_8",
      name: "Gurpreet Singh",
      mobile: "9833344456",
      role: "worker",
      location: "Vasant Kunj, New Delhi",
      city: "New Delhi",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-16T08:00:00Z"
    },
    {
      id: "w_user_9",
      name: "Mohan Lal",
      mobile: "9833344457",
      role: "worker",
      location: "Kotla Mubarakpur, New Delhi",
      city: "New Delhi",
      rating: 4.5,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-22T08:00:00Z"
    },
    {
      id: "w_user_10",
      name: "Manoj Verma",
      mobile: "9844455566",
      role: "worker",
      location: "Safdarjung Enclave, New Delhi",
      city: "New Delhi",
      rating: 4.6,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-14T08:00:00Z"
    },
    {
      id: "w_user_11",
      name: "Santosh Kumar",
      mobile: "9844455567",
      role: "worker",
      location: "Mehrauli, New Delhi",
      city: "New Delhi",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-18T08:00:00Z"
    },
    {
      id: "w_user_12",
      name: "Pradeep Roy",
      mobile: "9844455568",
      role: "worker",
      location: "Chirag Delhi, New Delhi",
      city: "New Delhi",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-25T08:00:00Z"
    },
    {
      id: "w_user_13",
      name: "Sunita Devi",
      mobile: "9855566677",
      role: "worker",
      location: "R.K. Puram, New Delhi",
      city: "New Delhi",
      rating: 4.9,
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-11T08:00:00Z"
    },
    {
      id: "w_user_14",
      name: "Abdul Karim",
      mobile: "9866677788",
      role: "worker",
      location: "Okhla, New Delhi",
      city: "New Delhi",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-19T08:00:00Z"
    },
    {
      id: "w_user_15",
      name: "Jagdish Prasad",
      mobile: "9877788899",
      role: "worker",
      location: "Badarpur, New Delhi",
      city: "New Delhi",
      rating: 4.7,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-07T08:00:00Z"
    },
    {
      id: "w_user_16",
      name: "Mahesh Mali",
      mobile: "9888899900",
      role: "worker",
      location: "Chanakyapuri, New Delhi",
      city: "New Delhi",
      rating: 4.8,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: "2026-01-21T08:00:00Z"
    }
  ];

  const workers = [
    // 3 PLUMBERS
    {
      id: "worker_1",
      user_id: "w_user_1",
      name: "Ramesh Kumar",
      trade: "Plumber",
      skills: ["Tap Leakage", "Pipe Fitting", "Bathroom Renovation", "Water Tank Cleaning", "Geyser Connection"],
      experience: "8 years",
      experience_years: 8,
      languages: ["Hindi", "Bhojpuri", "Basic English"],
      hourly_rate: 350,
      service_radius: 5,
      location: "Hauz Khas, New Delhi",
      approx_distance: 1.2,
      rating: 4.8,
      reviews_count: 78,
      jobs_completed: 142,
      availability: "available", // 'available' | 'busy' | 'offline'
      odd_jobs: true,
      bio: "Skilled plumber with 8+ years experience in South Delhi. Fast resolution for leaks, sanitary fittings and odd plumbing jobs.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-8899-2341-9012", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2025-4421", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s1", date: "Today", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null },
        { id: "s2", date: "Today", time: "02:00 PM - 04:00 PM", status: "available", booking_id: null },
        { id: "s3", date: "Tomorrow", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null },
        { id: "s4", date: "Tomorrow", time: "03:00 PM - 05:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_2",
      user_id: "w_user_2",
      name: "Sunil Yadav",
      trade: "Plumber",
      skills: ["Drain Blockage", "Kitchen Sinks", "Motor Repair", "Flush Tank"],
      experience: "5 years",
      experience_years: 5,
      languages: ["Hindi", "English"],
      hourly_rate: 300,
      service_radius: 4,
      location: "Malviya Nagar, New Delhi",
      approx_distance: 2.3,
      rating: 4.7,
      reviews_count: 52,
      jobs_completed: 98,
      availability: "available",
      odd_jobs: true,
      bio: "Quick and polite plumbing specialist. Expert in unclogging drains and kitchen pipe fixes.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-9912-4412-1100", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s5", date: "Today", time: "11:00 AM - 01:00 PM", status: "available", booking_id: null },
        { id: "s6", date: "Tomorrow", time: "09:00 AM - 11:00 AM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_3",
      user_id: "w_user_3",
      name: "Deepak Verma",
      trade: "Plumber",
      skills: ["Piping Installation", "Tap Repair", "RO Fitting", "Odd Jobs"],
      experience: "4 years",
      experience_years: 4,
      languages: ["Hindi"],
      hourly_rate: 280,
      service_radius: 6,
      location: "Lajpat Nagar, New Delhi",
      approx_distance: 3.1,
      rating: 4.6,
      reviews_count: 38,
      jobs_completed: 65,
      availability: "available",
      odd_jobs: false,
      bio: "Reliable plumber for all household piping and water line issues.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-3311-9082-5541", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: false
      },
      calendar_slots: [
        { id: "s7", date: "Today", time: "04:00 PM - 06:00 PM", status: "available", booking_id: null },
        { id: "s8", date: "Tomorrow", time: "02:00 PM - 04:00 PM", status: "available", booking_id: null }
      ]
    },

    // 3 ELECTRICIANS
    {
      id: "worker_4",
      user_id: "w_user_4",
      name: "Vikram Singh",
      trade: "Electrician",
      skills: ["Short Circuit Fix", "MCB Tripping", "Fan Installation", "Wiring", "Switchboard Repair"],
      experience: "9 years",
      experience_years: 9,
      languages: ["Hindi", "Punjabi", "English"],
      hourly_rate: 400,
      service_radius: 6,
      location: "Saket, New Delhi",
      approx_distance: 1.8,
      rating: 4.9,
      reviews_count: 110,
      jobs_completed: 215,
      availability: "available",
      odd_jobs: true,
      bio: "Certified master electrician. Specializes in emergency wiring fixes, chandelier hanging and heavy appliance points.",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-7761-4455-2233", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2024-1188", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s9", date: "Today", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null },
        { id: "s10", date: "Tomorrow", time: "11:00 AM - 01:00 PM", status: "available", booking_id: null },
        { id: "s11", date: "Tomorrow", time: "03:00 PM - 05:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_5",
      user_id: "w_user_5",
      name: "Rajesh Sharma",
      trade: "Electrician",
      skills: ["Inverter Setup", "LED Lighting", "Ceiling Fan", "Socket Repair"],
      experience: "6 years",
      experience_years: 6,
      languages: ["Hindi", "English"],
      hourly_rate: 350,
      service_radius: 5,
      location: "Kalkaji, New Delhi",
      approx_distance: 2.8,
      rating: 4.7,
      reviews_count: 67,
      jobs_completed: 120,
      availability: "available",
      odd_jobs: true,
      bio: "Honest and dependable electrical expert for home installations and safety audits.",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-5544-2211-9988", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s12", date: "Today", time: "01:00 PM - 03:00 PM", status: "available", booking_id: null },
        { id: "s13", date: "Tomorrow", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_6",
      user_id: "w_user_6",
      name: "Amit Patel",
      trade: "Electrician",
      skills: ["Appliance Wiring", "Doorbell Fix", "Smart Switches", "Meter Connection"],
      experience: "7 years",
      experience_years: 7,
      languages: ["Hindi", "Gujarati"],
      hourly_rate: 380,
      service_radius: 5,
      location: "Greater Kailash, New Delhi",
      approx_distance: 2.1,
      rating: 4.8,
      reviews_count: 84,
      jobs_completed: 160,
      availability: "available",
      odd_jobs: false,
      bio: "Prompt service across South Delhi for domestic electrical maintenance and repairs.",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-6655-3344-7711", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2025-9923", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s14", date: "Tomorrow", time: "09:00 AM - 11:00 AM", status: "available", booking_id: null },
        { id: "s15", date: "Tomorrow", time: "02:00 PM - 04:00 PM", status: "available", booking_id: null }
      ]
    },

    // 3 CARPENTERS
    {
      id: "worker_7",
      user_id: "w_user_7",
      name: "Suresh Sharma",
      trade: "Carpenter",
      skills: ["Furniture Assembly", "Door Lock Repair", "Cupboard Hinges", "Wooden Shelf Fixing", "Bed Repair"],
      experience: "10 years",
      experience_years: 10,
      languages: ["Hindi", "Marwari"],
      hourly_rate: 450,
      service_radius: 5,
      location: "Munirka, New Delhi",
      approx_distance: 1.4,
      rating: 4.7,
      reviews_count: 92,
      jobs_completed: 175,
      availability: "available",
      odd_jobs: true,
      bio: "Master woodworker. Great for IKEA/Pepperfry assembly, fixing jammed doors and custom small repairs.",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-1122-3344-5566", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2024-3312", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s16", date: "Today", time: "11:00 AM - 01:00 PM", status: "available", booking_id: null },
        { id: "s17", date: "Tomorrow", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_8",
      user_id: "w_user_8",
      name: "Gurpreet Singh",
      trade: "Carpenter",
      skills: ["Modular Kitchen", "Table Repair", "Wall Shelves", "Curtain Rods"],
      experience: "8 years",
      experience_years: 8,
      languages: ["Hindi", "Punjabi", "English"],
      hourly_rate: 420,
      service_radius: 7,
      location: "Vasant Kunj, New Delhi",
      approx_distance: 3.5,
      rating: 4.8,
      reviews_count: 73,
      jobs_completed: 130,
      availability: "available",
      odd_jobs: true,
      bio: "Experienced carpenter with full tool kit for fast fittings and odd carpentry jobs.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-4433-2211-7788", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s18", date: "Today", time: "02:00 PM - 04:00 PM", status: "available", booking_id: null },
        { id: "s19", date: "Tomorrow", time: "01:00 PM - 03:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_9",
      user_id: "w_user_9",
      name: "Mohan Lal",
      trade: "Carpenter",
      skills: ["Door Handles", "Window Latches", "Shoe Rack Fix", "Plywood Work"],
      experience: "6 years",
      experience_years: 6,
      languages: ["Hindi"],
      hourly_rate: 350,
      service_radius: 4,
      location: "Kotla Mubarakpur, New Delhi",
      approx_distance: 2.2,
      rating: 4.5,
      reviews_count: 45,
      jobs_completed: 82,
      availability: "available",
      odd_jobs: true,
      bio: "Budget-friendly carpenter for fast home fixes and small wooden repairs.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-9988-7766-5544", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: false
      },
      calendar_slots: [
        { id: "s20", date: "Tomorrow", time: "11:00 AM - 01:00 PM", status: "available", booking_id: null }
      ]
    },

    // 3 PAINTERS
    {
      id: "worker_10",
      user_id: "w_user_10",
      name: "Manoj Verma",
      trade: "Painter",
      skills: ["Wall Painting", "Touch-up Paint", "Waterproofing", "Ceiling Paint", "Putty Work"],
      experience: "7 years",
      experience_years: 7,
      languages: ["Hindi", "Bhojpuri"],
      hourly_rate: 350,
      service_radius: 5,
      location: "Safdarjung Enclave, New Delhi",
      approx_distance: 0.9,
      rating: 4.6,
      reviews_count: 59,
      jobs_completed: 104,
      availability: "available",
      odd_jobs: true,
      bio: "Clean painter for single rooms, touch-ups, balcony waterproofing, and odd wall repairs.",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-2233-4455-6677", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s21", date: "Today", time: "10:00 AM - 01:00 PM", status: "available", booking_id: null },
        { id: "s22", date: "Tomorrow", time: "09:00 AM - 12:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_11",
      user_id: "w_user_11",
      name: "Santosh Kumar",
      trade: "Painter",
      skills: ["Texture Paint", "Single Wall Accent", "Wood Polish", "Stenciling"],
      experience: "11 years",
      experience_years: 11,
      languages: ["Hindi", "English"],
      hourly_rate: 480,
      service_radius: 6,
      location: "Mehrauli, New Delhi",
      approx_distance: 2.9,
      rating: 4.9,
      reviews_count: 115,
      jobs_completed: 210,
      availability: "available",
      odd_jobs: true,
      bio: "High-finish interior painter. Specializes in accent walls and premium polish work.",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-8877-6655-4433", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2023-7741", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s23", date: "Today", time: "02:00 PM - 05:00 PM", status: "available", booking_id: null },
        { id: "s24", date: "Tomorrow", time: "11:00 AM - 02:00 PM", status: "available", booking_id: null }
      ]
    },
    {
      id: "worker_12",
      user_id: "w_user_12",
      name: "Pradeep Roy",
      trade: "Painter",
      skills: ["Exterior Paint", "Enamel Painting", "Door Painting", "Odd Touch-ups"],
      experience: "5 years",
      experience_years: 5,
      languages: ["Hindi", "Bengali"],
      hourly_rate: 320,
      service_radius: 4,
      location: "Chirag Delhi, New Delhi",
      approx_distance: 2.0,
      rating: 4.7,
      reviews_count: 41,
      jobs_completed: 75,
      availability: "available",
      odd_jobs: true,
      bio: "Speedy painter for grills, main doors, and quick touch-ups.",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-5566-7788-9900", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s25", date: "Tomorrow", time: "10:00 AM - 01:00 PM", status: "available", booking_id: null }
      ]
    },

    // CLEANER & ODD JOBS SPECIALIST
    {
      id: "worker_13",
      user_id: "w_user_13",
      name: "Sunita Devi",
      trade: "Cleaner",
      skills: ["Deep Cleaning", "Kitchen Degreasing", "Bathroom Scrubbing", "Terrace Cleaning", "Cupboard Shifting", "Odd Jobs"],
      experience: "8 years",
      experience_years: 8,
      languages: ["Hindi", "Haryanvi"],
      hourly_rate: 300,
      service_radius: 5,
      location: "R.K. Puram, New Delhi",
      approx_distance: 1.5,
      rating: 4.9,
      reviews_count: 140,
      jobs_completed: 280,
      availability: "available",
      odd_jobs: true,
      bio: "Highly trusted deep cleaning and household helper. Takes on heavy cleaning, balcony/terrace washing, and odd home chores.",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-9900-1122-3344", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2024-5511", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s26", date: "Today", time: "09:00 AM - 12:00 PM", status: "available", booking_id: null },
        { id: "s27", date: "Tomorrow", time: "08:00 AM - 11:00 AM", status: "available", booking_id: null },
        { id: "s28", date: "Tomorrow", time: "02:00 PM - 05:00 PM", status: "available", booking_id: null }
      ]
    },

    // AC TECHNICIAN & APPLIANCE REPAIR
    {
      id: "worker_14",
      user_id: "w_user_14",
      name: "Abdul Karim",
      trade: "AC Technician",
      skills: ["AC Service", "Gas Charging", "Split AC Installation", "Washing Machine Repair", "Appliance Repair"],
      experience: "9 years",
      experience_years: 9,
      languages: ["Hindi", "Urdu", "English"],
      hourly_rate: 450,
      service_radius: 8,
      location: "Okhla, New Delhi",
      approx_distance: 3.2,
      rating: 4.8,
      reviews_count: 88,
      jobs_completed: 165,
      availability: "available",
      odd_jobs: false,
      bio: "Certified HVAC & home appliance technician. Jet-pump AC servicing and genuine spare parts.",
      avatar: "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-4411-8899-0022", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2025-1029", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s29", date: "Today", time: "03:00 PM - 05:00 PM", status: "available", booking_id: null },
        { id: "s30", date: "Tomorrow", time: "10:00 AM - 12:00 PM", status: "available", booking_id: null }
      ]
    },

    // MASON
    {
      id: "worker_15",
      user_id: "w_user_15",
      name: "Jagdish Prasad",
      trade: "Mason",
      skills: ["Tile Replacement", "Plaster Repair", "Brick Work", "Marble Polishing", "Odd Jobs"],
      experience: "12 years",
      experience_years: 12,
      languages: ["Hindi", "Rajasthani"],
      hourly_rate: 400,
      service_radius: 6,
      location: "Badarpur, New Delhi",
      approx_distance: 4.1,
      rating: 4.7,
      reviews_count: 65,
      jobs_completed: 135,
      availability: "available",
      odd_jobs: true,
      bio: "Expert rajmistri for small masonry, broken tile replacement, and wall crack repair.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-6677-8899-0011", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: true, cert_id: "PMV-DEL-2023-8812", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s31", date: "Tomorrow", time: "09:00 AM - 01:00 PM", status: "available", booking_id: null }
      ]
    },

    // GARDENER
    {
      id: "worker_16",
      user_id: "w_user_16",
      name: "Mahesh Mali",
      trade: "Gardener",
      skills: ["Lawn Mowing", "Plant Repotting", "Hedge Trimming", "Balcony Garden Setup", "Odd Jobs"],
      experience: "7 years",
      experience_years: 7,
      languages: ["Hindi"],
      hourly_rate: 300,
      service_radius: 5,
      location: "Chanakyapuri, New Delhi",
      approx_distance: 2.4,
      rating: 4.8,
      reviews_count: 53,
      jobs_completed: 112,
      availability: "available",
      odd_jobs: true,
      bio: "Dedicated gardener with love for plants. Regular maintenance and seasonal flower potting.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verification_status: {
        eshram: { verified: true, uan: "UAN-3322-1100-9988", label: "e-SHRAM Verified (Prototype)" },
        pm_vishwakarma: { verified: false, cert_id: "", label: "PM Vishwakarma (Prototype)" },
        bhashini: { enabled: true, label: "Bhashini Voice AI (Prototype)" },
        police_verified: true
      },
      calendar_slots: [
        { id: "s32", date: "Today", time: "08:00 AM - 10:00 AM", status: "available", booking_id: null },
        { id: "s33", date: "Tomorrow", time: "07:00 AM - 09:00 AM", status: "available", booking_id: null }
      ]
    }
  ];

  // PRE-SEEDED JOBS
  const jobs = [
    {
      id: "job_101",
      customer_id: "cust_1",
      customer_name: "Anita Sharma",
      customer_mobile: "9876543210",
      category: "Odd Jobs",
      title: "Move heavy cupboard & hang 2 framed paintings",
      description: "Need help shifting a wooden wardrobe to the other room and securely hanging two heavy brass frames on the wall.",
      date: "Today",
      time: "03:00 PM - 05:00 PM",
      location_approx: "Green Park, South Delhi (approx. 1.2 km)",
      radius: 3,
      budget_min: 450,
      budget_max: 650,
      negotiable: true,
      status: "OPEN", // 'OPEN' | 'MATCHED' | 'ASSIGNED' | 'COMPLETED'
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "job_102",
      customer_id: "cust_1",
      customer_name: "Anita Sharma",
      customer_mobile: "9876543210",
      category: "Plumber",
      title: "Fix leaking kitchen mixer tap and under-sink pipe",
      description: "Kitchen mixer tap is continuously dripping and there is mild seepage under the kitchen sink.",
      date: "Tomorrow",
      time: "10:00 AM - 12:00 PM",
      location_approx: "Green Park, South Delhi (approx. 1.2 km)",
      radius: 4,
      budget_min: 400,
      budget_max: 600,
      negotiable: true,
      status: "OPEN",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  // PRE-SEEDED JOB RESPONSES (Showing multiple workers responding for Anita to compare!)
  const jobResponses = [
    // Responses for Job 101 (Odd Jobs)
    {
      id: "resp_1",
      job_id: "job_101",
      worker_id: "worker_7", // Suresh Sharma (Carpenter)
      worker_name: "Suresh Sharma",
      worker_trade: "Carpenter & Odd Jobs",
      worker_rating: 4.7,
      worker_distance: 1.4,
      status: "ACCEPTED", // PENDING, ACCEPTED, NEGOTIATING, REJECTED, SELECTED, CLOSED
      proposed_price: 550,
      proposed_time: "Today at 03:30 PM",
      message: "I have heavy duty furniture gliders and hammer drill for wall hanging. Can do nicely.",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "resp_2",
      job_id: "job_101",
      worker_id: "worker_13", // Sunita Devi (Cleaner & Odd Jobs)
      worker_name: "Sunita Devi",
      worker_trade: "Cleaner & Odd Jobs",
      worker_rating: 4.9,
      worker_distance: 1.5,
      status: "ACCEPTED",
      proposed_price: 500,
      proposed_time: "Today at 03:00 PM",
      message: "I will help move the cupboard carefully and clean behind it too. Can come right on time.",
      created_at: new Date(Date.now() - 2800000).toISOString()
    },
    {
      id: "resp_3",
      job_id: "job_101",
      worker_id: "worker_10", // Manoj Verma (Painter & Odd Jobs)
      worker_name: "Manoj Verma",
      worker_trade: "Painter & Odd Jobs",
      worker_rating: 4.6,
      worker_distance: 0.9,
      status: "ACCEPTED",
      proposed_price: 600,
      proposed_time: "Today at 04:00 PM",
      message: "Can do this and touch up any paint marks near the wall screws.",
      created_at: new Date(Date.now() - 1500000).toISOString()
    },

    // Responses for Job 102 (Plumber)
    {
      id: "resp_4",
      job_id: "job_102",
      worker_id: "worker_1", // Ramesh Kumar (Plumber)
      worker_name: "Ramesh Kumar",
      worker_trade: "Plumber",
      worker_rating: 4.8,
      worker_distance: 1.2,
      status: "ACCEPTED",
      proposed_price: 550,
      proposed_time: "Tomorrow at 10:00 AM",
      message: "Will bring new rubber washers and Teflon tape. 100% leak stoppage.",
      created_at: new Date(Date.now() - 1200000).toISOString()
    },
    {
      id: "resp_5",
      job_id: "job_102",
      worker_id: "worker_2", // Sunil Yadav
      worker_name: "Sunil Yadav",
      worker_trade: "Plumber",
      worker_rating: 4.7,
      worker_distance: 2.3,
      status: "ACCEPTED",
      proposed_price: 500,
      proposed_time: "Tomorrow at 11:00 AM",
      message: "I can visit at 11 AM and fix both tap and pipe.",
      created_at: new Date(Date.now() - 900000).toISOString()
    }
  ];

  // PRE-SEEDED BOOKINGS (Active and Past for demonstration)
  const bookings = [
    // Pre-seeded Active Confirmed Booking for Ramesh Kumar with Escrow locked
    {
      id: "bk_201",
      job_id: null,
      customer_id: "cust_1",
      customer_name: "Anita Sharma",
      customer_mobile: "9876543210",
      customer_location: "Flat 402, Green Park Main, South Delhi",
      worker_id: "worker_1",
      worker_name: "Ramesh Kumar",
      worker_mobile: "9811122233",
      worker_trade: "Plumber",
      title: "Bathroom Geyser Valve Replacement",
      date: "Tomorrow",
      time: "10:00 AM",
      price: 550,
      status: "CONFIRMED", // REQUESTED, CONFIRMED, IN_PROGRESS, COMPLETED, APPROVED, CANCELLED, REJECTED
      escrow_id: "esc_301",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    // Pre-seeded Completed & Approved Booking for Vikram Singh
    {
      id: "bk_202",
      job_id: null,
      customer_id: "cust_1",
      customer_name: "Anita Sharma",
      customer_mobile: "9876543210",
      customer_location: "Flat 402, Green Park Main, South Delhi",
      worker_id: "worker_4",
      worker_name: "Vikram Singh",
      worker_mobile: "9822233344",
      worker_trade: "Electrician",
      title: "Living Room Chandelier & Switchboard Fix",
      date: "Yesterday",
      time: "02:00 PM",
      price: 650,
      status: "APPROVED",
      escrow_id: "esc_302",
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    // Pre-seeded Cancelled Booking with Reason for Admin Review!
    {
      id: "bk_203",
      job_id: null,
      customer_id: "cust_2",
      customer_name: "Rajesh Patel",
      customer_mobile: "9876543211",
      customer_location: "Andheri West, Mumbai",
      worker_id: "worker_10",
      worker_name: "Manoj Verma",
      worker_mobile: "9844455566",
      worker_trade: "Painter",
      title: "Balcony Wall Waterproofing & Paint",
      date: "Yesterday",
      time: "11:00 AM",
      price: 800,
      status: "CANCELLED",
      escrow_id: "esc_303",
      cancellation_id: "canc_401",
      created_at: new Date(Date.now() - 250000000).toISOString()
    }
  ];

  // PRE-SEEDED ESCROWS
  const escrows = [
    {
      id: "esc_301",
      booking_id: "bk_201",
      amount: 550,
      status: "LOCKED", // PENDING, LOCKED, RELEASED, REFUNDED, DISPUTED
      upi_ref: "UPI-LH-992147823",
      locked_at: new Date(Date.now() - 86000000).toISOString(),
      released_at: null
    },
    {
      id: "esc_302",
      booking_id: "bk_202",
      amount: 650,
      status: "RELEASED",
      upi_ref: "UPI-LH-883491209",
      locked_at: new Date(Date.now() - 172000000).toISOString(),
      released_at: new Date(Date.now() - 80000000).toISOString()
    },
    {
      id: "esc_303",
      booking_id: "bk_203",
      amount: 800,
      status: "DISPUTED",
      upi_ref: "UPI-LH-112948231",
      locked_at: new Date(Date.now() - 240000000).toISOString(),
      released_at: null
    }
  ];

  // PRE-SEEDED CANCELLATIONS FOR ADMIN
  const cancellations = [
    {
      id: "canc_401",
      booking_id: "bk_203",
      requested_by: "cust_2",
      requester_name: "Rajesh Patel",
      requester_role: "customer",
      reason: "Worker got delayed by 3 hours without answering phone calls. Emergency repair needed.",
      status: "PENDING_REVIEW", // PENDING_REVIEW, REVIEWED, REFUND_APPROVED, DISPUTE_RESOLVED, DISMISSED
      admin_notes: "Customer requested 100% escrow refund. Worker claimed traffic jam.",
      created_at: new Date(Date.now() - 80000000).toISOString()
    }
  ];

  // PRE-SEEDED CONVERSATIONS & MESSAGES
  const conversations = [
    {
      id: "conv_501",
      job_id: "job_101",
      booking_id: null,
      customer_id: "cust_1",
      customer_name: "Anita Sharma",
      worker_id: "worker_7",
      worker_name: "Suresh Sharma",
      updated_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "conv_502",
      job_id: null,
      booking_id: "bk_201",
      customer_id: "cust_1",
      customer_name: "Anita Sharma",
      worker_id: "worker_1",
      worker_name: "Ramesh Kumar",
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const messages = [
    {
      id: "msg_1",
      conversation_id: "conv_501",
      sender_id: "cust_1",
      sender_name: "Anita Sharma",
      message: "Namaste Suresh ji, can you do this cupboard moving and frame hanging for ₹500?",
      proposed_price: 500,
      proposed_time: null,
      is_proposal: true,
      proposal_status: "COUNTERED",
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: "msg_2",
      conversation_id: "conv_501",
      sender_id: "worker_7",
      sender_name: "Suresh Sharma",
      message: "Namaste madam. The cupboard is solid wood and needs two people carefully shifting. I can do for ₹550 and will arrive at 3:30 PM with special pads so floor isn't scratched.",
      proposed_price: 550,
      proposed_time: "Today at 03:30 PM",
      is_proposal: true,
      proposal_status: "PENDING",
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "msg_3",
      conversation_id: "conv_502",
      sender_id: "cust_1",
      sender_name: "Anita Sharma",
      message: "Hi Ramesh, please remember to carry 1/2 inch brass elbow connector if possible.",
      proposed_price: null,
      proposed_time: null,
      is_proposal: false,
      proposal_status: null,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "msg_4",
      conversation_id: "conv_502",
      sender_id: "worker_1",
      sender_name: "Ramesh Kumar",
      message: "Haanji madam, I have original brass fittings with me. Will reach sharp at 10 AM.",
      proposed_price: null,
      proposed_time: null,
      is_proposal: false,
      proposal_status: null,
      timestamp: new Date(Date.now() - 3200000).toISOString()
    }
  ];

  // RATINGS
  const ratings = [
    {
      id: "rate_1",
      booking_id: "bk_202",
      from_user: "cust_1",
      from_name: "Anita Sharma",
      to_user: "worker_4",
      rating: 5,
      comment: "Vikram ji was extremely professional and fixed our chandelier safely with earthing checked!",
      created_at: new Date(Date.now() - 80000000).toISOString()
    },
    {
      id: "rate_2",
      booking_id: "bk_202",
      from_user: "worker_4",
      from_name: "Vikram Singh",
      to_user: "cust_1",
      rating: 5,
      comment: "Anita ji provided clear instructions and immediate payment approval. Great customer!",
      created_at: new Date(Date.now() - 79000000).toISOString()
    }
  ];

  return {
    users,
    workers,
    jobs,
    jobResponses,
    bookings,
    escrows,
    cancellations,
    conversations,
    messages,
    ratings
  };
};

// Global singleton in-memory database
class DataStore {
  constructor() {
    this.data = initialData();
  }

  reset() {
    this.data = initialData();
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id); }
  getUserByMobile(mobile) { return this.data.users.find(u => u.mobile === mobile); }
  addUser(user) {
    this.data.users.push(user);
    return user;
  }

  // Workers
  getWorkers() { return this.data.workers; }
  getWorkerById(id) { return this.data.workers.find(w => w.id === id); }
  getWorkerByUserId(userId) { return this.data.workers.find(w => w.user_id === userId); }
  updateWorker(id, updates) {
    const idx = this.data.workers.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.data.workers[idx] = { ...this.data.workers[idx], ...updates };
      return this.data.workers[idx];
    }
    return null;
  }

  // Jobs
  getJobs() { return this.data.jobs; }
  getJobById(id) { return this.data.jobs.find(j => j.id === id); }
  addJob(job) {
    this.data.jobs.unshift(job);
    return job;
  }
  updateJob(id, updates) {
    const idx = this.data.jobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
      return this.data.jobs[idx];
    }
    return null;
  }

  // Job Responses
  getJobResponses(jobId) {
    if (jobId) {
      return this.data.jobResponses.filter(r => r.job_id === jobId);
    }
    return this.data.jobResponses;
  }
  getJobResponsesByWorker(workerId) {
    return this.data.jobResponses.filter(r => r.worker_id === workerId);
  }
  getJobResponseById(id) {
    return this.data.jobResponses.find(r => r.id === id);
  }
  addJobResponse(resp) {
    this.data.jobResponses.push(resp);
    return resp;
  }
  updateJobResponse(id, updates) {
    const idx = this.data.jobResponses.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.jobResponses[idx] = { ...this.data.jobResponses[idx], ...updates };
      return this.data.jobResponses[idx];
    }
    return null;
  }

  // Bookings
  getBookings() { return this.data.bookings; }
  getBookingById(id) { return this.data.bookings.find(b => b.id === id); }
  addBooking(booking) {
    this.data.bookings.unshift(booking);
    return booking;
  }
  updateBooking(id, updates) {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.bookings[idx] = { ...this.data.bookings[idx], ...updates };
      return this.data.bookings[idx];
    }
    return null;
  }

  // Escrows
  getEscrows() { return this.data.escrows; }
  getEscrowByBookingId(bookingId) { return this.data.escrows.find(e => e.booking_id === bookingId); }
  addEscrow(escrow) {
    this.data.escrows.push(escrow);
    return escrow;
  }
  updateEscrow(id, updates) {
    const idx = this.data.escrows.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.escrows[idx] = { ...this.data.escrows[idx], ...updates };
      return this.data.escrows[idx];
    }
    return null;
  }

  // Cancellations
  getCancellations() { return this.data.cancellations; }
  getCancellationById(id) { return this.data.cancellations.find(c => c.id === id); }
  addCancellation(canc) {
    this.data.cancellations.unshift(canc);
    return canc;
  }
  updateCancellation(id, updates) {
    const idx = this.data.cancellations.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.cancellations[idx] = { ...this.data.cancellations[idx], ...updates };
      return this.data.cancellations[idx];
    }
    return null;
  }

  // Conversations & Messages
  getConversations(userId) {
    if (userId) {
      // Find worker id if userId belongs to worker
      const worker = this.getWorkerByUserId(userId);
      const workerId = worker ? worker.id : null;
      return this.data.conversations.filter(c => 
        c.customer_id === userId || c.worker_id === userId || (workerId && c.worker_id === workerId)
      );
    }
    return this.data.conversations;
  }
  getConversationById(id) {
    return this.data.conversations.find(c => c.id === id);
  }
  findOrCreateConversation(jobId, bookingId, customerId, workerId) {
    let conv = this.data.conversations.find(c => 
      (jobId && c.job_id === jobId && c.worker_id === workerId) ||
      (bookingId && c.booking_id === bookingId) ||
      (c.customer_id === customerId && c.worker_id === workerId && !jobId && !bookingId)
    );
    if (!conv) {
      const cust = this.getUserById(customerId);
      const worker = this.getWorkerById(workerId) || this.getUserById(workerId);
      conv = {
        id: "conv_" + Date.now(),
        job_id: jobId || null,
        booking_id: bookingId || null,
        customer_id: customerId,
        customer_name: cust ? cust.name : "Customer",
        worker_id: workerId,
        worker_name: worker ? worker.name : "Worker",
        updated_at: new Date().toISOString()
      };
      this.data.conversations.push(conv);
    }
    return conv;
  }
  getMessages(conversationId) {
    return this.data.messages.filter(m => m.conversation_id === conversationId);
  }
  addMessage(msg) {
    this.data.messages.push(msg);
    // Update conv timestamp
    const conv = this.getConversationById(msg.conversation_id);
    if (conv) conv.updated_at = msg.timestamp;
    return msg;
  }

  // Ratings
  getRatings(userId) {
    if (userId) {
      return this.data.ratings.filter(r => r.to_user === userId || r.from_user === userId);
    }
    return this.data.ratings;
  }
  addRating(rating) {
    this.data.ratings.unshift(rating);
    // Recalculate target user's rating
    const userRatings = this.data.ratings.filter(r => r.to_user === rating.to_user);
    if (userRatings.length > 0) {
      const avg = Number((userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1));
      const user = this.getUserById(rating.to_user);
      if (user) user.rating = avg;
      const worker = this.getWorkerById(rating.to_user) || this.getWorkerByUserId(rating.to_user);
      if (worker) {
        worker.rating = avg;
        worker.reviews_count = (worker.reviews_count || 0) + 1;
      }
    }
    return rating;
  }
}

export const store = new DataStore();
