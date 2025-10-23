# .code-hq Technical Specification

## Executive Summary

`.code-hq` is a project-scoped knowledge graph system designed for agentic development workflows. It combines TQL's powerful EAV query engine with opinionated conventions for project management, creating a semantic memory layer that both humans and AI agents can read, write, and reason over.

**Core Principle**: Every project gets a `.code-hq/` directory containing a semantic graph of tasks, notes, people, milestones, and custom entities—queryable via CLI, manipulated by AI agents, and visualized in rich UIs.

---

## Design Philosophy

### 1. **Local-First, Project-Scoped**
- Each project has its own `.code-hq/` directory (like `.git`)
- Data lives alongside code in version control
- Optional global graph in `~/.code-hq/` for cross-project relationships
- No cloud dependency for core functionality

### 2. **Human-Readable, Machine-Queryable**
- Storage: JSON-LD (semantic) + Markdown (readable)
- Query: TQL's EQL-S (powerful) + Natural language (accessible)
- UI: Rich datatables (visual) + CLI (scriptable)

### 3. **Agent-Native**
- AI agents are first-class consumers
- Standard commands, predictable outputs
- Semantic context embedded in every entity
- Workflow templates for common operations

### 4. **Extensible by Default**
- Built-in entities (tasks, notes, people)
- User-defined schemas without migration
- Custom views and visualizations
- Plugin architecture for integrations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   VSCode     │  │     Web      │  │   Terminal   │      │
│  │  Extension   │  │      UI      │  │     CLI      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              .code-hq Core Logic                     │   │
│  │  - Project initialization & scaffolding              │   │
│  │  - Entity CRUD operations                            │   │
│  │  - View management (kanban, calendar, graph)         │   │
│  │  - Workflow orchestration                            │   │
│  │  - Import/export (GitHub, Linear, Jira)             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                        Engine Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    TQL Engine                        │   │
│  │  - EAV Store (schema-agnostic facts)                 │   │
│  │  - Datalog Evaluator (EQL-S queries)                 │   │
│  │  - NL Orchestrator (natural language → queries)      │   │
│  │  - Agent Graph Runtime (workflow execution)          │   │
│  │  - Analytics Toolkit (relationship mining)           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                       Storage Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Project File System (.code-hq/)              │   │
│  │  - graph.jsonld (semantic triples)                   │   │
│  │  - entities/*.md (human-readable views)              │   │
│  │  - views/*.view.json (UI configurations)             │   │
│  │  - workflows/*.workflow.json (agent templates)       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
.code-hq/
├── graph.jsonld                    # Core semantic graph (TQL facts)
│
├── entities/                       # Human-readable entity views
│   ├── tasks.md                   # Generated from graph
│   ├── notes.md
│   ├── people.md
│   ├── milestones.md
│   └── [custom].md
│
├── views/                         # UI view configurations
│   ├── default.view.json         # Datatable config
│   ├── kanban.view.json
│   ├── calendar.view.json
│   └── graph.view.json
│
├── workflows/                     # Agent workflow templates
│   ├── daily-standup.json
│   ├── pr-review.json
│   └── sprint-planning.json
│
├── prompts/                       # Agent guidance docs
│   ├── task-management.md
│   ├── note-taking.md
│   └── project-planning.md
│
├── schema/                        # Custom entity schemas
│   ├── task.schema.json          # Built-in schemas
│   └── [custom].schema.json      # User-defined
│
└── .meta/                         # Internal metadata
    ├── config.json               # Project configuration
    ├── indexes/                  # TQL indexes (gitignored)
    └── cache/                    # Query cache (gitignored)
```

### Global Graph (Optional)

```
~/.code-hq/
├── global-graph.jsonld           # Cross-project relationships
├── projects/                     # Project registry
│   └── registry.json
└── config/
    └── preferences.json          # User preferences
```

---

## Data Model

### JSON-LD Structure

Every entity is stored as linked data with semantic types:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "task:auth-123",
      "@type": "Task",
      "title": "Implement OAuth flow",
      "status": "in-progress",
      "assignee": { "@id": "person:alice" },
      "priority": "high",
      "createdAt": "2025-01-15T10:00:00Z",
      "dependsOn": [
        { "@id": "task:db-456" }
      ],
      "tags": ["auth", "security"],
      "semanticContext": {
        "domain": "authentication",
        "complexity": "medium",
        "blockers": []
      }
    },
    {
      "@id": "person:alice",
      "@type": "Person",
      "name": "Alice Chen",
      "email": "alice@example.com",
      "role": "backend-engineer"
    }
  ]
}
```

### TQL Fact Representation

Internally stored as EAV triples:

```
(task:auth-123, type, Task)
(task:auth-123, title, "Implement OAuth flow")
(task:auth-123, status, in-progress)
(task:auth-123, assignee, person:alice)
(task:auth-123, dependsOn, task:db-456)
```

### Markdown Views

Generated from graph for human readability:

```markdown
# Tasks

## In Progress

### Implement OAuth flow
- **ID**: task:auth-123
- **Assignee**: @alice
- **Priority**: High
- **Depends On**: [[task:db-456]]
- **Tags**: #auth #security
- **Created**: 2025-01-15

---
```

---

## Built-In Entity Types

### Core Entities

**Task**
```typescript
{
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: PersonRef;
  reviewer?: PersonRef;
  dueDate?: ISO8601;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependsOn: TaskRef[];
  blockedBy: TaskRef[];
  relatedFiles: FileRef[];
  milestone?: MilestoneRef;
}
```

**Note**
```typescript
{
  id: string;
  title: string;
  content: string; // Markdown
  type: 'decision' | 'meeting' | 'research' | 'idea' | 'general';
  tags: string[];
  relatedTo: EntityRef[];
  createdBy: PersonRef;
  updatedAt: ISO8601;
}
```

**Person**
```typescript
{
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: URL;
  github?: string;
  timezone?: string;
}
```

**Milestone**
```typescript
{
  id: string;
  title: string;
  description?: string;
  dueDate: ISO8601;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  tasks: TaskRef[];
  progress: number; // 0-100
}
```

**Project** (for global graph)
```typescript
{
  id: string;
  name: string;
  path: string;
  repository?: URL;
  team: PersonRef[];
  relatedProjects: ProjectRef[];
}
```

### Custom Entities

Users can define arbitrary schemas:

```json
{
  "@type": "DesignAsset",
  "name": "Login screen mockup",
  "figmaUrl": "https://...",
  "relatedTasks": ["task:auth-123"]
}
```

---

## CLI Interface

### Installation & Initialization

```bash
# Install globally
npm install -g code-hq

# Or use via npx
npx code-hq init

# Initialize in project
cd my-project
code-hq init
# Creates .code-hq/ directory with scaffolding

# Initialize global graph
code-hq init --global
```

### Core Commands

**Query Operations**
```bash
# Query with EQL-S
code-hq query "FIND task AS ?t WHERE ?t.status = 'blocked' RETURN ?t"

# Natural language query
code-hq query "show me all high priority tasks assigned to alice" --nl

# Quick filters
code-hq tasks --status in-progress --assignee @me
code-hq notes --tag architecture
```

**CRUD Operations**
```bash
# Create
code-hq create task \
  --title "Fix authentication bug" \
  --assignee @alice \
  --priority high \
  --tags auth,bug

code-hq create note \
  --title "Architecture Decision: Use PostgreSQL" \
  --type decision \
  --content "$(cat decision.md)"

# Update
code-hq update task:auth-123 \
  --status in-progress \
  --actual-hours 4

# Delete
code-hq delete task:auth-123

# Link entities
code-hq link task:auth-123 --to task:db-456 --relation dependsOn
code-hq link task:auth-123 --to file:src/auth.ts --relation implements
```

**Views**
```bash
# Show different views
code-hq show tasks --view kanban
code-hq show tasks --view calendar
code-hq show --view graph --focus task:auth-123

# Save custom views
code-hq view create --name "my-sprint" \
  --filter "milestone:sprint-12" \
  --group-by assignee \
  --sort priority
```

**Workflows**
```bash
# Run agent workflows
code-hq workflow run daily-standup
code-hq workflow run pr-review --pr 123

# Create custom workflow
code-hq workflow create sprint-planning
```

**Import/Export**
```bash
# Import from external sources
code-hq import github-issues --repo owner/repo
code-hq import linear --team ENG
code-hq import jira --project PROJ

# Export
code-hq export --format json > backup.json
code-hq export --format csv --entity tasks > tasks.csv
code-hq export --format markdown --entity notes > notes.md
```

**Analytics**
```bash
# Project insights
code-hq analyze
code-hq analyze --entity tasks --metric velocity
code-hq analyze --relationships

# Generate reports
code-hq report sprint --milestone sprint-12
code-hq report team --assignee @alice --period week
```

**Utilities**
```bash
# Validate graph
code-hq validate

# Check for issues
code-hq doctor

# Sync across projects
code-hq sync --from ../other-project

# Start web UI
code-hq web --port 3000
```

---

## VSCode Extension

### Features

**1. Custom Editor for graph.jsonld**
- Rich datatable with inline editing
- Sorting, filtering, grouping
- Multiple views (table, kanban, calendar, graph)
- Auto-save with 2-way sync to file

**2. Sidebar Views**
- Entity tree view
- Quick filters by status/assignee
- Search across all entities
- Relationship explorer

**3. Command Palette Integration**
```
> Code HQ: Create Task
> Code HQ: Search Entities
> Code HQ: Show Graph View
> Code HQ: Run Workflow
> Code HQ: Sync with GitHub Issues
```

**4. Inline Features**
- Hover tooltips for entity references
- Auto-complete for `[[entity:id]]` links
- Code lens showing related tasks for files
- Decorators for task status in comments

**5. Panels**
- Entity detail panel
- Relationship graph visualization
- Timeline view (activity log)
- AI chat interface for queries

### UI Components

**Datatable View**
```
┌─────────────────────────────────────────────────────────────┐
│ Tasks                    🔍 Search    [+ New]  [⚙ Settings] │
├─────────────────────────────────────────────────────────────┤
│ Filters: [Status ▼] [Assignee ▼] [Priority ▼] [Tags ▼]    │
├──┬─────────────────────┬────────┬──────────┬──────┬────────┤
│☐ │ Title               │ Status │ Assignee │ Due  │ Tags   │
├──┼─────────────────────┼────────┼──────────┼──────┼────────┤
│☐ │ Implement OAuth     │ 🟡 WIP │ @alice   │ 1/20 │ #auth  │
│☐ │ Fix database schema │ 🔴 BLK │ @bob     │ 1/18 │ #db    │
│☑ │ Setup CI/CD         │ 🟢 DNE │ @alice   │ 1/15 │ #infra │
└──┴─────────────────────┴────────┴──────────┴──────┴────────┘
```

**Kanban View**
```
┌────────────┬────────────┬────────────┬────────────┐
│   To Do    │ In Progress│  Blocked   │    Done    │
├────────────┼────────────┼────────────┼────────────┤
│┌──────────┐│┌──────────┐│┌──────────┐│┌──────────┐│
││Setup Auth│││OAuth Flow│││DB Schema │││CI/CD     ││
││          │││@alice    │││@bob      │││@alice    ││
││#auth     │││Due: 1/20 │││⚠ Blocked│││✓ Done    ││
│└──────────┘│└──────────┘│└──────────┘│└──────────┘│
└────────────┴────────────┴────────────┴────────────┘
```

**Graph View**
```
                  ┌─────────────┐
                  │  Project    │
                  │  "Auth MVP" │
                  └──────┬──────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
     ┌─────▼─────┐              ┌─────▼─────┐
     │  Task     │──depends on─→│  Task     │
     │  OAuth    │              │  DB Schema│
     │  @alice   │              │  @bob     │
     └─────┬─────┘              └───────────┘
           │
      implements
           │
     ┌─────▼─────┐
     │   File    │
     │ auth.ts   │
     └───────────┘
```

---

## Agent Integration

### Agent Guidance Documents

Located in `.code-hq/prompts/`, these teach AI agents how to use the system:

**task-management.md**
```markdown
# Task Management Guide for AI Agents

## Available Commands

Query tasks:
- `code-hq query "FIND task WHERE ?t.assignee = @me"`
- `code-hq tasks --status blocked`

Create tasks:
- `code-hq create task --title "..." --assignee @user`

Update progress:
- `code-hq update task:123 --status in-progress`
- `code-hq update task:123 --actual-hours 2`

Link to code:
- `code-hq link task:123 --to file:src/feature.ts`

## Workflow Examples

When starting work:
1. Query your assigned tasks
2. Update status to in-progress
3. Link to relevant files

When blocked:
1. Update status to blocked
2. Create note explaining blocker
3. Link blocker to related task
```

### Workflow Templates

**daily-standup.workflow.json**
```json
{
  "name": "daily-standup",
  "description": "Generate standup report",
  "nodes": {
    "gather_tasks": {
      "type": "query",
      "query": "FIND task WHERE ?t.assignee = @me AND ?t.updatedAt > today-1d"
    },
    "summarize": {
      "type": "ai",
      "prompt": "Summarize progress on these tasks for standup",
      "input": "$gather_tasks.results"
    },
    "format": {
      "type": "template",
      "template": "standup.md",
      "data": "$summarize.output"
    }
  },
  "edges": [
    ["gather_tasks", "summarize"],
    ["summarize", "format"]
  ]
}
```

### Agent API

Agents can import `.code-hq` as a library:

```typescript
import { CodeHQ } from 'code-hq';

const hq = new CodeHQ(process.cwd());

// Query
const blockedTasks = await hq.query(`
  FIND task AS ?t
  WHERE ?t.status = 'blocked'
  RETURN ?t
`);

// Create
await hq.create('task', {
  title: 'Fix bug in authentication',
  assignee: 'person:alice',
  priority: 'high'
});

// Natural language
const results = await hq.queryNL('show me all overdue high priority tasks');

// Run workflow
await hq.workflow('pr-review', { prNumber: 123 });
```

---

## Query Language (EQL-S)

Powered by TQL's Datalog engine:

### Basic Queries

```sql
-- Find all tasks
FIND task AS ?t RETURN ?t

-- Filter by status
FIND task AS ?t
WHERE ?t.status = 'blocked'
RETURN ?t.title, ?t.assignee

-- Join relationships
FIND task AS ?t
WHERE ?t.assignee = ?p AND ?p.name = 'Alice'
RETURN ?t

-- Regex matching
FIND task AS ?t
WHERE ?t.title =~ /auth/i
RETURN ?t
```

### Advanced Queries

```sql
-- Recursive dependencies
FIND task AS ?t
WHERE ?t.id = 'task:auth-123'
  AND ?t.dependsOn* = ?dep  -- Transitive closure
RETURN ?dep

-- Aggregations
FIND task AS ?t
WHERE ?t.milestone = 'sprint-12'
GROUP BY ?t.status
RETURN ?t.status, COUNT(?t) AS count

-- Date operations
FIND task AS ?t
WHERE ?t.dueDate < today
  AND ?t.status != 'done'
RETURN ?t
ORDER BY ?t.priority DESC
```

### Natural Language

```bash
# These get translated to EQL-S
code-hq query "what tasks are blocking the auth feature" --nl
code-hq query "show me alice's tasks this week" --nl
code-hq query "find all overdue critical bugs" --nl
```

---

## Views & Visualization

### View Configuration

```json
{
  "name": "sprint-kanban",
  "type": "kanban",
  "entityType": "task",
  "filters": {
    "milestone": "sprint-12"
  },
  "groupBy": "status",
  "sortBy": "priority",
  "columns": [
    { "id": "todo", "title": "To Do", "limit": 5 },
    { "id": "in-progress", "title": "In Progress", "limit": 3 },
    { "id": "review", "title": "Review" },
    { "id": "done", "title": "Done" }
  ],
  "cardTemplate": {
    "title": "{{ title }}",
    "subtitle": "{{ assignee.name }}",
    "metadata": ["priority", "tags", "dueDate"]
  }
}
```

### View Types

**1. Datatable**
- Sortable columns
- Multi-select filters
- Inline editing
- Bulk operations

**2. Kanban**
- Drag-and-drop
- WIP limits
- Swimlanes (by assignee/priority)

**3. Calendar**
- Month/week/day views
- Task scheduling
- Due date visualization

**4. Graph**
- Force-directed layout
- Relationship exploration
- Dependency visualization
- Filter by entity type

**5. Timeline**
- Gantt chart for milestones
- Task duration tracking
- Critical path highlighting

**6. Card Grid**
- Pinterest-style layout
- Rich previews
- Tag filtering

---

## Integrations

### GitHub
```bash
# Import issues
code-hq import github-issues --repo owner/repo

# Sync bidirectionally
code-hq sync github --auto
# Creates webhook: Issue closed → Mark task done
#                  Task created → Create issue
```

### Linear
```bash
code-hq import linear --team ENG --status "In Progress"
code-hq sync linear --bidirectional
```

### Jira
```bash
code-hq import jira --project PROJ --jql "assignee = currentUser()"
```

### Git Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash
code-hq validate || exit 1

# .git/hooks/post-commit
#!/bin/bash
code-hq link file:$(git diff-tree --no-commit-id --name-only -r HEAD) \
  --to-commit $(git rev-parse HEAD)
```

### CI/CD
```yaml
# .github/workflows/code-hq-sync.yml
name: Sync Code HQ
on: [push, pull_request]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npx code-hq validate
      - run: npx code-hq sync github
```

---

## Analytics & Insights

### Built-in Analytics

```bash
# Velocity tracking
code-hq analyze velocity --period sprint

# Bottleneck detection
code-hq analyze bottlenecks

# Team workload
code-hq analyze workload --group-by assignee

# Dependency analysis
code-hq analyze dependencies --critical-path
```

### Custom Reports

```typescript
// .code-hq/reports/sprint-report.ts
export default async function sprintReport(hq: CodeHQ, milestone: string) {
  const tasks = await hq.query(`
    FIND task WHERE ?t.milestone = '${milestone}'
  `);

  const completed = tasks.filter(t => t.status === 'done');
  const velocity = completed.reduce((sum, t) => sum + t.estimatedHours, 0);

  return {
    totalTasks: tasks.length,
    completed: completed.length,
    velocity,
    burndown: calculateBurndown(tasks)
  };
}
```

---

## Configuration

### Project Config

`.code-hq/.meta/config.json`
```json
{
  "version": "1.0.0",
  "project": {
    "name": "My Project",
    "repository": "https://github.com/user/repo"
  },
  "defaults": {
    "taskStatus": "todo",
    "taskPriority": "medium",
    "assignee": null
  },
  "views": {
    "default": "datatable",
    "taskView": "kanban"
  },
  "integrations": {
    "github": {
      "enabled": true,
      "repo": "user/repo",
      "syncIssues": true
    }
  },
  "workflows": {
    "autorun": ["daily-standup"]
  },
  "ai": {
    "provider": "anthropic",
    "model": "claude-sonnet-4"
  }
}
```

### Global Config

`~/.code-hq/config/preferences.json`
```json
{
  "defaultEditor": "vscode",
  "theme": "dark",
  "aliases": {
    "@me": "person:alice"
  },
  "projects": [
    {
      "name": "Backend API",
      "path": "~/code/backend-api"
    }
  ]
}
```

---

## Security & Privacy

### Data Ownership
- All data stored locally in project directory
- No telemetry or tracking
- Optional cloud sync (user-controlled)

### Access Control
- Project-level: Anyone with repo access
- Global graph: User's private data
- Shared entities: Explicit opt-in

### Sensitive Data
- `.meta/` and indexes in `.gitignore`
- Support for encrypted fields
- Optional: Encrypt entire graph with user key

---

## Extension Points

### Custom Entity Types

```typescript
// .code-hq/schema/design-asset.schema.json
{
  "@type": "EntitySchema",
  "name": "DesignAsset",
  "fields": {
    "figmaUrl": { "type": "string", "format": "uri" },
    "status": { "enum": ["draft", "review", "approved"] },
    "relatedTasks": { "type": "array", "items": { "$ref": "Task" } }
  },
  "views": {
    "card": {
      "thumbnail": "{{ figmaUrl }}/thumbnail",
      "title": "{{ name }}"
    }
  }
}
```

### Custom Views

```typescript
// .code-hq/views/custom/heatmap.view.ts
import { View } from 'code-hq';

export class HeatmapView extends View {
  render(data: Entity[]) {
    // Custom rendering logic
    return generateHeatmap(data);
  }
}
```

### Custom Workflows

```typescript
// .code-hq/workflows/custom/deploy-checklist.ts
export default {
  trigger: 'manual',
  steps: [
    { query: 'FIND task WHERE ?t.milestone = current AND ?t.status != done' },
    { condition: 'results.length === 0', message: 'All tasks complete!' },
    { ai: 'Generate deployment checklist based on recent changes' },
    { notify: 'slack://deploys' }
  ]
}
```

---

## Roadmap

### Phase 1: Core Engine (Q1 2025)
- ✅ TQL integration
- ✅ Basic CLI
- ✅ Project initialization
- ✅ Core entity types
- ✅ Query interface

### Phase 2: Rich UI (Q2 2025)
- VSCode extension
- Datatable & Kanban views
- Graph visualization
- Markdown preview

### Phase 3: Agent Integration (Q3 2025)
- Workflow templates
- Agent guidance docs
- Natural language queries
- GitHub Actions integration

### Phase 4: Collaboration (Q4 2025)
- Real-time sync
- Conflict resolution
- Team features
- Cloud backup (optional)

### Future
- Mobile app
- Slack/Discord bots
- Advanced analytics
- Plugin marketplace

---

## Success Metrics

### For Developers
- Time to create/update tasks < 10 seconds
- Query results < 100ms (local)
- Zero-config setup for new projects
- Works offline

### For AI Agents
- 100% command success rate
- Deterministic workflow execution
- Rich semantic context available
- No hallucination on project state

### For Teams
- Single source of truth for project state
- Git-friendly merge resolution
- Cross-project visibility
- Automated reporting

---

## Open Questions

1. **Merge Conflict Strategy**: How to handle concurrent edits to graph.jsonld?
   - Last-write-wins with conflict markers?
   - CRDT-based eventual consistency?
   - Manual merge tool?

2. **Scale Limits**: When does single graph.jsonld become unwieldy?
   - Split at 10k entities?
   - Lazy loading strategies?
   - Archive old data?

3. **Schema Evolution**: How to handle breaking schema changes?
   - Migration scripts?
   - Backwards compatibility?
   - Version graph format?

4. **Cross-Project Links**: How to resolve references when projects move?
   - Relative paths?
   - Global registry?
   - Broken link detection?

5. **AI Provider Choice**: Anthropic vs OpenAI vs local models?
   - Make provider pluggable?
   - Support multiple simultaneously?
   - Fallback strategies?

---

## Conclusion

`.code-hq` bridges the gap between human project management and AI agent capabilities by creating a semantic, queryable, version-controlled knowledge graph that lives alongside your code. By building on TQL's powerful query engine and wrapping it with opinionated conventions and rich UIs, it becomes the "operating system" for agentic development workflows.

The key insight: **AI agents need structured, semantic context to be truly useful**. `.code-hq` provides that context in a way that's natural for humans to read and write, but rigorous enough for machines to reason over.
