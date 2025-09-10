# Environment Configuration

This directory contains the environment configuration management system for the FixYourPrompts frontend application.

## Overview

The environment configuration system provides:
- Type-safe environment variable management
- Support for development, staging, and production environments
- Validation for required environment variables
- Default values where appropriate
- Feature flags for conditional functionality
- Debug settings for development and troubleshooting

## Files

- `env.ts` - Main environment configuration module
- `usage-examples.ts` - Comprehensive usage examples and best practices
- `README.md` - This documentation file

## Quick Start

```typescript
import { env, isFeatureEnabled, getApiUrl } from '@config/env';

// Check current environment
console.log('Environment:', env.environment);

// Get API URL
const apiUrl = getApiUrl('users');

// Check feature flags
if (isFeatureEnabled('enableAnalytics')) {
  // Initialize analytics
}

// Access debug settings
if (env.debug.enabled) {
  console.log('Debug mode is on');
}
```

## Environment Variables

All environment variables are prefixed with `VITE_` to be accessible in the browser. See `.env.example` for a complete list of available variables.

### Core Variables

- `VITE_APP_ENV` - Application environment (development, staging, production)
- `VITE_APP_URL` - Application base URL
- `VITE_API_BASE_URL` - API server base URL
- `VITE_API_VERSION` - API version

### Feature Flags

- `VITE_FEATURE_ANALYTICS` - Enable analytics tracking
- `VITE_FEATURE_DARK_MODE` - Enable dark mode toggle
- `VITE_FEATURE_EXPERIMENTAL` - Enable experimental features
- `VITE_FEATURE_SHARING` - Enable prompt sharing
- `VITE_FEATURE_COLLABORATION` - Enable real-time collaboration
- `VITE_FEATURE_FEEDBACK` - Enable user feedback collection

### Debug Settings

- `VITE_DEBUG_ENABLED` - Enable debug mode
- `VITE_LOG_LEVEL` - Logging level (debug, info, warn, error)
- `VITE_DEBUG_PERFORMANCE` - Enable performance monitoring
- `VITE_DEBUG_ERROR_REPORTING` - Enable error reporting

## Configuration Structure

The configuration is organized into several main sections:

### Environment (`env.environment`)
Current application environment with automatic detection based on `NODE_ENV` and other indicators.

### API Configuration (`env.api`)
- Base URL and version
- Timeout and retry settings
- Request/response logging options

### Feature Flags (`env.features`)
Boolean flags for enabling/disabling features across different environments.

### Debug Settings (`env.debug`)
Development and debugging options including logging levels and development tools integration.

### App Metadata (`env.app`)
Application information like name, version, and build details.

## Usage Patterns

### Conditional Features

```typescript
import { isFeatureEnabled } from '@config/env';

// Component with conditional feature
export const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      {isFeatureEnabled('enableAnalytics') && <AnalyticsWidget />}
      {isFeatureEnabled('enableDarkMode') && <DarkModeToggle />}
    </div>
  );
};
```

### API Calls

```typescript
import { getApiUrl, env } from '@config/env';

// Make API request with proper configuration
const fetchUsers = async () => {
  const response = await fetch(getApiUrl('users'), {
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(env.api.timeout),
  });
  
  if (env.api.enableLogging) {
    console.log('API Response:', response.status);
  }
  
  return response.json();
};
```

### Environment-Specific Behavior

```typescript
import { env, isDevelopment, isProduction } from '@config/env';

// Different behavior per environment
const initializeApp = () => {
  if (isDevelopment()) {
    console.log('Development mode - enabling debug features');
    // Enable hot reloading, detailed logging, etc.
  }
  
  if (isProduction()) {
    console.log('Production mode - enabling optimizations');
    // Enable service workers, analytics, error reporting, etc.
  }
  
  // Use environment-specific configuration
  if (env.debug.enablePerformanceMonitoring) {
    // Initialize performance monitoring
  }
};
```

### Error Handling

```typescript
import { env } from '@config/env';

const handleError = (error: Error) => {
  // Log detailed errors in development
  if (env.debug.enabled) {
    console.error('Detailed error:', error.stack);
  }
  
  // Report errors in production
  if (env.debug.enableErrorReporting && env.environment === 'production') {
    // Send to error reporting service
  }
  
  // Show user-friendly message
  const message = env.debug.enabled 
    ? error.message 
    : 'An error occurred. Please try again.';
    
  return message;
};
```

## Environment Setup

### Development

1. Copy `.env.example` to `.env.local`
2. Set `VITE_APP_ENV=development`
3. Configure local API URL: `VITE_API_BASE_URL=http://localhost:3000`
4. Enable debug features: `VITE_DEBUG_ENABLED=true`

### Staging

1. Set `VITE_APP_ENV=staging`
2. Use staging API: `VITE_API_BASE_URL=https://staging-api.fixyourprompts.com`
3. Enable selected features for testing
4. Disable debug mode: `VITE_DEBUG_ENABLED=false`

### Production

1. Set `VITE_APP_ENV=production`
2. Use production API: `VITE_API_BASE_URL=https://api.fixyourprompts.com`
3. Enable analytics and error reporting
4. Disable experimental features

## Validation

The configuration system includes comprehensive validation:

- Required environment variables are checked at startup
- URLs are validated for proper format
- Numeric values are range-checked
- Invalid values trigger helpful error messages

## TypeScript Support

All configuration values are fully typed with TypeScript interfaces:

- `Environment` - Environment type union
- `FeatureFlags` - Feature flag configuration
- `ApiConfig` - API configuration
- `DebugConfig` - Debug settings
- `AppMetadata` - Application metadata
- `EnvConfig` - Complete configuration

## Best Practices

1. **Use helper functions**: Prefer `isFeatureEnabled()` over direct property access
2. **Environment checks**: Use `isDevelopment()`, `isProduction()`, etc.
3. **API URLs**: Always use `getApiUrl()` for consistent URL building
4. **Error handling**: Check debug settings before logging sensitive information
5. **Feature flags**: Use feature flags for gradual rollouts and A/B testing
6. **Validation**: Let the system validate configuration at startup
7. **Documentation**: Keep environment variable documentation up to date

## Troubleshooting

### Configuration Errors

If you see environment validation errors:

1. Check that all required variables are set
2. Verify variable names are correctly prefixed with `VITE_`
3. Ensure URLs are properly formatted
4. Check numeric values are within valid ranges

### TypeScript Errors

If TypeScript doesn't recognize the `@config` import:

1. Ensure `tsconfig.app.json` includes the path mapping
2. Restart your TypeScript language server
3. Check that the import path is correct

### Runtime Issues

If configuration values aren't loading:

1. Verify environment variables are properly prefixed with `VITE_`
2. Check that `.env.local` exists and contains the required variables
3. Restart the development server after changing environment variables
4. Check the browser console for validation error messages