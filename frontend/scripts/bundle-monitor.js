#!/usr/bin/env node

/**
 * Bundle Monitor Script
 * 
 * Continuously monitors bundle size changes over time and tracks:
 * - Size evolution across builds
 * - Performance regression detection
 * - Historical trends analysis
 */

import fs from 'fs';
import path from 'path';
import { gzipSizeSync } from 'gzip-size';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const historyFile = path.join(__dirname, '../.bundle-history.json');

class BundleMonitor {
  constructor() {
    this.history = this.loadHistory();
    this.currentSnapshot = null;
  }

  loadHistory() {
    if (fs.existsSync(historyFile)) {
      try {
        return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        console.warn('⚠️ Could not parse bundle history, starting fresh');
      }
    }
    
    return {
      snapshots: [],
      settings: {
        maxSnapshots: 50, // Keep last 50 builds
        regressionThreshold: 0.1 // 10% size increase is considered a regression
      }
    };
  }

  saveHistory() {
    // Keep only the most recent snapshots
    if (this.history.snapshots.length > this.history.settings.maxSnapshots) {
      this.history.snapshots = this.history.snapshots.slice(-this.history.settings.maxSnapshots);
    }
    
    fs.writeFileSync(historyFile, JSON.stringify(this.history, null, 2));
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  calculateChange(current, previous) {
    if (!previous) return { absolute: 0, percentage: 0 };
    
    const absolute = current - previous;
    const percentage = ((current - previous) / previous) * 100;
    
    return { absolute, percentage };
  }

  createSnapshot() {
    if (!fs.existsSync(distDir)) {
      console.error(`❌ Distribution directory not found: ${distDir}`);
      console.log('💡 Run "npm run build" first to generate the bundle');
      process.exit(1);
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      git: this.getGitInfo(),
      files: [],
      summary: {
        totalSize: 0,
        totalGzipSize: 0,
        jsSize: 0,
        jsGzipSize: 0,
        cssSize: 0,
        cssGzipSize: 0,
        assetSize: 0,
        assetGzipSize: 0,
        fileCount: 0
      }
    };

    // Scan all files
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
          const relativePath = path.relative(distDir, fullPath);
          
          const fileInfo = {
            name: path.basename(fullPath),
            path: relativePath,
            size,
            gzipSize,
            type: this.getFileType(fullPath)
          };
          
          snapshot.files.push(fileInfo);
          snapshot.summary.totalSize += size;
          snapshot.summary.totalGzipSize += gzipSize;
          snapshot.summary.fileCount++;
          
          // Categorize by type
          switch (fileInfo.type) {
            case 'javascript':
              snapshot.summary.jsSize += size;
              snapshot.summary.jsGzipSize += gzipSize;
              break;
            case 'stylesheet':
              snapshot.summary.cssSize += size;
              snapshot.summary.cssGzipSize += gzipSize;
              break;
            default:
              snapshot.summary.assetSize += size;
              snapshot.summary.assetGzipSize += gzipSize;
          }
        }
      }
    };

    scanDirectory(distDir);
    
    // Sort files by size for easier analysis
    snapshot.files.sort((a, b) => b.gzipSize - a.gzipSize);
    
    this.currentSnapshot = snapshot;
    return snapshot;
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.js', '.mjs'].includes(ext)) return 'javascript';
    if (ext === '.css') return 'stylesheet';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'font';
    return 'other';
  }

  getGitInfo() {
    try {
      const { execSync } = require('child_process');
      
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const message = execSync('git log -1 --pretty=%s', { encoding: 'utf8' }).trim();
      
      return { branch, commit, message };
    } catch (error) {
      return { branch: 'unknown', commit: 'unknown', message: 'No git info available' };
    }
  }

  analyzeChanges() {
    const previous = this.history.snapshots[this.history.snapshots.length - 1];
    if (!previous || !this.currentSnapshot) {
      return { isFirstBuild: true, changes: {} };
    }

    const changes = {
      total: this.calculateChange(this.currentSnapshot.summary.totalGzipSize, previous.summary.totalGzipSize),
      javascript: this.calculateChange(this.currentSnapshot.summary.jsGzipSize, previous.summary.jsGzipSize),
      css: this.calculateChange(this.currentSnapshot.summary.cssGzipSize, previous.summary.cssGzipSize),
      assets: this.calculateChange(this.currentSnapshot.summary.assetGzipSize, previous.summary.assetGzipSize),
      fileCount: this.calculateChange(this.currentSnapshot.summary.fileCount, previous.summary.fileCount)
    };

    // File-level changes
    const fileChanges = {
      added: [],
      removed: [],
      modified: []
    };

    const previousFiles = new Map(previous.files.map(f => [f.path, f]));
    const currentFiles = new Map(this.currentSnapshot.files.map(f => [f.path, f]));

    // Find added files
    for (const [path, file] of currentFiles) {
      if (!previousFiles.has(path)) {
        fileChanges.added.push(file);
      }
    }

    // Find removed and modified files
    for (const [path, prevFile] of previousFiles) {
      if (!currentFiles.has(path)) {
        fileChanges.removed.push(prevFile);
      } else {
        const currentFile = currentFiles.get(path);
        if (currentFile.gzipSize !== prevFile.gzipSize) {
          fileChanges.modified.push({
            ...currentFile,
            previousSize: prevFile.gzipSize,
            change: this.calculateChange(currentFile.gzipSize, prevFile.gzipSize)
          });
        }
      }
    }

    changes.files = fileChanges;
    return { isFirstBuild: false, changes };
  }

  detectRegressions(changes) {
    const regressions = [];
    const threshold = this.history.settings.regressionThreshold;

    // Check overall size regression
    if (changes.total && changes.total.percentage > threshold * 100) {
      regressions.push({
        type: 'total_size',
        severity: changes.total.percentage > threshold * 200 ? 'high' : 'medium',
        message: `Total bundle size increased by ${changes.total.percentage.toFixed(1)}% (${this.formatBytes(Math.abs(changes.total.absolute))})`,
        threshold: `${(threshold * 100).toFixed(0)}%`
      });
    }

    // Check JavaScript size regression
    if (changes.javascript && changes.javascript.percentage > threshold * 100) {
      regressions.push({
        type: 'javascript_size',
        severity: changes.javascript.percentage > threshold * 200 ? 'high' : 'medium',
        message: `JavaScript bundle increased by ${changes.javascript.percentage.toFixed(1)}% (${this.formatBytes(Math.abs(changes.javascript.absolute))})`,
        threshold: `${(threshold * 100).toFixed(0)}%`
      });
    }

    // Check for large individual file changes
    if (changes.files && changes.files.modified) {
      changes.files.modified.forEach(file => {
        if (file.change.percentage > threshold * 100 && file.gzipSize > 10 * 1024) { // Only flag files > 10KB
          regressions.push({
            type: 'file_size',
            severity: file.change.percentage > threshold * 300 ? 'high' : 'low',
            message: `${file.name} increased by ${file.change.percentage.toFixed(1)}% (${this.formatBytes(Math.abs(file.change.absolute))})`,
            file: file.name
          });
        }
      });
    }

    return regressions;
  }

  printReport(analysis) {
    console.log('\n📈 Bundle Monitor Report');
    console.log('=' .repeat(50));

    if (analysis.isFirstBuild) {
      console.log('\n🆕 First build recorded');
      console.log(`Total Size: ${this.formatBytes(this.currentSnapshot.summary.totalGzipSize)}`);
      console.log(`Files: ${this.currentSnapshot.summary.fileCount}`);
      return;
    }

    const { changes } = analysis;

    // Overall changes
    console.log('\n📊 Size Changes:');
    console.log(`Total: ${this.formatBytes(this.currentSnapshot.summary.totalGzipSize)} ${this.formatChange(changes.total)}`);
    
    if (this.currentSnapshot.summary.jsGzipSize > 0) {
      console.log(`JavaScript: ${this.formatBytes(this.currentSnapshot.summary.jsGzipSize)} ${this.formatChange(changes.javascript)}`);
    }
    
    if (this.currentSnapshot.summary.cssGzipSize > 0) {
      console.log(`CSS: ${this.formatBytes(this.currentSnapshot.summary.cssGzipSize)} ${this.formatChange(changes.css)}`);
    }

    // File changes
    if (changes.files.added.length > 0) {
      console.log(`\n➕ Added Files (${changes.files.added.length}):`);
      changes.files.added.slice(0, 5).forEach(file => {
        console.log(`  ${file.name}: ${this.formatBytes(file.gzipSize)}`);
      });
      if (changes.files.added.length > 5) {
        console.log(`  ... and ${changes.files.added.length - 5} more`);
      }
    }

    if (changes.files.removed.length > 0) {
      console.log(`\n➖ Removed Files (${changes.files.removed.length}):`);
      changes.files.removed.slice(0, 5).forEach(file => {
        console.log(`  ${file.name}: ${this.formatBytes(file.gzipSize)}`);
      });
    }

    if (changes.files.modified.length > 0) {
      console.log(`\n📝 Modified Files (${changes.files.modified.length}):`);
      const significantChanges = changes.files.modified
        .filter(f => Math.abs(f.change.percentage) > 5) // Only show changes > 5%
        .slice(0, 5);
        
      significantChanges.forEach(file => {
        console.log(`  ${file.name}: ${this.formatBytes(file.gzipSize)} ${this.formatChange(file.change)}`);
      });
    }

    // Regression analysis
    const regressions = this.detectRegressions(changes);
    if (regressions.length > 0) {
      console.log('\n⚠️  Potential Regressions:');
      regressions.forEach(regression => {
        const icon = regression.severity === 'high' ? '🔴' : 
                     regression.severity === 'medium' ? '🟡' : '🟠';
        console.log(`  ${icon} ${regression.message}`);
      });
    }
  }

  formatChange(change) {
    if (!change || change.absolute === 0) return '(no change)';
    
    const sign = change.absolute > 0 ? '+' : '';
    const color = change.absolute > 0 ? '📈' : '📉';
    
    return `${color} (${sign}${this.formatBytes(change.absolute)}, ${sign}${change.percentage.toFixed(1)}%)`;
  }

  generateTrendReport() {
    if (this.history.snapshots.length < 2) {
      return { hasTrend: false };
    }

    const recent = this.history.snapshots.slice(-10); // Last 10 builds
    const trend = {
      hasTrend: true,
      builds: recent.length,
      totalSizeGrowth: this.calculateTrend(recent.map(s => s.summary.totalGzipSize)),
      averageSize: recent.reduce((sum, s) => sum + s.summary.totalGzipSize, 0) / recent.length,
      peakSize: Math.max(...recent.map(s => s.summary.totalGzipSize)),
      minSize: Math.min(...recent.map(s => s.summary.totalGzipSize))
    };

    return trend;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return ((last - first) / first) * 100;
  }

  run() {
    console.log('📊 Creating bundle snapshot...');
    
    this.createSnapshot();
    const analysis = this.analyzeChanges();
    
    // Add snapshot to history
    this.history.snapshots.push(this.currentSnapshot);
    this.saveHistory();
    
    this.printReport(analysis);
    
    // Trend analysis for multiple builds
    const trend = this.generateTrendReport();
    if (trend.hasTrend && trend.builds > 2) {
      console.log(`\n📈 Trend (${trend.builds} recent builds):`);
      console.log(`Average Size: ${this.formatBytes(trend.averageSize)}`);
      console.log(`Size Range: ${this.formatBytes(trend.minSize)} - ${this.formatBytes(trend.peakSize)}`);
      
      if (Math.abs(trend.totalSizeGrowth) > 5) {
        const direction = trend.totalSizeGrowth > 0 ? 'growing' : 'shrinking';
        console.log(`📊 Bundle is ${direction} by ${Math.abs(trend.totalSizeGrowth).toFixed(1)}% over time`);
      }
    }

    console.log(`\n💾 History saved (${this.history.snapshots.length} snapshots)`);
    console.log('✨ Monitoring complete!');
  }
}

// Run the monitor
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new BundleMonitor();
  monitor.run();
}

export default BundleMonitor;