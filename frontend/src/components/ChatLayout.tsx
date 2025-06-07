import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatHistory } from './ChatHistory';
import { ChatInterface } from './ChatInterface';
import { AuthModal } from './AuthModal';
import { useSessions } from '../hooks/useSessions';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types/research';
import { apiService } from '../services/api';

export const ChatLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const { isAuthenticated } = useAuth();
  const {
    sessions,
    currentSession,
    currentSessionId,
    createSession,
    updateSession,
    selectSession,
    error: sessionError,
    clearError
  } = useSessions();

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsAuthModalOpen(false);
    }
  }, [isAuthenticated]);

  const handleSessionSelect = (sessionId: string) => {
    selectSession(sessionId);
  };

  const handleNewSession = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await createSession('New Research Session', '');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const processSendMessage = async (content: string, sessionId: string) => {
    setIsLoading(true);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: sessionId,
      type: 'user',
      content,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Update session title if it's a new session with default title
    if (currentSession && currentSession.title === 'New Research Session' && currentSession.messageCount === 0) {
      try {
        await updateSession(sessionId, {
          title: content.length > 50 ? content.substring(0, 50) + '...' : content,
          description: `Research query: ${content}`,
        });
      } catch (error) {
        console.error('Failed to update session title:', error);
      }
    }

    // Start research streaming from backend
    try {
      const stream = await apiService.createAuthenticatedResearchStream(content);

      if (!stream) {
        throw new Error('Failed to create research stream');
      }

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId,
        type: 'assistant',
        content: '',
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thoughts: [],
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Process the stream
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            // Parse SSE data line
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              try {
                const data = JSON.parse(jsonStr);
                
                // Update assistant message with streaming progress
                assistantMessage = {
                  ...assistantMessage,
                  content: data.step || assistantMessage.content,
                  thoughts: [
                    ...(assistantMessage.thoughts || []),
                    {
                      id: Date.now().toString(),
                      messageId: assistantMessage.id,
                      type: data.type || 'searching',
                      title: data.step || 'Researching...',
                      content: data.step || '',
                      status: data.progress >= 100 ? 'completed' : 'processing',
                      progress: data.progress,
                      startedAt: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  ],
                };
                setMessages(prev => prev.map(m => m.id === assistantMessage.id ? assistantMessage : m));
                
                if (data.progress >= 100) {
                  setIsLoading(false);
                  break;
                }
              } catch (err) {
                console.error('Failed to parse research stream event:', err);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Failed to start research stream:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated) {
      return;
    }

    // Auto-create session if none exists
    if (!currentSessionId) {
      try {
        await createSession('New Research Session', '');
        // After session creation, use a timeout to ensure state has updated
        setTimeout(() => {
          if (currentSessionId) {
            processSendMessage(content, currentSessionId);
          }
        }, 100);
        return;
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    // Process the message directly if we have a session
    await processSendMessage(content, currentSessionId);
  };

  // Show authentication modal if not logged in
  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to DeepResearch
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to start your research journey
          </p>
          <motion.button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <ChatHistory
        sessions={sessions}
        currentSessionId={currentSessionId || undefined}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        {currentSession && (
          <motion.div 
            className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {currentSession.title}
            </h1>
            {currentSession.query && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {currentSession.query}
              </p>
            )}
          </motion.div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            className="h-full"
          />
        </div>
      </div>

      {/* Error Display */}
      {sessionError && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-lg"
        >
          <p className="text-red-700 dark:text-red-300">{sessionError}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};
