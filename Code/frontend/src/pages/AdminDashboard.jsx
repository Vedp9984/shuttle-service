import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuth } from "../hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch all relevant data in parallel
        const [routesRes, busesRes, driversRes, bookingsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/routes`, { headers }),
          axios.get(`${API_BASE_URL}/buses`, { headers }),
          axios.get(`${API_BASE_URL}/users/drivers`, { headers }),
          axios.get(`${API_BASE_URL}/bookings`, { headers })
        ]);
        
        setRoutes(routesRes.data);
        setBuses(busesRes.data);
        setDrivers(driversRes.data);
        setBookings(bookingsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen p-6 bg-yellow-50 flex items-center justify-center">
      <div className="text-2xl">Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-6 bg-yellow-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-yellow-50">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <p className="mb-6">Welcome, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-3 rounded">
              <p className="text-lg font-bold">{routes.length}</p>
              <p>Routes</p>
            </div>
            <div className="bg-green-100 p-3 rounded">
              <p className="text-lg font-bold">{buses.length}</p>
              <p>Buses</p>
            </div>
            <div className="bg-purple-100 p-3 rounded">
              <p className="text-lg font-bold">{drivers.length}</p>
              <p>Drivers</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded">
              <p className="text-lg font-bold">{bookings.length}</p>
              <p>Bookings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Recent Bookings</h3>
          {bookings.slice(0, 5).map(booking => (
            <div key={booking._id} className="mb-2 pb-2 border-b">
              <p className="font-semibold">Booking #{booking._id.substr(-6)}</p>
              <p className="text-sm text-gray-600">
                User: {booking.userId?.name || 'Unknown'} | 
                Status: <span className={booking.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}>
                  {booking.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Manage Routes</h3>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left">Route Name</th>
              <th className="py-2 px-3 text-left">Origin</th>
              <th className="py-2 px-3 text-left">Destination</th>
              <th className="py-2 px-3 text-left">Price</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route._id} className="border-t">
                <td className="py-2 px-3">{route.routeName}</td>
                <td className="py-2 px-3">{route.origin}</td>
                <td className="py-2 px-3">{route.destination}</td>
                <td className="py-2 px-3">${route.basePrice.toFixed(2)}</td>
                <td className="py-2 px-3">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Manage Buses</h3>
          <ul>
            {buses.map(bus => (
              <li key={bus._id} className="mb-2 pb-2 border-b flex justify-between">
                <span>
                  <span className="font-medium">{bus.busNumber}</span> - 
                  <span className="text-sm ml-1">Capacity: {bus.capacity}</span>
                </span>
                <div>
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Manage Drivers</h3>
          <ul>
            {drivers.map(driver => (
              <li key={driver._id} className="mb-2 pb-2 border-b flex justify-between">
                <span>
                  <span className="font-medium">{driver.name}</span> - 
                  <span className="text-sm ml-1">{driver.email}</span>
                </span>
                <div>
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
