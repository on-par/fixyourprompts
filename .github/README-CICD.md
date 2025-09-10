# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline implemented for the FixYourPrompts frontend application.

## Overview

The CI/CD pipeline is built using GitHub Actions and provides:

- **Code Quality Gates**: Automated linting, type checking, and formatting validation
- **Comprehensive Testing**: Unit tests, integration tests, and end-to-end tests
- **Security Scanning**: Dependency vulnerability scanning and SAST analysis
- **Build Optimization**: Multi-environment builds with caching and bundle analysis
- **Performance Monitoring**: Lighthouse CI for performance regression detection
- **Multi-Environment Deployment**: Automated staging and production deployments
- **Notifications**: Slack and email notifications for failures
- **Artifact Management**: Automated cleanup and retention policies

## Workflows

### 1. Frontend CI/CD Pipeline (`frontend.yml`)

**Triggers:**
- Push to `main`, `develop`, `release/*`, `hotfix/*` branches
- Pull requests to `main` and `develop`
- Manual workflow dispatch

**Jobs:**

#### Code Quality & Linting
- TypeScript type checking
- ESLint code linting
- Prettier formatting validation
- Results uploaded as artifacts

#### Security Scanning
- npm audit for dependency vulnerabilities
- Trivy security scanning
- SARIF results uploaded to GitHub Security tab
- Audit results stored as artifacts

#### Unit & Integration Tests
- Vitest test execution with coverage
- Coverage reports uploaded to Codecov
- Test results stored as artifacts

#### End-to-End Tests
- Playwright tests across multiple browsers (Chromium, Firefox, WebKit)
- Test matrix for comprehensive browser coverage
- Screenshots and videos on failure
- Test reports stored as artifacts

#### Build & Optimization
- Multi-environment builds (development, staging, production)
- Bundle size analysis
- Vite build optimization
- Source maps generation
- Build artifacts stored for deployment

#### Performance Testing
- Lighthouse CI performance auditing
- Performance budget enforcement
- Core Web Vitals monitoring
- Performance reports stored as artifacts

#### Deployment
- **Staging**: Automatic deployment on `develop` branch
- **Production**: Automatic deployment on `main` branch
- Smoke tests post-deployment
- Manual deployment via workflow dispatch

#### Notifications & Reporting
- Comprehensive job status reporting
- Slack notifications on failure
- Email alerts for production failures
- GitHub Step Summary generation

### 2. Dependabot Auto-merge (`dependabot-auto-merge.yml`)

**Features:**
- Automatic merging of minor and patch updates
- Manual review required for major updates
- Appropriate labeling and comments
- Integration with Dependabot metadata

## Configuration Files

### Dependabot (`dependabot.yml`)
- Weekly dependency updates
- Grouped updates for related packages
- Custom review assignments
- Ignore policies for critical packages

### Lighthouse CI (`lighthouserc.json`)
Located in `frontend/lighthouserc.json`:
- Performance budget enforcement
- Accessibility and SEO auditing
- Core Web Vitals monitoring
- Temporary public storage for reports

### Issue Templates
- CI/CD failure reporting template
- Structured issue creation for pipeline failures

### Pull Request Template
- Pre-deployment checklist
- CI/CD considerations
- Testing requirements

## Local Development

### CI Local Simulation Script
Run the local CI script to test your changes before pushing:

```bash
# Run all checks
./frontend/scripts/ci-local.sh

# Skip time-consuming tests during development
./frontend/scripts/ci-local.sh true
```

The script performs:
- Dependency installation
- Type checking
- Linting
- Formatting validation
- Unit tests with coverage
- Build verification
- Security audit
- E2E tests (optional)

## Environment Setup

### Required Secrets

#### Code Coverage
- `CODECOV_TOKEN`: Token for uploading coverage reports

#### Notifications
- `SLACK_WEBHOOK_URL`: Slack webhook for failure notifications
- `EMAIL_USERNAME`: Email account for notifications
- `EMAIL_PASSWORD`: Email account password/app password
- `NOTIFICATION_EMAIL`: Recipient email for failure notifications

