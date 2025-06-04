import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewInputs, setReviewInputs] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/user/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(res.data.bookings || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const downloadTicket = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ticket/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download ticket');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error downloading ticket');
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/cancel-booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Booking cancelled successfully');
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const isCancelable = (showTime) => {
    const now = new Date();
    const diffInMs = new Date(showTime) - now;
    return diffInMs / (1000 * 60 * 60) >= 24;
  };

  const handleInputChange = (bookingId, field, value) => {
    setReviewInputs(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value,
      },
    }));
  };

  const submitReview = async (booking) => {
    const token = localStorage.getItem('token');
    const review = reviewInputs[booking._id];
    if (!review || !review.comment || !review.rating) {
      alert('Please provide both rating and comment');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        movieId: booking.show.movie._id,
        rating: review.rating,
        comment: review.comment,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Review submitted successfully');
      setReviewInputs(prev => ({ ...prev, [booking._id]: { comment: '', rating: 0 } }));
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  if (loading) return <p style={{ padding: '1rem' }}>Loading your bookings...</p>;
  if (error) return <p style={{ color: 'red', padding: '1rem' }}>{error}</p>;
  if (!bookings || bookings.length === 0) return <p style={{ padding: '1rem' }}>No bookings found.</p>;

  const now = new Date();

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}> Your Booking History</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {bookings.map((booking) => {
          const showTime = new Date(booking.show.startTime);
          const isUpcoming = showTime > now;
          const canCancel = isCancelable(showTime);

          return (
            <li
              key={booking._id}
              style={{
                marginBottom: '2rem',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>
                {booking.show.movie.title}
              </h3>
              <p><strong>Screen:</strong> {booking.show.screen}</p>
              <p><strong>Showtime:</strong> {showTime.toLocaleString()}</p>
              <p><strong>Seats:</strong> {booking.seatNumbers.join(', ')}</p>
              <p><strong>Booked At:</strong> {new Date(booking.bookedAt).toLocaleString()}</p>

              {isUpcoming ? (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => downloadTicket(booking._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#1d4ed8',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Download Ticket
                  </button>

                  <button
                    onClick={() => cancelBooking(booking._id)}
                    disabled={!canCancel}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: canCancel ? '#dc2626' : '#e5e7eb',
                      color: canCancel ? '#fff' : '#9ca3af',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: canCancel ? 'pointer' : 'not-allowed',
                    }}
                    title={!canCancel ? 'Cannot cancel within 24 hours of the show' : ''}
                  >
                    Cancel Booking
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}> Leave a Review</h4>
                  <textarea
                    placeholder="Write your review..."
                    value={reviewInputs[booking._id]?.comment || ''}
                    onChange={(e) => handleInputChange(booking._id, 'comment', e.target.value)}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      marginBottom: '0.5rem',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {[...Array(10)].map((_, i) => (
                      <label key={i}>
                        <input
                          type="radio"
                          name={`rating-${booking._id}`}
                          value={i + 1}
                          checked={reviewInputs[booking._id]?.rating === String(i + 1)}
                          onChange={(e) => handleInputChange(booking._id, 'rating', e.target.value)}
                          style={{ marginRight: '2px' }}
                        />
                        <span style={{ color: '#fbbf24' }}>★</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => submitReview(booking)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {!canCancel && isUpcoming && (
                <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Booking cannot be cancelled within 24 hours of the showtime.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BookingHistory;
