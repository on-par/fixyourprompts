# Bundle Analysis and Optimization Guide

This comprehensive guide covers the bundle analysis and optimization tools implemented in this project. Use these tools to monitor, analyze, and optimize your application's bundle size and performance.

## Quick Start

```bash
# Build and analyze your bundle
npm run build:analyze

# Generate detailed bundle statistics
npm run bundle:stats

# Check bundle size limits
npm run bundle:size

# Monitor bundle changes over time
npm run bundle:monitor

# Check performance budgets
npm run performance:budget

# Generate visual bundle analysis
npm run bundle:visualize
```

## Available Scripts

### Core Analysis Scripts

| Script | Description | Use Case |
|--------|-------------|----------|
| `npm run build:analyze` | Build with bundle analysis enabled | One-time analysis |
| `npm run bundle:stats` | Generate detailed statistics | Understanding bundle composition |
| `npm run bundle:size` | Check size limits | CI/CD validation |
| `npm run bundle:monitor` | Track changes over time | Development monitoring |
| `npm run performance:budget` | Check performance targets | Performance validation |
| `npm run bundle:visualize` | Visual treemap analysis | Deep dive investigation |

### Specialized Scripts

| Script | Description | Output |
|--------|-------------|--------|
| `npm run size:check` | Bundlesize validation | Pass/fail for CI |
| `npm run size:limit` | Size-limit checks | Detailed size analysis |
| `npm run bundle:report` | Complete analysis report | Combined insights |

## Tools and Configuration

### 1. Rollup Plugin Visualizer

**Purpose**: Visual analysis of bundle composition
**Configuration**: `vite.config.ts`
**Output**: `dist/stats.html` (interactive treemap)

```bash
# Automatic during build with ANALYZE=true
ANALYZE=true npm run build

# Manual generation
npm run bundle:visualize
```

**Features**:
- Interactive treemap visualization
- Gzip and Brotli size analysis
- Module dependency tracking
- Export filtering and search

### 2. Bundle Statistics Analyzer

**Purpose**: Detailed programmatic analysis
**Script**: `scripts/bundle-stats.js`
**Output**: Console report + `dist/bundle-stats.json`

```bash
npm run bundle:stats
```

**Metrics Provided**:
- File-by-file size breakdown
- Compression ratios
- Performance insights
- Load time estimates
- Optimization recommendations

### 3. Bundle Size Checker

**Purpose**: Validate against size limits
**Script**: `scripts/bundle-size-check.js`
**Output**: Pass/fail with recommendations

```bash
npm run bundle:size
```

**Validation Levels**:
- ✅ **Passed**: Within limits
- ⚠️ **Warning**: Approaching limits (80%+)
- ❌ **Failed**: Exceeds limits

### 4. Bundle Monitor

**Purpose**: Track changes over time
**Script**: `scripts/bundle-monitor.js`
**Output**: Historical analysis + trend data

```bash
npm run bundle:monitor
```

**Tracking Features**:
- Size evolution over builds
- Regression detection
- Git integration
- Historical trends (50 builds)

### 5. Performance Budget

**Purpose**: Real-world performance validation
**Script**: `scripts/performance-budget.js`
**Output**: Performance compliance report

```bash
npm run performance:budget
```

**Metrics Checked**:
- Load time targets (3G/4G/Broadband)
- JavaScript parse time
- Bundle size limits
- Performance metrics (FCP, LCP estimates)

## Size Limits and Budgets

### Bundle Size Configuration

Default limits (can be customized in `package.json`):

```json
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "250 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/*.css", 
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ],
  "size-limit": [
    {
      "name": "Main Bundle",
      "path": "dist/assets/index-*.js",
      "limit": "250 kB",
      "gzip": true
    }
  ]
}
```

### Performance Budget Configuration

Add to `package.json` for custom targets:

```json
{
  "performanceBudget": {
    "loadTime": {
      "3G": 3.0,
      "4G": 1.5,
      "broadband": 1.0
    },
    "bundleSize": {
      "initial": 200000,
      "total": 500000,
      "javascript": 300000,
      "css": 50000
    },
    "metrics": {
      "fcp": 1.8,
      "lcp": 2.5,
      "fid": 100,
      "cls": 0.1
    }
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Bundle Analysis
on: [push, pull_request]

jobs:
  bundle-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Check bundle size
        run: npm run bundle:size
        
      - name: Performance budget
        run: npm run performance:budget
        
      - name: Monitor bundle changes
        run: npm run bundle:monitor
        
      - name: Upload bundle analysis
        if: github.event_name == 'pull_request'
        run: |
          npm run bundle:stats
          # Upload reports to PR comments or artifacts
```

### Pre-commit Integration

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: bundle-size-check
        name: Bundle Size Check
        entry: npm run bundle:size
        language: system
        pass_filenames: false
