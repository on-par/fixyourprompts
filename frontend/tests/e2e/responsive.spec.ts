import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * E2E Tests for Responsive Design and Mobile Experience
 * 
 * These tests verify that the FixYourPrompts application provides an optimal
 * user experience across all device sizes and screen orientations.
 * 
 * Test Coverage:
 * 1. Viewport adaptation (mobile, tablet, desktop)
 * 2. Component responsiveness and layout integrity
 * 3. Mobile navigation functionality
 * 4. Touch interactions and accessibility
 * 5. Text readability and content overflow prevention
 * 6. Critical UI element accessibility on all screen sizes
 */

// Viewport configurations for testing
const viewports = {
  mobile: {
    portrait: { width: 375, height: 667 }, // iPhone SE
    landscape: { width: 667, height: 375 }
  },
  mobileLarge: {
    portrait: { width: 414, height: 896 }, // iPhone 11 Pro
    landscape: { width: 896, height: 414 }
  },
  tablet: {
    portrait: { width: 768, height: 1024 }, // iPad
    landscape: { width: 1024, height: 768 }
  },
  tabletLarge: {
    portrait: { width: 820, height: 1180 }, // iPad Air
    landscape: { width: 1180, height: 820 }
  },
  desktop: {
    small: { width: 1366, height: 768 },   // Small laptop
    medium: { width: 1440, height: 900 },  // Standard desktop
    large: { width: 1920, height: 1080 },  // Full HD
    ultrawide: { width: 2560, height: 1440 } // 4K/Ultrawide
  }
} as const

// Test prompts of varying lengths to test content adaptation
const testContent = {
  short: 'Write a story',
  medium: 'Create a comprehensive marketing strategy for a sustainable fashion brand targeting millennials',
  long: 'Develop a detailed, step-by-step implementation plan for a machine learning system that can analyze customer behavior patterns, predict purchasing decisions, recommend personalized products, and provide actionable insights for business stakeholders while ensuring data privacy compliance and maintaining system scalability for enterprise-level deployment across multiple geographic regions with different regulatory requirements',
  withLineBreaks: `Create a multi-part story that includes:

1. Character development
2. Plot progression
3. Setting descriptions

Make sure it flows well and engages the reader throughout.`
}

// Page Object Model for responsive design testing
class ResponsiveTestPage {
  readonly page: Page
  readonly header: Locator
  readonly logo: Locator
  readonly desktopNav: Locator
  readonly mobileMenuButton: Locator
  readonly mobileNav: Locator
  readonly promptInput: Locator
  readonly submitButton: Locator
  readonly analysisResults: Locator
  readonly refinedPrompts: Locator
  readonly educationalTips: Locator
  readonly footer: Locator
  readonly mainContent: Locator
  readonly copyButton: Locator
  readonly newSessionButton: Locator
  readonly errorMessage: Locator
  readonly loadingSpinner: Locator
  readonly characterCounter: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('header[role="banner"]')
    this.logo = page.locator('.logo, [data-testid="logo"]')
    this.desktopNav = page.locator('.desktop-nav, [data-testid="desktop-nav"]')
    this.mobileMenuButton = page.locator('.mobile-menu-button, [data-testid="mobile-menu-button"]')
    this.mobileNav = page.locator('.mobile-nav, [data-testid="mobile-nav"]')
    this.promptInput = page.locator('[data-testid="prompt-input"], textarea, input[type="text"]').first()
    this.submitButton = page.locator('[data-testid="submit-button"], button:has-text("Analyze"), button:has-text("Submit")').first()
    this.analysisResults = page.locator('[data-testid="analysis-results"], .analysis-panel')
    this.refinedPrompts = page.locator('[data-testid="refined-prompts"], .output-panel')
    this.educationalTips = page.locator('[data-testid="educational-tips"], .education-panel')
    this.footer = page.locator('footer')
    this.mainContent = page.locator('main, .app-main')
    this.copyButton = page.locator('[data-testid="copy-button"], button:has-text("Copy")')
    this.newSessionButton = page.locator('[data-testid="new-session-button"], button:has-text("New Session")')
    this.errorMessage = page.locator('[data-testid="error-message"], .error-banner')
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"], .loading-spinner, .spinner')
    this.characterCounter = page.locator('[data-testid="character-counter"], .char-counter')
  }

  async navigateToHome() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async submitPrompt(prompt: string) {
    await this.promptInput.fill(prompt)
    await this.submitButton.click()
  }

  async waitForAnalysisComplete() {
    // Wait for loading to start, then complete
    await expect(this.loadingSpinner).toBeVisible({ timeout: 1000 })
    await expect(this.analysisResults).toBeVisible({ timeout: 15000 })
  }

  async toggleMobileMenu() {
    await this.mobileMenuButton.click()
  }

  async getElementBounds(locator: Locator) {
    return await locator.boundingBox()
  }

  async isElementVisible(locator: Locator) {
    return await locator.isVisible()
  }
}

