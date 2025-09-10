#!/usr/bin/env node

/**
 * Bundle Statistics Analysis Script
 * 
 * Analyzes the built bundle and provides detailed statistics about:
 * - Bundle sizes (raw and gzipped)
 * - Chunk breakdown
 * - Asset sizes
 * - Compression ratios
 */

import fs from 'fs';
import path from 'path';
import { gzipSizeSync } from 'gzip-size';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

class BundleStatsAnalyzer {
  constructor() {
    this.stats = {
      totalSize: 0,
      totalGzipSize: 0,
      files: [],
      chunks: {
        js: [],
        css: [],
        assets: []
      },
      summary: {}
    };
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  getCompressionRatio(original, compressed) {
    return ((1 - (compressed / original)) * 100).toFixed(1) + '%';
  }

  analyzeFile(filePath) {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const gzipSize = gzipSizeSync(content);
    
    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      gzipSize: gzipSize,
      compressionRatio: this.getCompressionRatio(stats.size, gzipSize),
      type: this.getFileType(filePath)
    };
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.js', '.mjs'].includes(ext)) return 'javascript';
    if (ext === '.css') return 'stylesheet';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'font';
    return 'other';
  }

  scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
      console.error(`❌ Distribution directory not found: ${dir}`);
      console.log('💡 Run "npm run build" first to generate the bundle');
      process.exit(1);
    }

    const scanRecursive = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanRecursive(fullPath);
        } else {
          const fileInfo = this.analyzeFile(fullPath);
          this.stats.files.push(fileInfo);
          
          // Categorize files
          switch (fileInfo.type) {
            case 'javascript':
              this.stats.chunks.js.push(fileInfo);
              break;
            case 'stylesheet':
              this.stats.chunks.css.push(fileInfo);
              break;
            default:
              this.stats.chunks.assets.push(fileInfo);
          }
          
          this.stats.totalSize += fileInfo.size;
          this.stats.totalGzipSize += fileInfo.gzipSize;
        }
      }
    };

    scanRecursive(dir);
  }

  generateSummary() {
    const jsSize = this.stats.chunks.js.reduce((sum, file) => sum + file.size, 0);
    const jsGzipSize = this.stats.chunks.js.reduce((sum, file) => sum + file.gzipSize, 0);
    
    const cssSize = this.stats.chunks.css.reduce((sum, file) => sum + file.size, 0);
    const cssGzipSize = this.stats.chunks.css.reduce((sum, file) => sum + file.gzipSize, 0);
    
    const assetsSize = this.stats.chunks.assets.reduce((sum, file) => sum + file.size, 0);
    const assetsGzipSize = this.stats.chunks.assets.reduce((sum, file) => sum + file.gzipSize, 0);

    this.stats.summary = {
      javascript: {
        count: this.stats.chunks.js.length,
        size: jsSize,
        gzipSize: jsGzipSize,
        compressionRatio: jsSize > 0 ? this.getCompressionRatio(jsSize, jsGzipSize) : '0%'
      },
      stylesheets: {
        count: this.stats.chunks.css.length,
        size: cssSize,
        gzipSize: cssGzipSize,
        compressionRatio: cssSize > 0 ? this.getCompressionRatio(cssSize, cssGzipSize) : '0%'
      },
      assets: {
        count: this.stats.chunks.assets.length,
        size: assetsSize,
        gzipSize: assetsGzipSize,
        compressionRatio: assetsSize > 0 ? this.getCompressionRatio(assetsSize, assetsGzipSize) : '0%'
      },
      total: {
        count: this.stats.files.length,
        size: this.stats.totalSize,
        gzipSize: this.stats.totalGzipSize,
        compressionRatio: this.getCompressionRatio(this.stats.totalSize, this.stats.totalGzipSize)
      }
    };
  }

  printReport() {
    console.log('\n📊 Bundle Analysis Report');
    console.log('=' .repeat(50));
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`Total Files: ${this.stats.summary.total.count}`);
    console.log(`Total Size: ${this.formatBytes(this.stats.summary.total.size)} (raw) | ${this.formatBytes(this.stats.summary.total.gzipSize)} (gzip)`);
    console.log(`Compression Ratio: ${this.stats.summary.total.compressionRatio}`);
    
    // JavaScript
    if (this.stats.summary.javascript.count > 0) {
      console.log(`\n🟨 JavaScript (${this.stats.summary.javascript.count} files):`);
      console.log(`  Size: ${this.formatBytes(this.stats.summary.javascript.size)} → ${this.formatBytes(this.stats.summary.javascript.gzipSize)} (${this.stats.summary.javascript.compressionRatio})`);
      
      // Top JS files
      const sortedJs = [...this.stats.chunks.js].sort((a, b) => b.gzipSize - a.gzipSize);
      sortedJs.slice(0, 3).forEach(file => {
        console.log(`    ${file.name}: ${this.formatBytes(file.gzipSize)}`);
      });
    }
    
    // CSS
    if (this.stats.summary.stylesheets.count > 0) {
      console.log(`\n🟦 Stylesheets (${this.stats.summary.stylesheets.count} files):`);
      console.log(`  Size: ${this.formatBytes(this.stats.summary.stylesheets.size)} → ${this.formatBytes(this.stats.summary.stylesheets.gzipSize)} (${this.stats.summary.stylesheets.compressionRatio})`);
      
      // Top CSS files
      const sortedCss = [...this.stats.chunks.css].sort((a, b) => b.gzipSize - a.gzipSize);
      sortedCss.slice(0, 3).forEach(file => {
        console.log(`    ${file.name}: ${this.formatBytes(file.gzipSize)}`);
      });
    }
    
    // Assets
    if (this.stats.summary.assets.count > 0) {
      console.log(`\n🟪 Assets (${this.stats.summary.assets.count} files):`);
      console.log(`  Size: ${this.formatBytes(this.stats.summary.assets.size)} → ${this.formatBytes(this.stats.summary.assets.gzipSize)} (${this.stats.summary.assets.compressionRatio})`);
    }

    // Performance insights
    this.printInsights();
  }

  printInsights() {
    console.log('\n💡 Performance Insights:');
    console.log('-' .repeat(30));
    
    const insights = [];
    const jsGzipSize = this.stats.summary.javascript.gzipSize;
    const cssGzipSize = this.stats.summary.stylesheets.gzipSize;
    const totalGzipSize = this.stats.summary.total.gzipSize;
    
    // Size warnings
    if (jsGzipSize > 250 * 1024) {
      insights.push(`⚠️  JavaScript bundle is large (${this.formatBytes(jsGzipSize)}). Consider code splitting.`);
    } else if (jsGzipSize > 150 * 1024) {
      insights.push(`⚡ JavaScript bundle is moderate (${this.formatBytes(jsGzipSize)}). Room for optimization.`);
    } else {
      insights.push(`✅ JavaScript bundle size is good (${this.formatBytes(jsGzipSize)})`);
    }
    
    if (cssGzipSize > 50 * 1024) {
      insights.push(`⚠️  CSS bundle is large (${this.formatBytes(cssGzipSize)}). Consider purging unused styles.`);
    } else {
      insights.push(`✅ CSS bundle size is good (${this.formatBytes(cssGzipSize)})`);
    }
    
    // Compression ratio insights
    const totalRatio = parseFloat(this.stats.summary.total.compressionRatio.replace('%', ''));
    if (totalRatio < 60) {
      insights.push(`⚠️  Low compression ratio (${this.stats.summary.total.compressionRatio}). Check for unoptimized assets.`);
    } else {
      insights.push(`✅ Good compression ratio (${this.stats.summary.total.compressionRatio})`);
    }
    
    // Chunk count insights
    if (this.stats.summary.javascript.count > 10) {
      insights.push(`⚡ Many JS chunks (${this.stats.summary.javascript.count}). Consider combining smaller chunks.`);
    }
    
    insights.forEach(insight => console.log(insight));
  }

  saveJsonReport() {
    const reportPath = path.join(distDir, 'bundle-stats.json');
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      insights: this.generateInsights()
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }

  generateInsights() {
    return {
      recommendations: [
        'Consider using dynamic imports for code splitting',
        'Implement tree shaking to remove unused code',
        'Use compression middleware in production',
        'Optimize images using modern formats (WebP, AVIF)',
        'Consider using a CDN for static assets'
      ],
      performance: {
        loadTime: this.estimateLoadTime(),
        cacheEfficiency: this.calculateCacheEfficiency()
      }
    };
  }

  estimateLoadTime() {
    // Rough estimate based on average connection speeds
    const connections = {
      '3G': 1.5 * 1024 * 1024 / 8, // 1.5 Mbps in bytes/sec
      '4G': 10 * 1024 * 1024 / 8,  // 10 Mbps in bytes/sec
      'broadband': 50 * 1024 * 1024 / 8 // 50 Mbps in bytes/sec
    };
    
    return Object.entries(connections).reduce((acc, [type, speed]) => {
      acc[type] = `${(this.stats.totalGzipSize / speed).toFixed(1)}s`;
      return acc;
    }, {});
  }

  calculateCacheEfficiency() {
    const jsFiles = this.stats.chunks.js;
    const hashedFiles = jsFiles.filter(file => /-[a-f0-9]{8}\.js$/.test(file.name));
    return `${Math.round((hashedFiles.length / jsFiles.length) * 100)}%`;
  }

  run() {
    console.log('🔍 Analyzing bundle...');
    this.scanDirectory(distDir);
    this.generateSummary();
    this.printReport();
    this.saveJsonReport();
    console.log('\n✨ Analysis complete!');
  }
}

// Run the analyzer
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleStatsAnalyzer();
  analyzer.run();
}

export default BundleStatsAnalyzer;