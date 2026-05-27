/**
 * PostCard component — individual pin card with hover effects.
 * Shows image with an overlay on hover containing title and action buttons.
 * Uses Framer Motion for smooth hover animations.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Backend URL for images
const API_URL = 'https://pinterest-1-5cxw.onrender.com';

export default function PostCard({ post, onClick }) {
  const { isAuthenticated, savedPostIds, savePostId, unsavePostId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isSaved = savedPostIds?.includes(post.id);

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      if (isSaved) {
        await unsavePostId(post.id);
      } else {
        await savePostId(post.id);
      }
    } catch (err) {
      console.error('Failed to toggle save state', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="masonry-item group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick && onClick(post)}
      layout
    >
      <div className="relative overflow-hidden rounded-2xl bg-dark-card">
        {/* Post image */}
        <img
          src={`${API_URL}${post.image_url}`}
          alt={post.title}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          style={{ minHeight: '180px' }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        flex flex-col justify-end p-4"
        >
          {/* Title */}
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
            {post.title}
          </h3>

          {/* Description preview */}
          {post.description && (
            <p className="text-white/70 text-xs line-clamp-2">
              {post.description}
            </p>
          )}

          {/* User info */}
          {post.owner && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full bg-pinterest-red flex items-center justify-center text-white text-xs font-bold">
                {post.owner.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-white/80 text-xs">{post.owner.username}</span>
            </div>
          )}
        </div>

        {/* Save button — top right */}
        <motion.button
          className={`absolute top-3 right-3 px-4 py-2 rounded-full text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer ${
            isSaved
              ? 'bg-dark-hover/90 backdrop-blur-md text-text-primary hover:bg-pinterest-red hover:text-white'
              : 'bg-pinterest-red text-white hover:bg-pinterest-red-hover'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleSaveToggle}
          disabled={loading}
        >
          {loading ? '...' : isSaved ? (hovered ? 'Unsave' : 'Saved') : 'Save'}
        </motion.button>
      </div>
    </motion.div>
  );
}
