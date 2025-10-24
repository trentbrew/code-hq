# Answer: How Do Agents Learn to Use code-hq?

## TL;DR

**Agents read markdown files.** That's it.

When users run `code-hq init`, they get rich markdown documentation that teaches AI agents everything they need to know. No MCP server. No special APIs. Just really good docs.

## What Gets Created

```
.code-hq/prompts/
├── _index.md              # 3KB - Overview + quick reference
├── task-management.md     # 11KB - Complete task guide
├── note-taking.md         # 8KB - Documentation patterns
├── query-examples.md      # 4KB - Query cookbook
└── workflows/
    ├── daily-standup.md   # 3KB - Generate standups
    └── pr-review.md       # 5KB - Review PRs
```

**Total**: ~35KB of agent training material, auto-generated on `init`.

## How Agents Discover It

### Cursor

User adds to `.cursorrules`:

```markdown
This project uses code-hq. Reference `.code-hq/prompts/_index.md` for commands.
```

Agent reads the file once → understands the system.

### Windsurf

User creates `~/.codeium/windsurf/global_workflows/codehq.md`:

```markdown
---
description: code-hq reference
---

Read `.code-hq/prompts/_index.md`
```

Slash command works immediately.

### Claude Code

Just works. Claude auto-indexes `.code-hq/prompts/` as project context.

User asks: "How do I manage tasks?"
Claude: _reads task-management.md_ → answers correctly.

### Continue / Cline

User points custom instructions at `.code-hq/prompts/`

Agent has full context.

## Why This Works

### 1. Self-Contained Learning

Each markdown file is **complete**:

- What the tool does
- When to use it
- How to use it (with examples)
- Common patterns
- Troubleshooting

Agent reads `_index.md` (3KB) → knows 80% of what it needs.
Reads `task-management.md` (11KB) → becomes expert.

### 2. Progressive Disclosure

```
User: "What tasks am I working on?"
  ↓
Agent reads: _index.md (3KB)
  ↓
Finds: code-hq tasks --assignee @me
  ↓
Runs command
  ↓
Done (without reading 35KB)
```

Only reads deeper when needed.

### 3. Works Everywhere

- ✅ Cursor (via .cursorrules)
- ✅ Windsurf (via workflows)
- ✅ Claude Code (auto-indexed)
- ✅ Continue (context providers)
- ✅ Cline (custom instructions)
- ✅ Any future agent (they all read files)

### 4. Zero Setup

```bash
code-hq init  # Done
```

No server to install. No config to manage. No API keys.

### 5. Testable

Before shipping a prompt template:

1. Read it yourself
2. Follow the instructions
3. If it works for you → it works for agents

No "prompt engineering" black magic.

### 6. Improvable

Prompts live in git:

- User finds confusing instruction
- Opens PR with clearer wording
- Everyone benefits
- Agent gets smarter automatically

## Real-World Example

**User**: "Create a task for fixing the auth bug, assign it to Alice, high priority"

**Agent's thought process**:

1. Sees `.code-hq/` in project
2. Reads `.code-hq/prompts/_index.md` (cached from earlier)
3. Finds create command example:
   ```bash
   code-hq create task "Title" --priority high --assignee person:alice
   ```
4. Adapts to user's request:
   ```bash
   code-hq create task "Fix authentication bug" --priority high --assignee person:alice
   ```
5. Runs it
6. Returns: "✅ Created task:1234"

**No special tools needed**. Just read markdown → run CLI.

## Why Not MCP?

MCP is great, but:

- ❌ Only works in Claude Code (for now)
- ❌ Requires installation/setup
- ❌ Another server to maintain
- ❌ Users need to configure it
- ❌ Harder to test/debug

Markdown:

- ✅ Works in all IDEs
- ✅ Zero setup
- ✅ Already have it (from `init`)
- ✅ Human-readable documentation
- ✅ Easy to improve

**Ship markdown first. Add MCP later if users demand it.**

