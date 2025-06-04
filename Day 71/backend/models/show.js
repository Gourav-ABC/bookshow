const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  screen: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  seats: [
    {
      number: String,
      isBooked: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model('Show', showSchema);
