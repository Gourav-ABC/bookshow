import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './moviedetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/movies/${id}`)
      .then(res => setMovie(res.data.movie))
      .catch(err => console.error('Error fetching movie:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/api/shows/movie/${id}`)
      .then(res => setShows(res.data))
      .catch(err => console.error('Error fetching shows:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`)
      .then(res => {
        setReviews(res.data.reviews); // ✅ Fix: use "res.data.reviews"
      })
      .catch(err => console.error('Error fetching reviews:', err));

    return () => {
      setMovie(null);
      setShows([]);
      setReviews([]);
    };
  }, [id]);

  const handleBook = (showId) => {
    navigate(`/user/book/${showId}`);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    if (halfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  if (!movie) return <p className="loading-text">Loading...</p>;

  return (
    <div className="moviedetails-container">
      <div className="movie-details">
        <img src={movie.poster} alt={movie.title} className="movie-poster" />
        <div className="movie-info">
          <h2 className="movie-title">{movie.title}</h2>
          <div className="rating">
            <div className="stars">{renderStars(Number(averageRating))}</div>
            <span className="rating-number">({averageRating})</span>
          </div>
          <p className="movie-meta">{movie.genre} • {movie.duration} mins</p>
          <p className="movie-description">{movie.description}</p>
        </div>
      </div>

      <div className="shows-section">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Available Shows</h3>
        {shows.length === 0 ? (
          <p className="no-shows">No shows available.</p>
        ) : (
          <ul className="shows-list">
            {shows.map(show => {
              const showDate = new Date(show.startTime);
              const isPast = showDate <= new Date();

              return (
                <li key={show._id} className="show-item">
                  <div>
                    <p className="screen">Screen {show.screen}</p>
                    <p className="start-time">{showDate.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleBook(show._id)}
                    className={`book-btn ${isPast ? 'disabled' : ''}`}
                    disabled={isPast}
                  >
                    Book Now
                  </button>
                </li>
              );
            })}

          </ul>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;