import React, { useState } from "react";
import './style.css'
import axios from 'axios';
const Profile = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

     
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <button onClick={handleFetch}>Load Profile Info</button>

      {error && <p className="error" style={{ color: "red" }}>{error}</p>}
      {profile && (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
