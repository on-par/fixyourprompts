import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * E2E Tests for Prompt Refinement Journey
 * 
 * These tests define the complete user experience for the prompt refinement system.
 * Tests are written FIRST in TDD RED phase - they will fail until implementation is complete.
 * 
 * User Journey Tested:
 * 1. User lands on homepage
 * 2. User enters a prompt for analysis
 * 3. System analyzes prompt and provides feedback
 * 4. User sees refined suggestions and educational content
 * 5. User can interact with results (copy, compare, start new session)
 */

// Test data for various scenarios
const testPrompts = {
  basic: 'Write a story',
  detailed: 'Create a comprehensive marketing strategy for a new sustainable fashion brand targeting millennials',
  poor: 'make thing',
  technical: 'Debug my React component that shows error',
  empty: '',
  long: 'A'.repeat(2000), // Test character limits
  withSpecialChars: 'Write a story about "friendship" & <love> using 100% creativity!',
}

// Page Object Model for better test maintainability
class PromptRefinementPage {
  readonly page: Page
  readonly promptInput: Locator
  readonly submitButton: Locator
  readonly analysisProgress: Locator
  readonly analysisResults: Locator
  readonly refinedPrompts: Locator
  readonly educationalTips: Locator
  readonly copyButton: Locator
  readonly compareButton: Locator
  readonly newSessionButton: Locator
  readonly errorMessage: Locator
  readonly loadingSpinner: Locator

  constructor(_page: Page) {
    this.page = page
    this.promptInput = page.locator('[data-testid="prompt-input"]')
    this.submitButton = page.locator('[data-testid="submit-button"]')
    this.analysisProgress = page.locator('[data-testid="analysis-progress"]')
    this.analysisResults = page.locator('[data-testid="analysis-results"]')
    this.refinedPrompts = page.locator('[data-testid="refined-prompts"]')
    this.educationalTips = page.locator('[data-testid="educational-tips"]')
    this.copyButton = page.locator('[data-testid="copy-button"]')
    this.compareButton = page.locator('[data-testid="compare-button"]')
    this.newSessionButton = page.locator('[data-testid="new-session-button"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]')
  }

  async navigateToHome() {
    await this.page.goto('/')
  }

  async submitPrompt(prompt: string) {
    await this.promptInput.fill(prompt)
    await this.submitButton.click()
  }

  async waitForAnalysisComplete() {
    await expect(this.analysisProgress).toBeVisible()
    await expect(this.analysisResults).toBeVisible({ timeout: 10000 })
  }

  async copyRefinedPrompt() {
    await this.copyButton.click()
  }

  async startNewSession() {
    await this.newSessionButton.click()
  }

  async comparePrompts() {
    await this.compareButton.click()
  }
}