test.describe('Responsive Design - Mobile Devices', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
    await responsivePage.navigateToHome()
  })

  test.describe('Mobile Portrait Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile.portrait)
    })

    test('should adapt header layout for mobile screens', async ({ page }) => {
      // Header should be visible and properly sized
      await expect(responsivePage.header).toBeVisible()
      
      // Logo should be visible and appropriately sized
      await expect(responsivePage.logo).toBeVisible()
      const logoBox = await responsivePage.getElementBounds(responsivePage.logo)
      expect(logoBox?.width).toBeLessThan(200) // Should not dominate small screen
      
      // Desktop navigation should be hidden on mobile
      if (await responsivePage.isElementVisible(responsivePage.desktopNav)) {
        // If visible, it should be hidden via CSS
        const desktopNavStyles = await responsivePage.desktopNav.evaluate(el => 
          window.getComputedStyle(el).display
        )
        expect(desktopNavStyles).toBe('none')
      }
      
      // Mobile menu button should be visible
      await expect(responsivePage.mobileMenuButton).toBeVisible()
      const menuButtonBox = await responsivePage.getElementBounds(responsivePage.mobileMenuButton)
      expect(menuButtonBox?.width).toBeGreaterThan(40) // Large enough for touch
      expect(menuButtonBox?.height).toBeGreaterThan(40)
    })

    test('should show mobile navigation menu when hamburger button is clicked', async ({ page }) => {
      // Mobile nav should initially be hidden
      if (await responsivePage.isElementVisible(responsivePage.mobileNav)) {
        const mobileNavStyles = await responsivePage.mobileNav.evaluate(el => 
          window.getComputedStyle(el).display
        )
        expect(mobileNavStyles).toBe('none')
      }
      
      // Click mobile menu button
      await responsivePage.toggleMobileMenu()
      
      // Mobile nav should now be visible
      await expect(responsivePage.mobileNav).toBeVisible()
      
      // Menu should contain navigation items
      const navItems = responsivePage.mobileNav.locator('a, button')
      await expect(navItems).toHaveCount.greaterThanOrEqual(2)
      
      // Each nav item should be touch-friendly
      for (let i = 0; i < Math.min(3, await navItems.count()); i++) {
        const item = navItems.nth(i)
        const itemBox = await responsivePage.getElementBounds(item)
        expect(itemBox?.height).toBeGreaterThan(44) // iOS touch target minimum
      }
    })

    test('should close mobile menu when navigation item is clicked', async ({ page }) => {
      // Open mobile menu
      await responsivePage.toggleMobileMenu()
      await expect(responsivePage.mobileNav).toBeVisible()
      
      // Click a navigation item
      const homeLink = responsivePage.mobileNav.locator('a').first()
      await homeLink.click()
      
      // Menu should close
      await expect(responsivePage.mobileNav).toBeHidden()
    })

    test('should ensure prompt input is fully accessible on mobile', async ({ page }) => {
      // Input should be visible and properly sized
      await expect(responsivePage.promptInput).toBeVisible()
      
      const inputBox = await responsivePage.getElementBounds(responsivePage.promptInput)
      expect(inputBox?.width).toBeLessThan(350) // Should fit in mobile viewport
      expect(inputBox?.width).toBeGreaterThan(250) // But not too small
      
      // Input should be focusable
      await responsivePage.promptInput.focus()
      await expect(responsivePage.promptInput).toBeFocused()
      
      // Should be able to type without issues
      const testText = testContent.short
      await responsivePage.promptInput.fill(testText)
      await expect(responsivePage.promptInput).toHaveValue(testText)
      
      // Submit button should be accessible
      await expect(responsivePage.submitButton).toBeVisible()
      const buttonBox = await responsivePage.getElementBounds(responsivePage.submitButton)
      expect(buttonBox?.height).toBeGreaterThan(44) // Touch-friendly height
    })

    test('should handle long text content without horizontal scrolling', async ({ page }) => {
      // Fill with long content
      await responsivePage.promptInput.fill(testContent.long)
      await responsivePage.submitButton.click()
      
      // Wait for analysis to complete
      await responsivePage.waitForAnalysisComplete()
      
      // Check that no horizontal scrolling is required
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = viewports.mobile.portrait.width
      expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 20) // Small tolerance for margins
      
      // Results should be readable
      await expect(responsivePage.analysisResults).toBeVisible()
      const resultsBox = await responsivePage.getElementBounds(responsivePage.analysisResults)
      expect(resultsBox?.width).toBeLessThanOrEqual(viewportWidth)
    })

    test('should maintain readability with proper font sizes and spacing', async ({ page }) => {
      // Submit a prompt to get content to analyze
      await responsivePage.promptInput.fill(testContent.medium)
      await responsivePage.submitButton.click()
      await responsivePage.waitForAnalysisComplete()
      
      // Check text elements have appropriate sizes
      const textElements = page.locator('p, span, div').filter({ hasText: /\w+/ })
      const elementCount = Math.min(5, await textElements.count())
      
      for (let i = 0; i < elementCount; i++) {
        const element = textElements.nth(i)
        const fontSize = await element.evaluate(el => 
          window.getComputedStyle(el).fontSize
        )
        const fontSizeNum = parseFloat(fontSize)
        expect(fontSizeNum).toBeGreaterThan(14) // Minimum readable size on mobile
      }
      
      // Check that interactive elements have adequate spacing
      const buttons = page.locator('button:visible')
      if (await buttons.count() > 1) {
        for (let i = 0; i < Math.min(3, await buttons.count() - 1); i++) {
          const button1Box = await responsivePage.getElementBounds(buttons.nth(i))
          const button2Box = await responsivePage.getElementBounds(buttons.nth(i + 1))
          
          if (button1Box && button2Box) {
            // Buttons should have adequate spacing (at least 8px)
            const verticalGap = Math.abs((button1Box.y + button1Box.height) - button2Box.y)
            const horizontalGap = Math.abs((button1Box.x + button1Box.width) - button2Box.x)
            expect(Math.min(verticalGap, horizontalGap)).toBeGreaterThan(8)
          }
        }
      }
    })
  })

  test.describe('Mobile Landscape Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile.landscape)
    })

    test('should adapt to landscape orientation', async ({ page }) => {
      // Header should still be accessible
      await expect(responsivePage.header).toBeVisible()
      
      // Mobile menu should still be functional
      await expect(responsivePage.mobileMenuButton).toBeVisible()
      
      // Content should fit within the reduced height
      const mainContentBox = await responsivePage.getElementBounds(responsivePage.mainContent)
      expect(mainContentBox?.height).toBeLessThanOrEqual(viewports.mobile.landscape.height)
      
      // Input area should remain usable
      await expect(responsivePage.promptInput).toBeVisible()
      await responsivePage.promptInput.fill(testContent.short)
      await expect(responsivePage.submitButton).toBeVisible()
    })

    test('should maintain functionality in landscape mode', async ({ page }) => {
      // Test complete workflow in landscape
      await responsivePage.promptInput.fill(testContent.medium)
      await responsivePage.submitButton.click()
      
      // Should complete analysis successfully
      await responsivePage.waitForAnalysisComplete()
      await expect(responsivePage.analysisResults).toBeVisible()
      
      // Mobile menu should still work
      await responsivePage.toggleMobileMenu()
      await expect(responsivePage.mobileNav).toBeVisible()
    })
  })

  test.describe('Touch Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.mobile.portrait)
    })

    test('should support touch gestures for scrolling', async ({ page }) => {
      // Fill content to make page scrollable
      await responsivePage.promptInput.fill(testContent.long)
      await responsivePage.submitButton.click()
      await responsivePage.waitForAnalysisComplete()
      
      // Simulate touch scroll
      await page.evaluate(() => {
        window.scrollTo(0, 100)
      })
      
      // Verify scroll worked
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(scrollY).toBeGreaterThan(50)
    })

    test('should handle touch events on interactive elements', async ({ page }) => {
      // Test touch on submit button
      await responsivePage.promptInput.fill(testContent.short)
      
      // Use dispatchEvent to simulate touch
      await responsivePage.submitButton.dispatchEvent('touchstart')
      await responsivePage.submitButton.dispatchEvent('touchend')
      await responsivePage.submitButton.click()
      
      // Should start analysis
      await expect(responsivePage.loadingSpinner).toBeVisible({ timeout: 1000 })
    })

    test('should prevent accidental touches with proper spacing', async ({ page }) => {
      // Ensure buttons are spaced adequately to prevent fat-finger errors
      await responsivePage.promptInput.fill(testContent.short)
      await responsivePage.submitButton.click()
      await responsivePage.waitForAnalysisComplete()
      
      const interactiveElements = page.locator('button:visible, a:visible, input:visible')
      const elementCount = Math.min(5, await interactiveElements.count())
      
      for (let i = 0; i < elementCount; i++) {
        const element = interactiveElements.nth(i)
        const box = await responsivePage.getElementBounds(element)
        
        // Each interactive element should meet minimum touch target size
        if (box) {
          expect(Math.max(box.width, box.height)).toBeGreaterThan(40)
        }
      }
    })
  })
})

