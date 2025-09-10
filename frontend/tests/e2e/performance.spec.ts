import { test, expect, type Page, type BrowserContext, type Locator } from '@playwright/test'

/**
 * E2E Performance Tests for FixYourPrompts.com
 * 
 * Comprehensive performance testing suite that ensures the application meets
 * performance targets and maintains good user experience under various conditions.
 * 
 * Performance Targets:
 * - Initial page load: <2 seconds
 * - Time to Interactive (TTI): <3 seconds
 * - First Contentful Paint (FCP): <1.5 seconds
 * - Largest Contentful Paint (LCP): <2.5 seconds
 * - User interaction response: <500ms
 * - Memory usage: No significant leaks over time
 */

// Test data for performance scenarios
const performanceTestData = {
  smallPrompt: 'Write a story about friendship',
  mediumPrompt: 'Create a comprehensive marketing strategy for a new sustainable fashion brand targeting millennials who are environmentally conscious and value ethical production methods',
  largePrompt: 'A'.repeat(5000), // Large text input for stress testing
  veryLargePrompt: 'Generate a detailed business plan for a technology startup that focuses on artificial intelligence solutions for small and medium-sized enterprises. The plan should include market analysis, competitive landscape, revenue model, technical architecture, team structure, funding requirements, go-to-market strategy, risk assessment, financial projections for 5 years, and implementation timeline. '.repeat(20),
  specialCharPrompt: 'Write a story with émojis 🎉, <special> chars & "quotes" using 100% creativity! Include symbols: @#$%^&*()[]{}|\\:";\'<>?,./'
}

// Performance measurement utilities
class PerformanceTracker {
  private metrics: Map<string, number> = new Map()
  private memorySnapshots: number[] = []

  async measurePageLoad(page: Page, url: string): Promise<{
    loadTime: number,
    fcp: number,
    lcp: number,
    tti: number,
    cls: number
  }> {
    const startTime = Date.now()
    
    // Navigate and wait for load
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime

    // Get Web Vitals metrics
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics: any = {}
        
        // Performance Observer for Core Web Vitals
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime
              }
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime
            }
            if (entry.entryType === 'layout-shift') {
              metrics.cls = (metrics.cls || 0) + entry.value
            }
          }
        })
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] })
        
        // Estimate TTI (simplified)
        const estimateTTI = () => {
          const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          return navigationTiming.domInteractive - navigationTiming.navigationStart
        }
        
        // Wait for metrics to be collected
        setTimeout(() => {
          metrics.tti = estimateTTI()
          observer.disconnect()
          resolve(metrics)
        }, 3000)
      })
    })

    return {
      loadTime,
      fcp: webVitals.fcp || 0,
      lcp: webVitals.lcp || 0,
      tti: webVitals.tti || 0,
      cls: webVitals.cls || 0
    }
  }

  async measureInteractionTime(page: Page, action: () => Promise<void>): Promise<number> {
    const startTime = Date.now()
    await action()
    return Date.now() - startTime
  }

  async captureMemorySnapshot(page: Page): Promise<number> {
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    this.memorySnapshots.push(memoryInfo)
    return memoryInfo
  }

  getMemoryTrend(): { trend: 'increasing' | 'stable' | 'decreasing', percentage: number } {
    if (this.memorySnapshots.length < 2) return { trend: 'stable', percentage: 0 }
    
    const first = this.memorySnapshots[0]
    const last = this.memorySnapshots[this.memorySnapshots.length - 1]
    const percentage = ((last - first) / first) * 100
    
    if (percentage > 10) return { trend: 'increasing', percentage }
    if (percentage < -10) return { trend: 'decreasing', percentage }
    return { trend: 'stable', percentage }
  }

  async measureBundleSize(page: Page): Promise<{ totalSize: number, jsSize: number, cssSize: number }> {
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      let totalSize = 0
      let jsSize = 0
      let cssSize = 0
      
      resources.forEach(resource => {
        const size = resource.transferSize || 0
        totalSize += size
        
        if (resource.name.endsWith('.js')) {
          jsSize += size
        } else if (resource.name.endsWith('.css')) {
          cssSize += size
        }
      })
      
      return { totalSize, jsSize, cssSize }
    })
    
    return resourceSizes
  }
}

// Page Object Model for performance testing
class PerformanceTestPage {
  readonly page: Page
  readonly tracker: PerformanceTracker
  readonly promptInput: Locator
  readonly submitButton: Locator
  readonly resultsContainer: Locator
  readonly loadingSpinner: Locator
  
  constructor(page: Page) {
    this.page = page
    this.tracker = new PerformanceTracker()
    this.promptInput = page.locator('[data-testid="prompt-input"]')
    this.submitButton = page.locator('[data-testid="submit-button"]')
    this.resultsContainer = page.locator('[data-testid="analysis-results"]')
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]')
  }

  async navigateAndMeasure(url: string = '/') {
    return await this.tracker.measurePageLoad(this.page, url)
  }

  async submitPromptAndMeasure(prompt: string) {
    const interactionTime = await this.tracker.measureInteractionTime(this.page, async () => {
      await this.promptInput.fill(prompt)
      await this.submitButton.click()
      
      // Wait for loading to start
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {})
      
      // Wait for results or timeout
      await Promise.race([
        this.resultsContainer.waitFor({ state: 'visible', timeout: 30000 }),
        this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 })
      ])
    })
    
    return interactionTime
  }

  async measureMemory() {
    return await this.tracker.captureMemorySnapshot(this.page)
  }

  getMemoryTrend() {
    return this.tracker.getMemoryTrend()
  }

  async measureBundleSize() {
    return await this.tracker.measureBundleSize(this.page)
  }
}

