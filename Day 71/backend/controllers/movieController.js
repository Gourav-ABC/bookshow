const Movie = require('../models/movies');

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch movies', error });
  }
};

// Get movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie', error });
  }
};

// Add a new movie
const addMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    await newMovie.save();
    res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add movie', error: error.message });
  }
};

// Update movie
const updateMovie = async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json({ message: 'Movie updated', movie: updated });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


// Delete movie
const deleteMovie = async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json({ message: 'Movie deleted successfully', movie: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};



module.exports = {
  getAllMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie
};
