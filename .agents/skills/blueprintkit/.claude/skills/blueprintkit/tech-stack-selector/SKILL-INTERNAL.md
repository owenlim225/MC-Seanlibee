---
# name: tech-stack-selector (internal - not a standalone skill)
description: Make informed technology decisions with structured frameworks, decision matrices, and recommendations based on constraints.
---

# Tech Stack Selector Skill

Auto-activated when user asks about technology choices, stack selection, or "what tech should we use?"

## Purpose

Helps teams make informed technology decisions by providing structured frameworks, decision matrices, and recommendations based on project constraints.

## Activation Triggers

- "What tech stack should we use?"
- "Help me choose technologies"
- "What database should we use?"
- "Which framework is best?"
- "Technology selection"

## Output

Provides:
1. Technology decision framework
2. Constraint analysis
3. Recommendation matrix
4. Trade-off analysis
5. Implementation guidance

## Connected To

- Section 4: System Architecture & Design
- Section 5: Technical Execution Workflow (PART 1)
- TECHNICAL-SUMMARY.md

## Decision Framework

### Step 1: Define Constraints
- Team size and expertise
- Timeline and budget
- Scale requirements
- Compliance needs

### Step 2: Architecture Pattern
- Monolithic vs Microservices
- Serverless vs Traditional
- Event-driven vs Request-response

### Step 3: Layer-by-Layer Selection
- Language & Runtime
- Framework
- Database
- Hosting
- Authentication
- Monitoring

## Example Output

When activated, provides structured recommendations like:

```
Based on your constraints:
- Team: 5 developers, TypeScript expertise
- Timeline: 3 months MVP
- Scale: 10K users initially

Recommendation:
- Backend: TypeScript + Node.js + FastAPI
- Frontend: Next.js 14
- Database: PostgreSQL + Redis
- Hosting: Vercel (frontend) + Render (backend)
- Auth: Clerk
```

## Usage

Simply ask: "What tech stack should we use for [project description]?"

The skill will:
1. Ask clarifying questions about constraints
2. Provide recommendation matrix
3. Explain trade-offs
4. Link to relevant documentation

