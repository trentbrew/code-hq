# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2025-10-27

### Added - Agent-First Experience 🤖

- **Agent-Native Design**: AI assistants (Cursor, Windsurf, GitHub Copilot) now proactively maintain the knowledge graph with zero user friction
- **IDE Integration**: New `--ide` flag for `agenthq init` to generate agent instructions
  - `.cursorrules` for Cursor AI
  - `.github/copilot-instructions.md` for GitHub Copilot
  - `.windsurf/workflows/` for Windsurf Cascade (7 workflows)
- **Comprehensive Agent Instructions**: `agent-instructions.md` (5000+ words) guides agents on proactive behavior
- **Agent Mode Workflow**: New `/agenthq-agent-mode` workflow for Windsurf with auto-run support

### Added - Spec-Driven Development 🌱

- **Spec Kit Integration**: Complete spec-driven workflow based on GitHub Spec Kit methodology
- **Constitution Template**: Project principles and decision framework (`constitution.md`)
- **Specification Template**: Feature specs with user stories, requirements, success metrics (`spec.md`)
- **Plan Template**: Technical implementation plans with architecture, data models, API contracts (`plan.md`)
- **Tasks Template**: Task breakdowns with estimates, dependencies, parallel markers (`tasks.md`)
- **New CLI Commands**:
  - `agenthq spec init` - Initialize spec-driven workflow
  - `agenthq spec create <feature-name>` - Create feature specification
  - `agenthq spec plan <feature-id>` - Generate implementation plan
  - `agenthq spec tasks <feature-id>` - Generate task breakdown
  - `agenthq import speckit` - Import existing Spec Kit artifacts
- **Spec Views**: New `entities/specs.md` view showing all specs with progress
- **Windsurf Workflows**: 4 new spec kit workflows (constitution, specify, plan, tasks)

### Added - Documentation 📚

- **AGENT-FIRST-UX.md**: Complete guide to agent-first experience (7000+ words)
- **QUICKSTART.md**: 30-minute onboarding guide for new users
- **SPEC-KIT-INTEGRATION.md**: Complete spec-driven development guide
- **AGENT-FIRST-SUMMARY.md**: Implementation summary and design decisions
- **justfile**: Command runner with `just ship` for one-command publishing
- **JUSTFILE-GUIDE.md**: Complete guide to using just commands

### Enhanced

- **Enhanced Sync**: Now generates `specs.md` entity view with task counts and status
- **Auto-Detection**: All commands auto-detect `.agenthq/` directory by walking up tree (like git)
- **Smart Defaults**: Agents infer time estimates, priorities, and when to log decisions
- **Proactive Logging**: Agents automatically log decisions during implementation
- **Context Loading**: Agents load project context at session start
- **Batched Updates**: Agents bundle confirmations to minimize flow interruption

### Changed

- **Package Name**: Renamed from `@agenthq/core` to `agenthq` (simpler, cleaner!)
- **README.md**: Completely rewritten to emphasize agent-first experience
- **Keywords**: Updated for better npm discoverability (agent-native, cursor, windsurf, copilot)
- **Package Files**: Now includes entire `docs/` directory with all documentation
- **Documentation Structure**: Reorganized into `docs/` with clear topic-based folders
  - `docs/getting-started/` - Onboarding guides
  - `docs/features/` - Feature deep dives
  - `docs/guides/` - Advanced topics
  - `docs/development/` - Contributing and publishing
- **CLI Alias**: Added `hq` as short alias for `agenthq` command (both work identically)
- **npx Support**: Added documentation for using `npx agenthq` without installation

## [1.4.0] - 2025-10-24
### Added
- add automated changelog generation from git history

## [1.3.1] - 2025-10-24
### Fixed
- Updated GitHub URLs from codehq to agenthq

## [1.1.0] - 2024-01-XX

### Added

- **BREAKING**: Enhanced `needs` validation with helpful error messages
- New `tql wf` alias for `workflow` command
- `tql workflow plan` command with `--dot`, `--mermaid`, and `--json` output formats
- `--no-color` option for CI-friendly logging
- Cache key prefix display in pretty logs (`[abc12345]`)
- Map cap display in dry run mode
- Comprehensive edge case validation and error handling
- Duplicate output name detection
- Minimal cycle detection in dependency graphs
- Enhanced error messages with step/dataset suggestions

### Changed

- **BREAKING**: `needs` field now strictly validates step IDs (not dataset names)
- Improved error messages with actionable hints
- Enhanced dry run banner with map cap information
- Better cycle detection showing minimal cycles (e.g., `a → b → a`)

### Fixed

- CLI shape locking with proper unknown option rejection
- Schema validation with line/column error reporting
- Exit code consistency (1 for validation, 2 for runtime)
- Windows path compatibility improvements

### Documentation

- Added comprehensive troubleshooting section
- Enhanced common mistakes documentation
- Updated CLI usage examples
- Added template variable documentation

## [1.0.0] - 2024-01-XX

### Added

- Initial release of TQL workflow engine
- EAV-based datalog engine with path-aware JSON ingestion
- Workflow execution with source, query, and output steps
- HTTP source support with batch and map modes
- EQL-S query processing
- File and stdout output formats
- Caching system for workflow steps
- Template variable interpolation
- Comprehensive test suite
