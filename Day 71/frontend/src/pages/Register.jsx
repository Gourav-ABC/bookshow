import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css'; // Assuming you have some styles for the login form

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, form);
            alert('Registered successfully');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='register-form'>
            <h2>Register</h2>
            <input placeholder="Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Email" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input placeholder="Password" type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button type="submit">Register</button>
        </form>
    );
};

export default Register;
