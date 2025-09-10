/**
 * Performance Monitoring Hooks
 * 
 * React hooks for monitoring component performance, render times,
 * and providing performance insights.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor, timing, type PerformanceMetric, type ComponentPerformance, type PerformanceBudget } from '../utils/performance';
import { errorTracker } from '../utils/errorTracking';

/**
 * Hook to monitor component render performance
 */
export function useComponentPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.recordComponentMetric(componentName, renderTime);
    };
  });

  const measureRender = useCallback((operation: string) => {
    return timing.time(`${componentName}-${operation}`, () => {
      // This will be used for specific operations within the component
    });
  }, [componentName]);

  const measureRenderAsync = useCallback(async <T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return timing.timeAsync(`${componentName}-${operation}`, fn);
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    measureRender,
    measureRenderAsync,
  };
}

/**
 * Hook to track performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [componentMetrics, setComponentMetrics] = useState<ComponentPerformance[]>([]);
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);

  useEffect(() => {
    // Subscribe to all performance metrics
    const unsubscribe = performanceMonitor.subscribe('*', (metric) => {
      setMetrics(prev => [...prev.slice(-99), metric]); // Keep last 100 metrics
    });

    // Update component metrics and budgets periodically
    const interval = setInterval(() => {
      setComponentMetrics(performanceMonitor.getComponentMetrics());
      setBudgets(performanceMonitor.getPerformanceBudgets());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const clearMetrics = useCallback(() => {
    performanceMonitor.clearMetrics();
    setMetrics([]);
    setComponentMetrics([]);
    setBudgets([]);
  }, []);

  return {
    metrics,
    componentMetrics,
    budgets,
    clearMetrics,
  };
}

/**
 * Hook to monitor Core Web Vitals
 */
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    LCP?: number;
    FID?: number;
    CLS?: number;
    FCP?: number;
    TTFB?: number;
  }>({});

  useEffect(() => {
    const unsubscribes = [
      performanceMonitor.subscribe('LCP', (metric) => {
        setVitals(prev => ({ ...prev, LCP: metric.value }));
      }),
      performanceMonitor.subscribe('FID', (metric) => {
        setVitals(prev => ({ ...prev, FID: metric.value }));
      }),
      performanceMonitor.subscribe('CLS', (metric) => {
        setVitals(prev => ({ ...prev, CLS: metric.value }));
      }),
      performanceMonitor.subscribe('FCP', (metric) => {
        setVitals(prev => ({ ...prev, FCP: metric.value }));
      }),
      performanceMonitor.subscribe('TTFB', (metric) => {
        setVitals(prev => ({ ...prev, TTFB: metric.value }));
      }),
    ];

    return () => {
      unsubscribes.forEach(fn => fn());
    };
  }, []);

  const getVitalStatus = useCallback((vital: keyof typeof vitals, value?: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value === undefined) {return 'good';}

    switch (vital) {
      case 'LCP':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'FID':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'CLS':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'FCP':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'TTFB':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  }, []);

  return {
    vitals,
    getVitalStatus,
  };
}

/**
 * Hook for network performance monitoring
 */
export function useNetworkPerformance() {
  const [networkMetrics, setNetworkMetrics] = useState(performanceMonitor.getNetworkMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkMetrics(performanceMonitor.getNetworkMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getAverageResponseTime = useCallback(() => {
    if (networkMetrics.length === 0) {return 0;}
    const total = networkMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / networkMetrics.length;
  }, [networkMetrics]);

  const getSlowRequests = useCallback((threshold = 1000) => {
    return networkMetrics.filter(metric => metric.duration > threshold);
  }, [networkMetrics]);

  const getFailedRequests = useCallback(() => {
    return networkMetrics.filter(metric => metric.status >= 400);
  }, [networkMetrics]);

  return {
    networkMetrics,
    averageResponseTime: getAverageResponseTime(),
    slowRequests: getSlowRequests(),
    failedRequests: getFailedRequests(),
  };
}

/**
 * Hook for performance budget monitoring
 */
export function usePerformanceBudgets() {
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentBudgets = performanceMonitor.getPerformanceBudgets();
      setBudgets(currentBudgets);

      // Track budget violations
      const newViolations = currentBudgets
        .filter(budget => budget.status === 'poor')
        .map(budget => `${budget.metric}: ${budget.current} exceeds budget of ${budget.budget}`);
      
      setViolations(newViolations);

      // Report violations as errors
      newViolations.forEach(violation => {
        errorTracker.trackError({
          id: `budget-violation-${Date.now()}`,
          message: `Performance budget violation: ${violation}`,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          type: 'performance',
          severity: 'medium',
          context: {
            route: window.location.pathname,
          },
        });
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    budgets,
    violations,
    hasBudgetViolations: violations.length > 0,
  };
}

/**
 * Hook for React Profiler integration
 */
export function useProfiler(id: string, onRender?: (id: string, phase: string, actualDuration: number) => void) {
  const handleRender = useCallback((
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    _baseDuration: number,
    _startTime: number,
    _commitTime: number
  ) => {
    // Record the profiling data
    performanceMonitor.recordComponentMetric(id, actualDuration);

    // Log slow renders
    if (actualDuration > 16.67) { // Slower than 60fps
      console.warn(`Slow render detected in ${id}: ${actualDuration}ms (${phase})`);
    }

    // Call custom onRender callback if provided
    if (onRender) {
      onRender(id, phase, actualDuration);
    }
  }, [onRender]);

  return handleRender;
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usage: number;
  } | null>(null);

  useEffect(() => {
    if (!(performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number; totalJSHeapSize: number } }).memory) {
      console.warn('Memory monitoring not available in this browser');
      return;
    }

    const updateMemoryInfo = () => {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number; totalJSHeapSize: number } }).memory;
      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usage,
      });

      // Alert for high memory usage
      if (usage > 80) {
        errorTracker.trackError({
          id: `memory-warning-${Date.now()}`,
          message: `High memory usage detected: ${usage.toFixed(1)}%`,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          type: 'performance',
          severity: usage > 90 ? 'high' : 'medium',
          context: {
            route: window.location.pathname,
          },
          metadata: {
            memoryUsage: usage,
            usedJSHeapSize: memory.usedJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Hook for performance alerts
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'performance' | 'memory' | 'network' | 'budget';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
  }>>([]);

  useEffect(() => {
    const unsubscribe = errorTracker.onError((error) => {
      if (error.type === 'performance') {
        setAlerts(prev => [...prev.slice(-9), {
          id: error.id,
          type: 'performance',
          message: error.message,
          severity: error.severity,
          timestamp: error.timestamp,
        }]);
      }
    });

    return unsubscribe;
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    dismissAlert,
    clearAlerts,
  };
}

/**
 * Hook for lazy loading performance
 */
export function useLazyLoadingPerformance(componentName: string) {
  const [loadingTime, setLoadingTime] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  const onComponentLoad = useCallback(() => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      setLoadingTime(duration);
      
      performanceMonitor.recordMetric({
        name: `Lazy Load: ${componentName}`,
        value: duration,
        id: `lazy-${componentName}-${Date.now()}`,
        timestamp: Date.now()
      });
    }
  }, [componentName]);

  const onComponentError = useCallback((error: Error) => {
    setError(error);
    errorTracker.trackChunkLoadError(componentName, error);
  }, [componentName]);

  return {
    loadingTime,
    error,
    onComponentLoad,
    onComponentError,
  };
}