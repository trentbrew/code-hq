#!/bin/bash

# 🚀 code-hq Ship Script
# Run this to ship code-hq v1.0.0

set -e  # Exit on error

echo "🚀 code-hq Ship Script"
echo "====================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the code-hq root directory"
    exit 1
fi

# Step 1: Git status check
echo "📊 Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes detected"
else
    echo "✅ Working directory clean"
fi
echo ""

# Step 2: Run tests
echo "🧪 Running tests..."
bun run test
echo "✅ Tests passed"
echo ""

# Step 3: Build
echo "🔨 Building..."
bun run build
echo "✅ Build complete"
echo ""

# Step 4: Commit
echo "💾 Committing changes..."
read -p "Commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Initial release: code-hq v1.0.0

- Fork of TQL with project management layer
- CLI commands: init, create, update, tasks, notes, show, validate
- Entity schemas: Task, Person, Note, Milestone
- Built on TQL's EAV + Datalog engine
- Agent-native design with semantic graph storage"
fi

git add .
git commit -m "$commit_msg" || echo "⚠️  Nothing to commit or commit failed"
echo "✅ Changes committed"
echo ""

# Step 5: Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main
echo "✅ Pushed to GitHub"
echo ""

# Step 6: Tag release
echo "🏷️  Tagging release..."
git tag v1.0.0 -f  # Force in case tag exists
git push origin v1.0.0 -f
echo "✅ Tagged v1.0.0"
echo ""

# Step 7: Test local install
echo "🔗 Testing local install..."
npm link
echo "✅ Linked globally"
echo ""

# Step 8: Test CLI
echo "✨ Testing CLI..."
code-hq --version
echo "✅ CLI works"
echo ""

# Step 9: Publish decision
echo "📦 Ready to publish to npm!"
echo ""
echo "Next steps:"
echo "1. npm login (if needed)"
echo "2. npm publish"
echo ""
read -p "Publish to npm now? (y/n): " publish_now

if [ "$publish_now" = "y" ]; then
    echo "📦 Publishing to npm..."
    npm publish
    echo "✅ Published to npm!"
    echo ""
    echo "🎉 code-hq is now live on npm!"
    echo ""
    echo "Try it:"
    echo "  npm install -g code-hq"
    echo "  code-hq init"
else
    echo "⏭️  Skipping npm publish"
    echo ""
    echo "To publish manually:"
    echo "  npm login"
    echo "  npm publish"
fi

echo ""
echo "🎊 SHIP COMPLETE!"
echo ""
echo "Now post the launch tweet:"
echo "  See SHIP-IT.md for the tweet thread"
echo ""
echo "Next channels:"
echo "  • Hacker News (Show HN)"
echo "  • Reddit r/programming"
echo "  • LinkedIn"
echo "  • Dev.to"
echo ""
echo "🚀 Let's go!"
