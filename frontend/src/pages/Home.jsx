/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Home page — the main feed showing all pins in a masonry grid.
 * Supports search filtering and shows a post detail modal.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../components/SearchBar';
import MasonryGrid from '../components/MasonryGrid';
import Loader from '../components/Loader';
import { getPosts } from '../api/posts';
import PostDetailModal from '../components/PostDetailModal';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts(searchQuery);
      setPosts(data);
    } catch (err) {
      setError('Failed to load pins. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on mount and when search query changes
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    setSelectedPost(updatedPost);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center justify-center">
      {/* ─── Hero / Search Section ────────── */}
      <div className="w-full flex flex-col items-center justify-center text-center mx-auto mb-12">
        <motion.div
          className="w-full flex flex-col items-center justify-center text-center mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-center max-w-3xl leading-tight">
            Discover <span className="gradient-text">Inspiration</span>
          </h1>
          <p className="text-text-secondary mb-10 text-base sm:text-lg lg:text-xl max-w-xl text-center leading-relaxed mx-auto">
            Explore beautiful ideas and save the ones you love
          </p>
          <div className="w-full max-w-2xl mx-auto flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </motion.div>
      </div>

      {/* ─── Feed Content ─────────────────── */}
      <div className="w-full pb-12" style={{ marginTop: '4rem' }}>
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-pinterest-red/10 flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-pinterest-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-pinterest-red text-lg font-medium">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-2 px-8 py-2.5 bg-pinterest-red text-white font-semibold rounded-full hover:bg-pinterest-red-hover transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <MasonryGrid posts={posts} onPostClick={setSelectedPost} />
        )}
      </div>

      {/* ─── Post Detail Modal ────────────── */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
