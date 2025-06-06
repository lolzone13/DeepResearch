export interface ResearchStep {
  step: string;
  progress: number;
  timestamp: string;
}

export interface ResearchState {
  isConnected: boolean;
  isStreaming: boolean;
  steps: ResearchStep[];
  currentStep: string;
  progress: number;
  error: string | null;
}

// Chat-related types
export interface Message {
  id: string;
  sessionId: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  thoughts?: Thought[];
  sources?: Source[];
}

export interface Thought {
  id: string;
  messageId: string;
  type: 'searching' | 'analyzing' | 'synthesizing' | 'validating' | 'completed' | 'error';
  title: string;
  content: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  metadata?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  sessionId: string;
  url: string;
  type: string;
  domain: string;
  title: string;
  description: string;
  language: string;
  isActive: boolean;
  lastCrawled?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSession {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string;
  messageCount: number;
  query: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  sources?: Source[];
}
