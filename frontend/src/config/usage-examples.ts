/**
 * Environment Configuration Usage Examples
 * 
 * This file demonstrates how to use the environment configuration system
 * throughout your application. These examples show best practices for
 * accessing configuration values, feature flags, and debug settings.
 * 
 * @module usage-examples
 */

import { 
  env, 
  isDevelopment, 
  isProduction, 
  isStaging,
  getApiUrl,
  isFeatureEnabled 
} from './env';

/**
 * Example: Basic configuration access
 */
export function basicUsageExamples(): void {
  // Access environment information
  console.log('Current environment:', env.environment);
  console.log('Build mode:', env.buildMode);
  console.log('App URL:', env.appUrl);
  console.log('App version:', env.app.version);
  
  // Use environment helpers
  if (isDevelopment()) {
    console.log('Running in development mode');
  }
  
  if (isProduction()) {
    console.log('Running in production mode');
  }
  
  if (isStaging()) {
    console.log('Running in staging mode');
  }
}

/**
 * Example: API configuration usage
 */
export function apiConfigurationExamples(): void {
  // Get API configuration
  const { api } = env;
  
  // Build API URLs
  const baseApiUrl = getApiUrl(); // e.g., "http://localhost:3000/v1"
  const usersEndpoint = getApiUrl('users'); // e.g., "http://localhost:3000/v1/users"
  const promptsEndpoint = getApiUrl('prompts'); // e.g., "http://localhost:3000/v1/prompts"
  
  console.log('API Base URL:', baseApiUrl);
  console.log('Users endpoint:', usersEndpoint);
  console.log('Prompts endpoint:', promptsEndpoint);
  
  // Access API settings
  console.log('API timeout:', api.timeout);
  console.log('API logging enabled:', api.enableLogging);
  console.log('Max retry attempts:', api.retry.maxAttempts);
}

/**
 * Example: Feature flags usage
 */
export function featureFlagsExamples(): void {
  // Check individual feature flags
  if (isFeatureEnabled('enableAnalytics')) {
    console.log('Analytics is enabled');
    // Initialize analytics service
  }
  
  if (isFeatureEnabled('enableDarkMode')) {
    console.log('Dark mode is available');
    // Show dark mode toggle in UI
  }
  
  if (isFeatureEnabled('enableExperimentalFeatures')) {
    console.log('Experimental features are enabled');
    // Show experimental UI elements
  }
  
  // Access all feature flags
  const { features } = env;
  console.log('All enabled features:', 
    Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature)
  );
}

/**
 * Example: Debug configuration usage
 */
export function debugConfigurationExamples(): void {
  const { debug } = env;
  
  // Check if debug mode is enabled
  if (debug.enabled) {
    console.log('Debug mode is enabled');
    console.log('Log level:', debug.logLevel);
    
    // Enable performance monitoring
    if (debug.enablePerformanceMonitoring) {
      console.log('Performance monitoring is enabled');
      // Initialize performance monitoring
    }
    
    // Enable error reporting
    if (debug.enableErrorReporting) {
      console.log('Error reporting is enabled');
      // Initialize error reporting service
    }
  }
  
  // Conditional logging based on log level
  function logDebug(message: string): void {
    if (debug.logLevel === 'debug') {
      console.debug(message);
    }
  }
  
  function logInfo(message: string): void {
    if (['debug', 'info'].includes(debug.logLevel)) {
      console.info(message);
    }
  }
  
  function logWarn(message: string): void {
    if (['debug', 'info', 'warn'].includes(debug.logLevel)) {
      console.warn(message);
    }
  }
  
  function logError(message: string): void {
    console.error(message); // Always log errors
  }
  
  // Usage examples
  logDebug('This is a debug message');
  logInfo('This is an info message');
  logWarn('This is a warning message');
  logError('This is an error message');
}

/**
 * Example: Environment-specific behavior
 */
export function environmentSpecificExamples(): void {
  switch (env.environment) {
    case 'development':
      console.log('Development-specific behavior');
      // Enable hot reloading, detailed logging, etc.
      break;
      
    case 'staging':
      console.log('Staging-specific behavior');
      // Enable limited analytics, staging-specific APIs, etc.
      break;
      
    case 'production':
      console.log('Production-specific behavior');
      // Enable full analytics, error reporting, performance monitoring, etc.
      break;
  }
  
  // Build mode specific behavior
  if (env.buildMode === 'production') {
    console.log('Production build optimizations enabled');
    // Enable service workers, caching, etc.
  }
}

/**
 * Example: HTTP client configuration
 */
