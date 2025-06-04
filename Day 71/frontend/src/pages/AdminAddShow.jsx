import React, { useEffect, useState } from 'react';
import { addShow, fetchMovies } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminAddShow = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    movie: '',
    startTime: '',
    screen: '',
    price: '',
    seats: []
  });
  const [seatCount, setSeatCount] = useState(10); // default seat count


  // Load all movies
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const { data } = await fetchMovies();

        setMovies(data.movies); //  Ensure we're setting an array

        setMovies(data.movies);

      } catch (err) {
        console.error("Failed to load movies", err);
        setMovies([]);
      }
    };
    loadMovies();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const seats = Array.from({ length: seatCount }, (_, i) => ({
      number: `S${i + 1}`,
      isBooked: false
    }));

    try {
      await addShow({ ...formData, seats });
      alert('Show added successfully!');
      navigate('/admin/dashboard'); // ✅ Now this will work
    } catch (err) {
      alert('Error adding show');
      console.error(err);
    }
  };

  return (
    <div className='admin-add-show-container'>
      <h2>Add New Show</h2>
      <form onSubmit={handleSubmit}>
        <label>Movie:</label>
        <select
          name="movie"
          value={formData.movie}
          onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
          required
        >
          <option value="">Select a movie</option>
          {Array.isArray(movies) && movies.map((movie) => (
            <option key={movie._id} value={movie._id}>
              {movie.title}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Start Time:</label>
        <input
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          required
        />

        <br /><br />

        <label>Screen:</label>
        <input
          type="text"
          value={formData.screen}
          onChange={(e) => setFormData({ ...formData, screen: e.target.value })}
          required
        />

        <br /><br />

        <label>Price:</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />

        <br /><br />

        <label>Total Seats:</label>
        <input
          type="number"
          value={seatCount}
          onChange={(e) => setSeatCount(Number(e.target.value))}
          min="1"
          required
        />

        <br /><br />

        <button type="submit">Add Show</button>
      </form>
    </div>
  );
};

export default AdminAddShow;
