#!/bin/bash

# ================================================================================
# Deployment Configuration
# ================================================================================
# 
# Central configuration file for all deployment scripts
# Source this file to get consistent configuration across scripts
#
# Usage: source scripts/deploy.config.sh
#
# ================================================================================

# ================================================================================
# GLOBAL SETTINGS
# ================================================================================

# Script metadata
export DEPLOY_SCRIPT_VERSION="1.0.0"
export DEPLOY_CONFIG_VERSION="1.0.0"

# Timeouts and retries
export HEALTH_CHECK_TIMEOUT=300
export HEALTH_CHECK_INTERVAL=10
export BUILD_TIMEOUT=600
export TEST_TIMEOUT=900
export MAX_RETRY_ATTEMPTS=3

# Logging configuration
export LOG_LEVEL="INFO"  # DEBUG, INFO, WARNING, ERROR
export LOG_RETENTION_DAYS=30
export ENABLE_JSON_LOGGING=false

# ================================================================================
# ENVIRONMENT CONFIGURATIONS
# ================================================================================

# Development Environment
export DEV_URL="http://localhost:3000"
export DEV_DEPLOY_PATH="/var/www/fixyourprompts-dev"
export DEV_BRANCH_PATTERN="^(develop|dev|feature/.*)$"
export DEV_REQUIRE_TESTS=false
export DEV_REQUIRE_CLEAN_GIT=false
export DEV_BACKUP_RETENTION=3

# Staging Environment
export STAGING_URL="https://staging.fixyourprompts.com"
export STAGING_DEPLOY_PATH="/var/www/fixyourprompts-staging"
export STAGING_BRANCH_PATTERN="^(staging|release/.*)$"
export STAGING_REQUIRE_TESTS=true
export STAGING_REQUIRE_CLEAN_GIT=true
export STAGING_BACKUP_RETENTION=5

# Production Environment  
export PROD_URL="https://fixyourprompts.com"
export PROD_DEPLOY_PATH="/var/www/fixyourprompts-prod"
export PROD_BRANCH_PATTERN="^(main|master)$"
export PROD_REQUIRE_TESTS=true
export PROD_REQUIRE_CLEAN_GIT=true
export PROD_REQUIRE_E2E_TESTS=true
export PROD_BACKUP_RETENTION=10

# ================================================================================
# BUILD CONFIGURATIONS
# ================================================================================

# Node.js requirements
export MIN_NODE_VERSION="18.0.0"
export RECOMMENDED_NODE_VERSION="20.0.0"

# Build optimization
export NODE_OPTIONS="--max-old-space-size=4096"
export BUILD_PARALLEL=true
export ENABLE_SOURCE_MAPS=true

# Environment-specific build settings
export DEV_BUILD_MODE="development"
export STAGING_BUILD_MODE="production" 
export PROD_BUILD_MODE="production"

# Asset optimization
export ENABLE_COMPRESSION=true
export ENABLE_TREE_SHAKING=true
export BUNDLE_ANALYZER=false

# ================================================================================
# SECURITY CONFIGURATIONS
# ================================================================================

# Security requirements by environment
export DEV_SECURITY_SCAN=false
export STAGING_SECURITY_SCAN=true
export PROD_SECURITY_SCAN=true

# Required security headers
export REQUIRED_SECURITY_HEADERS=(
    "X-Content-Type-Options"
    "X-Frame-Options"
    "X-XSS-Protection"
)

# Sensitive file patterns to exclude
export SENSITIVE_FILE_PATTERNS=(
    "*.env*"
    "*.key"
    "*.pem" 
    "*.p12"
    "*secret*"
    "*password*"
)

# ================================================================================
# MONITORING AND ALERTING
# ================================================================================

# Health check endpoints
export HEALTH_CHECK_ENDPOINTS=(
    "/health"
    "/api/health"
    "/"
)

# Performance thresholds (milliseconds)
export DEV_RESPONSE_TIME_THRESHOLD=5000
export STAGING_RESPONSE_TIME_THRESHOLD=3000
export PROD_RESPONSE_TIME_THRESHOLD=2000

# Monitoring URLs (placeholder - configure based on your monitoring setup)
export MONITORING_WEBHOOK_URL=""
export SLACK_WEBHOOK_URL=""
export TEAMS_WEBHOOK_URL=""

# ================================================================================
# BACKUP AND ROLLBACK CONFIGURATIONS
# ================================================================================

# Backup settings
export BACKUP_COMPRESSION=true
export BACKUP_ENCRYPTION=false
export BACKUP_REMOTE_SYNC=false

