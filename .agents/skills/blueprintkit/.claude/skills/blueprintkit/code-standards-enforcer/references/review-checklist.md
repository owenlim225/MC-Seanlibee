# Code Review Checklist

Complete 40+ item checklist for code reviews.

## Functionality

- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] Input validation present
- [ ] Output format correct

## Code Quality

- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Functions are focused (single responsibility)
- [ ] Variable names are clear and descriptive
- [ ] Comments explain "why" not "what"
- [ ] No magic numbers or strings
- [ ] Proper use of constants
- [ ] Code is readable and maintainable

## Testing

- [ ] Unit tests included
- [ ] Tests cover edge cases
- [ ] Test coverage maintained (80%+)
- [ ] Integration tests updated
- [ ] E2E tests updated (if applicable)
- [ ] Tests are fast and reliable

## Security

- [ ] No hardcoded secrets
- [ ] Input sanitized
- [ ] SQL injection prevented
- [ ] XSS vulnerabilities addressed
- [ ] Authentication/authorization correct
- [ ] Rate limiting implemented (if needed)
- [ ] Sensitive data encrypted

## Performance

- [ ] No N+1 queries
- [ ] Database indexes used appropriately
- [ ] Caching implemented where appropriate
- [ ] No memory leaks
- [ ] Efficient algorithms used
- [ ] Resource cleanup handled

## Documentation

- [ ] README updated if needed
- [ ] API docs updated
- [ ] Code comments added for complex logic
- [ ] Type definitions clear
- [ ] Examples provided (if applicable)

## Integration

- [ ] API contracts maintained
- [ ] Backward compatibility considered
- [ ] Migration scripts included (if needed)
- [ ] Environment variables documented

## Accessibility (Frontend)

- [ ] Semantic HTML used
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards

## Browser Compatibility (Frontend)

- [ ] Works in target browsers
- [ ] Polyfills included if needed
- [ ] Responsive design tested

## Git & Version Control

- [ ] Commit message is clear
- [ ] No unnecessary files committed
- [ ] Branch name follows convention
- [ ] PR description is complete

