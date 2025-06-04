const express = require('express');
const { updateMovie, cancelBooking, getAllBookings, getRevenue,addMovie } = require('../controllers/adminController');
const router = express.Router();

router.post('/movies', addMovie);
router.put('/movies/:id', updateMovie);
router.get('/total-revenue',getRevenue);
router.delete('/cancel-booking/:id', cancelBooking);
router.get('/bookings', getAllBookings);

module.exports = router;
