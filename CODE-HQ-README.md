# code-hq - Project Knowledge Graph for Agentic Development

**code-hq** is a project-scoped knowledge graph system designed for agentic development workflows. It combines TQL's powerful EAV query engine with opinionated conventions for project management, creating a semantic memory layer that both humans and AI agents can read, write, and reason over.

**Core Principle**: Every project gets a `.code-hq/` directory containing a semantic graph of tasks, notes, people, milestones, and custom entities—queryable via CLI, manipulated by AI agents, and visualizable in rich UIs.

## Quick Start

```bash
# Install dependencies
bun install

# Initialize code-hq in your project
bun run code-hq init

# Create your first task
bun run code-hq create task "Setup authentication" --priority high --status in-progress

# List all tasks
bun run code-hq tasks

# Show kanban board
bun run code-hq show --view kanban

# Create a note
bun run code-hq create note "Architecture Decision" --note-type decision --content "Using PostgreSQL"

# Validate your graph
bun run code-hq validate
```

## What is code-hq?

code-hq transforms your project into an **intelligent knowledge graph**:

- 📁 **Local-First**: Data lives in `.code-hq/` alongside your code
- 🧠 **Agent-Native**: Built for AI agents to read, write, and reason over project state
- 🔍 **Queryable**: Powerful EQL-S queries + natural language
- 📊 **Visual**: Rich views (kanban, calendar, graph, tables)
- 🔗 **Semantic**: JSON-LD format with relationships between entities

### Built on TQL

code-hq is powered by **TQL** (Tree Query Language), a schema-agnostic EAV engine with Datalog evaluation. TQL provides the query engine, while code-hq adds project management conventions and rich UIs.

## File Structure

After running `code-hq init`, you'll have:

```
.code-hq/
├── graph.jsonld          # Core semantic graph (JSON-LD format)
├── entities/             # Human-readable markdown views
│   ├── tasks.md
│   ├── notes.md
│   ├── people.md
│   └── milestones.md
├── views/                # UI view configurations
├── workflows/            # Agent workflow templates
│   └── daily-standup.json
├── prompts/              # Agent guidance documents
│   └── task-management.md
├── schema/               # Custom entity schemas
└── .meta/                # Internal metadata
    └── config.json
```

## Core Commands

### Initialize

```bash
code-hq init                 # Initialize .code-hq/ in current project
code-hq init --global        # Initialize global graph in ~/.code-hq/
```

### Tasks

```bash
# Create task
code-hq create task "Fix authentication bug" \
  --priority high \
  --status in-progress \
  --assignee person:alice \
  --tags "auth,bug" \
  --due "2025-01-15"

# List tasks
code-hq tasks                           # All tasks
code-hq tasks --status blocked          # Filter by status
code-hq tasks --assignee person:alice   # Filter by assignee
code-hq tasks --priority high           # Filter by priority
code-hq tasks --tag security           # Filter by tag

# Update task
code-hq update task:123 --status done
code-hq update task:123 --actual-hours 4
code-hq update task:123 --add-tags "urgent"
```

### Notes

```bash
# Create note
code-hq create note "Architecture Decision: Use PostgreSQL" \
  --note-type decision \
  --content "We decided to use PostgreSQL because..." \
  --tags "architecture,database"

# List notes
code-hq notes                          # All notes
code-hq notes --type decision          # Filter by type
code-hq notes --tag architecture       # Filter by tag
```

### Views

```bash
code-hq show                           # Default table view
code-hq show --view kanban             # Kanban board
code-hq show --view calendar           # Calendar view
code-hq show --view graph              # Graph visualization (coming soon)
```

### Raw Queries

```bash
# EQL-S queries (TQL's query language)
code-hq query "FIND task WHERE ?t.status = 'blocked' RETURN ?t"

# Natural language queries
code-hq query "show me all overdue high priority tasks" --nl

# With formatting options
code-hq query "FIND task RETURN ?t" --format json
code-hq query "FIND task RETURN ?t" --format csv --limit 10
```

### Validation

```bash
code-hq validate              # Check graph integrity
```

## Entity Types

### Task

```typescript
{
  "@id": "task:123",
  "@type": "Task",
  "title": "Implement OAuth flow",
  "status": "in-progress",     // todo|in-progress|blocked|review|done
  "priority": "high",          // low|medium|high|critical
  "assignee": "person:alice",
  "dueDate": "2025-01-15T10:00:00Z",
  "tags": ["auth", "security"],
  "dependsOn": ["task:456"],
  "estimatedHours": 8,
  "actualHours": 4
}
```

### Note

