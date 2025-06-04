const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const {
  createReview,
  getUserReviewHistory,
  getAllReviews,
  getReviewsByMovie,
} = require('../controllers/reviewController');

router.post('/', authenticateToken, createReview);
router.get('/user', authenticateToken, getUserReviewHistory);
router.get('/all', authenticateToken, getAllReviews);
router.get('/:movieId', getReviewsByMovie);
// router.delete('/:reviewId', authenticateToken, deleteReview);

module.exports = router;