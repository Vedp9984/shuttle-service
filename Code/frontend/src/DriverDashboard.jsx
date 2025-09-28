import React from 'react';
import { logout } from './auth'
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Driver Dashboard</h1>
            <p>Welcome, Driver! View your schedule here.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default DriverDashboard;
