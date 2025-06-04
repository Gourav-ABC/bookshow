const express = require('express');
const app = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware'); // Fix this import name
const cors = require('cors');
require('dotenv').config();

// Register route
app.post('/register', async (req, res) => {
  console.log('register body:', req.body);
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {

  console.log('Login body:', req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT Token:', token);
    res
      .cookie('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        message: 'Login successful',
        token,
        userId: user._id,
        role: user.role // important for the frontend!
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//  FIXED: Profile route should be OUTSIDE login
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = app;