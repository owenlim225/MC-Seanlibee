---
# name: code-standards-enforcer (internal - not a standalone skill)
description: Ensure code quality or perform code reviews through comprehensive checklists and standards enforcement.
---

# Code Standards Enforcer Skill

Auto-activated when user asks about code review, quality standards, or "code review checklist".

## Purpose

Ensures code quality through comprehensive checklists, standards enforcement, and review guidance.

## Activation Triggers

- "Code review"
- "Quality standards"
- "Code review checklist"
- "What should I check in code review?"

## Output

Provides:
1. 40+ item code review checklist
2. Quality standards
3. Best practices
4. Common issues to catch
5. Review process guidance

## Connected To

- Section 9: Execution Strategy
- Section 5: Technical Execution Workflow (PART 3)
- Coding standards documentation

## Code Review Checklist

When activated, provides comprehensive checklist:

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] Input validation present

### Code Quality
- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Functions are focused (single responsibility)
- [ ] Variable names are clear
- [ ] Comments explain "why" not "what"

### Testing
- [ ] Unit tests included
- [ ] Tests cover edge cases
- [ ] Test coverage maintained
- [ ] Integration tests updated

### Security
- [ ] No hardcoded secrets
- [ ] Input sanitized
- [ ] SQL injection prevented
- [ ] XSS vulnerabilities addressed
- [ ] Authentication/authorization correct

### Performance
- [ ] No N+1 queries
- [ ] Database indexes used
- [ ] Caching implemented where appropriate
- [ ] No memory leaks

### Documentation
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Code comments added for complex logic

## Usage

Ask: "What should I check in this code review?"

The skill will:
1. Provide relevant checklist items
2. Explain each item
3. Suggest improvements
4. Link to standards documentation

