/**
 * Environment Configuration Management
 * 
 * This module provides type-safe environment variable management for the FixYourPrompts
 * frontend application. It supports development, staging, and production environments
 * with validation and default values.
 * 
 * @module env
 * @version 1.0.0
 */

/**
 * Supported application environments
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Application build modes
 */
export type BuildMode = 'development' | 'production';

/**
 * Log levels for application logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Feature flags configuration interface
 */
export interface FeatureFlags {
  /** Enable advanced prompt analytics */
  enableAnalytics: boolean;
  /** Enable user feedback collection */
  enableFeedback: boolean;
  /** Enable experimental AI features */
  enableExperimentalFeatures: boolean;
  /** Enable real-time collaboration */
  enableCollaboration: boolean;
  /** Enable prompt sharing functionality */
  enableSharing: boolean;
  /** Enable dark mode toggle */
  enableDarkMode: boolean;
}

/**
 * API configuration interface
 */
export interface ApiConfig {
  /** Base URL for the main API */
  baseUrl: string;
  /** API version */
  version: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Enable request/response logging */
  enableLogging: boolean;
  /** Retry configuration */
  retry: {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Base delay between retries in milliseconds */
    baseDelay: number;
    /** Maximum delay between retries in milliseconds */
    maxDelay: number;
  };
}

/**
 * Debug settings interface
 */
export interface DebugConfig {
  /** Enable debug mode */
  enabled: boolean;
  /** Log level */
  logLevel: LogLevel;
  /** Enable React DevTools integration */
  enableReactDevTools: boolean;
  /** Enable Redux DevTools (if using Redux) */
  enableReduxDevTools: boolean;
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Enable error boundary reporting */
  enableErrorReporting: boolean;
}

/**
 * Application metadata interface
 */
export interface AppMetadata {
  /** Application name */
  name: string;
  /** Application version */
  version: string;
  /** Build timestamp */
  buildTime: string;
  /** Git commit hash */
  commitHash?: string;
  /** Git branch name */
  branchName?: string;
}

/**
 * Complete environment configuration interface
 */
export interface EnvConfig {
  /** Current environment */
  environment: Environment;
  /** Build mode */
  buildMode: BuildMode;
  /** Base URL for the application */
  appUrl: string;
  /** API configuration */
  api: ApiConfig;
  /** Feature flags */
  features: FeatureFlags;
  /** Debug configuration */
  debug: DebugConfig;
  /** Application metadata */
  app: AppMetadata;
}

/**
 * Environment variable validation error
 */
export class EnvValidationError extends Error {
  constructor(variable: string, reason: string) {
    super(`Environment variable validation failed for '${variable}': ${reason}`);
    this.name = 'EnvValidationError';
  }
}

/**
 * Gets an environment variable value with validation
 * 
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @param required - Whether the variable is required
 * @returns The environment variable value
 * @throws {EnvValidationError} When a required variable is missing
 */
function getEnvVar(key: string, defaultValue?: string, required: boolean = false): string {
  const value = import.meta.env[key];
  
  if (required && (value === undefined || value === '')) {
    throw new EnvValidationError(key, 'Required environment variable is missing or empty');
  }
  
  return value || defaultValue || '';
}

/**
 * Gets a boolean environment variable value
 * 
 * @param key - Environment variable key
 * @param defaultValue - Default boolean value
 * @returns The boolean value
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  if (!value) {return defaultValue;}
  
  const lowerValue = value.toLowerCase();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
}

/**
 * Gets a numeric environment variable value
 * 
 * @param key - Environment variable key
 * @param defaultValue - Default numeric value
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns The numeric value
 * @throws {EnvValidationError} When the value is not a valid number or out of range
 */
function getNumericEnvVar(
  key: string, 
  defaultValue: number, 
  min?: number, 
  max?: number
): number {
  const value = getEnvVar(key);
  if (!value) {return defaultValue;}
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    throw new EnvValidationError(key, 'Value must be a valid number');
  }
  
  if (min !== undefined && numValue < min) {
    throw new EnvValidationError(key, `Value must be at least ${min}`);
  }
  
  if (max !== undefined && numValue > max) {
    throw new EnvValidationError(key, `Value must be at most ${max}`);
  }
  
  return numValue;
}

/**
 * Detects the current environment based on various indicators
 * 
 * @returns The detected environment
 */
function detectEnvironment(): Environment {
  // Check explicit environment variable first
  const envVar = getEnvVar('VITE_APP_ENV') || getEnvVar('NODE_ENV');
  
  if (envVar === 'production') {return 'production';}
  if (envVar === 'staging') {return 'staging';}
  if (envVar === 'development') {return 'development';}
  
  // Detect based on build mode
  if (import.meta.env.PROD) {return 'production';}
  if (import.meta.env.DEV) {return 'development';}
  
  // Default fallback
  return 'development';
}

