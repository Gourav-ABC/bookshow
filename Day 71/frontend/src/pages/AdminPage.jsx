import React from 'react';
import { Link } from 'react-router-dom';
import "./Adminpage.css"

const HomePage = () => {
  return (
    <div className="container" >
      <h1 className="title">Welcome to the Movie App</h1>
      <Link to="/login">
        <button className="button">Admin Login</button>
      </Link>
    </div>
  );
};

export default HomePage;
