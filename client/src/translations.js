// client/src/translations.js
// Multilingual dictionary for LocalHands (English & Hindi)
// Designed for ease of use by semi-skilled and skilled workers in India

export const translations = {
  en: {
    appName: "LocalHands",
    tagline: "Voice-First Local Skilled Workforce Marketplace",
    demoOnly: "DEMO ONLY",
    integrationsSimulated: "Simulated Integrations: Bhashini Voice AI (Mock) • e-SHRAM (Mock) • PM Vishwakarma (Mock) • UPI / Escrow (Mock)",
    resetSeedData: "Reset Seed Data",
    fullDesktopView: "Full Desktop View",
    mobileScreenFrame: "Mobile Device View",

    // Roles & Header
    customer: "Customer",
    worker: "Worker",
    admin: "Platform Admin",
    partnerDashboard: "Skilled Partner Dashboard",
    selectPersona: "Select Persona",
    instantDemo: "Instant Demo",
    customOtpLogin: "Custom Mobile OTP Login",

    // Navigation Tabs - Customer
    findWorkers: "Find Workers",
    myJobsMarketplace: "My Job Posts",
    activeBookings: "Active Bookings & Escrow",

    // Navigation Tabs - Worker
    requestsAndMarketplace: "New Requests & Marketplace",
    activeConfirmedJobs: "Active & Confirmed Jobs",
    manageCalendar: "Manage Calendar",
    profileAndVerification: "Profile & Verifications",

    // Common Actions
    call: "Call",
    message: "Message",
    chatFirst: "Chat First",
    negotiate: "Negotiate",
    accept: "Accept",
    reject: "Decline",
    proposeChange: "Propose Change",
    confirmBooking: "Confirm Booking",
    startWork: "Start Work",
    markCompleted: "Mark Work Completed",
    approveWork: "Approve Work & Release Payment",
    rateWorker: "Rate Worker",
    rateCustomer: "Rate Customer",
    cancelBooking: "Cancel Booking",
    postJob: "Post a Job",
    findSomeoneForMe: "Find Someone for Me",
    askVoice: "Voice Search (Bhashini)",

    // Statuses
    statusRequested: "REQUESTED",
    statusRequestedDesc: "Awaiting Worker Response",
    statusConfirmed: "CONFIRMED",
    statusInProgress: "IN PROGRESS",
    statusCompleted: "COMPLETED",
    statusApproved: "APPROVED & PAID",
    statusRejected: "DECLINED",
    statusCancelled: "CANCELLED",
    statusNegotiating: "NEGOTIATING",

    // Escrow
    escrowLocked: "Mock Escrow Locked",
    escrowReleased: "Escrow Payment Released",
    escrowPending: "Escrow Locks on Worker Acceptance",
    escrowSafeMessage: "held safely in mock escrow. Release only when work is completed to satisfaction.",

    // Trades
    trades: {
      "All": "All Trades",
      "Plumber": "Plumber",
      "Electrician": "Electrician",
      "Carpenter": "Carpenter",
      "Painter": "Painter",
      "Cleaner": "Cleaner",
      "Odd Jobs": "Odd Jobs",
      "AC Technician": "AC Technician",
      "Appliance Repair": "Appliance Repair",
      "Mason": "Mason",
      "Gardener": "Gardener"
    },

    // Worker Dashboard
    goodMorning: "Good morning",
    myAvailabilityStatus: "My Availability Status",
    available: "🟢 Available",
    busy: "🟡 Busy",
    offline: "⚪ Offline",
    newJobRequests: "New Job Requests",
    readyForOffers: "Ready for decision",
    confirmedBookingsCount: "Confirmed Bookings",
    rating: "Rating",
    reviews: "reviews",
    jobsCompleted: "jobs done",
    directRequestsTitle: "Direct Booking Requests (Private to You)",
    directRequestsDesc: "Customers requested you directly. You can Accept, Decline, or Propose another time.",
    noDirectRequests: "No pending direct booking requests right now.",
    acceptDirectRequest: "Accept Request",
    declineDirectRequest: "Decline",
    proposeAnotherTime: "Propose Another Time / Price",
    offerSubmitted: "Offer Submitted",
    proposed: "Proposed",
    updateOffer: "Update Offer",

    // Customer View
    exploreWorkersTitle: "Trusted Local Skilled Workers",
    exploreSubtitle: "Direct booking requires worker confirmation. Payment is safely protected by Escrow.",
    searchPlaceholder: "Search plumber, electrician, carpentry, odd jobs...",
    availableOnly: "Available Now",
    verifiedOnly: "Government Verified",
    directBookingRequestSent: "Booking request sent! Worker will review and accept or propose a change.",

    // Verification
    eshramVerified: "e-SHRAM Verified",
    pmVishwakarmaCertified: "PM Vishwakarma Certified",
    prototypeSandbox: "Prototype Sandbox",
    editProfile: "Edit Profile & Trade Rates",
    saveProfile: "Save Changes"
  },

  hi: {
    appName: "लोकलहैंड्स (LocalHands)",
    tagline: "भारत के कुशल कारीगरों के लिए आवाज़-आधारित स्थानीय बाज़ार",
    demoOnly: "डेमो केवल",
    integrationsSimulated: "सिम्युलेटेड सेवाएं: भाषिणी वॉइस AI • ई-श्रम (e-SHRAM) • पीएम विश्वकर्मा • UPI / एस्क्रो",
    resetSeedData: "सीड डेटा रीसेट करें",
    fullDesktopView: "डेस्कटॉप दृश्य",
    mobileScreenFrame: "मोबाइल स्क्रीन दृश्य",

    // Roles & Header
    customer: "ग्राहक (Customer)",
    worker: "कारीगर (Worker)",
    admin: "प्लेटफ़ॉर्म एडमिन",
    partnerDashboard: "कारीगर पार्टनर डैशबोर्ड",
    selectPersona: "डेमो प्रोफ़ाइल चुनें",
    instantDemo: "त्वरित डेमो",
    customOtpLogin: "मोबाइल OTP लॉगिन",

    // Navigation Tabs - Customer
    findWorkers: "कारीगर खोजें",
    myJobsMarketplace: "मेरे पोस्ट किए गए काम",
    activeBookings: "सक्रिय बुकिंग और एस्क्रो",

    // Navigation Tabs - Worker
    requestsAndMarketplace: "नए अनुरोध और खुला बाज़ार",
    activeConfirmedJobs: "सक्रिय और पक्की बुकिंग",
    manageCalendar: "कैलेंडर समय प्रबंधन",
    profileAndVerification: "प्रोफ़ाइल और सरकारी सत्यापन",

    // Common Actions
    call: "कॉल करें",
    message: "संदेश भेजें",
    chatFirst: "पहले बात करें",
    negotiate: "मोलभाव / बातचीत",
    accept: "स्वीकार करें (Accept)",
    reject: "अस्वीकार करें (Decline)",
    proposeChange: "नया समय/दाम प्रस्तावित करें",
    confirmBooking: "बुकिंग पक्की करें",
    startWork: "काम शुरू करें (In Progress)",
    markCompleted: "काम पूरा हुआ मार्क करें",
    approveWork: "काम स्वीकार करें और भुगतान जारी करें",
    rateWorker: "कारीगर को रेटिंग दें",
    rateCustomer: "ग्राहक को रेटिंग दें",
    cancelBooking: "बुकिंग रद्द करें",
    postJob: "काम पोस्ट करें",
    findSomeoneForMe: "मेरे लिए कारीगर ढूंढें",
    askVoice: "बोलकर खोजें (भाषिणी)",

    // Statuses
    statusRequested: "अनुरोध भेजा गया",
    statusRequestedDesc: "कारीगर के जवाब का इंतज़ार",
    statusConfirmed: "बुकिंग पक्की (Confirmed)",
    statusInProgress: "काम जारी है",
    statusCompleted: "काम पूरा हुआ",
    statusApproved: "स्वीकृत एवं भुगतान संपन्न",
    statusRejected: "अस्वीकृत",
    statusCancelled: "रद्द किया गया",
    statusNegotiating: "बातचीत जारी",

    // Escrow
    escrowLocked: "सुरक्षित एस्क्रो में जमा",
    escrowReleased: "कारीगर को भुगतान भेजा गया",
    escrowPending: "कारीगर की स्वीकृति पर एस्क्रो लॉक होगा",
    escrowSafeMessage: "रुपये सुरक्षित एस्क्रो में जमा हैं। पूरा काम होने के बाद ही जारी करें।",

    // Trades
    trades: {
      "All": "सभी काम",
      "Plumber": "प्लंबर (नलसाज)",
      "Electrician": "इलेक्ट्रीशियन (बिजली मिस्त्री)",
      "Carpenter": "बढ़ई (कारपेंटर)",
      "Painter": "पेंटर (रंगसाज)",
      "Cleaner": "सफाई कर्मचारी (क्लीनर)",
      "Odd Jobs": "छोटे-मोटे काम (Odd Jobs)",
      "AC Technician": "एसी तकनीशियन",
      "Appliance Repair": "उपकरण मरम्मत",
      "Mason": "राजमिस्त्री",
      "Gardener": "माली"
    },

    // Worker Dashboard
    goodMorning: "शुभ प्रभात",
    myAvailabilityStatus: "मेरी उपलब्धता स्थिति",
    available: "🟢 उपलब्ध (Available)",
    busy: "🟡 व्यस्त (Busy)",
    offline: "⚪ ऑफ़लाइन (Offline)",
    newJobRequests: "नए काम के अनुरोध",
    readyForOffers: "निर्णय के लिए तैयार",
    confirmedBookingsCount: "पक्की बुकिंग",
    rating: "रेटिंग",
    reviews: "समीक्षाएं",
    jobsCompleted: "काम पूरे किए",
    directRequestsTitle: "सीधे बुकिंग अनुरोध (आपके लिए विशेष)",
    directRequestsDesc: "ग्राहकों ने सीधे आपको चुना है। आप स्वीकार कर सकते हैं, मना कर सकते हैं या नया समय सुझा सकते हैं।",
    noDirectRequests: "फिलहाल कोई सीधा बुकिंग अनुरोध लंबित नहीं है।",
    acceptDirectRequest: "अनुरोध स्वीकार करें (Accept)",
    declineDirectRequest: "मना करें (Decline)",
    proposeAnotherTime: "नया समय या दाम सुझाएं",
    offerSubmitted: "प्रस्ताव भेजा गया",
    proposed: "प्रस्तावित",
    updateOffer: "प्रस्ताव बदलें",

    // Customer View
    exploreWorkersTitle: "भरोसेमंद स्थानीय कुशल कारीगर",
    exploreSubtitle: "सीधी बुकिंग के लिए कारीगर की स्वीकृति आवश्यक है। भुगतान एस्क्रो द्वारा सुरक्षित है।",
    searchPlaceholder: "प्लंबर, बिजली मिस्त्री, बढ़ई, सफाई, विविध काम खोजें...",
    availableOnly: "अभी उपलब्ध",
    verifiedOnly: "सरकारी सत्यापित",
    directBookingRequestSent: "बुकिंग अनुरोध भेजा गया! कारीगर समीक्षा करके स्वीकार करेगा।",

    // Verification
    eshramVerified: "ई-श्रम (e-SHRAM) सत्यापित",
    pmVishwakarmaCertified: "पीएम विश्वकर्मा प्रमाणित",
    prototypeSandbox: "प्रोटोटाइप सैंडबॉक्स",
    editProfile: "प्रोफ़ाइल और काम की दरें बदलें",
    saveProfile: "बदलाव सहेजें"
  }
};
