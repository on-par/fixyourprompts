#!/bin/bash

# ================================================================================
# Health Check Script
# ================================================================================
# 
# Performs comprehensive health checks on deployed applications
# Can be used standalone or as part of deployment verification
#
# Usage: ./scripts/health-check.sh [URL] [OPTIONS]
# Options: --timeout=300 --verbose --json
#
# ================================================================================

set -euo pipefail

# Default configuration
URL="${1:-http://localhost:3000}"
TIMEOUT=300
VERBOSE=false
JSON_OUTPUT=false
MAX_RETRIES=5
RETRY_INTERVAL=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Results tracking - using simple variables for compatibility
TOTAL_CHECKS=0
PASSED_CHECKS=0
RESULTS_FILE="/tmp/health_check_results_$$"
RESULTS_META_FILE="/tmp/health_check_meta_$$"

log() {
    if [[ "$JSON_OUTPUT" != "true" ]]; then
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
    fi
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        log "DEBUG" "$@"
    fi
}

record_result() {
    local check_name="$1"
    local success="$2"
    local details="$3"
    local response_time="${4:-0}"
    
    # Store results in temporary files
    echo "${check_name}_success=$success" >> "$RESULTS_FILE"
    echo "${check_name}_details=$details" >> "$RESULTS_FILE"
    echo "${check_name}_response_time=$response_time" >> "$RESULTS_FILE"
    
    ((TOTAL_CHECKS++))
    if [[ "$success" == "true" ]]; then
        ((PASSED_CHECKS++))
    fi
}

# ================================================================================
# Health Check Functions
# ================================================================================

check_basic_connectivity() {
    log "INFO" "Checking basic connectivity..."
    
    local start_time=$(date +%s%3N)
    local http_code
    local response_time
    
    if http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$URL"); then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        if [[ "$http_code" -eq 200 ]]; then
            log "SUCCESS" "Basic connectivity check passed (${response_time}ms)"
            record_result "basic_connectivity" "true" "HTTP $http_code" "$response_time"
            return 0
        else
            log "ERROR" "Received HTTP $http_code"
            record_result "basic_connectivity" "false" "HTTP $http_code" "$response_time"
            return 1
        fi
    else
        log "ERROR" "Failed to connect to $URL"
        record_result "basic_connectivity" "false" "Connection failed" "0"
        return 1
    fi
}

check_page_content() {
    log "INFO" "Checking page content..."
    
    local start_time=$(date +%s%3N)
    local content
    local response_time
    
    if content=$(curl -s --max-time 30 "$URL"); then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        # Check for essential HTML elements
        local checks_passed=0
        local total_content_checks=4
        
        if echo "$content" | grep -q "<html"; then
            ((checks_passed++))
            log_verbose "✓ HTML tag found"
        fi
        
        if echo "$content" | grep -q "<title>"; then
            ((checks_passed++))
            log_verbose "✓ Title tag found"
        fi
        
        if echo "$content" | grep -q "<div"; then
            ((checks_passed++))
            log_verbose "✓ Div elements found"
        fi
        
        if echo "$content" | grep -q -E "(js|css|script)"; then
            ((checks_passed++))
            log_verbose "✓ Assets referenced"
        fi
        
        if [[ $checks_passed -eq $total_content_checks ]]; then
            log "SUCCESS" "Page content validation passed (${response_time}ms)"
            record_result "page_content" "true" "$checks_passed/$total_content_checks checks passed" "$response_time"
            return 0
        else
            log "WARNING" "Page content validation partial ($checks_passed/$total_content_checks checks passed)"
            record_result "page_content" "false" "$checks_passed/$total_content_checks checks passed" "$response_time"
            return 1
        fi
    else
        log "ERROR" "Failed to retrieve page content"
        record_result "page_content" "false" "Failed to retrieve content" "0"
        return 1
    fi
}

