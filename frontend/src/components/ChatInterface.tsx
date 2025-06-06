import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, User, Bot, Lightbulb, ExternalLink, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message, Thought, Source } from '../types/research';
import clsx from 'clsx';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (content: string) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading = false,
  onSendMessage,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
      setIsExpanded(newHeight > 48);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderThought = (thought: Thought) => {
    const getThoughtIcon = (type: string) => {
      switch (type) {
        case 'searching': return '🔍';
        case 'analyzing': return '🧠';
        case 'synthesizing': return '⚡';
        case 'validating': return '✅';
        case 'completed': return '🎯';
        case 'error': return '❌';
        default: return '💭';
      }
    };

    const getThoughtColor = (type: string) => {
      switch (type) {
        case 'searching': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
        case 'analyzing': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
        case 'synthesizing': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
        case 'validating': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
        case 'completed': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
        case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
        default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600';
      }
    };

    return (
      <motion.div
        key={thought.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={clsx(
          "p-3 rounded-lg border mb-2 text-sm",
          getThoughtColor(thought.type)
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{getThoughtIcon(thought.type)}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {thought.title}
          </span>
          {thought.status === 'processing' && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          )}
        </div>
        {thought.content && (
          <p className="text-gray-700 dark:text-gray-300 ml-6">
            {thought.content}
          </p>
        )}
        {thought.progress > 0 && thought.progress < 100 && (
          <div className="ml-6 mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${thought.progress}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderSource = (source: Source) => (
    <motion.a
      key={source.id}
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors mr-2 mb-2"
    >
      <ExternalLink className="w-3 h-3" />
      <span className="max-w-48 truncate">{source.title || source.domain}</span>
    </motion.a>
  );

  return (
    <div className={clsx("flex flex-col h-full bg-white dark:bg-gray-900", className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={clsx(
                "flex gap-4",
                message.type === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.type !== 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              
              <div className={clsx(
                "max-w-3xl",
                message.type === 'user' ? "bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3" 
                : "bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3"
              )}>
                {/* Thoughts (for assistant messages) */}
                {message.thoughts && message.thoughts.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Thinking Process
                      </span>
                    </div>
                    {message.thoughts.map(renderThought)}
                  </div>
                )}

                {/* Message Content */}
                <div className={clsx(
                  "prose prose-sm max-w-none",
                  message.type === 'user' 
                    ? "prose-invert" 
                    : "prose-gray dark:prose-invert"
                )}>
                  <ReactMarkdown
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sources
                      </span>
                    </div>
                    <div className="flex flex-wrap">
                      {message.sources.map(renderSource)}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className={clsx(
                  "text-xs mt-2",
                  message.type === 'user' 
                    ? "text-blue-100" 
                    : "text-gray-500 dark:text-gray-400"
                )}>
                  {formatTimestamp(message.createdAt)}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Researching your query...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className={clsx(
            "flex items-end gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-800 transition-all duration-200",
            isExpanded && "items-start pt-4"
          )}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your research topic..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
              rows={1}
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={clsx(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                inputValue.trim() && !isLoading
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              )}
              whileHover={{ scale: inputValue.trim() && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: inputValue.trim() && !isLoading ? 0.95 : 1 }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </form>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line. Markdown is supported.
        </p>
      </div>
    </div>
  );
};
