import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResearchStep, ResearchState } from '../types/research';
import { 
  AnimatedContainer, 
  AnimatedButton, 
  AnimatedCard, 
  StaggeredContainer,
  LoadingSpinner,
  ProgressBar,
  PulseCard
} from './animations';

const BACKEND_URL = 'http://localhost:8080';

export const ResearchStreamer: React.FC = () => {
  const [state, setState] = useState<ResearchState>({
    isConnected: false,
    isStreaming: false,
    steps: [],
    currentStep: '',
    progress: 0,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const startResearch = () => {
    if (state.isStreaming) return;

    // Reset state
    setState(prev => ({
      ...prev,
      isStreaming: true,
      steps: [],
      currentStep: 'Connecting...',
      progress: 0,
      error: null,
    }));

    // Create EventSource connection
    eventSourceRef.current = new EventSource(`${BACKEND_URL}/research`);

    eventSourceRef.current.onopen = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        currentStep: 'Connected to research stream...',
      }));
    };

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data: ResearchStep = JSON.parse(event.data);
        setState(prev => ({
          ...prev,
          steps: [...prev.steps, data],
          currentStep: data.step,
          progress: data.progress,
        }));

        // Auto-stop when complete
        if (data.progress >= 100) {
          setTimeout(() => stopResearch(), 1000);
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to parse research data',
        }));
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('SSE Error:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: 'Connection to research stream failed',
      }));
      stopResearch();
    };
  };

  const stopResearch = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isConnected: false,
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <AnimatedCard className="research-card max-w-4xl mx-auto p-6" variant="elevated">
      <AnimatedContainer variant="slideDown">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              DeepResearch Stream
            </h1>
            <motion.div 
              className="flex items-center space-x-1"
              animate={state.isConnected ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {state.isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${
                state.isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {state.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </motion.div>
          </div>

          <AnimatedButton
            onClick={state.isStreaming ? stopResearch : startResearch}
            disabled={!state.isConnected && state.isStreaming}
            variant={state.isStreaming ? 'danger' : 'primary'}
            isLoading={state.isStreaming && !state.isConnected}
          >
            {state.isStreaming ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Research
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Research
              </>
            )}
          </AnimatedButton>
        </div>
      </AnimatedContainer>

      {/* Error Display */}
      <AnimatePresence>
        {state.error && (
          <AnimatedContainer variant="slideDown" className="mb-4">
            <motion.div 
              className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center space-x-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
              <span className="text-red-700 dark:text-red-300">{state.error}</span>
            </motion.div>
          </AnimatedContainer>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <AnimatedContainer variant="fadeIn" delay={0.2} className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {state.currentStep || 'Ready to start research...'}
          </p>
          <motion.span 
            className="text-sm text-gray-500 dark:text-gray-400"
            key={state.progress}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {state.progress}%
          </motion.span>
        </div>
        <ProgressBar progress={state.progress} className="h-3" />
      </AnimatedContainer>

      {/* Research Steps */}
      <StaggeredContainer className="space-y-3 max-h-96 overflow-y-auto">
        {state.steps.map((step, index) => {
          // Only show spinner for the most recent step that hasn't completed
          const isLastIncompleteStep = index === state.steps.length - 1 && step.progress < 100;
          const isCompleted = step.progress === 100;
          
          return (
            <PulseCard
              key={index}
              isActive={isLastIncompleteStep}
              className="step-item bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-3"
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </motion.div>
                ) : isLastIncompleteStep ? (
                  <LoadingSpinner size="sm" color="text-blue-500" />
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  </motion.div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.step}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                <motion.span 
                  className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  key={step.progress}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {step.progress}%
                </motion.span>
              </div>
            </PulseCard>
          );
        })}
      </StaggeredContainer>

      {state.steps.length === 0 && !state.isStreaming && (
        <AnimatedContainer variant="fadeIn" delay={0.5}>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Play className="w-8 h-8" />
            </motion.div>
          </div>
        </AnimatedContainer>
      )}
    </AnimatedCard>
  );
};
