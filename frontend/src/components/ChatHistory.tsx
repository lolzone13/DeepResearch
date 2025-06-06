import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, Search, Calendar, Clock } from 'lucide-react';
import type { ResearchSession } from '../types/research';
import clsx from 'clsx';

interface ChatHistoryProps {
  sessions: ResearchSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      className={clsx(
        "h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0",
        isCollapsed ? "w-16" : "w-80"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chat History
            </h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        {!isCollapsed && (
          <>
            {/* New Chat Button */}
            <motion.button
              onClick={onNewSession}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Research</span>
            </motion.button>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence>
          {!isCollapsed ? (
            <div className="p-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start a new research session</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                      "p-3 rounded-lg cursor-pointer transition-colors mb-2 group",
                      currentSessionId === session.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={clsx(
                        "font-medium text-sm line-clamp-2",
                        currentSessionId === session.id
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-gray-900 dark:text-white"
                      )}>
                        {truncateText(session.title, 60)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {session.messageCount}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {truncateText(session.query, 100)}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                      {session.messageCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(session.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            // Collapsed view - show only icons
            <div className="p-2">
              {filteredSessions.slice(0, 8).map((session) => (
                <motion.button
                  key={session.id}
                  onClick={() => onSessionSelect(session.id)}
                  className={clsx(
                    "w-12 h-12 rounded-lg mb-2 flex items-center justify-center transition-colors",
                    currentSessionId === session.id
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={session.title}
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
