import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieForm from './MovieForm';
import AdminAddShow from '../pages/AdminAddShow';
import './style.css';
import './Admin.css';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addingShowForMovieId, setAddingShowForMovieId] = useState(null);
  const [revenue, setRevenue] = useState(0);
  const [editingShowMovieId, setEditingShowMovieId] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState('');
  const navigate = useNavigate();

  // Fetch total revenue
  const fetchRevenue = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/total-revenue`);
      setRevenue(response.data.revenue);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    }
  };

  // Fetch movies list
  const fetchMovies = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies`);
      setMovies(res.data.movies);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
  };

  // Fetch bookings list
  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  // Fetch shows for a specific movie
  const fetchShows = async (movieId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shows/movie/${movieId}`);
      console.log("movieId being used:", movieId);
      console.log("Fetched shows for movie:", res.data);
      setShows(res.data);
      setEditingShowMovieId(movieId);
      const movieRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/${movieId}`);
    setSelectedMovieTitle(movieRes.data.movie.title);
      setAddingShowForMovieId(null);
      setEditingMovieId(null);
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to fetch shows:", err);
      setShows([]);  // Clear shows on error
      setEditingShowMovieId(null);
      setSelectedMovieTitle('');
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm("Delete this show? All related bookings will be marked cancelled.")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/shows/${showId}`);
      alert("Show deleted and related bookings cancelled.");
      fetchShows(editingShowMovieId);
      fetchBookings();
    } catch (err) {
      console.error("Failed to delete show:", err);
      alert("Error deleting show");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/cancel-booking/${id}`);
      alert("Booking cancelled and refunded");
      fetchBookings();
      fetchRevenue();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  };

  const handleCancel = () => {
    setEditingMovieId(null);
    setIsAdding(false);
    setAddingShowForMovieId(null);
    setEditingShowMovieId(null);
    setShows([]);
  };

  useEffect(() => {
    fetchMovies();
    fetchBookings();
    fetchRevenue();
  }, []);

  // Debug logs for shows & editing movie
  console.log("Editing show movieId:", editingShowMovieId);
  console.log("Shows state:", shows);

  return (
    <div className='admin-dashboard'>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        {/* <button className="logout-btn" onClick={handleLogout}>Logout</button> */}
      </div>

      <div className="revenue-section">
        <h2>Total Revenue</h2>
        <p>₹{Number(revenue).toLocaleString()}</p>
      </div>

      {Array.isArray(shows) && shows.length > 0 ? (
        <div>
          <button onClick={handleCancel}>Cancel</button>
          <h3>Shows for {selectedMovieTitle || 'Selected Movie'}</h3>
          <ul>
            {shows.map(show => (
              <li key={show._id}>
                <strong>Screen:</strong> {show.screen} | 
                <strong> Time:</strong> {new Date(show.startTime).toLocaleString()} | 
                <strong> Price:</strong> ₹{show.price}
                <button onClick={() => navigate(`/admin/edit-show/${show._id}`)}>Update</button>
                <button onClick={() => handleDeleteShow(show._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        editingShowMovieId && <p>No shows found.</p>
      )}

      {(editingMovieId || isAdding) ? (
        <div>
          <button onClick={handleCancel}>Cancel</button>
          <MovieForm
            movieId={editingMovieId}
            onSuccess={() => {
              fetchMovies();
              handleCancel();
            }}
            onDelete={() => {
              fetchMovies();
              handleCancel();
            }}
          />
        </div>
      ) : addingShowForMovieId === 'select' ? (
        <div>
          <button onClick={handleCancel}>Cancel</button>
          <AdminAddShow
            movieId={addingShowForMovieId}
            onShowAdded={() => {
              fetchMovies();
              handleCancel();
            }}
          />
        </div>
      ) : (
        <>
          <button style={{ marginRight: '475px' }} onClick={() => setIsAdding(true)}>Add New Movie</button>
          <button onClick={() => setAddingShowForMovieId('select')}>Add Show</button>

          <ul>
            {movies.map(movie => (
              <li key={movie._id}>
                {movie.title}{' '}
                <button onClick={() => setEditingMovieId(movie._id)}>Edit Movie</button>
                <button onClick={() => fetchShows(movie._id)}>Edit Show</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <hr />

      <div className="bookings-container">

        <h2>All Bookings</h2>
        {bookings.length === 0 ? (
          <p className="empty-message">No bookings found.</p>
        ) : (
          <ul className="booking-list">
            {bookings.map(b => (
              <li key={b._id} className="booking-card">
                <div className="booking-info">
                  <strong>User:</strong> {b.user?.name || 'Guest'} <br />
                  <strong>Movie:</strong> {b.show?.movie?.title} <br />
                  <strong>Showtime:</strong> {new Date(b.show?.startTime).toLocaleString()} <br />
                  <strong>Amount Paid:</strong> ₹{b.amountPaid} <br />
                  {/* <strong>Screen</strong> ₹{b.show.screen} <br /> */}
                  <button onClick={() => handleCancelBooking(b._id)}>Cancel & Refund</button>
                  
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

  
</div>


    
  );
}

export default AdminDashboard;
