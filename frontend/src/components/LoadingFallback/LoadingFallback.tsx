/**
 * Loading fallback component for lazy-loaded components
 * Provides consistent loading states across the application
 */

import React from 'react';
import './LoadingFallback.css';

export interface LoadingFallbackProps {
  /** Loading message to display */
  message?: string;
  /** Size of the loading spinner */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show a minimal version (just spinner) */
  minimal?: boolean;
  /** Custom className for styling */
  className?: string;
}

export function LoadingFallback({ 
  message = 'Loading...',
  size = 'medium',
  minimal = false,
  className = ''
}: LoadingFallbackProps): JSX.Element {
  const baseClassName = `loading-fallback loading-fallback--${size}`;
  const finalClassName = `${baseClassName} ${className}`.trim();

  if (minimal) {
    return (
      <div className={`${finalClassName} loading-fallback--minimal`}>
        <div className="loading-fallback__spinner" aria-label={message} />
      </div>
    );
  }

  return (
    <div className={finalClassName}>
      <div className="loading-fallback__content">
        <div className="loading-fallback__spinner" />
        <p className="loading-fallback__message">{message}</p>
      </div>
    </div>
  );
}

export default LoadingFallback;