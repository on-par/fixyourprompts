#!/bin/bash

# ================================================================================
# Rollback Script
# ================================================================================
# 
# Standalone rollback script for quick recovery from failed deployments
# Lists available backups and performs rollback operations
#
# Usage: ./scripts/rollback.sh [ENVIRONMENT] [OPTIONS]
# Options: --list, --backup-name=NAME, --force, --dry-run
#
# ================================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/.deployments"
LOG_DIR="$PROJECT_DIR/logs"

# Default configuration
ENVIRONMENT="${1:-dev}"
LIST_BACKUPS=false
BACKUP_NAME=""
FORCE=false
DRY_RUN=false

# Deployment paths - using functions for compatibility
get_deploy_config() {
    local env="$1"
    local key="$2"
    
    case "${env}_${key}" in
        "dev_url") echo "http://localhost:3000" ;;
        "dev_path") echo "/var/www/fixyourprompts-dev" ;;
        "staging_url") echo "https://staging.fixyourprompts.com" ;;
        "staging_path") echo "/var/www/fixyourprompts-staging" ;;
        "prod_url") echo "https://fixyourprompts.com" ;;
        "prod_path") echo "/var/www/fixyourprompts-prod" ;;
        *) echo "" ;;
    esac
}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

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
    esac
    
    echo -e "${color}[$timestamp] [$level] $*${NC}"
    
    # Log to file if log directory exists
    if [[ -d "$LOG_DIR" ]]; then
        echo "[$timestamp] [$level] $*" >> "$LOG_DIR/rollback-$(date +%Y%m%d).log"
    fi
}

error_exit() {
    log "ERROR" "$1"
    exit 1
}

# ================================================================================
# Validation Functions
# ================================================================================

validate_environment() {
    case "$ENVIRONMENT" in
        dev|staging|prod)
            log "INFO" "Environment: $ENVIRONMENT"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT. Must be one of: dev, staging, prod"
            ;;
    esac
}

validate_backup_dir() {
    local env_backup_dir="$BACKUP_DIR/$ENVIRONMENT"
    
    if [[ ! -d "$env_backup_dir" ]]; then
        error_exit "No backup directory found for $ENVIRONMENT environment at: $env_backup_dir"
    fi
    
    local backup_count=$(find "$env_backup_dir" -maxdepth 1 -type d -name "backup-*" | wc -l)
    if [[ $backup_count -eq 0 ]]; then
        error_exit "No backups found for $ENVIRONMENT environment"
    fi
    
    log "INFO" "Found $backup_count backup(s) for $ENVIRONMENT environment"
}

# ================================================================================
# Backup Management Functions
# ================================================================================

list_backups() {
    local env_backup_dir="$BACKUP_DIR/$ENVIRONMENT"
    
    log "INFO" "Available backups for $ENVIRONMENT environment:"
    echo
    
    if [[ ! -d "$env_backup_dir" ]]; then
        log "WARNING" "No backup directory found for $ENVIRONMENT"
        return 1
    fi
    
    local backups=($(find "$env_backup_dir" -maxdepth 1 -type d -name "backup-*" | sort -r))
    local count=0
    
    for backup_path in "${backups[@]}"; do
        local backup_name=$(basename "$backup_path")
        local info_file="$backup_path/.deployment-info"
        
        ((count++))
        
        echo -e "${BLUE}[$count] $backup_name${NC}"
        
        if [[ -f "$info_file" ]]; then
            local timestamp=$(grep "^timestamp=" "$info_file" | cut -d'=' -f2)
            local git_branch=$(grep "^git_branch=" "$info_file" | cut -d'=' -f2)
            local git_commit_short=$(grep "^git_commit_short=" "$info_file" | cut -d'=' -f2)
            
            echo "    Created: $timestamp"
            echo "    Branch: $git_branch"
            echo "    Commit: $git_commit_short"
            
            # Get backup size
            local backup_size=$(du -sh "$backup_path" 2>/dev/null | cut -f1)
            echo "    Size: $backup_size"
        else
            echo "    ${YELLOW}(No deployment info available)${NC}"
        fi
        
        echo
    done
    
    if [[ $count -eq 0 ]]; then
        log "WARNING" "No backups found for $ENVIRONMENT environment"
        return 1
    fi
    
    # Show which backup would be used by default
    local latest_backup_file="$env_backup_dir/.latest-backup"
    if [[ -f "$latest_backup_file" ]]; then
        local latest_backup=$(cat "$latest_backup_file")
        echo -e "${GREEN}Default rollback target: $latest_backup${NC}"
    fi
    
    return 0
}

