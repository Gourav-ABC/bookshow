import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const addShow = (showData) => API.post('/shows', showData);
export const fetchMovies = () => API.get('/movies');
