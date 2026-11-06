// test_private_booking_flow.js
// Verification of Private Booking Flow:
// 1. Worker Decline with reason -> calendar freed, no escrow locked
// 2. Worker Propose Change -> status NEGOTIATING
// 3. Customer confirms counter-terms -> status CONFIRMED, calendar locked, escrow locked
// 4. Worker completes -> customer approves -> escrow released

const BASE_URL = 'http://localhost:5000';

async function testPrivateBookingFlow() {
  console.log("=================================================================");
  console.log("TESTING PRIVATE BOOKING FLOW: WORKER CONTROL & COUNTER-TERMS");
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
    // Reset data
    await fetch(`${BASE_URL}/api/reset`, { method: 'POST' });

    const workerId = "worker_4"; // Vikram Singh (Electrician)
    const customerId = "cust_1"; // Anita Sharma

    // Step 1: Customer sends private request to Vikram Singh
    console.log("▶ Step 1: Customer sends private request to Vikram Singh");
    const req1Res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        worker_id: workerId,
        title: "Install new inverter wiring in balcony",
        date: "Tomorrow",
        time: "02:00 PM",
        price: 500
      })
    });
    const req1Data = await req1Res.json();
    assert(req1Data.success && req1Data.booking.status === 'REQUESTED', "1. Private request created with status REQUESTED");
    assert(req1Data.booking.escrow_id === null, "2. Escrow is NOT locked for unconfirmed private request");

    const bookingId1 = req1Data.booking.id;

    // Step 2: Worker exercises control and DECLINES request
    console.log("\n▶ Step 2: Worker declines the request with explanation");
    const declineRes = await fetch(`${BASE_URL}/api/bookings/${bookingId1}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: "Currently busy with commercial project" })
    });
    const declineData = await declineRes.json();
    assert(declineData.success && declineData.booking.status === 'REJECTED', "3. Worker declines request -> status is REJECTED");
    assert(declineData.booking.rejection_reason === "Currently busy with commercial project", "4. Decline reason saved properly");

    // Verify calendar slot was released
    const workerCheck = await (await fetch(`${BASE_URL}/api/workers/${workerId}`)).json();
    const slotCheck = workerCheck.worker.calendar_slots.find(s => s.booking_id === bookingId1);
    assert(!slotCheck || slotCheck.status === 'available', "5. Worker calendar slot is freed/available after decline");

    // Step 3: Customer sends another request for an alternate slot
    console.log("\n▶ Step 3: Customer sends new private request for another time");
    const req2Res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        worker_id: workerId,
        title: "Install ceiling fan in bedroom",
        date: "Tomorrow",
        time: "10:00 AM",
        price: 400
      })
    });
    const req2Data = await req2Res.json();
    assert(req2Data.success && req2Data.booking.status === 'REQUESTED', "6. Second private request created with status REQUESTED");
    const bookingId2 = req2Data.booking.id;

    // Step 4: Worker PROPOSES CHANGE (Counter-terms: price 450, time 11:30 AM)
    console.log("\n▶ Step 4: Worker proposes change (Counter-terms)");
    const counterRes = await fetch(`${BASE_URL}/api/bookings/${bookingId2}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: workerId,
        proposed_price: 450,
        proposed_time: "Tomorrow at 11:30 AM",
        message: "Can do for ₹450 with heavy bracket assembly, available at 11:30 AM"
      })
    });
    const counterData = await counterRes.json();
    assert(counterData.success && counterData.booking.status === 'NEGOTIATING', "7. Worker proposes change -> status is NEGOTIATING");
    assert(counterData.booking.price === 450 && counterData.booking.time === "Tomorrow at 11:30 AM", "8. Counter price & time recorded on booking");

    // Step 5: Customer accepts proposed change & confirms agreement
    console.log("\n▶ Step 5: Customer accepts worker's counter-terms");
    const confirmRes = await fetch(`${BASE_URL}/api/bookings/${bookingId2}/confirm-agreement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agreed_price: 450,
        agreed_time: "Tomorrow at 11:30 AM"
      })
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.success && confirmData.booking.status === 'CONFIRMED', "9. Customer accepts proposal -> status is CONFIRMED");
    assert(confirmData.escrow && confirmData.escrow.status === 'LOCKED', "10. Mock Escrow is locked for ₹450 with ref: " + confirmData.escrow.upi_ref);

    // Step 6: Verify worker calendar slot is now locked
    const workerFinal = await (await fetch(`${BASE_URL}/api/workers/${workerId}`)).json();
    const confirmedSlot = workerFinal.worker.calendar_slots.find(s => s.booking_id === bookingId2);
    assert(confirmedSlot && confirmedSlot.status === 'booked', "11. Worker calendar slot is permanently LOCKED (BUSY) for confirmed agreement");

    // Step 7: Worker marks completed -> customer approves -> escrow released
    console.log("\n▶ Step 7: Completion & Escrow Release");
    const compRes = await fetch(`${BASE_URL}/api/bookings/${bookingId2}/complete`, { method: 'POST' });
    const compData = await compRes.json();
    assert(compData.booking.status === 'COMPLETED', "12. Worker marks completed");

    const approveRes = await fetch(`${BASE_URL}/api/bookings/${bookingId2}/approve`, { method: 'POST' });
    const approveData = await approveRes.json();
    assert(approveData.booking.status === 'APPROVED', "13. Customer approves completed work");
    assert(approveData.escrow.status === 'RELEASED', "14. Mock Escrow released to worker account");

    console.log(`\n=================================================================`);
    console.log(`PRIVATE BOOKING FLOW RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=================================================================`);

  } catch (err) {
    console.error("Test execution error:", err);
  }
}

testPrivateBookingFlow();
