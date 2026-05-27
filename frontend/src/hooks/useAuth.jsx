/**
 * Authentication context and hook.
 * Provides auth state (user, token) and actions (login, logout)
 * to all components in the app via React Context.
 */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useState, useEffect } from 'react';
import { getSavedPosts, savePost, unsavePost } from '../api/posts';

// Create the auth context
const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app to provide auth state everywhere.
 * Reads persisted auth from localStorage on mount.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedPostIds, setSavedPostIds] = useState([]);

  // On mount, restore auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch saved post IDs whenever the user changes
  useEffect(() => {
    const fetchSavedPostIds = async () => {
      try {
        const savedPosts = await getSavedPosts();
        setSavedPostIds(savedPosts.map((p) => p.id));
      } catch (err) {
        console.error('Failed to fetch saved posts:', err);
      }
    };

    if (user) {
      fetchSavedPostIds();
    } else {
      setSavedPostIds([]);
    }
  }, [user]);

  /**
   * Save a post and update the local state.
   */
  const savePostId = async (postId) => {
    try {
      await savePost(postId);
      setSavedPostIds((prev) => [...prev, postId]);
    } catch (err) {
      console.error('Failed to save post:', err);
      throw err;
    }
  };

  /**
   * Unsave a post and update the local state.
   */
  const unsavePostId = async (postId) => {
    try {
      await unsavePost(postId);
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
    } catch (err) {
      console.error('Failed to unsave post:', err);
      throw err;
    }
  };

  /**
   * Log in — save token and user to state + localStorage.
   * @param {string} newToken - JWT access token
   * @param {object} userData - User object from API
   */
  const loginUser = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Log out — clear token and user from state + localStorage.
   */
  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    savedPostIds,
    savePostId,
    unsavePostId,
    login: loginUser,
    logout: logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook — access auth context from any component.
 * Must be used inside an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
