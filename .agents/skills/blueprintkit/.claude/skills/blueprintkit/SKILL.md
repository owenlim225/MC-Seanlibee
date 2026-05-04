---
name: blueprintkit
description: Complete project planning and execution framework. Automatically includes all 14 planning sections (planning/0-Master-Index.md through planning/13-Lessons-Learned-Continuous-Improvement.md) plus all 9 Claude Skills (tech-stack-selector, architecture-decisions, code-standards-enforcer, ci-cd-pipeline-builder, agile-executor, project-risk-identifier, automation-orchestrator, webapp-testing, web-artifacts-builder). All files are located within this skill directory. When installed, all planning templates and execution skills are immediately available.
license: MIT
---

# BlueprintKit

Complete end-to-end project planning and execution framework. When installed, this skill automatically makes available all 14 planning sections and all 9 specialized execution skills, providing everything needed to plan, execute, and deliver technical projects.

Complete end-to-end project planning and execution framework. This skill provides comprehensive guidance across 14 planning sections plus 9 specialized execution capabilities, covering everything from initial vision through deployment and continuous improvement.

## Purpose

Provides a complete system for planning, executing, and delivering technical projects. Combines structured planning templates, technical execution guides, AI-powered assistance, and production-ready configurations into a unified framework.

## Complete Planning Framework

This skill includes 14 comprehensive planning sections that guide you through the entire project lifecycle:

### Section 0: Master Index
**Purpose:** Complete navigation guide and overview of all planning sections

**Key Content:**
- Document map of all 12 critical planning areas
- How to use the starter pack
- Section connections and dependencies
- Completion timeline guidance
- Output templates for each section

**Location:** `planning/0-Master-Index.md`

### Section 1: Executive Summary
**Purpose:** Vision, problem statement, expected outcomes, stakeholder view

**Key Sections:**
- Project vision statement (one sentence)
- Problem statement (3 pain points + market opportunity)
- Solution overview (what makes this different?)
- Expected outcomes (30-60-90 day targets)
- Alignment to corporate strategy
- Risk summary

**Output:** 2-3 page document for executives, investors, sponsors

**Connections:** Feeds into Sections 2, 10, 11

**Location:** `planning/1-Executive-Summary.md`

### Section 2: Objectives & Success Metrics
**Purpose:** Quantified success criteria, 30-60-90 day KPI tracking, accountability

**Key Sections:**
- 3 primary business objectives with measurable criteria
- 30-day MVP launch metrics
- 60-day early traction metrics
- 90-day product-market fit metrics
- Product KPIs (DAU, MAU, adoption rate, NPS)
- Engineering KPIs (code coverage, MTTR, uptime)
- Business KPIs (CAC, LTV, revenue, churn)
- Community KPIs (GitHub stars, npm downloads, Discord)
- Metric ownership matrix
- Success definition per phase

**Output:** Dashboard + weekly scorecard template

**Connections:** Feeds into Sections 1, 9, 10, 11

**Location:** `planning/2-Objectives-Success-Metrics.md`

### Section 3: Scope Definition
**Purpose:** What's in/out, constraints, assumptions, change control process

**Key Sections:**
- Phase 1-4 deliverables (detailed checklists)
- Out-of-scope features (explicitly deferred)
- Assumptions (technical, market, organizational)
- Constraints (budget, timeline, technical, regulatory)
- Change control process (Tier 1/2/3 features)
- Specification document cross-reference

**Output:** Scope matrix + change control templates

**Connections:** Feeds into Sections 1, 5, 7

**Location:** `planning/3-Scope-Definition.md`

### Section 4: System Architecture & Technical Design
**Purpose:** Technical blueprint, component specifications, architecture decisions

**Key Sections:**
- Architecture vision statement
- High-level system diagram (ASCII or image)
- Component specifications (5-10 components)
- Architecture Decision Records (ADRs) - why each tech choice
- Non-functional requirements (performance, security, reliability, scalability)
- Technology stack summary
- Quality attributes

**Output:** Architecture document + ADR log + tech stack matrix

**Connections:** Feeds into Sections 5, 6, 7, 8, 12

**Location:** `planning/4-System-Architecture-Design.md`

### Section 5: Technical Execution Workflow
**Purpose:** Complete technical implementation guide with step-by-step workflows

**Key Sections:**
- Development environment setup
- Code structure and organization
- Testing strategy (unit, integration, E2E)
- Deployment pipelines
- Quality gates and checkpoints
- Technical debt management
- Performance optimization
- Security practices

**Output:** Technical execution playbook

**Connections:** Feeds into Sections 6, 7, 9, 10

**Location:** `planning/5-Technical-Execution-Workflow.md`

### Section 6: Project Phases & Timeline
**Purpose:** Phases, milestones, and timeline with dependencies

**Key Sections:**
- Phase breakdown (Discovery, MVP, Growth, Scale)
- Milestone definitions and acceptance criteria
- Timeline with dependencies
- Critical path analysis
- Buffer time allocation
- Phase gates and checkpoints

**Output:** Project timeline + milestone tracker

**Connections:** Feeds into Sections 1, 7, 9, 10

**Location:** `planning/6-Project-Phases-Timeline.md`

### Section 7: Resource Planning
**Purpose:** Team structure, skills, budget allocation

**Key Sections:**
- Team structure and roles
- Skills matrix and gaps
- Budget allocation by phase
- Resource constraints
- Hiring plan
- Vendor and contractor management

**Output:** Resource plan + budget tracker

**Connections:** Feeds into Sections 1, 3, 6, 9

**Location:** `planning/7-Resource-Planning.md`

### Section 8: Risk Management
**Purpose:** Risk identification, mitigation, contingency planning

**Key Sections:**
- Risk identification (technical, organizational, market)
- Risk assessment matrix (probability × impact)
- Mitigation strategies
- Contingency plans
- Risk ownership and monitoring
- Risk register

**Output:** Risk register + mitigation tracker

**Connections:** Feeds into Sections 1, 5, 6, 12

**Location:** `planning/8-Risk-Management.md`

### Section 9: Execution Strategy
**Purpose:** Daily execution, ceremonies, quality assurance

**Key Sections:**
- Daily standup structure
- Sprint planning process
- Retrospective formats
- Quality assurance checkpoints
- Definition of done
- Escalation procedures

**Output:** Execution playbook + ceremony templates

**Connections:** Feeds into Sections 2, 5, 6, 10

**Location:** `planning/9-Execution-Strategy.md`

### Section 10: Monitoring & Reporting
**Purpose:** Metrics tracking and status reporting

**Key Sections:**
- Dashboard design (engineering, product, business)
- Reporting cadence (daily, weekly, monthly)
- Status report templates
- Alert thresholds
- Trend analysis
- Stakeholder communication

**Output:** Monitoring dashboards + report templates

**Connections:** Feeds into Sections 1, 2, 11, 12

**Location:** `planning/10-Monitoring-Reporting.md`

### Section 11: ROI & Value Realization
**Purpose:** Financial projections and value tracking

**Key Sections:**
- Financial projections (revenue, costs, margins)
- Value realization metrics
- Break-even analysis
- ROI calculations
- Cost-benefit analysis
- Value tracking over time

**Output:** Financial model + value tracker

**Connections:** Feeds into Sections 1, 2, 10

**Location:** `planning/11-ROI-Value-Realization.md`

### Section 12: Governance & Decision-Making
**Purpose:** Decision authority and escalation procedures

**Key Sections:**
- Decision-making framework
- Authority matrix (who decides what)
- Escalation procedures
- Approval workflows
- Change management process
- Stakeholder engagement

**Output:** Governance framework + decision log

**Connections:** Feeds into Sections 1, 3, 4, 8

**Location:** `planning/12-Governance-Decision-Making.md`

### Section 13: Lessons Learned & Continuous Improvement
**Purpose:** Learning capture and process improvement

**Key Sections:**
- Retrospective templates
- Learning capture process
- Process improvement backlog
- Knowledge sharing mechanisms
- Best practices documentation
- Continuous improvement cycle

**Output:** Lessons learned log + improvement tracker

**Connections:** Feeds into all previous sections

**Location:** `planning/13-Lessons-Learned-Continuous-Improvement.md`

## Specialized Execution Capabilities

In addition to the planning framework, this skill includes 9 specialized capabilities for technical execution:

### 1. Technology Selection

Helps teams make informed technology decisions using structured frameworks, decision matrices, and constraint-based recommendations.

**When to use**: "What tech stack should we use?", "Help me choose technologies", "What database should we use?"

**Process**:
1. Define constraints (team size, expertise, timeline, budget, scale, compliance)
2. Select architecture pattern (monolithic vs microservices, serverless vs traditional, event-driven vs request-response)
3. Layer-by-layer selection (language/runtime, framework, database, hosting, authentication, monitoring)