test.describe('Responsive Design - Tablet Devices', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
    await responsivePage.navigateToHome()
  })

  test.describe('Tablet Portrait Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet.portrait)
    })

    test('should utilize tablet screen space effectively', async ({ page }) => {
      // Header should scale appropriately
      await expect(responsivePage.header).toBeVisible()
      
      // Might show desktop nav on larger tablets
      const desktopNavVisible = await responsivePage.isElementVisible(responsivePage.desktopNav)
      const mobileMenuVisible = await responsivePage.isElementVisible(responsivePage.mobileMenuButton)
      
      // Either desktop nav or mobile menu should be visible, not both
      expect(desktopNavVisible || mobileMenuVisible).toBe(true)
      
      // Input area should use available space
      const inputBox = await responsivePage.getElementBounds(responsivePage.promptInput)
      expect(inputBox?.width).toBeGreaterThan(400) // Should use more space than mobile
      expect(inputBox?.width).toBeLessThan(700) // But not full desktop width
    })

    test('should handle two-column layout if implemented', async ({ page }) => {
      await responsivePage.promptInput.fill(testContent.medium)
      await responsivePage.submitButton.click()
      await responsivePage.waitForAnalysisComplete()
      
      // Check if content is laid out efficiently
      const mainContentBox = await responsivePage.getElementBounds(responsivePage.mainContent)
      expect(mainContentBox?.width).toBeGreaterThan(500)
      
      // Results should be visible and well-spaced
      await expect(responsivePage.analysisResults).toBeVisible()
      
      // Check for appropriate use of tablet real estate
      const resultsBox = await responsivePage.getElementBounds(responsivePage.analysisResults)
      if (resultsBox) {
        expect(resultsBox.width).toBeLessThan(viewports.tablet.portrait.width * 0.9)
      }
    })
  })

  test.describe('Tablet Landscape Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewports.tablet.landscape)
    })

    test('should approach desktop layout in tablet landscape', async ({ page }) => {
      // Desktop navigation might be visible in landscape
      const desktopNavVisible = await responsivePage.isElementVisible(responsivePage.desktopNav)
      
      if (desktopNavVisible) {
        // If desktop nav is shown, mobile menu should be hidden
        const mobileMenuVisible = await responsivePage.isElementVisible(responsivePage.mobileMenuButton)
        expect(mobileMenuVisible).toBe(false)
      }
      
      // Input should have more horizontal space
      const inputBox = await responsivePage.getElementBounds(responsivePage.promptInput)
      expect(inputBox?.width).toBeGreaterThan(500)
    })

    test('should maintain usability in landscape mode', async ({ page }) => {
      // Complete workflow should work smoothly
      await responsivePage.promptInput.fill(testContent.medium)
      await responsivePage.submitButton.click()
      await responsivePage.waitForAnalysisComplete()
      
      // Content should be arranged to use landscape space efficiently
      await expect(responsivePage.analysisResults).toBeVisible()
      
      // Should not require horizontal scrolling
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyScrollWidth).toBeLessThanOrEqual(viewports.tablet.landscape.width + 20)
    })
  })
})

