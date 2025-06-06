import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  hover?: boolean;
  delay?: number;
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hover = true,
  delay = 0,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: "bg-white dark:bg-gray-800 rounded-lg shadow-md",
    glass: "bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg rounded-lg border border-white/20",
    bordered: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 rounded-lg shadow-xl"
  };

  return (
    <motion.div
      className={`${variants[variant]} ${className} p-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export const StaggeredContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export const PulseCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}> = ({ children, className = '', isActive = false }) => {
  return (
    <motion.div
      className={`rounded-lg p-4 ${className}`}
      animate={isActive ? {
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0.5)",
          "0 0 0 10px rgba(59, 130, 246, 0)",
          "0 0 0 0 rgba(59, 130, 246, 0)"
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};
