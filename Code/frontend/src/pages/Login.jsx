import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Use the login function from AuthContext
      login(user, token, keepSignedIn);

      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "driver") {
        navigate("/driver");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="keepSignedIn"
              className="mr-2"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />
            <label htmlFor="keepSignedIn" className="text-gray-700">
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-yellow-600 hover:text-yellow-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
