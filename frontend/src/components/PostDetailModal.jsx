/**
 * PostDetailModal component — handles displaying post details in a modal,
 * checking ownership, and providing update/delete flows for the post creator.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { updatePost, deletePost } from '../api/posts';

// Backend URL for images
const API_URL = 'https://pinterest-1-5cxw.onrender.com';

export default function PostDetailModal({ post, onClose, onPostUpdated, onPostDeleted }) {
  const { user, isAuthenticated, savedPostIds, savePostId, unsavePostId } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [hoveredSaved, setHoveredSaved] = useState(false);

  const fileInputRef = useRef(null);

  if (!post) return null;

  const isSaved = savedPostIds?.includes(post.id);

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSaveLoading(true);
      if (isSaved) {
        await unsavePostId(post.id);
      } else {
        await savePostId(post.id);
      }
    } catch (err) {
      console.error('Failed to toggle save state', err);
      setError('Failed to update save status. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Determine if the logged-in user is the creator of the post
  const isOwner = user && post && (post.user_id === user.id || (post.owner && post.owner.id === user.id));

  // Handle file selection for image update
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image (JPEG, PNG, GIF, or WebP)');
        return;
      }
      setEditImage(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => setEditPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit update form
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('description', editDescription.trim());
      if (editImage) {
        formData.append('image', editImage);
      }

      const updatedPost = await updatePost(post.id, formData);
      setIsEditing(false);
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update Pin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to delete Pin. Please try again.');
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={loading ? null : onClose}
      />

      {/* Modal Card */}
      <motion.div
        className="relative glass-card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center 
                     rounded-full bg-dark-surface/80 hover:bg-dark-hover 
                     text-text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ─── Image Column ─────────────────── */}
        <div className="md:w-1/2 flex-shrink-0 relative group min-h-[320px] md:min-h-[480px] bg-dark-surface flex items-center justify-center">
          <img
            src={editPreview || `${API_URL}${post.image_url}`}
            alt={post.title}
            className="w-full h-full object-cover max-h-[50vh] md:max-h-[90vh] min-h-[320px] md:min-h-[480px]"
          />
          {isEditing && (
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-full bg-pinterest-red flex items-center justify-center text-white mb-2 shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-white text-xs font-semibold">Replace Image</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* ─── Detail/Edit Column ───────────── */}
        {isEditing ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleUpdate} className="md:w-1/2 px-6 py-6 md:px-10 md:py-8 overflow-y-auto flex flex-col justify-between border-t md:border-t-0 md:border-l border-dark-border">
            <div className="space-y-5 pt-4">
              <h3 className="text-xl font-bold text-text-primary">Edit Pin</h3>

              {error && (
                <div className="p-3.5 bg-pinterest-red/10 border border-pinterest-red/30 rounded-xl text-pinterest-red text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Title <span className="text-pinterest-red">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border 
                             text-text-primary text-sm placeholder-text-muted
                             focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                             transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border 
                             text-text-primary text-sm placeholder-text-muted resize-none
                             focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                             transition-all"
                  placeholder="Describe your pin..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-dark-border">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="w-1/2 py-2.5 bg-dark-hover text-text-secondary text-sm font-semibold rounded-full
                           hover:bg-dark-card hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !editTitle.trim()}
                className="w-1/2 py-2.5 bg-pinterest-red text-white text-sm font-semibold rounded-full
                           hover:bg-pinterest-red-hover transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          /* VIEW MODE DETAILS */
          <div className="md:w-1/2 px-6 py-6 md:px-10 md:py-8 overflow-y-auto flex flex-col justify-between min-h-[320px] md:min-h-[480px] border-t md:border-t-0 md:border-l border-dark-border">
            <div className="flex flex-col pt-4">
              {error && (
                <div className="mb-4 p-3.5 bg-pinterest-red/10 border border-pinterest-red/30 rounded-xl text-pinterest-red text-xs">
                  {error}
                </div>
              )}

              {confirmDelete && (
                <div className="mb-4 p-4 bg-pinterest-red/5 border border-pinterest-red/20 rounded-xl">
                  <p className="text-text-primary text-xs font-semibold mb-3">Delete this Pin? This action cannot be undone.</p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1 bg-dark-hover text-text-secondary text-xs rounded-full hover:bg-dark-card transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3 py-1 bg-pinterest-red text-white text-xs font-semibold rounded-full hover:bg-pinterest-red-hover transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-extrabold text-text-primary mb-4 leading-tight">
                {post.title}
              </h2>
              {post.description && (
                <p className="text-text-secondary mb-6 leading-relaxed whitespace-pre-wrap text-sm">
                  {post.description}
                </p>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-dark-border">
              {/* Author info */}
              {post.owner && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pinterest-red flex items-center justify-center 
                                  text-white font-bold">
                    {post.owner.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{post.owner.username}</p>
                    <p className="text-[11px] text-text-muted">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons (at the bottom, preventing header clutter) */}
              {isOwner ? (
                <div className="flex gap-3 w-full mt-6">
                  <button
                    onClick={() => {
                      setEditTitle(post.title || '');
                      setEditDescription(post.description || '');
                      setEditImage(null);
                      setEditPreview(null);
                      setError('');
                      setIsEditing(true);
                    }}
                    className="w-1/2 py-2.5 bg-dark-hover border border-dark-border text-text-primary rounded-full 
                               hover:bg-dark-card hover:border-text-muted transition-all text-sm font-semibold cursor-pointer 
                               flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-1/2 py-2.5 bg-pinterest-red/10 border border-pinterest-red/20 text-pinterest-red rounded-full 
                               hover:bg-pinterest-red hover:text-white transition-all text-sm font-semibold cursor-pointer 
                               flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSaveToggle}
                  onMouseEnter={() => setHoveredSaved(true)}
                  onMouseLeave={() => setHoveredSaved(false)}
                  disabled={saveLoading}
                  className={`w-full py-2.5 font-semibold rounded-full transition-all duration-300 cursor-pointer text-sm mt-6 flex items-center justify-center gap-1.5 ${
                    isSaved
                      ? 'bg-dark-hover border border-dark-border text-text-primary hover:bg-pinterest-red hover:text-white hover:border-pinterest-red'
                      : 'bg-pinterest-red text-white hover:bg-pinterest-red-hover'
                  }`}
                >
                  {saveLoading ? (
                    'Processing...'
                  ) : isSaved ? (
                    <>
                      {!hoveredSaved && (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                      {hoveredSaved ? 'Unsave Pin' : 'Saved'}
                    </>
                  ) : (
                    'Save Pin'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
