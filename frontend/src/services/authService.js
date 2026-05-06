import axiosInstance from './axiosInstance';

/**
 * Register a new user
 * @param {Object} userData - The user registration data
 * @returns {Promise<any>}
 */
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login a user
 * @param {Object} credentials - The user's login credentials
 * @returns {Promise<any>}
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout the user by clearing localStorage
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise<any>}
 */
export const getMe = async () => {
  try {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} data - Profile updates
 * @returns {Promise<any>}
 */
export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.put('/users/me', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Request password reset email
 * @param {string} email - User's email
 * @returns {Promise<any>}
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password using token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<any>}
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};