get_backup_info() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$ENVIRONMENT/$backup_name"
    local info_file="$backup_path/.deployment-info"
    
    if [[ ! -d "$backup_path" ]]; then
        error_exit "Backup not found: $backup_name"
    fi
    
    log "INFO" "Backup Information:"
    echo "  Name: $backup_name"
    echo "  Path: $backup_path"
    
    if [[ -f "$info_file" ]]; then
        while IFS='=' read -r key value; do
            case "$key" in
                timestamp) echo "  Created: $value" ;;
                git_branch) echo "  Branch: $value" ;;
                git_commit_short) echo "  Commit: $value" ;;
                environment) echo "  Environment: $value" ;;
            esac
        done < "$info_file"
    fi
    
    local backup_size=$(du -sh "$backup_path" 2>/dev/null | cut -f1)
    echo "  Size: $backup_size"
}

# ================================================================================
# Rollback Functions
# ================================================================================

perform_rollback() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$ENVIRONMENT/$backup_name"
    local deploy_path="$(get_deploy_config "$ENVIRONMENT" "path")"
    
    log "INFO" "Starting rollback process..."
    log "INFO" "Backup: $backup_name"
    log "INFO" "Target: $deploy_path"
    
    if [[ ! -d "$backup_path" ]]; then
        error_exit "Backup not found: $backup_path"
    fi
    
    # Show backup info
    get_backup_info "$backup_name"
    echo
    
    # Confirmation for production
    if [[ "$ENVIRONMENT" == "prod" ]] && [[ "$FORCE" != "true" ]]; then
        log "WARNING" "You are about to rollback PRODUCTION environment!"
        read -p "Type 'rollback' to confirm: " -r
        if [[ ! $REPLY == "rollback" ]]; then
            log "INFO" "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] Would perform rollback:"
        log "INFO" "[DRY RUN] - Backup current deployment"
        log "INFO" "[DRY RUN] - Replace $deploy_path with $backup_path"
        log "INFO" "[DRY RUN] - Perform health check"
        return 0
    fi
    
    # Create backup of current deployment before rollback
    create_rollback_backup "$deploy_path"
    
    # Perform the rollback
    log "INFO" "Replacing current deployment..."
    rm -rf "$deploy_path"
    cp -r "$backup_path" "$deploy_path"
    
    # Remove deployment metadata from rolled back directory
    rm -f "$deploy_path/.deployment-info"
    
    # Set proper permissions
    find "$deploy_path" -type f -exec chmod 644 {} \;
    find "$deploy_path" -type d -exec chmod 755 {} \;
    
    log "SUCCESS" "Rollback completed successfully"
    
    # Perform health check
    perform_health_check
}

create_rollback_backup() {
    local current_deploy_path="$1"
    local rollback_backup_name="rollback-before-$(date +%Y%m%d-%H%M%S)"
    local rollback_backup_path="$BACKUP_DIR/$ENVIRONMENT/$rollback_backup_name"
    
    if [[ -d "$current_deploy_path" ]]; then
        log "INFO" "Backing up current deployment before rollback..."
        
        mkdir -p "$BACKUP_DIR/$ENVIRONMENT"
        cp -r "$current_deploy_path" "$rollback_backup_path"
        
        # Create metadata for the rollback backup
        cat > "$rollback_backup_path/.deployment-info" << EOF
timestamp=$(date -Iseconds)
environment=$ENVIRONMENT
type=rollback_backup
original_path=$current_deploy_path
EOF
        
        log "SUCCESS" "Current deployment backed up as: $rollback_backup_name"
    else
        log "WARNING" "No current deployment found to backup"
    fi
}