/**
 * Gets the build mode from environment
 * 
 * @returns The build mode
 */
function getBuildMode(): BuildMode {
  return import.meta.env.PROD ? 'production' : 'development';
}

/**
 * Validates a URL string
 * 
 * @param url - URL to validate
 * @param variableName - Name of the environment variable for error reporting
 * @returns The validated URL
 * @throws {EnvValidationError} When the URL is invalid
 */
function validateUrl(url: string, variableName: string): string {
  if (!url) {
    throw new EnvValidationError(variableName, 'URL cannot be empty');
  }
  
  try {
    new URL(url);
    return url;
  } catch {
    throw new EnvValidationError(variableName, 'Invalid URL format');
  }
}

/**
 * Creates the API configuration based on environment variables
 * 
 * @param environment - Current environment
 * @returns API configuration object
 */
function createApiConfig(environment: Environment): ApiConfig {
  const baseUrl = (() => {
    switch (environment) {
      case 'production':
        return validateUrl(
          getEnvVar('VITE_API_BASE_URL', 'https://api.fixyourprompts.com'),
          'VITE_API_BASE_URL'
        );
      case 'staging':
        return validateUrl(
          getEnvVar('VITE_API_BASE_URL', 'https://staging-api.fixyourprompts.com'),
          'VITE_API_BASE_URL'
        );
      default:
        return validateUrl(
          getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
          'VITE_API_BASE_URL'
        );
    }
  })();

  return {
    baseUrl,
    version: getEnvVar('VITE_API_VERSION', 'v1'),
    timeout: getNumericEnvVar('VITE_API_TIMEOUT', 10000, 1000, 60000),
    enableLogging: getBooleanEnvVar('VITE_API_LOGGING', environment === 'development'),
    retry: {
      maxAttempts: getNumericEnvVar('VITE_API_RETRY_MAX_ATTEMPTS', 3, 0, 10),
      baseDelay: getNumericEnvVar('VITE_API_RETRY_BASE_DELAY', 1000, 100, 10000),
      maxDelay: getNumericEnvVar('VITE_API_RETRY_MAX_DELAY', 10000, 1000, 60000),
    },
  };
}

/**
 * Creates feature flags configuration based on environment variables
 * 
 * @param environment - Current environment
 * @returns Feature flags configuration object
 */
function createFeatureFlags(environment: Environment): FeatureFlags {
  const isDevelopment = environment === 'development';
  
  return {
    enableAnalytics: getBooleanEnvVar('VITE_FEATURE_ANALYTICS', environment === 'production'),
    enableFeedback: getBooleanEnvVar('VITE_FEATURE_FEEDBACK', true),
    enableExperimentalFeatures: getBooleanEnvVar('VITE_FEATURE_EXPERIMENTAL', isDevelopment),
    enableCollaboration: getBooleanEnvVar('VITE_FEATURE_COLLABORATION', false),
    enableSharing: getBooleanEnvVar('VITE_FEATURE_SHARING', environment !== 'development'),
    enableDarkMode: getBooleanEnvVar('VITE_FEATURE_DARK_MODE', true),
  };
}

/**
 * Creates debug configuration based on environment variables
 * 
 * @param environment - Current environment
 * @returns Debug configuration object
 */
function createDebugConfig(environment: Environment): DebugConfig {
  const isDevelopment = environment === 'development';
  const defaultLogLevel: LogLevel = isDevelopment ? 'debug' : 'warn';
  
  const logLevel = (() => {
    const level = getEnvVar('VITE_LOG_LEVEL', defaultLogLevel) as LogLevel;
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    
    if (!validLevels.includes(level)) {
      console.warn(`Invalid log level '${level}', using default '${defaultLogLevel}'`);
      return defaultLogLevel;
    }
    
    return level;
  })();

  return {
    enabled: getBooleanEnvVar('VITE_DEBUG_ENABLED', isDevelopment),
    logLevel,
    enableReactDevTools: getBooleanEnvVar('VITE_DEBUG_REACT_DEVTOOLS', isDevelopment),
    enableReduxDevTools: getBooleanEnvVar('VITE_DEBUG_REDUX_DEVTOOLS', isDevelopment),
    enablePerformanceMonitoring: getBooleanEnvVar('VITE_DEBUG_PERFORMANCE', isDevelopment),
    enableErrorReporting: getBooleanEnvVar('VITE_DEBUG_ERROR_REPORTING', environment !== 'development'),
  };
}

/**
 * Creates application metadata configuration
 * 
 * @returns Application metadata object
 */
