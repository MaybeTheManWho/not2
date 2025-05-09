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

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("Auth check starting...");

      if (authService.isAuthenticated()) {
        console.log("Token found in localStorage");

        try {
          console.log("Attempting to fetch current user...");
          const response = await authService.getCurrentUser();
          console.log("User data received:", response.data);

          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.log("Auth error:", err);
          localStorage.removeItem('auth_token');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        console.log("No token found, not authenticated");
      }

      console.log("Setting loading to false");
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

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

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        currentUser,
        isLoading, // ✅ pass to App
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

export default AuthProvider;
