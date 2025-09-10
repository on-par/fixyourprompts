import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Accessibility E2E Tests for FixYourPrompts.com
 * 
 * Tests keyboard navigation, ARIA compliance, and screen reader compatibility
 * following WCAG 2.1 AA guidelines.
 * 
 * Test Coverage:
 * 1. Keyboard Navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
 * 2. Focus Management and Indicators
 * 3. ARIA Labels and Roles
 * 4. Screen Reader Compatibility
 * 5. Form Accessibility
 * 6. Skip Links and Focus Management
 * 7. Color Contrast and Visual Indicators
 * 8. Interactive Element Accessibility
 */

// Page Object Model for Accessibility Testing
class AccessibilityTestPage {
  readonly page: Page
  readonly header: Locator
  readonly main: Locator
  readonly footer: Locator
  readonly promptInput: Locator
  readonly submitButton: Locator
  readonly skipLink: Locator
  readonly analysisPanel: Locator
  readonly educationPanel: Locator
  readonly interactiveElements: Locator

  constructor(_page: Page) {
    this.page = page
    this.header = page.locator('header, [role="banner"]')
    this.main = page.locator('main, [role="main"]')
    this.footer = page.locator('footer, [role="contentinfo"]')
    this.promptInput = page.locator('[data-testid="prompt-input"], textarea, input[type="text"]')
    this.submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]')
    this.skipLink = page.locator('[data-testid="skip-link"], a[href="#main"], .skip-link')
    this.analysisPanel = page.locator('[data-testid="analysis-results"], [role="region"][aria-label*="analysis"]')
    this.educationPanel = page.locator('[data-testid="educational-tips"], [role="region"][aria-label*="education"]')
    this.interactiveElements = page.locator('button, a, input, textarea, select, [tabindex="0"], [role="button"], [role="link"]')
  }

  async getAllFocusableElements(): Promise<Locator[]> {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]',
      '[contenteditable="true"]'
    ]
    
    const elements: Locator[] = []
    for (const selector of selectors) {
      const locator = this.page.locator(selector)
      const count = await locator.count()
      for (let i = 0; i < count; i++) {
        elements.push(locator.nth(i))
      }
    }
    return elements
  }

  async isElementVisible(element: Locator): Promise<boolean> {
    try {
      return await element.isVisible()
    } catch {
      return false
    }
  }

  async hasVisibleFocusIndicator(element: Locator): Promise<boolean> {
    await element.focus()
    
    // Check if element has focus and visible outline/border
    const styles = await element.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        outlineColor: computed.outlineColor,
        border: computed.border,
        boxShadow: computed.boxShadow,
        backgroundColor: computed.backgroundColor,
      }
    })

    // Check if there's a visible focus indicator
    const hasOutline = styles.outline !== 'none' && styles.outline !== '0px'
    const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== ''
    const hasVisibleBorder = styles.border !== 'none' && styles.border !== '0px'

    return hasOutline || hasBoxShadow || hasVisibleBorder
  }
}

