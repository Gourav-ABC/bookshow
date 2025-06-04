import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import { Link } from 'react-router-dom';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async (page) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies?page=${page}&limit=5`);
      setMovies(res.data.movies);
      setTotalPages(res.data.totalPages);
      setPage(res.data.currentPage);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  useEffect(() => {
    fetchMovies(page);
  }, [page]);

  return (
    <div className="movielist-container">
  <h2 className="heading">Movie Listings</h2>
  {movies.map(movie => (
    <div key={movie._id} className="movieCard">
      <div className="details">
        <img src={movie.poster} alt={movie.title} className="poster" />
        <Link to={`/user/movies/${movie._id}`} className="movieLink">
        <h1 style={{ color: 'black' }}>{movie.title}</h1></Link>
        <p className="meta">{movie.genre} • {movie.duration} mins</p>
        {/* <p className="description">{movie.description}</p> */}
        {/* <button className="bookButton" onClick={() => handleBookNow(movie._id)}>Book Now</button> */}
      </div>
    </div>
  ))}
  <div className="pagination">
    <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Previous</button>
    <span> Page {page} of {totalPages} </span>
    <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
  </div>
</div>

  );
};

export default MovieList;
