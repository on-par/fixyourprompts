#!/bin/bash

# ================================================================================
# Pre-Deployment Health Check Script
# ================================================================================
# 
# Validates the environment and codebase before deployment
# Can be run standalone or as part of the main deployment process
#
# Usage: ./scripts/pre-deploy-check.sh [ENVIRONMENT]
#
# ================================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-dev}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

log() {
    local level="$1"
    shift
    local color=""
    
    case "$level" in
        "ERROR")   color="$RED" ;;
        "SUCCESS") color="$GREEN" ;;
        "WARNING") color="$YELLOW" ;;
        "INFO")    color="$BLUE" ;;
    esac
    
    echo -e "${color}[$level] $*${NC}"
}

check() {
    local description="$1"
    local command="$2"
    
    echo -n "Checking $description... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((CHECKS_FAILED++))
        return 1
    fi
}

warn() {
    local description="$1"
    local command="$2"
    
    echo -n "Checking $description... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠${NC}"
        ((WARNINGS++))
        return 1
    fi
}

main() {
    log "INFO" "Starting pre-deployment checks for $ENVIRONMENT environment..."
    
    cd "$PROJECT_DIR"
    
    echo
    log "INFO" "=== Environment Checks ==="
    
    check "Node.js version >= 18" "node --version | grep -E 'v(1[8-9]|[2-9][0-9])'"
    check "npm is available" "command -v npm"
    check "git is available" "command -v git"
    check "curl is available" "command -v curl"
    
    echo
    log "INFO" "=== Project Structure Checks ==="
    
    check "package.json exists" "test -f package.json"
    check "src directory exists" "test -d src"
    check "public directory exists" "test -d public"
    check "vite.config.ts exists" "test -f vite.config.ts"
    check "tsconfig.json exists" "test -f tsconfig.json"
    
    echo
    log "INFO" "=== Dependencies Check ==="
    
    check "node_modules exists" "test -d node_modules"
    check "package-lock.json exists" "test -f package-lock.json"
    warn "node_modules is up to date" "npm outdated | wc -l | grep -q '^0$'"
    
    echo
    log "INFO" "=== Git Status Checks ==="
    
    check "working directory is clean" "git diff-index --quiet HEAD"
    check "on correct branch for $ENVIRONMENT" "
        case '$ENVIRONMENT' in
            dev) git branch --show-current | grep -E '(develop|dev|feature/)' ;;
            staging) git branch --show-current | grep -E '(staging|release/)' ;;
            prod) git branch --show-current | grep -E '(main|master)' ;;
        esac
    "
    warn "no uncommitted changes" "git status --porcelain | wc -l | grep -q '^0$'"
    
    echo
    log "INFO" "=== Code Quality Checks ==="
    
    check "TypeScript compilation" "npm run typecheck"
    check "ESLint passes" "npm run lint"
    warn "Prettier formatting" "npm run format:check"
    
    echo
    log "INFO" "=== Test Checks ==="
    
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        check "Unit tests pass" "npm run test:coverage"
    else
        warn "Unit tests pass" "npm run test:coverage"
    fi
    
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        check "E2E tests pass" "npm run test:e2e"
    fi
    
    echo
    log "INFO" "=== Build Check ==="
    
    check "Build succeeds" "npm run build"
    check "Build output exists" "test -d dist && test -f dist/index.html"
    
    # Cleanup test build
    rm -rf dist
    
    echo
    log "INFO" "=== Security Checks ==="
    
    warn "No known vulnerabilities" "npm audit --audit-level high"
    warn "No sensitive files in git" "! git ls-files | grep -E '\\.(env|key|pem|p12)$'"
    
    echo
    log "INFO" "=== Summary ==="
    echo "Checks passed: $CHECKS_PASSED"
    echo "Checks failed: $CHECKS_FAILED" 
    echo "Warnings: $WARNINGS"
    
    if [[ $CHECKS_FAILED -gt 0 ]]; then
        log "ERROR" "Pre-deployment checks failed!"
        echo
        log "ERROR" "$CHECKS_FAILED critical issues must be resolved before deployment"
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        log "WARNING" "Pre-deployment checks passed with warnings"
        echo
        log "WARNING" "$WARNINGS warnings should be addressed"
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            log "ERROR" "Production deployments should not have warnings"
            exit 1
        fi
        exit 0
    else
        log "SUCCESS" "All pre-deployment checks passed!"
        exit 0
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi