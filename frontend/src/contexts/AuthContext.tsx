import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService, ApiError } from '../services/api';
import type { AuthResponse, AuthRequest } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  register: (userData: AuthRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Verify token is still valid by making a request
          await apiService.healthCheck();
          // Note: In a real app, you'd want to fetch user info from a protected endpoint
          // For now, we'll assume the user is authenticated if the token exists
          setUser({
            id: 'current-user',
            email: 'user@example.com',
            name: 'Current User',
            role: 'user'
          });
        }
      } catch (error) {
        // Token is invalid, clear it
        apiService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: AuthRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response: AuthResponse = await apiService.login(credentials);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: AuthRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response: AuthResponse = await apiService.register(userData);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
