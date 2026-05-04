---
# name: planning-framework (internal - not a standalone skill)
description: Complete project planning framework with 14 interconnected planning sections covering executive summary, objectives, scope, architecture, execution, phases, resources, risks, strategy, monitoring, ROI, governance, and continuous improvement.
---

# Planning Framework Skill

Auto-activated when user asks about project planning, creating project plans, or "plan the project".

## Purpose

Provides a comprehensive, end-to-end project planning framework with 14 interconnected planning sections. Each section is a standalone template with placeholders, but all sections reference and connect to each other for complete project coverage.

## Activation Triggers

- "Create project plan"
- "Plan the project"
- "Project planning"
- "Executive summary"
- "Define scope"
- "Architecture design"
- "Risk management"
- "Resource planning"
- "Project phases"

## Output

Provides:
1. 14 complete planning section templates
2. Master index with navigation
3. Cross-referenced sections
4. Placeholder-based structure
5. Best practices and examples

## Planning Sections

### 0. Master Index
Complete navigation guide for all 14 sections with connections and dependencies.

### 1. Executive Summary
Vision, problem statement, expected outcomes, stakeholder view (5-minute read).

### 2. Objectives & Success Metrics
Quantified success criteria, 30-60-90 day KPI tracking, accountability scorecard.

### 3. Scope Definition
What's in/out, constraints, assumptions, boundaries.

### 4. System Architecture Design
Technical blueprint, architecture decisions, component design.

### 5. Technical Execution Workflow
Complete technical implementation guide with step-by-step workflows.

### 6. Project Phases & Timeline
Phases, milestones, dependencies, timeline.

### 7. Resource Planning
Team structure, skills required, budget allocation, capacity planning.

### 8. Risk Management
Risk identification, assessment, mitigation strategies, contingency planning.

### 9. Execution Strategy
Daily execution, ceremonies, quality assurance, delivery process.

### 10. Monitoring & Reporting
Metrics tracking, status reporting, dashboard setup.

### 11. ROI & Value Realization
Financial projections, value tracking, business case validation.

### 12. Governance & Decision Making
Decision authority, escalation procedures, approval workflows.

### 13. Lessons Learned & Continuous Improvement
Learning capture, process improvement, retrospective templates.

## Connected To

- All 9 Claude Skills (tech-stack-selector, architecture-decisions, etc.)
- Project documentation
- ADR (Architecture Decision Records)
- Sprint planning and execution

## Usage

Ask: "Create a project plan" or "Help me plan this project"

The skill will:
1. Guide through each planning section
2. Help fill placeholders with project-specific information
3. Connect sections to each other
4. Provide templates and examples
5. Update documentation as project evolves

## File Structure

```
planning/
├── SKILL-INTERNAL.md (this file)
├── 0-Master-Index.md
├── 1-Executive-Summary.md
├── 2-Objectives-Success-Metrics.md
├── 3-Scope-Definition.md
├── 4-System-Architecture-Design.md
├── 5-Technical-Execution-Workflow.md
├── 6-Project-Phases-Timeline.md
├── 7-Resource-Planning.md
├── 8-Risk-Management.md
├── 9-Execution-Strategy.md
├── 10-Monitoring-Reporting.md
├── 11-ROI-Value-Realization.md
├── 12-Governance-Decision-Making.md
├── 13-Lessons-Learned-Continuous-Improvement.md
├── README.md
├── references/ (planning templates and examples)
└── scripts/ (planning automation scripts)
```

## References

See `references/` directory for:
- Planning templates
- Example filled sections
- Best practices
- Framework guides

## Scripts

See `scripts/` directory for:
- Planning automation
- Template generators
- Validation scripts
- Export utilities