#### Lighthouse CI (Optional)
- `LHCI_GITHUB_APP_TOKEN`: Token for Lighthouse CI GitHub App

### Environment Variables

The pipeline automatically sets environment-specific variables:

#### Development
- `VITE_API_URL=https://dev-api.fixyourprompts.com`
- `VITE_APP_ENV=development`

#### Staging
- `VITE_API_URL=https://staging-api.fixyourprompts.com`
- `VITE_APP_ENV=staging`

#### Production
- `VITE_API_URL=https://api.fixyourprompts.com`
- `VITE_APP_ENV=production`

## Quality Gates

### Code Quality
- ✅ TypeScript compilation without errors
- ✅ ESLint rules compliance
- ✅ Prettier formatting consistency

### Security
- ✅ No moderate or high severity vulnerabilities
- ✅ Trivy security scan passes
- ✅ SARIF results clean

### Testing
- ✅ Unit test coverage > 80%
- ✅ All unit tests pass
- ✅ E2E tests pass on all browsers

### Performance
- ✅ Lighthouse Performance Score > 80%
- ✅ Lighthouse Accessibility Score > 90%
- ✅ First Contentful Paint < 2s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1
- ✅ Total Blocking Time < 300ms

### Build
- ✅ Production build succeeds
- ✅ No build warnings or errors
- ✅ Bundle size within limits

## Deployment Strategy

### Staging Environment
- **URL**: https://staging.fixyourprompts.com
- **Trigger**: Push to `develop` branch
- **Purpose**: Integration testing and client preview

### Production Environment
- **URL**: https://fixyourprompts.com
- **Trigger**: Push to `main` branch
- **Purpose**: Live production deployment

### Manual Deployment
Use workflow dispatch for:
- Hotfix deployments
- Rollback scenarios
- Testing specific commits

## Monitoring and Alerts

### Failure Notifications
- **Slack**: Immediate notifications for failures on `main` and `develop`
- **Email**: Critical notifications for production failures
- **GitHub Issues**: Automatic issue creation for CI/CD failures

### Artifact Retention
- **Build artifacts**: 30 days
- **Test results**: 7 days
- **Security scan results**: 30 days
- **Performance reports**: 7 days

### Performance Monitoring
- Lighthouse CI reports for every build
- Performance regression detection
- Core Web Vitals tracking

## Troubleshooting

### Common Issues

#### Tests Failing Locally But Passing in CI
- Check Node.js version compatibility
- Verify environment variables
- Run with `CI=true` environment variable

#### Build Failures
- Check for TypeScript errors
- Verify all dependencies are installed
- Check for missing environment variables

#### E2E Test Flakiness
- Tests retry 2 times on CI
- Screenshots and videos available for debugging
- Check for race conditions and timing issues

#### Security Scan Failures
- Run `npm audit` locally
- Use `npm audit fix` for automatic fixes
- Check for false positives in scan results

### Getting Help

1. **Check the logs**: GitHub Actions provides detailed logs for each step
2. **Review artifacts**: Download test results and reports for analysis
3. **Use local simulation**: Run the CI local script to reproduce issues
4. **Create an issue**: Use the CI/CD failure issue template

## Best Practices

### Development Workflow
1. Run local CI simulation before committing
2. Keep commits focused and atomic
3. Write meaningful commit messages
4. Include tests for new features
5. Update documentation when needed

### Performance
- Monitor bundle size regularly
- Optimize images and assets
- Use code splitting effectively
- Monitor Core Web Vitals

### Security
- Keep dependencies updated
- Review security scan results
- Follow secure coding practices
- Validate user inputs

### Testing
- Write comprehensive unit tests
- Include integration tests for critical paths
- Maintain E2E tests for user workflows
- Keep tests fast and reliable

## Maintenance

### Regular Tasks
- Review and update dependencies weekly
- Monitor performance reports monthly
- Update CI/CD pipeline as needed
- Clean up old artifacts and reports

### Updates
- Keep GitHub Actions up to date
- Update Node.js version regularly
- Review and update quality gates
- Monitor industry best practices

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
- [Playwright Testing](https://playwright.dev/)
- [Vitest Testing Framework](https://vitest.dev/)