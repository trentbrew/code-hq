# Agent Integration Guide

## The Strategy: Markdown > MCP (For Now)

**Decision**: Ship markdown-based agent integration first. Add MCP server later if demanded.

**Rationale**:
- ✅ Works everywhere (Cursor, Windsurf, Claude Code, Cline, Continue)
- ✅ Zero setup required
- ✅ Self-documenting (humans can read too)
- ✅ Git-friendly
- ✅ Easy to customize and share
- ✅ Testable (follow instructions manually)

## What Gets Created

When users run `code-hq init`, they get:

```
.code-hq/
├── prompts/
│   ├── _index.md              # Overview + quick reference
│   ├── task-management.md     # Complete task guide
│   ├── note-taking.md         # Note-taking patterns
│   ├── query-examples.md      # Query cookbook
│   └── workflows/
│       ├── daily-standup.md   # Generate standup reports
│       ├── pr-review.md       # Review PRs against tasks
│       └── sprint-planning.md # (coming soon)
```

## How Agents Discover code-hq

### Cursor

Add to `.cursorrules`:
```markdown
# This project uses code-hq for task management

Reference `.code-hq/prompts/_index.md` for available commands.

Before creating tasks, check existing tasks first.
Update task status when starting/finishing work.
Document blockers immediately.
```

### Windsurf

Create `.windsurf/workflows/codehq.md`:
```markdown
---
description: code-hq commands reference
---

Read `.code-hq/prompts/_index.md` for overview.
See `.code-hq/prompts/task-management.md` for details.
```

### Claude Code

Just works! Claude automatically sees `.code-hq/prompts/` as project context.

User can ask: "How do I manage tasks in this project?"

### Continue

Add to `.continuerc.json`:
```json
{
  "contextProviders": [
    {
      "name": "code-hq",
      "params": {
        "path": ".code-hq/prompts/"
      }
    }
  ]
}
```

### Cline

Point Cline at `.code-hq/prompts/_index.md` in custom instructions.

## What's in Each Prompt File

### `_index.md` - The Entry Point
- What is code-hq?
- Quick command reference
- Links to detailed guides
- IDE-specific integration instructions
- Philosophy and best practices

**Goal**: Agent reads this first, understands the system, knows where to go for details.

### `task-management.md` - The Complete Guide
- All task commands (list, create, update, query)
- Common workflows (starting work, getting blocked, completing)
- Best practices
- Examples for every scenario

**Goal**: Agent becomes expert at task management after reading this once.

### `note-taking.md` - Documentation Patterns
- Note types and when to use them
- Templates for decisions, meetings, research
- Linking notes to tasks
- Search and query patterns

**Goal**: Agent documents everything important automatically.

### `query-examples.md` - Query Cookbook
- Basic queries (filter by status, priority, assignee)
- Complex queries (dependencies, aggregations)
- Natural language examples
- Output formatting
- Common patterns

**Goal**: Agent can answer any question about project state.

### `workflows/*.md` - Automation Patterns
- **daily-standup.md**: Generate standup reports
- **pr-review.md**: Review PRs against task context
- **sprint-planning.md**: Plan sprints with data (coming soon)

**Goal**: Agent can execute common workflows autonomously.

## Why This Works

### 1. Self-Teaching
Agent reads `.code-hq/prompts/_index.md` once → understands entire system.

No need to:
- Update prompts for every new agent
- Build custom integrations
- Maintain multiple documentation sets

### 2. Progressive Disclosure
```
_index.md → Quick overview (1 min read)
   ↓
task-management.md → Deep dive (5 min read)
   ↓
workflows/daily-standup.md → Specific automation (2 min read)
```

Agent can dive deeper when needed.

### 3. Human-Readable
Same docs work for:
- AI agents (follow instructions)
- New developers (onboarding)
- Team leads (process documentation)
- You in 6 months (remembering how it works)

### 4. Versioned
Prompts live in git alongside code:
- Changes are tracked
- Team can review/improve
- Roll back if needed
- Branch-specific variations

### 5. Testable
Before shipping a prompt template:
1. Read it yourself
2. Follow the instructions manually
3. If it works for you → it works for agents