```

## Optimization Strategies

### 1. Code Splitting

#### Dynamic Imports
```javascript
// Instead of static imports
import HeavyComponent from './HeavyComponent';

// Use dynamic imports
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

#### Route-based Splitting
```javascript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Tree Shaking

#### Optimize Library Imports
```javascript
// Avoid full library imports
import * as _ from 'lodash';

// Import only needed functions
import { debounce, throttle } from 'lodash';

// Or use individual packages
import debounce from 'lodash.debounce';
```

#### ES Module Compatibility
```json
{
  "sideEffects": false,
  "module": "dist/index.esm.js"
}
```

### 3. Bundle Optimization

#### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-vendor': ['@mui/material', '@emotion/react']
        }
      }
    }
  }
});
```

#### Asset Optimization
```javascript
// Optimize images
import imageUrl from './image.png?url';
import imageWebP from './image.png?webp';

// Inline small assets
import iconDataUrl from './icon.svg?inline';
```

### 4. Performance Monitoring

#### Runtime Bundle Analysis
```javascript
// Add to your app for runtime analysis
if (import.meta.env.DEV) {
  import('./debug/bundle-analyzer').then(({ BundleAnalyzer }) => {
    new BundleAnalyzer().start();
  });
}
```

#### Performance Metrics
```javascript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Best Practices

### Development Workflow

1. **Regular Monitoring**: Run `npm run bundle:monitor` after significant changes
2. **Size Validation**: Always run `npm run bundle:size` before commits
3. **Performance Checks**: Use `npm run performance:budget` for feature releases
4. **Visual Analysis**: Use `npm run bundle:visualize` for deep investigations

### Optimization Checklist

- [ ] Enable tree shaking for all dependencies
- [ ] Implement code splitting for routes
- [ ] Optimize third-party libraries
- [ ] Use dynamic imports for heavy components
- [ ] Configure proper caching headers
- [ ] Implement service worker for caching
- [ ] Optimize images and assets
- [ ] Remove unused dependencies

### Performance Targets

#### Bundle Sizes (Gzipped)
- **Initial Bundle**: < 200KB
- **Total JavaScript**: < 300KB
- **Total CSS**: < 50KB
- **Total Bundle**: < 500KB

#### Load Times
- **3G Connection**: < 3 seconds
- **4G Connection**: < 1.5 seconds
- **Broadband**: < 1 second

#### Core Web Vitals
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## Troubleshooting

### Common Issues

#### Large Bundle Size
1. Run `npm run bundle:visualize` to identify heavy modules
2. Check for duplicate dependencies
3. Implement code splitting
4. Audit unused dependencies

#### Slow Load Times
1. Enable compression (Gzip/Brotli)
2. Implement resource hints (preload, prefetch)
3. Use CDN for static assets
4. Optimize critical rendering path

#### Bundle Analysis Failures
1. Ensure build completed successfully
2. Check `dist/` directory exists
3. Verify Node.js version compatibility
4. Clear cache with `npm run test:clear`

### Debug Mode

Enable detailed logging:

```bash
# Enable debug output
DEBUG=bundle:* npm run bundle:stats

# Verbose analysis
npm run bundle:stats -- --verbose
```

### Report Issues

When reporting bundle analysis issues, include:

1. Build output and error messages
2. `package.json` dependencies
3. Bundle analysis reports (`dist/*.json`)
4. Environment information (Node.js, npm versions)

## Advanced Configuration

### Custom Thresholds

Modify thresholds in individual scripts or package.json:

```javascript
// scripts/bundle-size-check.js
const customConfig = {
  javascript: { limit: 300 * 1024, warning: 250 * 1024 },
  css: { limit: 75 * 1024, warning: 60 * 1024 }
};
```

### Integration with Monitoring Services

```javascript
// Send metrics to monitoring service
const metrics = await analyzer.getMetrics();
await sendToDatadog(metrics);
await sendToNewRelic(metrics);
```

### Custom Analysis Scripts

Create project-specific analyzers:

```javascript
// scripts/custom-analyzer.js
import BundleStatsAnalyzer from './bundle-stats.js';

class CustomAnalyzer extends BundleStatsAnalyzer {
  // Add custom analysis logic
  analyzeFeatureFlags() {
    // Custom analysis for feature flags
  }
}
```

## Resources

### Tools
- [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Size Limit](https://github.com/ai/size-limit)
- [Bundlephobia](https://bundlephobia.com/)

### Performance
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/vitals/#core-web-vitals)
- [Performance Budgets](https://web.dev/performance-budgets-101/)
- [Loading Performance](https://web.dev/fast/)

### Documentation
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React Code Splitting](https://reactjs.org/docs/code-splitting.html)
- [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)

---

**Last Updated**: $(date)
**Version**: 1.0.0

For questions or improvements to this guide, please open an issue or submit a pull request.