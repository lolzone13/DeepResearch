import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatHistory } from './ChatHistory';
import { ChatInterface } from './ChatInterface';
import type { ResearchSession, Message } from '../types/research';

// Mock data for development - replace with real API calls
const mockSessions: ResearchSession[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Understanding Quantum Computing',
    description: 'Research on quantum computing principles and applications',
    tags: '["quantum", "computing", "physics"]',
    messageCount: 5,
    query: 'What are the fundamental principles of quantum computing and how do they differ from classical computing?',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Climate Change Impact on Agriculture',
    description: 'Research on climate change effects on global agriculture',
    tags: '["climate", "agriculture", "environment"]',
    messageCount: 3,
    query: 'How is climate change affecting global agricultural productivity and what are the potential solutions?',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Machine Learning in Healthcare',
    description: 'Applications of ML in medical diagnosis and treatment',
    tags: '["machine learning", "healthcare", "AI"]',
    messageCount: 8,
    query: 'What are the current applications of machine learning in healthcare and what are the ethical considerations?',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
  },
];

const mockMessages: { [sessionId: string]: Message[] } = {
  '1': [
    {
      id: 'msg1',
      sessionId: '1',
      type: 'user',
      content: 'What are the fundamental principles of quantum computing and how do they differ from classical computing?',
      isVisible: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg2',
      sessionId: '1',
      type: 'assistant',
      content: `# Quantum Computing Fundamentals

Quantum computing represents a paradigm shift from classical computing, leveraging the principles of quantum mechanics to process information in fundamentally different ways.

## Key Principles

### 1. **Quantum Bits (Qubits)**
Unlike classical bits that exist in definite states (0 or 1), qubits can exist in **superposition** - simultaneously in both 0 and 1 states until measured.

### 2. **Entanglement**
Qubits can be entangled, meaning the state of one qubit instantly affects another, regardless of distance.

### 3. **Quantum Interference**
Quantum algorithms manipulate probability amplitudes to increase the likelihood of measuring correct answers.

## Differences from Classical Computing

| Aspect | Classical | Quantum |
|--------|-----------|---------|
| Information Unit | Bit (0 or 1) | Qubit (0, 1, or both) |
| Processing | Sequential/Parallel | Quantum Parallelism |
| Error Sensitivity | Low | Very High |
| Applications | General Purpose | Specific Problems |

## Current Applications
- **Cryptography**: Breaking RSA encryption
- **Optimization**: Solving complex optimization problems
- **Simulation**: Modeling quantum systems
- **Machine Learning**: Quantum algorithms for AI`,
      isVisible: true,
      createdAt: new Date(Date.now() - 3000000).toISOString(),
      updatedAt: new Date(Date.now() - 3000000).toISOString(),
      thoughts: [
        {
          id: 'thought1',
          messageId: 'msg2',
          type: 'searching',
          title: 'Searching for quantum computing fundamentals',
          content: 'Looking for comprehensive sources on quantum computing principles...',
          status: 'completed',
          progress: 100,
          startedAt: new Date(Date.now() - 3001000).toISOString(),
          completedAt: new Date(Date.now() - 3000500).toISOString(),
          createdAt: new Date(Date.now() - 3001000).toISOString(),
          updatedAt: new Date(Date.now() - 3000500).toISOString(),
        },
        {
          id: 'thought2',
          messageId: 'msg2',
          type: 'analyzing',
          title: 'Analyzing quantum vs classical computing',
          content: 'Comparing key differences and analyzing fundamental principles...',
          status: 'completed',
          progress: 100,
          startedAt: new Date(Date.now() - 3000500).toISOString(),
          completedAt: new Date(Date.now() - 3000000).toISOString(),
          createdAt: new Date(Date.now() - 3000500).toISOString(),
          updatedAt: new Date(Date.now() - 3000000).toISOString(),
        },
      ],
      sources: [
        {
          id: 'source1',
          sessionId: '1',
          url: 'https://quantum-computing.ibm.com/',
          type: 'website',
          domain: 'ibm.com',
          title: 'IBM Quantum Computing',
          description: 'IBM\'s comprehensive guide to quantum computing',
          language: 'en',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'source2',
          sessionId: '1',
          url: 'https://arxiv.org/abs/quant-ph/0011122',
          type: 'academic_paper',
          domain: 'arxiv.org',
          title: 'Quantum Computing: An Applied Approach',
          description: 'Academic paper on quantum computing fundamentals',
          language: 'en',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ],
  '2': [
    {
      id: 'msg3',
      sessionId: '2',
      type: 'user',
      content: 'How is climate change affecting global agricultural productivity?',
      isVisible: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  '3': [
    {
      id: 'msg4',
      sessionId: '3',
      type: 'user',
      content: 'What are the current applications of machine learning in healthcare?',
      isVisible: true,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ],
};

export const ChatLayout: React.FC = () => {
  const [sessions, setSessions] = useState<ResearchSession[]>(mockSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages['1'] || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      setMessages(mockMessages[currentSessionId] || []);
    }
  }, [currentSessionId]);

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewSession = () => {
    const newSession: ResearchSession = {
      id: Date.now().toString(),
      userId: 'user1',
      title: 'New Research Session',
      description: 'New research session',
      tags: '[]',
      messageCount: 0,
      query: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: currentSessionId,
      type: 'user',
      content,
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Update session title if it's a new session
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId && session.messageCount === 0
        ? { 
            ...session, 
            title: content.length > 50 ? content.substring(0, 50) + '...' : content,
            query: content,
            messageCount: 1,
            updatedAt: new Date().toISOString()
          }
        : session.id === currentSessionId
        ? { 
            ...session, 
            messageCount: session.messageCount + 1,
            updatedAt: new Date().toISOString()
          }
        : session
    ));

    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: currentSessionId,
        type: 'assistant',
        content: `I understand you're asking about "${content}". Let me research this for you and provide a comprehensive response.

This is a mock response. In a real implementation, this would connect to your backend API to:

1. **Process the query** using NLP
2. **Search for relevant sources** 
3. **Crawl and analyze content**
4. **Generate insights** using AI
5. **Provide cited responses**

The system would show real-time thinking steps and source gathering as it works.`,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thoughts: [
          {
            id: Date.now().toString() + '_thought1',
            messageId: (Date.now() + 1).toString(),
            type: 'searching',
            title: 'Analyzing your query',
            content: 'Understanding the key concepts and research areas...',
            status: 'completed',
            progress: 100,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <ChatHistory
        sessions={sessions}
        currentSessionId={currentSessionId}
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
    </div>
  );
};
