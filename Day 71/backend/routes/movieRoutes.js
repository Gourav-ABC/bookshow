const express = require('express');
const router = express.Router();
const Movie = require('../models/movies');
const Show = require('../models/show');

const {
  getAllMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');

// GET /api/movies?limit=5&page=1
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const skip = (page - 1) * limit;

  try {
    const movies = await Movie.find().skip(skip).limit(limit);
    const total = await Movie.countDocuments();

    res.json({
      movies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { title, genre, duration, description, poster } = req.body;

  try {
    const newMovie = new Movie({
      title,
      genre,
      duration,
      description,
      poster,
    });

    await newMovie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);
    const shows = await Show.find({ movie: req.params.id });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ movie, shows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/', getAllMovies);

// Get single movie
router.get('/:id', getMovieById);

// Add a new movie
router.post('/', addMovie);

// Update a movie
router.put('/:id', updateMovie);

// Delete a movie
router.delete('/:id', deleteMovie);

module.exports = router;
