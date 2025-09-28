import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-yellow-200 p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Shuttle Service</h1>
      <p className="text-gray-700 mb-8">
        Book your rides, track buses, and manage your trips with ease.
      </p>
      <div className="flex gap-4">
        <Link
          to="/routes"
          className="bg-yellow-400 px-6 py-3 rounded hover:bg-yellow-500 text-gray-800 font-semibold"
        >
          View Routes
        </Link>
        <Link
          to="/tracking"
          className="bg-yellow-400 px-6 py-3 rounded hover:bg-yellow-500 text-gray-800 font-semibold"
        >
          Track Buses
        </Link>
      </div>
    </div>
  );
};

export default Home;
