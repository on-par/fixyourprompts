#!/usr/bin/env node

/**
 * Performance Budget Script
 * 
 * Enforces performance budgets based on real-world performance metrics:
 * - Loading time targets for different connection speeds
 * - Parse time budgets for JavaScript
 * - First Contentful Paint (FCP) targets
 * - Largest Contentful Paint (LCP) targets
 */

import fs from 'fs';
import path from 'path';
import { gzipSizeSync } from 'gzip-size';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

class PerformanceBudget {
  constructor() {
    this.config = this.loadConfig();
    this.results = {
      metrics: {},
      passed: [],
      warnings: [],
      failures: [],
      recommendations: []
    };
  }

  loadConfig() {
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    let customBudget = {};
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      customBudget = packageJson.performanceBudget || {};
    }

    // Default performance budget configuration
    const defaultBudget = {
      // Connection speed targets (in seconds)
      loadTime: {
        '3G': 3.0,      // 3 seconds on 3G
        '4G': 1.5,      // 1.5 seconds on 4G
        'broadband': 1.0 // 1 second on broadband
      },
      
      // JavaScript parse time (milliseconds per KB of JS)
      jsParseTime: {
        mobile: 1.5,    // 1.5ms per KB on mobile
        desktop: 0.8    // 0.8ms per KB on desktop
      },
      
      // Bundle size limits (bytes, gzipped)
      bundleSize: {
        initial: 200 * 1024,    // 200KB initial bundle
        total: 500 * 1024,      // 500KB total
        javascript: 300 * 1024,  // 300KB JS
        css: 50 * 1024,         // 50KB CSS
        images: 200 * 1024      // 200KB images
      },
      
      // Performance metrics targets
      metrics: {
        fcp: 1.8,      // First Contentful Paint < 1.8s
        lcp: 2.5,      // Largest Contentful Paint < 2.5s
        fid: 100,      // First Input Delay < 100ms
        cls: 0.1,      // Cumulative Layout Shift < 0.1
        tti: 3.8       // Time to Interactive < 3.8s
      },
      
      // Resource hints budget
      resourceHints: {
        preload: 3,     // Max 3 preload hints
        prefetch: 5,    // Max 5 prefetch hints
        dns: 10         // Max 10 DNS hints
      }
    };

    return { ...defaultBudget, ...customBudget };
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  calculateLoadTime(bundleSize, connectionSpeed) {
    // Connection speeds in bytes per second
    const speeds = {
      '3G': 1.5 * 1024 * 1024 / 8,     // 1.5 Mbps
      '4G': 10 * 1024 * 1024 / 8,      // 10 Mbps
      'broadband': 50 * 1024 * 1024 / 8 // 50 Mbps
    };

    return bundleSize / speeds[connectionSpeed];
  }

  calculateJSParseTime(jsSize, deviceType) {
    const msPerKB = this.config.jsParseTime[deviceType];
    return (jsSize / 1024) * msPerKB;
  }

