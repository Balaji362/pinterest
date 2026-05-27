/**
 * Upload page — create a new pin with image upload.
 * Features drag-and-drop file input with live preview.
 * Protected: requires authentication.
 */

import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPost } from '../api/posts';
import { useAuth } from '../hooks/useAuth';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle file selection — set image and generate preview
  const handleFileChange = (file) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image (JPEG, PNG, GIF, or WebP)');
        return;
      }
      setImage(file);
      setError('');
      // Generate preview URL
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!image) {
      setError('Please select an image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', image);

      await createPost(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create pin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create Pin</h1>
        <p className="text-text-secondary mb-8">Share something inspiring with the world</p>

        {/* Error message */}
        {error && (
          <motion.div
            className="mb-6 p-3 bg-pinterest-red/10 border border-pinterest-red/30 rounded-xl text-pinterest-red text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          {/* ─── Image Upload Area ──────────── */}
          <div className="md:w-1/2">
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
                         ${dragActive 
                           ? 'border-pinterest-red bg-pinterest-red/5' 
                           : 'border-dark-border hover:border-text-muted bg-dark-surface'}
                         ${preview ? 'p-0' : 'p-8'}`}
              style={{ minHeight: '400px' }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <>
                  {/* Image preview */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ minHeight: '400px', maxHeight: '600px' }}
                  />
                  {/* Change image button */}
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                    }}
                    className="absolute top-4 right-4 px-4 py-2 bg-dark-surface/80 backdrop-blur-sm 
                               text-text-primary text-sm rounded-full hover:bg-dark-hover 
                               transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </>
              ) : (
                /* Upload prompt */
                <div
                  className="flex flex-col items-center justify-center h-full cursor-pointer"
                  style={{ minHeight: '360px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-dark-card flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-text-primary font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-text-muted text-sm">
                    JPEG, PNG, GIF, or WebP
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
            </div>
          </div>

          {/* ─── Form Fields ───────────────── */}
          <div className="md:w-1/2 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Title <span className="text-pinterest-red">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title"
                className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border 
                           text-text-primary placeholder-text-muted
                           focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                           transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell everyone what your Pin is about"
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border 
                           text-text-primary placeholder-text-muted resize-none
                           focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                           transition-all"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || !title || !image}
              className="w-full py-3 bg-pinterest-red text-white font-semibold rounded-full
                         hover:bg-pinterest-red-hover transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Publishing...
                </span>
              ) : (
                'Publish Pin'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
