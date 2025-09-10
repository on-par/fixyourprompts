/**
 * Error Tracking and Logging Utilities
 * 
 * Comprehensive error tracking system for capturing, categorizing,
 * and reporting JavaScript errors and crashes.
 */

import { performanceMonitor } from './performance';

// Error types and interfaces
export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  type: ErrorType;
  severity: ErrorSeverity;
  context?: ErrorContext;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export type ErrorType = 
  | 'javascript' 
  | 'promise-rejection' 
  | 'network' 
  | 'component' 
  | 'chunk-load' 
  | 'resource-load'
  | 'performance'
  | 'security'
  | 'user-action';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userInput?: string;
  route?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  previousErrors?: string[];
  performanceMetrics?: {
    renderTime?: number;
    memoryUsage?: number;
    timestamp?: number;
  };
}

export interface ErrorBoundaryInfo {
  componentStack: string;
  errorBoundary?: string;
  errorInfo?: React.ErrorInfo;
}

// Error reporting callbacks
type ErrorCallback = (error: ErrorInfo) => void;
type ErrorFilter = (error: ErrorInfo) => boolean;

// Error tracker class
class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private callbacks: ErrorCallback[] = [];
  private filters: ErrorFilter[] = [];
  private isEnabled: boolean = true;
  private maxErrors: number = 1000;
  private sessionId: string = this.generateSessionId();

  constructor() {
    this.initializeGlobalErrorHandling();
    this.initializeUnhandledRejectionHandling();
    this.initializeResourceErrorHandling();
    this.initializeSecurityErrorHandling();
  }

  /**
   * Initialize global JavaScript error handling
   */
  private initializeGlobalErrorHandling(): void {
    if (typeof window === 'undefined') {return;}

    window.addEventListener('error', (event) => {
      const errorInfo: ErrorInfo = {
        id: this.generateErrorId(),
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        userAgent: navigator.userAgent,
        type: 'javascript',
        severity: this.determineSeverity(event.error),
        sessionId: this.sessionId,
        context: {
          route: window.location.pathname,
        }
      };

      this.trackError(errorInfo);
    });
  }

  /**
   * Initialize unhandled promise rejection handling
   */
  private initializeUnhandledRejectionHandling(): void {
    if (typeof window === 'undefined') {return;}

    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      
      const errorInfo: ErrorInfo = {
        id: this.generateErrorId(),
        message: error?.message || 'Unhandled promise rejection',
        stack: error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        type: 'promise-rejection',
        severity: this.determineSeverity(error),
        sessionId: this.sessionId,
        context: {
          route: window.location.pathname,
        }
      };

      this.trackError(errorInfo);
    });
  }

  /**
   * Initialize resource loading error handling
   */
  private initializeResourceErrorHandling(): void {
    if (typeof window === 'undefined') {return;}

    window.addEventListener('error', (event) => {
      // Check if it's a resource loading error
      const target = event.target as HTMLElement;
      if (target && target !== window) {
        const errorInfo: ErrorInfo = {
          id: this.generateErrorId(),
          message: `Failed to load resource: ${(target as any).src || (target as any).href || 'unknown'}`,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          type: 'resource-load',
          severity: 'medium',
          sessionId: this.sessionId,
          context: {
            route: window.location.pathname,
          },
          metadata: {
            resourceType: target.tagName,
            resourceUrl: (target as any).src || (target as any).href,
          }
        };

        this.trackError(errorInfo);
      }
    }, true); // Use capture phase
  }

  /**
   * Initialize security error handling
   */
  private initializeSecurityErrorHandling(): void {
    if (typeof window === 'undefined') {return;}

    // Monitor for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      const errorInfo: ErrorInfo = {
        id: this.generateErrorId(),
        message: `CSP violation: ${event.violatedDirective}`,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        type: 'security',
        severity: 'high',
        sessionId: this.sessionId,
        context: {
          route: window.location.pathname,
        },
        metadata: {
          blockedUri: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
        }
      };

      this.trackError(errorInfo);
    });
  }

  /**
   * Track a custom error
   */
  trackError(errorInfo: ErrorInfo): void {
    if (!this.isEnabled) {return;}

    // Apply filters
    if (this.filters.some(filter => !filter(errorInfo))) {
      return;
    }

    // Add to errors list
    this.errors.push(errorInfo);

    // Maintain max errors limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Execute callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (error) {
        console.error('Error in error tracking callback:', error);
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Tracked Error:', errorInfo);
    }

    // Report to performance monitor
    performanceMonitor.recordMetric({
      name: `Error: ${errorInfo.type}`,
      value: 1,
      id: errorInfo.id,
      timestamp: errorInfo.timestamp
    });
  }

  /**
   * Track a React component error
   */
  trackComponentError(
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName?: string
  ): void {
    const errorData: ErrorInfo = {
      id: this.generateErrorId(),
      message: error.message || 'Component error',
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      type: 'component',
      severity: this.determineSeverity(error),
      sessionId: this.sessionId,
      context: {
        component: componentName,
        route: window.location.pathname,
      },
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: componentName,
      }
    };

    this.trackError(errorData);
  }

  /**
   * Track a network error
   */
  trackNetworkError(
    url: string,
    method: string,
    status: number,
    message?: string
  ): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message: message || `Network error: ${status} ${method} ${url}`,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      type: 'network',
      severity: status >= 500 ? 'high' : 'medium',
      sessionId: this.sessionId,
      context: {
        route: window.location.pathname,
      },
      metadata: {
        requestUrl: url,
        method,
        status,
      }
    };

    this.trackError(errorInfo);
  }

  /**
   * Track a chunk loading error (code splitting)
   */
  trackChunkLoadError(chunkName: string, error: Error): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message: `Failed to load chunk: ${chunkName}`,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      type: 'chunk-load',
      severity: 'high',
      sessionId: this.sessionId,
      context: {
        route: window.location.pathname,
      },
      metadata: {
        chunkName,
      }
    };

    this.trackError(errorInfo);
  }

  /**
   * Track a user action error
   */
  trackUserActionError(
    action: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message: `User action error: ${action} - ${error.message}`,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      type: 'user-action',
      severity: 'medium',
      sessionId: this.sessionId,
      context: {
        action,
        route: window.location.pathname,
        ...context,
      }
    };

    this.trackError(errorInfo);
  }

  /**
   * Add error tracking callback
   */
  onError(callback: ErrorCallback): () => void {
    this.callbacks.push(callback);
    
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Add error filter
   */
  addFilter(filter: ErrorFilter): () => void {
    this.filters.push(filter);
    
    return () => {
      const index = this.filters.indexOf(filter);
      if (index > -1) {
        this.filters.splice(index, 1);
      }
    };
  }

  /**
   * Get all tracked errors
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): ErrorInfo[] {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorInfo[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: number;
  } {
    const byType = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentErrors = this.errors.filter(error => error.timestamp > oneHourAgo).length;

    return {
      total: this.errors.length,
      byType,
      bySeverity,
      recentErrors,
    };
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Enable/disable error tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Generate a unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine error severity based on error object
   */
  private determineSeverity(error: any): ErrorSeverity {
    if (!error) {return 'low';}

    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';

    // Critical errors
    if (
      message.includes('chunk load failed') ||
      message.includes('loading chunk failed') ||
      message.includes('network error') ||
      stack.includes('out of memory')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      message.includes('uncaught') ||
      message.includes('reference error') ||
      message.includes('type error') ||
      stack.includes('component')
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      message.includes('warning') ||
      message.includes('deprecated') ||
      message.includes('validation')
    ) {
      return 'medium';
    }

    return 'medium';
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

/**
 * Error boundary helper
 */
export const createErrorBoundary = (componentName: string) => ({
  onError: (error: Error, errorInfo: React.ErrorInfo) => {
    errorTracker.trackComponentError(error, errorInfo, componentName);
  }
});

/**
 * Async error wrapper
 */
export const withErrorTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        errorTracker.trackUserActionError(
          context || 'async-operation',
          error,
          { args }
        );
      }
      throw error;
    }
  }) as T;
};

/**
 * Export types and utilities
 */
export type {
  ErrorInfo,
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  ErrorBoundaryInfo
};