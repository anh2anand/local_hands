// server/routes/conversations.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// List conversations for user
router.get('/', (req, res) => {
  const { user_id } = req.query;
  const conversations = store.getConversations(user_id);

  // Enrich with last message
  const enriched = conversations.map(c => {
    const msgs = store.getMessages(c.id);
    const lastMsg = msgs[msgs.length - 1] || null;
    return {
      ...c,
      last_message: lastMsg,
      total_messages: msgs.length
    };
  });

  res.json({
    count: enriched.length,
    conversations: enriched
  });
});

// Start or get conversation
router.post('/start', (req, res) => {
  const { job_id, booking_id, customer_id, worker_id } = req.body;

  if (!customer_id || !worker_id) {
    return res.status(400).json({ error: "customer_id and worker_id are required." });
  }

  const conv = store.findOrCreateConversation(job_id, booking_id, customer_id, worker_id);
  const messages = store.getMessages(conv.id);

  res.json({
    conversation: conv,
    messages
  });
});

// Get conversation by ID with all messages
router.get('/:id', (req, res) => {
  const conv = store.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  const messages = store.getMessages(conv.id);
  const booking = conv.booking_id ? store.getBookingById(conv.booking_id) : null;
  const job = conv.job_id ? store.getJobById(conv.job_id) : null;

  res.json({
    conversation: conv,
    messages,
    booking,
    job
  });
});

// Send message (support regular text or structured negotiation proposal)
router.post('/:id/messages', (req, res) => {
  const conv = store.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  const { sender_id, message, proposed_price, proposed_time, is_proposal = false } = req.body;

  if (!sender_id || (!message && !proposed_price)) {
    return res.status(400).json({ error: "sender_id and message/proposed_price are required." });
  }

  const sender = store.getUserById(sender_id) || store.getWorkers().find(w => w.id === sender_id || w.user_id === sender_id);
  const senderName = sender ? sender.name : (sender_id.includes('worker') ? 'Worker' : 'Customer');

  const newMsg = {
    id: "msg_" + Date.now(),
    conversation_id: conv.id,
    sender_id,
    sender_name: senderName,
    message: message || `Proposed price: ₹${proposed_price}${proposed_time ? ` at ${proposed_time}` : ''}`,
    proposed_price: proposed_price ? Number(proposed_price) : null,
    proposed_time: proposed_time || null,
    is_proposal: Boolean(is_proposal || proposed_price),
    proposal_status: proposed_price ? "PENDING" : null,
    timestamp: new Date().toISOString()
  };

  store.addMessage(newMsg);

  // If this conversation is tied to a job response, also update the job response's negotiated price
  if (conv.job_id && proposed_price) {
    const responses = store.getJobResponses(conv.job_id);
    const resp = responses.find(r => r.worker_id === conv.worker_id);
    if (resp) {
      store.updateJobResponse(resp.id, {
        status: "NEGOTIATING",
        proposed_price: Number(proposed_price),
        proposed_time: proposed_time || resp.proposed_time
      });
    }
  }

  res.status(201).json({
    success: true,
    message: newMsg
  });
});

// Accept a negotiation proposal in chat
router.post('/:id/accept-proposal', (req, res) => {
  const { message_id } = req.body;
  const messages = store.getMessages(req.params.id);
  const msg = messages.find(m => m.id === message_id);

  if (!msg) {
    return res.status(404).json({ error: "Proposal message not found." });
  }

  msg.proposal_status = "ACCEPTED";

  // System message confirming proposal acceptance
  const confMsg = {
    id: "msg_prop_acc_" + Date.now(),
    conversation_id: req.params.id,
    sender_id: "system",
    sender_name: "LocalHands System",
    message: `🤝 Negotiation agreed: ₹${msg.proposed_price}${msg.proposed_time ? ` for ${msg.proposed_time}` : ''}. Click "Confirm Booking" to finalize.`,
    is_proposal: false,
    timestamp: new Date().toISOString()
  };
  store.addMessage(confMsg);

  res.json({
    success: true,
    agreed_price: msg.proposed_price,
    agreed_time: msg.proposed_time,
    message: confMsg
  });
});

export default router;
