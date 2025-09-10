import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * E2E Tests for Error Handling Scenarios
 * 
 * These tests ensure the application gracefully handles various error conditions
 * and provides appropriate feedback to users. Tests cover:
 * 
 * - Empty prompt submissions
 * - Extremely long input validation
 * - Network error simulation (offline mode)
 * - Error boundary behavior
 * - Validation error messages
 * - Recovery mechanisms (retry functionality)
 * - Graceful degradation when services fail
 * - User-friendly error messaging
 */

// Test data for error scenarios
const errorTestData = {
  empty: '',
  tooLong: 'A'.repeat(10001), // Exceeds 10000 character limit
  extremelyLong: 'A'.repeat(50000), // Extremely long input
  specialChars: ''.repeat(100), // Unicode stress test
  invalidChars: String.fromCharCode(0, 1, 2, 3, 4, 5), // Control characters
  sqlInjection: "'; DROP TABLE users; --",
  xssAttempt: '<script>alert("xss")</script>',
  htmlInjection: '<img src="x" onerror="alert(1)">',
}

// Page Object Model for Error Handling
class ErrorHandlingPage {
  readonly page: Page
  readonly promptInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly validationError: Locator
  readonly networkErrorMessage: Locator
  readonly retryButton: Locator
  readonly characterCounter: Locator
  readonly loadingSpinner: Locator
  readonly errorBoundary: Locator
  readonly offlineIndicator: Locator
  readonly clearButton: Locator
  readonly errorAlert: Locator
  readonly errorDetails: Locator

  constructor(_page: Page) {
    this.page = page
    this.promptInput = page.locator('[data-testid="prompt-input"]')
    this.submitButton = page.locator('[data-testid="submit-button"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
    this.validationError = page.locator('[data-testid="validation-error"]')
    this.networkErrorMessage = page.locator('[data-testid="network-error"]')
    this.retryButton = page.locator('[data-testid="retry-button"]')
    this.characterCounter = page.locator('[data-testid="character-counter"]')
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]')
    this.errorBoundary = page.locator('[data-testid="error-boundary"]')
    this.offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    this.clearButton = page.locator('[data-testid="clear-button"]')
    this.errorAlert = page.locator('[role="alert"]')
    this.errorDetails = page.locator('[data-testid="error-details"]')
  }

  async navigateToHomepage() {
    await this.page.goto('/')
    await expect(this.page).toHaveTitle(/FixYourPrompts/)
  }

  async fillPrompt(text: string) {
    await this.promptInput.fill(text)
  }

  async submitPrompt() {
    await this.submitButton.click()
  }

  async waitForError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 })
  }

  async waitForValidationError() {
    await expect(this.validationError).toBeVisible({ timeout: 5000 })
  }

  async simulateNetworkError() {
    // Simulate network failure by going offline
    await this.page.context().setOffline(true)
  }

  async restoreNetwork() {
    // Restore network connection
    await this.page.context().setOffline(false)
  }

  async triggerComponentError() {
    // Trigger a component error through JavaScript injection
    await this.page.evaluate(() => {
      // Force a React error by corrupting the component state
      const element = document.querySelector('[data-testid="prompt-input"]')
      if (element) {
        // @ts-ignore - Intentionally trigger error
        element._reactInternalFiber = null
      }
    })
  }
}

