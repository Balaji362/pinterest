/**
 * SearchBar component — expandable search input with icon.
 * Triggers search callback on Enter or button click.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <motion.div
        className="relative flex items-center w-full"
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center pointer-events-none text-text-muted">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search pins..."
          style={{ paddingLeft: '3.25rem', paddingRight: '3.25rem' }}
          className="w-full py-3.5 rounded-full bg-dark-surface border border-dark-border 
                     text-text-primary placeholder-text-muted text-base
                     focus:border-pinterest-red focus:ring-1 focus:ring-pinterest-red/30
                     transition-all duration-300"
        />

        {/* Clear button — visible when there's a query */}
        {query && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setQuery('');
              if (onSearch) onSearch('');
            }}
            className="absolute right-4 w-6 h-6 flex items-center justify-center 
                       rounded-full bg-dark-border hover:bg-text-muted 
                       text-text-secondary transition-colors cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </form>
  );
}
