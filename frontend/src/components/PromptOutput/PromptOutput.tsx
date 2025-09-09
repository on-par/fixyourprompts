/**
 * PromptOutput Component
 * 
 * Displays the results of prompt refinement sessions including:
 * - Original vs refined prompt comparison
 * - Analysis results and improvements
 * - Education tips
 * - Copy functionality and session management
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { PromptOutputProps } from '../../types/components';
import { PromptRefinementSession } from '../../types/core';

interface CopyState {
  copied: boolean;
  error: string | null;
}

const PromptOutput = memo<PromptOutputProps>(({ 
  session, 
  onCopyRefined, 
  onStartNewSession, 
  showComparison = true 
}) => {
  const [copyState, setCopyState] = useState<CopyState>({ copied: false, error: null });
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  // Track renders for performance testing
  useMemo(() => {
    setRenderCount(prev => prev + 1);
  }, [session, showComparison]);

  const handleCopyRefined = useCallback(async () => {
    if (!session.refinedPrompt) return;

    try {
      await navigator.clipboard.writeText(session.refinedPrompt);
      onCopyRefined(session.refinedPrompt);
      setCopyState({ copied: true, error: null });
      
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopyState({ copied: false, error: null });
      }, 2000);
    } catch (error) {
      setCopyState({ copied: false, error: 'Failed to copy' });
      setTimeout(() => {
        setCopyState({ copied: false, error: null });
      }, 3000);
    }
  }, [session.refinedPrompt, onCopyRefined]);

  const handleNewSessionClick = useCallback(() => {
    setShowNewSessionDialog(true);
  }, []);

  const handleConfirmNewSession = useCallback(() => {
    setShowNewSessionDialog(false);
    onStartNewSession();
  }, [onStartNewSession]);

  const handleCancelNewSession = useCallback(() => {
    setShowNewSessionDialog(false);
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const renderPromptText = useCallback((text: string, testId: string) => {
    const lines = text.split('\n');
    return (
      <div data-testid={testId} className="prompt-text">
        {lines.map((line, index) => (
          <div key={index} className="prompt-line">
            {line.includes('•') ? (
              <div className="bullet-point">{line}</div>
            ) : line.includes('**') ? (
              <div 
                className="formatted-text"
                dangerouslySetInnerHTML={{ 
                  __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                }}
              />
            ) : (
              line
            )}
          </div>
        ))}
      </div>
    );
  }, []);

  const renderDiffComparison = useCallback(() => {
    if (!session.refinedPrompt || !showComparison) return null;

    const originalWords = session.originalPrompt.split(' ');
    const refinedWords = session.refinedPrompt.split(' ');
    
    // Simple diff highlighting - highlight additions in refined prompt
    const additions = refinedWords.filter(word => !originalWords.includes(word));
    
    return (
      <div data-testid="prompt-comparison" className="diff-comparison">
        <div className="comparison-side">
          <h3>Original Prompt</h3>
          {renderPromptText(session.originalPrompt, 'original-prompt-container')}
        </div>
        <div className="comparison-side">
          <h3>Refined Prompt</h3>
          <div data-testid="refined-prompt-container" className="prompt-text">
            {session.refinedPrompt.split(' ').map((word, index) => {
              const cleanWord = word.replace(/[,.]$/, ''); // Remove trailing punctuation for comparison
              const isAddition = additions.includes(word) || additions.includes(cleanWord);
              return (
                <span 
                  key={index}
                  className={isAddition ? 'diff-addition' : ''}
                  data-testid={isAddition ? 'diff-addition' : undefined}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [session.originalPrompt, session.refinedPrompt, showComparison, renderPromptText]);

  const renderStatusIndicator = useCallback(() => {
    const status = session.status;
    
    return (
      <div role="status" aria-live="polite" className="status-indicator">
        {status === 'analyzing' && (
          <>
            <div role="progressbar" aria-label="Analyzing prompt">Analyzing...</div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="error-message">Error: Unable to refine prompt</div>
            <button 
              type="button" 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  }, [session.status]);

  return (
    <div 
      role="region" 
      aria-label="Prompt Output"
      className="prompt-output"
      data-testid="render-count"
      data-render-count={renderCount}
    >

      {/* Session Metadata */}
      <div className="session-metadata">
        <div>Session: {session.id}</div>
        <div>Created: {formatDate(session.createdAt)}</div>
      </div>

      {/* Status Indicator */}
      {renderStatusIndicator()}

      {/* Prompt Display */}
      {showComparison && session.refinedPrompt ? (
        renderDiffComparison()
      ) : (
        <div className="single-prompt-view">
          {!showComparison && session.refinedPrompt && (
            <>
              <h3>Refined Prompt</h3>
              {renderPromptText(session.refinedPrompt, 'refined-prompt-container')}
            </>
          )}
          {!session.refinedPrompt && (
            <>
              <h3>Original Prompt</h3>
              {renderPromptText(session.originalPrompt, 'original-prompt-container')}
              <div className="no-refinement">No refined prompt available</div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          type="button"
          onClick={handleCopyRefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopyRefined();
            }
          }}
          disabled={!session.refinedPrompt || session.status === 'analyzing'}
          aria-label="Copy Refined Prompt"
          className="copy-button"
        >
          {copyState.copied ? 'Copied!' : 'Copy Refined Prompt'}
        </button>
        
        <button
          type="button"
          onClick={handleNewSessionClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNewSessionClick();
            }
          }}
          aria-label="Start New Session"
          className="new-session-button"
        >
          Start New Session
        </button>
      </div>

      {/* Copy Status Messages */}
      {copyState.error && (
        <div className="copy-error">{copyState.error}</div>
      )}

      {/* Analysis Results */}
      <div className="analysis-section">
        <h3>Analysis Results</h3>
        {session.analysisResults.length > 0 ? (
          <div className="analysis-results">
            {session.analysisResults.map(analysis => (
              <div key={analysis.id} className="analysis-item">
                <div className="analysis-type">{analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)}</div>
                <div className="analysis-severity">{analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}</div>
                <div className="analysis-issue">{analysis.issue}</div>
                <div className="analysis-suggestion">{analysis.suggestion}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>No analysis results available</div>
        )}
      </div>

      {/* Improvements Made */}
      <div className="improvements-section">
        <h3>Improvements Made</h3>
        {session.improvements.length > 0 ? (
          <div className="improvements-list">
            {session.improvements.map(improvement => (
              <div key={improvement.id} className="improvement-item">
                <div className="improvement-description">{improvement.description}</div>
                <div className="improvement-rationale">{improvement.rationale}</div>
                <div className="improvement-before-after">
                  <div>Before: {improvement.before}</div>
                  <div>After: {improvement.after}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No improvements made</div>
        )}
      </div>

      {/* Education Tips */}
      <div className="education-section">
        <h3>Education Tips</h3>
        {session.educationTips.length > 0 ? (
          <div className="education-tips">
            {session.educationTips.map(tip => (
              <div key={tip.id} className="education-tip">
                <div className="tip-title">{tip.title}</div>
                <div className="tip-description">{tip.description}</div>
                <div className="tip-example">Example: {tip.example}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>No education tips available</div>
        )}
      </div>

      {/* New Session Confirmation Dialog */}
      {showNewSessionDialog && (
        <div className="dialog-overlay" role="dialog" aria-modal="true">
          <div className="dialog-content">
            <h3>Start a new session?</h3>
            <p>This will clear your current work</p>
            <div className="dialog-buttons">
              <button
                type="button"
                onClick={handleConfirmNewSession}
                className="confirm-button"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={handleCancelNewSession}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PromptOutput.displayName = 'PromptOutput';

export default PromptOutput;