# FixYourPrompts Frontend Deployment Scripts

This directory contains comprehensive deployment scripts for the FixYourPrompts frontend application, providing production-ready deployment capabilities with comprehensive functionality including environment-specific deployment, build verification, rollback capabilities, and health checks.

## 📁 Script Overview

### Core Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy.sh` | Main deployment script with full functionality | `./deploy.sh [env] [options]` |
| `pre-deploy-check.sh` | Validates environment and codebase before deployment | `./pre-deploy-check.sh [env]` |
| `health-check.sh` | Comprehensive health checks for deployed applications | `./health-check.sh [url] [options]` |
| `rollback.sh` | Standalone rollback script for quick recovery | `./rollback.sh [env] [options]` |
| `deploy.config.sh` | Central configuration file (sourced by other scripts) | `source ./deploy.config.sh` |

## 🚀 Quick Start

### Basic Deployment

```bash
# Deploy to development
./scripts/deploy.sh dev

# Deploy to staging with verbose output
./scripts/deploy.sh staging --verbose

# Deploy to production
./scripts/deploy.sh prod
```

### Pre-Deployment Validation

```bash
# Check if ready to deploy to production
./scripts/pre-deploy-check.sh prod

# Quick development check
./scripts/pre-deploy-check.sh dev
```

### Health Monitoring

```bash
# Check application health
./scripts/health-check.sh https://fixyourprompts.com

# JSON output for monitoring integration
./scripts/health-check.sh https://fixyourprompts.com --json

# Verbose health check with custom timeout
./scripts/health-check.sh http://localhost:3000 --verbose --timeout=60
```

### Rollback Operations

```bash
# List available backups
./scripts/rollback.sh prod --list

# Interactive rollback
./scripts/rollback.sh prod

# Rollback to specific backup
./scripts/rollback.sh prod --backup-name=backup-20240101-120000

# Dry run rollback
./scripts/rollback.sh staging --dry-run
```

## 🌍 Environment Configuration

### Supported Environments

- **dev**: Development environment (localhost:3000)
- **staging**: Staging environment (staging.fixyourprompts.com)
- **prod**: Production environment (fixyourprompts.com)

### Environment-Specific Behavior

| Feature | Dev | Staging | Prod |
|---------|-----|---------|------|
| Tests Required | No | Yes | Yes |
| E2E Tests | No | Optional | Yes |
| Clean Git Required | No | Yes | Yes |
| Rollback Confirmation | No | No | Yes |
| Security Scans | No | Yes | Yes |
| Performance Thresholds | 5s | 3s | 2s |

## 📋 Command Reference

### Deploy Script Options

```bash
./scripts/deploy.sh [ENVIRONMENT] [OPTIONS]

Options:
  --dry-run      Show what would be done without making changes
  --skip-tests   Skip running tests during deployment  
  --force        Force deployment even if another is in progress
  --rollback     Rollback to the previous deployment
  --verbose      Enable verbose logging
  --help         Show help message
```

### Health Check Options

```bash
./scripts/health-check.sh [URL] [OPTIONS]

Options:
  --timeout=SECONDS   Timeout for checks (default: 300)
  --verbose           Enable verbose output
  --json             Output results in JSON format
  --help             Show help message
```

### Rollback Options

```bash
./scripts/rollback.sh [ENVIRONMENT] [OPTIONS]

Options:
  --list                List available backups
  --backup-name=NAME    Rollback to specific backup
  --force               Skip confirmation prompts
  --dry-run             Preview rollback actions
  --help                Show help message
```

## 🔧 Configuration

### Main Configuration

The `deploy.config.sh` file contains all configuration settings:

```bash
# Environment URLs
DEV_URL="http://localhost:3000"
STAGING_URL="https://staging.fixyourprompts.com"  
PROD_URL="https://fixyourprompts.com"

# Deployment paths
DEV_DEPLOY_PATH="/var/www/fixyourprompts-dev"
STAGING_DEPLOY_PATH="/var/www/fixyourprompts-staging"
PROD_DEPLOY_PATH="/var/www/fixyourprompts-prod"

# Timeouts and thresholds
HEALTH_CHECK_TIMEOUT=300
BUILD_TIMEOUT=600
MAX_RETRY_ATTEMPTS=3
```

### Environment-Specific Overrides

Create `deploy.[env].config.sh` files for environment-specific settings:

```bash
# deploy.prod.config.sh
PROD_URL="https://custom-prod-url.com"
PROD_BACKUP_RETENTION=20
ENABLE_MONITORING_ALERTS=true
```

## 🏗️ Build Process

### Build Steps

1. **Dependency Installation**: `npm ci`
2. **Linting**: `npm run lint`
3. **Type Checking**: `npm run typecheck`
4. **Unit Tests**: `npm run test:coverage`
5. **E2E Tests**: `npm run test:e2e` (staging/prod only)
6. **Build**: `npm run build`
7. **Deployment**: Copy to target directory
8. **Health Check**: Verify deployment success

### Build Environment Variables

The build process sets environment-specific variables:

```bash
NODE_ENV=production
VITE_ENV=prod
VITE_API_URL=https://fixyourprompts.com/api
```

## 🔄 Backup and Rollback

### Backup Strategy