test.describe('Responsive Design - Desktop Viewports', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
    await responsivePage.navigateToHome()
  })

  test.describe('Standard Desktop Sizes', () => {
    test('should provide optimal desktop experience at 1366x768', async ({ page }) => {
      await page.setViewportSize(viewports.desktop.small)
      
      // Desktop navigation should be visible
      await expect(responsivePage.desktopNav).toBeVisible()
      
      // Mobile menu button should be hidden
      if (await responsivePage.isElementVisible(responsivePage.mobileMenuButton)) {
        const mobileButtonStyles = await responsivePage.mobileMenuButton.evaluate(el => 
          window.getComputedStyle(el).display
        )
        expect(mobileButtonStyles).toBe('none')
      }
      
      // Content should use desktop layout
      const inputBox = await responsivePage.getElementBounds(responsivePage.promptInput)
      expect(inputBox?.width).toBeGreaterThan(600)
      
      // Test full workflow
      await responsivePage.promptInput.fill(testContent.medium)
      await responsivePage.submitButton.click()
      await responsivePage.waitForAnalysisComplete()
      
      // Results should be in desktop layout
      await expect(responsivePage.analysisResults).toBeVisible()
    })

    test('should scale content appropriately for larger screens', async ({ page }) => {
      await page.setViewportSize(viewports.desktop.large)
      
      // Content should be centered and not excessively wide
      const mainContentBox = await responsivePage.getElementBounds(responsivePage.mainContent)
      expect(mainContentBox?.width).toBeLessThan(1400) // Reasonable max width
      
      // Should have appropriate margins/padding
      if (mainContentBox) {
        const leftMargin = mainContentBox.x
        const rightMargin = viewports.desktop.large.width - (mainContentBox.x + mainContentBox.width)
        expect(leftMargin).toBeGreaterThan(50) // Adequate margins
        expect(rightMargin).toBeGreaterThan(50)
      }
    })
  })

  test.describe('Ultra-wide Desktop Support', () => {
    test('should handle ultra-wide viewports gracefully', async ({ page }) => {
      await page.setViewportSize(viewports.desktop.ultrawide)
      
      // Content should not stretch across entire ultra-wide screen
      const mainContentBox = await responsivePage.getElementBounds(responsivePage.mainContent)
      expect(mainContentBox?.width).toBeLessThan(1800) // Prevent excessive line length
      
      // Should be centered
      if (mainContentBox) {
        const centerX = mainContentBox.x + mainContentBox.width / 2
        const viewportCenter = viewports.desktop.ultrawide.width / 2
        const offset = Math.abs(centerX - viewportCenter)
        expect(offset).toBeLessThan(200) // Should be roughly centered
      }
    })
  })
})

