import React from 'react';
import { AppProvider } from './context/AppContext';
import { useWorkflow } from './hooks/useRefinement';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PromptInput } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { AnalysisPanel } from './components/AnalysisPanel';
import { EducationPanel } from './components/EducationPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
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

  const handlePromptSubmit = async (prompt: string): Promise<void> => {
    await startNewRefinement(prompt);
  };

  const handleRefinePrompt = async (): Promise<void> => {
    await completeRefinement();
  };

  const handleRetry = (): void => {
    retryOnError();
  };

  const handleNewSession = (): void => {
    setCurrentPrompt('');
  };

  return (
    <div className="app">
      <Header />
      
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
                  <AnalysisPanel 
                    analyses={currentSession.analysisResults}
                    compact={false}
                  />
                  
                  {/* Education Panel */}
                  {currentSession.educationTips.length > 0 && (
                    <EducationPanel
                      tips={currentSession.educationTips}
                      userLevel="intermediate"
                    />
                  )}
                </aside>

                {/* Output Panel */}
                <main className="output-panel">
                  <PromptOutput
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
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Analyzing your prompt...</p>
              </div>
            </section>
          )}

          {isRefining && (
            <section className="loading-section">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Refining your prompt...</p>
              </div>
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

      <Footer />
    </div>
  );
}

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
