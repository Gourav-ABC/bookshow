const Movie = require('../models/movies');
const Booking = require('../models/booking');
const Show = require('../models/show');
const Payment = require('../models/payment');
const show = require('../models/show');

exports.addMovie = async (req, res) => {
  const { title, description, seats } = req.body;
  const movie = new Movie({ title, description, seats });
  await movie.save();
  res.json({ message: 'Movie added', movie });
};

exports.updateMovie = async (req, res) => {
  const { id } = req.params;
  const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
  res.json({ message: 'Movie updated', movie });
};


exports.getRevenue = async (req, res) => {
  try {
    const total = await Payment.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, revenue: { $sum: '$amount' } } }
    ]);
    // console.log('Aggregation result:', total);  // Add this for debugging
    res.json({ revenue: total[0]?.revenue || 0 });
  } catch (error) {
    console.error('Error calculating revenue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate({
      path: 'show',
      populate: { path: 'movie' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.cancelBooking = async (req, res) => {
  console.log("cancel booking called with ID", req.params.id);
  try {
    const { id } = req.params;
  
   
    const booking = await Booking.findById(req.params.id).populate('show');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Mark seats as available again
    const shows = await show.findById(booking.show._id);

    console.log(shows.seatsNumber);
    shows.seats = shows.seats.filter(seat => !booking.seatsBooked.includes(seat));
    await shows.save();
        


    // Simulate refund and delete booking
    await Booking.findByIdAndDelete(id);
     console.log("deleted "); 
    res.json({ success: true, message: 'Booking cancelled and refunded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cancellation failed' });
  }
};