const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  seatsBooked: [{ type: String, required: true }],
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, default: "dummy-card" }, 
  paymentStatus: { type: String, required: true, default: " Success"},
  bookingDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
