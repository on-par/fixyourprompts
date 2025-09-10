#!/bin/bash

# ================================================================================
# FixYourPrompts Frontend Deployment Script
# ================================================================================
# 
# A comprehensive deployment script with environment support, build verification,
# rollback capabilities, health checks, and comprehensive logging.
#
# Usage: ./scripts/deploy.sh [ENVIRONMENT] [OPTIONS]
# 
# Environments: dev, staging, prod
# Options: --dry-run, --skip-tests, --force, --rollback, --verbose
#
# ================================================================================

set -euo pipefail

# ================================================================================
# CONFIGURATION AND GLOBALS
# ================================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/dist"
BACKUP_DIR="$PROJECT_DIR/.deployments"
LOG_DIR="$PROJECT_DIR/logs"

# Default configuration
ENVIRONMENT="dev"
DRY_RUN=false
SKIP_TESTS=false
FORCE=false
ROLLBACK=false
VERBOSE=false

# Deployment configurations - using functions for compatibility
get_deploy_config() {
    local env="$1"
    local key="$2"
    
    case "${env}_${key}" in
        "dev_url") echo "http://localhost:3000" ;;
        "dev_path") echo "/var/www/fixyourprompts-dev" ;;
        "dev_branch") echo "develop" ;;
        "staging_url") echo "https://staging.fixyourprompts.com" ;;
        "staging_path") echo "/var/www/fixyourprompts-staging" ;;
        "staging_branch") echo "staging" ;;
        "prod_url") echo "https://fixyourprompts.com" ;;
        "prod_path") echo "/var/www/fixyourprompts-prod" ;;
        "prod_branch") echo "main" ;;
        *) echo "" ;;
    esac
}

# Health check settings
HEALTH_CHECK_TIMEOUT=300
HEALTH_CHECK_INTERVAL=10
MAX_RETRY_ATTEMPTS=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ================================================================================
# UTILITY FUNCTIONS
# ================================================================================

log() {
    local level="$1"
    shift
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local color=""
    
    case "$level" in
        "ERROR")   color="$RED" ;;
        "SUCCESS") color="$GREEN" ;;
        "WARNING") color="$YELLOW" ;;
        "INFO")    color="$BLUE" ;;
        "DEBUG")   color="$CYAN" ;;
        *)         color="$NC" ;;
    esac
    
    echo -e "${color}[$timestamp] [$level] $*${NC}" | tee -a "$LOG_DIR/deploy-$(date +%Y%m%d).log"
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        log "DEBUG" "$@"
    fi
}

error_exit() {
    log "ERROR" "$1"
    exit 1
}

cleanup() {
    local exit_code=$?
    log "INFO" "Cleaning up temporary files..."
    
    if [[ -f "$PROJECT_DIR/.deployment.lock" ]]; then
        rm -f "$PROJECT_DIR/.deployment.lock"
    fi
    
    if [[ $exit_code -ne 0 ]]; then
        log "ERROR" "Deployment failed with exit code $exit_code"
        if [[ "$ENVIRONMENT" != "dev" ]] && [[ "$ROLLBACK" != "true" ]]; then
            log "WARNING" "Consider running rollback: $0 $ENVIRONMENT --rollback"
        fi
    fi
    
    exit $exit_code
}

# Set up signal handlers
trap cleanup EXIT
trap 'error_exit "Deployment interrupted by user"' INT TERM

# ================================================================================
# VALIDATION FUNCTIONS
# ================================================================================

validate_environment() {
    case "$ENVIRONMENT" in
        dev|staging|prod)
            log "INFO" "Deploying to environment: $ENVIRONMENT"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT. Must be one of: dev, staging, prod"
            ;;
    esac
}

validate_prerequisites() {
    log "INFO" "Validating prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        error_exit "Not in a valid frontend project directory. package.json not found."
    fi
    
    # Check for required tools
    local tools=("node" "npm" "git")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error_exit "Required tool '$tool' is not installed or not in PATH"
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    if ! version_compare "$node_version" "$required_version"; then
        error_exit "Node.js version $node_version is below required version $required_version"
    fi
    
    log "SUCCESS" "All prerequisites validated"
}

version_compare() {
    local version1="$1"
    local version2="$2"
    
    if [[ "$(printf '%s\n' "$version1" "$version2" | sort -V | head -n1)" == "$version2" ]]; then
        return 0
    else
        return 1
    fi
}

