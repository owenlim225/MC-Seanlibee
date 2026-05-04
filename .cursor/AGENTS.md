<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Superpowers (spec and plan before code)

This repo vendors [Superpowers](https://github.com/obra/superpowers) skills **`brainstorming`** and **`writing-plans`** under `.cursor/skills/`. **User instructions always win** (this file, direct chat, `CLAUDE.md`).

- **New features, new behavior, or non-trivial design:** follow those skills—question-driven spec → written spec in `docs/superpowers/specs/` → implementation plan in `docs/superpowers/plans/` → then implement. In Cursor, **read** the `SKILL.md` files (there is no separate `Skill` tool). Project rule: [`.cursor/rules/superpowers-workflow.mdc`](.cursor/rules/superpowers-workflow.mdc).
- **Trivial fixes** (typos, obvious one-liners) or when the user explicitly says to **skip spec/plan:** skip the full Superpowers flow.
- **Implementation and quality:** use **ECC** below (agents, hooks, `/tdd`, `tdd-workflow`, `code-reviewer`, Next.js rules) so you do not run two competing TDD systems—align with [`.cursor/skills/tdd-workflow/SKILL.md`](.cursor/skills/tdd-workflow/SKILL.md) for code. Optional shortcut: **`/brainstorm`** command.

Details: [`docs/superpowers/NOTICE.md`](docs/superpowers/NOTICE.md).

---

# Everything Claude Code (ECC) — Agent Instructions

ECC-style tooling lives under `.cursor/`: agent prompts in [`.cursor/agents/`](.cursor/agents/), skills in [`.cursor/skills/`](.cursor/skills/), slash commands in [`.cursor/commands/`](.cursor/commands/), plus rules and hooks. Stack-specific agents/commands were trimmed for this Next.js/TypeScript-focused repo.

**Version:** 1.10.0

## Core Principles

1. **Agent-First** — Delegate to specialized agents for domain tasks
2. **Test-Driven** — Write tests before implementation, 80%+ coverage required
3. **Security-First** — Never compromise on security; validate all inputs
4. **Immutability** — Always create new objects, never mutate existing ones
5. **Plan Before Execute** — Plan complex features before writing code

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design and scalability | Architectural decisions |
| code-architect | Feature architecture from codebase patterns | Blueprint before multi-file work |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code quality and maintainability | After writing/modifying code |
| typescript-reviewer | TypeScript/JavaScript review | TS/JS and Next.js code |
| security-reviewer | Vulnerability detection | Before commits, sensitive code |
| build-error-resolver | Fix build/type errors | When build fails |
| database-reviewer | PostgreSQL/Supabase specialist | Schema design, query optimization |
| python-reviewer | Python code review | Python scripts or backends |
| docs-lookup | Documentation lookup via Context7 | API/docs questions |
| doc-updater | Documentation and codemaps | Updating docs |
| e2e-runner | End-to-end Playwright testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| performance-optimizer | Performance analysis | Bottlenecks and bundle size |
| harness-optimizer | Harness config tuning | Reliability, cost, throughput |
| loop-operator | Autonomous loop execution | Run loops safely, monitor stalls, intervene |
| a11y-architect | Accessibility (WCAG) | UI components and audits |
| code-explorer | Deep codebase tracing | Execution paths and dependencies |
| code-simplifier | Simplify recent edits | Clarity without behavior change |
| comment-analyzer | Comment accuracy audit | Comment rot and misleading docs |
| conversation-analyzer | Transcript analysis | Hook / workflow extraction |
| pr-test-analyzer | PR test coverage quality | Behavioral coverage gaps |
| silent-failure-hunter | Swallowed errors audit | Missing error propagation |
| seo-specialist | Technical SEO | Meta, schema, CWV |
| type-design-analyzer | Type design review | Encapsulation and invariants |

## Agent Orchestration

Use agents proactively without user prompt:
- Complex feature requests → **planner**
- Code just written/modified → **code-reviewer**
- Bug fix or new feature → **tdd-guide**
- Architectural decision → **architect**
- Security-sensitive code → **security-reviewer**
- Autonomous loops / loop monitoring → **loop-operator**
- Harness config reliability and cost → **harness-optimizer**

Use parallel execution for independent operations — launch multiple agents simultaneously.

## Security Guidelines

**Before ANY commit:**
- No hardcoded secrets (API keys, passwords, tokens)
- All user inputs validated
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized HTML)
- CSRF protection enabled
- Authentication/authorization verified
- Rate limiting on all endpoints
- Error messages don't leak sensitive data

