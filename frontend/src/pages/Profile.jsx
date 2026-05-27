/* eslint-disable react-hooks/set-state-in-effect */
/**
 * Profile page — shows user info and their posted pins.
 * Protected: requires authentication.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { getPosts, getSavedPosts } from '../api/posts';
import MasonryGrid from '../components/MasonryGrid';
import Loader from '../components/Loader';
import PostDetailModal from '../components/PostDetailModal';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, savedPostIds } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      // Fetch all posts and filter by current user
      const allPosts = await getPosts();
      const myPosts = allPosts.filter((post) => post.user_id === user.id);
      setUserPosts(myPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const posts = await getSavedPosts();
      setSavedPosts(posts);
    } catch (err) {
      console.error('Failed to fetch saved posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts based on active tab
  useEffect(() => {
    if (user) {
      if (activeTab === 'created') {
        fetchUserPosts();
      } else if (activeTab === 'saved') {
        fetchSavedPosts();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Ensure savedPosts reflect real-time unsave actions
  useEffect(() => {
    if (activeTab === 'saved') {
      setSavedPosts((prev) => prev.filter((p) => savedPostIds.includes(p.id)));
    }
  }, [savedPostIds, activeTab]);

  const handlePostUpdated = (updatedPost) => {
    setUserPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    setSelectedPost(updatedPost);
  };

  const handlePostDeleted = (postId) => {
    setUserPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  if (authLoading || !user) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-24 pb-16">
      {/* ─── User Profile Header ─────────── */}
      <motion.div
        className="flex flex-col items-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Avatar */}
        <motion.div
          className="w-28 h-28 rounded-full bg-gradient-to-br from-pinterest-red to-pinterest-red-light 
                     flex items-center justify-center text-white text-4xl font-bold mb-4 
                     shadow-lg shadow-pinterest-red/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {user.username.charAt(0).toUpperCase()}
        </motion.div>

        {/* User details */}
        <h1 className="text-2xl font-bold text-text-primary mb-1">{user.username}</h1>
        <p className="text-text-secondary text-sm mb-2">{user.email}</p>
        <p className="text-text-muted text-xs">
          Joined {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {/* Stats */}
        <div className="flex gap-8 mt-10">
          <div className="text-center">
            <p className="text-xl font-bold text-text-primary">{userPosts.length}</p>
            <p className="text-xs text-text-muted">Pins</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-text-primary">0</p>
            <p className="text-xs text-text-muted">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-text-primary">0</p>
            <p className="text-xs text-text-muted">Following</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Divider / Tabs ──────────────────────── */}
      <div className="border-b border-dark-border mb-6">
        <div className="flex justify-center gap-8">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'created'
                ? 'text-text-primary border-b-2 border-pinterest-red'
                : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover rounded-t-lg border-b-2 border-transparent'
            }`}
          >
            Created
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'saved'
                ? 'text-text-primary border-b-2 border-pinterest-red'
                : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover rounded-t-lg border-b-2 border-transparent'
            }`}
          >
            Saved
          </button>
        </div>
      </div>

      {/* ─── User's Posts Grid ────────────── */}
      <div className="w-full pt-8 pb-12">
        {loading ? (
          <Loader />
        ) : (activeTab === 'created' ? userPosts : savedPosts).length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-dark-card flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-dark-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d={activeTab === 'created' ? "M12 4v16m8-8H4" : "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"} />
              </svg>
            </div>
            <p className="text-text-secondary text-lg font-medium mb-1">
              {activeTab === 'created' ? 'No pins yet' : 'No saved pins yet'}
            </p>
            <p className="text-text-muted text-sm mb-4">
              {activeTab === 'created' ? 'Start sharing your inspiration!' : 'Find ideas you love and save them here.'}
            </p>
            {activeTab === 'created' ? (
              <motion.button
                onClick={() => navigate('/upload')}
                className="px-6 py-2 bg-pinterest-red text-white rounded-full font-medium
                           hover:bg-pinterest-red-hover transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create a Pin
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-pinterest-red text-white rounded-full font-medium
                           hover:bg-pinterest-red-hover transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Pins
              </motion.button>
            )}
          </motion.div>
        ) : (
          <MasonryGrid posts={activeTab === 'created' ? userPosts : savedPosts} onPostClick={setSelectedPost} />
        )}
      </div>

      {/* ─── Post Detail Modal (reuse from Home) ── */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
}
