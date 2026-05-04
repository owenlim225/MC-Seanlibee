# BlueprintKit Plugin

Plugin package for Claude Code that automatically includes the complete BlueprintKit framework: all 14 planning sections plus all 9 specialized Claude Skills for comprehensive project planning and execution.

## What is This Plugin?

This plugin packages the Project Planning Starter Pack's Claude Skills into a distributable format for Claude Code. It provides unified access to nine specialized skills covering the complete project lifecycle.

## Installation

### Method 1: Clone Repository

```bash
git clone https://github.com/JustineDevs/blueprintkit
cd blueprintkit
```

The plugin is automatically detected by Claude Code when the `.claude-plugin/` directory is present.

### Method 2: Copy Plugin Directory

Copy the `.claude-plugin/` directory to your project root:

```bash
cp -r blueprintkit/.claude-plugin /path/to/your/project/
```

## Plugin Contents

- `SKILL.md` - Plugin skill definition and bundled skills list
- `plugin.mdc` - MDC configuration file for Claude Code
- `README.md` - This file
- `skills/` - Directory for skill references

## Complete Framework Included

### Planning Sections (14 Files)
All planning templates from `planning/0-Master-Index.md` through `planning/13-Lessons-Learned-Continuous-Improvement.md` are automatically available.

### Bundled Skills (9 Skills)
1. **tech-stack-selector** - Technology decision framework
2. **architecture-decisions** - ADR documentation
3. **code-standards-enforcer** - Code quality checklists
4. **ci-cd-pipeline-builder** - CI/CD automation
5. **agile-executor** - Agile ceremonies and sprint planning
6. **project-risk-identifier** - Risk assessment frameworks
7. **automation-orchestrator** - Script orchestration
8. **webapp-testing** - Playwright testing toolkit
9. **web-artifacts-builder** - React artifact creation

## Usage

### In Claude Code

Once installed, skills auto-activate based on natural language queries:

- "What tech stack should we use?" → Activates tech-stack-selector
- "Create an ADR" → Activates architecture-decisions
- "Code review checklist" → Activates code-standards-enforcer
- And so on for all nine skills

### Individual Skill Access

Each skill can be accessed individually through `.claude/skills/[skill-name]/SKILL.md`. The plugin provides unified access but skills remain independently usable.

## Configuration

Plugin behavior is configured in `plugin.mdc`:
- Activation rules
- File patterns to monitor
- Related documentation references

## Integration

This plugin integrates with:
- Project Planning Starter Pack planning sections
- All 9 specialized Claude Skills
- Complete planning framework (14 sections)

## Examples

### Example 1: Technology Selection

**Query**: "What tech stack should we use for a SaaS product?"

**Response**: Activates tech-stack-selector skill, provides structured recommendations with decision framework.

### Example 2: Complete Project Setup

**Query**: "Help me set up a new project with CI/CD and code quality checks"

**Response**: Activates multiple skills (tech-stack-selector, ci-cd-pipeline-builder, code-standards-enforcer) and provides integrated workflow.

## Contributing

To contribute improvements:

1. Review individual skill definitions in `.claude/skills/`
2. Update plugin documentation as needed
3. Test plugin loading in Claude Code
4. Submit changes via pull request

## Related Documentation

- [Main Project README](../README.md)
- [Claude Skills Documentation](../.claude/README.md)
- [Planning Framework](../.claude/skills/blueprintkit/planning/)
- [Consolidated SKILL.md](../SKILL.md) for skills.sh

## License

MIT License - See [LICENSE](../LICENSE) file for details.

