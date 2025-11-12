// --- START OF FILE Homepage.jsx ---

import React, { useState, useEffect } from 'react';
import { logout, getCurrentUser } from './auth'; // Assuming auth helpers exist
import { useNavigate } from 'react-router-dom';
import { 
    FaHome, FaSignOutAlt, FaSearch, FaMapMarkerAlt, FaClock, 
    FaBus, FaArrowRight, FaCreditCard, FaCalendarAlt, FaHistory,
    FaAngleDoubleRight, FaExclamationTriangle, FaArrowUp
} from 'react-icons/fa';



// --- UTILITY: Custom Fetch Hook ---
// Manages loading/error state and handles Bearer token for protected routes
const useFetch = (baseUrl, initialValue = []) => {
    const [data, setData] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (params = {}) => {
        setLoading(true);
        setError(null);
        
        const { id, type, userId, ...queryParams } = params; // Destructure userId/type
        
        let fullUrl = baseUrl;
        
        if (id) {
            fullUrl = `${baseUrl}/${id}`;
        }
        
        // Build query string, ensuring userId and type are included for /api/bookings
        const finalQueryParams = { ...queryParams };
        if (userId) finalQueryParams.userId = userId;
        if (type) finalQueryParams.type = type;
        
        if (Object.keys(finalQueryParams).length > 0) {
            const query = new URLSearchParams(finalQueryParams).toString();
            fullUrl = `${fullUrl}?${query}`;
        }
        
        try {
            const token = localStorage.getItem('token'); 
            
            const response = await fetch(fullUrl, {
                headers: {
                    // Though non-RBAC, keep Authorization header for other endpoints that might use it
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || `Error: ${response.status} - ${response.statusText}`);
            }
            
            const result = await response.json();
            setData(result);
            return result; 
        } catch (err) {
            console.error(`Error fetching ${baseUrl}:`, err);
            setError(err.message || 'Failed to fetch data');
            setData(Array.isArray(initialValue) ? [] : null);
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        // FIX: Prevent automatic fetch for /api/bookings on mount since it requires userId
        const isBookingRoute = baseUrl === '/api/bookings';
        
        if (baseUrl && !baseUrl.includes('/search') && !isBookingRoute) {
             fetchData();
        }
    }, [baseUrl]);

    return { data, loading, error, refetch: fetchData };
};


// --- HOMEPAGE COMPONENT ---
const Homepage = () => {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    // Data Fetching Hooks
    const { data: allBusStops, refetch: fetchBusStops } = useFetch('/api/busstops');
    const { data: upcomingJourneys, loading: journeysLoading, error: journeysError, refetch: fetchUpcomingJourneys } = useFetch('/api/journeys');
    // FIX: Removed default fetch for bookings
    const { data: userBookings, loading: bookingsLoading, error: bookingsError, refetch: fetchUserBookings } = useFetch('/api/bookings', []); 
    const { refetch: fetchJourneyDetails } = useFetch('/api/journeys'); 

    // Journey Planning State
    const [originStop, setOriginStop] = useState('');
    const [destinationStop, setDestinationStop] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [availableJourneys, setAvailableJourneys] = useState([]);
    const [journeySearchLoading, setJourneySearchLoading] = useState(false);
    const [journeySearchError, setJourneySearchError] = useState(null);
    const [selectedJourney, setSelectedJourney] = useState(null);
    const [selectedSeatsCount, setSelectedSeatsCount] = useState(1);
    
    // Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [detailedJourney, setDetailedJourney] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // UI State
    const [bookingTab, setBookingTab] = useState('upcoming');


    useEffect(() => {
        fetchBusStops();
        // FIX: Manual fetch for bookings only when currentUser ID is available
        const userId = currentUser?._id || currentUser?.id;
        if (userId) {
             fetchUserBookings({ userId, type: 'upcoming' });
        }
    }, [currentUser?.id, currentUser?._id]); 

    // Helper: Dummy price calculator to mimic backend for the modal to work
    const calculateJourneyPrice = (journey) => journey?.price || 120; 

    // Helper to get full journey details for the modal
    const viewJourneyDetails = async (journeyId) => {
        const result = await fetchJourneyDetails({ id: journeyId });
        
        if (result) {
            setDetailedJourney(result);
            setShowDetailsModal(true);
        } else {
            alert('Failed to load full journey details.');
        }
    };

    const searchJourneys = async () => {
        if (!originStop || !destinationStop || originStop === destinationStop) {
            alert('Please select valid and different origin and destination stops.');
            return;
        }
        
        setJourneySearchLoading(true);
        setJourneySearchError(null);
        setAvailableJourneys([]);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/journeys/search?origin=${originStop}&destination=${destinationStop}&date=${selectedDate}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || response.statusText);
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
    
    const handleBookingTabChange = (type) => {
        setBookingTab(type);
        // FIX: Pass userId to fetchUserBookings
        const userId = currentUser?._id || currentUser?.id;
        if (userId) {
            fetchUserBookings({ userId, type });
        } else {
            alert("User not logged in.");
        }
    };

    const bookJourney = (journey) => {
        setSelectedJourney(journey);
        setSelectedSeatsCount(1);
        setShowPaymentModal(true);
    };

    const processPayment = async (paymentDetails) => {
        if (!selectedJourney || !selectedSeatsCount) return;
        
        try {
            const token = localStorage.getItem('token');
            const selectedSeats = Array.from({ length: selectedSeatsCount }, (_, i) => 
                `S${(selectedJourney.totalSeats - selectedJourney.availableSeats) + i + 1}`
            );
            
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    journeyId: selectedJourney._id,
                    // FIX: Pass userId in the body for POST
                    userId: currentUser?._id || currentUser?.id, 
                    selectedSeats: selectedSeats,
                    pricePerSeat: selectedJourney.price, 
                    paymentDetails, 
                }),
            });
            
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || response.statusText);
            }
            
            alert(`Booking confirmed for ${selectedSeatsCount} seat(s)!`);
            setShowPaymentModal(false);
            setSelectedJourney(null);
            
            searchJourneys(); 
            handleBookingTabChange('upcoming');
        } catch (error) {
            console.error('Error booking journey:', error);
            alert('Failed to book journey: ' + error.message);
        }
    };

    const PaymentModal = () => {
        const [cardNumber, setCardNumber] = useState('');
        const [name, setName] = useState('');
        
        const pricePerSeat = selectedJourney?.price || 120;
        const totalPayable = pricePerSeat * selectedSeatsCount;
        
        const handleSubmit = (e) => {
            e.preventDefault();
            if (selectedSeatsCount < 1 || selectedSeatsCount > selectedJourney?.availableSeats) {
                alert('Invalid seat count.');
                return;
            }
            if (cardNumber.length < 16 || name.length < 3) {
                 alert('Please enter valid payment details.');
                 return;
            }
            processPayment({
                cardNumber,
                name
            });
        };
        
        if (!showPaymentModal) return null;
        
        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modal}>
                    <h2 style={styles.modalTitle}>Book & Pay</h2>
                    <p style={styles.journeyDetails}>
                        <FaBus style={{marginRight: '5px'}} /> 
                        {selectedJourney?.origin} <FaArrowRight style={{margin: '0 5px'}} /> {selectedJourney?.destination}
                        <br />
                        <FaCalendarAlt style={{marginRight: '5px'}} /> 
                        {new Date(selectedJourney?.departureTime).toLocaleString()}
                        <br />
                        <FaCreditCard style={{marginRight: '5px'}} /> 
                        Price per seat: ₹{pricePerSeat} | Total Seats: {selectedSeatsCount}
                    </p>
                    
                    <form onSubmit={handleSubmit} style={styles.paymentForm}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Number of Seats</label>
                            <input 
                                type="number" 
                                value={selectedSeatsCount} 
                                onChange={(e) => {
                                    const count = parseInt(e.target.value);
                                    const maxSeats = selectedJourney?.availableSeats || 1;
                                    setSelectedSeatsCount(Math.min(Math.max(1, count), maxSeats));
                                }}
                                min="1"
                                max={selectedJourney?.availableSeats || 1}
                                required 
                                style={styles.input} 
                            />
                            <small style={{color: '#999', marginTop: '5px'}}>Available: {selectedJourney?.availableSeats || 0}</small>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name on Card</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={styles.input} />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Card Number (Dummy)</label>
                            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="XXXX XXXX XXXX XXXX" required style={styles.input} />
                        </div>
                        
                        <div style={styles.formActions}>
                            <button type="button" onClick={() => setShowPaymentModal(false)} style={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" style={styles.payButton}>
                                Pay ₹{totalPayable}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    
    const JourneyDetailsModal = () => {
        if (!showDetailsModal || !detailedJourney) return null;

        const route = detailedJourney.route;
        const driver = detailedJourney.driver;
        const vehicle = detailedJourney.vehicle;
        const stops = route?.stops || [];

        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modal} className="journey-details-modal">
                    <h2 style={styles.modalTitle}>Journey Details - {route?.routeName}</h2>
                    <p style={{color: '#ccc', marginBottom: '10px'}}>
                        **Route Code:** {route?.routeCode} | **Date:** {new Date(detailedJourney.date).toLocaleDateString()}
                    </p>
                    
                    <div style={styles.detailsSection}>
                        <h4 style={styles.detailsSubtitle}>Timeline</h4>
                        <div style={styles.timeline}>
                            {/* Origin Stop */}
                            <div style={styles.timelineItem}>
                                <FaMapMarkerAlt style={styles.timelineIcon} />
                                <div>
                                    <strong>{route?.originStop?.stopName} (Origin)</strong>
                                    <p>{detailedJourney.originDepartureTime || route?.originDepartureTime}</p>
                                </div>
                            </div>
                            
                            {/* Intermediate Stops */}
                            {stops.map((stop, index) => (
                                <div key={index} style={styles.timelineItem}>
                                    <FaBus style={styles.timelineIcon} />
                                    <div>
                                        <strong>{stop.stop?.stopName}</strong>
                                        <p>Arr: {stop.arrivalTime || 'N/A'} | Dep: {stop.departureTime || 'N/A'}</p>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Destination Stop */}
                            <div style={styles.timelineItem}>
                                <FaArrowUp style={styles.timelineIcon} />
                                <div>
                                    <strong>{route?.destinationStop?.stopName} (Destination)</strong>
                                    <p>Arrival: {detailedJourney.destinationArrivalTime || route?.destinationArrivalTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.detailsSection}>
                        <h4 style={styles.detailsSubtitle}>Vehicle & Driver</h4>
                        <p style={styles.detailText}>**Driver:** {driver?.firstName} {driver?.lastName} ({driver?.email})</p>
                        <p style={styles.detailText}>**Vehicle:** {vehicle?.model} - {vehicle?.plateNumber} (Seats: {vehicle?.totalSeats})</p>
                        <p style={styles.detailText}>**Available Seats:** {detailedJourney.totalSeats - detailedJourney.bookedSeats}</p>
                    </div>

                    <div style={{ ...styles.formActions, marginTop: '20px' }}>
                        <button 
                            type="button" 
                            onClick={() => setShowDetailsModal(false)} 
                            style={styles.cancelButton}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const pricePerSeat = calculateJourneyPrice(detailedJourney);
                                
                                bookJourney({ 
                                    _id: detailedJourney._id, 
                                    origin: route.originStop.stopName, 
                                    destination: route.destinationStop.stopName, 
                                    departureTime: detailedJourney.date,
                                    price: pricePerSeat, 
                                    availableSeats: detailedJourney.totalSeats - detailedJourney.bookedSeats,
                                    totalSeats: detailedJourney.totalSeats
                                });
                                setShowDetailsModal(false);
                            }}
                            style={styles.payButton}
                            disabled={detailedJourney.totalSeats - detailedJourney.bookedSeats <= 0}
                        >
                            <FaCreditCard style={{marginRight: '5px'}} /> Book Now
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // --- Render ---

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
                    <button style={styles.iconButton} onClick={() => navigate('/dashboard')} title="Dashboard">
                        <FaHome />
                    </button>
                    <button style={styles.iconButton} onClick={handleLogout} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>

            <main style={styles.mainContent}>
                
                {/* 1. JOURNEY PLANNING SECTION */}
                <section style={styles.bookingSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaSearch style={styles.sectionIcon} />
                        Search & Book Your Journey
                    </h3>
                    
                    <div style={styles.bookingForm}>
                        <div style={styles.formRow}>
                            {/* Origin Stop */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Origin Stop</label>
                                <select 
                                    value={originStop}
                                    onChange={(e) => setOriginStop(e.target.value)}
                                    style={styles.select}
                                    disabled={allBusStops.length === 0}
                                >
                                    <option value="">Select Origin</option>
                                    {allBusStops.map(stop => (
                                        <option key={stop._id} value={stop._id}>
                                            {stop.stopName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={styles.iconContainer}>
                                <FaAngleDoubleRight style={styles.arrowIcon} />
                            </div>
                            
                            {/* Destination Stop */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Destination Stop</label>
                                <select 
                                    value={destinationStop}
                                    onChange={(e) => setDestinationStop(e.target.value)}
                                    style={styles.select}
                                    disabled={allBusStops.length === 0}
                                >
                                    <option value="">Select Destination</option>
                                    {allBusStops.map(stop => (
                                        <option key={stop._id} value={stop._id}>
                                            {stop.stopName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Date */}
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
                            
                            <button onClick={searchJourneys} style={styles.searchButton}>
                                <FaSearch style={{marginRight: '5px'}} /> Find Journeys
                            </button>
                        </div>
                    </div>
                    
                    {/* Journey Search Results */}
                    {journeySearchLoading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.loadingSpinner}></div>
                            <p style={styles.loadingText}>Searching for journeys...</p>
                        </div>
                    ) : journeySearchError ? (
                        <ErrorMessage message={journeySearchError} onRetry={searchJourneys} />
                    ) : availableJourneys.length > 0 ? (
                        <JourneyResults 
                            journeys={availableJourneys} 
                            onBook={bookJourney} 
                            onViewDetails={viewJourneyDetails}
                        />
                    ) : originStop && destinationStop && !journeySearchLoading ? (
                        <NoResults message="No journeys found for your criteria." />
                    ) : null}
                </section>

           
                
                
                {/* 3. USER BOOKINGS (Past, Upcoming, Current) */}
                <section style={styles.routesSection}>
                    <h3 style={styles.sectionTitle}>
                        <FaHistory style={styles.sectionIcon} />
                        My Bookings
                    </h3>
                    
                    <div style={styles.tabContainer}>
                        {['upcoming', 'current', 'past', 'all'].map(tab => (
                            <button
                                key={tab}
                                style={{ ...styles.tabButton, ...(bookingTab === tab ? styles.tabButtonActive : {}) }}
                                onClick={() => handleBookingTabChange(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    
                    {bookingsLoading ? (
                        <div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div></div>
                    ) : bookingsError ? (
                        <ErrorMessage message={bookingsError} onRetry={() => handleBookingTabChange(bookingTab)} />
                    ) : userBookings.length > 0 ? (
                        <UserBookingsList bookings={userBookings} />
                    ) : (
                        <NoResults message={`No ${bookingTab} bookings found.`} />
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
            <JourneyDetailsModal />
        </div>
    );
};

// --- Custom Components ---

const ErrorMessage = ({ message, onRetry }) => (
    <div style={styles.errorMessage}>
        <FaExclamationTriangle style={styles.errorIcon} />
        <p>{message}</p>
        {onRetry && <button onClick={onRetry} style={styles.retryButton}>Retry</button>}
    </div>
);

const NoResults = ({ message }) => (
    <div style={styles.noResults}>
        <FaBus style={styles.noResultsIcon} />
        <p>{message}</p>
    </div>
);

const JourneyResults = ({ journeys, onBook, onViewDetails }) => (
    <div style={styles.journeyResultsContainer}>
        <h4 style={styles.resultsTitle}>Found {journeys.length} Available Journeys</h4>
        {journeys.map((journey, index) => (
            <div key={journey._id || index} style={styles.journeyResult}>
                <div 
                    style={{...styles.journeyInfo, cursor: 'pointer', flex: 2.5}} 
                    onClick={() => onViewDetails(journey._id)} 
                >
                    <div style={styles.journeyTiming}>
                        <div style={styles.searchResultTime}>
                            {new Date(journey.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div style={styles.journeyDuration}>
                            {journey.duration || 'N/A'}
                        </div>
                    </div>
                    
                    <div style={styles.routeStopsDisplay}>
                        <div style={styles.routeStopsNames}>
                            <strong>{journey.origin}</strong>
                            <FaArrowRight style={{margin: '0 5px', fontSize: '0.8rem', color: '#FFDB15'}} />
                            <strong>{journey.destination}</strong>
                        </div>
                        <div style={styles.routeCode}>Route: {journey.route?.routeName} ({journey.route?.routeCode})</div>
                    </div>
                    
                    <div style={styles.journeyPrice}>
                        ₹{journey.price}
                    </div>
                    
                    <div style={styles.seatAvailability}>
                        {journey.availableSeats} / {journey.totalSeats} Seats Available
                    </div>
                </div>
                
                <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                        onClick={() => onViewDetails(journey._id)} 
                        style={styles.detailsButton}
                    >
                        Details
                    </button>
                    <button 
                        onClick={() => onBook(journey)} 
                        style={styles.bookButton}
                        disabled={journey.availableSeats <= 0}
                    >
                        <FaCreditCard style={{marginRight: '5px'}} /> {journey.availableSeats > 0 ? 'Book' : 'Full'}
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const UpcomingJourneysList = ({ journeys }) => (
    <div style={styles.journeysList}>
        {journeys.map((journey, index) => (
            <div key={journey._id || index} style={styles.journeyCard}>
                <div style={styles.journeyTime}>
                    <strong>{new Date(journey.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                    <div style={styles.journeyDate}>
                        {new Date(journey.date).toLocaleDateString()}
                    </div>
                </div>
                <div style={styles.journeyRoute}>
                    {journey.route?.originStop?.stopName} <FaArrowRight style={{fontSize: '0.7rem', color: '#999'}} /> {journey.route?.destinationStop?.stopName}
                    <div style={styles.journeyCode}>{journey.route?.routeName} ({journey.route?.routeCode})</div>
                </div>
                <div style={styles.journeyStatus}>
                    <span style={{
                        ...styles.statusBadge,
                        backgroundColor: journey.status === 'Ongoing' ? '#28a745' : '#007bff'
                    }}>
                        {journey.status}
                    </span>
                </div>
            </div>
        ))}
    </div>
);

const UserBookingsList = ({ bookings }) => (
    <div style={styles.journeysList}>
        {bookings.map((booking, index) => {
            const departureTime = new Date(booking.journey.date);
            
            return (
                <div key={booking._id || index} style={styles.journeyCard}>
                    <div style={styles.journeyTime}>
                        <strong>{departureTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                        <div style={styles.journeyDate}>
                            {departureTime.toLocaleDateString()}
                        </div>
                    </div>
                    <div style={styles.journeyRoute}>
                        {booking.journey.route?.originStop?.stopName} <FaArrowRight style={{fontSize: '0.7rem', color: '#999'}} /> {booking.journey.route?.destinationStop?.stopName}
                        <div style={styles.journeyCode}>
                            Seats: {booking.seats.length} | Total: ₹{booking.totalAmount}
                        </div>
                    </div>
                    <div style={styles.journeyStatus}>
                        <span style={{
                            ...styles.statusBadge,
                            backgroundColor: booking.status === 'Confirmed' ? '#28a745' : '#dc3545'
                        }}>
                            {booking.status}
                        </span>
                    </div>
                </div>
            );
        })}
    </div>
);


// --- Styles (Complete) ---
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
        padding: '12px 20px', 
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        height: '46px',
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
        textAlign: 'left',
        marginLeft: '20px',
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
    searchResultTime: {
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
    detailsButton: {
        backgroundColor: '#555',
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
        maxHeight: '90vh',
        overflowY: 'auto',
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
    routeStopsDisplay: { flex: 1.5 },
    routeStopsNames: { color: 'white', display: 'flex', alignItems: 'center' },
    seatAvailability: { fontSize: '0.9rem', color: '#FFDB15', fontWeight: 'bold' },
    tabContainer: {
        display: 'flex',
        marginBottom: '1rem',
        gap: '10px'
    },
    tabButton: {
        backgroundColor: '#444',
        color: '#ccc',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    tabButtonActive: {
        backgroundColor: '#00A3A3',
        color: 'white',
    },
    detailsSection: {
        backgroundColor: '#444',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px',
    },
    detailsSubtitle: {
        color: '#FFDB15',
        marginTop: 0,
        marginBottom: '10px',
        fontSize: '1.1rem',
    },
    detailText: {
        color: '#ccc',
        fontSize: '0.9rem',
        margin: '5px 0',
    },
    timeline: {
        borderLeft: '2px solid #555',
        paddingLeft: '20px',
    },
    timelineItem: {
        position: 'relative',
        marginBottom: '15px',
        color: 'white',
        fontSize: '0.9rem',
    },
    timelineIcon: {
        position: 'absolute',
        left: '-31px',
        top: '2px',
        backgroundColor: '#333',
        color: '#00A3A3',
        borderRadius: '50%',
        padding: '5px',
        fontSize: '1rem',
        border: '2px solid #555',
    },
};

export default Homepage;