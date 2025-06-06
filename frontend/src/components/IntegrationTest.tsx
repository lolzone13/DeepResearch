import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';
import { apiService } from '../services/api';
import { ResearchStreamer } from './ResearchStreamer';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export const IntegrationTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Authentication Context', status: 'pending', message: 'Checking auth context...' },
    { name: 'API Service', status: 'pending', message: 'Testing API service...' },
    { name: 'Session Management', status: 'pending', message: 'Testing session hooks...' },
    { name: 'Health Check', status: 'pending', message: 'Testing backend connection...' },
    { name: 'Token Validation', status: 'pending', message: 'Validating JWT tokens...' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [showStreamer, setShowStreamer] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { sessions, error: sessionError } = useSessions();

  const updateTest = (index: number, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runIntegrationTests = async () => {
    setIsRunning(true);
    
    // Test 1: Authentication Context
    try {
      if (isAuthenticated && user) {
        updateTest(0, 'success', `Authenticated as ${user.email}`, `User ID: ${user.id}, Role: ${user.role}`);
      } else {
        updateTest(0, 'error', 'Not authenticated', 'Please sign in to run tests');
        setIsRunning(false);
        return;
      }
    } catch (error) {
      updateTest(0, 'error', 'Authentication context error', error instanceof Error ? error.message : 'Unknown error');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: API Service
    try {
      const isAuth = apiService.isAuthenticated();
      const token = apiService.getToken();
      
      if (isAuth && token) {
        updateTest(1, 'success', 'API service initialized', `Token present: ${token.substring(0, 20)}...`);
      } else {
        updateTest(1, 'error', 'API service not authenticated', 'Token missing or invalid');
      }
    } catch (error) {
      updateTest(1, 'error', 'API service error', error instanceof Error ? error.message : 'Unknown error');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Session Management
    try {
      if (sessions && sessions.length >= 0) {
        updateTest(2, 'success', `Session management working`, `${sessions.length} sessions loaded`);
        if (sessionError) {
          updateTest(2, 'error', 'Session error detected', sessionError);
        }
      } else {
        updateTest(2, 'error', 'Session management failed', 'Sessions array not available');
      }
    } catch (error) {
      updateTest(2, 'error', 'Session management error', error instanceof Error ? error.message : 'Unknown error');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: Health Check
    try {
      const healthResponse = await apiService.healthCheck();
      updateTest(3, 'success', 'Backend connection successful', `Status: ${healthResponse.status}, Version: ${healthResponse.version}`);
    } catch (error) {
      updateTest(3, 'error', 'Backend connection failed', error instanceof Error ? error.message : 'Backend not responding');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 5: Token Validation
    try {
      // Try to make an authenticated request to validate token
      await apiService.getSessions(1, 1);
      updateTest(4, 'success', 'JWT token is valid', 'Token successfully authenticated with backend');
    } catch (error) {
      updateTest(4, 'error', 'JWT token validation failed', error instanceof Error ? error.message : 'Token invalid');
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🧪 Frontend Integration Test Suite
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This test suite validates that all frontend components are properly integrated with authentication and the backend API.
        </p>

        {/* Test Controls */}
        <div className="flex gap-4 mb-6">
          <motion.button
            onClick={runIntegrationTests}
            disabled={isRunning || !isAuthenticated}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isRunning ? 1 : 1.05 }}
            whileTap={{ scale: isRunning ? 1 : 0.95 }}
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
          </motion.button>

          <motion.button
            onClick={() => setShowStreamer(!showStreamer)}
            disabled={!isAuthenticated}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showStreamer ? 'Hide' : 'Show'} Research Streamer
          </motion.button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
            >
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {test.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {test.message}
                </p>
                {test.details && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                    {test.details}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Authentication Status */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Current Authentication Status
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p><span className="font-medium">Authenticated:</span> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            {user && (
              <>
                <p><span className="font-medium">User:</span> {user.full_name} ({user.email})</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
              </>
            )}
            <p><span className="font-medium">Sessions Loaded:</span> {sessions.length}</p>
            <p><span className="font-medium">API Token:</span> {apiService.getToken() ? 'Present' : 'Missing'}</p>
          </div>
        </div>

        {/* Research Streamer Demo */}
        {showStreamer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20"
          >
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-4">
              🔬 Research Streamer Demo
            </h3>
            <ResearchStreamer 
              query="Test research query for integration"
              onComplete={(steps) => {
                console.log('Research completed with steps:', steps);
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};
