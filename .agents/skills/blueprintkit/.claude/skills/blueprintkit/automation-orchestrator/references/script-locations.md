# Automation Script Locations

Quick reference for where automation scripts are located and how to use them.

## Script Locations

All automation scripts are located in `scripts/claude-skills/`:

```
scripts/claude-skills/
├── setup-claude-skills.sh       # Create .claude/skills/ structure
├── setup_claude_skills.py        # Python version of setup
├── validate-claude-skills.sh     # Validate skills setup
├── deploy-claude-skills.sh       # Deploy skills to git
└── tech-stack-validator.sh       # Validate tech stack choices
```

## Usage

### From Project Root

```bash
# Setup
./scripts/claude-skills/setup-claude-skills.sh

# Validate
./scripts/claude-skills/validate-claude-skills.sh

# Deploy
./scripts/claude-skills/deploy-claude-skills.sh

# Validate Stack
./scripts/claude-skills/tech-stack-validator.sh TypeScript Next.js PostgreSQL Vercel
```

### Make Scripts Executable

```bash
chmod +x scripts/claude-skills/*.sh
```

## Script Purposes

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup-claude-skills.sh` | Create directory structure | First-time setup |
| `validate-claude-skills.sh` | Verify skills are configured | After setup or changes |
| `deploy-claude-skills.sh` | Commit skills to git | When ready to share with team |
| `tech-stack-validator.sh` | Validate tech choices | During planning phase |

## Related Documentation

- [Automation Orchestrator Skill](../SKILL.md) - Main skill documentation
- [Scripts README](../../../../scripts/claude-skills/README.md) - Detailed script docs