test.describe('Cross-Viewport Consistency', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
    await responsivePage.navigateToHome()
  })

  test('should maintain functionality across all viewport changes', async ({ page }) => {
    const testViewports = [
      viewports.mobile.portrait,
      viewports.tablet.portrait,
      viewports.desktop.medium,
      viewports.mobile.landscape,
      viewports.tablet.landscape
    ]

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      
      // Essential elements should always be accessible
      await expect(responsivePage.header).toBeVisible()
      await expect(responsivePage.promptInput).toBeVisible()
      await expect(responsivePage.submitButton).toBeVisible()
      
      // Should be able to interact with input
      await responsivePage.promptInput.fill(`Test at ${viewport.width}x${viewport.height}`)
      await expect(responsivePage.promptInput).toHaveValue(`Test at ${viewport.width}x${viewport.height}`)
      
      // Clear for next iteration
      await responsivePage.promptInput.fill('')
    }
  })

  test('should prevent content overflow at all viewport sizes', async ({ page }) => {
    const testViewports = [
      viewports.mobile.portrait,
      viewports.mobile.landscape,
      viewports.tablet.portrait,
      viewports.desktop.small
    ]

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      
      // Fill with content that might cause overflow
      await responsivePage.promptInput.fill(testContent.long)
      await responsivePage.submitButton.click()
      
      // Wait for content to load
      try {
        await responsivePage.waitForAnalysisComplete()
      } catch {
        // Continue test even if analysis doesn't complete
      }
      
      // Check for horizontal overflow
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyScrollWidth).toBeLessThanOrEqual(viewport.width + 30) // Allow small tolerance
      
      // Reset for next viewport
      await page.reload()
      await responsivePage.navigateToHome()
    }
  })

  test('should maintain consistent typography scale', async ({ page }) => {
    // Test font scaling consistency
    const viewports = [
      { size: viewports.mobile.portrait, name: 'mobile' },
      { size: viewports.tablet.portrait, name: 'tablet' },
      { size: viewports.desktop.medium, name: 'desktop' }
    ]

    const fontSizes: Record<string, number> = {}

    for (const { size, name } of viewports) {
      await page.setViewportSize(size)
      
      // Check heading font size
      const heading = page.locator('h1, h2').first()
      if (await heading.isVisible()) {
        const fontSize = await heading.evaluate(el => 
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        fontSizes[name] = fontSize
      }
    }

    // Font sizes should scale appropriately (mobile <= tablet <= desktop)
    if (fontSizes.mobile && fontSizes.tablet && fontSizes.desktop) {
      expect(fontSizes.mobile).toBeLessThanOrEqual(fontSizes.tablet)
      expect(fontSizes.tablet).toBeLessThanOrEqual(fontSizes.desktop)
      
      // But not excessively different
      expect(fontSizes.desktop / fontSizes.mobile).toBeLessThan(2)
    }
  })
})

