import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getCurrentUser();
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      localStorage.setItem('auth_token', response.data.token);
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed'
      );
      return false;
    }
  };

  // Login user
  const login = async (userData) => {
    setError(null);
    try {
      const response = await authService.login(userData);
      localStorage.setItem('auth_token', response.data.token);
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed'
      );
      return false;
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        currentUser, 
        login, 
        logout, 
        register, 
        error,
        clearError: () => setError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
