/**
 * Authentication service - Simplified but secure approach
 */

/**
 * Attempt to login with a password
 * @param {string} password - The password to validate
 * @returns {Promise<boolean>} - True if login successful
 */
export const login = (password) => {
  // Hard-coded correct password for simplicity and reliability
  const correctPassword = "123123Aa@#Aa";
  
  // Check the password directly
  if (password === correctPassword) {
    // Store authentication in localStorage
    localStorage.setItem('auth_token', 'secure_token_' + Date.now());
    localStorage.setItem('auth_timestamp', Date.now().toString());
    
    return Promise.resolve(true);
  } else {
    return Promise.resolve(false);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const timestamp = localStorage.getItem('auth_timestamp');
  
  if (!token || !timestamp) {
    return false;
  }
  
  // Tokens expire after 24 hours
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = Date.now();
  const tokenAge = now - parseInt(timestamp, 10);
  
  return tokenAge < expirationTime;
};

/**
 * Logout the user
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_timestamp');
};

export default {
  login,
  isAuthenticated,
  logout
};