check_deployment_lock() {
    local lock_file="$PROJECT_DIR/.deployment.lock"
    
    if [[ -f "$lock_file" ]]; then
        local lock_pid=$(cat "$lock_file")
        if kill -0 "$lock_pid" 2>/dev/null; then
            if [[ "$FORCE" != "true" ]]; then
                error_exit "Another deployment is in progress (PID: $lock_pid). Use --force to override."
            else
                log "WARNING" "Forcing deployment despite existing lock file"
                rm -f "$lock_file"
            fi
        else
            log "WARNING" "Stale lock file found, removing..."
            rm -f "$lock_file"
        fi
    fi
    
    echo $$ > "$lock_file"
    log "INFO" "Deployment lock acquired"
}

# ================================================================================
# BUILD AND TEST FUNCTIONS
# ================================================================================

install_dependencies() {
    log "INFO" "Installing dependencies..."
    
    cd "$PROJECT_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would run: npm ci"
        return 0
    fi
    
    if ! npm ci; then
        error_exit "Failed to install dependencies"
    fi
    
    log "SUCCESS" "Dependencies installed successfully"
}

run_linting() {
    log "INFO" "Running linting..."
    
    cd "$PROJECT_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would run: npm run lint"
        return 0
    fi
    
    if ! npm run lint; then
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            error_exit "Linting failed. Production deployment requires clean code."
        else
            log "WARNING" "Linting failed, but continuing with non-production deployment"
        fi
    fi
    
    log "SUCCESS" "Linting completed"
}

run_type_check() {
    log "INFO" "Running TypeScript type check..."
    
    cd "$PROJECT_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would run: npm run typecheck"
        return 0
    fi
    
    if ! npm run typecheck; then
        error_exit "TypeScript type check failed"
    fi
    
    log "SUCCESS" "Type check completed"
}

run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log "WARNING" "Skipping tests as requested"
        return 0
    fi
    
    log "INFO" "Running unit tests..."
    
    cd "$PROJECT_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would run: npm run test:coverage"
        return 0
    fi
    
    if ! npm run test:coverage; then
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            error_exit "Tests failed. Production deployment requires all tests to pass."
        else
            log "WARNING" "Tests failed, but continuing with non-production deployment"
        fi
    fi
    
    log "SUCCESS" "Unit tests completed"
}

run_e2e_tests() {
    if [[ "$SKIP_TESTS" == "true" ]] || [[ "$ENVIRONMENT" == "dev" ]]; then
        log "INFO" "Skipping E2E tests for $ENVIRONMENT environment"
        return 0
    fi
    
    log "INFO" "Running end-to-end tests..."
    
    cd "$PROJECT_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would run: npm run test:e2e"
        return 0
    fi
    
    # Install Playwright browsers if needed
    npx playwright install --with-deps
    
    if ! npm run test:e2e; then
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            error_exit "E2E tests failed. Production deployment requires all tests to pass."
        else
            log "WARNING" "E2E tests failed, but continuing with staging deployment"
        fi
    fi
    
    log "SUCCESS" "End-to-end tests completed"
}

build_application() {
    log "INFO" "Building application for $ENVIRONMENT..."
    
    cd "$PROJECT_DIR"
    
    # Set environment-specific build variables
    export NODE_ENV="${ENVIRONMENT}"
    export VITE_ENV="${ENVIRONMENT}"
    export VITE_API_URL="$(get_deploy_config "$ENVIRONMENT" "url")/api"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would run: npm run build"
        return 0
    fi
    
    # Clean previous build
    rm -rf "$BUILD_DIR"
    
    if ! npm run build; then
        error_exit "Build failed"
    fi
    
    # Verify build output
    if [[ ! -d "$BUILD_DIR" ]] || [[ ! -f "$BUILD_DIR/index.html" ]]; then
        error_exit "Build output is invalid or missing"
    fi
    
    local build_size=$(du -sh "$BUILD_DIR" | cut -f1)
    log "SUCCESS" "Application built successfully (Size: $build_size)"
}

# ================================================================================
# BACKUP AND ROLLBACK FUNCTIONS
# ================================================================================

