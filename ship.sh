#!/bin/bash

# 🚀 code-hq Ship Script
# Automated versioning, testing, and publishing

set -e  # Exit on error

echo "🚀 code-hq Ship Script"
echo "====================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the code-hq root directory"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 Current version: $CURRENT_VERSION"
echo ""

# Step 1: Git status check
echo "📊 Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes detected"
else
    echo "✅ Working directory clean"
fi
echo ""

# Step 2: Version bump
echo "🔢 Version bump"
echo "Current: $CURRENT_VERSION"
echo ""
echo "Select version bump type:"
echo "  1) patch (1.1.0 → 1.1.1) - Bug fixes"
echo "  2) minor (1.1.0 → 1.2.0) - New features"
echo "  3) major (1.1.0 → 2.0.0) - Breaking changes"
echo "  4) skip  - Keep current version"
echo ""
read -p "Choice (1-4): " version_choice

case $version_choice in
    1)
        echo "⬆️  Bumping patch version..."
        npm version patch --no-git-tag-version
        ;;
    2)
        echo "⬆️  Bumping minor version..."
        npm version minor --no-git-tag-version
        ;;
    3)
        echo "⬆️  Bumping major version..."
        npm version major --no-git-tag-version
        ;;
    4)
        echo "⏭️  Skipping version bump"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ New version: $NEW_VERSION"
echo ""

# Step 3: Run tests
echo "🧪 Running tests..."
read -p "Run tests before shipping? (y/n): " run_tests

if [ "$run_tests" = "y" ]; then
    bun run test || {
        echo "❌ Tests failed."
        read -p "Continue anyway? (y/n): " continue_anyway
        if [ "$continue_anyway" != "y" ]; then
            echo "Aborted."
            exit 1
        fi
    }
    echo "✅ Tests passed"
else
    echo "⏭️  Skipping tests"
fi
echo ""

# Step 4: Build
echo "🔨 Building..."
bun run build || {
    echo "❌ Build failed"
    exit 1
}
echo "✅ Build complete"
echo ""

# Step 5: Commit
echo "💾 Committing changes..."
read -p "Commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="chore: release v$NEW_VERSION"
fi

git add .
git commit -m "$commit_msg" || echo "⚠️  Nothing to commit or commit failed"
echo "✅ Changes committed"
echo ""

# Step 6: Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main
echo "✅ Pushed to GitHub"
echo ""

# Step 7: Tag release
echo "🏷️  Tagging release..."
git tag "v$NEW_VERSION" -f
git push origin "v$NEW_VERSION" -f
echo "✅ Tagged v$NEW_VERSION"
echo ""

# Step 8: Test local install
echo "🔗 Testing local install..."
npm link
echo "✅ Linked globally"
echo ""

# Step 9: Test CLI
echo "✨ Testing CLI..."
code-hq --version
echo "✅ CLI works"
echo ""

# Step 10: Publish decision
echo "📦 Ready to publish v$NEW_VERSION to npm!"
echo ""
echo "Next steps:"
echo "1. npm login (if needed)"
echo "2. npm publish"
echo ""
read -p "Publish to npm now? (y/n): " publish_now

if [ "$publish_now" = "y" ]; then
    echo "📦 Publishing to npm..."
    npm publish || {
        echo "❌ npm publish failed. May need to:"
        echo "  1. Run 'npm login' first"
        echo "  2. Check if version already exists"
        echo "  3. Verify package name availability"
        exit 1
    }
    echo "✅ Published v$NEW_VERSION to npm!"
    echo ""
    echo "🎉 code-hq v$NEW_VERSION is now live!"
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
echo "🎊 SHIP COMPLETE! v$NEW_VERSION"
echo ""
echo "Next steps for launch:"
echo "  ✅ Code pushed to GitHub (v$NEW_VERSION)"
echo "  ✅ Release tagged"
if [ "$publish_now" = "y" ]; then
    echo "  ✅ Published to npm"
else
    echo "  ⏸️  Not published to npm yet"
fi
echo ""
echo "Now post the launch announcement:"
echo "  📱 Twitter/X - See SHIP-IT.md for tweet thread"
echo "  🔶 Hacker News - Submit Show HN"
echo "  🔴 Reddit - r/programming"
echo "  💼 LinkedIn - Developer community"
echo "  📝 Dev.to - Blog post"
echo ""
echo "🚀 Let's go!"
