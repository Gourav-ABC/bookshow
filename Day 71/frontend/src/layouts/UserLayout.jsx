import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './styles.css';

// Prefetch components on hover
const preloadProfile = () => import('../pages/Profile');
const preloadBookingForm = () => import('../pages/SeatBooking');
const preloadBookings = () => import('../pages/Movies');
const preloadBookingHistory = () => import('../pages/BookingHistory');

const UserLayout = () => {
  return (
    <div className='dashboard-container'>
      <h2>User Dashboard</h2>
      <nav className='dashboard-nav'>
        <Link to="profile" onMouseEnter={preloadProfile} style={{ marginRight: '1rem' }}>Profile</Link>
        
        <Link to="movies" onMouseEnter={preloadBookings} style={{ marginRight: '1rem' }}> Book Movie </Link>
        <Link to="bookings" onMouseEnter={preloadBookingHistory}>My Booking</Link>
      </nav>

      <Outlet />
    </div>
  );
};

export default UserLayout;
