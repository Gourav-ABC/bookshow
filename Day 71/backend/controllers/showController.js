const Show = require('../models/show');
const Movie = require('../models/movies');

exports.createShow = async (req, res) => {
  try {
    const { movie, startTime, screen, price, seats } = req.body;

    // Optional: validate if movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) return res.status(404).json({ error: 'Movie not found' });

    const show = new Show({ movie, startTime, screen, price, seats });
    await show.save();

    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateShow = async (req, res) => {
  try {
    const showId = req.params.id;
    const updatedData = req.body;

    const updatedShow = await Show.findByIdAndUpdate(showId, updatedData, { new: true });
    if (!updatedShow) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json(updatedShow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
