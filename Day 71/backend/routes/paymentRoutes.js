const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");

router.post("/", async (req, res) => {
  try {
    const paymentData = req.body;
    const payment = new Payment(paymentData);
    await payment.save();
    res.status(201).json({ message: "Payment saved successfully" });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;