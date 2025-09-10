# FixYourPrompts Frontend - React + TypeScript + Vite

A production-ready React application built with TypeScript, Vite, and modern development tools. This project implements a comprehensive TypeScript setup with strict type checking, comprehensive testing, and code quality enforcement.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Environment Setup](#development-environment-setup)
- [TypeScript Configuration](#typescript-configuration)
- [Project Structure](#project-structure)
- [Testing Setup](#testing-setup)
- [Code Quality Tools](#code-quality-tools)
- [Scripts and Commands](#scripts-and-commands)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

4. **Verify TypeScript setup**
   ```bash
   npm run typecheck
   ```

### IDE Setup

For the best development experience, we recommend using **Visual Studio Code** with the following extensions:

- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **TypeScript Importer** (`pmneo.tsimporter`)
- **Auto Import - ES6, TS, JSX, TSX** (`steoates.autoimport`)

#### VS Code Settings

Add these settings to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.noSemicolons": "off",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## TypeScript Configuration

This project uses a strict TypeScript setup with comprehensive type checking and modern ES features.

### Configuration Files

#### `tsconfig.app.json` - Main Application Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    
    // Path mapping for cleaner imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@context/*": ["./src/context/*"],
      "@styles/*": ["./src/styles/*"],
      "@config/*": ["./src/config/*"]
    },
    
    // Strict type checking options
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### `tsconfig.node.json` - Node.js Configuration
Used for build tools and configuration files like Vite config.

### Type Definitions Structure

The project organizes type definitions in `/src/types/`:

- **`core.ts`** - Core application types and interfaces
- **`components.ts`** - Component props and UI-related types
- **`services.ts`** - API and service-related types

#### Example Type Usage

```typescript
// Import types using path aliases
import type { PromptAnalysis } from '@types/core'
import type { AnalysisPanelProps } from '@types/components'
import type { APIResponse } from '@types/services'

// Component with strict typing
interface Props {
  analysis: PromptAnalysis
  onUpdate: (analysis: PromptAnalysis) => void
}

const AnalysisPanel: React.FC<Props> = ({ analysis, onUpdate }) => {
  // TypeScript ensures type safety throughout
  return (
    <div>
      <h2>{analysis.title}</h2>
      <p>Score: {analysis.score}</p>
    </div>
  )
}
```

### Path Aliases

The following path aliases are configured for cleaner imports:

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@services/*` → `./src/services/*`
- `@types/*` → `./src/types/*`
- `@utils/*` → `./src/utils/*`
- `@hooks/*` → `./src/hooks/*`
- `@context/*` → `./src/context/*`
- `@styles/*` → `./src/styles/*`
- `@config/*` → `./src/config/*`

Usage example:
```typescript
// Instead of: import { Button } from '../../../components/ui/Button'
import { Button } from '@components/ui/Button'

// Instead of: import { validatePrompt } from '../../utils/validation'
import { validatePrompt } from '@utils/validation'
```

### Strict Mode Configuration

This project enables TypeScript's strictest settings for maximum type safety:

- **`strict: true`** - Enables all strict type checking options
- **`noUnusedLocals: true`** - Error on unused local variables
- **`noUnusedParameters: true`** - Error on unused function parameters
- **`noImplicitReturns: true`** - Error when not all code paths return a value
- **`noUncheckedIndexedAccess: true`** - Requires checking for undefined when accessing array/object properties
- **`exactOptionalPropertyTypes: true`** - Stricter checking of optional properties

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── AnalysisPanel/   # Feature-specific components
│   ├── PromptOutput/    # Component modules
│   └── ...
├── config/              # Configuration files
│   ├── constants.ts     # Application constants
│   └── ...
├── context/             # React contexts
├── hooks/               # Custom React hooks
├── router/              # Routing configuration
│   ├── components/      # Router-specific components
│   ├── views/           # Route view components
│   └── ...
├── services/            # API and external services
│   ├── api/            # API clients
│   ├── validation/     # Validation utilities
│   └── ...
├── styles/              # CSS and styling
├── test/                # Test utilities and setup
│   ├── setup.ts        # Test configuration
│   └── mocks/          # Test mocks
├── types/               # TypeScript type definitions
│   ├── core.ts         # Core types
│   ├── components.ts   # Component types
│   └── services.ts     # Service types
├── utils/               # Utility functions
└── App.tsx             # Main application component
```

### Configuration Files

- **`vite.config.ts`** - Vite bundler configuration with optimizations
- **`vitest.config.ts`** - Vitest testing framework configuration
- **`playwright.config.ts`** - Playwright E2E testing configuration
- **`eslint.config.js`** - ESLint linting rules
- **`.prettierrc`** - Prettier formatting rules
- **`tsconfig.app.json`** - TypeScript configuration for app
- **`tsconfig.node.json`** - TypeScript configuration for Node.js tools

## Testing Setup

This project includes comprehensive testing with both unit/integration tests (Vitest) and end-to-end tests (Playwright).

### Unit and Integration Testing with Vitest

**Vitest** is used for fast unit and integration testing with TypeScript support.

#### Configuration

The testing configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

#### Test Commands

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open test UI
npm run test:ui

# Clear test cache
npm run test:clear
```

#### Writing Tests

```typescript
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Test Setup

The `src/test/setup.ts` file configures the testing environment:

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})
```

### End-to-End Testing with Playwright

**Playwright** handles browser automation and E2E testing across multiple browsers.

#### Configuration

The E2E testing configuration is in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
```

#### E2E Test Commands

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Show test report
npm run test:e2e:report
```

#### Writing E2E Tests

```typescript
// tests/e2e/prompt-analysis.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Prompt Analysis', () => {
  test('should analyze a prompt and show results', async ({ page }) => {
    await page.goto('/')
    
    // Enter a prompt
    await page.fill('[data-testid="prompt-input"]', 'Write a story about a robot')
    await page.click('[data-testid="analyze-button"]')
    
    // Check results appear
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="score"]')).toContainText(/\d+/)
  })
})
```

### Test Coverage

The project maintains high test coverage standards:

- **Branches**: 80% minimum
- **Functions**: 80% minimum  
- **Lines**: 80% minimum
- **Statements**: 80% minimum

Coverage reports are generated in the `coverage/` directory and can be viewed in the browser.

## Code Quality Tools

This project uses ESLint and Prettier to maintain consistent code quality and formatting.

### ESLint Configuration

**ESLint** enforces code quality rules and catches potential issues.

#### Configuration (`eslint.config.js`)

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      
      // React rules
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { 
        allowConstantExport: true 
      }],
      
      // Code quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'prefer-template': 'error'
    }
  }
])
```

#### ESLint Commands

```bash
# Lint all files
npm run lint

# Lint and fix auto-fixable issues
npm run lint:fix
```

#### Key Rules Enforced

- **TypeScript Rules**: Strict type checking, no `any` types
- **React Hooks Rules**: Proper hooks usage and dependency arrays
- **Code Quality**: Prefer const, template literals, strict equality
- **Import Organization**: Automatic import sorting and cleanup

### Prettier Configuration

**Prettier** handles code formatting automatically.

#### Configuration (`.prettierrc`)

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### Prettier Commands

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check
```

### Code Quality Workflow

#### Pre-commit Checks

The project runs the following checks before each commit:

1. **TypeScript Type Checking** (`npm run typecheck`)
2. **ESLint** (`npm run lint`)
3. **Prettier Formatting** (`npm run format:check`)
4. **Unit Tests** (`npm run test`)

#### Continuous Integration

The CI pipeline (`npm run ci`) runs:

```bash
# Full CI pipeline
npm run ci

# Quick CI (without E2E tests)
npm run ci:quick
```

This includes:
- Type checking
- Linting
- Unit tests with coverage
- Build verification
- Bundle size analysis

### IDE Integration

#### VS Code Integration

With the recommended extensions, VS Code will:

- **Auto-format on save** using Prettier
- **Show ESLint errors** inline
- **Auto-fix ESLint issues** on save
- **Organize imports** automatically
- **Provide TypeScript IntelliSense**

#### Settings for Team Consistency

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": ["typescript", "typescriptreact"],
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

## Scripts and Commands

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Build only (skip TypeScript compilation)
npm run build:only

# Build with bundle analysis
npm run build:analyze

# Build for production environment
npm run build:production

# Preview production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript type checking
npm run typecheck

# Watch mode for type checking (not included, but can be added)
npx tsc --noEmit --watch
```

### Testing Commands

```bash
# Unit/Integration Tests
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Generate coverage report
npm run test:ui                # Open Vitest UI
npm run test:clear             # Clear test cache

# E2E Tests
npm run test:e2e               # Run Playwright tests
npm run test:e2e:ui            # Run with UI mode
npm run test:e2e:report        # Show test report
```

### Code Quality Commands

```bash
# Linting
npm run lint                   # Run ESLint
npm run lint:fix               # Fix auto-fixable issues

# Formatting
npm run format                 # Format all files
npm run format:check           # Check formatting

# Combined
npm run ci                     # Full CI pipeline
npm run ci:quick               # Quick CI (no E2E)
```

### Bundle Analysis Commands

```bash
# Analyze bundle size and composition
npm run bundle:analyze         # Interactive bundle analyzer
npm run bundle:visualize       # Generate visual report
npm run bundle:stats           # Bundle statistics
npm run bundle:size            # Size information
npm run bundle:monitor         # Monitor bundle changes
npm run bundle:report          # Complete bundle report
npm run bundle:check           # Check against size limits

# Performance
npm run performance:budget     # Check performance budget
npm run size:check             # Bundlesize check
npm run size:limit             # Size-limit check
```

### Maintenance Commands

```bash
# Security
npm run security:audit         # Security audit

# Cleanup
npm run clean                  # Clean build artifacts
```

## Development Workflow

### Starting Development

1. **Set up environment**
   ```bash
   npm install
   npm run typecheck  # Verify TypeScript setup
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Run tests in watch mode** (in another terminal)
   ```bash
   npm run test:watch
   ```

### Making Changes

1. **Write code** with TypeScript strict mode
2. **Run type checking** regularly
   ```bash
   npm run typecheck
   ```

3. **Follow code quality standards**
   ```bash
   npm run lint:fix    # Fix linting issues
   npm run format      # Format code
   ```

4. **Write tests** for new functionality
5. **Verify all checks pass**
   ```bash
   npm run ci:quick
   ```

### Pre-deployment Checklist

1. **Run full test suite**
   ```bash
   npm run test
   npm run test:e2e
   ```

2. **Check bundle size**
   ```bash
   npm run bundle:check
   ```

3. **Verify production build**
   ```bash
   npm run build
   npm run preview
   ```

4. **Run full CI pipeline**
   ```bash
   npm run ci
   ```

## Troubleshooting

### Common TypeScript Issues

#### Path Alias Resolution

**Problem**: Import paths with `@` aliases not working

**Solution**: Ensure both `tsconfig.app.json` and `vite.config.ts` have matching path configurations:

```typescript
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

#### Type Import Issues

**Problem**: Types not found or import/export errors

**Solutions**:
```typescript
// Use type imports for better tree shaking
import type { ComponentProps } from '@types/components'

// Ensure proper exports in type files
export type { PromptAnalysis } from './core'
export interface { ButtonProps } from './components'
```

#### Strict Type Errors

**Problem**: TypeScript strict mode errors

**Common Solutions**:
```typescript
// Handle undefined values explicitly
const value = array[index] // Error with noUncheckedIndexedAccess
const value = array[index] ?? defaultValue // Fixed

// Use proper type assertions
const element = document.getElementById('app') as HTMLElement
// Or with null checking
const element = document.getElementById('app')
if (!element) throw new Error('App element not found')

// Handle optional properties
interface Props {
  title?: string
}
const title = props.title ?? 'Default Title'
```

### Common Build Issues

#### Vite Build Errors

**Problem**: Build fails with dependency issues

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear all caches and reinstall
npm run clean
npm install
```

#### Bundle Size Issues

**Problem**: Bundle too large

**Solutions**:
1. **Check bundle analyzer**
   ```bash
   npm run build:analyze
   ```

2. **Enable code splitting** (already configured in `vite.config.ts`)
3. **Remove unused dependencies**
4. **Use dynamic imports for large components**

### Common Test Issues

#### Test Setup Problems

**Problem**: Tests failing due to setup issues

**Solutions**:
1. **Ensure test setup is correct**
   ```typescript
   // src/test/setup.ts should include
   import '@testing-library/jest-dom'
   ```

2. **Check Vitest configuration**
   ```bash
   npm run test:clear  # Clear test cache
   ```

#### E2E Test Issues

**Problem**: Playwright tests failing

**Solutions**:
1. **Install browsers**
   ```bash
   npx playwright install
   ```

2. **Check dev server is running**
   ```bash
   npm run dev  # In another terminal
   npm run test:e2e
   ```

### Performance Issues

#### Development Server Slow

**Solutions**:
1. **Clear Vite cache**
   ```bash
   rm -rf node_modules/.vite
   ```

2. **Check dependency optimization**
3. **Reduce file watching** if on large repositories

#### Build Performance

**Solutions**:
1. **Use build cache** (already enabled)
2. **Optimize dependencies** with `optimizeDeps` in Vite config
3. **Consider build parallelization**

### IDE Issues

#### VS Code TypeScript Issues

**Solutions**:
1. **Restart TypeScript server**: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
2. **Check workspace settings**
3. **Verify extensions are installed and updated**

#### ESLint/Prettier Conflicts

**Solution**: The configurations are designed to work together, but if issues occur:
```bash
# Run in order
npm run lint:fix
npm run format
```

## Advanced Configuration

### Custom Vite Plugins

Add custom plugins to `vite.config.ts`:

```typescript
import customPlugin from './plugins/custom-plugin'

export default defineConfig({
  plugins: [
    react(),
    customPlugin(),
    // ... other plugins
  ]
})
```

### Environment Variables

Use environment variables with the `VITE_` prefix:

```bash
# .env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=FixYourPrompts
```

```typescript
// In your code
const apiUrl = import.meta.env.VITE_API_URL
```

### Custom ESLint Rules

Add project-specific ESLint rules:

```javascript
// eslint.config.js
export default tseslint.config([
  // ... existing config
  {
    rules: {
      // Custom rules
      'custom-rule/specific-pattern': 'error'
    }
  }
])
```

### TypeScript Compiler Options

For advanced TypeScript configuration, modify `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    // Add experimental features
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    // Advanced path mapping
    "paths": {
      "@/*": ["./src/*"],
      "~/*": ["./public/*"]
    }
  }
}
```

---

This comprehensive setup ensures a robust, maintainable, and scalable TypeScript React application with modern tooling and best practices.
