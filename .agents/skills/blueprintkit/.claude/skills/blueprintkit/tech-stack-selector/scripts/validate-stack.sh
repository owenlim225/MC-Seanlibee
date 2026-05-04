#!/bin/bash
# Tech Stack Validator
# Validates chosen technology stack against project requirements

LANGUAGE=$1
FRAMEWORK=$2
DATABASE=$3
HOSTING=$4

echo "🔍 Validating tech stack..."
echo "Language: $LANGUAGE"
echo "Framework: $FRAMEWORK"
echo "Database: $DATABASE"
echo "Hosting: $HOSTING"
echo ""

# Language validation
case $LANGUAGE in
    "TypeScript"|"JavaScript")
        echo "✅ TypeScript/JavaScript: Excellent ecosystem, strong typing"
        ;;
    "Python")
        echo "✅ Python: Great for AI/ML, fast development"
        ;;
    "Go")
        echo "✅ Go: Excellent performance, built for concurrency"
        ;;
    "Rust")
        echo "✅ Rust: Maximum performance, memory safety"
        ;;
    "Solidity")
        echo "✅ Solidity: Standard for EVM smart contracts"
        ;;
    *)
        echo "⚠️  $LANGUAGE: Less common, consider team expertise"
        ;;
esac

# Framework validation
case $FRAMEWORK in
    "Next.js"|"React")
        echo "✅ $FRAMEWORK: Strong ecosystem, good performance"
        ;;
    "FastAPI"|"Flask")
        echo "✅ $FRAMEWORK: Python web frameworks, good for APIs"
        ;;
    "Hardhat"|"Foundry")
        echo "✅ $FRAMEWORK: Standard Web3 development frameworks"
        ;;
    *)
        echo "⚠️  $FRAMEWORK: Verify ecosystem maturity"
        ;;
esac

# Database validation
case $DATABASE in
    "PostgreSQL")
        echo "✅ PostgreSQL: Mature, reliable, feature-rich"
        ;;
    "MongoDB")
        echo "✅ MongoDB: Flexible, good for unstructured data"
        ;;
    "Redis")
        echo "✅ Redis: Excellent for caching, sessions"
        ;;
    *)
        echo "⚠️  $DATABASE: Verify fit for use case"
        ;;
esac

# Hosting validation
case $HOSTING in
    "Vercel")
        echo "✅ Vercel: Excellent for Next.js, global CDN"
        ;;
    "AWS")
        echo "✅ AWS: Full cloud platform, maximum flexibility"
        ;;
    "Railway"|"Render")
        echo "✅ $HOSTING: Simple deployment, good for startups"
        ;;
    *)
        echo "⚠️  $HOSTING: Verify pricing and scaling"
        ;;
esac

echo ""
echo "Stack validation complete!"

