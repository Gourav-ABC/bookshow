import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css'

const EditShow = () => {
    const { showId } = useParams();
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [showData, setShowData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        screen: '',
        startTime: '',
        price: '',
    });

    useEffect(() => {
        // Fetch show details by ID
        const fetchShow = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shows/${showId}`);
                setShowData(res.data);
                setFormData({
                    screen: res.data.screen || '',
                    startTime: res.data.startTime ? new Date(res.data.startTime).toISOString().slice(0, 16) : '',
                    price: res.data.price || '',
                });
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch show:', err);
                setLoading(false);
            }
        };

        fetchShow();
    }, [showId]);

    useEffect(() => {
        // Fetch movie details to get name
        axios.get(`/movies/${movieId}`)
            .then(res => {
                setMovieName(res.data.name); // assuming movie has 'name' field
            })
            .catch(err => {
                console.error('Failed to fetch movie details:', err);
            });
    }, [movieId]);
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/shows/${showId}`, {
                screen: formData.screen,
                startTime: new Date(formData.startTime).toISOString(),
                price: Number(formData.price),
            });
            alert('Show updated successfully!');
            navigate('/admin/dashboard');  // redirect back to admin dashboard
        } catch (err) {
            console.error('Failed to update show:', err);
            alert('Failed to update show.');
        }
    };

    if (loading) return <p>Loading show details...</p>;
    if (!showData) return <p>Show not found.</p>;

    return (
          
        <div className='edit-show-container'>
            <h2>Edit Show</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Screen:
                    <input
                        type="text"
                        name="screen"
                        value={formData.screen}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Start Time:
                    <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Price (₹):
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </label>
                <br />
                <div className='button-group'>
                    <button type="submit">Update Show</button>
                    <button type="button" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditShow;
