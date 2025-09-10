import { FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright E2E tests
 * Runs once before all tests
 */
async function globalSetup(_config: FullConfig) {
  console.log('Starting global setup for E2E tests...')
  
  // You can add global setup logic here, such as:
  // - Database seeding
  // - Authentication setup
  // - Global state initialization
  
  console.log('Global setup completed')
}

export default globalSetup