perform_health_check() {
    local health_url="$(get_deploy_config "$ENVIRONMENT" "url")"
    
    log "INFO" "Performing post-rollback health check..."
    
    # Use the health check script if available
    local health_script="$SCRIPT_DIR/health-check.sh"
    if [[ -f "$health_script" ]]; then
        if "$health_script" "$health_url" --timeout=60; then
            log "SUCCESS" "Post-rollback health check passed"
        else
            log "ERROR" "Post-rollback health check failed"
            log "ERROR" "Manual verification required for: $health_url"
            return 1
        fi
    else
        # Simple health check
        log "INFO" "Performing basic health check..."
        if curl -f -s -o /dev/null --max-time 30 "$health_url"; then
            log "SUCCESS" "Basic health check passed"
        else
            log "ERROR" "Basic health check failed"
            log "ERROR" "Please verify deployment manually: $health_url"
            return 1
        fi
    fi
}

# ================================================================================
# Interactive Mode
# ================================================================================

interactive_rollback() {
    log "INFO" "Interactive rollback mode"
    echo
    
    # Show available backups
    if ! list_backups; then
        exit 1
    fi
    
    # Get user selection
    echo -n "Enter backup number or name (or 'q' to quit): "
    read -r selection
    
    if [[ "$selection" == "q" ]] || [[ "$selection" == "quit" ]]; then
        log "INFO" "Rollback cancelled by user"
        exit 0
    fi
    
    local backup_name=""
    
    # Check if selection is a number
    if [[ "$selection" =~ ^[0-9]+$ ]]; then
        local backups=($(find "$BACKUP_DIR/$ENVIRONMENT" -maxdepth 1 -type d -name "backup-*" | sort -r))
        local index=$((selection - 1))
        
        if [[ $index -ge 0 ]] && [[ $index -lt ${#backups[@]} ]]; then
            backup_name=$(basename "${backups[$index]}")
        else
            error_exit "Invalid selection: $selection"
        fi
    else
        # Assume it's a backup name
        backup_name="$selection"
        if [[ ! "$backup_name" =~ ^backup- ]]; then
            backup_name="backup-$backup_name"
        fi
    fi
    
    perform_rollback "$backup_name"
}

# ================================================================================
# Argument Parsing
# ================================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --list|-l)
                LIST_BACKUPS=true
                shift
                ;;
            --backup-name=*)
                BACKUP_NAME="${1#*=}"
                shift
                ;;
            --backup-name)
                BACKUP_NAME="$2"
                shift 2
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ -z "${ENVIRONMENT:-}" ]] && [[ ! "$1" =~ ^-- ]]; then
                    ENVIRONMENT="$1"
                fi
                shift
                ;;
        esac
    done
}

show_help() {
    cat << EOF
Rollback Script for FixYourPrompts Frontend

USAGE:
    $0 [ENVIRONMENT] [OPTIONS]

ENVIRONMENTS:
    dev       Development environment
    staging   Staging environment  
    prod      Production environment

OPTIONS:
    --list, -l                List available backups
    --backup-name=NAME        Rollback to specific backup
    --force                   Skip confirmation prompts
    --dry-run                 Show what would be done without making changes
    --help, -h                Show this help message

EXAMPLES:
    $0 dev --list                              # List dev backups
    $0 staging --backup-name=backup-20240101   # Rollback to specific backup
    $0 prod --dry-run                          # Preview production rollback
    $0 dev                                     # Interactive rollback

INTERACTIVE MODE:
    If no backup name is specified, the script will enter interactive mode
    and display available backups for selection.

EOF
}

# ================================================================================
# Main Execution
# ================================================================================

main() {
    mkdir -p "$LOG_DIR"
    
    log "INFO" "Starting rollback script..."
    
    parse_arguments "$@"
    
    validate_environment
    validate_backup_dir
    
    if [[ "$LIST_BACKUPS" == "true" ]]; then
        list_backups
        exit 0
    fi
    
    if [[ -n "$BACKUP_NAME" ]]; then
        # Direct rollback to specified backup
        if [[ ! "$BACKUP_NAME" =~ ^backup- ]]; then
            BACKUP_NAME="backup-$BACKUP_NAME"
        fi
        perform_rollback "$BACKUP_NAME"
    else
        # Interactive mode - get latest backup or prompt user
        local latest_backup_file="$BACKUP_DIR/$ENVIRONMENT/.latest-backup"
        if [[ -f "$latest_backup_file" ]]; then
            local latest_backup=$(cat "$latest_backup_file")
            
            if [[ "$FORCE" == "true" ]]; then
                perform_rollback "$latest_backup"
            else
                interactive_rollback
            fi
        else
            interactive_rollback
        fi
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi