#!/bin/bash
# Quick Setup Script
# Runs all setup, validation, and provides next steps

set -e

echo "🚀 Quick Setup: Claude Skills"
echo "=============================="
echo ""

# Check if we're in project root
if [ ! -f "package.json" ] && [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x scripts/claude-skills/*.sh 2>/dev/null || true

# Run setup
echo ""
echo "📁 Setting up directory structure..."
if [ -f "scripts/claude-skills/setup-claude-skills.sh" ]; then
    ./scripts/claude-skills/setup-claude-skills.sh
else
    echo "⚠️  Setup script not found. Creating structure manually..."
    mkdir -p .claude/skills
fi

# Validate
echo ""
echo "✅ Validating skills setup..."
if [ -f "scripts/claude-skills/validate-claude-skills.sh" ]; then
    ./scripts/claude-skills/validate-claude-skills.sh
else
    echo "⚠️  Validation script not found. Skipping validation."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test skills: Ask Claude 'What skills are available?'"
echo "2. Deploy to git: ./scripts/claude-skills/deploy-claude-skills.sh"
echo "3. Use skills: Ask Claude about tech stack, ADRs, etc."

