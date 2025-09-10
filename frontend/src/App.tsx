import React, { Profiler, useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useWorkflow } from './hooks/useRefinement';
import { useComponentPerformance, useProfiler } from './hooks/usePerformanceMonitoring';
import { PromptInput } from './components/PromptInput';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { PerformanceWidget } from './components/PerformanceWidget';
// Import lazy-loaded components
import { 
  LazyAnalysisPanel,
  LazyPromptOutput,
  LazyEducationPanel,
  LazyHeader,
  LazyFooter
} from './components/LazyComponents';
import './styles/global.css';

function AppContent(): JSX.Element {
  const {
    currentPrompt,
    setCurrentPrompt,
    currentSession,
    isAnalyzing,
    isRefining,
    error,
    startNewRefinement,
    completeRefinement,
    retryOnError,
    clearError
  } = useWorkflow();

  // Performance monitoring hooks
  const { measureRender, measureRenderAsync } = useComponentPerformance('AppContent');
  
  // Performance widget state
  const [showPerformanceWidget, setShowPerformanceWidget] = useState(process.env.NODE_ENV === 'development');

  const handlePromptSubmit = async (prompt: string): Promise<void> => {
    await measureRenderAsync('prompt-submission', () => startNewRefinement(prompt));
  };

  const handleRefinePrompt = async (): Promise<void> => {
    await measureRenderAsync('prompt-refinement', () => completeRefinement());
  };

  const handleRetry = (): void => {
    retryOnError();
  };

  const handleNewSession = (): void => {
    measureRender('new-session');
    setCurrentPrompt('');
  };

  // Keyboard shortcuts for performance monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Ctrl/Cmd + Shift + P to toggle performance widget
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setShowPerformanceWidget(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="app">
      <LazyHeader />
      
      <main className="app-main">
        <div className="app-container">
          {/* Input Section */}
          <section className="input-section">
            <PromptInput
              value={currentPrompt}
              onChange={setCurrentPrompt}
              onSubmit={handlePromptSubmit}
              disabled={isAnalyzing || isRefining}
              placeholder="Enter your prompt here to get AI-powered refinement suggestions..."
              maxLength={4096}
              error={error?.type === 'validation' ? error.message : undefined}
            />
          </section>

          {/* Error Display */}
          {error && (
            <section className="error-section">
              <div className="error-banner">
                <div className="error-content">
                  <strong>Error:</strong> {error.message}
                  {error.recoverable && (
                    <button 
                      onClick={handleRetry}
                      className="error-retry-button"
                      disabled={isAnalyzing || isRefining}
                    >
                      Retry
                    </button>
                  )}
                  <button 
                    onClick={clearError}
                    className="error-close-button"
                    aria-label="Close error"
                  >
                    ×
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Results Section */}
          {currentSession && (
            <section className="results-section">
              <div className="results-grid">
                {/* Analysis Panel */}
                <aside className="analysis-panel">
                  <LazyAnalysisPanel 
                    analyses={currentSession.analysisResults}
                    compact={false}
                  />
                  
                  {/* Education Panel */}
                  {currentSession.educationTips.length > 0 && (
                    <LazyEducationPanel
                      tips={currentSession.educationTips}
                      userLevel="intermediate"
                    />
                  )}
                </aside>

                {/* Output Panel */}
                <main className="output-panel">
                  <LazyPromptOutput
                    session={currentSession}
                    onCopyRefined={(text) => {
                      navigator.clipboard.writeText(text);
                    }}
                    onStartNewSession={handleNewSession}
                    showComparison={true}
                  />
                  
                  {/* Refine Button */}
                  {currentSession.analysisResults.length > 0 && !currentSession.refinedPrompt && (
                    <div className="refine-section">
                      <button
                        onClick={handleRefinePrompt}
                        disabled={isRefining}
                        className="refine-button"
                      >
                        {isRefining ? 'Refining...' : 'Refine My Prompt'}
                      </button>
                    </div>
                  )}
                </main>
              </div>
            </section>
          )}

          {/* Loading States */}
          {isAnalyzing && (
            <section className="loading-section">
              <LoadingFallback 
                message="Analyzing your prompt..."
                size="large"
              />
            </section>
          )}

          {isRefining && (
            <section className="loading-section">
              <LoadingFallback 
                message="Refining your prompt..."
                size="large"
              />
            </section>
          )}

          {/* Empty State */}
          {!currentSession && !isAnalyzing && !currentPrompt && (
            <section className="empty-state">
              <div className="empty-state-content">
                <h2>Welcome to FixYourPrompts</h2>
                <p>
                  Transform your AI prompts with intelligent analysis and refinement.
                  Enter a prompt above to get started with personalized suggestions
                  and educational tips.
                </p>
                <div className="feature-list">
                  <div className="feature-item">
                    <strong>Smart Analysis</strong> - Identify vagueness, missing context, and structural issues
                  </div>
                  <div className="feature-item">
                    <strong>AI Refinement</strong> - Get improved versions with clear explanations
                  </div>
                  <div className="feature-item">
                    <strong>Educational Tips</strong> - Learn advanced prompting techniques
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <LazyFooter />
      
      {/* Performance Widget for Development */}
      {showPerformanceWidget && (
        <PerformanceWidget 
          position="bottom-right" 
          showInProduction={false} 
        />
      )}
    </div>
  );
}

function App(): JSX.Element {
  const handleProfilerRender = useProfiler('App');

  return (
    <ErrorBoundary name="App">
      <Profiler id="App" onRender={handleProfilerRender}>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Profiler>
    </ErrorBoundary>
  );
}

export default App;
