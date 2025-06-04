const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  bookedAt: { type: Date, default: Date.now },
  amountPaid :Number,
  seatsBooked: [{ type: String }],
  status: {
  type: String,
  enum: ['active', 'cancelled'],
  default: 'active'
} // seat numbers booked
});

module.exports = mongoose.model('Booking', bookingSchema);
