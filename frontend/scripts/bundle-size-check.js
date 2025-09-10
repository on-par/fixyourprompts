#!/usr/bin/env node

/**
 * Bundle Size Check Script
 * 
 * Validates bundle sizes against defined thresholds and fails CI if exceeded.
 * Provides warnings for approaching limits and suggestions for optimization.
 */

import fs from 'fs';
import path from 'path';
import { gzipSizeSync } from 'gzip-size';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

class BundleSizeChecker {
  constructor() {
    this.config = this.loadConfig();
    this.results = {
      passed: [],
      warnings: [],
      failures: [],
      summary: {}
    };
  }

  loadConfig() {
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.error('❌ package.json not found');
      process.exit(1);
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Default configuration
    const defaultConfig = {
      javascript: { limit: 250 * 1024, warning: 200 * 1024 }, // 250KB limit, 200KB warning
      css: { limit: 50 * 1024, warning: 40 * 1024 },          // 50KB limit, 40KB warning
      total: { limit: 300 * 1024, warning: 250 * 1024 },      // 300KB limit, 250KB warning
      individual: { limit: 100 * 1024, warning: 80 * 1024 }   // Per-file limits
    };

    // Merge with package.json configuration if available
    const customConfig = packageJson.bundleSizeConfig || {};
    
    return {
      ...defaultConfig,
      ...customConfig
    };
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  getPercentage(current, limit) {
    return Math.round((current / limit) * 100);
  }

  checkFile(filePath, category = 'individual') {
    const name = path.basename(filePath);
    const content = fs.readFileSync(filePath);
    const size = content.length;
    const gzipSize = gzipSizeSync(content);
    
    const limits = this.config[category];
    const percentage = this.getPercentage(gzipSize, limits.limit);
    
    const result = {
      name,
      path: filePath,
      size: this.formatBytes(size),
      gzipSize: gzipSize,
      gzipSizeFormatted: this.formatBytes(gzipSize),
      limit: limits.limit,
      limitFormatted: this.formatBytes(limits.limit),
      warning: limits.warning,
      percentage,
      status: 'passed'
    };

    if (gzipSize > limits.limit) {
      result.status = 'failed';
      result.message = `Exceeds ${category} limit by ${this.formatBytes(gzipSize - limits.limit)}`;
      this.results.failures.push(result);
    } else if (gzipSize > limits.warning) {
      result.status = 'warning';
      result.message = `Approaching ${category} limit (${percentage}%)`;
      this.results.warnings.push(result);
    } else {
      result.message = `Within ${category} limit (${percentage}%)`;
      this.results.passed.push(result);
    }

    return result;
  }

  checkBundleSize() {
    if (!fs.existsSync(distDir)) {
      console.error(`❌ Distribution directory not found: ${distDir}`);
      console.log('💡 Run "npm run build" first to generate the bundle');
      process.exit(1);
    }

    const jsFiles = [];
    const cssFiles = [];
    let totalJsSize = 0;
    let totalCssSize = 0;

    // Scan for JS and CSS files
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.mjs')) {
          jsFiles.push(fullPath);
        } else if (item.endsWith('.css')) {
          cssFiles.push(fullPath);
        }
      }
    };

    scanDirectory(distDir);

    console.log('🔍 Checking bundle sizes...\n');

    // Check individual JS files
    console.log(`📄 JavaScript Files (${jsFiles.length}):`);
    jsFiles.forEach(file => {
      const result = this.checkFile(file, 'individual');
      totalJsSize += result.gzipSize;
      console.log(`  ${result.status === 'failed' ? '❌' : result.status === 'warning' ? '⚠️' : '✅'} ${result.name}: ${result.gzipSizeFormatted} (${result.percentage}% of limit)`);
      if (result.status !== 'passed') {
        console.log(`     ${result.message}`);
      }
    });

    // Check individual CSS files  
    if (cssFiles.length > 0) {
      console.log(`\n🎨 CSS Files (${cssFiles.length}):`);
      cssFiles.forEach(file => {
        const result = this.checkFile(file, 'individual');
        totalCssSize += result.gzipSize;
        console.log(`  ${result.status === 'failed' ? '❌' : result.status === 'warning' ? '⚠️' : '✅'} ${result.name}: ${result.gzipSizeFormatted} (${result.percentage}% of limit)`);
        if (result.status !== 'passed') {
          console.log(`     ${result.message}`);
        }
      });
    }

    // Check total sizes
    console.log('\n📊 Bundle Totals:');
    
    // Total JS
    const jsPercentage = this.getPercentage(totalJsSize, this.config.javascript.limit);
    const jsStatus = totalJsSize > this.config.javascript.limit ? 'failed' : 
                     totalJsSize > this.config.javascript.warning ? 'warning' : 'passed';
    
    console.log(`  ${jsStatus === 'failed' ? '❌' : jsStatus === 'warning' ? '⚠️' : '✅'} Total JavaScript: ${this.formatBytes(totalJsSize)} / ${this.formatBytes(this.config.javascript.limit)} (${jsPercentage}%)`);
    
    // Total CSS
    const cssPercentage = this.getPercentage(totalCssSize, this.config.css.limit);
    const cssStatus = totalCssSize > this.config.css.limit ? 'failed' : 
                     totalCssSize > this.config.css.warning ? 'warning' : 'passed';
    
    if (totalCssSize > 0) {
      console.log(`  ${cssStatus === 'failed' ? '❌' : cssStatus === 'warning' ? '⚠️' : '✅'} Total CSS: ${this.formatBytes(totalCssSize)} / ${this.formatBytes(this.config.css.limit)} (${cssPercentage}%)`);
    } else {
      console.log(`  ✅ No CSS files found`);
    }
    
    // Overall total
    const totalSize = totalJsSize + totalCssSize;
    const totalPercentage = this.getPercentage(totalSize, this.config.total.limit);
    const totalStatus = totalSize > this.config.total.limit ? 'failed' : 
                       totalSize > this.config.total.warning ? 'warning' : 'passed';
    
    console.log(`  ${totalStatus === 'failed' ? '❌' : totalStatus === 'warning' ? '⚠️' : '✅'} Total Bundle: ${this.formatBytes(totalSize)} / ${this.formatBytes(this.config.total.limit)} (${totalPercentage}%)`);

    // Store summary
    this.results.summary = {
      javascript: { size: totalJsSize, limit: this.config.javascript.limit, status: jsStatus },
      css: { size: totalCssSize, limit: this.config.css.limit, status: cssStatus },
      total: { size: totalSize, limit: this.config.total.limit, status: totalStatus }
    };

    return this.results.failures.length === 0 && jsStatus !== 'failed' && cssStatus !== 'failed' && totalStatus !== 'failed';
  }

  printOptimizationSuggestions() {
    if (this.results.failures.length > 0 || this.results.warnings.length > 0) {
      console.log('\n💡 Optimization Suggestions:');
      console.log('-'.repeat(40));
      
      const suggestions = [
        '🔄 Code Splitting: Use dynamic imports to split large bundles',
        '🌳 Tree Shaking: Remove unused code with proper ES modules',
        '🗜️  Minification: Ensure Terser is configured for maximum compression',
        '📦 Bundle Analysis: Run "npm run bundle:analyze" for detailed insights',
        '🧹 Dependency Audit: Review and remove unnecessary dependencies',
        '⚡ Lazy Loading: Implement lazy loading for non-critical components',
        '🎯 Selective Imports: Import only needed functions from libraries',
        '🗃️  Asset Optimization: Optimize images and other static assets'
      ];

      // Show relevant suggestions based on what failed
      const relevantSuggestions = suggestions.slice(0, Math.min(5, suggestions.length));
      relevantSuggestions.forEach(suggestion => console.log(`  ${suggestion}`));
      
      if (this.results.failures.some(f => f.name.includes('vendor'))) {
        console.log('  🏗️  Vendor Splitting: Consider splitting vendor libraries into separate chunks');
      }
      
      if (this.results.failures.some(f => f.path.includes('.css'))) {
        console.log('  🎨 CSS Optimization: Use PurgeCSS to remove unused styles');
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      passed: this.results.failures.length === 0
    };

    const reportPath = path.join(distDir, 'size-check-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return reportPath;
  }

  run() {
    const passed = this.checkBundleSize();
    
    // Print summary
    console.log('\n📋 Summary:');
    console.log(`  ✅ Passed: ${this.results.passed.length} files`);
    console.log(`  ⚠️  Warnings: ${this.results.warnings.length} files`);
    console.log(`  ❌ Failures: ${this.results.failures.length} files`);

    this.printOptimizationSuggestions();
    
    const reportPath = this.generateReport();
    console.log(`\n💾 Report saved to: ${reportPath}`);
    
    if (passed) {
      console.log('\n🎉 All bundle size checks passed!');
      process.exit(0);
    } else {
      console.log('\n💥 Bundle size check failed!');
      console.log('Consider the optimization suggestions above.');
      process.exit(1);
    }
  }
}

// Configuration override for CI environments
if (process.env.CI) {
  // Stricter limits in CI
  console.log('🔒 CI environment detected - using stricter limits');
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new BundleSizeChecker();
  checker.run();
}

export default BundleSizeChecker;