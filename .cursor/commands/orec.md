---
description: Legacy slash-entry shim for the orec skill. Prefer the skill directly.
---

# OREC Command (Legacy Shim)

Use this only if you still invoke `/orec`. The maintained workflow lives in `skills/orec/SKILL.md`.

## Canonical Surface

- Prefer the `orec` skill directly.
- Keep this file as the slash compatibility entry point.

## Arguments

`$ARGUMENTS`

## Delegation

Apply the `orec` skill.
- Treat the argument as the execution target (usually a plan path).
- Execute tasks in order using ECC quality gates (TDD + verification + review).
- Keep scope constrained to the approved plan.

