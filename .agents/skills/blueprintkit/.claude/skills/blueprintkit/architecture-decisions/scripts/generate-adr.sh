#!/bin/bash
# ADR Generator Script
# Generates a new ADR file with template

ADR_NUMBER=$(ls docs/adr/*.md 2>/dev/null | wc -l | xargs printf "%03d")
ADR_TITLE=$1

if [ -z "$ADR_TITLE" ]; then
    echo "Usage: ./generate-adr.sh 'Decision Title'"
    exit 1
fi

# Convert title to filename
ADR_FILENAME=$(echo "$ADR_TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
ADR_FILE="docs/adr/adr-${ADR_NUMBER}-${ADR_FILENAME}.md"

cat > "$ADR_FILE" << EOF
# ADR ${ADR_NUMBER}: ${ADR_TITLE}

**Status:** Proposed  
**Date:** $(date +%Y-%m-%d)  
**Deciders:** [Names]  
**Consulted:** [Names]  
**Informed:** [Names]

## Context

[What is the issue we're seeing that is motivating this decision?]

## Decision

[What is the change we're proposing or have agreed to implement?]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Neutral
- [Impact 1]

## Alternatives Considered

### Alternative 1: [Name]
- **Pros:** [List]
- **Cons:** [List]
- **Why not chosen:** [Reason]

### Alternative 2: [Name]
- **Pros:** [List]
- **Cons:** [List]
- **Why not chosen:** [Reason]

## References

- [Link to related documentation]

EOF

echo "✅ Created ADR: $ADR_FILE"
echo "📝 Edit the file to fill in details"

