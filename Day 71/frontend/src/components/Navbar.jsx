
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css'; // Assuming you have some styles for the navbar

const Navbar = ({ token, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // clear token in App.jsx
    navigate('/'); // redirect to home
  };

  return (
    <nav className='navbar'>
      <Link to="/">Home</Link>
      {!token ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          {/* <Link to="/user/profile">Profile</Link> */}
          {/* <Link to="/user/movies">Movies</Link> */}
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
