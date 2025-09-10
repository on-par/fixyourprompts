/**
 * Enhanced Error Boundary specifically for lazy-loaded components
 * Provides better error handling and recovery for code splitting scenarios
 */

import React, { Component, ReactNode } from 'react';
import './LazyErrorBoundary.css';

export interface LazyErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component to render on error */
  fallback?: ReactNode;
  /** Component name for better error messages */
  componentName?: string;
  /** Callback when an error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Whether to show retry functionality */
  allowRetry?: boolean;
}

interface LazyErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

export class LazyErrorBoundary extends Component<LazyErrorBoundaryProps, LazyErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<LazyErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      errorInfo
    });

    // Call the error callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error details for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('LazyErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);

      // Log additional context for lazy loading errors
      if (error.message.includes('Loading chunk') || error.name === 'ChunkLoadError') {
        console.error('This appears to be a chunk loading error. This might be due to:');
        console.error('- Network connectivity issues');
        console.error('- Deployment while user was using the app');
        console.error('- Missing or corrupted chunk files');
      }
    }
  }

  handleRetry = (): void => {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1
      });
    }
  };

  handleReload = (): void => {
    // Force a page reload to get fresh chunks
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback, componentName = 'Component', allowRetry = true } = this.props;

    if (hasError && error) {
      // If custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      const isChunkError = error.message.includes('Loading chunk') || error.name === 'ChunkLoadError';
      const canRetry = allowRetry && retryCount < this.maxRetries;

      return (
        <div className="lazy-error-boundary">
          <div className="lazy-error-boundary__content">
            <div className="lazy-error-boundary__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            
            <h3 className="lazy-error-boundary__title">
              {isChunkError ? 'Loading Error' : 'Component Error'}
            </h3>
            
            <p className="lazy-error-boundary__message">
              {isChunkError 
                ? `Failed to load ${componentName}. This might be due to a network issue or app update.`
                : `Something went wrong while loading ${componentName}.`
              }
            </p>

            {/* Development mode: show error details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="lazy-error-boundary__details">
                <summary>Error Details (Development)</summary>
                <pre className="lazy-error-boundary__error-text">
                  {error.name}: {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}

            <div className="lazy-error-boundary__actions">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="lazy-error-boundary__button lazy-error-boundary__button--primary"
                >
                  Try Again ({this.maxRetries - retryCount} left)
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="lazy-error-boundary__button lazy-error-boundary__button--secondary"
              >
                Reload Page
              </button>
            </div>

            {isChunkError && (
              <div className="lazy-error-boundary__help">
                <p className="lazy-error-boundary__help-text">
                  If this keeps happening, try refreshing the page or check your internet connection.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default LazyErrorBoundary;