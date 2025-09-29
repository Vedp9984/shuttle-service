import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import CreateAccountUser from "./CreateAccountUser";
import Welcome from "./Welcome";
import Homepage from "./Homepage";
import AdminDashboard from "./AdminDashboard";
import DriverDashboard from "./DriverDashboard";
import { getCurrentUser } from "./auth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
/**
 * PublicRoute: For routes accessible only by logged-out users (e.g., login, register).
 * If a logged-in user tries to access these, they are redirected to their dashboard.
 */
function PublicRoute({ children }) {
    const user = getCurrentUser();
    if (user) {
        // Redirect to the correct dashboard based on the user's role
        if (user.role === 'Admin') return <Navigate to="/admin" />;
        if (user.role === 'Driver') return <Navigate to="/driver" />;
        return <Navigate to="/homepage" />; // Default for 'User'
    }
    return children;
}

/**
 * RoleProtectedRoute: For routes accessible only by logged-in users with specific roles.
 * Checks for a valid session and verifies the user's role.
 * @param {{ children: JSX.Element, allowedRoles: string[] }} props
 */
function RoleProtectedRoute({ children, allowedRoles }) {
    const user = getCurrentUser();

    // 1. Check if the user is logged in
    if (!user) {
        // If not, redirect them to the login page
        return <Navigate to="/login" />;
    }

    // 2. Check if the logged-in user's role is in the list of allowed roles
    if (!allowedRoles.includes(user.role)) {
        // If their role is not allowed, redirect them. Redirecting to the root '/'
        // is the safest option, as the PublicRoute logic will then send them
        // to their designated dashboard (e.g., an admin trying to access /driver
        // will be sent back to /admin).
        return <Navigate to="/" />;
    }

    // 3. If the user is logged in and has the correct role, render the page
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- Public Routes (For Logged-Out Users Only) --- */}
                <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><CreateAccountUser /></PublicRoute>} />

                {/* --- Protected Routes with Role-Based Access --- */}
                <Route
                    path="/homepage"
                    element={
                        <RoleProtectedRoute allowedRoles={['User']}>
                            <Homepage />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <RoleProtectedRoute allowedRoles={['Admin']}>
                            <AdminDashboard />
                            <ToastContainer 
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                        </RoleProtectedRoute>
                    }
                />
                <Route
                    path="/driver"
                    element={
                        <RoleProtectedRoute allowedRoles={['Driver']}>
                            <DriverDashboard />
                        </RoleProtectedRoute>
                    }
                />
                
                {/* --- Fallback Route --- */}
                {/* Any URL not matching the above will redirect to the root */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
