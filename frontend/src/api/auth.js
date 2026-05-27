/**
 * Authentication API functions.
 * Handles user registration and login requests.
 */

import api from './axios';

/**
 * Register a new user.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise} API response with user data
 */
export const register = async (username, email, password) => {
  const response = await api.post('/register', {
    username,
    email,
    password,
  });
  return response.data;
};

/**
 * Log in an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise} API response with JWT token and user data
 */
export const login = async (email, password) => {
  const response = await api.post('/login', {
    email,
    password,
  });
  return response.data;
};
