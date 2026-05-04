---
name: orec
description: Execute an approved implementation plan using ECC workflow with TDD, focused file changes, verification, and code review. Use when the user asks to run plan tasks, execute docs/superpowers/plans/*.md, or says "/orec".
---

# OREC (ECC Execution)

Use this skill to execute approved plans with repository-native ECC standards.

## Trigger Conditions

Apply when the user:
- asks to execute a plan from `docs/superpowers/plans/`,
- asks to "implement based on the plan",
- explicitly invokes `/orec`.

## Required Preconditions

1. Confirm there is an approved plan file path.
2. Confirm execution is requested (not just planning/review).
3. If plan is ambiguous or missing scope, ask one concise clarification.

## Execution Workflow

Copy this checklist and track progress:

```md
OREC Execution Progress
- [ ] Step 1: Read plan and extract ordered tasks
- [ ] Step 2: Map files and dependencies for current task
- [ ] Step 3: Run TDD cycle (RED -> GREEN -> REFACTOR)
- [ ] Step 4: Verify (lint/tests/build as relevant)
- [ ] Step 5: Run code review pass and fix findings
- [ ] Step 6: Report completed task, evidence, and next task
```

### Step 1: Parse Plan

- Read the plan file.
- Execute tasks in order.
- Do not expand scope beyond plan requirements.

### Step 2: Task-by-Task Delivery

- Work on one task at a time.
- Prefer small, focused edits.
- Keep files cohesive and avoid unrelated refactors.

### Step 3: TDD Enforcement

For each code task:
1. Write/adjust failing test(s) first (RED)
2. Implement minimal code to pass (GREEN)
3. Refactor while preserving behavior (REFACTOR)

If a task is docs-only, skip TDD and run docs verification checks.

### Step 4: Verification

Run the smallest relevant checks first, then broader checks before handoff:
- targeted test file(s),
- project lint/typecheck/build as needed by touched scope.

### Step 5: Quality Gates

- Run code-reviewer after modifications.
- Address critical/high findings before proceeding.
- For auth/input/secrets-sensitive changes, run security-reviewer.

### Step 6: Handoff Format

Report with:
- completed task(s),
- files changed,
- verification commands and outcomes,
- open risks/blockers,
- next task to execute.

## Guardrails

- Never execute destructive git operations.
- Never commit unless user explicitly asks.
- Never push unless user explicitly asks.
- Never fabricate test results.
- Keep implementation aligned to repository rules and existing patterns.

