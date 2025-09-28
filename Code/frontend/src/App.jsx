import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./Login";
import Register from "./pages/Register";
import CreateAccount from "./pages/CreateAccount";
import RoutesPage from "./pages/Routes";
import Booking from "./pages/Booking";
import Tracking from "./pages/Tracking";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <Home /> : <Login />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/create-account" element={!user ? <CreateAccount /> : <Navigate to="/" />} />
          <Route path="/routes" element={user ? <RoutesPage /> : <Navigate to="/login" />} />
          <Route path="/booking/:routeId" element={user ? <Booking /> : <Navigate to="/login" />} />
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
      </main>
      <Footer />
    </div>
  );
}

export default App;