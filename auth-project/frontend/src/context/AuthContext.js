import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

// ─── Create Context ───────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Auth Provider ────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while verifying token on mount
  const [error, setError] = useState(null);

  // ── On app load: restore session from localStorage ─────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (token && storedUser) {
        try {
          // Verify the token is still valid against the server
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch {
          // Token invalid or expired — clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setError(null);
    const res = await authAPI.register({ name, email, password });
    const { token, user: userData } = res.data;

    // MILESTONE 2: Store JWT in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    const res = await authAPI.login({ email, password });
    const { token, user: userData } = res.data;

    // MILESTONE 2: Store JWT in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Even if the server call fails, clear local state
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Custom hook ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
