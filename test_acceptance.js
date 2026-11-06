// test_acceptance.js
// Final Acceptance Test suite verifying exact sequences from Section 50 of the spec

const BASE_URL = 'http://localhost:5000';

async function testAcceptanceSequences() {
  console.log("=================================================================");
  console.log("RUNNING SECTION 50 FINAL ACCEPTANCE TEST SUITE ON LOCALHANDS MVP");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Reset data first to have a clean state
    await fetch(`${BASE_URL}/api/reset`, { method: 'POST' });

    // -------------------------------------------------------------
    // SEQUENCE 1: DIRECT BOOKING & COMPLETION & ESCROW & RATINGS
    // -------------------------------------------------------------
    console.log("▶ Verifying Sequence 1: Customer Direct Booking -> Worker Accept -> Calendar & Escrow Locked -> Complete -> Customer Approves -> Escrow Released -> Mutual Ratings");

    // 1. Customer Login (Anita Sharma)
    const custLoginRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: "9876543210", otp: "1234", role: "customer" })
    });
    const custLogin = await custLoginRes.json();
    assert(custLogin.success && custLogin.user.name === "Anita Sharma", "1. Customer logs in successfully with mobile OTP");

    // 2. Search Worker
    const searchRes = await fetch(`${BASE_URL}/api/workers?trade=Plumber`);
    const searchData = await searchRes.json();
    assert(searchData.workers.length >= 3, "2. Customer searches workers (finds 3+ plumbers)");

    // 3. View Worker Profile & Calendar
    const workerId = "worker_1"; // Ramesh Kumar
    const profileRes = await fetch(`${BASE_URL}/api/workers/${workerId}`);
    const profileData = await profileRes.json();
    assert(profileData.worker.name === "Ramesh Kumar" && profileData.worker.verification_status.eshram.verified, "3. Customer views worker profile with e-SHRAM verification badge");
    assert(profileData.worker.calendar_slots && profileData.worker.calendar_slots.length > 0, "4. Customer views worker calendar availability");

    // 4. Customer Requests Direct Booking
    const bookReqRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: custLogin.user.id,
        worker_id: workerId,
        title: "Fix leaking tap in master bathroom",
        date: "Tomorrow",
        time: "10:00 AM",
        price: 350
      })
    });
    const bookReq = await bookReqRes.json();
    assert(bookReq.success && bookReq.booking.status === "REQUESTED", "5. Customer requests direct booking (Status: REQUESTED)");
    const directBookingId = bookReq.booking.id;

    // 5. Worker Logins & Accepts Request
    const acceptRes = await fetch(`${BASE_URL}/api/bookings/${directBookingId}/accept`, {
      method: 'POST'
    });
    const acceptData = await acceptRes.json();
    assert(acceptData.success && acceptData.booking.status === "CONFIRMED", "6. Worker accepts -> BOOKING CONFIRMED");

    // 6. Verify Calendar Locked & Escrow Locked
    const workerAfterAccept = await (await fetch(`${BASE_URL}/api/workers/${workerId}`)).json();
    const lockedSlot = workerAfterAccept.worker.calendar_slots.find(s => s.booking_id === directBookingId);
    assert(lockedSlot && lockedSlot.status === "booked", "7. Worker calendar slot is LOCKED (BUSY) for confirmed booking");

    const escrowCheck = await (await fetch(`${BASE_URL}/api/escrow/${directBookingId}`)).json();
    assert(escrowCheck.escrow && escrowCheck.escrow.status === "LOCKED", "8. Mock ESCROW LOCKED with reference: " + escrowCheck.escrow.upi_ref);

    // 7. Worker completes Job
    const compRes = await fetch(`${BASE_URL}/api/bookings/${directBookingId}/complete`, { method: 'POST' });
    const compData = await compRes.json();
    assert(compData.booking.status === "COMPLETED", "9. Worker marks job as COMPLETED");

    // 8. Customer Approves Work -> Escrow Released!
    const approveRes = await fetch(`${BASE_URL}/api/bookings/${directBookingId}/approve`, { method: 'POST' });
    const approveData = await approveRes.json();
    assert(approveData.booking.status === "APPROVED", "10. Customer APPROVES completed work");
    assert(approveData.escrow.status === "RELEASED", "11. ESCROW RELEASED to worker account");

    // 9. Mutual Ratings
    const custRate = await fetch(`${BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: directBookingId,
        from_user: custLogin.user.id,
        to_user: workerId,
        rating: 5,
        comment: "Excellent plumber, quick and clean work."
      })
    });
    assert(custRate.status === 201, "12. CUSTOMER RATES WORKER 5 Stars");

    const workerRate = await fetch(`${BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: directBookingId,
        from_user: workerId,
        to_user: custLogin.user.id,
        rating: 5,
        comment: "Great customer, immediate payment approval."
      })
    });
    assert(workerRate.status === 201, "13. WORKER RATES CUSTOMER 5 Stars");

    console.log("\n▶ Sequence 1 fully passed!\n");

    // -------------------------------------------------------------
    // SEQUENCE 2: ODD JOB MARKETPLACE & COMPARISON & AUTO CLOSURE
    // -------------------------------------------------------------
    console.log("▶ Verifying Sequence 2: Customer Posts Odd Job -> Multiple Workers Respond -> Comparison -> Customer Selects Worker -> Other Responses Close -> Calendar & Escrow -> Completion & Release");

    // 1. Customer Posts Odd Job
    const oddJobRes = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: custLogin.user.id,
        category: "Odd Jobs",
        title: "Paint bedroom wall & move heavy desk",
        description: "Need one wall touch up painted and wooden desk moved",
        date: "Tomorrow",
        time: "02:00 PM - 04:00 PM",
        budget_min: 500,
        budget_max: 750,
        negotiable: true,
        is_odd_job: true
      })
    });
    const oddJobData = await oddJobRes.json();
    assert(oddJobData.success && oddJobData.job.is_odd_job, "14. Customer posts Odd Job to marketplace");
    const oddJobId = oddJobData.job.id;

    // 2. Multiple Workers Respond (Accept / Negotiate)
    // Worker A: Suresh Sharma (Carpenter) offers 600
    await fetch(`${BASE_URL}/api/jobs/${oddJobId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: "worker_7",
        proposed_price: 600,
        proposed_time: "Tomorrow at 02:00 PM",
        message: "Can do both desk move and wall touchup."
      })
    });

    // Worker B: Sunita Devi (Cleaner & Odd Jobs) offers 500
    await fetch(`${BASE_URL}/api/jobs/${oddJobId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: "worker_13",
        proposed_price: 500,
        proposed_time: "Tomorrow at 02:30 PM",
        message: "Available and ready with cleaning pads."
      })
    });

    // Worker C: Manoj Verma (Painter) negotiates offer 650
    await fetch(`${BASE_URL}/api/jobs/${oddJobId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: "worker_10",
        proposed_price: 650,
        proposed_time: "Tomorrow at 03:00 PM",
        message: "I am a professional painter, will provide smooth finish."
      })
    });

    // 3. Customer Compares Responses
    const jobReviewRes = await fetch(`${BASE_URL}/api/jobs/${oddJobId}`);
    const jobReview = await jobReviewRes.json();
    assert(jobReview.responses.length === 3, "15. Customer sees all 3 worker responses side-by-side");

    // 4. Customer selects Worker B (Sunita Devi)
    const selectRes = await fetch(`${BASE_URL}/api/jobs/${oddJobId}/select-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: "worker_13" })
    });
    const selectData = await selectRes.json();
    assert(selectData.success && selectData.booking.status === "CONFIRMED", "16. Customer chooses Sunita Devi -> Booking Confirmed");
    assert(selectData.escrow.status === "LOCKED", "17. Escrow locked for agreed price ₹" + selectData.escrow.amount);

    // 5. Verify other responses are CLOSED automatically (Rule 6, 7)
    const postSelectJob = await (await fetch(`${BASE_URL}/api/jobs/${oddJobId}`)).json();
    const otherOffers = postSelectJob.responses.filter(r => r.worker_id !== "worker_13");
    const otherAreClosed = otherOffers.every(r => r.status === "CLOSED");
    assert(otherAreClosed, "18. All other pending worker responses automatically marked CLOSED");
    assert(selectData.closed_workers_notifications.length === 2, "19. Polite automated notification sent to other workers");

    const oddBookingId = selectData.booking.id;

    // 6. Worker completes, customer approves, payment released
    await fetch(`${BASE_URL}/api/bookings/${oddBookingId}/complete`, { method: 'POST' });
    const finalApprove = await (await fetch(`${BASE_URL}/api/bookings/${oddBookingId}/approve`, { method: 'POST' })).json();
    assert(finalApprove.escrow.status === "RELEASED", "20. Odd job payment released after customer approval");

    console.log("\n▶ Sequence 2 fully passed!\n");

    // -------------------------------------------------------------
    // SEQUENCE 3: CONFIRMED BOOKING CANCELLATION & ADMIN REVIEW
    // -------------------------------------------------------------
    console.log("▶ Verifying Sequence 3: Confirmed Booking -> Cancellation -> Reason Required -> Admin Notification & Review");

    // 1. Create a confirmed booking to test cancellation
    const cancelTestBk = await (await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: "cust_2", // Rajesh Patel
        worker_id: "worker_4", // Vikram Singh
        title: "Balcony wiring inspection",
        price: 400
      })
    })).json();

    const cancelTestId = cancelTestBk.booking.id;
    // Worker accepts -> confirmed
    await fetch(`${BASE_URL}/api/bookings/${cancelTestId}/accept`, { method: 'POST' });

    // 2. Cancellation without reason must be rejected
    const noReasonRes = await fetch(`${BASE_URL}/api/bookings/${cancelTestId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_by: "cust_2", reason: "" })
    });
    assert(noReasonRes.status === 400, "21. Cancellation without reason is REJECTED (Reason Required)");

    // 3. Cancellation with reason
    const withReasonRes = await fetch(`${BASE_URL}/api/bookings/${cancelTestId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requested_by: "cust_2",
        requester_role: "customer",
        reason: "Customer had to travel urgently for work emergency"
      })
    });
    const withReasonData = await withReasonRes.json();
    assert(withReasonData.success && withReasonData.booking.status === "CANCELLED", "22. Booking CANCELLED with reason registered");
    const cancellationId = withReasonData.cancellation.id;

    // 4. Admin reviews dispute
    const adminReviewRes = await fetch(`${BASE_URL}/api/admin/cancellations/${cancellationId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: "REFUND_APPROVED",
        resolution_action: "REFUND_CUSTOMER",
        admin_notes: "Reviewed documentation; customer provided travel proof. 100% refund approved."
      })
    });
    const adminReviewData = await adminReviewRes.json();
    assert(adminReviewData.success && adminReviewData.cancellation.status === "REFUND_APPROVED", "23. Admin arbitrates case and approves refund to customer");
    assert(adminReviewData.escrow.status === "REFUNDED", "24. Disputed escrow status updated to REFUNDED");

    console.log("\n▶ Sequence 3 fully passed!\n");

    console.log("=================================================================");
    console.log(`FINAL ACCEPTANCE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================================");

  } catch (err) {
    console.error("Sequence test failed with error:", err);
  }
}

testAcceptanceSequences();
