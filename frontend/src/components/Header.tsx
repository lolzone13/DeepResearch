import React from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { AnimatedContainer, TypewriterText } from './animations';

export const Header: React.FC = () => {
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <AnimatedContainer variant="slideRight" className="flex items-center space-x-3">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="text-white font-bold text-sm">DR</span>
            </motion.div>
            <div>
              <TypewriterText 
                text="DeepResearch"
                className="text-xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time research streaming
              </p>
            </div>
          </AnimatedContainer>
          
          <AnimatedContainer variant="slideLeft" delay={0.2} className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Backend: localhost:8080</span>
            </div>
            <ThemeToggle />
          </AnimatedContainer>
        </div>
      </div>
    </motion.header>
  );
};
