import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoutesPage from "./pages/Routes";
import Booking from "./pages/Booking";
import Tracking from "./pages/Tracking";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import { useAuth } from "./hooks/useAuth";

const Router = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/routes" element={user ? <RoutesPage /> : <Navigate to="/login" />} />
      <Route path="/booking/:scheduleId" element={user ? <Booking /> : <Navigate to="/login" />} />
      <Route path="/tracking/:busId" element={user ? <Tracking /> : <Navigate to="/login" />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />}
      />

      {/* Driver routes */}
      <Route
        path="/driver"
        element={user?.role === "driver" ? <DriverDashboard /> : <Navigate to="/login" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
