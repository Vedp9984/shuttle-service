import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuth } from "../hooks/useAuth";
import { io } from "socket.io-client";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [locationPermission, setLocationPermission] = useState("pending");
  const [position, setPosition] = useState({ lat: null, lng: null });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch driver assignments
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const assignmentsRes = await axios.get(`${API_BASE_URL}/driver/assignments`, { headers });
        setAssignments(assignmentsRes.data);
        
        // Check if driver has an active trip
        const activeRes = await axios.get(`${API_BASE_URL}/driver/active-trip`, { headers });
        if (activeRes.data) {
          setActiveTrip(activeRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching driver data:", err);
        setError("Failed to load driver dashboard data.");
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDriverData();
    }
  }, [user]);

  // Handle location tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission("granted");
        const initialPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setPosition(initialPosition);

        // Emit initial position to socket
        if (socket && activeTrip) {
          socket.emit("driver_location", {
            tripId: activeTrip._id,
            busId: activeTrip.busId,
            location: initialPosition
          });
        }

        // Start watching position
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setPosition(newPosition);
            
            // Emit updated position to socket
            if (socket && activeTrip) {
              socket.emit("driver_location", {
                tripId: activeTrip._id,
                busId: activeTrip.busId,
                location: newPosition
              });
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setError("Failed to track location. Please check permissions.");
          },
          { enableHighAccuracy: true }
        );

        setIsTracking(true);
        
        // Store watch ID to clear on stop tracking
        window.watchPositionId = watchId;
      },
      (error) => {
        console.error("Error getting initial location:", error);
        if (error.code === 1) { // Permission denied
          setLocationPermission("denied");
        }
        setError("Failed to get your location. Please enable location permissions.");
      }
    );
  };

  const stopTracking = () => {
    if (window.watchPositionId) {
      navigator.geolocation.clearWatch(window.watchPositionId);
      window.watchPositionId = null;
    }
    setIsTracking(false);
    
    // Notify server that tracking has stopped
    if (socket && activeTrip) {
      socket.emit("driver_tracking_stopped", {
        tripId: activeTrip._id,
        busId: activeTrip.busId
      });
    }
  };

  const startTrip = async (tripId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`${API_BASE_URL}/driver/start-trip/${tripId}`, {}, { headers });
      setActiveTrip(response.data);
      
      // Auto-start tracking when trip starts
      startTracking();
    } catch (err) {
      console.error("Error starting trip:", err);
      setError("Failed to start trip. Please try again.");
    }
  };

  const endTrip = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(`${API_BASE_URL}/driver/end-trip/${activeTrip._id}`, {}, { headers });
      
      // Stop tracking and reset active trip
      stopTracking();
      setActiveTrip(null);
    } catch (err) {
      console.error("Error ending trip:", err);
      setError("Failed to end trip. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen p-6 bg-yellow-50 flex items-center justify-center">
      <div className="text-2xl">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-yellow-50">
      <h2 className="text-3xl font-bold mb-6">Driver Dashboard</h2>
      <p className="mb-6">Welcome, {user?.name}!</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {activeTrip ? (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-2xl font-semibold mb-4">Active Trip</h3>
          <div className="mb-4">
            <p>
              <span className="font-semibold">Route:</span> {activeTrip.routeName}
            </p>
            <p>
              <span className="font-semibold">From:</span> {activeTrip.origin}
            </p>
            <p>
              <span className="font-semibold">To:</span> {activeTrip.destination}
            </p>
            <p>
              <span className="font-semibold">Bus:</span> {activeTrip.busNumber}
            </p>
            <p>
              <span className="font-semibold">Scheduled Departure:</span>{" "}
              {new Date(activeTrip.departureTime).toLocaleString()}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Location Tracking</h4>
            {isTracking ? (
              <div>
                <div className="bg-green-100 text-green-800 p-3 rounded mb-3">
                  Tracking is active. Your location is being shared.
                </div>
                <p className="mb-2">
                  <span className="font-medium">Current coordinates:</span> 
                  Lat: {position.lat?.toFixed(6)}, Lng: {position.lng?.toFixed(6)}
                </p>
                <button 
                  onClick={stopTracking} 
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Stop Tracking
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-3">
                  Tracking is inactive. Please start tracking to share your location.
                </div>
                <button 
                  onClick={startTracking} 
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  disabled={locationPermission === "denied"}
                >
                  Start Tracking
                </button>
                {locationPermission === "denied" && (
                  <p className="text-red-600 mt-2">
                    Location permissions denied. Please enable location access in your browser settings.
                  </p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={endTrip} 
            className="bg-red-500 text-white px-6 py-2 rounded font-semibold"
          >
            End Trip
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-xl font-semibold mb-4">No Active Trip</h3>
          <p>You don't have an active trip at the moment. Start one of your scheduled trips below.</p>
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Your Schedule</h3>
        
        {assignments.length === 0 ? (
          <p>You have no upcoming assignments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left">Route</th>
                  <th className="py-2 px-3 text-left">Departure</th>
                  <th className="py-2 px-3 text-left">Bus</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="border-t">
                    <td className="py-3 px-3">
                      <div className="font-medium">{assignment.routeName}</div>
                      <div className="text-sm text-gray-600">{assignment.origin} → {assignment.destination}</div>
                    </td>
                    <td className="py-3 px-3">
                      {new Date(assignment.departureTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">{assignment.busNumber}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        assignment.status === "completed" 
                          ? "bg-gray-200" 
                          : assignment.status === "in-progress" 
                          ? "bg-green-200 text-green-800"
                          : "bg-blue-200 text-blue-800"
                      }`}>
                        {assignment.status === "scheduled" ? "Upcoming" : 
                         assignment.status === "in-progress" ? "In Progress" : 
                         "Completed"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {assignment.status === "scheduled" && !activeTrip && (
                        <button 
                          onClick={() => startTrip(assignment._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Start Trip
                        </button>
                      )}
                      {assignment.status === "in-progress" && (
                        <span className="text-green-600 font-medium">Active</span>
                      )}
                      {assignment.status === "completed" && (
                        <span className="text-gray-600">Finished</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
