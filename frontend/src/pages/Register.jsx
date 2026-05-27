/**
 * Register page — sign-up form with username, email, and password.
 * Creates a new user account via the backend API.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register } from '../api/auth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(username, email, password);
      // Redirect to login on success
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        className="glass-card w-full max-w-lg"
        style={{ padding: '3rem' }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-14 h-14 mx-auto rounded-full bg-pinterest-red flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
          </motion.div>

          <h1 className="text-3xl font-extrabold text-text-primary">Create an account</h1>
          <p className="text-text-secondary text-sm mt-2">Find new ideas to try</p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            className="mb-6 p-3.5 bg-pinterest-red/10 border border-pinterest-red/30 rounded-xl text-pinterest-red text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold text-text-secondary">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-5 py-3.5 rounded-2xl bg-dark-surface border border-dark-border 
                         text-text-primary placeholder-text-muted
                         focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                         transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-5 py-3.5 rounded-2xl bg-dark-surface border border-dark-border 
                         text-text-primary placeholder-text-muted
                         focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                         transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-semibold text-text-secondary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-5 py-3.5 rounded-2xl bg-dark-surface border border-dark-border 
                         text-text-primary placeholder-text-muted
                         focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30 
                         transition-all"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pinterest-red text-white font-semibold rounded-full
                       hover:bg-pinterest-red-hover transition-colors mt-2
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
                Creating account...
              </span>
            ) : (
              'Sign up'
            )}
          </motion.button>
        </form>

        {/* Login link */}
        <p className="text-center text-text-secondary text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-pinterest-red hover:text-pinterest-red-hover font-semibold transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