**Secret management:** NEVER hardcode secrets. Use environment variables or a secret manager. Validate required secrets at startup. Rotate any exposed secrets immediately.

**If security issue found:** STOP → use security-reviewer agent → fix CRITICAL issues → rotate exposed secrets → review codebase for similar issues.

## Coding Style

**Immutability (CRITICAL):** Always create new objects, never mutate. Return new copies with changes applied.

**File organization:** Many small files over few large ones. 200-400 lines typical, 800 max. Organize by feature/domain, not by type. High cohesion, low coupling.

**Error handling:** Handle errors at every level. Provide user-friendly messages in UI code. Log detailed context server-side. Never silently swallow errors.

**Input validation:** Validate all user input at system boundaries. Use schema-based validation. Fail fast with clear messages. Never trust external data.

**Code quality checklist:**
- Functions small (<50 lines), files focused (<800 lines)
- No deep nesting (>4 levels)
- Proper error handling, no hardcoded values
- Readable, well-named identifiers

## Testing Requirements

**Minimum coverage: 80%**

Test types (all required):
1. **Unit tests** — Individual functions, utilities, components
2. **Integration tests** — API endpoints, database operations
3. **E2E tests** — Critical user flows

**TDD workflow (mandatory):**
1. Write test first (RED) — test should FAIL
2. Write minimal implementation (GREEN) — test should PASS
3. Refactor (IMPROVE) — verify coverage 80%+

Troubleshoot failures: check test isolation → verify mocks → fix implementation (not tests, unless tests are wrong).

## Development Workflow

1. **Plan** — Use planner agent, identify dependencies and risks, break into phases
2. **TDD** — Use tdd-guide agent, write tests first, implement, refactor
3. **Review** — Use code-reviewer agent immediately, address CRITICAL/HIGH issues
4. **Capture knowledge in the right place**
   - Personal debugging notes, preferences, and temporary context → auto memory
   - Team/project knowledge (architecture decisions, API changes, runbooks) → the project's existing docs structure
   - If the current task already produces the relevant docs or code comments, do not duplicate the same information elsewhere
   - If there is no obvious project doc location, ask before creating a new top-level file
5. **Commit** — Conventional commits format, comprehensive PR summaries

## Workflow Surface Policy

- `skills/` is the canonical workflow surface.
- New workflow contributions should land in `skills/` first.
- `commands/` is a legacy slash-entry compatibility surface and should only be added or updated when a shim is still required for migration or cross-harness parity.

## Git Workflow

**Commit format:** `<type>: <description>` — Types: feat, fix, refactor, docs, test, chore, perf, ci

**PR workflow:** Analyze full commit history → draft comprehensive summary → include test plan → push with `-u` flag.

## Architecture Patterns

**API response format:** Consistent envelope with success indicator, data payload, error message, and pagination metadata.

**Repository pattern:** Encapsulate data access behind standard interface (findAll, findById, create, update, delete). Business logic depends on abstract interface, not storage mechanism.

**Skeleton projects:** Search for battle-tested templates, evaluate with parallel agents (security, extensibility, relevance), clone best match, iterate within proven structure.

## Performance

**Context management:** Avoid last 20% of context window for large refactoring and multi-file features. Lower-sensitivity tasks (single edits, docs, simple fixes) tolerate higher utilization.

**Build troubleshooting:** Use build-error-resolver agent → analyze errors → fix incrementally → verify after each fix.

## Project Structure

```
.cursor/agents/  — Agent prompts (trimmed for Next.js/TS stack)
.cursor/skills/  — Workflow skills (browse / invoke via SKILL.md)
.cursor/commands/ — Slash-command shims (subset trimmed for stack)
.cursor/hooks/   — Trigger-based automations
.cursor/rules/   — Guidelines (common alwaysApply + glob-scoped TS/web/python)
.cursor/scripts/ — Hook helpers and utilities
tests/           — Test suite (when present)
```

`commands/` remains in the repo for compatibility, but the long-term direction is skills-first.

## Success Metrics

- All tests pass with 80%+ coverage
- No security vulnerabilities
- Code is readable and maintainable
- Performance is acceptable
- User requirements are met