  analyzeBundleSizes() {
    if (!fs.existsSync(distDir)) {
      console.error(`❌ Distribution directory not found: ${distDir}`);
      console.log('💡 Run "npm run build" first to generate the bundle');
      process.exit(1);
    }

    const analysis = {
      javascript: { files: [], totalSize: 0, totalGzipSize: 0 },
      css: { files: [], totalSize: 0, totalGzipSize: 0 },
      images: { files: [], totalSize: 0, totalGzipSize: 0 },
      other: { files: [], totalSize: 0, totalGzipSize: 0 },
      total: { files: 0, totalSize: 0, totalGzipSize: 0 }
    };

    // Scan directory recursively
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else {
          const content = fs.readFileSync(fullPath);
          const size = stat.size;
          const gzipSize = gzipSizeSync(content);
          const type = this.getFileCategory(fullPath);
          
          const fileInfo = {
            name: path.basename(fullPath),
            path: path.relative(distDir, fullPath),
            size,
            gzipSize
          };
          
          analysis[type].files.push(fileInfo);
          analysis[type].totalSize += size;
          analysis[type].totalGzipSize += gzipSize;
          
          analysis.total.files++;
          analysis.total.totalSize += size;
          analysis.total.totalGzipSize += gzipSize;
        }
      }
    };

    scanDirectory(distDir);
    return analysis;
  }

  getFileCategory(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.js', '.mjs'].includes(ext)) return 'javascript';
    if (ext === '.css') return 'stylesheet';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) return 'images';
    return 'other';
  }

  checkBundleSizes(analysis) {
    const checks = [];
    
    // Initial bundle size (assuming first/largest JS file is the initial bundle)
    const mainJsFile = analysis.javascript.files
      .sort((a, b) => b.gzipSize - a.gzipSize)[0];
    
    if (mainJsFile) {
      const initialSize = mainJsFile.gzipSize;
      const limit = this.config.bundleSize.initial;
      
      checks.push({
        name: 'Initial Bundle Size',
        current: initialSize,
        limit,
        passed: initialSize <= limit,
        severity: this.getSeverity(initialSize, limit),
        message: `${this.formatBytes(initialSize)} / ${this.formatBytes(limit)}`,
        recommendation: initialSize > limit ? 
          'Consider code splitting or lazy loading for initial bundle' : null
      });
    }
    
    // Total JavaScript
    checks.push({
      name: 'Total JavaScript',
      current: analysis.javascript.totalGzipSize,
      limit: this.config.bundleSize.javascript,
      passed: analysis.javascript.totalGzipSize <= this.config.bundleSize.javascript,
      severity: this.getSeverity(analysis.javascript.totalGzipSize, this.config.bundleSize.javascript),
      message: `${this.formatBytes(analysis.javascript.totalGzipSize)} / ${this.formatBytes(this.config.bundleSize.javascript)}`,
      recommendation: analysis.javascript.totalGzipSize > this.config.bundleSize.javascript ? 
        'Reduce JavaScript bundle size through tree shaking and code splitting' : null
    });
    
    // Total CSS
    if (analysis.css.totalGzipSize > 0) {
      checks.push({
        name: 'Total CSS',
        current: analysis.css.totalGzipSize,
        limit: this.config.bundleSize.css,
        passed: analysis.css.totalGzipSize <= this.config.bundleSize.css,
        severity: this.getSeverity(analysis.css.totalGzipSize, this.config.bundleSize.css),
        message: `${this.formatBytes(analysis.css.totalGzipSize)} / ${this.formatBytes(this.config.bundleSize.css)}`,
        recommendation: analysis.css.totalGzipSize > this.config.bundleSize.css ? 
          'Optimize CSS through purging unused styles and minification' : null
      });
    }
    
    // Total Images
    if (analysis.images.totalGzipSize > 0) {
      checks.push({
        name: 'Total Images',
        current: analysis.images.totalGzipSize,
        limit: this.config.bundleSize.images,
        passed: analysis.images.totalGzipSize <= this.config.bundleSize.images,
        severity: this.getSeverity(analysis.images.totalGzipSize, this.config.bundleSize.images),
        message: `${this.formatBytes(analysis.images.totalGzipSize)} / ${this.formatBytes(this.config.bundleSize.images)}`,
        recommendation: analysis.images.totalGzipSize > this.config.bundleSize.images ? 
          'Optimize images using modern formats (WebP, AVIF) and proper compression' : null
      });
    }
    
    // Total Bundle
    checks.push({
      name: 'Total Bundle',
      current: analysis.total.totalGzipSize,
      limit: this.config.bundleSize.total,
      passed: analysis.total.totalGzipSize <= this.config.bundleSize.total,
      severity: this.getSeverity(analysis.total.totalGzipSize, this.config.bundleSize.total),
      message: `${this.formatBytes(analysis.total.totalGzipSize)} / ${this.formatBytes(this.config.bundleSize.total)}`,
      recommendation: analysis.total.totalGzipSize > this.config.bundleSize.total ? 
        'Reduce overall bundle size through comprehensive optimization' : null
    });

    return checks;
  }

  checkLoadTime(analysis) {
    const checks = [];
    const bundleSize = analysis.total.totalGzipSize;
    
    Object.entries(this.config.loadTime).forEach(([connection, targetTime]) => {
      const loadTime = this.calculateLoadTime(bundleSize, connection);
      
      checks.push({
        name: `Load Time (${connection.toUpperCase()})`,
        current: loadTime,
        limit: targetTime,
        passed: loadTime <= targetTime,
        severity: this.getSeverity(loadTime, targetTime, 'time'),
        message: `${loadTime.toFixed(1)}s / ${targetTime}s`,
        recommendation: loadTime > targetTime ? 
          `Optimize for ${connection} by reducing bundle size or implementing progressive loading` : null
      });
    });
    
    return checks;
  }

  checkJSParseTime(analysis) {
    const checks = [];
    const jsSize = analysis.javascript.totalGzipSize;
    
    Object.entries(this.config.jsParseTime).forEach(([device, msPerKB]) => {
      const parseTime = this.calculateJSParseTime(jsSize, device);
      const targetTime = 50; // Target < 50ms total parse time
      
      checks.push({
        name: `JS Parse Time (${device})`,
        current: parseTime,
        limit: targetTime,
        passed: parseTime <= targetTime,
        severity: this.getSeverity(parseTime, targetTime, 'time'),
        message: `${parseTime.toFixed(1)}ms / ${targetTime}ms`,
        recommendation: parseTime > targetTime ? 
          `Reduce JavaScript size or implement code splitting for ${device} performance` : null
      });
    });
    
    return checks;
  }

  getSeverity(current, limit, type = 'size') {
    const ratio = current / limit;
    
    if (ratio <= 0.8) return 'good';
    if (ratio <= 1.0) return 'warning';
    if (ratio <= 1.2) return 'error';
    return 'critical';
  }

  generateRecommendations(allChecks) {
    const recommendations = [];
    const failures = allChecks.filter(check => !check.passed);
    
    // General recommendations based on failures
    const jsFailures = failures.filter(check => check.name.includes('JavaScript') || check.name.includes('JS Parse'));
    const cssFailures = failures.filter(check => check.name.includes('CSS'));
    const sizeFailures = failures.filter(check => check.name.includes('Bundle') || check.name.includes('Size'));
    const timeFailures = failures.filter(check => check.name.includes('Load Time'));
    
    if (jsFailures.length > 0) {
      recommendations.push({
        category: 'JavaScript Optimization',
        priority: 'high',
        actions: [
          'Implement code splitting with dynamic imports',
          'Enable tree shaking to remove unused code',
          'Consider using a smaller React build or alternative',
          'Audit dependencies with npm-bundle-analyzer',
          'Implement lazy loading for non-critical components'
        ]
      });
    }
    
    if (cssFailures.length > 0) {
      recommendations.push({
        category: 'CSS Optimization',
        priority: 'medium',
        actions: [
          'Use PurgeCSS to remove unused styles',
          'Implement critical CSS extraction',
          'Consider CSS-in-JS for component-specific styles',
          'Optimize CSS delivery with media queries'
        ]
      });
    }
    
    if (timeFailures.length > 0) {
      recommendations.push({
        category: 'Loading Performance',
        priority: 'high',
        actions: [
          'Implement service worker for caching',
          'Use CDN for static asset delivery',
          'Enable HTTP/2 server push',
          'Implement progressive loading strategies',
          'Consider AMP or similar frameworks for critical pages'
        ]
      });
    }
    
    // Add specific recommendations
    recommendations.push({
      category: 'General Performance',
      priority: 'medium',
      actions: [
        'Implement resource hints (preload, prefetch)',
        'Optimize images with modern formats',
        'Use performance monitoring tools',
        'Implement performance budgets in CI/CD',
        'Regular performance audits with Lighthouse'
      ]
    });
    
    return recommendations;
  }

  printReport(analysis, allChecks) {
    console.log('\n🎯 Performance Budget Report');
    console.log('=' .repeat(50));
    
    // Summary
    const passed = allChecks.filter(check => check.passed).length;
    const total = allChecks.length;
    
    console.log(`\n📊 Summary: ${passed}/${total} checks passed`);
    
    // Group checks by category
    const categories = {
      'Bundle Sizes': allChecks.filter(check => check.name.includes('Bundle') || check.name.includes('JavaScript') || check.name.includes('CSS') || check.name.includes('Images')),
      'Load Performance': allChecks.filter(check => check.name.includes('Load Time')),
      'Parse Performance': allChecks.filter(check => check.name.includes('Parse'))
    };
    
    Object.entries(categories).forEach(([category, checks]) => {
      if (checks.length === 0) return;
      
      console.log(`\n📋 ${category}:`);
      checks.forEach(check => {
        const icon = this.getCheckIcon(check.severity);
        console.log(`  ${icon} ${check.name}: ${check.message}`);
        
        if (check.recommendation) {
          console.log(`     💡 ${check.recommendation}`);
        }
      });
    });
    
    // Recommendations
    const recommendations = this.generateRecommendations(allChecks);
    if (recommendations.some(r => allChecks.filter(c => !c.passed).length > 0)) {
      console.log('\n🔧 Optimization Recommendations:');
      console.log('-' .repeat(30));
      
      recommendations.forEach(rec => {
        if (rec.priority === 'high' || allChecks.filter(c => !c.passed).length > 2) {
          console.log(`\n${rec.category} (${rec.priority} priority):`);
          rec.actions.forEach(action => console.log(`  • ${action}`));
        }
      });
    }
    
    this.printPerformanceInsights(analysis);
  }

  printPerformanceInsights(analysis) {
    console.log('\n📈 Performance Insights:');
    console.log('-' .repeat(25));
    
    // Calculate some interesting metrics
    const jsRatio = (analysis.javascript.totalGzipSize / analysis.total.totalGzipSize * 100);
    const compressionRatio = ((analysis.total.totalSize - analysis.total.totalGzipSize) / analysis.total.totalSize * 100);
    
    console.log(`JavaScript: ${jsRatio.toFixed(1)}% of total bundle`);
    console.log(`Compression: ${compressionRatio.toFixed(1)}% size reduction`);
    
    // Estimated performance metrics
    const estimatedFCP = this.calculateLoadTime(analysis.total.totalGzipSize, '4G') + 0.3; // +300ms processing
    const estimatedLCP = estimatedFCP + 0.5; // +500ms for largest content
    
    console.log(`Estimated FCP: ${estimatedFCP.toFixed(1)}s (target: ${this.config.metrics.fcp}s)`);
    console.log(`Estimated LCP: ${estimatedLCP.toFixed(1)}s (target: ${this.config.metrics.lcp}s)`);
    
    if (estimatedFCP > this.config.metrics.fcp || estimatedLCP > this.config.metrics.lcp) {
      console.log('\n⚠️  Performance targets may not be met');
      console.log('Consider implementing the optimization recommendations above');
    } else {
      console.log('\n✅ Performance targets likely to be met');
    }
  }

  getCheckIcon(severity) {
    switch (severity) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🔴';
      default: return '❓';
    }
  }

  saveReport(analysis, allChecks) {
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      checks: allChecks,
      recommendations: this.generateRecommendations(allChecks),
      summary: {
        total: allChecks.length,
        passed: allChecks.filter(c => c.passed).length,
        failed: allChecks.filter(c => !c.passed).length
      }
    };

    const reportPath = path.join(distDir, 'performance-budget-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return reportPath;
  }

  run() {
    console.log('🎯 Analyzing performance budget...');
    
    const analysis = this.analyzeBundleSizes();
    
    const allChecks = [
      ...this.checkBundleSizes(analysis),
      ...this.checkLoadTime(analysis),
      ...this.checkJSParseTime(analysis)
    ];
    
    this.printReport(analysis, allChecks);
    
    const reportPath = this.saveReport(analysis, allChecks);
    console.log(`\n💾 Report saved to: ${reportPath}`);
    
    const failed = allChecks.filter(check => !check.passed).length;
    const critical = allChecks.filter(check => check.severity === 'critical').length;
    
    if (critical > 0) {
      console.log('\n🔴 Critical performance budget violations detected!');
      process.exit(1);
    } else if (failed > 0) {
      console.log('\n⚠️  Performance budget checks failed');
      process.exit(1);
    } else {
      console.log('\n🎉 All performance budget checks passed!');
      process.exit(0);
    }
  }
}

// Run the performance budget checker
if (import.meta.url === `file://${process.argv[1]}`) {
  const budget = new PerformanceBudget();
  budget.run();
}

export default PerformanceBudget;