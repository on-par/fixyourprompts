/**
 * Performance Monitoring Utilities
 * 
 * Core utilities for tracking performance metrics, Core Web Vitals,
 * and performance budgets in the React application.
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  delta?: number;
  id: string;
  navigationType?: string;
  timestamp: number;
}

export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  updateCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

export interface NetworkPerformance {
  url: string;
  method: string;
  duration: number;
  status: number;
  size?: number;
  timestamp: number;
  type: 'xhr' | 'fetch' | 'resource';
}

export interface PerformanceBudget {
  metric: string;
  budget: number;
  current: number;
  status: 'good' | 'needs-improvement' | 'poor';
  threshold: {
    good: number;
    needsImprovement: number;
  };
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private networkMetrics: NetworkPerformance[] = [];
  private isEnabled: boolean = true;
  private callbacks: Map<string, (metric: PerformanceMetric) => void> = new Map();

  constructor() {
    this.initializeWebVitals();
    this.initializeNavigationTiming();
    this.initializeResourceTiming();
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initializeWebVitals(): void {
    if (!this.isEnabled) {return;}

    const onMetric = (metric: any) => {
      const perfMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: Date.now()
      };

      this.recordMetric(perfMetric);
    };

    // Core Web Vitals
    getCLS(onMetric);
    getFID(onMetric);
    getFCP(onMetric);
    getLCP(onMetric);
    getTTFB(onMetric);
  }

  /**
   * Initialize navigation timing monitoring
   */
  private initializeNavigationTiming(): void {
    if (!this.isEnabled || typeof window === 'undefined') {return;}

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // DNS lookup time
        this.recordMetric({
          name: 'DNS',
          value: navigation.domainLookupEnd - navigation.domainLookupStart,
          id: 'navigation-dns',
          timestamp: Date.now()
        });

        // Connection time
        this.recordMetric({
          name: 'Connection',
          value: navigation.connectEnd - navigation.connectStart,
          id: 'navigation-connection',
          timestamp: Date.now()
        });

        // Server response time
        this.recordMetric({
          name: 'Server Response',
          value: navigation.responseStart - navigation.requestStart,
          id: 'navigation-response',
          timestamp: Date.now()
        });

        // DOM processing time
        this.recordMetric({
          name: 'DOM Processing',
          value: navigation.domComplete - navigation.domLoading,
          id: 'navigation-dom',
          timestamp: Date.now()
        });

        // Load complete time
        this.recordMetric({
          name: 'Load Complete',
          value: navigation.loadEventEnd - navigation.navigationStart,
          id: 'navigation-load',
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Initialize resource timing monitoring
   */
  private initializeResourceTiming(): void {
    if (!this.isEnabled || typeof window === 'undefined') {return;}

    // Monitor resource loading performance
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          this.recordMetric({
            name: `Resource: ${resource.name.split('/').pop() || 'unknown'}`,
            value: resource.duration,
            id: `resource-${resource.name}`,
            timestamp: Date.now()
          });

          // Track large resources
          if (resource.transferSize > 100000) { // 100KB
            this.recordMetric({
              name: 'Large Resource',
              value: resource.transferSize,
              id: `large-resource-${resource.name}`,
              timestamp: Date.now()
            });
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource timing observer not supported:', error);
    }
  }

  /**
   * Initialize network request monitoring
   */
  private initializeNetworkMonitoring(): void {
    if (!this.isEnabled || typeof window === 'undefined') {return;}

    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const startTime = performance.now();
      const url = typeof input === 'string' ? input : input.toString();
      
      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;
        
        this.recordNetworkMetric({
          url,
          method: init?.method || 'GET',
          duration,
          status: response.status,
          timestamp: Date.now(),
          type: 'fetch'
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.recordNetworkMetric({
          url,
          method: init?.method || 'GET',
          duration,
          status: 0,
          timestamp: Date.now(),
          type: 'fetch'
        });

        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._startTime = performance.now();
      (this as any)._method = method;
      (this as any)._url = typeof url === 'string' ? url : url.toString();
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args: any[]) {
      this.addEventListener('readystatechange', () => {
        if (this.readyState === 4) {
          const duration = performance.now() - (this as any)._startTime;
          
          performanceMonitor.recordNetworkMetric({
            url: (this as any)._url,
            method: (this as any)._method,
            duration,
            status: this.status,
            timestamp: Date.now(),
            type: 'xhr'
          });
        }
      });

      return originalXHRSend.apply(this, args);
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) {return;}

    this.metrics.push(metric);
    
    // Execute callbacks
    const callback = this.callbacks.get(metric.name);
    if (callback) {
      callback(metric);
    }

    // Execute wildcard callback
    const wildcardCallback = this.callbacks.get('*');
    if (wildcardCallback) {
      wildcardCallback(metric);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${metric.name} = ${metric.value}ms`, metric);
    }
  }

  /**
   * Record network performance metric
   */
  recordNetworkMetric(metric: NetworkPerformance): void {
    if (!this.isEnabled) {return;}

    this.networkMetrics.push(metric);

    // Also record as general performance metric
    this.recordMetric({
      name: `Network: ${metric.method} ${metric.url.split('/').pop()}`,
      value: metric.duration,
      id: `network-${metric.url}-${metric.timestamp}`,
      timestamp: metric.timestamp
    });
  }

  /**
   * Record component performance metric
   */
  recordComponentMetric(componentName: string, renderTime: number): void {
    if (!this.isEnabled) {return;}

    const existing = this.componentMetrics.get(componentName) || {
      componentName,
      renderTime: 0,
      updateCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      totalRenderTime: 0
    };

    const updated: ComponentPerformance = {
      ...existing,
      renderTime,
      lastRenderTime: renderTime,
      updateCount: existing.updateCount + 1,
      totalRenderTime: existing.totalRenderTime + renderTime,
      averageRenderTime: (existing.totalRenderTime + renderTime) / (existing.updateCount + 1)
    };

    this.componentMetrics.set(componentName, updated);

    // Record as general performance metric
    this.recordMetric({
      name: `Component: ${componentName}`,
      value: renderTime,
      id: `component-${componentName}-${Date.now()}`,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to performance metrics
   */
  subscribe(metricName: string, callback: (metric: PerformanceMetric) => void): () => void {
    this.callbacks.set(metricName, callback);
    
    return () => {
      this.callbacks.delete(metricName);
    };
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get component metrics
   */
  getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get network metrics
   */
  getNetworkMetrics(): NetworkPerformance[] {
    return [...this.networkMetrics];
  }

  /**
   * Get performance budget status
   */
  getPerformanceBudgets(): PerformanceBudget[] {
    const budgets: PerformanceBudget[] = [];

    // Core Web Vitals budgets
    const lcpMetric = this.metrics.find(m => m.name === 'LCP');
    if (lcpMetric) {
      budgets.push({
        metric: 'LCP',
        budget: 2500,
        current: lcpMetric.value,
        status: lcpMetric.value <= 2500 ? 'good' : lcpMetric.value <= 4000 ? 'needs-improvement' : 'poor',
        threshold: { good: 2500, needsImprovement: 4000 }
      });
    }

    const fidMetric = this.metrics.find(m => m.name === 'FID');
    if (fidMetric) {
      budgets.push({
        metric: 'FID',
        budget: 100,
        current: fidMetric.value,
        status: fidMetric.value <= 100 ? 'good' : fidMetric.value <= 300 ? 'needs-improvement' : 'poor',
        threshold: { good: 100, needsImprovement: 300 }
      });
    }

    const clsMetric = this.metrics.find(m => m.name === 'CLS');
    if (clsMetric) {
      budgets.push({
        metric: 'CLS',
        budget: 0.1,
        current: clsMetric.value,
        status: clsMetric.value <= 0.1 ? 'good' : clsMetric.value <= 0.25 ? 'needs-improvement' : 'poor',
        threshold: { good: 0.1, needsImprovement: 0.25 }
      });
    }

    return budgets;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
    this.networkMetrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance timing utilities
 */
export const timing = {
  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance?.mark) {
      performance.mark(`${name}-start`);
    }
  },

  /**
   * Measure the time since a mark was created
   */
  measure(name: string): number {
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        performance.measure(name, `${name}-start`);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        return measure?.duration || 0;
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
        return 0;
      }
    }
    return 0;
  },

  /**
   * Time a synchronous operation
   */
  time<T>(name: string, fn: () => T): T {
    this.mark(name);
    const result = fn();
    const duration = this.measure(name);
    
    performanceMonitor.recordMetric({
      name: `Timing: ${name}`,
      value: duration,
      id: `timing-${name}-${Date.now()}`,
      timestamp: Date.now()
    });

    return result;
  },

  /**
   * Time an asynchronous operation
   */
  async timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.mark(name);
    const result = await fn();
    const duration = this.measure(name);
    
    performanceMonitor.recordMetric({
      name: `Timing: ${name}`,
      value: duration,
      id: `timing-${name}-${Date.now()}`,
      timestamp: Date.now()
    });

    return result;
  }
};

/**
 * Export types and utilities
 */
export type {
  PerformanceMetric,
  ComponentPerformance,
  NetworkPerformance,
  PerformanceBudget
};