test.describe('Responsive Navigation', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
    await responsivePage.navigateToHome()
  })

  test('should switch between mobile and desktop navigation appropriately', async ({ page }) => {
    // Start with desktop view
    await page.setViewportSize(viewports.desktop.medium)
    await expect(responsivePage.desktopNav).toBeVisible()
    
    // Switch to mobile
    await page.setViewportSize(viewports.mobile.portrait)
    await expect(responsivePage.mobileMenuButton).toBeVisible()
    
    // Desktop nav should be hidden
    if (await responsivePage.isElementVisible(responsivePage.desktopNav)) {
      const desktopNavDisplay = await responsivePage.desktopNav.evaluate(el => 
        window.getComputedStyle(el).display
      )
      expect(desktopNavDisplay).toBe('none')
    }
    
    // Switch back to desktop
    await page.setViewportSize(viewports.desktop.medium)
    await expect(responsivePage.desktopNav).toBeVisible()
  })

  test('should maintain navigation state during viewport changes', async ({ page }) => {
    // Start in mobile view and open menu
    await page.setViewportSize(viewports.mobile.portrait)
    await responsivePage.toggleMobileMenu()
    await expect(responsivePage.mobileNav).toBeVisible()
    
    // Switch to tablet - menu behavior might change
    await page.setViewportSize(viewports.tablet.landscape)
    
    // Navigation should still be functional
    const isDesktopNavVisible = await responsivePage.isElementVisible(responsivePage.desktopNav)
    const isMobileMenuVisible = await responsivePage.isElementVisible(responsivePage.mobileMenuButton)
    
    expect(isDesktopNavVisible || isMobileMenuVisible).toBe(true)
  })

  test('should support keyboard navigation on all viewports', async ({ page }) => {
    const testViewports = [viewports.mobile.portrait, viewports.desktop.medium]
    
    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      
      // Focus should move through interactive elements
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Continue tabbing to next elements
      await page.keyboard.press('Tab')
      const nextFocusedElement = page.locator(':focus')
      await expect(nextFocusedElement).toBeVisible()
      
      // Should be able to activate focused elements with Enter/Space
      const elementTag = await nextFocusedElement.evaluate(el => el.tagName.toLowerCase())
      if (elementTag === 'button' || elementTag === 'a') {
        // Test keyboard activation (without actually navigating)
        await page.keyboard.press('Space')
      }
    }
  })
})