create_backup() {
    local deploy_path="$(get_deploy_config "$ENVIRONMENT" "path")"
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$ENVIRONMENT/$backup_name"
    
    log "INFO" "Creating backup of current deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would create backup at: $backup_path"
        return 0
    fi
    
    mkdir -p "$BACKUP_DIR/$ENVIRONMENT"
    
    if [[ -d "$deploy_path" ]]; then
        cp -r "$deploy_path" "$backup_path"
        
        # Store deployment metadata
        cat > "$backup_path/.deployment-info" << EOF
timestamp=$(date -Iseconds)
environment=$ENVIRONMENT
git_branch=$(git branch --show-current)
git_commit=$(git rev-parse HEAD)
git_commit_short=$(git rev-parse --short HEAD)
backup_path=$backup_path
deploy_path=$deploy_path
EOF
        
        # Keep only the last 5 backups
        local backups=($(ls -t "$BACKUP_DIR/$ENVIRONMENT/" | head -n 6))
        if [[ ${#backups[@]} -gt 5 ]]; then
            for ((i=5; i<${#backups[@]}; i++)); do
                rm -rf "$BACKUP_DIR/$ENVIRONMENT/${backups[i]}"
                log_verbose "Removed old backup: ${backups[i]}"
            done
        fi
        
        echo "$backup_name" > "$BACKUP_DIR/$ENVIRONMENT/.latest-backup"
        log "SUCCESS" "Backup created: $backup_name"
    else
        log "INFO" "No existing deployment found, skipping backup"
    fi
}

perform_rollback() {
    local backup_name="${2:-$(cat "$BACKUP_DIR/$ENVIRONMENT/.latest-backup" 2>/dev/null || echo "")}"
    local backup_path="$BACKUP_DIR/$ENVIRONMENT/$backup_name"
    local deploy_path="$(get_deploy_config "$ENVIRONMENT" "path")"
    
    log "INFO" "Performing rollback to backup: $backup_name"
    
    if [[ ! -d "$backup_path" ]]; then
        error_exit "Backup not found: $backup_path"
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would rollback to: $backup_path"
        return 0
    fi
    
    # Backup current state before rollback
    if [[ -d "$deploy_path" ]]; then
        local rollback_backup="rollback-before-$(date +%Y%m%d-%H%M%S)"
        cp -r "$deploy_path" "$BACKUP_DIR/$ENVIRONMENT/$rollback_backup"
        log "INFO" "Current state backed up as: $rollback_backup"
    fi
    
    # Perform rollback
    rm -rf "$deploy_path"
    cp -r "$backup_path" "$deploy_path"
    
    # Remove deployment metadata from rolled back directory
    rm -f "$deploy_path/.deployment-info"
    
    log "SUCCESS" "Rollback completed successfully"
    
    # Perform health check after rollback
    perform_health_check
}

# ================================================================================
# DEPLOYMENT FUNCTIONS
# ================================================================================

deploy_to_environment() {
    local deploy_path="$(get_deploy_config "$ENVIRONMENT" "path")"
    
    log "INFO" "Deploying to $ENVIRONMENT environment..."
    log "INFO" "Deploy path: $deploy_path"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would deploy to: $deploy_path"
        return 0
    fi
    
    # Create deploy directory if it doesn't exist
    mkdir -p "$(dirname "$deploy_path")"
    
    # Remove old deployment
    if [[ -d "$deploy_path" ]]; then
        rm -rf "$deploy_path"
    fi
    
    # Copy new build
    cp -r "$BUILD_DIR" "$deploy_path"
    
    # Set proper permissions
    find "$deploy_path" -type f -exec chmod 644 {} \;
    find "$deploy_path" -type d -exec chmod 755 {} \;
    
    # Create deployment info file
    cat > "$deploy_path/.deployment-info" << EOF
timestamp=$(date -Iseconds)
environment=$ENVIRONMENT
git_branch=$(git branch --show-current)
git_commit=$(git rev-parse HEAD)
git_commit_short=$(git rev-parse --short HEAD)
deploy_path=$deploy_path
deployer=$(whoami)
deployment_id=$(uuidgen)
EOF
    
    log "SUCCESS" "Deployment completed to $ENVIRONMENT"
}

# ================================================================================
# HEALTH CHECK FUNCTIONS
# ================================================================================

perform_health_check() {
    local health_url="$(get_deploy_config "$ENVIRONMENT" "url")"
    
    log "INFO" "Performing health check on $health_url..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would perform health check on: $health_url"
        return 0
    fi
    
    local start_time=$(date +%s)
    local attempts=0
    
    while [[ $attempts -lt $MAX_RETRY_ATTEMPTS ]]; do
        local current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))
        
        if [[ $elapsed_time -gt $HEALTH_CHECK_TIMEOUT ]]; then
            error_exit "Health check timed out after ${HEALTH_CHECK_TIMEOUT}s"
        fi
        
        log_verbose "Health check attempt $((attempts + 1))/$MAX_RETRY_ATTEMPTS..."
        
        if curl -f -s -o /dev/null -w "%{http_code}" --max-time 30 "$health_url" | grep -q "200"; then
            log "SUCCESS" "Health check passed after $((attempts + 1)) attempts"
            return 0
        fi
        
        attempts=$((attempts + 1))
        if [[ $attempts -lt $MAX_RETRY_ATTEMPTS ]]; then
            log "WARNING" "Health check failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done
    
    error_exit "Health check failed after $MAX_RETRY_ATTEMPTS attempts"
}

# ================================================================================
# REPORTING FUNCTIONS
# ================================================================================

generate_deployment_report() {
    local report_file="$LOG_DIR/deployment-report-$(date +%Y%m%d-%H%M%S).json"
    
    log "INFO" "Generating deployment report..."
    
    cat > "$report_file" << EOF
{
  "deployment": {
    "timestamp": "$(date -Iseconds)",
    "environment": "$ENVIRONMENT",
    "success": true,
    "duration": "$(($(date +%s) - START_TIME))s"
  },
  "git": {
    "branch": "$(git branch --show-current)",
    "commit": "$(git rev-parse HEAD)",
    "commit_short": "$(git rev-parse --short HEAD)",
    "commit_message": "$(git log -1 --pretty=format:'%s')"
  },
  "build": {
    "size": "$(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1 || echo 'N/A')",
    "files": $(find "$BUILD_DIR" -type f 2>/dev/null | wc -l || echo '0')
  },
  "deployment_path": "$(get_deploy_config "$ENVIRONMENT" "path")","
  "health_check_url": "$(get_deploy_config "$ENVIRONMENT" "url")","
  "deployer": "$(whoami)",
  "options": {
    "dry_run": $DRY_RUN,
    "skip_tests": $SKIP_TESTS,
    "force": $FORCE,
    "rollback": $ROLLBACK
  }
}
EOF
    
    log "INFO" "Deployment report saved: $report_file"
}

# ================================================================================
# ARGUMENT PARSING
# ================================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ ! "$1" =~ ^-- ]]; then
                    case "$1" in
                        dev|staging|prod)
                            ENVIRONMENT="$1"
                            ;;
                        *)
                            error_exit "Invalid environment: $1. Must be one of: dev, staging, prod"
                            ;;
                    esac
                else
                    error_exit "Unknown option: $1"
                fi
                shift
                ;;
        esac
    done
}

show_help() {
    cat << EOF
FixYourPrompts Frontend Deployment Script

USAGE:
    $0 [ENVIRONMENT] [OPTIONS]

ENVIRONMENTS:
    dev       Development environment (default)
    staging   Staging environment
    prod      Production environment

OPTIONS:
    --dry-run      Show what would be done without making changes
    --skip-tests   Skip running tests during deployment
    --force        Force deployment even if another is in progress
    --rollback     Rollback to the previous deployment
    --verbose      Enable verbose logging
    --help, -h     Show this help message

EXAMPLES:
    $0 dev                    # Deploy to development
    $0 staging --dry-run      # Dry run deployment to staging
    $0 prod --verbose         # Deploy to production with verbose logging
    $0 prod --rollback        # Rollback production deployment

ROLLBACK:
    To rollback a deployment:
    $0 [environment] --rollback

The script will automatically rollback to the most recent backup.

EOF
}

# ================================================================================
# MAIN EXECUTION FLOW
# ================================================================================

main() {
    local START_TIME=$(date +%s)
    
    # Initialize logging
    mkdir -p "$LOG_DIR"
    
    log "INFO" "Starting FixYourPrompts frontend deployment..."
    log "INFO" "Script version: 1.0.0"
    log "INFO" "Deployment ID: $(date +%Y%m%d-%H%M%S)-$$"
    
    # Parse command line arguments
    parse_arguments "$@"
    
    # Display configuration
    log "INFO" "Configuration:"
    log "INFO" "  Environment: $ENVIRONMENT"
    log "INFO" "  Dry run: $DRY_RUN"
    log "INFO" "  Skip tests: $SKIP_TESTS"
    log "INFO" "  Force: $FORCE"
    log "INFO" "  Rollback: $ROLLBACK"
    log "INFO" "  Verbose: $VERBOSE"
    
    # Validate environment and prerequisites
    validate_environment
    validate_prerequisites
    
    # Handle rollback request
    if [[ "$ROLLBACK" == "true" ]]; then
        perform_rollback
        log "SUCCESS" "Rollback completed successfully!"
        return 0
    fi
    
    # Check for deployment lock
    check_deployment_lock
    
    # Create backup of current deployment
    create_backup
    
    # Install dependencies
    install_dependencies
    
    # Run quality checks
    run_linting
    run_type_check
    
    # Run tests
    run_tests
    run_e2e_tests
    
    # Build application
    build_application
    
    # Deploy to target environment
    deploy_to_environment
    
    # Perform health check
    perform_health_check
    
    # Generate deployment report
    generate_deployment_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    
    log "SUCCESS" "Deployment completed successfully!"
    log "INFO" "Total deployment time: ${duration}s"
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "URL: $(get_deploy_config "$ENVIRONMENT" "url")"
}

# ================================================================================
# SCRIPT EXECUTION
# ================================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi