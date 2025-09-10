/**
 * Higher-Order Component for Performance Monitoring
 * 
 * HOCs and utilities for wrapping components with performance monitoring,
 * error tracking, and profiling capabilities.
 */

import React, { ComponentType, Profiler, Suspense, lazy } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingFallback } from '../components/LoadingFallback';
import { useComponentPerformance, useProfiler, useLazyLoadingPerformance } from '../hooks/usePerformanceMonitoring';
import { errorTracker } from './errorTracking';

// HOC for adding performance monitoring to any component
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) {
  const MonitoredComponent: React.FC<P> = (props) => {
    const { measureRender } = useComponentPerformance(componentName);
    const handleProfilerRender = useProfiler(componentName);

    React.useEffect(() => {
      measureRender('mount');
    }, [measureRender]);

    return (
      <Profiler id={componentName} onRender={handleProfilerRender}>
        <WrappedComponent {...props} />
      </Profiler>
    );
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MonitoredComponent;
}

// HOC for adding error boundary with performance monitoring
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string,
  fallbackComponent?: ComponentType<{ error: Error; resetError: () => void }>
) {
  const BoundaryWrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary
        name={componentName}
        fallback={fallbackComponent}
        onError={(error, errorInfo) => {
          errorTracker.trackComponentError(error, errorInfo, componentName);
        }}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  BoundaryWrappedComponent.displayName = `withErrorBoundary(${componentName})`;
  return BoundaryWrappedComponent;
}

// HOC combining performance monitoring and error boundaries
export function withMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string,
  options?: {
    fallbackComponent?: ComponentType<{ error: Error; resetError: () => void }>;
    enableProfiling?: boolean;
    trackUserInteractions?: boolean;
  }
) {
  const { fallbackComponent, enableProfiling = true, trackUserInteractions = false } = options || {};

  const MonitoredComponent: React.FC<P> = (props) => {
    const { measureRender } = useComponentPerformance(componentName);
    const handleProfilerRender = useProfiler(componentName);

    React.useEffect(() => {
      measureRender('mount');
    }, [measureRender]);

    // Track user interactions if enabled
    React.useEffect(() => {
      if (!trackUserInteractions) {return;}

      const handleUserInteraction = (event: Event) => {
        measureRender(`user-interaction-${event.type}`);
      };

      const interactionEvents = ['click', 'keydown', 'scroll', 'resize'];
      interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUserInteraction, { passive: true });
      });

      return () => {
        interactionEvents.forEach(eventType => {
          document.removeEventListener(eventType, handleUserInteraction);
        });
      };
    }, [measureRender, trackUserInteractions]);

    const ComponentWithProfiling = enableProfiling ? (
      <Profiler id={componentName} onRender={handleProfilerRender}>
        <WrappedComponent {...props} />
      </Profiler>
    ) : (
      <WrappedComponent {...props} />
    );

    return (
      <ErrorBoundary
        name={componentName}
        fallback={fallbackComponent}
        onError={(error, errorInfo) => {
          errorTracker.trackComponentError(error, errorInfo, componentName);
        }}
      >
        {ComponentWithProfiling}
      </ErrorBoundary>
    );
  };

  MonitoredComponent.displayName = `withMonitoring(${componentName})`;
  return MonitoredComponent;
}

