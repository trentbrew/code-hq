---
description: Automate changelog generation from git history
---

# Changelog Workflow

Automate your changelog updates using conventional commits and git history.

## Overview

This workflow uses `code-hq changelog` commands to:
- Parse git commits since last release
- Generate changelog entries automatically
- Bump version numbers semantically
- Create git tags for releases

## Conventional Commit Format

For best results, use conventional commit format:

```
<type>(<scope>): <message>

Example:
feat(cli): add changelog command
fix(parser): handle edge case in regex
chore(deps): update dependencies
BREAKING CHANGE: remove deprecated API
```

### Commit Types

The changelog generator maps commit types to changelog sections:

| Commit Type | Changelog Section | Version Bump |
|-------------|-------------------|--------------|
| `feat:` | **Added** | Minor (0.x.0) |
| `fix:` | **Fixed** | Patch (0.0.x) |
| `chore:` | **Changed** | Patch |
| `refactor:` | **Changed** | Patch |
| `perf:` | **Changed** | Patch |
| `docs:` | **Changed** | Patch |
| `security:` | **Security** | Patch |
| `BREAKING CHANGE` | **Changed** | Major (x.0.0) |
| Messages with "remove" | **Removed** | Major |
| Messages with "deprecate" | **Deprecated** | Minor |

## Quick Start

### 1. Generate Changelog Entry

After making commits, generate a changelog entry:

```bash
code-hq changelog generate
```

This will:
- Parse commits since last tag
- Categorize changes
- Auto-bump version based on changes
- Add entry to `CHANGELOG.md`

### 2. Preview First (Recommended)

Preview what will be generated without writing:

```bash
code-hq changelog generate --dry-run
```

### 3. Manual Version Override

Specify version manually if needed:

```bash
code-hq changelog generate --version 2.0.0
```

### 4. Prepare Release

Update `package.json` and create git tag:

```bash
code-hq changelog release
```

This will:
- Update `package.json` version
- Create git tag (e.g., `v1.2.0`)
- Provide next steps

### 5. Publish

```bash
git add CHANGELOG.md package.json
git commit -m "chore: release v1.2.0"
git push --follow-tags
npm publish
```

## Full Workflow Example

### Scenario: New Feature Release

```bash
# 1. Make changes with conventional commits
git commit -m "feat(cli): add changelog generator"
git commit -m "feat(parser): support conventional commits"
git commit -m "fix(format): handle missing dates"
git commit -m "docs: update README with changelog commands"

# 2. Preview changelog
code-hq changelog generate --dry-run

# Output preview:
## [1.4.0] - 2025-10-24
### Added
- add changelog generator
- support conventional commits

### Fixed
- handle missing dates

### Changed
- update README with changelog commands

# 3. Generate for real
code-hq changelog generate

# ✅ Updated CHANGELOG.md

# 4. Review CHANGELOG.md
cat CHANGELOG.md

# 5. Prepare release
code-hq changelog release

# ✅ Updated package.json to v1.4.0
# ✅ Git tag created

# 6. Commit and push
git add CHANGELOG.md package.json
git commit -m "chore: release v1.4.0"
git push --follow-tags

# 7. Publish to npm
npm publish
```

## Version Bumping Logic

The tool automatically determines version bump:

### Major (x.0.0) - Breaking Changes
- Commit contains `BREAKING CHANGE`
- Changes in **Removed** section
- Example: `1.3.1` → `2.0.0`

### Minor (0.x.0) - New Features
- Commit type: `feat:`
- Changes in **Added** section
- Example: `1.3.1` → `1.4.0`

### Patch (0.0.x) - Bug Fixes & Chores
- Commit type: `fix:`, `chore:`, `docs:`, etc.
- Changes in **Fixed** or **Changed** sections
- Example: `1.3.1` → `1.3.2`

## Tips for Better Changelogs

### ✅ Good Commit Messages

```bash
feat(auth): add OAuth2 support
fix(parser): handle empty input gracefully
perf(query): optimize datalog evaluation
docs(readme): add installation instructions
chore(deps): update commander to v12
```

### ❌ Poor Commit Messages

```bash
update stuff
fix bug
wip
asdf
```

### Write for Users, Not Developers

The changelog is for **end users**, so commit messages should be clear:

**Developer perspective** ❌:
```
feat(eav): refactor fact insertion logic
```

**User perspective** ✅:
```
feat(performance): improve data insertion speed by 3x
```

## Changelog Format

The tool follows [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2025-10-24
### Added
- Changelog automation commands

### Fixed
- Typo in commit messages

## [1.3.1] - 2025-10-23
### Fixed
- GitHub URLs updated
```

## Troubleshooting

### No commits found

**Issue**: `ℹ️ No commits found since last release`

**Solution**: You have no new commits since the last tag. Make some commits first!

### Can't find [Unreleased] section

**Issue**: `Could not find [Unreleased] section in CHANGELOG.md`

**Solution**: Ensure your `CHANGELOG.md` has this structure:
```markdown
# Changelog

## [Unreleased]

## [1.0.0] - 2025-10-24
```

### Git tag already exists

**Issue**: `fatal: tag 'v1.4.0' already exists`

**Solution**: 
1. Delete the tag: `git tag -d v1.4.0`
2. Or use a different version: `code-hq changelog release --version 1.4.1`

## Advanced: Manual Changelog Editing

You can always manually edit `CHANGELOG.md` before release:

```bash
# Generate initial entry
code-hq changelog generate

# Edit CHANGELOG.md manually
code CHANGELOG.md

# Then proceed with release
code-hq changelog release
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      # Extract version from tag
      - name: Get version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      # Publish to npm
      - name: Publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      # Create GitHub release from CHANGELOG
      - name: Create GitHub Release
        uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ steps.version.outputs.VERSION }}
```

## Best Practices

1. **Commit often** with clear conventional commits
2. **Preview first** with `--dry-run` before generating
3. **Review** CHANGELOG.md before release
4. **Test** before pushing tags
5. **Keep** [Unreleased] section for ongoing work
6. **Document** breaking changes thoroughly
7. **Write** user-facing messages, not technical jargon

---

**Next**: After release, announce your changes on social media, product forums, or your blog!