**Output**: Technology recommendation matrix with trade-off analysis and implementation guidance.

**References**: Planning Section 4 (System Architecture & Design), Planning Section 5 Part 1 (Technical Execution Workflow), `docs/reference/TECHNICAL-SUMMARY.md` (in parent project)

### 2. Architecture Documentation

Documents architecture decisions using Architecture Decision Records (ADRs) with context, alternatives, and consequences.

**When to use**: "Create an ADR", "Document this decision", "Architecture decision record"

**Process**:
1. Generate ADR number
2. Capture context and problem statement
3. Document decision and rationale
4. Analyze alternatives considered
5. Document consequences (positive and negative)
6. Save to `docs/adr/` directory (in parent project)

**ADR Template Structure**:
- Status (Proposed/Accepted/Deprecated/Superseded)
- Date and stakeholders (Deciders, Consulted, Informed)
- Context section
- Decision section
- Consequences (positive and negative)
- Alternatives considered with pros/cons

**References**: Planning Section 4 (System Architecture & Design), Planning Section 13 (Lessons Learned), `docs/adr/` directory (in parent project)

### 3. Code Quality Enforcement

Ensures code quality through comprehensive checklists, standards enforcement, and review guidance.

**When to use**: "Code review", "Quality standards", "Code review checklist", "What should I check in code review?"

**Review Checklist Categories**:

**Functionality**:
- Code works as intended
- Edge cases handled
- Error handling appropriate
- Input validation present

**Code Quality**:
- Follows coding standards
- No code duplication
- Functions are focused (single responsibility)
- Variable names are clear
- Comments explain "why" not "what"

**Testing**:
- Unit tests included
- Tests cover edge cases
- Test coverage maintained
- Integration tests updated

**Security**:
- No hardcoded secrets
- Input sanitized
- SQL injection prevented
- XSS vulnerabilities addressed
- Authentication/authorization correct

**Performance**:
- No N+1 queries
- Database indexes used
- Caching implemented where appropriate
- No memory leaks

**Documentation**:
- README updated if needed
- API docs updated
- Code comments added for complex logic

**References**: Planning Section 9 (Execution Strategy), Planning Section 5 Part 3 (Technical Execution Workflow), Coding standards documentation

### 4. CI/CD Automation

Sets up automated CI/CD pipelines with GitHub Actions, ensuring quality gates and automated deployments.

**When to use**: "Setup CI/CD", "Create pipeline", "GitHub Actions workflow", "Automate deployment"

**Pipeline Components**:

**CI Pipeline (ci.yml)**:
- Linting
- Type checking
- Unit tests
- Integration tests
- Security scanning
- Build verification

**CD Pipeline (cd.yml)**:
- Staging deployment
- Production deployment
- Rollback procedures
- Health checks

**Security Pipeline (security.yml)**:
- Dependency scanning
- Vulnerability assessment
- Secret scanning
- Code security analysis

**Example Workflow**:
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

**References**: Planning Section 5 Part 4 (Technical Execution Workflow), .github/workflows/ directory, Planning Section 9 (Execution Strategy)

### 5. Agile Execution

Executes Agile methodologies effectively through sprint planning, retrospectives, and ceremony facilitation.

**When to use**: "Plan sprint", "Sprint planning", "Retrospective", "Standup agenda", "Agile ceremonies"

**Sprint Planning Structure**:
- Sprint goal definition
- User stories with points and assignees
- Capacity planning (team velocity, available capacity, planned points)
- Dependency identification

**Retrospective Formats**:

**Start/Stop/Continue**:
- Start: What should we start doing?
- Stop: What should we stop doing?
- Continue: What should we continue?

**4Ls (Liked, Learned, Lacked, Longed For)**:
- Liked: What did we like?
- Learned: What did we learn?
- Lacked: What did we lack?
- Longed For: What did we long for?

**References**: Planning Section 9 (Execution Strategy), Planning Section 5 Part 6 (Technical Execution Workflow), Planning Section 13 (Lessons Learned)

### 6. Risk Management

Identifies, assesses, and mitigates project risks through structured risk analysis frameworks.

**When to use**: "Identify risks", "Risk assessment", "What are the risks?", "Risk mitigation", "Project risks"

**Risk Categories**:

**Technical Risks**:
- Third-party dependencies
- Performance bottlenecks
- Security vulnerabilities
- Integration failures
- Technology limitations

