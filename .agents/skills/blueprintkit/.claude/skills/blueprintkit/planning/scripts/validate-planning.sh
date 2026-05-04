#!/bin/bash
# Planning Validation Script
# Validates that all required planning sections are present and properly structured

set -e

echo "🔍 Validating Planning Framework..."
echo "===================================="

PLANNING_DIR=".claude/skills/blueprintkit/planning"

# Check if planning directory exists
if [ ! -d "$PLANNING_DIR" ]; then
    echo "❌ Error: Planning directory not found"
    exit 1
fi

echo "✅ Planning directory exists"

# Required planning files
REQUIRED_FILES=(
    "0-Master-Index.md"
    "1-Executive-Summary.md"
    "2-Objectives-Success-Metrics.md"
    "3-Scope-Definition.md"
    "4-System-Architecture-Design.md"
    "5-Technical-Execution-Workflow.md"
    "6-Project-Phases-Timeline.md"
    "7-Resource-Planning.md"
    "8-Risk-Management.md"
    "9-Execution-Strategy.md"
    "10-Monitoring-Reporting.md"
    "11-ROI-Value-Realization.md"
    "12-Governance-Decision-Making.md"
    "13-Lessons-Learned-Continuous-Improvement.md"
    "README.md"
    "SKILL-INTERNAL.md"
)

# Check each required file
all_good=true
for file in "${REQUIRED_FILES[@]}"; do
    file_path="$PLANNING_DIR/$file"
    if [ ! -f "$file_path" ]; then
        echo "❌ Missing: $file"
        all_good=false
    else
        echo "✅ Found: $file"
    fi
done

# Check for references and scripts directories
if [ ! -d "$PLANNING_DIR/references" ]; then
    echo "⚠️  Missing: references/ directory (optional)"
else
    echo "✅ Found: references/ directory"
fi

if [ ! -d "$PLANNING_DIR/scripts" ]; then
    echo "⚠️  Missing: scripts/ directory (optional)"
else
    echo "✅ Found: scripts/ directory"
fi

echo ""

if [ "$all_good" = true ]; then
    echo "🎉 All planning sections properly structured!"
    echo ""
    echo "Next: Fill out planning sections starting with 0-Master-Index.md"
else
    echo "❌ Planning structure incomplete. Please create missing files."
    exit 1
fi

