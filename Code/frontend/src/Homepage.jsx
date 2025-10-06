import React, { useState, useEffect } from 'react';
import { logout, getCurrentUser } from './auth';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaSearch, FaMapMarkerAlt, FaClock, FaBus, FaRoute, FaSync, FaExclamationTriangle } from 'react-icons/fa';

const Homepage = () => {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const [routes, setRoutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [journeysLoading, setJourneysLoading] = useState(false);
    const [upcomingJourneys, setUpcomingJourneys] = useState([]);
    const [routesError, setRoutesError] = useState(null);
    const [journeysError, setJourneysError] = useState(null);

    useEffect(() => {
        fetchRoutes();
        fetchUpcomingJourneys();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setRoutesError(null);
            const response = await fetch('/api/routes');
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Raw routes data:', data); // Debug log
            
            if (data.length > 0) {
                console.log('Sample route structure:', JSON.stringify(data[0], null, 2));
                console.log('Origin stop type:', typeof data[0].originStop, 
                            'Value:', data[0].originStop);
                console.log('Destination stop type:', typeof data[0].destinationStop, 
                            'Value:', data[0].destinationStop);
            }
            
            const transformedRoutes = data.map(route => {
                // More robust property access with optional chaining and default values
                return {
                    _id: route._id || `temp-${Math.random()}`,
                    name: route.routeName || route.name || 'Unnamed Route',
                    code: route.routeCode || route.code || 'N/A',
                    description: route.description || '',
                    // Handle various formats of stop data
                    startLocation: extractStopName(route.originStop),
                    endLocation: extractStopName(route.destinationStop),
                    // Handle different array structures
                    busStops: Array.isArray(route.stops) ? 
                              route.stops.map(stop => typeof stop.stop === 'object' ? stop.stop : stop) :
                              [],
                    isActive: route.isActive !== undefined ? route.isActive : true
                };
            });
            
            console.log('Transformed routes:', transformedRoutes); // Debug transformed data
            setRoutes(transformedRoutes);
        } catch (error) {
            console.error('Error fetching routes:', error);
            setRoutesError(error.message || 'Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to extract stop name from different data structures
    const extractStopName = (stop) => {
        if (!stop) return 'Unknown';
        
        if (typeof stop === 'string') {
            return stop; // If it's just a string
        }
        
        if (typeof stop === 'object') {
            // Try different properties that might contain the name
            if (stop.name) return stop.name;
            if (stop.stopName) return stop.stopName;
            if (stop.location) return stop.location;
            if (stop._id) return `Stop ${stop._id}`;
        }
        
        return 'Unknown';
    };

    const fetchUpcomingJourneys = async () => {
        try {
            setJourneysLoading(true);
            setJourneysError(null);
            const response = await fetch('/api/journeys');
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Raw journeys data:', data); // Debug log
            
            const transformedJourneys = data.map(journey => {
                // More robust date parsing
                let departureTime = new Date();
                
                try {
                    if (journey.departureTime) {
                        // Try parsing as ISO string
                        departureTime = new Date(journey.departureTime);
                    } else if (journey.date && journey.originDepartureTime) {
                        // Try combining date and time
                        const dateStr = journey.date;
                        const timeStr = journey.originDepartureTime;
                        
                        // Check if date is in ISO format or MM/DD/YYYY
                        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                            departureTime = new Date(`${dateStr}T${timeStr}`);
                        } else {
                            // Try other common formats
                            const [month, day, year] = dateStr.split('/');
                            departureTime = new Date(`${year}-${month}-${day}T${timeStr}`);
                        }
                    }
                    
                    // Validate the date object
                    if (isNaN(departureTime.getTime())) {
                        console.warn('Invalid date for journey:', journey);
                        // Fallback to current time + 1 hour
                        departureTime = new Date();
                        departureTime.setHours(departureTime.getHours() + 1);
                    }
                } catch (e) {
                    console.error('Error parsing date:', e, journey);
                    // Fallback date
                    departureTime = new Date();
                    departureTime.setHours(departureTime.getHours() + 1);
                }
                
                return {
                    _id: journey._id || `temp-${Math.random()}`,
                    departureTime: departureTime,
                    route: {
                        name: journey.route?.routeName || journey.route?.name || 'Unknown Route',
                        code: journey.route?.routeCode || journey.route?.code || 'N/A'
                    },
                    status: (journey.status || 'scheduled').toLowerCase(),
                    vehicle: journey.vehicle || null,
                    driver: journey.driver || null
                };
            });
            
            // Sort by departure time and take first 5
            const sortedJourneys = transformedJourneys
                .sort((a, b) => a.departureTime - b.departureTime)
                .slice(0, 5);
                
            setUpcomingJourneys(sortedJourneys);
        } catch (error) {
            console.error('Error fetching journeys:', error);
            setJourneysError(error.message || 'Failed to fetch journeys');
        } finally {
            setJourneysLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchRoutes();
            return;
        }

        try {
            setLoading(true);
            setRoutesError(null);
            const response = await fetch(`/api/routes?search=${encodeURIComponent(searchTerm)}`);
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Search results raw data:', data);
            
            const transformedRoutes = data.map(route => {
                return {
                    _id: route._id || `temp-${Math.random()}`,
                    name: route.routeName || route.name || 'Unnamed Route',
                    code: route.routeCode || route.code || 'N/A',
                    description: route.description || '',
                    startLocation: extractStopName(route.originStop),
                    endLocation: extractStopName(route.destinationStop),
                    busStops: Array.isArray(route.stops) ? 
                              route.stops.map(stop => typeof stop.stop === 'object' ? stop.stop : stop) :
                              [],
                    isActive: route.isActive !== undefined ? route.isActive : true
                };
            });
            
            setRoutes(transformedRoutes);
        } catch (error) {
            console.error('Error searching routes:', error);
            setRoutesError(error.message || 'Failed to search routes');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRefresh = () => {
        fetchRoutes();
        fetchUpcomingJourneys();
    };

 

    return (
        <div style={styles.dashboard}>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoContainer}>
                        <span style={styles.logoText}>🚌</span>
                    </div>
                    <div style={styles.userInfo}>
                        <h2 style={styles.userName}>Welcome, {currentUser?.email || 'User'}!</h2>
                        <p style={styles.userRole}>Shuttle Service Portal</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <button style={styles.iconButton} onClick={handleRefresh} title="Refresh Data">
                        <FaSync />
                    </button>
                    <button style={styles.iconButton} onClick={() => navigate('/homepage')} title="Home">
                        <FaHome />
                    </button>
                    <button style={styles.iconButton} onClick={handleLogout} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>



            <main style={styles.mainContent}>
                <section style={styles.searchSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaSearch style={styles.sectionIcon} />
                        Find Routes
                    </h3>
                    <div style={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search for routes, destinations, or bus stops..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={styles.searchInput}
                        />
                        <button onClick={handleSearch} style={styles.searchButton}>
                            <FaSearch />
                        </button>
                    </div>
                </section>

                <section style={styles.statsSection}>
                    <div style={styles.statCard}>
                        <FaRoute style={styles.statIcon} />
                        <div>
                            <h4 style={styles.statNumber}>{routes.length}</h4>
                            <p style={styles.statLabel}>Available Routes</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <FaBus style={styles.statIcon} />
                        <div>
                            <h4 style={styles.statNumber}>{upcomingJourneys.length}</h4>
                            <p style={styles.statLabel}>Upcoming Journeys</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <FaClock style={styles.statIcon} />
                        <div>
                            <h4 style={styles.statNumber}>24/7</h4>
                            <p style={styles.statLabel}>Service Hours</p>
                        </div>
                    </div>
                </section>

                <section style={styles.routesSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaRoute style={styles.sectionIcon} />
                        Available Routes
                    </h3>
                    
                    {routesError ? (
                        <div style={styles.errorMessage}>
                            <FaExclamationTriangle style={styles.errorIcon} />
                            <p>{routesError}</p>
                            <button onClick={fetchRoutes} style={styles.retryButton}>
                                Retry
                            </button>
                        </div>
                    ) : loading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                            <p style={styles.loadingText}>Loading routes...</p>
                        </div>
                    ) : routes.length > 0 ? (
                        <div style={styles.routesGrid}>
                            {routes.map((route, index) => (
                                <div key={route._id || index} style={styles.routeCard}>
                                    <div style={styles.routeHeader}>
                                        <h4 style={styles.routeName}>{route.name || `Route ${route.code}`}</h4>
                                        <span style={styles.routeCode}>{route.code}</span>
                                    </div>
                                    <div style={styles.routeDetails}>
                                        <div style={styles.routeStop}>
                                            <FaMapMarkerAlt style={styles.stopIcon} />
                                            <span>From: {route.startLocation || 'N/A'}</span>
                                        </div>
                                        <div style={styles.routeStop}>
                                            <FaMapMarkerAlt style={styles.stopIcon} />
                                            <span>To: {route.endLocation || 'N/A'}</span>
                                        </div>
                                        {route.busStops && route.busStops.length > 0 && (
                                            <div style={styles.stopCount}>
                                                {route.busStops.length} stops
                                            </div>
                                        )}
                                        {!route.isActive && (
                                            <div style={styles.inactiveRoute}>
                                                This route is currently inactive
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noResults}>
                            <FaBus style={styles.noResultsIcon} />
                            <p>No routes found. {searchTerm && `Try searching for something else.`}</p>
                        </div>
                    )}
                </section>

                <section style={styles.journeysSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaClock style={styles.sectionIcon} />
                        Upcoming Journeys
                    </h3>
                    
                    {journeysError ? (
                        <div style={styles.errorMessage}>
                            <FaExclamationTriangle style={styles.errorIcon} />
                            <p>{journeysError}</p>
                            <button onClick={fetchUpcomingJourneys} style={styles.retryButton}>
                                Retry
                            </button>
                        </div>
                    ) : journeysLoading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                            <p style={styles.loadingText}>Loading journeys...</p>
                        </div>
                    ) : upcomingJourneys.length > 0 ? (
                        <div style={styles.journeysList}>
                            {upcomingJourneys.map((journey, index) => (
                                <div key={journey._id || index} style={styles.journeyCard}>
                                    <div style={styles.journeyTime}>
                                        <strong>{journey.departureTime.toLocaleTimeString()}</strong>
                                        <div style={styles.journeyDate}>
                                            {journey.departureTime.toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={styles.journeyRoute}>
                                        {journey.route?.name || 'Route Name'}
                                        <div style={styles.journeyCode}>{journey.route?.code}</div>
                                    </div>
                                    <div style={styles.journeyStatus}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: 
                                                journey.status === 'ongoing' ? '#28a745' : 
                                                journey.status === 'completed' ? '#6c757d' :
                                                journey.status === 'cancelled' ? '#dc3545' : '#007bff'
                                        }}>
                                            {journey.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noResults}>
                            <FaBus style={styles.noResultsIcon} />
                            <p>No upcoming journeys found.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

const styles = {
    dashboard: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        backgroundColor: '#fff',
        padding: '1rem 2rem',
        borderBottom: '2px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    logoContainer: {
        backgroundColor: '#007bff',
        borderRadius: '50%',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '1.5rem',
        color: 'white',
    },
    userInfo: {
        margin: 0,
    },
    userName: {
        margin: 0,
        fontSize: '1.25rem',
        color: '#333',
    },
    userRole: {
        margin: 0,
        fontSize: '0.875rem',
        color: '#666',
    },
    headerRight: {
        display: 'flex',
        gap: '0.5rem',
    },
    iconButton: {
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        borderRadius: '50%',
        padding: '0.75rem',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#666',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
    },
    debugButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 1000
    },
    mainContent: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    searchSection: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    sectionIcon: {
        color: '#007bff',
    },
    searchContainer: {
        display: 'flex',
        gap: '0.5rem',
        maxWidth: '600px',
    },
    searchInput: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
    },
    searchButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    statsSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statIcon: {
        fontSize: '2rem',
        color: '#007bff',
    },
    statNumber: {
        fontSize: '1.5rem',
        margin: 0,
        color: '#333',
    },
    statLabel: {
        margin: 0,
        color: '#666',
        fontSize: '0.875rem',
    },
    routesSection: {
        marginBottom: '2rem',
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
        border: '4px solid rgba(0, 123, 255, 0.2)',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        textAlign: 'center',
        padding: '2rem',
        color: '#666',
    },
    errorMessage: {
        backgroundColor: '#fff3f3',
        border: '1px solid #ffcdd2',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#d32f2f',
    },
    errorIcon: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    retryButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        marginTop: '1rem',
        fontSize: '0.875rem',
    },
    routesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
    },
    routeCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
    },
    routeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    routeName: {
        margin: 0,
        color: '#333',
        fontSize: '1.1rem',
    },
    routeCode: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.875rem',
    },
    routeDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    routeStop: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#666',
        fontSize: '0.875rem',
    },
    stopIcon: {
        color: '#28a745',
    },
    stopCount: {
        fontSize: '0.75rem',
        color: '#999',
        marginTop: '0.5rem',
    },
    noResults: {
        textAlign: 'center',
        padding: '3rem',
        color: '#666',
    },
    noResultsIcon: {
        fontSize: '3rem',
        color: '#ddd',
        marginBottom: '1rem',
    },
    journeysSection: {
        marginBottom: '2rem',
    },
    journeysList: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    journeyCard: {
        padding: '1rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    journeyTime: {
        flex: 1,
        color: '#333',
    },
    journeyRoute: {
        flex: 2,
        color: '#666',
        textAlign: 'center',
    },
    journeyStatus: {
        flex: 1,
        textAlign: 'right',
    },
    statusBadge: {
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        color: 'white',
        textTransform: 'capitalize',
    },
    inactiveRoute: {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
    },
    journeyDate: {
        fontSize: '0.75rem',
        color: '#666',
    },
    journeyCode: {
        fontSize: '0.75rem',
        color: '#666',
    },
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
};

export default Homepage;