import React, { useState, useEffect } from 'react';
import { logout, getCurrentUser } from './auth';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaSearch, FaMapMarkerAlt, FaClock, FaBus, FaRoute, FaSync, FaExclamationTriangle, FaArrowRight, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';

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

    // New state for journey planning functionality
    const [allBusStops, setAllBusStops] = useState([]);
    const [originStop, setOriginStop] = useState('');
    const [destinationStop, setDestinationStop] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [availableJourneys, setAvailableJourneys] = useState([]);
    const [journeySearchLoading, setJourneySearchLoading] = useState(false);
    const [journeySearchError, setJourneySearchError] = useState(null);
    const [selectedJourney, setSelectedJourney] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        fetchRoutes();
        fetchUpcomingJourneys();
        fetchBusStops(); // Add this new API call
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

    const fetchBusStops = async () => {
        try {
            const response = await fetch('/api/busstops');
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Bus stops:', data);
            setAllBusStops(data);
        } catch (error) {
            console.error('Error fetching bus stops:', error);
        }
    };

    const searchJourneys = async () => {
        if (!originStop || !destinationStop) {
            alert('Please select both origin and destination stops');
            return;
        }
        
        setJourneySearchLoading(true);
        setJourneySearchError(null);
        setAvailableJourneys([]);
        
        try {
            const response = await fetch(
                `/api/journeys/search?origin=${originStop}&destination=${destinationStop}&date=${selectedDate}`
            );
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            setAvailableJourneys(data);
        } catch (error) {
            console.error('Error searching journeys:', error);
            setJourneySearchError(error.message || 'Failed to search for journeys');
        } finally {
            setJourneySearchLoading(false);
        }
    };

    const bookJourney = (journey) => {
        setSelectedJourney(journey);
        setShowPaymentModal(true);
    };

    const processPayment = async (paymentDetails) => {
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    journeyId: selectedJourney._id,
                    userId: currentUser?.id,
                    paymentDetails,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            alert('Journey booked successfully!');
            setShowPaymentModal(false);
            setSelectedJourney(null);
            
            fetchUpcomingJourneys();
        } catch (error) {
            console.error('Error booking journey:', error);
            alert('Failed to book journey: ' + error.message);
        }
    };

    const PaymentModal = () => {
        const [cardNumber, setCardNumber] = useState('');
        const [expiryDate, setExpiryDate] = useState('');
        const [cvv, setCvv] = useState('');
        const [name, setName] = useState('');
        
        const handleSubmit = (e) => {
            e.preventDefault();
            processPayment({
                cardNumber,
                expiryDate,
                cvv,
                name
            });
        };
        
        if (!showPaymentModal) return null;
        
        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                    <h2 style={styles.modalTitle}>Complete Payment</h2>
                    <p style={styles.journeyDetails}>
                        Journey from {selectedJourney?.origin} to {selectedJourney?.destination}
                        <br />
                        Date: {new Date(selectedJourney?.departureTime).toLocaleDateString()}
                        <br />
                        Time: {new Date(selectedJourney?.departureTime).toLocaleTimeString()}
                        <br />
                        Price: ₹120
                    </p>
                    
                    <form onSubmit={handleSubmit} style={styles.paymentForm}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name on Card</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                style={styles.input} 
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Card Number</label>
                            <input 
                                type="text" 
                                value={cardNumber} 
                                onChange={(e) => setCardNumber(e.target.value)} 
                                placeholder="XXXX XXXX XXXX XXXX" 
                                required 
                                style={styles.input} 
                            />
                        </div>
                        
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Expiry Date</label>
                                <input 
                                    type="text" 
                                    value={expiryDate} 
                                    onChange={(e) => setExpiryDate(e.target.value)} 
                                    placeholder="MM/YY" 
                                    required 
                                    style={styles.input} 
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>CVV</label>
                                <input 
                                    type="text" 
                                    value={cvv} 
                                    onChange={(e) => setCvv(e.target.value)} 
                                    placeholder="XXX" 
                                    required 
                                    style={styles.input} 
                                />
                            </div>
                        </div>
                        
                        <div style={styles.formActions}>
                            <button type="button" onClick={() => setShowPaymentModal(false)} style={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" style={styles.payButton}>
                                Pay ₹120
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
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
                {/* New Journey Planning Section */}
                <section style={styles.bookingSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaBus style={styles.sectionIcon} />
                        Plan Your Journey
                    </h3>
                    
                    <div style={styles.bookingForm}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>From</label>
                                <select 
                                    value={originStop}
                                    onChange={(e) => setOriginStop(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="">Select Origin</option>
                                    {allBusStops.map(stop => (
                                        <option key={stop._id} value={stop._id}>
                                            {stop.name} - {stop.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={styles.iconContainer}>
                                <FaArrowRight style={styles.arrowIcon} />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>To</label>
                                <select 
                                    value={destinationStop}
                                    onChange={(e) => setDestinationStop(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="">Select Destination</option>
                                    {allBusStops.map(stop => (
                                        <option key={stop._id} value={stop._id}>
                                            {stop.name} - {stop.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date</label>
                                <div style={styles.dateInputContainer}>
                                    <FaCalendarAlt style={styles.dateIcon} />
                                    <input 
                                        type="date" 
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={styles.dateInput}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <button onClick={searchJourneys} style={styles.searchButton}>
                            Find Journeys
                        </button>
                    </div>
                    
                    {/* Journey Search Results */}
                    {journeySearchLoading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                            <p style={styles.loadingText}>Searching for journeys...</p>
                        </div>
                    ) : journeySearchError ? (
                        <div style={styles.errorMessage}>
                            <FaExclamationTriangle style={styles.errorIcon} />
                            <p>{journeySearchError}</p>
                            <button onClick={searchJourneys} style={styles.retryButton}>
                                Retry
                            </button>
                        </div>
                    ) : availableJourneys.length > 0 ? (
                        <div style={styles.journeyResultsContainer}>
                            <h4 style={styles.resultsTitle}>Available Journeys</h4>
                            {availableJourneys.map((journey, index) => (
                                <div key={journey._id || index} style={styles.journeyResult}>
                                    <div style={styles.journeyInfo}>
                                        <div style={styles.journeyTiming}>
                                            <div style={styles.searchResultTime}>
                                                {new Date(journey.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <div style={styles.journeyDuration}>
                                                {journey.duration || '45m'}
                                            </div>
                                        </div>
                                        
                                        <div style={styles.journeyRoute}>
                                            <div>{journey.route?.routeName || 'Direct Route'}</div>
                                            <div style={styles.routeCode}>{journey.route?.routeCode || 'DR1'}</div>
                                        </div>
                                        
                                        <div style={styles.journeyPrice}>
                                            ₹{journey.price || '120'}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => bookJourney(journey)} 
                                        style={styles.bookButton}
                                    >
                                        <FaCreditCard style={{marginRight: '5px'}} /> Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : originStop && destinationStop ? (
                        <div style={styles.noResults}>
                            <FaBus style={styles.noResultsIcon} />
                            <p>No journeys found between the selected stops on this date.</p>
                        </div>
                    ) : null}
                </section>

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

            <footer style={styles.bottomNav}>
                <button style={styles.navButton} onClick={() => navigate('/homepage')} title="Home">
                    <FaHome style={styles.navIcon} />
                    <span>Home</span>
                </button>
                <button style={styles.navButton} onClick={handleLogout} title="Logout">
                    <FaSignOutAlt style={styles.navIcon} />
                    <span>Logout</span>
                </button>
            </footer>
            
            <PaymentModal />
        </div>
    );
};

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
    searchSection: {
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
        color: '#FFDB15',
    },
    searchContainer: {
        display: 'flex',
        gap: '10px',
        maxWidth: '600px',
    },
    searchInput: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#333',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        color: 'white',
    },
    searchButton: {
        backgroundColor: '#FFDB15',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        padding: '0 20px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    statsSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    statIcon: {
        fontSize: '2rem',
        color: '#FFDB15',
    },
    statNumber: {
        fontSize: '1.5rem',
        margin: 0,
        color: 'white',
    },
    statLabel: {
        margin: 0,
        color: '#ccc',
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
        border: '4px solid rgba(255, 219, 21, 0.2)',
        borderTop: '4px solid #FFDB15',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        textAlign: 'center',
        padding: '1rem',
        color: '#ccc',
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
    retryButton: {
        backgroundColor: '#FFDB15',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        marginTop: '1rem',
        fontSize: '0.875rem',
        fontWeight: 'bold',
    },
    routesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
    },
    routeCard: {
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '8px',
        transition: 'transform 0.2s',
    },
    routeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
    },
    routeName: {
        margin: 0,
        color: 'white',
        fontSize: '1.1rem',
    },
    routeCode: {
        backgroundColor: '#FFDB15',
        color: 'black',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: 'bold',
    },
    routeDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    routeStop: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ccc',
        fontSize: '0.875rem',
    },
    stopIcon: {
        color: '#FFDB15',
    },
    stopCount: {
        fontSize: '0.75rem',
        color: '#999',
        marginTop: '10px',
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
    journeysSection: {
        marginBottom: '2rem',
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
    },
    journeyRoute: {
        flex: 2,
        color: '#ccc',
        textAlign: 'center',
    },
    journeyStatus: {
        flex: 1,
        textAlign: 'right',
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        color: 'white',
        textTransform: 'capitalize',
    },
    inactiveRoute: {
        color: '#ff6666',
        fontSize: '0.875rem',
        marginTop: '10px',
    },
    journeyDate: {
        fontSize: '0.75rem',
        color: '#999',
    },
    journeyCode: {
        fontSize: '0.75rem',
        color: '#999',
    },
    bottomNav: {
        backgroundColor: '#00A3A3',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        borderTopLeftRadius: '25px',
        borderTopRightRadius: '25px',
    },
    navButton: {
        background: 'none',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '0.8em',
        gap: '4px',
    },
    navIcon: {
        fontSize: '1.8em',
    },
    bookingSection: {
        backgroundColor: '#222',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '2rem',
    },
    bookingForm: {
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    formRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'flex-end',
        marginBottom: '15px',
    },
    formGroup: {
        flex: '1 1 200px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        color: '#ccc',
        marginBottom: '8px',
        fontSize: '0.9rem',
    },
    select: {
        backgroundColor: '#444',
        border: 'none',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '1rem',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px top 50%',
        backgroundSize: '12px auto',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
        marginBottom: '14px',
    },
    arrowIcon: {
        color: '#FFDB15',
        fontSize: '1.2rem',
    },
    dateInputContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    dateInput: {
        backgroundColor: '#444',
        border: 'none',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '1rem',
        width: '100%',
        paddingLeft: '35px',
    },
    dateIcon: {
        position: 'absolute',
        left: '12px',
        color: '#FFDB15',
        fontSize: '1rem',
    },
    journeyResultsContainer: {
        backgroundColor: '#333',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    resultsTitle: {
        color: '#FFDB15',
        padding: '15px',
        margin: 0,
        borderBottom: '1px solid #444',
    },
    journeyResult: {
        padding: '15px',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    journeyInfo: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flex: 1,
    },
    journeyTiming: {
        display: 'flex',
        flexDirection: 'column',
    },
    searchResultTime: {  // Renamed from journeyTime to searchResultTime
        fontSize: '1.2rem',
        color: 'white',
        fontWeight: 'bold',
    },
    journeyDuration: {
        fontSize: '0.8rem',
        color: '#999',
    },
    journeyPrice: {
        color: '#FFDB15',
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
    bookButton: {
        backgroundColor: '#00A3A3',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
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
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
    },
    modalTitle: {
        color: '#FFDB15',
        marginTop: 0,
    },
    journeyDetails: {
        color: '#ccc',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#444',
        borderRadius: '8px',
    },
    paymentForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        backgroundColor: '#444',
        border: 'none',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '1rem',
        width: '100%',
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
        backgroundColor: '#FFDB15',
        color: 'black',
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

export default Homepage;