check_assets() {
    log "INFO" "Checking critical assets..."
    
    local assets=("favicon.ico" "assets/" "vite.svg")
    local assets_found=0
    local total_assets=${#assets[@]}
    
    for asset in "${assets[@]}"; do
        local asset_url="${URL}/${asset}"
        local start_time=$(date +%s%3N)
        
        if curl -s -f -o /dev/null --max-time 10 "$asset_url"; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))
            ((assets_found++))
            log_verbose "✓ $asset found (${response_time}ms)"
        else
            log_verbose "✗ $asset not found or inaccessible"
        fi
    done
    
    if [[ $assets_found -gt 0 ]]; then
        log "SUCCESS" "Assets check passed ($assets_found/$total_assets found)"
        record_result "assets" "true" "$assets_found/$total_assets assets found" "0"
        return 0
    else
        log "WARNING" "No critical assets found"
        record_result "assets" "false" "0/$total_assets assets found" "0"
        return 1
    fi
}

check_performance() {
    log "INFO" "Checking performance metrics..."
    
    local total_time=0
    local samples=3
    local max_acceptable_time=3000  # 3 seconds
    
    for ((i=1; i<=samples; i++)); do
        local start_time=$(date +%s%3N)
        
        if curl -s -o /dev/null --max-time 30 "$URL"; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))
            total_time=$((total_time + response_time))
            log_verbose "Sample $i: ${response_time}ms"
        else
            log "ERROR" "Performance check failed on sample $i"
            record_result "performance" "false" "Failed to complete performance test" "0"
            return 1
        fi
    done
    
    local avg_time=$((total_time / samples))
    
    if [[ $avg_time -le $max_acceptable_time ]]; then
        log "SUCCESS" "Performance check passed (avg: ${avg_time}ms)"
        record_result "performance" "true" "Average response time: ${avg_time}ms" "$avg_time"
        return 0
    else
        log "WARNING" "Performance check failed (avg: ${avg_time}ms > ${max_acceptable_time}ms)"
        record_result "performance" "false" "Average response time too high: ${avg_time}ms" "$avg_time"
        return 1
    fi
}

check_security_headers() {
    log "INFO" "Checking security headers..."
    
    local start_time=$(date +%s%3N)
    local headers
    local response_time
    local security_score=0
    local total_security_checks=5
    
    if headers=$(curl -s -I --max-time 30 "$URL"); then
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        # Check for security headers
        if echo "$headers" | grep -qi "x-content-type-options"; then
            ((security_score++))
            log_verbose "✓ X-Content-Type-Options header found"
        fi
        
        if echo "$headers" | grep -qi "x-frame-options"; then
            ((security_score++))
            log_verbose "✓ X-Frame-Options header found"
        fi
        
        if echo "$headers" | grep -qi "x-xss-protection"; then
            ((security_score++))
            log_verbose "✓ X-XSS-Protection header found"
        fi
        
        if echo "$headers" | grep -qi "strict-transport-security"; then
            ((security_score++))
            log_verbose "✓ Strict-Transport-Security header found"
        fi
        
        if echo "$headers" | grep -qi "content-security-policy"; then
            ((security_score++))
            log_verbose "✓ Content-Security-Policy header found"
        fi
        
        if [[ $security_score -ge 2 ]]; then
            log "SUCCESS" "Security headers check passed ($security_score/$total_security_checks)"
            record_result "security_headers" "true" "$security_score/$total_security_checks headers present" "$response_time"
            return 0
        else
            log "WARNING" "Security headers check failed ($security_score/$total_security_checks)"
            record_result "security_headers" "false" "Only $security_score/$total_security_checks headers present" "$response_time"
            return 1
        fi
    else
        log "ERROR" "Failed to retrieve headers"
        record_result "security_headers" "false" "Failed to retrieve headers" "0"
        return 1
    fi
}

# ================================================================================
# Main Health Check Flow
# ================================================================================

