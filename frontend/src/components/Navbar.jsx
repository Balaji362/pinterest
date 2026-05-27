/**
 * Navbar component — Pinterest-inspired responsive navigation bar.
 * Displays logo, navigation links, user profile avatar, and login/logout controls.
 * Uses a glassmorphic design that fits the premium dark theme.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-9 h-9 rounded-full bg-pinterest-red flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </motion.div>
            <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">
              Pin<span className="text-pinterest-red">spire</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive('/')
                  ? 'bg-dark-card text-white'
                  : 'text-text-secondary hover:bg-dark-hover hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive('/upload')
                  ? 'bg-dark-card text-white'
                  : 'text-text-secondary hover:bg-dark-hover hover:text-white'
              }`}
            >
              Create
            </Link>
          </nav>
        </div>

        {/* Right Side: Auth States */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Profile Link (Avatar) */}
              <Link
                to="/profile"
                className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-dark-hover transition-colors"
                title="View Profile"
              >
                <div className="w-8 h-8 rounded-full bg-pinterest-red hover:bg-pinterest-red-hover flex items-center justify-center text-white font-bold text-sm shadow-sm transition-colors">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-text-primary group-hover:text-white max-w-[100px] truncate hidden md:inline">
                  {user?.username}
                </span>
              </Link>

              {/* Log out Button */}
              <motion.button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-white bg-dark-card hover:bg-dark-hover rounded-full border border-dark-border cursor-pointer transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Log out
              </motion.button>
            </>
          ) : (
            <>
              {/* Login Link */}
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-white rounded-full transition-colors"
              >
                Log in
              </Link>

              {/* Register/Signup Link */}
              <motion.button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-pinterest-red hover:bg-pinterest-red-hover rounded-full cursor-pointer transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign up
              </motion.button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}