const { path } = require('pdfkit');
const Booking = require('../models/booking');
const Show = require('../models/show');

const createBooking = async (req, res) => {
  try {
    const { showId, selectedSeats, amountPaid,paymentMethod } = req.body;

    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!showId || !selectedSeats || !amountPaid) {
    
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    // Optional: Check if show exists
    const show = await Show.findById(showId);

    if (!show) return res.status(404).json({ message: 'Show not found' });

    const newBooking = new Booking({
      user: req.userId,
      show: showId,
      seatsBooked: selectedSeats,
      amountPaid,
     // Optional if you want to store Razorpay/Stripe ID
    });

     await newBooking.save();

    res.status(201).json({
      message: 'Booking successful',
      booking: newBooking,
      
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  console.log("cancle booking called with ID", req.params.id);
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Optionally add refund logic here (mock/dummy refund)
    res.status(200).json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
};

const getUserBookingHistory = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'show',
        populate: {
          path: 'movie',
          select: 'title poster'
        }
      })
      .sort({ bookedAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found' });
    }

    const bookingsWithSeatNumbers = bookings.map((booking) => {
      if (!booking.show || !booking.show.seats) {
        return {
          ...booking.toObject(),
          seatNumbers: [],
          show: {
            ...booking.show?.toObject?.(),
            movie: booking.show?.movie || { title: 'Show Deleted', poster: '' },
            screen: booking.show?.screen || 'N/A',
            startTime: booking.show?.startTime || new Date(),
          },
        };
      }

      const showSeats = booking.show.seats;
      const bookedSeatIds = booking.seatsBooked.map(id => id.toString());

      const seatNumbers = showSeats
        .filter(seat => bookedSeatIds.includes(seat._id.toString()))
        .map(seat => seat.number);

      return {
        ...booking.toObject(),
        seatNumbers,
      };
    });

    res.status(200).json({ bookings: bookingsWithSeatNumbers });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  createBooking,
  cancelBooking,
  getUserBookingHistory
};
