# BlueprintKit Skill

Complete project planning and execution framework for skills.sh.

## Installation

Install BlueprintKit from the JustineDevs collection:

```bash
npx skills add justinedevs/collection/blueprintkit
```

## What's Included

When you install BlueprintKit, **all files are automatically available** in your terminal and AI agent:

### All 14 Planning Sections
- `.claude/skills/blueprintkit/planning/0-Master-Index.md` - Complete navigation guide
- `.claude/skills/blueprintkit/planning/1-Executive-Summary.md` - Vision and problem statement
- `.claude/skills/blueprintkit/planning/2-Objectives-Success-Metrics.md` - Success criteria and KPIs
- `.claude/skills/blueprintkit/planning/3-Scope-Definition.md` - Project boundaries
- `.claude/skills/blueprintkit/planning/4-System-Architecture-Design.md` - Technical blueprint
- `.claude/skills/blueprintkit/planning/5-Technical-Execution-Workflow.md` - Implementation guide
- `.claude/skills/blueprintkit/planning/6-Project-Phases-Timeline.md` - Phases and milestones
- `.claude/skills/blueprintkit/planning/7-Resource-Planning.md` - Team and budget
- `.claude/skills/blueprintkit/planning/8-Risk-Management.md` - Risk identification and mitigation
- `.claude/skills/blueprintkit/planning/9-Execution-Strategy.md` - Daily execution and ceremonies
- `.claude/skills/blueprintkit/planning/10-Monitoring-Reporting.md` - Metrics and reporting
- `.claude/skills/blueprintkit/planning/11-ROI-Value-Realization.md` - Financial projections
- `.claude/skills/blueprintkit/planning/12-Governance-Decision-Making.md` - Decision authority
- `.claude/skills/blueprintkit/planning/13-Lessons-Learned-Continuous-Improvement.md` - Learning capture

### All 9 Claude Skills
- `.claude/skills/blueprintkit/tech-stack-selector/` - Technology decision framework
- `.claude/skills/blueprintkit/architecture-decisions/` - ADR documentation
- `.claude/skills/blueprintkit/code-standards-enforcer/` - Code quality checklists
- `.claude/skills/blueprintkit/ci-cd-pipeline-builder/` - CI/CD automation
- `.claude/skills/blueprintkit/agile-executor/` - Agile ceremonies and sprint planning
- `.claude/skills/blueprintkit/project-risk-identifier/` - Risk assessment frameworks
- `.claude/skills/blueprintkit/automation-orchestrator/` - Script orchestration
- `.claude/skills/blueprintkit/webapp-testing/` - Playwright testing toolkit
- `.claude/skills/blueprintkit/web-artifacts-builder/` - React artifact creation

**No additional setup required** - everything is ready to use immediately after installation.

## Claude Plugin

This skill also includes a `.claude-plugin/` directory for Claude Code plugin distribution. The plugin provides the same functionality as the skills.sh installation but is distributed as a Claude Code plugin.

For plugin installation and usage, see [.claude-plugin/README.md](.claude-plugin/README.md).

## Usage

After installation, skills are auto-activated when you ask relevant questions:

- "What tech stack should we use?" → Activates tech-stack-selector
- "Create an ADR" → Activates architecture-decisions
- "Code review checklist" → Activates code-standards-enforcer
- "Setup CI/CD" → Activates ci-cd-pipeline-builder
- "Plan sprint" → Activates agile-executor
- "Identify risks" → Activates project-risk-identifier
- And more...

## Documentation

For complete documentation, see:
- [Main Skill Definition](.claude/skills/blueprintkit/SKILL.md) - Complete skill documentation
- [Planning Framework](.claude/skills/blueprintkit/planning/) - All 14 planning sections
- [Claude Plugin Documentation](.claude-plugin/README.md) - Plugin installation guide

## Related Repositories

- **Main Repository**: [JustineDevs/StarterPack](https://github.com/JustineDevs/StarterPack) - Complete monorepo with starter pack and frontend

## License

MIT License - See [LICENSE](../LICENSE) file for details.

