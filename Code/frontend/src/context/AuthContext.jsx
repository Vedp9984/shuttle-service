import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

// Change to direct export when declaring
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check localStorage or sessionStorage for token on mount
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      logout();
    }
  };

  const login = (userData, token, keepSignedIn = false) => {
    setUser(userData);
    if (keepSignedIn) localStorage.setItem("token", token);
    else sessionStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/"; // redirect to login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenience
export const useAuth = () => {
  return useContext(AuthContext);
};
