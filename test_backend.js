// test_backend.js
// Automated test suite for LocalHands MVP backend APIs

async function runTests() {
  const BASE_URL = 'http://localhost:5000';
  console.log(`Starting LocalHands Backend Test Suite on ${BASE_URL}...`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', "Health check endpoint responds 200 OK");

    // 2. Demo accounts
    const demoRes = await fetch(`${BASE_URL}/api/auth/demo-users`);
    const demoData = await demoRes.json();
    assert(demoData.demo_accounts && demoData.demo_accounts.length >= 6, "Demo users list contains 6+ pre-configured accounts");

    // 3. Workers listing & filtering
    const workersRes = await fetch(`${BASE_URL}/api/workers`);
    const workersData = await workersRes.json();
    assert(workersData.workers.length >= 16, `Found ${workersData.workers.length} workers in seed data (minimum 16 across trades)`);

    // Verify 3 plumbers, 3 electricians, 3 carpenters, 3 painters
    const plumbers = workersData.workers.filter(w => w.trade.toLowerCase() === 'plumber');
    const electricians = workersData.workers.filter(w => w.trade.toLowerCase() === 'electrician');
    const carpenters = workersData.workers.filter(w => w.trade.toLowerCase() === 'carpenter');
    const painters = workersData.workers.filter(w => w.trade.toLowerCase() === 'painter');
    assert(plumbers.length >= 3, `Plumbers count: ${plumbers.length} (spec requires 3+)`);
    assert(electricians.length >= 3, `Electricians count: ${electricians.length} (spec requires 3+)`);
    assert(carpenters.length >= 3, `Carpenters count: ${carpenters.length} (spec requires 3+)`);
    assert(painters.length >= 3, `Painters count: ${painters.length} (spec requires 3+)`);

    // 4. Voice processing (Bhashini Prototype)
    const voiceRes = await fetch(`${BASE_URL}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "I need a plumber tomorrow at 10 AM" })
    });
    const voiceData = await voiceRes.json();
    assert(voiceData.trade === 'Plumber' && voiceData.date === 'Tomorrow', "Voice API extracts trade: Plumber and date: Tomorrow");
    assert(voiceData.matching_workers && voiceData.matching_workers.length > 0, "Voice API returns immediate matching workers");

    // Test Hindi voice query
    const hindiRes = await fetch(`${BASE_URL}/api/voice/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "Mujhe kal subah ek bijli wala electrician chahiye" })
    });
    const hindiData = await hindiRes.json();
    assert(hindiData.trade === 'Electrician', "Hindi voice query correctly mapped to Electrician");

    // 5. Post an Odd Job
    const postJobRes = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: "cust_1",
        category: "Odd Jobs",
        title: "Assemble IKEA wardrobe and mount wall mirror",
        description: "Need help assembling flat pack wardrobe today",
        budget_min: 500,
        budget_max: 700,
        negotiable: true,
        is_odd_job: true
      })
    });
    const postJobData = await postJobRes.json();
    assert(postJobRes.status === 201 && postJobData.job.id, "Odd Job posted successfully");
    const jobId = postJobData.job.id;

    // 6. Multiple workers respond (Rule 1, 2)
    // Worker 1 responds: Ramesh Kumar
    const resp1 = await fetch(`${BASE_URL}/api/jobs/${jobId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: "worker_1",
        proposed_price: 650,
        proposed_time: "Today at 04:00 PM",
        message: "I can bring power drill and assemble quickly."
      })
    });
    const resp1Data = await resp1.json();
    assert(resp1Data.success && resp1Data.response.proposed_price === 650, "Worker 1 submitted offer");

    // Worker 2 responds: Suresh Sharma
    const resp2 = await fetch(`${BASE_URL}/api/jobs/${jobId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: "worker_7",
        proposed_price: 550,
        proposed_time: "Today at 03:30 PM",
        message: "Experienced carpenter, will do for 550."
      })
    });
    const resp2Data = await resp2.json();
    assert(resp2Data.success && resp2Data.response.proposed_price === 550, "Worker 2 submitted offer");

    // Worker 3 responds: Sunita Devi
    const resp3 = await fetch(`${BASE_URL}/api/jobs/${jobId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: "worker_13",
        proposed_price: 500,
        proposed_time: "Today at 03:00 PM",
        message: "Can help with full assembly and cleaning."
      })
    });
    const resp3Data = await resp3.json();
    assert(resp3Data.success && resp3Data.response.proposed_price === 500, "Worker 3 submitted offer");

    // 7. Customer compares responses (Rule 4)
    const jobDetailsRes = await fetch(`${BASE_URL}/api/jobs/${jobId}`);
    const jobDetails = await jobDetailsRes.json();
    assert(jobDetails.responses.length === 3, "Customer sees all 3 worker responses for side-by-side comparison");

    // 8. Customer chooses Worker 2 (Suresh Sharma) -> Rules 5, 6, 7, 8, 9, 11
    const selectRes = await fetch(`${BASE_URL}/api/jobs/${jobId}/select-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: "worker_7" })
    });
    const selectData = await selectRes.json();
    assert(selectData.success, "Customer selected Worker 2");
    assert(selectData.booking && selectData.booking.status === "CONFIRMED", "Confirmed booking created");
    assert(selectData.escrow && selectData.escrow.status === "LOCKED", "Mock Escrow locked with UPI ref: " + selectData.escrow.upi_ref);
    assert(selectData.closed_workers_notifications.length === 2, "Other 2 worker responses closed and notifications dispatched");

    // Verify other responses are indeed CLOSED
    const postSelectJob = await (await fetch(`${BASE_URL}/api/jobs/${jobId}`)).json();
    const otherResponses = postSelectJob.responses.filter(r => r.worker_id !== "worker_7");
    const allClosed = otherResponses.every(r => r.status === "CLOSED");
    assert(allClosed, "All other pending responses marked CLOSED automatically");

    const bookingId = selectData.booking.id;

    // 9. Worker marks Job as COMPLETED
    const completeRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const completeData = await completeRes.json();
    assert(completeData.booking.status === "COMPLETED", "Job marked as COMPLETED by worker");

    // 10. Customer APPROVES completed work -> Escrow RELEASED (Rule 12)
    const approveRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const approveData = await approveRes.json();
    assert(approveData.booking.status === "APPROVED", "Job APPROVED by customer");
    assert(approveData.escrow.status === "RELEASED", "Escrow payment RELEASED to worker");

    // 11. Mutual Ratings
    const rate1 = await fetch(`${BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        from_user: "cust_1",
        to_user: "worker_7",
        rating: 5,
        comment: "Excellent carpentry and wardrobe assembly!"
      })
    });
    assert(rate1.status === 201, "Customer rated worker 5 stars");

    const rate2 = await fetch(`${BASE_URL}/api/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        from_user: "worker_7",
        to_user: "cust_1",
        rating: 5,
        comment: "Very polite household, prompt escrow approval."
      })
    });
    assert(rate2.status === 201, "Worker rated customer 5 stars");

    // 12. Direct Booking & Cancellation Flow with Mandatory Reason & Admin Review
    const directBkRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: "cust_1",
        worker_id: "worker_4",
        title: "Emergency MCB tripping repair",
        price: 450,
        date: "Tomorrow",
        time: "11:00 AM"
      })
    });
    const directBk = await directBkRes.json();
    const testBkId = directBk.booking.id;

    // Worker accepts direct request
    await fetch(`${BASE_URL}/api/bookings/${testBkId}/accept`, {
      method: 'POST'
    });

    // Attempt cancellation without reason -> should fail
    const invalidCancel = await fetch(`${BASE_URL}/api/bookings/${testBkId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_by: "cust_1", reason: "" })
    });
    assert(invalidCancel.status === 400, "Cancellation without reason rejected (Reason is mandatory)");

    // Cancellation with valid reason
    const validCancel = await fetch(`${BASE_URL}/api/bookings/${testBkId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requested_by: "cust_1",
        reason: "Tenant resolved switchboard issue on their own before worker departed."
      })
    });
    const cancelData = await validCancel.json();
    assert(cancelData.booking.status === "CANCELLED" && cancelData.cancellation.id, "Cancellation logged with Admin operations");

    // 13. Admin Dashboard & Review
    const adminDash = await (await fetch(`${BASE_URL}/api/admin/dashboard`)).json();
    assert(adminDash.metrics.total_users > 0 && adminDash.metrics.active_bookings >= 0, "Admin dashboard metrics calculated");

    const reviewRes = await fetch(`${BASE_URL}/api/admin/cancellations/${cancelData.cancellation.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: "REFUND_APPROVED",
        admin_notes: "Customer notified in advance; full refund approved."
      })
    });
    const reviewData = await reviewRes.json();
    assert(reviewData.cancellation.status === "REFUND_APPROVED", "Admin reviewed and approved cancellation refund");

    console.log(`\n=================================================`);
    console.log(`Test Suite Results: ${passed} passed, ${failed} failed.`);
    console.log(`=================================================`);

  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTests();
