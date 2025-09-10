#!/bin/bash

# Local CI/CD simulation script
# This script runs the same checks that are performed in the CI/CD pipeline
# Use this to catch issues before pushing to GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Configuration
SKIP_TESTS=${1:-false}
FRONTEND_DIR="$(dirname "$0")/.."

# Ensure we're in the frontend directory
cd "$FRONTEND_DIR"

print_header "Starting Local CI/CD Simulation"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the frontend directory?"
    exit 1
fi

# Install dependencies
print_header "Installing Dependencies"
print_status "Running npm ci..."
if npm ci --prefer-offline --no-audit; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Type checking
print_header "Type Checking"
print_status "Running TypeScript type check..."
if npm run typecheck; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Linting
print_header "Code Linting"
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# Code formatting check
print_header "Code Formatting"
print_status "Checking code formatting..."
if npm run format:check; then
    print_success "Code formatting is correct"
else
    print_warning "Code formatting issues found. Run 'npm run format' to fix them."
    print_status "Auto-fixing formatting issues..."
    npm run format
    print_success "Code formatting fixed"
fi

# Unit tests (unless skipped)
if [ "$SKIP_TESTS" != "true" ]; then
    print_header "Unit Tests"
    print_status "Running unit tests with coverage..."
    if npm run test:coverage; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
else
    print_warning "Skipping unit tests"
fi

# Build application
print_header "Building Application"
print_status "Building for production..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Build size check
print_header "Build Analysis"
print_status "Analyzing build size..."
BUILD_SIZE=$(du -sh dist | cut -f1)
print_status "Total build size: $BUILD_SIZE"

# Check for large files
LARGE_FILES=$(find dist -type f -size +500k -exec ls -lh {} \; | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
    print_warning "Found $LARGE_FILES files larger than 500KB:"
    find dist -type f -size +500k -exec ls -lh {} \;
else
    print_success "No large files found in build"
fi

# Security audit
print_header "Security Audit"
print_status "Running npm audit..."
if npm audit --audit-level=moderate; then
    print_success "No moderate or higher security vulnerabilities found"
else
    print_warning "Security vulnerabilities found. Run 'npm audit fix' to attempt fixes."
fi

# E2E tests (unless skipped)
if [ "$SKIP_TESTS" != "true" ]; then
    print_header "End-to-End Tests"
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps chromium
    
    print_status "Running E2E tests..."
    if npm run test:e2e; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        exit 1
    fi
else
    print_warning "Skipping E2E tests"
fi

# Summary
print_header "Summary"
print_success "All checks completed successfully!"
print_status "Your code is ready for CI/CD pipeline"

echo -e "\n${GREEN}✅ Local CI/CD simulation completed successfully${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo "   1. Commit your changes"
echo "   2. Push to GitHub"
echo "   3. Monitor the GitHub Actions workflow"
echo -e "\n${YELLOW}💡 Tips:${NC}"
echo "   - Run this script before every push"
echo "   - Use 'npm run format' to fix formatting issues"
echo "   - Use 'npm audit fix' to fix security vulnerabilities"
echo "   - Add the --skip-tests flag to skip time-consuming tests during development"