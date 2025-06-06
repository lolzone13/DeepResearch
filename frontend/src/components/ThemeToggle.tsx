import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label="Toggle theme"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="relative w-6 h-6">
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                opacity: 1,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              className="absolute inset-0"
            >
              <Sun className="w-6 h-6 text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                opacity: 1,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              className="absolute inset-0"
            >
              <Moon className="w-6 h-6 text-blue-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};
