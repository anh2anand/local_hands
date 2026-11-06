// server/routes/ratings.js
import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

// Submit Rating (Customer rates Worker OR Worker rates Customer)
router.post('/', (req, res) => {
  const { booking_id, from_user, to_user, rating, comment } = req.body;

  if (!booking_id || !from_user || !to_user || !rating) {
    return res.status(400).json({ error: "Missing required fields: booking_id, from_user, to_user, rating." });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  const fromUserObj = store.getUserById(from_user) || store.getWorkers().find(w => w.id === from_user || w.user_id === from_user);
  const fromName = fromUserObj ? fromUserObj.name : "User";

  const newRating = {
    id: "rate_" + Date.now(),
    booking_id,
    from_user,
    from_name: fromName,
    to_user,
    rating: numRating,
    comment: comment || (numRating >= 4 ? "Great professional experience!" : "Satisfactory service."),
    created_at: new Date().toISOString()
  };

  store.addRating(newRating);

  res.status(201).json({
    success: true,
    message: "Rating and review recorded successfully.",
    rating: newRating
  });
});

// Get ratings for a user or worker
router.get('/:user_id', (req, res) => {
  const ratings = store.getRatings(req.params.user_id);
  const average = ratings.length > 0
    ? Number((ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1))
    : 5.0;

  res.json({
    user_id: req.params.user_id,
    average_rating: average,
    total_reviews: ratings.length,
    ratings
  });
});

export default router;
