import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on startup if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('event_hub_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await api.get('/auth/profile');
        setUser({
          id: profile._id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          srn: profile.srn,
        });
      } catch (err) {
        console.error('Failed to authenticate token:', err.message);
        localStorage.removeItem('event_hub_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('event_hub_token', data.token);
      setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        srn: data.srn,
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, role, srn) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { name, email, password, role, srn });
      localStorage.setItem('event_hub_token', data.token);
      setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        srn: data.srn,
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('event_hub_token');
    setUser(null);
    setError(null);
  };

  // Force update user context when roles or lists changes
  const refreshUser = async () => {
    try {
      const profile = await api.get('/auth/profile');
      setUser({
        id: profile._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        srn: profile.srn,
      });
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
