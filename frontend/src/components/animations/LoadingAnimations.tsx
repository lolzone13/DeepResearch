import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-500',
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (variant === 'spinner') {
    return (
      <motion.div
        className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full ${color}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full bg-current ${color}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-current ${color}`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      />
    );
  }

  if (variant === 'bars') {
    return (
      <div className="flex space-x-1 items-end">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`w-1 bg-current ${color}`}
            style={{ height: '16px' }}
            animate={{
              scaleY: [1, 2, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.1
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

export const TypewriterText: React.FC<{ 
  text: string; 
  delay?: number;
  className?: string;
}> = ({ text, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      animate={{ width: 'auto' }}
      transition={{
        duration: text.length * 0.05,
        delay,
        ease: "easeInOut"
      }}
      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      {text}
    </motion.div>
  );
};

export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  animated?: boolean;
}> = ({ progress, className = '', animated = true }) => {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={animated ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
      />
    </div>
  );
};