# Rollback settings
export ENABLE_AUTO_ROLLBACK=false
export ROLLBACK_ON_HEALTH_CHECK_FAIL=false
export ROLLBACK_TIMEOUT=300

# ================================================================================
# CI/CD INTEGRATION
# ================================================================================

# CI/CD platform detection
export CI_PLATFORM="unknown"
if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
    export CI_PLATFORM="github"
elif [[ -n "${GITLAB_CI:-}" ]]; then
    export CI_PLATFORM="gitlab"
elif [[ -n "${JENKINS_URL:-}" ]]; then
    export CI_PLATFORM="jenkins"
fi

# Artifact management
export ARTIFACT_RETENTION_DAYS=30
export UPLOAD_BUILD_ARTIFACTS=false
export ARTIFACT_STORAGE_PATH="/var/artifacts/fixyourprompts"

# ================================================================================
# CUSTOM HOOKS
# ================================================================================

# Hook script paths (create these files to add custom logic)
export PRE_DEPLOY_HOOK="scripts/hooks/pre-deploy.sh"
export POST_DEPLOY_HOOK="scripts/hooks/post-deploy.sh"
export PRE_ROLLBACK_HOOK="scripts/hooks/pre-rollback.sh"  
export POST_ROLLBACK_HOOK="scripts/hooks/post-rollback.sh"

# ================================================================================
# UTILITY FUNCTIONS
# ================================================================================

# Get configuration value for current environment
get_env_config() {
    local key="$1"
    local env="${DEPLOY_ENVIRONMENT:-dev}"
    local env_upper=$(echo "$env" | tr '[:lower:]' '[:upper:]')
    
    local var_name="${env_upper}_${key}"
    echo "${!var_name:-}"
}

# Check if environment requires specific feature
env_requires() {
    local feature="$1"
    local env="${DEPLOY_ENVIRONMENT:-dev}"
    local env_upper=$(echo "$env" | tr '[:lower:]' '[:upper:]')
    
    local var_name="${env_upper}_REQUIRE_${feature}"
    local value="${!var_name:-false}"
    [[ "$value" == "true" ]]
}

# Get environment-specific threshold
get_env_threshold() {
    local metric="$1"
    local env="${DEPLOY_ENVIRONMENT:-dev}"
    local env_upper=$(echo "$env" | tr '[:lower:]' '[:upper:]')
    
    local var_name="${env_upper}_${metric}_THRESHOLD"
    echo "${!var_name:-0}"
}

# Validate configuration
validate_config() {
    local errors=0
    
    # Check required environment variables
    local required_vars=(
        "DEV_URL" "STAGING_URL" "PROD_URL"
        "DEV_DEPLOY_PATH" "STAGING_DEPLOY_PATH" "PROD_DEPLOY_PATH"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            echo "ERROR: Required configuration variable $var is not set" >&2
            ((errors++))
        fi
    done
    
    # Check Node.js version format
    if [[ ! "$MIN_NODE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "ERROR: MIN_NODE_VERSION must be in format X.Y.Z" >&2
        ((errors++))
    fi
    
    # Check timeout values are numeric
    local timeout_vars=(
        "HEALTH_CHECK_TIMEOUT" "BUILD_TIMEOUT" "TEST_TIMEOUT"
    )
    
    for var in "${timeout_vars[@]}"; do
        if [[ ! "${!var}" =~ ^[0-9]+$ ]]; then
            echo "ERROR: $var must be a positive integer" >&2
            ((errors++))
        fi
    done
    
    return $errors
}

# Load environment-specific overrides
load_env_overrides() {
    local env="${1:-${DEPLOY_ENVIRONMENT:-dev}}"
    local override_file="scripts/deploy.${env}.config.sh"
    
    if [[ -f "$override_file" ]]; then
        echo "Loading environment-specific configuration: $override_file"
        source "$override_file"
    fi
}

# ================================================================================
# INITIALIZATION
# ================================================================================

# Set default environment if not specified
export DEPLOY_ENVIRONMENT="${DEPLOY_ENVIRONMENT:-dev}"

# Load environment-specific overrides
load_env_overrides "$DEPLOY_ENVIRONMENT"

# Validate configuration on source
if ! validate_config; then
    echo "Configuration validation failed. Please check your settings." >&2
    return 1 2>/dev/null || exit 1
fi

# Export utility functions for use in other scripts
export -f get_env_config
export -f env_requires
export -f get_env_threshold
export -f validate_config
export -f load_env_overrides

echo "Deployment configuration loaded (version: $DEPLOY_CONFIG_VERSION)"
echo "Environment: $DEPLOY_ENVIRONMENT"
echo "Target URL: $(get_env_config "URL")"
echo "Deploy path: $(get_env_config "DEPLOY_PATH")"