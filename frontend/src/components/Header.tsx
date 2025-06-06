import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthModal } from './AuthModal';
import { AnimatedContainer, AnimatedButton } from './animations';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <AnimatedContainer variant="slideRight" className="flex items-center space-x-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="text-white font-bold text-lg">DR</span>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  DeepResearch
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400">
                  AI-Powered Research Platform
                </p>
              </div>
            </AnimatedContainer>

            <AnimatedContainer variant="slideLeft" delay={0.2} className="flex items-center space-x-6">
              {/* User Info and Auth Controls */}
              <div className="flex items-center space-x-4">
                {isAuthenticated && user ? (
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.name}
                      </span>
                    </div>
                  </div>
                ) : null}

                <AnimatedButton
                  onClick={handleAuthClick}
                  variant={isAuthenticated ? "secondary" : "primary"}
                  className="flex items-center space-x-2 px-4 py-2 text-sm"
                >
                  {isAuthenticated ? (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </AnimatedButton>
              </div>

              <div className="hidden sm:flex items-center space-x-3 text-base text-gray-500 dark:text-gray-400">
                <motion.div 
                  className={`w-3 h-3 rounded-full shadow-sm ${isAuthenticated ? 'bg-green-500' : 'bg-orange-500'}`}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Status: {isAuthenticated ? 'Authenticated' : 'Guest'}</span>
              </div>
              <ThemeToggle />
            </AnimatedContainer>
          </div>
        </div>
      </motion.header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};
