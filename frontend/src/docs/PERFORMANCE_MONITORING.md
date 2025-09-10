# Performance Monitoring and Error Tracking

This document describes the comprehensive performance monitoring and error tracking system implemented for the FixYourPrompts application.

## Overview

The performance monitoring system provides:

- **React DevTools Profiler integration** for component performance tracking
- **Core Web Vitals monitoring** (LCP, FID, CLS, FCP, TTFB)
- **Component render time tracking** with automatic slow render detection
- **Network request performance monitoring** with retry tracking
- **Memory usage monitoring** with automatic alerts for high usage
- **Error boundaries with enhanced error tracking**
- **Performance budget monitoring** with violation alerts
- **Client-side error logging** with categorization and context

## Components

### Core Utilities

#### `src/utils/performance.ts`
- **PerformanceMonitor class**: Singleton for centralized performance tracking
- **Core Web Vitals integration**: Automatic LCP, FID, CLS, FCP, TTFB tracking
- **Network monitoring**: Fetch and XMLHttpRequest interceptors
- **Resource timing**: Large resource detection and loading performance
- **Performance budgets**: Configurable thresholds with violation tracking

#### `src/utils/errorTracking.ts`
- **ErrorTracker class**: Comprehensive error tracking and categorization
- **Global error handlers**: JavaScript errors, unhandled promise rejections
- **Component error tracking**: React error boundary integration
- **Network error tracking**: Request failure tracking with context
- **Security error tracking**: CSP violation monitoring

### React Hooks

#### `src/hooks/usePerformanceMonitoring.ts`
- **useComponentPerformance**: Track individual component render times
- **useWebVitals**: Monitor Core Web Vitals with status indicators
- **useNetworkPerformance**: Track network request metrics and failures
- **usePerformanceBudgets**: Monitor budget violations with alerts
- **useMemoryMonitoring**: Track memory usage with warnings
- **usePerformanceAlerts**: Centralized alert management system

### UI Components

#### `src/components/PerformanceMonitor/`
- **Comprehensive dashboard**: Multi-tab interface for all performance data
- **Real-time metrics**: Live updating performance indicators
- **Interactive charts**: Visual representation of performance trends
- **Export functionality**: Download performance reports

#### `src/components/PerformanceWidget/`
- **Compact floating widget**: Quick access to key metrics
- **Development-focused**: Automatically enabled in development mode
- **Expandable interface**: Quick overview with detailed drill-down

#### Enhanced ErrorBoundary
- **Error ID tracking**: Unique identifiers for error correlation
- **Retry counting**: Track repeated failures
- **Context preservation**: Maintain state information across errors
- **Performance profiling**: Monitor error boundary render performance

### Higher-Order Components

#### `src/utils/withPerformanceMonitoring.tsx`
- **withPerformanceMonitoring**: Add profiling to any component
- **withErrorBoundary**: Wrap components with enhanced error boundaries
- **withMonitoring**: Combined performance and error monitoring
- **createMonitoredLazyComponent**: Enhanced lazy loading with monitoring

## Features

### Development Tools

#### Keyboard Shortcuts
- **Ctrl/Cmd + Shift + P**: Toggle performance widget visibility

#### Automatic Monitoring
- Component render times automatically tracked
- Slow renders (>16.67ms) flagged with warnings
- Large resources (>100KB) automatically detected
- Memory usage monitored every 5 seconds

### Performance Budgets

Default budgets configured for Core Web Vitals:
- **LCP**: ≤2.5s (good), ≤4.0s (needs improvement)
- **FID**: ≤100ms (good), ≤300ms (needs improvement)  
- **CLS**: ≤0.1 (good), ≤0.25 (needs improvement)
- **FCP**: ≤1.8s (good), ≤3.0s (needs improvement)
- **TTFB**: ≤800ms (good), ≤1.8s (needs improvement)

### Error Categorization

Errors are automatically categorized by type:
- **JavaScript**: Runtime errors, reference errors, type errors
- **Promise Rejection**: Unhandled async operation failures
- **Network**: Request failures, timeout errors
- **Component**: React component lifecycle errors
- **Chunk Load**: Dynamic import and lazy loading failures
- **Resource Load**: CSS, image, font loading failures
- **Security**: CSP violations, XSS attempt detection

