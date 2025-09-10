import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize performance and error monitoring
import { performanceMonitor } from './utils/performance'
import { errorTracker } from './utils/errorTracking'

// Set up session ID for error tracking
if (typeof window !== 'undefined') {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  errorTracker.setSessionId(sessionId);
  
  // Add global error handlers for better error reporting
  window.addEventListener('beforeunload', () => {
    // Log session end metrics
    const metrics = performanceMonitor.getMetrics();
    const errors = errorTracker.getErrors();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Session ending:', {
        sessionId,
        totalMetrics: metrics.length,
        totalErrors: errors.length,
        componentMetrics: performanceMonitor.getComponentMetrics().length,
        networkMetrics: performanceMonitor.getNetworkMetrics().length,
      });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
