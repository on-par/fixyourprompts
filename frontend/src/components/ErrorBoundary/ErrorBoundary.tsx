/**
 * ErrorBoundary Component
 * 
 * React Error Boundary component for handling JavaScript errors anywhere in the component tree,
 * logging those errors, and displaying a fallback UI instead of the component tree that crashed.
 * 
 * Implements the ErrorBoundaryProps interface for consistent error handling across the application.
 */

import React, { Component, ReactNode } from 'react';
import type { ErrorBoundaryProps } from '../../types/components';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default fallback component shown when an error occurs
 */
const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
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
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service or console
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError(): void {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided, otherwise use default
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    // No error occurred, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;