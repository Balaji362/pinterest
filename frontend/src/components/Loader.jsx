/**
 * Loader component — animated Pinterest-style loading spinner.
 * Shows a pulsing ring animation with the Pinterest brand color.
 */

import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-pinterest-red"
            style={{ width: 60 + i * 20, height: 60 + i * 20 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Center dot */}
        <motion.div
          className="w-4 h-4 rounded-full bg-pinterest-red"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}