test.describe('Error Handling Scenarios', () => {
  let errorPage: ErrorHandlingPage

  test.beforeEach(async ({ page }) => {
    errorPage = new ErrorHandlingPage(page)
    await errorPage.navigateToHomepage()
  })

  test.afterEach(async ({ page }) => {
    // Ensure network is restored after each test
    await page.context().setOffline(false)
  })

  test.describe('Input Validation Errors', () => {
    test('should show validation error for empty prompt submission', async () => {
      await test.step('Submit empty prompt', async () => {
        await errorPage.fillPrompt(errorTestData.empty)
        await errorPage.submitPrompt()
      })

      await test.step('Verify validation error appears', async () => {
        await errorPage.waitForValidationError()
        await expect(errorPage.validationError).toContainText(/prompt cannot be empty/i)
        await expect(errorPage.validationError).toBeVisible()
      })

      await test.step('Verify submit button remains enabled for correction', async () => {
        await expect(errorPage.submitButton).toBeEnabled()
      })
    })

    test('should show validation error for extremely long input', async () => {
      await test.step('Fill prompt with text exceeding 10000 characters', async () => {
        await errorPage.fillPrompt(errorTestData.tooLong)
      })

      await test.step('Verify character counter shows limit exceeded', async () => {
        await expect(errorPage.characterCounter).toContainText(/10001/)
        await expect(errorPage.characterCounter).toHaveClass(/error|exceeded/i)
      })

      await test.step('Attempt to submit and verify validation error', async () => {
        await errorPage.submitPrompt()
        await errorPage.waitForValidationError()
        await expect(errorPage.validationError).toContainText(/exceeds maximum length/i)
      })
    })

    test('should handle extremely long input gracefully', async () => {
      await test.step('Fill prompt with extremely long text', async () => {
        await errorPage.fillPrompt(errorTestData.extremelyLong)
      })

      await test.step('Verify application remains responsive', async () => {
        // Check that the input field is still functional
        await expect(errorPage.promptInput).toBeVisible()
        await expect(errorPage.submitButton).toBeVisible()
      })

      await test.step('Verify performance is not severely degraded', async () => {
        const startTime = Date.now()
        await errorPage.promptInput.focus()
        const endTime = Date.now()
        
        // Should respond within reasonable time (less than 2 seconds)
        expect(endTime - startTime).toBeLessThan(2000)
      })
    })

    test('should validate and sanitize special characters', async () => {
      const testCases = [
        { input: errorTestData.sqlInjection, name: 'SQL injection attempt' },
        { input: errorTestData.xssAttempt, name: 'XSS attempt' },
        { input: errorTestData.htmlInjection, name: 'HTML injection' },
        { input: errorTestData.invalidChars, name: 'Invalid control characters' },
      ]

      for (const testCase of testCases) {
        await test.step(`Handle ${testCase.name}`, async () => {
          await errorPage.fillPrompt(testCase.input)
          await errorPage.submitPrompt()
          
          // Should either show validation error or sanitize input
          // The page should not execute any malicious code
          await expect(errorPage.page).not.toHaveURL(/javascript:/i)
          
          // Clear for next test
          await errorPage.clearButton.click()
        })
      }
    })
  })

  test.describe('Network Error Handling', () => {
    test('should handle network errors gracefully when submitting prompts', async () => {
      await test.step('Fill valid prompt', async () => {
        await errorPage.fillPrompt('Write a short story about a robot')
      })

      await test.step('Simulate network failure', async () => {
        await errorPage.simulateNetworkError()
      })

      await test.step('Submit prompt and verify network error handling', async () => {
        await errorPage.submitPrompt()
        
        // Should show loading state initially
        await expect(errorPage.loadingSpinner).toBeVisible()
        
        // Then show network error
        await expect(errorPage.networkErrorMessage).toBeVisible({ timeout: 15000 })
        await expect(errorPage.networkErrorMessage).toContainText(/network error|connection failed|offline/i)
      })

      await test.step('Verify retry functionality is available', async () => {
        await expect(errorPage.retryButton).toBeVisible()
        await expect(errorPage.retryButton).toBeEnabled()
      })
    })

    test('should show offline indicator when network is unavailable', async () => {
      await test.step('Simulate going offline', async () => {
        await errorPage.simulateNetworkError()
      })

      await test.step('Verify offline indicator appears', async () => {
        await expect(errorPage.offlineIndicator).toBeVisible({ timeout: 5000 })
        await expect(errorPage.offlineIndicator).toContainText(/offline|no connection/i)
      })

      await test.step('Verify UI adapts to offline state', async () => {
        // Submit button should be disabled or show different state
        await errorPage.fillPrompt('Test prompt')
        await expect(errorPage.submitButton).toHaveAttribute('disabled', 'true')
      })
    })

    test('should recover when network is restored', async () => {
      let retryClicked = false

      await test.step('Setup network error scenario', async () => {
        await errorPage.fillPrompt('Test recovery prompt')
        await errorPage.simulateNetworkError()
        await errorPage.submitPrompt()
        await expect(errorPage.networkErrorMessage).toBeVisible({ timeout: 15000 })
      })

      await test.step('Restore network', async () => {
        await errorPage.restoreNetwork()
      })

      await test.step('Verify offline indicator disappears', async () => {
        await expect(errorPage.offlineIndicator).toBeHidden({ timeout: 5000 })
      })

      await test.step('Test retry functionality', async () => {
        await errorPage.retryButton.click()
        retryClicked = true
        
        // Should show loading state
        await expect(errorPage.loadingSpinner).toBeVisible()
        
        // Error message should disappear
        await expect(errorPage.networkErrorMessage).toBeHidden({ timeout: 10000 })
      })

      await test.step('Verify normal operation resumes', async () => {
        if (retryClicked) {
          // Should either show results or at least not show network errors
          await expect(errorPage.networkErrorMessage).toBeHidden()
          await expect(errorPage.submitButton).toBeEnabled()
        }
      })
    })
  })

  test.describe('Error Boundary Testing', () => {
    test('should catch and display component errors gracefully', async () => {
      await test.step('Trigger a component error', async () => {
        // Inject JavaScript to cause a React error
        await errorPage.page.evaluate(() => {
          // Create a custom error event
          const errorEvent = new ErrorEvent('error', {
            error: new Error('Simulated component error'),
            message: 'Component crashed during render'
          })
          window.dispatchEvent(errorEvent)
        })
      })

      await test.step('Verify error boundary catches the error', async () => {
        // Wait for error boundary to activate
        await expect(errorPage.errorBoundary).toBeVisible({ timeout: 5000 })
        await expect(errorPage.errorBoundary).toContainText(/something went wrong/i)
      })

      await test.step('Verify recovery options are available', async () => {
        // Should have a way to recover or reload
        const reloadButton = errorPage.page.locator('[data-testid="reload-button"]')
        const tryAgainButton = errorPage.page.locator('[data-testid="try-again-button"]')
        
        await expect(reloadButton.or(tryAgainButton)).toBeVisible()
      })
    })

    test('should provide error details for debugging', async () => {
      await test.step('Trigger error with detailed logging', async () => {
        await errorPage.page.route('**/api/**', route => {
          route.abort('failed')
        })
        
        await errorPage.fillPrompt('Test error details')
        await errorPage.submitPrompt()
      })

      await test.step('Verify error details are available', async () => {
        await expect(errorPage.errorMessage).toBeVisible({ timeout: 10000 })
        
        // Error details should be expandable or visible
        if (await errorPage.errorDetails.isVisible()) {
          await expect(errorPage.errorDetails).toContainText(/error|failed|details/i)
        }
      })
    })
  })

  test.describe('Service Degradation Handling', () => {
    test('should handle API service failures gracefully', async () => {
      await test.step('Mock API failure', async () => {
        await errorPage.page.route('**/api/analyze', route => {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' })
          })
        })
      })

      await test.step('Submit prompt and handle service error', async () => {
        await errorPage.fillPrompt('Test API failure handling')
        await errorPage.submitPrompt()
        
        await expect(errorPage.errorMessage).toBeVisible({ timeout: 10000 })
        await expect(errorPage.errorMessage).toContainText(/service temporarily unavailable|try again later/i)
      })

      await test.step('Verify graceful degradation', async () => {
        // Should offer alternative actions or clear error state
        await expect(errorPage.retryButton).toBeVisible()
        await expect(errorPage.clearButton).toBeVisible()
      })
    })

    test('should handle timeout errors appropriately', async () => {
      await test.step('Mock slow API response', async () => {
        await errorPage.page.route('**/api/**', async route => {
          // Delay response to trigger timeout
          await new Promise(resolve => setTimeout(resolve, 35000))
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ result: 'delayed response' })
          })
        })
      })

      await test.step('Submit prompt and verify timeout handling', async () => {
        await errorPage.fillPrompt('Test timeout handling')
        await errorPage.submitPrompt()
        
        // Should show loading initially
        await expect(errorPage.loadingSpinner).toBeVisible()
        
        // Should eventually show timeout error
        await expect(errorPage.errorMessage).toBeVisible({ timeout: 40000 })
        await expect(errorPage.errorMessage).toContainText(/timeout|taking too long/i)
      })
    })
  })

  test.describe('User Experience During Errors', () => {
    test('should maintain form state during error recovery', async () => {
      const testPrompt = 'This prompt should be preserved during errors'

      await test.step('Fill prompt and trigger error', async () => {
        await errorPage.fillPrompt(testPrompt)
        await errorPage.simulateNetworkError()
        await errorPage.submitPrompt()
        await expect(errorPage.networkErrorMessage).toBeVisible({ timeout: 15000 })
      })

      await test.step('Verify form state is preserved', async () => {
        const inputValue = await errorPage.promptInput.inputValue()
        expect(inputValue).toBe(testPrompt)
      })

      await test.step('Restore network and retry', async () => {
        await errorPage.restoreNetwork()
        await errorPage.retryButton.click()
        
        // Form should still have the original input
        const inputValueAfterRetry = await errorPage.promptInput.inputValue()
        expect(inputValueAfterRetry).toBe(testPrompt)
      })
    })

    test('should provide clear and actionable error messages', async () => {
      const errorScenarios = [
        {
          name: 'empty input',
          setup: () => errorPage.fillPrompt(''),
          expectedMessage: /prompt cannot be empty/i
        },
        {
          name: 'too long input',
          setup: () => errorPage.fillPrompt(errorTestData.tooLong),
          expectedMessage: /exceeds maximum length/i
        }
      ]

      for (const scenario of errorScenarios) {
        await test.step(`Test error message for ${scenario.name}`, async () => {
          await scenario.setup()
          await errorPage.submitPrompt()
          
          await expect(errorPage.validationError.or(errorPage.errorMessage)).toBeVisible()
          await expect(errorPage.validationError.or(errorPage.errorMessage)).toContainText(scenario.expectedMessage)
          
          // Clear for next test
          await errorPage.promptInput.clear()
        })
      }
    })

    test('should provide accessible error announcements', async () => {
      await test.step('Trigger validation error', async () => {
        await errorPage.fillPrompt('')
        await errorPage.submitPrompt()
      })

      await test.step('Verify error is announced to screen readers', async () => {
        // Check for ARIA live region or alert role
        await expect(errorPage.errorAlert).toBeVisible()
        await expect(errorPage.errorAlert).toHaveAttribute('role', 'alert')
      })

      await test.step('Verify error is associated with input field', async () => {
        // Check for aria-describedby or aria-invalid attributes
        await expect(errorPage.promptInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    test('should handle multiple consecutive errors without breaking', async () => {
      await test.step('Trigger multiple different errors', async () => {
        // Error 1: Empty input
        await errorPage.fillPrompt('')
        await errorPage.submitPrompt()
        await expect(errorPage.validationError).toBeVisible()
        
        // Error 2: Too long input
        await errorPage.fillPrompt(errorTestData.tooLong)
        await errorPage.submitPrompt()
        await expect(errorPage.validationError).toBeVisible()
        
        // Error 3: Network error
        await errorPage.fillPrompt('Valid prompt')
        await errorPage.simulateNetworkError()
        await errorPage.submitPrompt()
        await expect(errorPage.networkErrorMessage).toBeVisible({ timeout: 15000 })
      })

      await test.step('Verify application remains stable', async () => {
        await errorPage.restoreNetwork()
        await errorPage.fillPrompt('Final test prompt')
        
        // Application should still be responsive
        await expect(errorPage.promptInput).toBeEnabled()
        await expect(errorPage.submitButton).toBeEnabled()
      })
    })
  })

  test.describe('Error Recovery and Retry Mechanisms', () => {
    test('should implement exponential backoff for retries', async () => {
      let retryCount = 0
      const retryTimes: number[] = []

      await test.step('Mock API with retry counting', async () => {
        await errorPage.page.route('**/api/**', route => {
          retryCount++
          retryTimes.push(Date.now())
          
          if (retryCount < 3) {
            route.fulfill({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Temporary error' })
            })
          } else {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ result: 'Success after retries' })
            })
          }
        })
      })

      await test.step('Trigger retry mechanism', async () => {
        await errorPage.fillPrompt('Test retry mechanism')
        await errorPage.submitPrompt()
        
        // Should eventually succeed after retries
        await expect(errorPage.errorMessage).toBeHidden({ timeout: 30000 })
      })

      await test.step('Verify retry behavior', async () => {
        expect(retryCount).toBeGreaterThan(1)
        
        // Check if retries had increasing delays (exponential backoff)
        if (retryTimes.length > 2) {
          const firstDelay = retryTimes[1] - retryTimes[0]
          const secondDelay = retryTimes[2] - retryTimes[1]
          expect(secondDelay).toBeGreaterThan(firstDelay)
        }
      })
    })

    test('should limit retry attempts to prevent infinite loops', async () => {
      let attemptCount = 0

      await test.step('Mock API that always fails', async () => {
        await errorPage.page.route('**/api/**', route => {
          attemptCount++
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Persistent error' })
          })
        })
      })

      await test.step('Trigger retries and verify limit', async () => {
        await errorPage.fillPrompt('Test retry limits')
        await errorPage.submitPrompt()
        
        // Wait for final error state
        await expect(errorPage.errorMessage).toBeVisible({ timeout: 60000 })
        await expect(errorPage.errorMessage).toContainText(/unable to complete|maximum retries/i)
      })

      await test.step('Verify retry attempts were limited', async () => {
        // Should not exceed reasonable retry limit (e.g., 5 attempts)
        expect(attemptCount).toBeLessThanOrEqual(5)
        expect(attemptCount).toBeGreaterThan(1)
      })
    })
  })
})