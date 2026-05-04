---
# name: automation-orchestrator (internal - not a standalone skill)
description: >
  Orchestrate project automation scripts for setup, validation, and deployment.
  Use this skill when the user wants to run or modify repo automation, such as
  creating the .claude/skills directory, validating skills, deploying them via git,
  or checking tech stack choices with helper scripts.
allowed-tools: Bash
---

# Automation Orchestrator

## Overview

This skill manages and improves project automation scripts in this repository.  
Use it whenever the workflow involves running or editing Bash/Python scripts that automate setup, validation, deployment, or routine maintenance tasks.

The primary scripts it coordinates are:

- `./scripts/claude-skills/setup-claude-skills.sh` – Create `.claude/skills/` directory structure
- `./scripts/claude-skills/validate-claude-skills.sh` – Verify skills are correctly set up
- `./scripts/claude-skills/deploy-claude-skills.sh` – Commit and push `.claude/` to git
- `./scripts/claude-skills/tech-stack-validator.sh` – Validate proposed tech stack choices
- `./scripts/claude-skills/setup_claude_skills.py` – Python variant of the setup script

## When to Use This Skill

Trigger this skill when the user says things like:

- "Set up Claude skills in this repo"
- "Validate the skills setup"
- "Deploy the skills to git"
- "Run the automation scripts"
- "Improve or refactor our setup scripts"
- "Add a new script to this automation suite"

If the user is **manually** creating directories or copying files that scripts already handle, prefer guiding them to use or update the automation instead of duplicating work.

## Core Principles

1. **Use existing scripts first**  
   Prefer calling or improving existing automation (`setup`, `validate`, `deploy`) before writing new one‑off commands.

2. **Idempotent operations**  
   Scripts should be safe to re‑run without breaking the repo. Avoid instructions that leave the system in a half‑configured state.

3. **Minimal assumptions**  
   Assume a standard POSIX shell environment and git are available, but do not assume any other tools unless clearly documented.

4. **Explicit side effects**  
   When suggesting changes, always state what files or git state will be modified.

## Standard Workflows

### 1. Initial Skills Setup

When the user wants to initialize skills for the project:

1. Confirm they are in the repo root.
2. Instruct them to run:

   ```bash
   chmod +x scripts/claude-skills/setup-claude-skills.sh
   ./scripts/claude-skills/setup-claude-skills.sh
   ```

3. Remind them that `SKILL.md` files are already in place in each skill folder:
   - `.claude/skills/tech-stack-selector/SKILL.md`
   - `.claude/skills/architecture-decisions/SKILL.md`
   - `.claude/skills/code-standards-enforcer/SKILL.md`
   - `.claude/skills/ci-cd-pipeline-builder/SKILL.md`
   - `.claude/skills/agile-executor/SKILL.md`
   - `.claude/skills/project-risk-identifier/SKILL.md`
   - `.claude/skills/automation-orchestrator/SKILL.md`
4. After setup, run validation (see next workflow).

### 2. Validate Skills Setup

When the user wants to check that everything is wired correctly:

1. Ensure the repository has a `.claude/skills/` directory.
2. Instruct:

   ```bash
   chmod +x scripts/claude-skills/validate-claude-skills.sh
   ./scripts/claude-skills/validate-claude-skills.sh
   ```

3. Interpret the output:
   - If any skill is "Missing: SKILL.md" or missing `references/` or `scripts/`, tell the user exactly which directories/files to create or copy.
   - If all checks pass, confirm that skills are ready to be detected by Claude.

### 3. Deploy Skills to Git

When the user wants to commit and push `.claude/`:

1. Confirm they are okay committing `.claude/` to the current repo.
2. Instruct:

   ```bash
   chmod +x scripts/claude-skills/deploy-claude-skills.sh
   ./scripts/claude-skills/deploy-claude-skills.sh
   ```

3. If the script reports "No remote configured", explain how to add one:

   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

4. Confirm that team members can now `git pull` and immediately use the skills.

### 4. Validate a Proposed Tech Stack

When the user proposes a stack and wants a quick sanity check:

1. Ask for four items: LANGUAGE, FRAMEWORK, DATABASE, HOSTING.
2. Map them into the validator script call, for example:

   ```bash
   chmod +x scripts/claude-skills/tech-stack-validator.sh
   ./scripts/claude-skills/tech-stack-validator.sh "TypeScript" "Next.js" "PostgreSQL" "Vercel"
   ```

3. Use the script's output as a starting point, then add higher‑level architectural guidance if needed (e.g., scaling, team skill fit).

### 5. Add a New Automation Script

When the user wants a new script, like `create-new-skill.sh`:

1. Propose a filename and high‑level behavior.
2. Generate a minimal, readable script that:
   - Accepts arguments (e.g., skill name)
   - Creates needed directories under `.claude/skills/`
   - Writes a starter `SKILL.md` template
3. Remind the user to:

   ```bash
   chmod +x <script-name>.sh
   ```

4. Suggest adding a short usage example in the repo README.

## Editing and Improving Scripts

When asked to change a script:

1. **Read the existing script logic first** rather than replacing it blindly.
2. Preserve:
   - Error handling (`set -e`), if present
   - Helpful log messages
   - Exit codes
3. Suggest incremental improvements:
   - Input validation (check required args)
   - Safer operations (e.g., `mkdir -p` instead of `mkdir`)
   - Clearer messages for success/failure

If a change might be breaking, explicitly warn the user and propose backing up the original script.

## Examples

### Example 1: First‑Time Setup

**User:** "Set up the Claude skills folder structure for this repo."  
**You (using this skill):**

1. Confirm they are in the project root.
2. Suggest:

   ```bash
   chmod +x scripts/claude-skills/setup-claude-skills.sh
   ./scripts/claude-skills/setup-claude-skills.sh
   ```

3. Confirm that `SKILL.md` files are already in place.
4. Then run:

   ```bash
   ./scripts/claude-skills/validate-claude-skills.sh
   ```

### Example 2: Deploy Skills

**User:** "Push these skills so my team can use them."  

1. Ask if `.claude/` should be part of the main repo.
2. If yes, instruct:

   ```bash
   chmod +x scripts/claude-skills/deploy-claude-skills.sh
   ./scripts/claude-skills/deploy-claude-skills.sh
   ```

3. If there is no git remote, show how to add one and push.

### Example 3: Check a Stack

**User:** "Validate `TypeScript + Next.js + PostgreSQL + Vercel` as a stack."  

1. Map to script call:

   ```bash
   ./scripts/claude-skills/tech-stack-validator.sh "TypeScript" "Next.js" "PostgreSQL" "Vercel"
   ```

2. Summarize the output and add architectural advice on top (e.g., where this stack works best, scaling concerns).

## Troubleshooting

- **Problem:** `./scripts/claude-skills/setup-claude-skills.sh: Permission denied`  
  **Action:** Instruct:

  ```bash
  chmod +x scripts/claude-skills/setup-claude-skills.sh
  ./scripts/claude-skills/setup-claude-skills.sh
  ```

- **Problem:** Validation script reports missing `SKILL.md`  
  **Action:** Tell the user which specific path is missing, and that they should copy the corresponding `SKILL.md` there.

- **Problem:** Git commit in deployment script fails  
  **Action:** Ask for the exact error message. Check:
  - Repo is initialized (`.git/` exists)
  - User name/email configured (`git config user.name`, `git config user.email`)
  - Remote is set for pushing, if desired.

Use this skill to keep automation **centralized, repeatable, and safe**, rather than scattering ad‑hoc commands across the project.

