# GitHub Actions Workflow Templates

Ready-to-use workflow templates for CI/CD pipelines.

## CI Pipeline Template

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
```

## CD Pipeline Template

```yaml
name: CD

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: |
          # Add deployment commands

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        run: |
          # Add deployment commands
```

## Security Pipeline Template

```yaml
name: Security

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=moderate

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: trufflesecurity/trufflehog@main
```

## Quality Gates

- Linting must pass
- All tests must pass
- Code coverage >80%
- Security scan clean
- Build successful

