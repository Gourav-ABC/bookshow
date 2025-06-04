const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const Booking = require('../models/booking');
const User = require('../models/user');
const Show = require('../models/show');
const Movie = require('../models/movies');

router.get('/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId)
      .populate({ path: 'user', select: 'name email' })
      .populate({
        path: 'show',
        populate: {
          path: 'movie',
          model: 'Movie',
          select: 'title genre duration poster',
        },
      })
      .populate('seatsBooked', 'seatNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // const seatNumbers = booking.seatsBooked.map((seats) => seats.number).join(', ');
    const seatNumbers = booking.show.seats
            .filter(seat => booking.seatsBooked.includes(seat._id.toString()))
            .map(seat => seat.number);
    // console.log('Seat Numbers:', bookedSeatNumbers);  

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${bookingId}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Set font explicitly
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#333').text('Movie Ticket', { align: 'center' });
    doc.moveDown(1);

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor('#666')
      .lineWidth(1)
      .stroke();

    doc.moveDown(1.5);
    doc.font('Helvetica').fontSize(14).fillColor('black');

    doc.text(`Name: ${booking.user?.name || 'N/A'}`);
    doc.text(`Email: ${booking.user?.email || 'N/A'}`);
    doc.moveDown();

    doc.text(`Movie: ${booking.show?.movie?.title || 'N/A'}`);
    doc.text(`Showtime: ${booking.show?.startTime ? new Date(booking.show.startTime).toLocaleString() : 'N/A'}`);
    doc.text(`Seats: ${seatNumbers || 'N/A'}`);
    doc.text(`Amount Paid: Rs.${booking.amountPaid}`);
    doc.text(`Booked At: ${booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : 'N/A'}`);

    doc.moveDown(5);
    doc
      .fontSize(12)
      .fillColor('#555')
      .text('Thank you for booking with ABC-Movies', { align: 'center' })
      .text('Please arrive 15 minutes early and present this ticket at the entrance.', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

module.exports = router;
