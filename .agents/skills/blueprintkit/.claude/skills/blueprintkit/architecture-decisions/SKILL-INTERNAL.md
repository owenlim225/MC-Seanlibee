---
# name: architecture-decisions (internal - not a standalone skill)
description: Document architecture decisions using Architecture Decision Records (ADRs) with context, alternatives, and consequences.
---

# Architecture Decisions Skill

Auto-activated when user asks to create ADRs, document decisions, or "create an ADR".

## Purpose

Helps teams document architecture decisions using Architecture Decision Records (ADRs), ensuring decisions are captured with context, alternatives, and consequences.

## Activation Triggers

- "Create an ADR"
- "Document this decision"
- "Architecture decision record"
- "Document technical decision"

## Output

Provides:
1. ADR template
2. Decision structure
3. Context capture
4. Alternatives analysis
5. Consequences documentation

## Connected To

- Section 4: System Architecture & Design
- Section 13: Lessons Learned & Continuous Improvement
- docs/adr/ directory

## ADR Template

When activated, provides structured ADR template:

```markdown
# ADR [Number]: [Decision Title]

Status: [Proposed / Accepted / Deprecated / Superseded]
Date: [Date]
Deciders: [Names]
Consulted: [Names]
Informed: [Names]

## Context
[What is the issue we're seeing?]

## Decision
[What is the change we're proposing?]

## Consequences
Positive:
- [Benefit 1]
- [Benefit 2]

Negative:
- [Trade-off 1]
- [Trade-off 2]

## Alternatives Considered
1. [Alternative 1]
   - Pros: [List]
   - Cons: [List]
   - Why not chosen: [Reason]
```

## Usage

Ask: "Create an ADR for [decision description]"

The skill will:
1. Generate ADR number
2. Guide through context capture
3. Help document decision
4. Analyze alternatives
5. Save to docs/adr/ directory

