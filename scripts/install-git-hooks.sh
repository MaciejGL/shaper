#!/bin/bash

# Install Git hooks for automated testing

echo "🔧 Installing Git hooks..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-push hook
cp .githooks/pre-push .git/hooks/pre-push

# Make it executable
chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 What this does:"
echo "  • Runs 'npm test' before every git push"
echo "  • Prevents pushing if tests fail"
echo "  • Keeps your main branch stable"
echo ""
echo "💡 To bypass hook in emergency: git push --no-verify"