- **Automatic Backups**: Created before each deployment
- **Retention Policy**: 
  - Dev: 3 backups
  - Staging: 5 backups  
  - Production: 10 backups
- **Backup Location**: `.deployments/[environment]/`
- **Metadata**: Each backup includes deployment info

### Rollback Process

1. **Backup Current State**: Before rollback
2. **Replace Deployment**: With backup content
3. **Set Permissions**: Ensure correct file permissions
4. **Health Check**: Verify rollback success
5. **Logging**: Record rollback operation

## 🔍 Health Checks

### Health Check Categories

1. **Basic Connectivity**: HTTP response codes
2. **Page Content**: HTML structure validation
3. **Assets**: Critical asset availability
4. **Performance**: Response time measurements
5. **Security Headers**: Security header presence

### Health Check Thresholds

- **Development**: 5 second timeout
- **Staging**: 3 second timeout
- **Production**: 2 second timeout

## 📊 Monitoring and Logging

### Log Files

- **Location**: `logs/` directory
- **Format**: `[timestamp] [level] message`
- **Files**:
  - `deploy-YYYYMMDD.log`: Deployment logs
  - `rollback-YYYYMMDD.log`: Rollback logs
  - `health-check-YYYYMMDD.log`: Health check logs

### Log Levels

- **ERROR**: Critical failures
- **WARNING**: Non-critical issues
- **INFO**: General information
- **SUCCESS**: Successful operations
- **DEBUG**: Verbose debugging (with --verbose)

### JSON Output

Most scripts support JSON output for integration with monitoring systems:

```bash
./scripts/health-check.sh --json
```

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "url": "https://fixyourprompts.com", 
  "overall_success": true,
  "total_duration": 45,
  "summary": {
    "total_checks": 5,
    "passed_checks": 5,
    "failed_checks": 0
  },
  "results": {
    "basic_connectivity": {
      "success": true,
      "details": "HTTP 200",
      "response_time_ms": 234
    }
  }
}
```

## 🛡️ Security Features

### Security Validations

- **Dependency Scanning**: `npm audit` for known vulnerabilities
- **Sensitive Files**: Prevents deployment of secret files
- **Security Headers**: Validates required security headers
- **Branch Protection**: Enforces correct branch for environment

### Security Headers Checked

- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Strict-Transport-Security`
- `Content-Security-Policy`

## 🚨 Troubleshooting

### Common Issues

#### Deployment Fails with "Lock File Exists"

```bash
# Use force flag to override
./scripts/deploy.sh prod --force
```

#### Health Check Failures

```bash
# Check with verbose output
./scripts/health-check.sh https://fixyourprompts.com --verbose

# Check application logs
tail -f logs/deploy-$(date +%Y%m%d).log
```

#### Rollback Issues

```bash
# List available backups
./scripts/rollback.sh prod --list

# Dry run to preview rollback
./scripts/rollback.sh prod --dry-run
```

### Exit Codes

- **0**: Success
- **1**: General failure
- **2**: Configuration error
- **3**: Validation failure
- **4**: Build failure
- **5**: Deployment failure
- **6**: Health check failure

## 🔧 Customization

### Adding Custom Hooks

Create hook scripts in `scripts/hooks/`:

```bash
# scripts/hooks/pre-deploy.sh
#!/bin/bash
echo "Running custom pre-deployment tasks..."

# scripts/hooks/post-deploy.sh  
#!/bin/bash
echo "Running custom post-deployment tasks..."
```

### Environment-Specific Configuration

```bash
# scripts/deploy.staging.config.sh
STAGING_URL="https://custom-staging.example.com"
STAGING_REQUIRE_E2E_TESTS=true
MONITORING_WEBHOOK_URL="https://hooks.slack.com/..."
```

## 📈 Best Practices

### Development Workflow

1. **Feature Development**: Work on feature branches
2. **Pre-commit Checks**: Run `pre-deploy-check.sh dev`
3. **Local Testing**: Deploy to dev environment first
4. **Staging Validation**: Deploy to staging for integration testing
5. **Production Release**: Deploy to prod with full validation

### Production Deployments

1. **Always use staging first**: Test in staging environment
2. **Review deployment logs**: Check for any warnings
3. **Monitor health checks**: Ensure all checks pass
4. **Keep backups**: Automated backups enable quick recovery
5. **Document changes**: Include deployment notes in commits

### Rollback Procedures

1. **Quick Recovery**: Use interactive rollback for speed
2. **Health Verification**: Always verify after rollback
3. **Root Cause Analysis**: Investigate rollback cause
4. **Communication**: Notify stakeholders of rollbacks

## 🤝 Contributing

### Script Modifications

1. **Test thoroughly**: Test in dev environment first
2. **Follow conventions**: Use consistent logging and error handling
3. **Update documentation**: Keep README.md current
4. **Version updates**: Update version numbers in config files

### Adding New Features

1. **Configuration first**: Add new settings to deploy.config.sh
2. **Error handling**: Include comprehensive error handling
3. **Logging**: Add appropriate log messages
4. **Help text**: Update help messages and documentation

## 📄 License

These deployment scripts are part of the FixYourPrompts project and follow the same license terms.

---

For questions or issues with the deployment scripts, please check the logs in the `logs/` directory or contact the development team.