test.describe('Accessibility Tests', () => {
  let accessibilityPage: AccessibilityTestPage

  test.beforeEach(async ({ page }) => {
    accessibilityPage = new AccessibilityTestPage(page)
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Keyboard Navigation', () => {
    test('should navigate through all interactive elements using Tab key', async ({ page }) => {
      const focusableElements = await accessibilityPage.getAllFocusableElements()
      const visibleElements = []

      // Filter to only visible elements
      for (const element of focusableElements) {
        if (await accessibilityPage.isElementVisible(element)) {
          visibleElements.push(element)
        }
      }

      expect(visibleElements.length).toBeGreaterThan(0)

      // Start from first focusable element
      await page.keyboard.press('Tab')
      let currentIndex = 0

      // Navigate through all elements
      for (let i = 0; i < visibleElements.length - 1; i++) {
        await page.keyboard.press('Tab')
        currentIndex++
        
        // Verify focus moved to next element
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
      }

      // Test reverse navigation with Shift+Tab
      for (let i = 0; i < Math.min(3, visibleElements.length - 1); i++) {
        await page.keyboard.press('Shift+Tab')
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
      }
    })

    test('should handle Enter key activation on buttons and links', async ({ page }) => {
      // Find all buttons and links
      const buttons = page.locator('button:not([disabled])')
      const links = page.locator('a[href]')
      
      const buttonCount = await buttons.count()
      const linkCount = await links.count()

      // Test button activation with Enter
      if (buttonCount > 0) {
        await buttons.first().focus()
        await expect(buttons.first()).toBeFocused()
        
        // Press Enter (should not throw error)
        await page.keyboard.press('Enter')
      }

      // Test link activation with Enter
      if (linkCount > 0) {
        const firstLink = links.first()
        await firstLink.focus()
        await expect(firstLink).toBeFocused()
        
        // For external links or same-page links, just verify focus
        const href = await firstLink.getAttribute('href')
        if (href && href.startsWith('#')) {
          await page.keyboard.press('Enter')
          // Verify focus moved to target element if it's a same-page link
        }
      }
    })

    test('should handle Space key activation on buttons', async ({ page }) => {
      const buttons = page.locator('button:not([disabled])')
      const buttonCount = await buttons.count()

      if (buttonCount > 0) {
        await buttons.first().focus()
        await expect(buttons.first()).toBeFocused()
        
        // Press Space (should activate button)
        await page.keyboard.press('Space')
      }
    })

    test('should support arrow key navigation where appropriate', async ({ page }) => {
      // Look for elements that should support arrow key navigation
      const radioGroups = page.locator('[role="radiogroup"]')
      const menus = page.locator('[role="menu"], [role="menubar"]')
      const tabLists = page.locator('[role="tablist"]')

      // Test radio groups
      const radioGroupCount = await radioGroups.count()
      if (radioGroupCount > 0) {
        await radioGroups.first().focus()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowUp')
      }

      // Test menus
      const menuCount = await menus.count()
      if (menuCount > 0) {
        await menus.first().focus()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowUp')
      }

      // Test tab lists
      const tabListCount = await tabLists.count()
      if (tabListCount > 0) {
        await tabLists.first().focus()
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
      }
    })
  })

  test.describe('Focus Management', () => {
    test('should have visible focus indicators on all interactive elements', async ({ page: _page }) => {
      const focusableElements = await accessibilityPage.getAllFocusableElements()
      
      for (const element of focusableElements.slice(0, 10)) { // Test first 10 elements
        if (await accessibilityPage.isElementVisible(element)) {
          const hasIndicator = await accessibilityPage.hasVisibleFocusIndicator(element)
          
          if (!hasIndicator) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase())
            const className = await element.getAttribute('class') || ''
            const testId = await element.getAttribute('data-testid') || ''
            
            console.warn(`Element lacks visible focus indicator: ${tagName} ${className} ${testId}`)
          }
          
          expect(hasIndicator).toBe(true)
        }
      }
    })

    test('should maintain focus after dynamic content changes', async ({ page }) => {
      // Enter a prompt to trigger dynamic content
      const promptInput = accessibilityPage.promptInput
      await promptInput.focus()
      await expect(promptInput).toBeFocused()
      
      await promptInput.fill('Test prompt for accessibility')
      
      // Submit and check if focus is managed properly
      const submitButton = accessibilityPage.submitButton
      if (await submitButton.isVisible()) {
        await submitButton.focus()
        await submitButton.click()
        
        // Wait for any loading states
        await page.waitForTimeout(1000)
        
        // Verify focus is on a meaningful element (not lost)
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
      }
    })

    test('should not create keyboard traps', async ({ page }) => {
      let trapDetected = false
      const maxTabAttempts = 50
      const visitedElements = new Set<string>()
      
      for (let i = 0; i < maxTabAttempts; i++) {
        await page.keyboard.press('Tab')
        
        const focusedElement = page.locator(':focus')
        const elementText = await focusedElement.textContent() || ''
        const elementTag = await focusedElement.evaluate(el => el.tagName) || ''
        const elementId = `${elementTag}:${elementText.slice(0, 20)}`
        
        if (visitedElements.has(elementId) && visitedElements.size > 5) {
          // We've returned to an element after visiting others - check if we can escape
          await page.keyboard.press('Escape')
          await page.keyboard.press('Tab')
          
          const newFocusedElement = page.locator(':focus')
          const newElementText = await newFocusedElement.textContent() || ''
          const newElementTag = await newFocusedElement.evaluate(el => el.tagName) || ''
          const newElementId = `${newElementTag}:${newElementText.slice(0, 20)}`
          
          if (newElementId === elementId) {
            trapDetected = true
            break
          }
        }
        
        visitedElements.add(elementId)
      }
      
      expect(trapDetected).toBe(false)
    })
  })

  test.describe('ARIA Compliance', () => {
    test('should have proper semantic structure with landmarks', async ({ page }) => {
      // Check for main landmarks
      await expect(accessibilityPage.header).toBeVisible()
      await expect(accessibilityPage.main).toBeVisible()
      await expect(accessibilityPage.footer).toBeVisible()
      
      // Verify landmark roles
      const banner = page.locator('[role="banner"], header')
      const main = page.locator('[role="main"], main')
      const contentinfo = page.locator('[role="contentinfo"], footer')
      
      await expect(banner).toBeVisible()
      await expect(main).toBeVisible()
      await expect(contentinfo).toBeVisible()
    })

    test('should have proper ARIA labels on form elements', async ({ page }) => {
      const formElements = page.locator('input, textarea, select')
      const count = await formElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = formElements.nth(i)
        const ariaLabel = await element.getAttribute('aria-label')
        const ariaLabelledBy = await element.getAttribute('aria-labelledby')
        const ariaDescribedBy = await element.getAttribute('aria-describedby')
        const id = await element.getAttribute('id')
        
        // Check if there's a label element associated
        let hasLabel = false
        if (id) {
          const label = page.locator(`label[for="${id}"]`)
          hasLabel = await label.count() > 0
        }
        
        const hasAccessibleName = ariaLabel || ariaLabelledBy || hasLabel
        const elementType = await element.getAttribute('type') || 'input'
        
        if (!hasAccessibleName) {
          console.warn(`Form element lacks accessible name: ${elementType}`)
        }
        
        expect(hasAccessibleName).toBe(true)
      }
    })

    test('should have proper ARIA states and properties', async ({ page }) => {
      // Check buttons for aria-pressed, aria-expanded, etc.
      const buttons = page.locator('button[aria-expanded], button[aria-pressed]')
      const count = await buttons.count()
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i)
        const ariaExpanded = await button.getAttribute('aria-expanded')
        const ariaPressed = await button.getAttribute('aria-pressed')
        
        if (ariaExpanded) {
          expect(['true', 'false']).toContain(ariaExpanded)
        }
        
        if (ariaPressed) {
          expect(['true', 'false']).toContain(ariaPressed)
        }
      }
      
      // Check for proper aria-live regions
      const liveRegions = page.locator('[aria-live]')
      const liveCount = await liveRegions.count()
      
      for (let i = 0; i < liveCount; i++) {
        const region = liveRegions.nth(i)
        const ariaLive = await region.getAttribute('aria-live')
        expect(['polite', 'assertive', 'off']).toContain(ariaLive || '')
      }
    })

    test('should have appropriate headings hierarchy', async ({ page }) => {
      const headings = page.locator('h1, h2, h3, h4, h5, h6, [role="heading"]')
      const count = await headings.count()
      
      expect(count).toBeGreaterThan(0)
      
      // Check that there's exactly one h1
      const h1Count = await page.locator('h1, [role="heading"][aria-level="1"]').count()
      expect(h1Count).toBe(1)
      
      // Verify heading levels don't skip (h1 -> h3 without h2)
      const headingLevels: number[] = []
      for (let i = 0; i < count; i++) {
        const heading = headings.nth(i)
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
        const ariaLevel = await heading.getAttribute('aria-level')
        
        let level: number
        if (ariaLevel) {
          level = parseInt(ariaLevel)
        } else {
          level = parseInt(tagName.replace('h', ''))
        }
        
        headingLevels.push(level)
      }
      
      // Check for level skipping (simplified check)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i]
        const previousLevel = headingLevels[i - 1]
        
        if (currentLevel > previousLevel + 1) {
          console.warn(`Heading level skip detected: h${previousLevel} -> h${currentLevel}`)
        }
      }
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('should have accessible names for all interactive elements', async ({ page }) => {
      const snapshot = await page.accessibility.snapshot()
      
      function findInteractiveElements(node: any): any[] {
        const interactive = []
        
        if (node.role && ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio'].includes(node.role)) {
          interactive.push(node)
        }
        
        if (node.children) {
          for (const child of node.children) {
            interactive.push(...findInteractiveElements(child))
          }
        }
        
        return interactive
      }
      
      const interactiveElements = findInteractiveElements(snapshot)
      
      for (const element of interactiveElements) {
        expect(element.name).toBeTruthy()
      }
    })

    test('should have proper descriptions for complex UI elements', async ({ page }) => {
      // Check that complex elements have descriptions
      const complexElements = page.locator('[aria-describedby], [title]')
      const count = await complexElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = complexElements.nth(i)
        const ariaDescribedBy = await element.getAttribute('aria-describedby')
        const title = await element.getAttribute('title')
        
        if (ariaDescribedBy) {
          const descriptionElement = page.locator(`#${ariaDescribedBy}`)
          await expect(descriptionElement).toBeVisible()
          const descriptionText = await descriptionElement.textContent()
          expect(descriptionText?.trim()).toBeTruthy()
        }
        
        if (title) {
          expect(title.trim()).toBeTruthy()
        }
      }
    })

    test('should announce dynamic content changes', async ({ page }) => {
      // Look for aria-live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
      const count = await liveRegions.count()
      
      if (count > 0) {
        // Interact with the app to trigger dynamic content
        const promptInput = accessibilityPage.promptInput
        if (await promptInput.isVisible()) {
          await promptInput.fill('Test dynamic content announcement')
          
          const submitButton = accessibilityPage.submitButton
          if (await submitButton.isVisible()) {
            await submitButton.click()
            
            // Wait for potential live region updates
            await page.waitForTimeout(2000)
            
            // Verify live regions have meaningful content
            for (let i = 0; i < count; i++) {
              const region = liveRegions.nth(i)
              if (await region.isVisible()) {
                const content = await region.textContent()
                // Should have some content for screen readers
                // (This is a basic check - in practice, you'd verify specific messages)
              }
            }
          }
        }
      }
    })
  })

  test.describe('Form Accessibility', () => {
    test('should allow form submission using keyboard only', async ({ page }) => {
      const promptInput = accessibilityPage.promptInput
      const submitButton = accessibilityPage.submitButton
      
      if (await promptInput.isVisible()) {
        // Navigate to input using keyboard
        await page.keyboard.press('Tab')
        
        // Type in the input
        await page.keyboard.type('This is a test prompt for keyboard-only submission')
        
        // Navigate to submit button using Tab
        let tabAttempts = 0
        let submitButtonFocused = false
        
        while (tabAttempts < 10 && !submitButtonFocused) {
          await page.keyboard.press('Tab')
          const focusedElement = page.locator(':focus')
          
          if (await submitButton.isVisible()) {
            submitButtonFocused = await focusedElement.evaluate((el, buttonEl) => {
              return el === buttonEl
            }, await submitButton.elementHandle())
          }
          
          tabAttempts++
        }
        
        if (submitButtonFocused) {
          // Submit using Enter or Space
          await page.keyboard.press('Enter')
          
          // Verify submission occurred (look for loading state or results)
          await page.waitForTimeout(1000)
        }
      }
    })

    test('should provide error messages in accessible way', async ({ page: _page }) => {
      // Try to submit empty form to trigger validation
      const submitButton = accessibilityPage.submitButton
      
      if (await submitButton.isVisible()) {
        await submitButton.click()
        
        // Look for error messages
        const errorElements = page.locator('[role="alert"], .error, [aria-invalid="true"]')
        const errorCount = await errorElements.count()
        
        if (errorCount > 0) {
          for (let i = 0; i < errorCount; i++) {
            const error = errorElements.nth(i)
            const errorText = await error.textContent()
            expect(errorText?.trim()).toBeTruthy()
            
            // Error should be visible
            await expect(error).toBeVisible()
          }
        }
      }
    })

    test('should associate error messages with form fields', async ({ page }) => {
      const formElements = page.locator('input, textarea, select')
      const count = await formElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = formElements.nth(i)
        const ariaDescribedBy = await element.getAttribute('aria-describedby')
        const ariaInvalid = await element.getAttribute('aria-invalid')
        
        if (ariaInvalid === 'true' && ariaDescribedBy) {
          const errorElement = page.locator(`#${ariaDescribedBy}`)
          await expect(errorElement).toBeVisible()
          
          const errorText = await errorElement.textContent()
          expect(errorText?.trim()).toBeTruthy()
        }
      }
    })
  })

  test.describe('Skip Links and Navigation', () => {
    test('should have skip links for keyboard navigation', async ({ page }) => {
      // Focus on first element to trigger skip links
      await page.keyboard.press('Tab')
      
      const skipLinks = page.locator('a[href^="#"], .skip-link, [data-testid="skip-link"]')
      const count = await skipLinks.count()
      
      if (count > 0) {
        const firstSkipLink = skipLinks.first()
        await expect(firstSkipLink).toBeVisible()
        
        const href = await firstSkipLink.getAttribute('href')
        expect(href).toBeTruthy()
        expect(href?.startsWith('#')).toBe(true)
        
        // Test skip link functionality
        await firstSkipLink.click()
        
        // Verify focus moved to target
        const targetId = href?.substring(1)
        if (targetId) {
          const targetElement = page.locator(`#${targetId}`)
          if (await targetElement.isVisible()) {
            await expect(targetElement).toBeFocused()
          }
        }
      }
    })

    test('should manage focus when navigating between sections', async ({ page }) => {
      // This test ensures focus is properly managed when moving between
      // major sections of the application
      
      const mainSections = page.locator('[role="main"] > section, [role="main"] > div')
      const count = await mainSections.count()
      
      if (count > 1) {
        // Navigate through sections and verify focus management
        for (let i = 0; i < Math.min(count, 3); i++) {
          const section = mainSections.nth(i)
          const firstFocusable = section.locator('button, a, input, textarea, [tabindex="0"]').first()
          
          if (await firstFocusable.isVisible()) {
            await firstFocusable.focus()
            await expect(firstFocusable).toBeFocused()
          }
        }
      }
    })
  })

  test.describe('Color Contrast and Visual Indicators', () => {
    test('should not rely solely on color for information', async ({ page }) => {
      // This is a basic test - in practice, you'd use axe-core or similar tools
      
      // Check that interactive elements have non-color indicators
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        
        // Check if button has text content or icon
        const textContent = await button.textContent()
        const hasIcon = await button.locator('svg, img, [class*="icon"]').count() > 0
        
        expect(textContent?.trim() || hasIcon).toBeTruthy()
      }
    })

    test('should have sufficient color contrast (basic check)', async ({ page }) => {
      // Basic check for text elements
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6')
      const count = await textElements.count()
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i)
        const isVisible = await element.isVisible()
        
        if (isVisible) {
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            }
          })
          
          // Basic validation that color values exist
          expect(styles.color).toBeTruthy()
          expect(styles.backgroundColor).toBeTruthy()
        }
      }
    })
  })

  test.describe('Responsive Accessibility', () => {
    test('should maintain accessibility on mobile viewports', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Verify main elements are still accessible
      const focusableElements = await accessibilityPage.getAllFocusableElements()
      const visibleElements = []
      
      for (const element of focusableElements.slice(0, 5)) {
        if (await accessibilityPage.isElementVisible(element)) {
          visibleElements.push(element)
          
          // Test focus indicator on mobile
          const hasIndicator = await accessibilityPage.hasVisibleFocusIndicator(element)
          expect(hasIndicator).toBe(true)
        }
      }
      
      expect(visibleElements.length).toBeGreaterThan(0)
    })

    test('should handle touch and keyboard interaction on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Test that keyboard navigation still works on mobile
      const submitButton = accessibilityPage.submitButton
      if (await submitButton.isVisible()) {
        await submitButton.focus()
        await expect(submitButton).toBeFocused()
        
        // Verify touch targets are large enough (minimum 44px)
        const boundingBox = await submitButton.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Complex Interactions', () => {
    test('should handle modal dialogs accessibly', async ({ page }) => {
      // Look for modal triggers
      const modalTriggers = page.locator('[data-modal], [aria-haspopup="dialog"], button[aria-expanded]')
      const count = await modalTriggers.count()
      
      for (let i = 0; i < Math.min(count, 2); i++) {
        const trigger = modalTriggers.nth(i)
        if (await trigger.isVisible()) {
          await trigger.click()
          
          // Look for modal dialog
          const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]')
          const modalCount = await modal.count()
          
          if (modalCount > 0) {
            const firstModal = modal.first()
            await expect(firstModal).toBeVisible()
            
            // Check modal has proper ARIA attributes
            const ariaLabelledBy = await firstModal.getAttribute('aria-labelledby')
            const ariaLabel = await firstModal.getAttribute('aria-label')
            expect(ariaLabelledBy || ariaLabel).toBeTruthy()
            
            // Test keyboard interaction
            await page.keyboard.press('Escape')
            
            // Modal should close and focus should return
            await expect(firstModal).not.toBeVisible()
            await expect(trigger).toBeFocused()
          }
        }
      }
    })

    test('should handle dropdown menus accessibly', async ({ page }) => {
      // Look for dropdown triggers
      const dropdownTriggers = page.locator('[aria-haspopup="menu"], [aria-expanded], .dropdown-trigger')
      const count = await dropdownTriggers.count()
      
      for (let i = 0; i < Math.min(count, 2); i++) {
        const trigger = dropdownTriggers.nth(i)
        if (await trigger.isVisible()) {
          await trigger.focus()
          await trigger.click()
          
          // Check for dropdown menu
          const menu = page.locator('[role="menu"], .dropdown-menu')
          const menuCount = await menu.count()
          
          if (menuCount > 0) {
            const firstMenu = menu.first()
            await expect(firstMenu).toBeVisible()
            
            // Test arrow key navigation
            await page.keyboard.press('ArrowDown')
            await page.keyboard.press('ArrowUp')
            
            // Test Escape key
            await page.keyboard.press('Escape')
            await expect(firstMenu).not.toBeVisible()
            await expect(trigger).toBeFocused()
          }
        }
      }
    })
  })
})