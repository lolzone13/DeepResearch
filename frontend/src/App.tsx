import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { ChatLayout } from './components/ChatLayout';
import { SplashCursor } from './components/animations';

function App() {
  return (
    <ThemeProvider>
      <div className="h-screen bg-gray-50 dark:bg-black transition-colors duration-300 flex flex-col overflow-hidden">
        <SplashCursor 
          SPLAT_FORCE={6000}
          SPLAT_RADIUS={0.2}
          COLOR_UPDATE_SPEED={10}
          BACK_COLOR={{ r: 0.1, g: 0.1, b: 0.3 }}
          TRANSPARENT={true}
        />
        
        <Header />
        
        {/* Main Chat Application - takes remaining space after header */}
        <div className="flex-1 min-h-0">
          <ChatLayout />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App
