/**
 * Environment Configuration Module
 * 
 * This module provides a clean, type-safe API for accessing environment
 * configuration throughout the FixYourPrompts frontend application.
 * 
 * @module config
 * @example
 * ```typescript
 * import { env, isFeatureEnabled, getApiUrl } from '@config';
 * 
 * // Access configuration
 * console.log('Environment:', env.environment);
 * 
 * // Check feature flags
 * if (isFeatureEnabled('enableAnalytics')) {
 *   // Initialize analytics
 * }
 * 
 * // Build API URLs
 * const apiUrl = getApiUrl('users');
 * ```
 */

// Re-export everything from the main env module
export {
  // Main configuration object
  env,
  
  // Type definitions
  type Environment,
  type BuildMode,
  type LogLevel,
  type FeatureFlags,
  type ApiConfig,
  type DebugConfig,
  type AppMetadata,
  type EnvConfig,
  
  // Environment helpers
  isDevelopment,
  isProduction,
  isStaging,
  
  // Utility functions
  getApiUrl,
  isFeatureEnabled,
  
  // Error class
  EnvValidationError,
} from './env';

// Default export for convenience
export { default } from './env';

/**
 * Re-export the main configuration as a named export for different import styles
 */
export { env as config } from './env';