```typescript
{
  "@id": "note:456",
  "@type": "Note",
  "title": "Architecture Decision",
  "content": "We decided to use PostgreSQL...",
  "type": "decision",          // decision|meeting|research|idea|general
  "tags": ["architecture"],
  "relatedTo": ["task:123"]
}
```

### Person

```typescript
{
  "@id": "person:alice",
  "@type": "Person",
  "name": "Alice Chen",
  "email": "alice@example.com",
  "role": "backend-engineer"
}
```

### Milestone

```typescript
{
  "@id": "milestone:v1",
  "@type": "Milestone",
  "title": "Version 1.0 Release",
  "dueDate": "2025-02-01",
  "status": "active",          // planned|active|completed|cancelled
  "progress": 75
}
```

## Query Language (EQL-S)

code-hq uses TQL's EQL-S (Entity Query Language - Simple) for powerful queries:

```sql
-- Find all blocked tasks
FIND task AS ?t WHERE ?t.status = 'blocked' RETURN ?t

-- Find high priority tasks assigned to Alice
FIND task AS ?t 
WHERE ?t.priority = 'high' AND ?t.assignee = 'person:alice'
RETURN ?t.title, ?t.status

-- Find overdue tasks
FIND task AS ?t
WHERE ?t.dueDate < '2025-01-15' AND ?t.status != 'done'
RETURN ?t
ORDER BY ?t.priority DESC

-- Find tasks with dependencies
FIND task AS ?t
WHERE ?t.dependsOn = ?dep
RETURN ?t, ?dep
```

## Agent Integration

code-hq is designed for AI agents:

### Agent Guidance

Located in `.code-hq/prompts/task-management.md`, these documents teach AI agents how to use the system:

```markdown
# Task Management Guide for AI Agents

## Available Commands

Query tasks:
- `code-hq tasks --status blocked`
- `code-hq query "FIND task WHERE ?t.assignee = @me"`

Create tasks:
- `code-hq create task "..." --assignee @user`

Update progress:
- `code-hq update task:123 --status in-progress`
```

### Workflow Templates

Example: `.code-hq/workflows/daily-standup.json`

```json
{
  "name": "daily-standup",
  "description": "Generate standup report",
  "steps": [
    {
      "id": "fetch-graph",
      "type": "source",
      "source": { "kind": "file", "url": ".code-hq/graph.jsonld" }
    },
    {
      "id": "my-tasks",
      "type": "query",
      "query": "FIND task WHERE ?t.assignee = '@me' AND ?t.updatedAt > '{{yesterday}}'"
    }
  ]
}
```

## Architecture

```
┌─────────────────────────────────────────┐
│         code-hq CLI (Sugar Layer)       │
│  - init, tasks, notes, create, update   │
│  - show (kanban, calendar, graph)       │
│  - validate                              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│            TQL Engine Core              │
│  - EAV Store (schema-agnostic)          │
│  - Datalog Evaluator (EQL-S)            │
│  - Natural Language Orchestrator        │
│  - Agent Graph Runtime                  │
│  - Analytics Toolkit                    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         .code-hq/ File Storage          │
│  - graph.jsonld (JSON-LD)               │
│  - entities/*.md (Markdown)             │
│  - workflows/*.json                     │
└─────────────────────────────────────────┘
```

## Development

```bash
# Type checking
bun run typecheck

# Run tests
bun run test

# TQL demos (underlying engine)
bun run demo:eav              # Core EAV ingestion
bun run demo:graph            # Graph reasoning
bun run demo:agent-graph      # Agent workflows
```

## Roadmap

### ✅ Phase 1: Core (Complete)
- TQL engine integration
- CLI commands (init, create, update, tasks, notes)
- Entity schemas (Task, Person, Note, Milestone)
- Views (datatable, kanban, calendar)
- Validation

### 🚧 Phase 2: Rich UI (In Progress)
- VSCode extension
- Graph visualization
- Real-time collaboration

### 📋 Phase 3: Integrations (Planned)
- GitHub Issues sync
- Linear/Jira import
- Git hooks
- CI/CD workflows

### 🔮 Phase 4: Advanced (Future)
- Natural language queries with LLM
- AI-generated insights
- Cross-project analytics
- Mobile app

## Why code-hq?

**AI agents need structured, semantic context to be truly useful.** code-hq provides that context in a way that's:

- **Natural for humans** to read and write (Markdown + JSON-LD)
- **Rigorous enough for machines** to reason over (EAV + Datalog)
- **Version-controlled** alongside your code
- **Queryable** with powerful declarative queries
- **Local-first** with no cloud dependency

## License

MIT

## Credits

Built on [TQL](https://github.com/trentbrew/TQL) - A schema-agnostic EAV engine with Datalog evaluation.

---

**Get Started**: `bun run code-hq init`
