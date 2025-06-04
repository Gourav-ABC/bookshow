import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // const adminEmail = "admin@example.com"; // allowed admin email
    // const adminPassword = "admin123"; // secure this in real apps

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem('adminToken', 'loggedin');
      localStorage.setItem('isAdmin', 'true'); // simulate login
      navigate('/admin/dashboard');
    } else {
      alert('Invalid admin credentials');
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