function createAppMetadata(): AppMetadata {
  return {
    name: getEnvVar('VITE_APP_NAME', 'FixYourPrompts'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    buildTime: getEnvVar('VITE_BUILD_TIME', new Date().toISOString()),
    commitHash: getEnvVar('VITE_GIT_COMMIT_HASH'),
    branchName: getEnvVar('VITE_GIT_BRANCH_NAME'),
  };
}

/**
 * Creates the complete environment configuration
 * 
 * @returns Complete environment configuration object
 * @throws {EnvValidationError} When validation fails
 */
function createEnvConfig(): EnvConfig {
  const environment = detectEnvironment();
  const buildMode = getBuildMode();
  
  // Determine application URL based on environment
  const appUrl = (() => {
    switch (environment) {
      case 'production':
        return validateUrl(
          getEnvVar('VITE_APP_URL', 'https://fixyourprompts.com'),
          'VITE_APP_URL'
        );
      case 'staging':
        return validateUrl(
          getEnvVar('VITE_APP_URL', 'https://staging.fixyourprompts.com'),
          'VITE_APP_URL'
        );
      default:
        return validateUrl(
          getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
          'VITE_APP_URL'
        );
    }
  })();

  const config: EnvConfig = {
    environment,
    buildMode,
    appUrl,
    api: createApiConfig(environment),
    features: createFeatureFlags(environment),
    debug: createDebugConfig(environment),
    app: createAppMetadata(),
  };

  // Log configuration in development mode (non-sensitive info only)
  if (config.debug.enabled && config.environment === 'development') {
    console.group('🔧 Environment Configuration');
    console.log('Environment:', config.environment);
    console.log('Build Mode:', config.buildMode);
    console.log('App URL:', config.appUrl);
    console.log('API Base URL:', config.api.baseUrl);
    console.log('Features:', Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature)
    );
    console.log('Debug Level:', config.debug.logLevel);
    console.groupEnd();
  }

  return config;
}

/**
 * Validates the complete environment configuration
 * 
 * @param config - Configuration object to validate
 * @throws {EnvValidationError} When validation fails
 */
function validateEnvConfig(config: EnvConfig): void {
  // Validate required URLs
  validateUrl(config.appUrl, 'appUrl');
  validateUrl(config.api.baseUrl, 'api.baseUrl');
  
  // Validate numeric values
  if (config.api.timeout < 1000) {
    throw new EnvValidationError('api.timeout', 'Timeout must be at least 1000ms');
  }
  
  if (config.api.retry.maxAttempts < 0) {
    throw new EnvValidationError('api.retry.maxAttempts', 'Max attempts cannot be negative');
  }
  
  // Validate app metadata
  if (!config.app.name.trim()) {
    throw new EnvValidationError('app.name', 'Application name cannot be empty');
  }
  
  if (!config.app.version.trim()) {
    throw new EnvValidationError('app.version', 'Application version cannot be empty');
  }
}

// Create and validate the environment configuration
let envConfig: EnvConfig;

try {
  envConfig = createEnvConfig();
  validateEnvConfig(envConfig);
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error('❌ Environment Configuration Error:', error.message);
    
    // In production, we should fail fast
    if (import.meta.env.PROD) {
      throw error;
    }
    
    // In development, we can provide more helpful error information
    console.error('🔧 Please check your environment variables and try again.');
    console.error('💡 Refer to the .env.example file for required variables.');
  }
  
  throw error;
}

/**
 * Typed environment configuration object
 * 
 * This is the main export that should be used throughout the application
 * to access environment-specific settings.
 * 
 * @example
 * ```typescript
 * import { env } from '@/config/env';
 * 
 * // Access API configuration
 * const apiUrl = `${env.api.baseUrl}/${env.api.version}`;
 * 
 * // Check feature flags
 * if (env.features.enableAnalytics) {
 *   // Initialize analytics
 * }
 * 
 * // Use debug settings
 * if (env.debug.enabled) {
 *   console.log('Debug mode is enabled');
 * }
 * ```
 */
export const env = envConfig;

/**
 * Utility function to check if the app is running in development mode
 * 
 * @returns True if in development mode
 */
export const isDevelopment = (): boolean => env.environment === 'development';

/**
 * Utility function to check if the app is running in production mode
 * 
 * @returns True if in production mode
 */
export const isProduction = (): boolean => env.environment === 'production';

/**
 * Utility function to check if the app is running in staging mode
 * 
 * @returns True if in staging mode
 */
export const isStaging = (): boolean => env.environment === 'staging';

/**
 * Utility function to get the full API URL with version
 * 
 * @param endpoint - API endpoint path
 * @returns Complete API URL
 */
export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = env.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const version = env.api.version;
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  
  return cleanEndpoint 
    ? `${baseUrl}/${version}/${cleanEndpoint}`
    : `${baseUrl}/${version}`;
};

/**
 * Utility function to check if a feature is enabled
 * 
 * @param feature - Feature flag key
 * @returns True if the feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return env.features[feature];
};

/**
 * Default export for convenience
 */
export default env;