**Organizational Risks**:
- Team member departure
- Scope creep
- Budget overrun
- Timeline delays
- Communication breakdown

**Market Risks**:
- Regulatory changes
- Competitive pressure
- Economic downturn
- Vendor failures

**Risk Assessment Matrix**:
Assess each risk by:
1. Probability: Low/Medium/High
2. Impact: Low/Medium/High
3. Mitigation: Specific actions
4. Contingency: Backup plan
5. Owner: Responsible person

**References**: Planning Section 8 (Risk Management), Planning Section 5 Part 5 (Technical Execution Workflow), Planning Section 12 (Governance)

### 7. Automation Orchestration

Orchestrates project automation scripts for setup, validation, and deployment.

**When to use**: "Set up Claude skills in this repo", "Validate the skills setup", "Deploy the skills to git", "Run the automation scripts", "Improve or refactor our setup scripts"

**Core Principles**:
1. Use existing scripts first before writing new ones
2. Idempotent operations (safe to re-run)
3. Minimal assumptions (standard POSIX shell and git)
4. Explicit side effects (state what files/git state will be modified)

**Primary Scripts** (in parent project):
- `scripts/claude-skills/setup-claude-skills.sh` - Create skill directory structure
- `scripts/claude-skills/validate-claude-skills.sh` - Verify skills are correctly set up
- `scripts/claude-skills/deploy-claude-skills.sh` - Commit and push `.claude/` to git
- `scripts/claude-skills/tech-stack-validator.sh` - Validate proposed tech stack choices

**Workflows**:
1. Initial Skills Setup
2. Validate Skills Setup
3. Deploy Skills to Git
4. Validate Proposed Tech Stack
5. Add New Automation Script

### 8. Web Application Testing

Toolkit for interacting with and testing local web applications using Playwright.

**When to use**: Testing frontend functionality, debugging UI behavior, capturing browser screenshots, viewing browser logs

**Approach Decision Tree**:
- Static HTML: Read HTML file directly to identify selectors, then write Playwright script
- Dynamic webapp: Use `scripts/with_server.py` for server lifecycle management

**Helper Scripts** (in parent project):
- `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)

**Reconnaissance-Then-Action Pattern**:
1. Navigate and wait for networkidle
2. Take screenshot or inspect DOM
3. Identify selectors from rendered state
4. Execute actions with discovered selectors

**Best Practices**:
- Use bundled scripts as black boxes
- Use `sync_playwright()` for synchronous scripts
- Always close browser when done
- Use descriptive selectors (text=, role=, CSS selectors, IDs)
- Add appropriate waits

**Example**:
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    # ... automation logic
    browser.close()
```

### 9. Web Artifact Building

Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies.

**When to use**: Complex artifacts requiring state management, routing, or shadcn/ui components (not for simple single-file HTML/JSX artifacts)

**Stack**: React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui

**Process**:
1. Initialize project: `bash scripts/init-artifact.sh <project-name>` (in parent project)
2. Develop artifact by editing generated code
3. Bundle to single HTML: `bash scripts/bundle-artifact.sh` (in parent project)
4. Display artifact to user
5. (Optional) Test the artifact

**Design Guidelines**: Avoid excessive centered layouts, purple gradients, uniform rounded corners, and Inter font to prevent "AI slop".

**Scripts** (in parent project):
- `scripts/init-artifact.sh` - Initialize React project with full configuration
- `scripts/bundle-artifact.sh` - Bundle React app into single HTML file

## How to Use This Skill

### Getting Started

1. **Start with Master Index**: Read `planning/0-Master-Index.md` for complete overview
2. **Follow Sequential Order**: Complete sections 1-13 in order
3. **Reference Connections**: Each section shows which other sections it connects to
4. **Use as Governance**: Share sections with stakeholders, gate decisions at checkpoints
5. **Track Progress**: Update documents weekly as project evolves

### Planning Workflow

**Week 1: Foundation**
- Section 1: Executive Summary
- Section 2: Objectives & Success Metrics
- Section 3: Scope Definition

**Week 2: Design**
- Section 4: System Architecture & Design
- Begin Section 5: Technical Execution Workflow

**Week 3: Planning**
- Complete Section 5: Technical Execution Workflow
- Section 6: Project Phases & Timeline
- Section 7: Resource Planning
- Section 8: Risk Management

