const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  // rating: { type: Number, min: 0, max: 10 }, // optional, can be used for user ratings
  duration: { type: Number, required: true }, // in minutes
  poster: { type: String }, // URL to image
  description: { type: String },
});

module.exports = mongoose.model('Movie', movieSchema);