export function httpClientConfiguration(): { defaultFetchOptions: RequestInit; retryConfig: { maxAttempts: number; baseDelay: number; maxDelay: number; backoffFactor: number; }; baseUrl: string; timeout: number; enableLogging: boolean; } {
  const { api } = env;
  
  // Example fetch configuration
  const defaultFetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Use configured timeout (note: AbortController needed for fetch timeout)
  };
  
  // Example retry logic configuration
  const retryConfig = {
    maxAttempts: api.retry.maxAttempts,
    baseDelay: api.retry.baseDelay,
    maxDelay: api.retry.maxDelay,
    backoffFactor: 2, // Exponential backoff
  };
  
  console.log('HTTP client configuration:', {
    baseUrl: api.baseUrl,
    timeout: api.timeout,
    retry: retryConfig,
    logging: api.enableLogging,
  });
  
  return {
    defaultFetchOptions,
    retryConfig,
    baseUrl: api.baseUrl,
    timeout: api.timeout,
    enableLogging: api.enableLogging,
  };
}

/**
 * Example: React component with environment configuration
 */
export function ReactComponentExample(): string {
  // This would be in a React component
  return `
    import React from 'react';
    import { env, isFeatureEnabled } from '@config/env';
    
    export const AppHeader: React.FC = () => {
      return (
        <header>
          <h1>{env.app.name}</h1>
          <span>v{env.app.version}</span>
          
          {isFeatureEnabled('enableDarkMode') && (
            <button>Toggle Dark Mode</button>
          )}
          
          {env.debug.enabled && (
            <div className="debug-info">
              <span>Environment: {env.environment}</span>
              <span>Build: {env.buildMode}</span>
            </div>
          )}
        </header>
      );
    };
  `;
}

/**
 * Example: Service configuration
 */
export function serviceConfigurationExample(): { analyticsConfig: { enabled: boolean; debugMode?: boolean; apiEndpoint?: string; sampleRate?: number; }; apiServiceConfig: { baseUrl: string; timeout: number; retryAttempts: number; enableLogging: boolean; requestInterceptors: string[]; responseInterceptors: string[]; }; } {
  const { api, features, debug } = env;
  
  // Analytics service configuration
  if (features.enableAnalytics) {
    const analyticsConfig = {
      enabled: true,
      debugMode: debug.enabled,
      apiEndpoint: getApiUrl('analytics'),
      sampleRate: env.environment === 'production' ? 0.1 : 1.0,
    };
    
    console.log('Analytics service config:', analyticsConfig);
  }
  
  // API service configuration
  const apiServiceConfig = {
    baseUrl: api.baseUrl,
    timeout: api.timeout,
    retryAttempts: api.retry.maxAttempts,
    enableLogging: api.enableLogging,
    requestInterceptors: debug.enabled ? ['logging', 'timing'] : [],
    responseInterceptors: debug.enabled ? ['logging', 'error-details'] : ['error-basic'],
  };
  
  console.log('API service config:', apiServiceConfig);
  
  return {
    analyticsConfig: features.enableAnalytics ? {
      enabled: true,
      debugMode: debug.enabled,
      apiEndpoint: getApiUrl('analytics'),
      sampleRate: env.environment === 'production' ? 0.1 : 1.0,
    } : { enabled: false },
    apiServiceConfig,
  };
}

/**
 * Example: Error handling with environment awareness
 */
export function errorHandlingExample(): { handleError: (error: Error, context?: string) => string; } {
  const { debug, environment } = env;
  
  function handleError(error: Error, context?: string): string {
    // Always log to console in development
    if (debug.enabled) {
      console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        context,
        environment,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Report to external service in staging/production
    if (debug.enableErrorReporting && environment !== 'development') {
      // Send to error reporting service
      console.log('Sending error to reporting service');
    }
    
    // Show user-friendly error message
    const userMessage = debug.enabled 
      ? `Error: ${error.message}` 
      : 'An unexpected error occurred. Please try again.';
    
    return userMessage;
  }
  
  return { handleError };
}

/**
 * Example: Performance monitoring setup
 */
export function performanceMonitoringExample(): { enabled: boolean; reportToAnalytics?: boolean; thresholds?: { FCP: number; LCP: number; FID: number; CLS: number; }; } {
  const { debug, features } = env;
  
  if (debug.enablePerformanceMonitoring) {
    console.log('Setting up performance monitoring');
    
    // Example: Web Vitals monitoring
    const performanceConfig = {
      enabled: true,
      reportToAnalytics: features.enableAnalytics,
      thresholds: {
        FCP: 2000, // First Contentful Paint
        LCP: 4000, // Largest Contentful Paint
        FID: 300,  // First Input Delay
        CLS: 0.25, // Cumulative Layout Shift
      },
    };
    
    console.log('Performance monitoring config:', performanceConfig);
    return performanceConfig;
  }
  
  return { enabled: false };
}

// Export all examples as a single object for easy access
export const configExamples = {
  basicUsage: basicUsageExamples,
  apiConfiguration: apiConfigurationExamples,
  featureFlags: featureFlagsExamples,
  debugConfiguration: debugConfigurationExamples,
  environmentSpecific: environmentSpecificExamples,
  httpClient: httpClientConfiguration,
  reactComponent: ReactComponentExample,
  serviceConfiguration: serviceConfigurationExample,
  errorHandling: errorHandlingExample,
  performanceMonitoring: performanceMonitoringExample,
};