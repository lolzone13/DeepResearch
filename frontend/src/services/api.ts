// API Service for DeepResearch Frontend
// Consolidates all API calls to the authenticated backend

import type { ResearchSession } from '../types/research';

// Types for API requests and responses
export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ApiErrorResponse {
  error: string;
  code: number;
  message: string;
}

export interface SessionsListResponse {
  sessions: ResearchSession[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateSessionRequest {
  title: string;
  query: string;
  tags?: string[];
  max_sources?: number;
  search_depth?: 'shallow' | 'medium' | 'deep';
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  tags?: string[];
}

// API Configuration
const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('deepresearch_token');
  }

  // Authentication Methods
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(userData: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('deepresearch_token');
  }

  // Session Management Methods
  async getSessions(page = 1, perPage = 10, status?: string): Promise<SessionsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return this.request<SessionsListResponse>(`/research/sessions?${params}`, {
      method: 'GET',
    });
  }

  async getSession(sessionId: string): Promise<ResearchSession> {
    return this.request<ResearchSession>(`/research/sessions/${sessionId}`, {
      method: 'GET',
    });
  }

  async createSession(sessionData: CreateSessionRequest): Promise<ResearchSession> {
    return this.request<ResearchSession>('/research/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(sessionId: string, updates: UpdateSessionRequest): Promise<ResearchSession> {
    return this.request<ResearchSession>(`/research/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request<void>(`/research/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Research Streaming Methods
  createResearchStream(query: string): EventSource {
    const params = new URLSearchParams({ query });
    
    // Add authentication token as query parameter since EventSource doesn't support custom headers
    if (this.token) {
      params.append('token', this.token);
    }
    
    const url = `${API_BASE_URL}/research/stream?${params}`;
    const eventSource = new EventSource(url);
    
    return eventSource;
  }

  // Alternative method for authenticated streaming using fetch with ReadableStream
  async createAuthenticatedResearchStream(query: string): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const params = new URLSearchParams({ query });
      const response = await fetch(`${API_BASE_URL}/research/stream?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new ApiError('Failed to start research stream', response.status, 'Stream initialization failed');
      }

      return response.body;
    } catch (error) {
      console.error('Failed to create authenticated research stream:', error);
      return null;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request<{ status: string; timestamp: string; version: string }>('/health', {
      method: 'GET',
    });
  }

  // Private helper methods
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('deepresearch_token', token);
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', response.status, data.message);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Token management utilities
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Custom error class
export class ApiError extends Error {
  public error: string;
  public code: number;
  public message: string;

  constructor(error: string, code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.error = error;
    this.code = code;
    this.message = message;
  }
}

// Export singleton instance
export const apiService = new ApiService();
