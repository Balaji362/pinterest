/**
 * MasonryGrid component — renders posts in a Pinterest-style masonry layout.
 * Uses CSS columns for the masonry effect and Framer Motion for animations.
 */

import { AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';

export default function MasonryGrid({ posts, onPostClick }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-secondary">
        <svg className="w-20 h-20 mb-4 text-dark-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No pins yet</p>
        <p className="text-sm text-text-muted mt-1">Be the first to share something inspiring!</p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      <AnimatePresence>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={onPostClick} />
        ))}
      </AnimatePresence>
    </div>
  );
}
