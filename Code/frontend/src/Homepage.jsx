import React from 'react';
import { logout } from './auth';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>User Homepage</h1>
            <p>Welcome, User! This is your dashboard.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Homepage;
