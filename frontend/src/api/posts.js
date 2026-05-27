/**
 * Posts API functions.
 * Handles fetching posts and creating new posts with image upload.
 */

import api from './axios';

/**
 * Get all posts, optionally filtered by search query.
 * @param {string} [search] - Optional search query
 * @returns {Promise} Array of post objects
 */
export const getPosts = async (search = '') => {
  const params = search ? { search } : {};
  const response = await api.get('/posts', { params });
  return response.data;
};

/**
 * Get a single post by ID.
 * @param {number} id - Post ID
 * @returns {Promise} Post object with owner info
 */
export const getPost = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

/**
 * Create a new post with image upload.
 * Uses FormData to send multipart file data.
 * @param {FormData} formData - Contains title, description, and image file
 * @returns {Promise} Created post object
 */
export const createPost = async (formData) => {
  const response = await api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update an existing post.
 * Uses FormData to send multipart file data.
 * @param {number} id - Post ID
 * @param {FormData} formData - Contains title, description, and optional image file
 * @returns {Promise} Updated post object
 */
export const updatePost = async (id, formData) => {
  const response = await api.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete a post by ID.
 * @param {number} id - Post ID
 * @returns {Promise} Resolves when post is deleted
 */
export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

/**
 * Get all posts saved by the current user.
 * @returns {Promise} Array of saved post objects
 */
export const getSavedPosts = async () => {
  const response = await api.get('/posts/saved');
  return response.data;
};

/**
 * Save a post by ID.
 * @param {number} postId - Post ID
 * @returns {Promise} API response payload
 */
export const savePost = async (postId) => {
  const response = await api.post(`/posts/${postId}/save`);
  return response.data;
};

/**
 * Unsave a post by ID.
 * @param {number} postId - Post ID
 * @returns {Promise} API response payload
 */
export const unsavePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}/save`);
  return response.data;
};