**Week 4: Execution Setup**
- Section 9: Execution Strategy
- Section 10: Monitoring & Reporting
- Section 11: ROI & Value Realization
- Section 12: Governance & Decision-Making

**Ongoing:**
- Section 13: Lessons Learned & Continuous Improvement

### Activation Triggers

This skill activates when users ask about:

- Project planning and execution
- Technology selection and stack decisions
- Architecture documentation and ADRs
- Code quality and review processes
- CI/CD pipeline setup and automation
- Agile sprint planning and ceremonies
- Project risk identification and mitigation
- Automation script orchestration
- Web application testing
- Web artifact building
- Any of the 14 planning sections

## Usage Examples

### Example 1: Complete Project Planning

**User**: "Help me plan a new SaaS product from scratch"

**Response**: 
1. Guides through Section 1 (Executive Summary) - vision and problem
2. Moves to Section 2 (Objectives & Metrics) - success criteria
3. Continues through all 14 sections systematically
4. Provides templates and examples for each section
5. Links sections together showing connections

### Example 2: Technology Selection

**User**: "What tech stack should we use for a SaaS product with 5 developers, TypeScript expertise, 3-month MVP timeline, and 10K initial users?"

**Response**: 
1. Activates technology selection capability
2. Analyzes constraints (team size, expertise, timeline, scale)
3. Recommends architecture pattern
4. Provides layer-by-layer recommendations
5. Links to Section 4 (Architecture Design) for documentation
6. References Section 5 (Technical Execution) for implementation

### Example 3: Risk Assessment

**User**: "What are the risks for this project?"

**Response**:
1. Activates risk management capability
2. Identifies risks across technical, organizational, and market categories
3. Assesses probability and impact
4. Suggests mitigation strategies
5. Creates risk register entries
6. Updates Section 8 (Risk Management) with findings

## Project Structure

This skill references the following project structure:

- `planning/` - 14 comprehensive planning sections (0-13)
- `tech-stack-selector/`, `architecture-decisions/`, etc. - Individual skill definitions
- `docs/reference/` - Technical references and summaries (in parent project)
- `scripts/` - Automation and utility scripts (in parent project)
- `.github/workflows/` - CI/CD pipeline configurations (in parent project)
- `docs/adr/` - Architecture Decision Records (in parent project)

## Related Documentation

- [Master Index](./planning/0-Master-Index.md) - Complete navigation guide
- [Planning README](./planning/README.md) - Planning sections overview

## Installation

Install BlueprintKit using the skills.sh CLI:

```bash
npx skills add JustineDevs/blueprintkit
```

### What Gets Installed Automatically

When you install BlueprintKit, **all files are automatically available** in your terminal and AI agent:

#### All 14 Planning Sections (Automatically Available)
- `planning/0-Master-Index.md` - Complete navigation guide
- `planning/1-Executive-Summary.md` - Vision and problem statement
- `planning/2-Objectives-Success-Metrics.md` - Success criteria and KPIs
- `planning/3-Scope-Definition.md` - Project boundaries
- `planning/4-System-Architecture-Design.md` - Technical blueprint
- `planning/5-Technical-Execution-Workflow.md` - Implementation guide
- `planning/6-Project-Phases-Timeline.md` - Phases and milestones
- `planning/7-Resource-Planning.md` - Team and budget
- `planning/8-Risk-Management.md` - Risk identification and mitigation
- `planning/9-Execution-Strategy.md` - Daily execution and ceremonies
- `planning/10-Monitoring-Reporting.md` - Metrics and reporting
- `planning/11-ROI-Value-Realization.md` - Financial projections
- `planning/12-Governance-Decision-Making.md` - Decision authority
- `planning/13-Lessons-Learned-Continuous-Improvement.md` - Learning capture

#### All 9 Claude Skills (Automatically Activated)
- `tech-stack-selector/` - Technology decision framework
- `architecture-decisions/` - ADR documentation
- `code-standards-enforcer/` - Code quality checklists
- `ci-cd-pipeline-builder/` - CI/CD automation
- `agile-executor/` - Agile ceremonies and sprint planning
- `project-risk-identifier/` - Risk assessment frameworks
- `automation-orchestrator/` - Script orchestration
- `webapp-testing/` - Playwright testing toolkit
- `web-artifacts-builder/` - React artifact creation

**No additional setup required** - everything is ready to use immediately after installation.

## License

MIT License - See [LICENSE](./LICENSE) file for details.
