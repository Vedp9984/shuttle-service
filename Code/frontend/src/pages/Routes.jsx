import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const Routes = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/routes`);
        setRoutes(res.data);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-yellow-50">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Routes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route._id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{route.routeName}</h3>
            <p className="text-gray-600">{route.description}</p>
            <p className="mt-2">
              <strong>From:</strong> {route.origin} <br />
              <strong>To:</strong> {route.destination}
            </p>
            <p className="mt-2 font-bold">${route.basePrice.toFixed(2)}</p>
            <Link
              to={`/booking/${route._id}`}
              className="mt-4 inline-block bg-yellow-400 px-4 py-2 rounded hover:bg-yellow-500 text-gray-800 font-semibold"
            >
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Routes;
