import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── MILESTONE 3: PROTECTED ROUTE ────────────────────────────────────────────
// If JWT is missing or expired, redirect to /login
// Preserves the attempted URL so user is sent back after login

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a loading spinner while verifying the token on app mount
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        color: '#c8b5f0'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Not authenticated → redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