test.describe('Prompt Refinement Journey', () => {
  let promptPage: PromptRefinementPage

  test.beforeEach(async ({ page: _page }) => {
    promptPage = new PromptRefinementPage(_page)
    await promptPage.navigateToHome()
  })

  test.describe('Homepage and Initial Load', () => {
    test('should display homepage with proper title and meta information', async ({ page: _page }) => {
      // Validate page loads correctly
      await expect(_page).toHaveTitle(/Fix Your Prompts/i)
      
      // Check for essential meta tags for SEO and social sharing
      const metaDescription = _page.locator('meta[name="description"]')
      await expect(metaDescription).toHaveAttribute('content', /improve.*prompts/i)
      
      // Verify main heading is present and accessible
      const mainHeading = _page.locator('h1')
      await expect(mainHeading).toBeVisible()
      await expect(mainHeading).toContainText(/improve.*prompts/i)
    })

    test('should have accessible and functional prompt input interface', async ({ page: _page }) => {
      // Verify prompt input is properly labeled and accessible
      await expect(promptPage.promptInput).toBeVisible()
      await expect(promptPage.promptInput).toHaveAttribute('placeholder', /enter.*prompt/i)
      await expect(promptPage.promptInput).toHaveAccessibleName(/prompt/i)
      
      // Verify submit button is present and properly labeled
      await expect(promptPage.submitButton).toBeVisible()
      await expect(promptPage.submitButton).toHaveAccessibleName(/analyze|submit/i)
      
      // Initially submit button should be disabled for empty input
      await expect(promptPage.submitButton).toBeDisabled()
    })

    test('should enable submit button when user types valid input', async ({ page: _page }) => {
      // Button should be disabled initially
      await expect(promptPage.submitButton).toBeDisabled()
      
      // Button should enable when user types
      await promptPage.promptInput.fill('test prompt')
      await expect(promptPage.submitButton).toBeEnabled()
      
      // Button should disable again if input becomes empty
      await promptPage.promptInput.fill('')
      await expect(promptPage.submitButton).toBeDisabled()
    })
  })

  test.describe('Prompt Submission and Analysis', () => {
    test('should successfully analyze a well-structured prompt', async ({ page: _page }) => {
      // Submit a good prompt
      await promptPage.submitPrompt(testPrompts.detailed)
      
      // Should show loading state immediately
      await expect(promptPage.loadingSpinner).toBeVisible()
      await expect(promptPage.analysisProgress).toBeVisible()
      
      // Progress should indicate analysis steps
      await expect(promptPage.analysisProgress).toContainText(/analyzing/i)
      
      // Should complete analysis and show results
      await promptPage.waitForAnalysisComplete()
      
      // Results should contain analysis feedback
      await expect(promptPage.analysisResults).toContainText(/analysis|score|feedback/i)
      
      // Should show refined prompt suggestions
      await expect(promptPage.refinedPrompts).toBeVisible()
      await expect(promptPage.refinedPrompts).toContainText(/refined|improved|suggestion/i)
      
      // Should show educational tips
      await expect(promptPage.educationalTips).toBeVisible()
      await expect(promptPage.educationalTips).toContainText(/tip|advice|improve/i)
    })

    test('should provide helpful feedback for poorly structured prompts', async ({ page: _page }) => {
      // Submit a poor prompt
      await promptPage.submitPrompt(testPrompts.poor)
      
      await promptPage.waitForAnalysisComplete()
      
      // Should identify issues with the prompt
      await expect(promptPage.analysisResults).toContainText(/vague|unclear|specific|improve/i)
      
      // Should provide multiple refined alternatives
      const refinedOptions = promptPage.refinedPrompts.locator('[data-testid="refined-option"]')
      await expect(refinedOptions).toHaveCount.greaterThanOrEqual(2)
      
      // Each refined option should be substantially longer/better than original
      const firstOption = refinedOptions.first()
      await expect(firstOption).toContainText(/.*/) // Should have content
      const optionText = await firstOption.textContent()
      expect(optionText?.length).toBeGreaterThan(testPrompts.poor.length * 3)
    })

    test('should handle empty prompt submission gracefully', async ({ page: _page }) => {
      // Try to submit empty prompt
      await promptPage.promptInput.fill('')
      
      // Submit button should remain disabled
      await expect(promptPage.submitButton).toBeDisabled()
      
      // If somehow submitted, should show validation error
      await promptPage.promptInput.press('Enter')
      await expect(promptPage.errorMessage).toContainText(/required|empty/i)
    })

    test('should validate prompt length limits', async ({ page: _page }) => {
      // Test maximum length
      await promptPage.promptInput.fill(testPrompts.long)
      
      // Should show character counter
      const charCounter = _page.locator('[data-testid="character-counter"]')
      await expect(charCounter).toContainText(/2000/)
      
      // Should indicate if over limit
      if (testPrompts.long.length > 1500) {
        await expect(charCounter).toHaveClass(/warning|error/)
      }
    })

    test('should handle special characters and formatting correctly', async ({ page: _page }) => {
      await promptPage.submitPrompt(testPrompts.withSpecialChars)
      
      await promptPage.waitForAnalysisComplete()
      
      // Should preserve special characters in analysis
      await expect(promptPage.analysisResults).toContainText(/friendship.*love/i)
      
      // Refined prompts should handle special chars appropriately
      await expect(promptPage.refinedPrompts).toBeVisible()
    })
  })

  test.describe('Analysis Results Display', () => {
    test.beforeEach(async ({ page: _page }) => {
      await promptPage.submitPrompt(testPrompts.detailed)
      await promptPage.waitForAnalysisComplete()
    })

    test('should display comprehensive analysis breakdown', async ({ page: _page }) => {
      // Should show analysis score or rating
      const analysisScore = _page.locator('[data-testid="analysis-score"]')
      await expect(analysisScore).toBeVisible()
      
      // Should show specific improvement areas
      const improvementAreas = _page.locator('[data-testid="improvement-areas"]')
      await expect(improvementAreas).toBeVisible()
      
      // Should categorize feedback (e.g., clarity, specificity, context)
      const feedbackCategories = _page.locator('[data-testid="feedback-category"]')
      await expect(feedbackCategories).toHaveCount.greaterThanOrEqual(3)
    })

    test('should provide multiple refined prompt variations', async ({ page: _page }) => {
      // Should show at least 2-3 refined variations
      const variations = promptPage.refinedPrompts.locator('[data-testid="prompt-variation"]')
      await expect(variations).toHaveCount.greaterThanOrEqual(2)
      await expect(variations).toHaveCount.lessThanOrEqual(5)
      
      // Each variation should have a clear label/title
      for (let i = 0; i < 3; i++) {
        const variation = variations.nth(i)
        const title = variation.locator('[data-testid="variation-title"]')
        await expect(title).toBeVisible()
        await expect(title).toContainText(/.+/) // Should have meaningful title
      }
    })

    test('should display educational tips relevant to the prompt', async ({ page: _page }) => {
      // Tips should be contextually relevant
      await expect(promptPage.educationalTips).toBeVisible()
      
      const tipItems = promptPage.educationalTips.locator('[data-testid="tip-item"]')
      await expect(tipItems).toHaveCount.greaterThanOrEqual(3)
      
      // Each tip should be actionable
      const firstTip = tipItems.first()
      await expect(firstTip).toContainText(/specific|clear|context|example/i)
    })
  })

  test.describe('User Interactions with Results', () => {
    test.beforeEach(async ({ page: _page }) => {
      await promptPage.submitPrompt(testPrompts.detailed)
      await promptPage.waitForAnalysisComplete()
    })

    test('should allow users to copy refined prompts to clipboard', async ({ page: _page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-write', 'clipboard-read'])
      
      // Click copy button
      await promptPage.copyButton.click()
      
      // Should show success feedback
      const successMessage = _page.locator('[data-testid="copy-success"]')
      await expect(successMessage).toBeVisible()
      await expect(successMessage).toContainText(/copied/i)
      
      // Verify clipboard content (if accessible)
      const clipboardText = await _page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText.length).toBeGreaterThan(10) // Should contain meaningful content
    })

    test('should provide side-by-side comparison of original and refined prompts', async ({ page: _page }) => {
      await promptPage.compareButton.click()
      
      // Should open comparison view
      const comparisonModal = _page.locator('[data-testid="comparison-modal"]')
      await expect(comparisonModal).toBeVisible()
      
      // Should show original prompt
      const originalPrompt = comparisonModal.locator('[data-testid="original-prompt"]')
      await expect(originalPrompt).toContainText(testPrompts.detailed)
      
      // Should show refined version
      const refinedPrompt = comparisonModal.locator('[data-testid="refined-prompt"]')
      await expect(refinedPrompt).toBeVisible()
      
      // Should highlight differences or improvements
      const improvements = comparisonModal.locator('[data-testid="improvement-highlight"]')
      await expect(improvements).toHaveCount.greaterThanOrEqual(1)
    })

    test('should allow users to start a new refinement session', async ({ page: _page }) => {
      await promptPage.startNewSession()
      
      // Should clear previous results
      await expect(promptPage.analysisResults).not.toBeVisible()
      await expect(promptPage.refinedPrompts).not.toBeVisible()
      
      // Should reset to initial state
      await expect(promptPage.promptInput).toBeEmpty()
      await expect(promptPage.submitButton).toBeDisabled()
      
      // Should be ready for new input
      await promptPage.promptInput.fill('new test prompt')
      await expect(promptPage.submitButton).toBeEnabled()
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network failures gracefully', async ({ page: _page }) => {
      // Simulate network failure
      await _page.route('**/api/analyze', route => route.abort())
      
      await promptPage.submitPrompt(testPrompts.basic)
      
      // Should show error message
      await expect(promptPage.errorMessage).toBeVisible()
      await expect(promptPage.errorMessage).toContainText(/network|error|try again/i)
      
      // Should provide retry option
      const retryButton = _page.locator('[data-testid="retry-button"]')
      await expect(retryButton).toBeVisible()
    })

    test('should handle server errors with user-friendly messages', async ({ page: _page }) => {
      // Simulate server error
      await _page.route('**/api/analyze', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      )
      
      await promptPage.submitPrompt(testPrompts.basic)
      
      // Should show appropriate error message
      await expect(promptPage.errorMessage).toBeVisible()
      await expect(promptPage.errorMessage).toContainText(/server|unavailable|later/i)
    })

    test('should handle timeout scenarios', async ({ page: _page }) => {
      // Simulate slow response
      await _page.route('**/api/analyze', route => 
        new Promise(resolve => setTimeout(() => resolve(route.continue()), 15000))
      )
      
      await promptPage.submitPrompt(testPrompts.basic)
      
      // Should show timeout message after reasonable wait
      await expect(promptPage.errorMessage).toBeVisible({ timeout: 12000 })
      await expect(promptPage.errorMessage).toContainText(/timeout|taking longer/i)
    })

    test('should validate and sanitize user input', async ({ page: _page }) => {
      const maliciousInput = '<script>alert("xss")</script>Analyze this prompt'
      
      await promptPage.submitPrompt(maliciousInput)
      
      // Should not execute scripts
      const alerts = []
      _page.on('dialog', dialog => {
        alerts.push(dialog.message())
        dialog.dismiss()
      })
      
      await _page.waitForTimeout(1000)
      expect(alerts).toHaveLength(0)
      
      // Should still process the legitimate part of the input
      await promptPage.waitForAnalysisComplete()
      await expect(promptPage.analysisResults).toBeVisible()
    })
  })

  test.describe('Responsive Design and Mobile Experience', () => {
    test('should work correctly on mobile devices', async ({ page: _page }) => {
      await _page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      
      // All key elements should be visible and accessible
      await expect(promptPage.promptInput).toBeVisible()
      await expect(promptPage.submitButton).toBeVisible()
      
      // Input should be appropriately sized
      const inputBox = await promptPage.promptInput.boundingBox()
      expect(inputBox?.width).toBeLessThan(350) // Should fit in mobile viewport
      
      // Submit a prompt and verify mobile layout
      await promptPage.submitPrompt(testPrompts.basic)
      await promptPage.waitForAnalysisComplete()
      
      // Results should be readable on mobile
      await expect(promptPage.analysisResults).toBeVisible()
      await expect(promptPage.refinedPrompts).toBeVisible()
    })

    test('should work correctly on tablet devices', async ({ page: _page }) => {
      await _page.setViewportSize({ width: 768, height: 1024 }) // iPad
      
      await promptPage.submitPrompt(testPrompts.detailed)
      await promptPage.waitForAnalysisComplete()
      
      // Should utilize tablet space effectively
      const resultsBox = await promptPage.analysisResults.boundingBox()
      expect(resultsBox?.width).toBeGreaterThan(400)
    })

    test('should adapt layout for different screen sizes', async ({ page: _page }) => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1366, height: 768 },  // Laptop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 },   // Mobile
      ]
      
      for (const viewport of viewports) {
        await _page.setViewportSize(viewport)
        
        // Key elements should always be accessible
        await expect(promptPage.promptInput).toBeVisible()
        await expect(promptPage.submitButton).toBeVisible()
        
        // No horizontal scrolling should be needed
        const bodyWidth = await _page.evaluate(() => document.body.scrollWidth)
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20) // Small tolerance
      }
    })
  })

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should be fully navigable with keyboard only', async ({ page: _page }) => {
      // Tab through all interactive elements
      await _page.keyboard.press('Tab')
      await expect(promptPage.promptInput).toBeFocused()
      
      await _page.keyboard.press('Tab')
      await expect(promptPage.submitButton).toBeFocused()
      
      // Should be able to submit with Enter
      await promptPage.promptInput.focus()
      await _page.keyboard.type(testPrompts.basic)
      await _page.keyboard.press('Enter')
      
      await promptPage.waitForAnalysisComplete()
      
      // Should be able to navigate results with keyboard
      await _page.keyboard.press('Tab')
      const focusedElement = _page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })

    test('should have proper ARIA labels and roles', async ({ page: _page }) => {
      // Check main interactive elements have proper labels
      await expect(promptPage.promptInput).toHaveAttribute('aria-label')
      await expect(promptPage.submitButton).toHaveAttribute('aria-label')
      
      // Submit and check results have proper structure
      await promptPage.submitPrompt(testPrompts.basic)
      await promptPage.waitForAnalysisComplete()
      
      // Results should have proper heading structure
      const headings = _page.locator('h1, h2, h3, h4, h5, h6')
      await expect(headings).toHaveCount.greaterThanOrEqual(2)
      
      // Interactive elements should have proper roles
      await expect(promptPage.copyButton).toHaveAttribute('role', 'button')
    })

    test('should support screen readers with proper announcements', async ({ page: _page }) => {
      // Submit prompt
      await promptPage.submitPrompt(testPrompts.basic)
      
      // Progress should be announced to screen readers
      await expect(promptPage.analysisProgress).toHaveAttribute('aria-live', 'polite')
      
      // Results should be properly announced
      await promptPage.waitForAnalysisComplete()
      await expect(promptPage.analysisResults).toHaveAttribute('aria-live')
      
      // Success messages should be announced
      await _page.evaluate(() => {
        // Simulate clipboard permissions for this test
        Object.assign(navigator, {
          clipboard: {
            writeText: () => Promise.resolve()
          }
        })
      })
      
      await promptPage.copyButton.click()
      const successMessage = _page.locator('[data-testid="copy-success"]')
      await expect(successMessage).toHaveAttribute('aria-live', 'assertive')
    })
  })

  test.describe('Performance and Loading States', () => {
    test('should load homepage within performance budget', async ({ page: _page }) => {
      const startTime = Date.now()
      await promptPage.navigateToHome()
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds on reasonable connection
      expect(loadTime).toBeLessThan(3000)
      
      // Core Web Vitals - LCP should be reasonable
      const lcp = await _page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            resolve(lastEntry.startTime)
          }).observe({ entryTypes: ['largest-contentful-paint'] })
        })
      })
      
      expect(lcp).toBeLessThan(2500) // 2.5s LCP threshold
    })

    test('should provide immediate feedback for user interactions', async ({ page: _page }) => {
      // Click submit should show loading state immediately
      await promptPage.promptInput.fill(testPrompts.basic)
      
      const submitTime = Date.now()
      await promptPage.submitButton.click()
      
      // Loading state should appear within 100ms
      await expect(promptPage.loadingSpinner).toBeVisible({ timeout: 100 })
      const feedbackTime = Date.now() - submitTime
      expect(feedbackTime).toBeLessThan(100)
    })

    test('should handle concurrent requests properly', async ({ page: _page, context }) => {
      // Open multiple tabs with same analysis
      const page2 = await context.newPage()
      const promptPage2 = new PromptRefinementPage(page2)
      await promptPage2.navigateToHome()
      
      // Submit same prompt from both tabs simultaneously
      await Promise.all([
        promptPage.submitPrompt(testPrompts.basic),
        promptPage2.submitPrompt(testPrompts.basic)
      ])
      
      // Both should complete successfully
      await Promise.all([
        promptPage.waitForAnalysisComplete(),
        promptPage2.waitForAnalysisComplete()
      ])
      
      await expect(promptPage.analysisResults).toBeVisible()
      await expect(promptPage2.analysisResults).toBeVisible()
      
      await page2.close()
    })
  })

  test.describe('Session Persistence and Data Management', () => {
    test('should persist analysis results across page refreshes', async ({ page: _page }) => {
      await promptPage.submitPrompt(testPrompts.detailed)
      await promptPage.waitForAnalysisComplete()
      
      // Store some result text to compare after refresh
      const originalAnalysis = await promptPage.analysisResults.textContent()
      
      // Refresh page
      await _page.reload()
      
      // Results should be restored from local storage
      await expect(promptPage.analysisResults).toBeVisible()
      await expect(promptPage.analysisResults).toContainText(originalAnalysis?.substring(0, 50) || '')
    })

    test('should handle session storage limits gracefully', async ({ page: _page }) => {
      // Fill up local storage with large analysis results
      await _page.evaluate(() => {
        for (let i = 0; i < 50; i++) {
          localStorage.setItem(`test_${i}`, 'x'.repeat(10000))
        }
      })
      
      // Submit prompt - should still work despite storage pressure
      await promptPage.submitPrompt(testPrompts.basic)
      await promptPage.waitForAnalysisComplete()
      
      // Should manage storage automatically
      await expect(promptPage.analysisResults).toBeVisible()
    })

    test('should clear sensitive data appropriately', async ({ page: _page }) => {
      await promptPage.submitPrompt(testPrompts.detailed)
      await promptPage.waitForAnalysisComplete()
      
      // Start new session
      await promptPage.startNewSession()
      
      // Previous analysis should be cleared from memory
      await expect(promptPage.analysisResults).not.toBeVisible()
      
      // But should maintain user preferences/settings
      const _theme = localStorage.getItem('theme')
      // Theme or other preferences should persist if they were set
    })
  })
})