run_health_checks() {
    log "INFO" "Starting comprehensive health check for: $URL"
    log "INFO" "Timeout: ${TIMEOUT}s, Max retries: $MAX_RETRIES"
    
    local overall_success=true
    local start_time=$(date +%s)
    
    # Run all health checks
    check_basic_connectivity || overall_success=false
    check_page_content || overall_success=false
    check_assets || overall_success=false
    check_performance || overall_success=false
    check_security_headers || overall_success=false
    
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    # Generate results
    if [[ "$JSON_OUTPUT" == "true" ]]; then
        output_json_results "$total_duration" "$overall_success"
    else
        output_text_results "$total_duration" "$overall_success"
    fi
    
    return $([[ "$overall_success" == "true" ]] && echo 0 || echo 1)
}

output_text_results() {
    local duration="$1"
    local success="$2"
    
    echo
    log "INFO" "=== Health Check Summary ==="
    echo "Total checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $((TOTAL_CHECKS - PASSED_CHECKS))"
    echo "Duration: ${duration}s"
    echo "URL: $URL"
    echo
    
    if [[ "$success" == "true" ]]; then
        log "SUCCESS" "All critical health checks passed!"
        return 0
    else
        log "ERROR" "Some health checks failed!"
        return 1
    fi
}

output_json_results() {
    local duration="$1"
    local success="$2"
    
    cat << EOF
{
  "timestamp": "$(date -Iseconds)",
  "url": "$URL",
  "overall_success": $success,
  "total_duration": $duration,
  "summary": {
    "total_checks": $TOTAL_CHECKS,
    "passed_checks": $PASSED_CHECKS,
    "failed_checks": $((TOTAL_CHECKS - PASSED_CHECKS))
  },
  "results": {
EOF
    
    if [[ -f "$RESULTS_FILE" ]]; then
        local first=true
        local checks=($(grep "_success=" "$RESULTS_FILE" | cut -d'=' -f1 | sed 's/_success//'))
        
        for check_name in "${checks[@]}"; do
            local success_val=$(grep "^${check_name}_success=" "$RESULTS_FILE" | cut -d'=' -f2)
            local details=$(grep "^${check_name}_details=" "$RESULTS_FILE" | cut -d'=' -f2-)
            local response_time=$(grep "^${check_name}_response_time=" "$RESULTS_FILE" | cut -d'=' -f2)
            
            if [[ "$first" == "false" ]]; then
                echo ","
            fi
            first=false
            
            cat << EOF
    "$check_name": {
      "success": $success_val,
      "details": "$details",
      "response_time_ms": $response_time
    }
EOF
        done
    fi
    
    echo
    echo "  }"
    echo "}"
}

# ================================================================================
# Argument Parsing and Main
# ================================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --timeout=*)
                TIMEOUT="${1#*=}"
                shift
                ;;
            --timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --json)
                JSON_OUTPUT=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                if [[ -z "${URL:-}" ]] && [[ ! "$1" =~ ^-- ]]; then
                    URL="$1"
                fi
                shift
                ;;
        esac
    done
}

show_help() {
    cat << EOF
Health Check Script for FixYourPrompts Frontend

USAGE:
    $0 [URL] [OPTIONS]

ARGUMENTS:
    URL                 URL to check (default: http://localhost:3000)

OPTIONS:
    --timeout=SECONDS   Timeout for checks (default: 300)
    --verbose           Enable verbose output
    --json             Output results in JSON format
    --help, -h         Show this help message

EXAMPLES:
    $0                                          # Check localhost:3000
    $0 https://fixyourprompts.com              # Check production
    $0 https://staging.fixyourprompts.com --json  # JSON output
    $0 http://localhost:3000 --verbose --timeout=60

EXIT CODES:
    0    All health checks passed
    1    One or more health checks failed

EOF
}

cleanup() {
    # Clean up temporary files
    rm -f "$RESULTS_FILE" "$RESULTS_META_FILE"
}

main() {
    # Set up cleanup trap
    trap cleanup EXIT
    
    parse_arguments "$@"
    run_health_checks
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi