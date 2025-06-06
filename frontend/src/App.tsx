import { motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { ResearchStreamer } from './components/ResearchStreamer';
import { AnimatedContainer, AnimatedCard, StaggeredContainer, TypewriterText } from './components/animations';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <AnimatedContainer variant="slideUp" delay={0.4}>
              <ResearchStreamer />
            </AnimatedContainer>
            
            <StaggeredContainer staggerDelay={0.2} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard hover={true}>
                <div className="flex items-center space-x-3 mb-3">
                  <motion.div 
                    className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Source Discovery</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically finds and crawls relevant academic papers, articles, and web sources.
                </p>
              </AnimatedCard>
              
              <AnimatedCard hover={true}>
                <div className="flex items-center space-x-3 mb-3">
                  <motion.div 
                    className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">2</span>
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Content Processing</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processes and analyzes documents using advanced text processing and AI techniques.
                </p>
              </AnimatedCard>
              
              <AnimatedCard hover={true}>
                <div className="flex items-center space-x-3 mb-3">
                  <motion.div 
                    className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">3</span>
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Summary Generation</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generates comprehensive summaries and insights from all processed research materials.
                </p>
              </AnimatedCard>
            </StaggeredContainer>
          </div>
        </main>
        
        <motion.footer 
          className="mt-16 border-t border-gray-200 dark:border-gray-700 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 DeepResearch. Built with Go, React, and real-time streaming.</p>
          </div>
        </motion.footer>
      </div>
    </ThemeProvider>
  );
}

export default App
