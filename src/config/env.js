/**
 * Environment configuration
 * Provides access to environment variables with fallbacks
 */

// Auth configuration
export const AUTH_CONFIG = {
  // Use environment variables or fallback to defaults
  PASSWORD_HASH: process.env.REACT_APP_PASSWORD_HASH || '',
  PASSWORD_SALT: process.env.REACT_APP_PASSWORD_SALT || '',
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// API keys
export const API_KEYS = {
  DEEPSEEK: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
};

// Check if we're in production environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Check for required environment variables
export const validateEnvVars = () => {
  const missing = [];
  
  if (!AUTH_CONFIG.PASSWORD_HASH) missing.push('REACT_APP_PASSWORD_HASH');
  if (!AUTH_CONFIG.PASSWORD_SALT) missing.push('REACT_APP_PASSWORD_SALT');
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};
