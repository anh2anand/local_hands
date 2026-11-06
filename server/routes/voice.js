// server/routes/voice.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// NLP Intent & Entity Extractor for Voice queries (English, Hindi, Hinglish)
// Prototype integration of Bhashini Voice AI
router.post('/process', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: "Voice transcript text is required." });
  }

  const query = text.toLowerCase().trim();

  // 1. Language detection (Mock Bhashini Speech/Language identification)
  let detectedLanguage = "English";
  const hindiKeywords = ["chahiye", "karna", "hai", "mujhe", "subah", "shaam", "dopahar", "aaj", "kal", "nal", "pankha", "safai", "kaam", "bhejo", "kharab", "bijli", "almari"];
  const matchesHindi = hindiKeywords.filter(k => query.includes(k));
  if (matchesHindi.length > 1) {
    detectedLanguage = "Hindi / Hinglish (Bhashini AI Prototype)";
  }

  // 2. Trade & Category extraction
  let detectedTrade = null;
  let isOddJob = false;

  if (query.match(/plumb|nal|tap|leak|pipe|geyser|drain|flush|paani|bathroom/)) {
    detectedTrade = "Plumber";
  } else if (query.match(/electr|bijli|wire|switch|mcb|fan|pankha|light|socket|inverter/)) {
    detectedTrade = "Electrician";
  } else if (query.match(/carpent|wood|furniture|door|shelf|cupboard|almari|bed|table|chair|badhai/)) {
    detectedTrade = "Carpenter";
  } else if (query.match(/paint|rang|whitewash|wall|texture|putty/)) {
    detectedTrade = "Painter";
  } else if (query.match(/clean|safai|deep clean|degrease|jhadu|terrace clean/)) {
    detectedTrade = "Cleaner";
  } else if (query.match(/\bac\b|air condition|cooling|gas charg|jet servic/)) {
    detectedTrade = "AC Technician";
  } else if (query.match(/appliance|washing machine|fridge|microwave|ro repair|motor/)) {
    detectedTrade = "Appliance Repair";
  } else if (query.match(/mason|rajmistri|tile|plaster|brick|cement/)) {
    detectedTrade = "Mason";
  } else if (query.match(/garden|mali|plant|lawn|flower|potting/)) {
    detectedTrade = "Gardener";
  } else if (query.match(/odd|heavy|move|shift|hang tv|curtain rod|small repair|chhota/)) {
    detectedTrade = "Odd Jobs";
    isOddJob = true;
  }

  // Default to Odd Jobs or Plumber if intent is general help
  if (!detectedTrade) {
    if (query.match(/help|kaam|repair|fix/)) {
      detectedTrade = "Odd Jobs";
      isOddJob = true;
    } else {
      detectedTrade = "Plumber"; // default sample
    }
  }

  // 3. Date extraction
  let date = "Tomorrow";
  if (query.includes("today") || query.includes("aaj")) {
    date = "Today";
  } else if (query.includes("tomorrow") || query.includes("kal")) {
    date = "Tomorrow";
  }

  // 4. Time extraction
  let time = "10:00 AM - 12:00 PM";
  if (query.match(/10\s*am|10:00/)) time = "10:00 AM";
  else if (query.match(/11\s*am|11:00/)) time = "11:00 AM";
  else if (query.match(/12\s*pm|12:00/)) time = "12:00 PM";
  else if (query.match(/2\s*pm|2:00/)) time = "02:00 PM";
  else if (query.match(/3\s*pm|3:00/)) time = "03:00 PM";
  else if (query.match(/4\s*pm|4:00/)) time = "04:00 PM";
  else if (query.includes("morning") || query.includes("subah")) time = "Morning (09:00 AM - 12:00 PM)";
  else if (query.includes("evening") || query.includes("shaam")) time = "Evening (04:00 PM - 07:00 PM)";
  else if (query.includes("afternoon") || query.includes("dopahar")) time = "Afternoon (01:00 PM - 04:00 PM)";

  // 5. Budget extraction
  let budget = 500;
  const budgetMatch = query.match(/(\d{3,4})/);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  // 6. Intent classification
  let intent = "find_worker";
  if (query.includes("post") || query.includes("need someone to") || query.includes("anyone available")) {
    intent = "post_job";
  } else if (query.includes("status") || query.includes("my booking") || query.includes("kahan pahuncha")) {
    intent = "track_booking";
  }

  // 7. Find matching workers to supply immediate recommendations
  const allWorkers = store.getWorkers();
  const matchedWorkers = allWorkers.filter(w => {
    if (isOddJob || detectedTrade === 'Odd Jobs') return w.odd_jobs === true;
    return w.trade.toLowerCase() === detectedTrade.toLowerCase();
  });

  res.json({
    intent,
    trade: detectedTrade,
    is_odd_job: isOddJob,
    date,
    time,
    budget,
    language: detectedLanguage,
    confidence: 0.94,
    transcribed_text: text,
    action_suggested: intent === 'find_worker' ? "SHOW_WORKERS" : "OPEN_POST_JOB",
    matching_workers: matchedWorkers.slice(0, 3),
    prototype_badge: "Bhashini Integration — Prototype"
  });
});

export default router;
