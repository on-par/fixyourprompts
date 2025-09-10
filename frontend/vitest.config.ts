/// <reference types="vitest/config" />
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    // Global test setup
    setupFiles: ['./src/test/setup.ts'],
    // Include and exclude patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', '.next', '.nuxt', '.cache', 'build', 'tests/e2e/**'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        'src/test/mocks/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{nyc_output,coverage,cache}/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    // Test globals
    globals: true,
    // Watch mode settings
    watch: false,
    // Reporter configuration
    reporter: ['default', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html',
    },
    // Performance settings
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    // Temporarily disabled Storybook tests to fix test runner
    // projects: [
    //   {
    //     extends: true,
    //     plugins: [
    //       storybookTest({
    //         configDir: path.join(dirname, '.storybook'),
    //       }),
    //     ],
    //     test: {
    //       name: 'storybook',
    //       browser: {
    //         enabled: true,
    //         headless: true,
    //         provider: 'playwright',
    //         instances: [
    //           {
    //             browser: 'chromium',
    //           },
    //         ],
    //       },
    //       setupFiles: ['.storybook/vitest.setup.ts'],
    //     },
    //   },
    // ],
  },
  // Path aliases (same as Vite config)
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@context': resolve(__dirname, './src/context'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
})