// Enhanced lazy loading with performance monitoring
export function createMonitoredLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  componentName: string,
  options?: {
    fallbackComponent?: ComponentType;
    retryCount?: number;
    retryDelay?: number;
    onLoadSuccess?: () => void;
    onLoadError?: (error: Error) => void;
  }
) {
  const {
    fallbackComponent = LoadingFallback,
    retryCount = 3,
    retryDelay = 1000,
    onLoadSuccess,
    onLoadError
  } = options || {};

  // Create a wrapper for the import function with retry logic
  const importWithRetry = async (attempt = 1): Promise<{ default: ComponentType<P> }> => {
    try {
      const module = await importFn();
      onLoadSuccess?.();
      return module;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown lazy loading error');
      
      errorTracker.trackChunkLoadError(componentName, err);
      onLoadError?.(err);

      if (attempt < retryCount) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return importWithRetry(attempt + 1);
      }
      
      throw err;
    }
  };

  const LazyComponent = lazy(() => importWithRetry());

  const MonitoredLazyComponent: React.FC<P> = (props) => {
    const { loadingTime, error, onComponentLoad, onComponentError } = useLazyLoadingPerformance(componentName);

    React.useEffect(() => {
      if (loadingTime !== null) {
        onComponentLoad();
      }
    }, [loadingTime, onComponentLoad]);

    React.useEffect(() => {
      if (error) {
        onComponentError(error);
      }
    }, [error, onComponentError]);

    return (
      <ErrorBoundary
        name={`Lazy${componentName}`}
        onError={(error, errorInfo) => {
          errorTracker.trackComponentError(error, errorInfo, `Lazy${componentName}`);
        }}
      >
        <Suspense 
          fallback={React.createElement(fallbackComponent, { 
            message: `Loading ${componentName}...`,
            size: 'medium' 
          } as { message: string; size: string })}
        >
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  MonitoredLazyComponent.displayName = `MonitoredLazy(${componentName})`;
  return MonitoredLazyComponent;
}

// Utility to measure async operations
export function withAsyncPerformanceTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  asyncFn: T,
  operationName: string
): T {
  return (async (...args: unknown[]) => {
    const startTime = performance.now();
    
    try {
      const result = await asyncFn(...args);
      const duration = performance.now() - startTime;
      
      // Record successful operation
      import('./performance').then(({ performanceMonitor }) => {
        performanceMonitor.recordMetric({
          name: `Async: ${operationName}`,
          value: duration,
          id: `async-${operationName}-${Date.now()}`,
          timestamp: Date.now()
        });
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Record failed operation
      import('./performance').then(({ performanceMonitor }) => {
        performanceMonitor.recordMetric({
          name: `Async Error: ${operationName}`,
          value: duration,
          id: `async-error-${operationName}-${Date.now()}`,
          timestamp: Date.now()
        });
      });

      // Track the error
      if (error instanceof Error) {
        errorTracker.trackUserActionError(operationName, error, { args });
      }

      throw error;
    }
  }) as T;
}

// Performance monitoring decorator for class components
export function performanceMonitoringDecorator(componentName: string) {
  return function<T extends { new(...args: unknown[]): React.Component }>(constructor: T) {
    return class extends constructor {
      private startTime: number = 0;

      componentDidMount() {
        super.componentDidMount?.();
        const duration = performance.now() - this.startTime;
        
        import('./performance').then(({ performanceMonitor }) => {
          performanceMonitor.recordComponentMetric(componentName, duration);
        });
      }

      componentDidUpdate() {
        super.componentDidUpdate?.();
        const duration = performance.now() - this.startTime;
        
        import('./performance').then(({ performanceMonitor }) => {
          performanceMonitor.recordComponentMetric(`${componentName}-update`, duration);
        });
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        super.componentDidCatch?.(error, errorInfo);
        errorTracker.trackComponentError(error, errorInfo, componentName);
      }

      render() {
        this.startTime = performance.now();
        return super.render();
      }
    };
  };
}

// React DevTools Profiler wrapper with enhanced logging
export const DevToolsProfiler: React.FC<{
  id: string;
  children: React.ReactNode;
  onRender?: (id: string, phase: string, actualDuration: number) => void;
}> = ({ id, children, onRender }) => {
  const handleRender = React.useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    _baseDuration: number,
    _startTime: number,
    _commitTime: number
  ) => {
    // Import performance monitor dynamically to avoid circular dependencies
    import('./performance').then(({ performanceMonitor }) => {
      performanceMonitor.recordComponentMetric(id, actualDuration);
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && actualDuration > 16.67) {
        console.warn(`Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms (${phase})`);
      }
    });

    // Call custom onRender callback
    onRender?.(id, phase, actualDuration);
  }, [onRender]);

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};