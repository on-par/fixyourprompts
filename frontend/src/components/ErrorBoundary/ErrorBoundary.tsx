/**
 * ErrorBoundary Component
 * 
 * React Error Boundary component for handling JavaScript errors anywhere in the component tree,
 * logging those errors, and displaying a fallback UI instead of the component tree that crashed.
 * 
 * Implements the ErrorBoundaryProps interface for consistent error handling across the application.
 */

import React, { Component, ReactNode, Profiler } from 'react';
import type { ErrorBoundaryProps } from '../../types/components';
import { errorTracker, createErrorBoundary } from '../../utils/errorTracking';
import { performanceMonitor } from '../../utils/performance';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId?: string;
  retryCount: number;
}

/**
 * Default fallback component shown when an error occurs
 */
const DefaultErrorFallback: React.FC<{ 
  error: Error; 
  resetError: () => void;
  errorId?: string;
  retryCount?: number;
}> = ({ 
  error, 
  resetError,
  errorId,
  retryCount = 0
}) => (
  <div role="alert" style={{
    padding: '2rem',
    margin: '1rem',
    border: '1px solid #ef4444',
    borderRadius: '0.5rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  }}>
    <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
      Something went wrong
    </h2>
    {errorId && (
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
        Error ID: {errorId} {retryCount > 0 && `(Retry ${retryCount})`}
      </p>
    )}
    <details style={{ marginBottom: '1rem' }}>
      <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
        Error details
      </summary>
      <pre style={{ 
        fontSize: '0.875rem', 
        overflow: 'auto',
        backgroundColor: '#ffffff',
        padding: '0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.25rem'
      }}>
        {error.message}
        {error.stack && `\n\n${  error.stack}`}
      </pre>
    </details>
    <button
      onClick={resetError}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '0.25rem',
        cursor: 'pointer',
        fontSize: '0.875rem'
      }}
    >
      Try again
    </button>
  </div>
);

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorBoundaryHelper = createErrorBoundary(this.props.name || 'ErrorBoundary');

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
    this.resetError = this.resetError.bind(this);
    this.handleProfilerRender = this.handleProfilerRender.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate error ID for tracking
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Track error with enhanced error tracking system
    errorTracker.trackComponentError(error, errorInfo, this.props.name || 'ErrorBoundary');

    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Call the error boundary helper
    this.errorBoundaryHelper.onError(error, errorInfo);
  }

  resetError(): void {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      errorId: undefined,
      retryCount: prevState.retryCount + 1
    }));
  }

  handleProfilerRender(
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    _baseDuration: number,
    _startTime: number,
    _commitTime: number
  ): void {
    // Record component performance for error boundary
    performanceMonitor.recordComponentMetric(`ErrorBoundary-${id}`, actualDuration);
    
    // Log slow error boundary renders
    if (actualDuration > 50 && process.env.NODE_ENV === 'development') {
      console.warn(`Slow ErrorBoundary render: ${actualDuration}ms for ${id}`);
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided, otherwise use default
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
        />
      );
    }

    // No error occurred, render children with profiler
    const profileId = this.props.name || 'ErrorBoundary';
    
    return (
      <Profiler id={profileId} onRender={this.handleProfilerRender}>
        {this.props.children}
      </Profiler>
    );
  }
}

export default ErrorBoundary;