## The Files

### `_index.md` - The Entry Point

**Purpose**: Agent reads this first, gets 80% of what it needs.

**Contains**:

- What is code-hq?
- Quick command reference
- Links to detailed guides
- IDE-specific integration
- Best practices

**Size**: 3KB (30 seconds to read)

### `task-management.md` - The Expert Guide

**Purpose**: Complete reference for task operations.

**Contains**:

- All commands (list, create, update, query)
- Task lifecycle
- Common workflows
- Best practices
- Integration patterns
- Troubleshooting

**Size**: 11KB (5 minutes to read)

### `note-taking.md` - Documentation Patterns

**Purpose**: Teach agents to document properly.

**Contains**:

- Note types and when to use them
- Templates for decisions, meetings, research
- Linking patterns
- Search strategies

**Size**: 8KB (4 minutes to read)

### `query-examples.md` - Query Cookbook

**Purpose**: Teach EQL-S query language.

**Contains**:

- Basic queries
- Complex queries (joins, aggregations)
- Natural language examples
- Common patterns

**Size**: 4KB (2 minutes to read)

### `workflows/*.md` - Automation Patterns

**Purpose**: Executable workflows agents can run.

**Examples**:

- `daily-standup.md` - Generate standup reports
- `pr-review.md` - Review PRs against task context
- `sprint-planning.md` - (coming soon)

**Size**: 3-5KB each

## Workflow Sharing

### Built-in (Now)

Ships with code-hq:

- daily-standup
- pr-review

### Community (Future)

```bash
code-hq workflows browse
code-hq workflows install ci-cd-setup
code-hq workflows publish my-workflow
```

### Copy-Paste (Always)

User shares `.md` file → others copy to their `.code-hq/prompts/workflows/`

## Comparison: Markdown vs MCP

| Feature      | Markdown        | MCP Server         |
| ------------ | --------------- | ------------------ |
| Setup        | None            | Install + config   |
| Works in     | All IDEs        | Claude Code        |
| Readable by  | Agents + humans | Agents only        |
| Test method  | Read + follow   | Call tools         |
| Customizable | ✅ Edit .md     | ❌ Code changes    |
| Shareable    | ✅ Copy file    | ❌ Install package |
| Versioned    | ✅ In git       | ❌ Separate        |
| Ship time    | ✅ Now          | 📋 Later           |

## Success Metrics

**Good**:

- Agents use code-hq without explicit prompting
- Users say "my AI just figured it out"
- Low support questions

**Great**:

- Community shares custom workflows
- Other tools copy this pattern
- Becomes standard for agent-native CLIs

**Amazing**:

- Agents suggest workflow improvements
- Self-evolving documentation
- Zero maintenance needed

## Conclusion

**You were right**: Don't reinvent the wheel.

Agents already know how to:

- ✅ Read files
- ✅ Parse markdown
- ✅ Run shell commands
- ✅ Follow instructions

So give them:

- ✅ Really good files
- ✅ Clear markdown
- ✅ Testable commands
- ✅ Complete examples

**Ship markdown prompts now. Add MCP if users demand it.**

The beauty: If prompts are good enough for humans → they're good enough for agents.

---

## What's Shipped

✅ **Templates created**:

- `_index.md`
- `task-management.md`
- `note-taking.md`
- `query-examples.md`
- `workflows/daily-standup.md`
- `workflows/pr-review.md`

✅ **Init command updated**:

- Copies all templates on `code-hq init`
- Creates `.code-hq/prompts/` structure
- Works with Bun + TypeScript

✅ **Documentation**:

- `AGENT-INTEGRATION.md` - Full strategy
- `CODE-HQ-README.md` - User docs
- This file - Answers your question

## Ready to Ship

```bash
code-hq init  # Creates prompts
```

Agents can now learn to use code-hq by reading files.

**No MCP server needed. No special APIs. Just markdown.**

That's the answer. 🎯