test.describe('Performance Tests', () => {
  let performancePage: PerformanceTestPage

  test.beforeEach(async ({ page }) => {
    performancePage = new PerformanceTestPage(page)
  })

  test.describe('Page Load Performance', () => {
    test('initial page load should be under 2 seconds', async () => {
      const metrics = await performancePage.navigateAndMeasure('/')
      
      console.log(`Load time: ${metrics.loadTime}ms`)
      console.log(`FCP: ${metrics.fcp}ms`)
      console.log(`LCP: ${metrics.lcp}ms`)
      console.log(`TTI: ${metrics.tti}ms`)
      console.log(`CLS: ${metrics.cls}`)
      
      // Assert performance targets
      expect(metrics.loadTime).toBeLessThan(2000) // <2 seconds
      expect(metrics.fcp).toBeLessThan(1500) // <1.5 seconds for FCP
      expect(metrics.lcp).toBeLessThan(2500) // <2.5 seconds for LCP
      expect(metrics.tti).toBeLessThan(3000) // <3 seconds for TTI
      expect(metrics.cls).toBeLessThan(0.1) // Good CLS score
    })

    test('subsequent page navigations should be fast', async () => {
      // Initial load
      await performancePage.navigateAndMeasure('/')
      
      // Navigate to same page again (should use cache)
      const secondLoadMetrics = await performancePage.navigateAndMeasure('/')
      
      console.log(`Second load time: ${secondLoadMetrics.loadTime}ms`)
      
      // Second load should be significantly faster due to caching
      expect(secondLoadMetrics.loadTime).toBeLessThan(1000)
    })

    test('bundle size should be optimized', async () => {
      await performancePage.navigateAndMeasure('/')
      const bundleSize = await performancePage.measureBundleSize()
      
      console.log(`Total bundle size: ${(bundleSize.totalSize / 1024).toFixed(2)} KB`)
      console.log(`JS size: ${(bundleSize.jsSize / 1024).toFixed(2)} KB`)
      console.log(`CSS size: ${(bundleSize.cssSize / 1024).toFixed(2)} KB`)
      
      // Assert reasonable bundle sizes (adjust based on your app)
      expect(bundleSize.totalSize).toBeLessThan(1024 * 1024) // <1MB total
      expect(bundleSize.jsSize).toBeLessThan(512 * 1024) // <512KB JS
      expect(bundleSize.cssSize).toBeLessThan(100 * 1024) // <100KB CSS
    })
  })

  test.describe('Interaction Performance', () => {
    test('prompt submission should respond within 500ms', async () => {
      await performancePage.navigateAndMeasure('/')
      
      const responseTime = await performancePage.submitPromptAndMeasure(performanceTestData.smallPrompt)
      
      console.log(`Prompt submission response time: ${responseTime}ms`)
      
      // UI should respond immediately, even if processing takes longer
      expect(responseTime).toBeLessThan(500)
    })

    test('typing performance should be smooth', async ({ page }) => {
      await performancePage.navigateAndMeasure('/')
      
      const typeStartTime = Date.now()
      
      // Simulate realistic typing with delays
      await performancePage.promptInput.click()
      for (const char of performanceTestData.mediumPrompt) {
        await page.keyboard.type(char, { delay: 10 }) // 10ms between chars
      }
      
      const typeEndTime = Date.now()
      const typingTime = typeEndTime - typeStartTime
      const expectedTime = performanceTestData.mediumPrompt.length * 10 // 10ms per char
      
      console.log(`Typing time: ${typingTime}ms (expected: ~${expectedTime}ms)`)
      
      // Typing should not be significantly slower than expected
      expect(typingTime).toBeLessThan(expectedTime * 1.5)
    })

    test('UI should remain responsive during processing', async ({ page }) => {
      await performancePage.navigateAndMeasure('/')
      
      // Start a prompt submission
      await performancePage.promptInput.fill(performanceTestData.mediumPrompt)
      await performancePage.submitButton.click()
      
      // Test UI responsiveness during processing
      const responsivenessTasks = [
        async () => {
          // Try to click on input field
          await performancePage.promptInput.click()
          await page.keyboard.type('test')
        },
        async () => {
          // Try to scroll page
          await page.evaluate(() => window.scrollBy(0, 100))
        }
      ]
      
      // All UI interactions should complete quickly
      for (const task of responsivenessTasks) {
        const startTime = Date.now()
        await task()
        const duration = Date.now() - startTime
        expect(duration).toBeLessThan(100) // Should be very fast
      }
    })
  })

  test.describe('Large Input Performance', () => {
    test('should handle large text input efficiently', async () => {
      await performancePage.navigateAndMeasure('/')
      
      const startTime = Date.now()
      await performancePage.promptInput.fill(performanceTestData.largePrompt)
      const fillTime = Date.now() - startTime
      
      console.log(`Large text fill time: ${fillTime}ms`)
      
      // Should handle 5000 characters efficiently
      expect(fillTime).toBeLessThan(1000)
      
      // Submit and measure response
      const responseTime = await performancePage.submitPromptAndMeasure('')
      expect(responseTime).toBeLessThan(500)
    })

    test('should handle very large input gracefully', async ({ page }) => {
      await performancePage.navigateAndMeasure('/')
      
      // Test with very large input
      const startMemory = await performancePage.measureMemory()
      
      await performancePage.promptInput.fill(performanceTestData.veryLargePrompt)
      
      const afterFillMemory = await performancePage.measureMemory()
      const memoryIncrease = afterFillMemory - startMemory
      
      console.log(`Memory increase for large input: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // <50MB
      
      // Page should still be responsive
      const clickTime = await performancePage.tracker.measureInteractionTime(page, async () => {
        await performancePage.submitButton.click()
      })
      
      expect(clickTime).toBeLessThan(200)
    })

    test('should handle special characters without performance degradation', async () => {
      await performancePage.navigateAndMeasure('/')
      
      const responseTime = await performancePage.submitPromptAndMeasure(performanceTestData.specialCharPrompt)
      
      console.log(`Special characters response time: ${responseTime}ms`)
      
      // Special characters should not impact performance
      expect(responseTime).toBeLessThan(500)
    })
  })

  test.describe('Memory Management', () => {
    test('should not have memory leaks during normal usage', async () => {
      await performancePage.navigateAndMeasure('/')
      
      // Capture initial memory
      await performancePage.measureMemory()
      
      // Perform multiple operations
      for (let i = 0; i < 5; i++) {
        await performancePage.submitPromptAndMeasure(`Test prompt ${i}: ${performanceTestData.smallPrompt}`)
        await performancePage.measureMemory()
        
        // Wait a bit between operations
        await performancePage.page.waitForTimeout(500)
      }
      
      const memoryTrend = performancePage.getMemoryTrend()
      console.log(`Memory trend: ${memoryTrend.trend} (${memoryTrend.percentage.toFixed(2)}%)`)
      
      // Memory should not increase significantly over time
      expect(memoryTrend.percentage).toBeLessThan(50) // <50% increase allowed
    })

    test('should handle rapid successive operations without memory issues', async ({ page }) => {
      await performancePage.navigateAndMeasure('/')
      
      const initialMemory = await performancePage.measureMemory()
      
      // Perform rapid operations
      const operations = Array.from({ length: 10 }, (_, i) => 
        performancePage.submitPromptAndMeasure(`Rapid test ${i}`)
      )
      
      await Promise.all(operations)
      
      const finalMemory = await performancePage.measureMemory()
      const memoryIncrease = ((finalMemory - initialMemory) / initialMemory) * 100
      
      console.log(`Memory increase after rapid operations: ${memoryIncrease.toFixed(2)}%`)
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(100) // <100% increase
    })
  })

  test.describe('Code Splitting and Lazy Loading', () => {
    test('should load additional chunks only when needed', async ({ page }) => {
      await performancePage.navigateAndMeasure('/')
      
      // Monitor network requests for additional chunks
      const networkRequests: string[] = []
      page.on('request', (request) => {
        if (request.url().includes('.js') || request.url().includes('.css')) {
          networkRequests.push(request.url())
        }
      })
      
      // Initial load should have minimal chunks
      const initialRequests = networkRequests.length
      
      // Trigger actions that might load additional chunks
      await performancePage.submitPromptAndMeasure(performanceTestData.mediumPrompt)
      
      // Should load additional chunks as needed
      const additionalRequests = networkRequests.length - initialRequests
      console.log(`Additional chunks loaded: ${additionalRequests}`)
      
      // Additional chunks should be loaded (proving lazy loading works)
      expect(additionalRequests).toBeGreaterThan(0)
      expect(additionalRequests).toBeLessThan(10) // But not too many
    })

    test('should prefetch critical resources', async ({ page }) => {
      await performancePage.navigateAndMeasure('/')
      
      // Check for resource hints in the HTML
      const resourceHints = await page.evaluate(() => {
        const hints = Array.from(document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="preconnect"]'))
        return hints.map(hint => ({
          rel: hint.getAttribute('rel'),
          href: hint.getAttribute('href'),
          as: hint.getAttribute('as')
        }))
      })
      
      console.log('Resource hints found:', resourceHints)
      
      // Should have some resource hints for optimization
      expect(resourceHints.length).toBeGreaterThan(0)
    })
  })

  test.describe('Stress Testing', () => {
    test('should maintain performance under concurrent users simulation', async ({ browser }) => {
      // Simulate multiple concurrent users
      const contexts = await Promise.all(
        Array.from({ length: 3 }, () => browser.newContext())
      )
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      )
      
      try {
        // All users load the page simultaneously
        const loadPromises = pages.map(async (page, index) => {
          const testPage = new PerformanceTestPage(page)
          const metrics = await testPage.navigateAndMeasure('/')
          
          console.log(`User ${index + 1} load time: ${metrics.loadTime}ms`)
          
          // Each user should still meet performance targets
          expect(metrics.loadTime).toBeLessThan(3000) // Slightly relaxed for concurrent load
          return metrics.loadTime
        })
        
        const loadTimes = await Promise.all(loadPromises)
        const averageLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
        
        console.log(`Average load time across users: ${averageLoadTime}ms`)
        
        // Average should still be reasonable
        expect(averageLoadTime).toBeLessThan(2500)
        
      } finally {
        // Cleanup
        await Promise.all(contexts.map(context => context.close()))
      }
    })

    test('should handle rapid navigation without degradation', async ({ page }) => {
      const testPage = new PerformanceTestPage(page)
      
      // Perform rapid navigation cycles
      const navigationTimes: number[] = []
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now()
        await testPage.navigateAndMeasure('/')
        const navigationTime = Date.now() - startTime
        
        navigationTimes.push(navigationTime)
        console.log(`Navigation ${i + 1}: ${navigationTime}ms`)
        
        // Brief pause to simulate real usage
        await page.waitForTimeout(100)
      }
      
      // Performance should not degrade significantly over time
      const firstNavigation = navigationTimes[0]
      const lastNavigation = navigationTimes[navigationTimes.length - 1]
      const degradation = ((lastNavigation - firstNavigation) / firstNavigation) * 100
      
      console.log(`Performance degradation: ${degradation.toFixed(2)}%`)
      
      // Should not degrade more than 50%
      expect(degradation).toBeLessThan(50)
    })
  })

  test.describe('Performance Monitoring and Alerts', () => {
    test('should report performance metrics for monitoring', async ({ page }) => {
      const testPage = new PerformanceTestPage(page)
      const metrics = await testPage.navigateAndMeasure('/')
      
      // Log structured performance data for monitoring systems
      const performanceReport = {
        timestamp: new Date().toISOString(),
        url: page.url(),
        metrics: {
          loadTime: metrics.loadTime,
          fcp: metrics.fcp,
          lcp: metrics.lcp,
          tti: metrics.tti,
          cls: metrics.cls
        },
        browser: await page.evaluate(() => navigator.userAgent),
        viewport: await page.viewportSize()
      }
      
      console.log('Performance Report:', JSON.stringify(performanceReport, null, 2))
      
      // Verify all metrics are captured
      expect(performanceReport.metrics.loadTime).toBeGreaterThan(0)
      expect(performanceReport.timestamp).toBeDefined()
      expect(performanceReport.url).toContain('localhost:5173')
    })

    test('should identify performance regressions', async ({ page }) => {
      const testPage = new PerformanceTestPage(page)
      
      // Baseline measurement
      const baseline = await testPage.navigateAndMeasure('/')
      
      // Simulate some application state that might affect performance
      await testPage.submitPromptAndMeasure(performanceTestData.mediumPrompt)
      
      // Second measurement
      const followUp = await testPage.navigateAndMeasure('/')
      
      const regression = ((followUp.loadTime - baseline.loadTime) / baseline.loadTime) * 100
      
      console.log(`Performance regression: ${regression.toFixed(2)}%`)
      
      // Alert if performance has regressed significantly
      if (regression > 20) {
        console.warn(`Performance regression detected: ${regression.toFixed(2)}%`)
      }
      
      // Should not have major regressions
      expect(regression).toBeLessThan(50)
    })
  })
})

// Performance utility tests
test.describe('Performance Infrastructure', () => {
  test('performance tracking utilities should work correctly', async ({ page }) => {
    const testPage = new PerformanceTestPage(page)
    
    // Test memory tracking
    const memory1 = await testPage.measureMemory()
    const memory2 = await testPage.measureMemory()
    
    expect(memory1).toBeGreaterThanOrEqual(0)
    expect(memory2).toBeGreaterThanOrEqual(0)
    
    // Test bundle size measurement
    await testPage.navigateAndMeasure('/')
    const bundleSize = await testPage.measureBundleSize()
    
    expect(bundleSize.totalSize).toBeGreaterThan(0)
    expect(bundleSize.jsSize).toBeGreaterThanOrEqual(0)
    expect(bundleSize.cssSize).toBeGreaterThanOrEqual(0)
  })

  test('should have reliable performance measurement baseline', async ({ page }) => {
    const testPage = new PerformanceTestPage(page)
    
    // Take multiple measurements to check consistency
    const measurements = []
    for (let i = 0; i < 3; i++) {
      const metrics = await testPage.navigateAndMeasure('/')
      measurements.push(metrics.loadTime)
      
      // Small delay between measurements
      await page.waitForTimeout(500)
    }
    
    const average = measurements.reduce((sum, time) => sum + time, 0) / measurements.length
    const variance = measurements.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / measurements.length
    const standardDeviation = Math.sqrt(variance)
    const coefficientOfVariation = (standardDeviation / average) * 100
    
    console.log(`Measurements: ${measurements.join(', ')}ms`)
    console.log(`Average: ${average.toFixed(2)}ms`)
    console.log(`Standard Deviation: ${standardDeviation.toFixed(2)}ms`)
    console.log(`Coefficient of Variation: ${coefficientOfVariation.toFixed(2)}%`)
    
    // Measurements should be reasonably consistent (CV < 30%)
    expect(coefficientOfVariation).toBeLessThan(30)
  })
})