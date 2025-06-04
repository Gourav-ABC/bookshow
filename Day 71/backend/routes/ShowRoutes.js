const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Show = require('../models/show');
const Booking = require('../models/booking');
const { updateShow } = require('../controllers/showController');


// Get shows by movie ID
router.get('/movie/:movieId', async (req, res) => {
  const { movieId } = req.params;

  //  Check if the movieId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  try {
    //  Convert to ObjectId when querying
    const shows = await Show.find({ movie: new mongoose.Types.ObjectId(movieId) });
    res.json(shows);
  } catch (err) {
    console.error("Error in get /movie/:movieId:", err);
    res.status(500).json({ message: 'Error fetching shows' });
  }
});

router.post('/', async (req, res) => {
  const { movie, startTime,price, screen, seats } = req.body;
//   console.log(req.body);

  try {
    const newShow = new Show({
      movie,
      startTime,
      price,
      screen,
      seats,
    });
    await newShow.save();
    res.status(201).json(newShow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating show' });
  }
});

router.get('/:id', async (req, res) => {
    // console.log(req.params.id);
  try {
    const show = await Show.findById(req.params.id).populate('movie');
    console.log(show);
    res.json(show);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shows' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const showId = req.params.id;

    // Cancel all bookings related to this show
    await Booking.updateMany({ show: showId }, { status: 'cancelled' });

    // Delete the show
    await Show.findByIdAndDelete(showId);

    res.status(200).json({ message: 'Show deleted and related bookings cancelled.' });
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({ message: 'Error deleting show', error });
  }
});
router.put('/:id', updateShow);


module.exports = router;
