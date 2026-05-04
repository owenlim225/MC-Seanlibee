---
# name: ci-cd-pipeline-builder (internal - not a standalone skill)
description: Set up automated CI/CD pipelines with GitHub Actions, ensuring quality gates and automated deployments.
---

# CI/CD Pipeline Builder Skill

Auto-activated when user asks to setup CI/CD, create pipeline, or "GitHub Actions workflow".

## Purpose

Helps teams set up automated CI/CD pipelines with GitHub Actions, ensuring quality gates and automated deployments.

## Activation Triggers

- "Setup CI/CD"
- "Create pipeline"
- "GitHub Actions workflow"
- "Automate deployment"

## Output

Provides:
1. GitHub Actions workflow templates
2. CI/CD pipeline structure
3. Quality gates configuration
4. Deployment automation
5. Testing integration

## Connected To

- Section 5: Technical Execution Workflow (PART 4)
- .github/workflows/ directory
- Section 9: Execution Strategy

## Pipeline Structure

When activated, provides workflow templates:

### CI Pipeline (ci.yml)
- Linting
- Type checking
- Unit tests
- Integration tests
- Security scanning
- Build verification

### CD Pipeline (cd.yml)
- Staging deployment
- Production deployment
- Rollback procedures
- Health checks

### Security Pipeline (security.yml)
- Dependency scanning
- Vulnerability assessment
- Secret scanning
- Code security analysis

## Example Workflow

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Usage

Ask: "Setup CI/CD pipeline for [project type]"

The skill will:
1. Generate workflow files
2. Configure quality gates
3. Set up deployment automation
4. Provide testing integration
5. Save to .github/workflows/

