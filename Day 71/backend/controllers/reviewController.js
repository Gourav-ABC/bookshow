const { get } = require('mongoose');
const Review = require('../models/review');

const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;

    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!movieId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required review fields' });
    }

    const newReview = new Review({
      user: req.userId,
      movie: movieId,
      rating,
      comment,
    });

    await newReview.save();

    res.status(201).json({
      message: 'Review created successfully',
      review: newReview,
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
}

const getUserReviewHistory = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const reviews = await Review.find({ user: userId }).populate('movie', 'title poster');

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
}

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name').populate('movie', 'title poster');
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
}
const getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!movieId) return res.status(400).json({ message: 'Movie ID is required' });
    console.log('Fetching reviews for movie:', movieId);
    const reviews = await Review.find({ movie: movieId }).populate('user', 'name').populate('movie', 'title poster');
    console.log('Reviews found:', reviews.length);
    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews by movie:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
}

module.exports = {
  createReview,
  getUserReviewHistory,
  getAllReviews,
  getReviewsByMovie,
};