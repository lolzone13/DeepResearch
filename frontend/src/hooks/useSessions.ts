import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';
import type { ResearchSession, Message } from '../types/research';
import { useAuth } from '../contexts/AuthContext';

interface UseSessionsReturn {
  sessions: ResearchSession[];
  currentSession: ResearchSession | null;
  currentSessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  // Session operations
  createSession: (title: string, query: string, tags?: string[]) => Promise<void>;
  updateSession: (sessionId: string, updates: { title?: string; description?: string; tags?: string[] }) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  selectSession: (sessionId: string) => void;
  refreshSessions: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useSessions = (): UseSessionsReturn => {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  // Fetch sessions from API
  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getSessions(1, 50); // Get first 50 sessions
      setSessions(response.sessions);
      
      // If no current session is selected, select the first one
      if (!currentSessionId && response.sessions.length > 0) {
        setCurrentSessionId(response.sessions[0].id);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load sessions');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentSessionId]);

  // Create new session
  const createSession = async (title: string, query: string, tags: string[] = []) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const newSession = await apiService.createSession({
        title,
        query,
        tags,
        max_sources: 10,
        search_depth: 'medium'
      });
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]); // Clear messages for new session
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to create session');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update session
  const updateSession = async (sessionId: string, updates: { title?: string; description?: string; tags?: string[] }) => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      const updatedSession = await apiService.updateSession(sessionId, updates);
      
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? updatedSession : session
      ));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to update session');
      }
      throw error;
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      await apiService.deleteSession(sessionId);
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If deleted session was current, select another one
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(session => session.id !== sessionId);
        setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
        setMessages([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to delete session');
      }
      throw error;
    }
  };

  // Select session
  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // In a real app, you'd fetch messages for this session here
    // For now, we'll clear messages since we don't have message endpoints yet
    setMessages([]);
  };

  // Refresh sessions
  const refreshSessions = fetchSessions;

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load sessions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    } else {
      // Clear data when not authenticated
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
      setError(null);
    }
  }, [isAuthenticated, fetchSessions]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    messages,
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    selectSession,
    refreshSessions,
    clearError,
  };
};
