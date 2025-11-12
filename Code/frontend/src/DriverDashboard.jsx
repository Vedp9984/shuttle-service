// --- START OF FILE DriverDashboard.jsx (FINAL CORRECTED) ---

import React, { useState, useEffect } from 'react';
import { logout, getCurrentUser } from './auth'; // Assuming auth helpers exist
import { useNavigate } from 'react-router-dom';
import { 
    FaBus, FaClock, FaCalendarAlt, FaSignOutAlt, FaRoad, 
    FaMapMarkerAlt, FaSync, FaExclamationTriangle, FaCheckCircle, 
    FaTimesCircle, FaHourglassHalf, FaArrowRight 
} from 'react-icons/fa';

// --- UTILITY: Custom Fetch Hook (FIXED for Driver Routes) ---
const useFetch = (baseUrl, initialValue = []) => {
    const [data, setData] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (params = {}) => {
        setLoading(true);
        setError(null);
        
        const { id, type, driverId, method = 'GET', body, isStatusUpdate, ...queryParams } = params;
        
        let fullUrl = baseUrl;
        
        // FIX 1: Correctly build the status update URL (must NOT include /driver)
        if (isStatusUpdate && id) {
             fullUrl = `/api/journeys/${id}/status`; 
        } else if (id) {
            fullUrl = `${baseUrl}/${id}`;
        }
        
        const finalQueryParams = { ...queryParams };
        // CRITICAL: Ensure driverId is ALWAYS included in the query for GET /api/journeys/driver
        if (driverId) finalQueryParams.driverId = driverId; 
        if (type) finalQueryParams.type = type;
        
        if (Object.keys(finalQueryParams).length > 0) {
            const query = new URLSearchParams(finalQueryParams).toString();
            // Append query for GET requests (like /api/journeys/driver?driverId=...)
            if (method === 'GET' || method === 'DELETE') {
                fullUrl = `${fullUrl}?${query}`;
            }
        }
        
        try {
            const token = localStorage.getItem('token'); 
            
            const response = await fetch(fullUrl, {
                method: method,
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': body ? 'application/json' : undefined,
                },
                body: body ? JSON.stringify(body) : undefined,
            });
            
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorBody = await response.json();
                    throw new Error(errorBody.message || `Error: ${response.status} - ${response.statusText}`);
                } else {
                    // FIX 2: Handle non-JSON 404/500 responses gracefully
                    throw new Error(`Server Error: Failed to process request (Status: ${response.status} ${response.statusText})`);
                }
            }
            
            const result = await response.json();
            if (method === 'GET') {
                setData(result);
            }
            return result; 
        } catch (err) {
            console.error(`Error fetching ${fullUrl}:`, err);
            setError(err.message || 'Failed to fetch data');
            if (method === 'GET') {
                setData(Array.isArray(initialValue) ? [] : null);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    // Skip initial fetch on mount
    return { data, loading, error, refetch: fetchData };
};


const DriverDashboard = () => {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const driverId = currentUser?._id || currentUser?.id; // Get the ID to send to backend

    // State for categorizing journeys
    const [journeyTab, setJourneyTab] = useState('current');
    
    // Data Hook
    const { 
        data: driverJourneys, 
        loading: journeysLoading, 
        error: journeysError, 
        refetch: fetchDriverJourneys 
    } = useFetch('/api/journeys/driver');
    
    // State for the update modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedJourneyToUpdate, setSelectedJourneyToUpdate] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [delayMinutes, setDelayMinutes] = useState(0);

    
    // Fetch data on component mount
    useEffect(() => {
        if (driverId) {
             handleTabChange('current'); // Initial fetch
        }
    }, [driverId]);

    const handleTabChange = (type) => {
        setJourneyTab(type);
        if (driverId) {
            // Pass the driverId and type as query parameters
            fetchDriverJourneys({ driverId, type });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // Open the status update modal
    const openUpdateModal = (journey) => {
        setSelectedJourneyToUpdate(journey);
        setNewStatus(journey.status);
        setDelayMinutes(journey.delayMinutes || 0);
        setShowUpdateModal(true);
    };

    // Submit the status update
    const submitStatusUpdate = async () => {
        if (!selectedJourneyToUpdate) return;

        try {
            const result = await fetchDriverJourneys({
                id: selectedJourneyToUpdate._id,
                method: 'PATCH',
                isStatusUpdate: true, // Uses the corrected URL building in useFetch
                body: { 
                    status: newStatus, 
                    delayMinutes: parseInt(delayMinutes),
                    // CRITICAL FIX: Pass the driverId in the body for non-RBAC check
                    driverId: driverId 
                }
            });
            
            if (result) {
                alert('Journey status updated successfully!');
                setShowUpdateModal(false);
                // Refresh the current tab to show the update
                handleTabChange(journeyTab); 
            } else {
                alert('Failed to update journey status.');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert(`Error updating journey: ${error.message}`);
        }
    };

    // --- Components ---

    const JourneyStatusBadge = ({ status }) => {
        let color = '#007bff'; // Scheduled
        if (status === 'Ongoing') color = '#28a745';
        else if (status === 'Completed') color = '#6c757d';
        else if (status === 'Cancelled') color = '#dc3545';

        return (
            <span style={{...styles.statusBadge, backgroundColor: color}}>
                {status}
            </span>
        );
    };

    const UpdateStatusModal = () => {
        if (!showUpdateModal || !selectedJourneyToUpdate) return null;

        const journey = selectedJourneyToUpdate;
        const departureTime = new Date(journey.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                    <h2 style={styles.modalTitle}>Update Journey: {journey.route.routeName}</h2>
                    <p style={styles.journeyDetails}>
                        <FaClock style={{marginRight: '5px'}} /> Departure: {departureTime}
                        <br />
                        <FaRoad style={{marginRight: '5px'}} /> {journey.route.originStop.stopName} <FaArrowRight style={{fontSize: '0.8rem'}} /> {journey.route.destinationStop.stopName}
                    </p>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>New Status</label>
                        <select 
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            style={styles.input}
                        >
                            {['Scheduled', 'Ongoing', 'Completed', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Delay (Minutes)</label>
                        <input 
                            type="number" 
                            value={delayMinutes} 
                            onChange={(e) => setDelayMinutes(e.target.value)} 
                            style={styles.input}
                            min="0"
                        />
                    </div>
                    
                    <div style={styles.formActions}>
                        <button type="button" onClick={() => setShowUpdateModal(false)} style={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="button" onClick={submitStatusUpdate} style={styles.payButton}>
                            Save Update
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---

    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoContainer}>
                        <span style={styles.logoText}>🚌</span>
                    </div>
                    <div style={styles.userInfo}>
                        <h2 style={styles.userName}>Hello, Driver!</h2>
                        <p style={styles.userRole}>Vehicle: {driverJourneys[0]?.vehicle?.plateNumber || 'Loading...'}</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <button style={styles.iconButton} onClick={() => handleTabChange(journeyTab)} title="Refresh Schedule">
                        <FaSync />
                    </button>
                    <button style={styles.iconButton} onClick={handleLogout} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>

            <main style={styles.mainContent}>
                
                <section style={styles.journeysSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaRoad style={styles.sectionIcon} />
                        My Assigned Journeys
                    </h3>

                    <div style={styles.tabContainer}>
                        {['current', 'upcoming', 'past'].map(tab => (
                            <button
                                key={tab}
                                style={{ ...styles.tabButton, ...(journeyTab === tab ? styles.tabButtonActive : {}) }}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {journeysLoading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                        </div>
                    ) : journeysError ? (
                        <div style={styles.errorMessage}>
                            <FaExclamationTriangle style={styles.errorIcon} />
                            <p>{journeysError}</p>
                        </div>
                    ) : driverJourneys.length > 0 ? (
                        <div style={styles.journeysList}>
                            {driverJourneys.map(journey => (
                                <div key={journey._id} style={styles.journeyCard}>
                                    <div style={styles.journeyTime}>
                                        <FaCalendarAlt style={styles.timeIcon} />
                                        <strong>{new Date(journey.date).toLocaleDateString()}</strong>
                                        <p style={styles.journeyDate}>
                                            {new Date(journey.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                    <div style={styles.journeyRoute}>
                                        <FaRoad style={styles.timeIcon} />
                                        {journey.route.originStop.stopName} <FaArrowRight style={{fontSize: '0.7rem'}} /> {journey.route.destinationStop.stopName}
                                        <div style={styles.journeyCode}>Route: {journey.route.routeCode}</div>
                                    </div>
                                    <div style={styles.journeyStatus}>
                                        <JourneyStatusBadge status={journey.status} />
                                        {journey.delayMinutes > 0 && (
                                            <p style={{color: '#FFDB15', fontSize: '0.8rem', margin: '5px 0 0'}}>
                                                + {journey.delayMinutes} min delay
                                            </p>
                                        )}
                                        {journeyTab !== 'past' && (
                                            <button 
                                                onClick={() => openUpdateModal(journey)}
                                                style={styles.updateButton}
                                            >
                                                Update
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noResults}>
                            <FaBus style={styles.noResultsIcon} />
                            <p>No {journeyTab} journeys assigned.</p>
                        </div>
                    )}
                </section>
                
            </main>
            
            <UpdateStatusModal />
        </div>
    );
};

// --- Styles (Combined) ---
const styles = {
    dashboard: {
        backgroundColor: '#121212',
        color: 'white',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: '100vh',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    logoContainer: {
        backgroundColor: '#333',
        borderRadius: '50%',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '1.5rem',
    },
    userInfo: {
        margin: 0,
    },
    userName: {
        margin: 0,
        fontWeight: 'bold',
        fontSize: '1.25rem',
        color: '#FFDB15',
    },
    userRole: {
        margin: 0,
        fontSize: '0.875rem',
        color: '#ccc',
    },
    headerRight: {
        display: 'flex',
        gap: '10px',
    },
    iconButton: {
        backgroundColor: '#333',
        border: 'none',
        borderRadius: '50%',
        padding: '10px',
        cursor: 'pointer',
        fontSize: '1rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
    },
    mainContent: {
        flexGrow: 1,
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
    },
    journeysSection: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    sectionIcon: {
        color: '#00A3A3',
    },
    tabContainer: {
        display: 'flex',
        marginBottom: '1rem',
        gap: '10px',
        borderBottom: '1px solid #333',
    },
    tabButton: {
        background: 'none',
        border: 'none',
        borderBottom: '3px solid transparent',
        color: '#ccc',
        padding: '10px 20px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
    tabButtonActive: {
        borderBottom: '3px solid #FFDB15',
        color: 'white',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255, 219, 21, 0.2)',
        borderTop: '4px solid #FFDB15',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    errorMessage: {
        backgroundColor: '#442222',
        border: '1px solid #663333',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#ff6666',
    },
    errorIcon: {
        fontSize: '2rem',
        marginBottom: '1rem',
        color: '#ff6666',
    },
    journeysList: {
        backgroundColor: '#333',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    journeyCard: {
        padding: '15px',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    journeyTime: {
        flex: 1,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.9rem',
    },
    journeyDate: {
        fontSize: '0.75rem',
        color: '#ccc',
        margin: 0,
    },
    timeIcon: {
        color: '#00A3A3',
    },
    journeyRoute: {
        flex: 2,
        color: '#ccc',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    journeyCode: {
        fontSize: '0.75rem',
        color: '#999',
        marginLeft: '10px',
    },
    journeyStatus: {
        flex: 1,
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '5px',
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    updateButton: {
        backgroundColor: '#FFDB15',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        marginTop: '5px',
    },
    noResults: {
        textAlign: 'center',
        padding: '3rem',
        color: '#ccc',
    },
    noResultsIcon: {
        fontSize: '3rem',
        color: '#666',
        marginBottom: '1rem',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#333',
        borderRadius: '8px',
        padding: '30px',
        width: '90%',
        maxWidth: '400px',
    },
    modalTitle: {
        color: '#FFDB15',
        marginTop: 0,
        marginBottom: '20px',
        textAlign: 'center',
    },
    journeyDetails: {
        color: '#ccc',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#444',
        borderRadius: '8px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        color: '#ccc',
        marginBottom: '8px',
        fontSize: '0.9rem',
        display: 'block',
    },
    input: {
        backgroundColor: '#444',
        border: '1px solid #555',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '1rem',
        width: '100%',
        boxSizing: 'border-box',
    },
    formActions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    cancelButton: {
        backgroundColor: '#555',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    payButton: {
        backgroundColor: '#00A3A3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
};

export default DriverDashboard;