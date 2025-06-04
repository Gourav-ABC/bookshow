const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const {
  createBooking,
  cancelBooking,
  getUserBookingHistory,
} = require('../controllers/bookingController');

router.get('/user/history', authenticateToken, getUserBookingHistory);
router.post('/', authenticateToken, createBooking);
router.delete('admin/:id', authenticateToken, cancelBooking);

module.exports = router;