### Severity Levels

Errors are classified by severity:
- **Critical**: Chunk load failures, out of memory errors
- **High**: Uncaught exceptions, component errors
- **Medium**: Network errors, validation failures
- **Low**: Warnings, deprecated API usage

## Integration

### Main Application
The monitoring system is integrated at multiple levels:

1. **Entry Point** (`main.tsx`): Global initialization and session management
2. **App Component** (`App.tsx`): React Profiler wrapper and widget integration  
3. **Error Boundaries**: Enhanced error tracking and recovery
4. **Lazy Components**: Monitored lazy loading with retry logic

### Production Considerations

- **Performance widget disabled** by default in production
- **Console logging minimized** in production builds
- **Error reporting hooks** available for external services
- **Bundle size impact**: ~15KB compressed for full monitoring suite

## Usage Examples

### Basic Component Monitoring

```typescript
import { useComponentPerformance } from '@/hooks/usePerformanceMonitoring';

function MyComponent() {
  const { measureRender, measureRenderAsync } = useComponentPerformance('MyComponent');
  
  const handleClick = async () => {
    await measureRenderAsync('user-action', async () => {
      // Expensive async operation
    });
  };

  return <div onClick={handleClick}>Content</div>;
}
```

### HOC Usage

```typescript
import { withMonitoring } from '@/utils/withPerformanceMonitoring';

const MonitoredComponent = withMonitoring(MyComponent, 'MyComponent', {
  enableProfiling: true,
  trackUserInteractions: true
});
```

### Custom Error Tracking

```typescript
import { errorTracker } from '@/utils/errorTracking';

try {
  // Risky operation
} catch (error) {
  errorTracker.trackUserActionError('custom-operation', error, {
    userId: user.id,
    context: additionalData
  });
}
```

### Performance Alerts

```typescript
import { usePerformanceAlerts } from '@/hooks/usePerformanceMonitoring';

function AlertsDisplay() {
  const { alerts, dismissAlert } = usePerformanceAlerts();
  
  return (
    <div>
      {alerts.map(alert => (
        <div key={alert.id} className={`alert-${alert.severity}`}>
          {alert.message}
          <button onClick={() => dismissAlert(alert.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}
```

## Configuration

### Environment Variables
- `NODE_ENV`: Controls development features and logging
- `VITE_PERFORMANCE_MONITORING`: Enable/disable monitoring (default: true in dev)

### Vite Configuration
The monitoring system integrates with Vite's build optimization:
- Source maps for error tracking
- Chunk analysis for performance insights
- Bundle size monitoring integration

## Monitoring Data

### Metrics Collected
- Component render times and counts
- Network request durations and status codes
- Memory usage and garbage collection events
- User interaction timing
- Bundle loading performance
- Core Web Vitals measurements

### Data Retention
- In-memory storage for development
- Configurable limits (default: 1000 metrics, 100 errors)
- Session-based data with automatic cleanup

## Best Practices

1. **Use meaningful component names** for better tracking granularity
2. **Wrap async operations** with performance timing utilities
3. **Monitor memory usage** for components with large data sets
4. **Set appropriate performance budgets** based on user requirements
5. **Review alerts regularly** to identify performance regressions
6. **Use error contexts** to provide debugging information

## Future Enhancements

- Real User Monitoring (RUM) integration
- Historical performance data persistence
- Advanced performance analytics
- Automated performance regression detection
- Integration with external monitoring services (Sentry, DataDog, etc.)
- Custom performance metrics and dashboards

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Check for memory leaks in event listeners
2. **Slow Renders**: Use React DevTools Profiler for detailed analysis  
3. **Network Errors**: Review error contexts for debugging information
4. **Bundle Loading Issues**: Check network conditions and CDN availability

### Debugging Tools

- Browser DevTools Performance tab
- React DevTools Profiler
- Network tab for request analysis
- Console logging in development mode
- Performance widget for real-time monitoring

---

*For technical support or feature requests, please refer to the project documentation or create an issue in the repository.*