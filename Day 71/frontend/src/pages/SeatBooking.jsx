import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchShow,
  toggleSeat,
  blockSeat,
  unblockSeat,
  clearSelectedSeats
} from '../Slices/seatBookingSlice';
import './SeatBooking.css';

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { show, selectedSeats, blockedSeats, status } = useSelector(state => state.seatBooking);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = React.useState('connecting');

  useEffect(() => {
    dispatch(fetchShow(showId));
  }, [dispatch, showId]);

const setupWebSocket = () => {
  const httpUrl = import.meta.env.VITE_API_URL;
  const wsUrl = httpUrl.replace(/^http/, 'ws'); // handle both http and https

  const ws = new WebSocket(wsUrl);
  setConnectionStatus('connecting');

  ws.onopen = () => {
    setConnectionStatus('connected');
    socketRef.current = ws;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.showId !== showId) return;

    if (msg.type === 'SEAT_BLOCKED') {
      dispatch(blockSeat(msg.seatId));
    } else if (msg.type === 'SEAT_UNBLOCKED') {
      dispatch(unblockSeat(msg.seatId));
    }
  };

  ws.onclose = () => {
    setConnectionStatus('disconnected');
    socketRef.current = null;
    reconnectTimeoutRef.current = setTimeout(setupWebSocket, 3000);
  };
};


  useEffect(() => {
    setupWebSocket();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [showId]);

  const handleSeatClick = (seatId) => {
  if (!show) return;

  const seat = show.seats.find(s => s._id === seatId);
  if (seat.isBooked || blockedSeats.includes(seatId)) return;

  if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
    alert('WebSocket not connected. Please wait...');
    return;
  }

  const isSelected = selectedSeats.includes(seatId); // <-- determine before dispatch

  dispatch(toggleSeat(seatId));

  socketRef.current.send(JSON.stringify({
    type: isSelected ? 'UNBLOCK_SEAT' : 'BLOCK_SEAT',
    showId,
    seatId
  }));
};


  const handleBooking = () => {
    if (!show) return;

    const seatNumbers = selectedSeats.map(id => {
      const seat = show.seats.find(s => s._id === id);
      return seat ? seat.number : id;
    });

    navigate('/user/payment', {
      state: {
        showId,
        selectedSeats,
        pricePerSeat: show.price,
        movieTitle: show.movie.title,
        screen: show.screen,
        startTime: show.startTime,
        seatNumbers
      }
    });
  };

  if (status === 'loading' || !show) return <p>Loading...</p>;
  if (status === 'failed') return <p>Error loading show details.</p>;

  return (
    <div className="seat-booking-container">
      <div className="show-details">
        <h2 className="movie-title">{show.movie.title}</h2>
        <p className="show-info">Theater: <span>{show.screen}</span></p>
        <p className="show-info">Showtime: <span>{new Date(show.startTime).toLocaleString()}</span></p>
        <p className="show-info">Price per seat: ₹<span>{show.price}</span></p>
      </div>

      <div className="seat-selection">
        <h3 className="section-title">Select Your Seats</h3>
        <div className="seat-grid">
          {show.seats.map(seat => {
            const isSelected = selectedSeats.includes(seat._id);
            const isBooked = seat.isBooked;
            const isBlocked = blockedSeats.includes(seat._id);
            const isClickable = !isBooked && !isBlocked && connectionStatus === 'connected';

            return (
              <div
                key={seat._id}
                className={`w-10 h-10 flex items-center justify-center border rounded text-sm font-medium transition-all duration-200
                  ${isBooked ? 'bg-red-400 cursor-not-allowed' :
                  isBlocked ? 'bg-yellow-300 cursor-not-allowed' :
                  isSelected ? 'bg-blue-500 text-white shadow-md' :
                  'bg-gray-200 hover:bg-gray-300 cursor-pointer'}`}
                onClick={() => isClickable && handleSeatClick(seat._id)}
                title={isBooked ? 'Already booked' : isBlocked ? 'Blocked by another user' : 'Click to select'}
              >
                {seat.number}
              </div>

            );
          })}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="booking-summary">
          <h3 className="section-title">Booking Summary</h3>
          <p>Seats selected: {
            selectedSeats.map(seatId => {
              const seat = show.seats.find(s => s._id === seatId);
              return seat ? seat.number : 'Unknown';
            }).join(', ')
          }</p>
          <p>Total Price: ₹{selectedSeats.length * show.price}</p>
        </div>
      )}

      <button
        onClick={handleBooking}
        className="confirm-btn"
        disabled={selectedSeats.length === 0 || connectionStatus !== 'connected'}
      >
        Confirm Booking
      </button>
    </div>
  );
};

export default SeatBooking;


  