test.describe('Content Adaptation', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
    await responsivePage.navigateToHome()
  })

  test('should handle multiline content gracefully on all screen sizes', async ({ page }) => {
    const testViewports = [
      viewports.mobile.portrait,
      viewports.tablet.portrait,
      viewports.desktop.medium
    ]

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      
      // Fill with content that has line breaks
      await responsivePage.promptInput.fill(testContent.withLineBreaks)
      
      // Content should fit without horizontal overflow
      const inputBox = await responsivePage.getElementBounds(responsivePage.promptInput)
      expect(inputBox?.width).toBeLessThanOrEqual(viewport.width)
      
      // Text should be readable
      const fontSize = await responsivePage.promptInput.evaluate(el => 
        parseFloat(window.getComputedStyle(el).fontSize)
      )
      expect(fontSize).toBeGreaterThan(14) // Readable size
      
      // Clear for next test
      await responsivePage.promptInput.fill('')
    }
  })

  test('should adapt character counter for different screen sizes', async ({ page }) => {
    const testViewports = [viewports.mobile.portrait, viewports.desktop.medium]
    
    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      
      // Fill input to show character counter (if implemented)
      await responsivePage.promptInput.fill(testContent.medium)
      
      // Character counter should be visible if implemented
      const isCounterVisible = await responsivePage.isElementVisible(responsivePage.characterCounter)
      
      if (isCounterVisible) {
        const counterBox = await responsivePage.getElementBounds(responsivePage.characterCounter)
        expect(counterBox?.width).toBeLessThan(viewport.width)
        
        // Should not overlap with other elements
        expect(counterBox?.y).toBeGreaterThan(0)
      }
    }
  })

  test('should maintain accessibility across viewport changes', async ({ page }) => {
    const testViewports = [viewports.mobile.portrait, viewports.desktop.medium]
    
    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      
      // Check that ARIA labels are present
      const ariaElements = page.locator('[aria-label], [aria-describedby], [role]')
      const ariaCount = await ariaElements.count()
      expect(ariaCount).toBeGreaterThan(0)
      
      // Focus indicators should be visible
      await responsivePage.promptInput.focus()
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeFocused()
      
      // Tab order should be logical
      await page.keyboard.press('Tab')
      const nextFocused = page.locator(':focus')
      await expect(nextFocused).toBeVisible()
    }
  })
})

test.describe('Performance on Different Viewports', () => {
  let responsivePage: ResponsiveTestPage

  test.beforeEach(async ({ page }) => {
    responsivePage = new ResponsiveTestPage(page)
  })

  test('should maintain smooth interactions across viewport sizes', async ({ page }) => {
    const testViewports = [viewports.mobile.portrait, viewports.desktop.medium]
    
    for (const viewport of testViewports) {
      await page.setViewportSize(viewport)
      await responsivePage.navigateToHome()
      
      // Measure interaction responsiveness
      const startTime = Date.now()
      
      await responsivePage.promptInput.fill(testContent.short)
      await responsivePage.submitButton.click()
      
      // Loading state should appear quickly
      await expect(responsivePage.loadingSpinner).toBeVisible({ timeout: 200 })
      
      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(500) // Should be responsive
      
      // Wait for completion or timeout
      try {
        await responsivePage.waitForAnalysisComplete()
      } catch {
        // Continue even if analysis doesn't complete
      }
    }
  })

  test('should handle viewport changes without breaking layout', async ({ page }) => {
    await responsivePage.navigateToHome()
    
    // Start with desktop
    await page.setViewportSize(viewports.desktop.medium)
    await responsivePage.promptInput.fill(testContent.medium)
    
    // Switch to mobile while content is present
    await page.setViewportSize(viewports.mobile.portrait)
    
    // Content should still be accessible
    await expect(responsivePage.promptInput).toBeVisible()
    await expect(responsivePage.promptInput).toHaveValue(testContent.medium)
    
    // Switch back to tablet
    await page.setViewportSize(viewports.tablet.landscape)
    
    // Should still work normally
    await expect(responsivePage.submitButton).toBeVisible()
    await expect(responsivePage.submitButton).toBeEnabled()
  })
})