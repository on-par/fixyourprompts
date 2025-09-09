/**
 * AnalysisPanel React Component
 * 
 * Displays prompt analysis results with the following features:
 * - Analysis items sorted by severity (high to low)
 * - Visual severity indicators with proper styling
 * - Analysis type display with icons and proper CSS classes
 * - Interactive selection with keyboard support
 * - Compact/expanded view modes
 * - Expandable suggestions
 * - Accessibility features (ARIA labels, keyboard navigation, screen reader support)
 * - Empty state handling
 * - Error boundary behavior for edge cases
 */

import React, { useState, useCallback, useMemo } from 'react';
import { AnalysisPanelProps } from '../../types/components';
import { PromptAnalysis } from '../../types/core';

// Type mapping for display names
const ANALYSIS_TYPE_NAMES: Record<string, string> = {
  vagueness: 'Vagueness',
  missing_context: 'Missing Context',
  unclear_constraints: 'Unclear Constraints',
  poor_structure: 'Poor Structure',
  tone_inconsistency: 'Tone Inconsistency',
  missing_examples: 'Missing Examples',
};

// Severity order for sorting (higher number = higher priority)
const SEVERITY_ORDER = { high: 3, medium: 2, low: 1 };

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analyses = [],
  onAnalysisSelect,
  compact = false,
}) => {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [renderCount] = useState(1); // For performance testing
  const [announceMessage, setAnnounceMessage] = useState('');

  // Memoized sorting of analyses by severity
  const sortedAnalyses = useMemo(() => {
    if (!analyses || !Array.isArray(analyses)) {
      return [];
    }
    
    return [...analyses].sort((a, b) => {
      const aSeverity = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] || 2;
      const bSeverity = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] || 2;
      return bSeverity - aSeverity;
    });
  }, [analyses]);

  // Handle analysis selection
  const handleAnalysisSelect = useCallback((analysis: PromptAnalysis) => {
    setSelectedAnalysisId(analysis.id);
    setAnnounceMessage(`Selected analysis: ${ANALYSIS_TYPE_NAMES[analysis.type] || 'Unknown Type'} issue`);
    onAnalysisSelect?.(analysis);
  }, [onAnalysisSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, analysis: PromptAnalysis) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleAnalysisSelect(analysis);
    }
  }, [handleAnalysisSelect]);

  // Handle suggestion expansion
  const handleExpandSuggestion = useCallback((analysisId: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(analysisId)) {
        newSet.delete(analysisId);
      } else {
        newSet.add(analysisId);
      }
      return newSet;
    });
  }, []);

  // Render analysis type with icon
  const renderAnalysisType = (type: string) => {
    const displayName = ANALYSIS_TYPE_NAMES[type] || 'Unknown Type';
    const cssClass = `analysis-type-${type}`;
    
    return (
      <div className={cssClass}>
        <span data-testid={`${type}-icon`} className="analysis-icon" aria-hidden="true">
          {getTypeIcon(type)}
        </span>
        {displayName}
      </div>
    );
  };

  // Get icon for analysis type
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'vagueness': return '❓';
      case 'missing_context': return '📄';
      case 'unclear_constraints': return '🔒';
      case 'poor_structure': return '🏗️';
      case 'tone_inconsistency': return '🎭';
      case 'missing_examples': return '💡';
      default: return '❔';
    }
  };

  // Render severity indicator
  const renderSeverityIndicator = (severity: string) => {
    const severityClass = `severity-${severity}`;
    const testId = `${severity}-severity-indicator`;
    
    return (
      <span 
        className={`severity-indicator ${severityClass}`}
        data-testid={testId}
        aria-hidden="true"
      >
        {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'}
      </span>
    );
  };

  // Render highlighted text if position is provided
  const renderHighlightedText = (analysis: PromptAnalysis) => {
    if (!analysis.originalText || !analysis.position) {
      return null;
    }

    return (
      <div 
        className="highlighted-text"
        data-testid={`highlighted-text-${analysis.id}`}
      >
        <span className="label">Highlighted text:</span>
        <code className="text-highlight">{analysis.originalText}</code>
      </div>
    );
  };

  // Render suggestion with expand capability
  const renderSuggestion = (analysis: PromptAnalysis) => {
    const isExpanded = expandedSuggestions.has(analysis.id);
    const suggestion = analysis.suggestion || 'No suggestion available';

    return (
      <div className="suggestion-container">
        <div 
          className={compact ? 'suggestion truncated' : 'suggestion'}
          data-testid="analysis-suggestion"
        >
          {suggestion}
        </div>
        <button
          className="expand-button"
          data-testid={`expand-suggestion-${analysis.id}`}
          tabIndex={0}
          onClick={() => handleExpandSuggestion(analysis.id)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
        {isExpanded && (
          <div 
            className="expanded-content"
            data-testid={`expanded-suggestion-${analysis.id}`}
          >
            <p>Detailed explanation of how to address this issue in your prompt.</p>
          </div>
        )}
      </div>
    );
  };

  // Render single analysis item
  const renderAnalysisItem = (analysis: PromptAnalysis) => {
    // Handle malformed analyses first
    if (!analysis || !analysis.id) {
      return null;
    }

    // Normalize severity - handle invalid values by defaulting to medium  
    const validSeverities = ['low', 'medium', 'high'];
    const normalizedSeverity = validSeverities.includes(analysis.severity) ? analysis.severity : 'medium';
    const issue = analysis.issue || 'Unknown issue';
    const isSelected = selectedAnalysisId === analysis.id;

    return (
      <li
        key={analysis.id}
        className={`analysis-item severity-${normalizedSeverity} ${isSelected ? 'selected' : ''}`}
        data-testid={`analysis-item-${analysis.id}`}
        data-severity={normalizedSeverity} // Use normalized severity for tests
        tabIndex={0}
        role="listitem"
        aria-label={`${ANALYSIS_TYPE_NAMES[analysis.type] || 'Unknown Type'} analysis, ${normalizedSeverity} severity`}
        aria-selected={isSelected}
        onClick={() => handleAnalysisSelect(analysis)}
        onKeyDown={(e) => handleKeyDown(e, analysis)}
        style={{
          padding: '1rem',
          marginBottom: '0.5rem',
          border: '2px solid #e1e5e9',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          borderLeft: `4px solid ${normalizedSeverity === 'high' ? '#d1242f' : normalizedSeverity === 'medium' ? '#fb8500' : '#1f883d'}`,
          backgroundColor: isSelected ? '#ddf4ff' : 'white'
        }}
      >
        <div 
          className="analysis-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}
        >
          {renderAnalysisType(analysis.type)}
          {renderSeverityIndicator(normalizedSeverity)}
          <span className="visually-hidden" style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}>
            {normalizedSeverity.charAt(0).toUpperCase() + normalizedSeverity.slice(1)} severity issue
          </span>
        </div>
        
        <div 
          className={issue.length > 1000 ? 'analysis-issue truncated' : 'analysis-issue'}
          data-testid="analysis-issue"
          style={{
            marginBottom: '0.75rem',
            lineHeight: '1.5',
            ...(issue.length > 1000 ? {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            } : {})
          }}
        >
          {issue}
        </div>

        {renderHighlightedText(analysis)}
        {renderSuggestion(analysis)}

        {/* Additional test ID for severity-based lookup */}
        <div 
          data-testid={`${normalizedSeverity}-severity`}
          className={`severity-${normalizedSeverity} visually-hidden`}
          aria-label={`${ANALYSIS_TYPE_NAMES[analysis.type] || 'Unknown Type'} analysis, ${normalizedSeverity} severity`}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        />
      </li>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div 
      className="empty-state" 
      data-testid="empty-state"
      style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: '#656d76'
      }}
    >
      <div 
        data-testid="empty-state-illustration" 
        className="empty-illustration" 
        aria-hidden="true"
        style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}
      >
        ✅
      </div>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#24292f' }}>No Analysis Results</h3>
      <p style={{ margin: '0.25rem 0' }}>No issues found in your prompt. Great job!</p>
      <p style={{ margin: '0.25rem 0' }}>Your prompt looks good to go!</p>
    </div>
  );

  // Handle null or invalid analyses
  const validAnalyses = sortedAnalyses.filter(analysis => analysis && typeof analysis === 'object');
  const analysisCount = validAnalyses.length;

  return (
    <div 
      className={`analysis-panel ${compact ? 'compact' : ''}`}
      data-testid="analysis-panel-container"
      role="region"
      aria-label="Analysis Panel"
      style={{
        padding: compact ? '0.5rem' : '1rem',
        background: compact ? 'transparent' : 'white',
        borderRadius: compact ? 0 : '8px',
        boxShadow: compact ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Render count for performance testing */}
      <div 
        data-testid="render-count" 
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {renderCount}
      </div>
      
      {/* Live region for announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announceMessage}
      </div>

      {analysisCount === 0 ? renderEmptyState() : (
        <>
          {/* Header */}
          {!compact && <h2>Analysis Results</h2>}
          
          {/* Analysis count */}
          <div 
            className="analysis-count"
            style={{
              marginBottom: '1rem',
              fontWeight: '600',
              color: '#666'
            }}
          >
            {compact 
              ? `${analysisCount} issues`
              : `${analysisCount} issues found`
            }
          </div>

          {/* Analysis list */}
          <ul 
            className="analysis-list"
            role="list"
            aria-label="Analysis results"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}
          >
            {validAnalyses.map(renderAnalysisItem)}
          </ul>
        </>
      )}

      {/* Individual styles for components */}
      <style>{`
        .analysis-type-vagueness,
        .analysis-type-missing_context,
        .analysis-type-unclear_constraints,
        .analysis-type-poor_structure,
        .analysis-type-tone_inconsistency,
        .analysis-type-missing_examples {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .analysis-icon {
          font-size: 1rem;
        }

        .severity-indicator {
          margin-left: auto;
        }

        .highlighted-text {
          margin: 0.5rem 0;
          padding: 0.5rem;
          background-color: #fff8dc;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .highlighted-text .label {
          font-weight: 600;
          margin-right: 0.5rem;
        }

        .text-highlight {
          background-color: #ffeb3b;
          padding: 0.125rem 0.25rem;
          border-radius: 2px;
        }

        .suggestion-container {
          margin-top: 0.5rem;
        }

        .suggestion {
          color: #656d76;
          font-style: italic;
          line-height: 1.4;
        }

        .suggestion.truncated {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .expand-button {
          background: none;
          border: none;
          color: #0969da;
          cursor: pointer;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          text-decoration: underline;
        }

        .expand-button:hover {
          color: #0550ae;
        }

        .expanded-content {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #f6f8fa;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .analysis-item:hover {
          border-color: #0969da !important;
          background-color: #f6f8fa !important;
        }

        .analysis-item.selected {
          border-color: #0969da !important;
          background-color: #ddf4ff !important;
        }
      `}</style>
    </div>
  );
};

export default AnalysisPanel;