import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-yellow-400 px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold text-gray-800">
        Shuttle Service
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/routes" className="hover:underline text-gray-800">
          Routes
        </Link>
        {user ? (
          <>
            <span className="text-gray-800">Hi, {user.firstName}</span>
            <button
              onClick={logout}
              className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="text-gray-800 hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
