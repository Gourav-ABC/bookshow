import axios from 'axios';

export const fetchRevenue = () => axios.get('/api/admin/revenue');
export const addMovie = (data) => axios.post('/api/admin/movies', data);
export const cancelBooking = (id) => axios.put(`/api/admin/bookings/cancel/${id}`);