No "prompt engineering" needed. Just clear technical documentation.

## Example Agent Interaction

**User**: "What am I working on?"

**Agent**: 
1. Sees `.code-hq/prompts/_index.md` in context
2. Reads: "To list tasks assigned to you: `code-hq tasks --assignee @me`"
3. Runs: `code-hq tasks --assignee @me --status in-progress`
4. Returns: "You're working on: task:123 (Fix authentication bug)"

**User**: "Mark it as done"

**Agent**:
1. Remembers from `task-management.md`: "Update status: `code-hq update task:ID --status done`"
2. Runs: `code-hq update task:123 --status done`
3. Returns: "✓ Marked task:123 as done"

**No special tools. No MCP server. Just reading markdown and running CLI commands.**

## Sharing Workflows

### Built-in (Ships with code-hq)
- `code-hq init` creates standard workflows
- Team gets consistent patterns out of the box

### Community Repository (Future)
```bash
# Browse community workflows
code-hq workflows browse

# Install a workflow
code-hq workflows install ci-cd-setup

# Publish your workflow
code-hq workflows publish my-workflow.md
```

### Copy-Paste (Now)
1. Create great workflow in your project
2. Share the `.md` file in issues/discussions
3. Others copy to their `.code-hq/prompts/workflows/`

Simple. No infrastructure needed.

## MCP Server (Phase 3 - Optional)

If users demand it, we can add:

```bash
npm install -g @code-hq/mcp-server
```

Claude config:
```json
{
  "mcpServers": {
    "code-hq": {
      "command": "npx",
      "args": ["@code-hq/mcp-server"]
    }
  }
}
```

This enables:
- Direct tool calling (no CLI subprocess)
- Structured responses (JSON instead of text)
- Better error handling
- Complex multi-step workflows

But **only for Claude Code users who want it**. Everyone else uses markdown + CLI.

## Validation Strategy

Before merging prompt templates:

1. **Manual test**: Follow instructions yourself
2. **Agent test**: Give to Claude/Cursor, see if it works
3. **User test**: Ship to 5 users, collect feedback
4. **Iterate**: Fix confusing parts

**Acceptance criteria**: 
- Agent can complete task without asking questions
- Instructions are unambiguous
- Examples cover common cases
- Fallbacks documented for edge cases

## Roadmap

### ✅ Phase 1: Core Prompts (This Week)
- [x] `_index.md` - Overview
- [x] `task-management.md` - Complete guide
- [x] `note-taking.md` - Documentation patterns
- [x] `query-examples.md` - Query cookbook
- [x] `workflows/daily-standup.md`
- [x] `workflows/pr-review.md`

### 📋 Phase 2: More Workflows (Next Week)
- [ ] `workflows/sprint-planning.md`
- [ ] `workflows/release-checklist.md`
- [ ] `workflows/bug-triage.md`
- [ ] `workflows/retrospective.md`

### 🔮 Phase 3: Community (This Month)
- [ ] GitHub discussions for sharing workflows
- [ ] `code-hq workflows` CLI commands
- [ ] Workflow marketplace/registry
- [ ] Upvote/rating system

### 🚀 Phase 4: MCP (If Demanded)
- [ ] `@code-hq/mcp-server` package
- [ ] Tool definitions
- [ ] Claude Code integration guide
- [ ] Comparison docs (Markdown vs MCP)

## Success Metrics

**Good:**
- Agents use code-hq without explicit prompting
- Users report "my AI just figured it out"
- Low support volume on "how do agents use this"

**Great:**
- Community shares custom workflows
- Other tools copy this pattern
- Becomes standard for agent-native tools

**Amazing:**
- Agents teach each other patterns
- Workflows evolve through agent suggestions
- Zero documentation maintenance (self-evident)

## Philosophy

**"Agents should learn to use tools the same way humans do: by reading good documentation."**

No special APIs. No tool definitions. No MCP schemas.

Just clear, thorough, example-rich markdown that explains:
- What the tool does
- When to use it
- How to use it
- What to expect

If a human can follow it → an agent can follow it.

---

**Status**: ✅ Ready to ship

The templates exist. The `init` command copies them. Agents can read them.

Ship it. Iterate based on real usage.
