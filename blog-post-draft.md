# Why AI Agents Need Semantic Context (And Why Flat Files Won't Cut It)

## The Problem with Current AI Workflows

I've been using Cursor, Claude Code, and other AI coding assistants for months now. They're incredible—until they're not.

The breaking point? **Project context**.

Here's what typically happens:

1. I ask my AI assistant: "What tasks are blocking the auth feature?"
2. It searches through `TODO.md`, random comments, and Git commit messages
3. It gives me a fuzzy, unreliable answer
4. I spend 10 minutes manually verifying
5. The AI forgets everything by tomorrow

**The core issue**: AI agents are trying to parse human-readable formats (Markdown lists, JIRA screenshots, Slack threads) to understand structured information (task dependencies, status, ownership).

It's like asking someone to manage a database by reading prose.

## What AI Agents Actually Need

AI agents don't need better prompts. They need **semantic context**.

### 1. **Structured, Queryable Data**

Instead of:

```markdown
# TODO

- [ ] Fix authentication bug (high priority, Alice)
- [ ] Setup database (blocked by auth, Bob)
```

AI needs:

```json
{
  "@id": "task:auth-123",
  "@type": "Task",
  "title": "Fix authentication bug",
  "status": "in-progress",
  "priority": "high",
  "assignee": { "@id": "person:alice" },
  "blockers": []
}
```

Now the agent can **query** instead of **parse**:

```sql
FIND task WHERE ?t.status = 'blocked'
  AND ?t.blockedBy = 'task:auth-123'
```

### 2. **Relationships, Not Just Lists**

Flat files can't represent:

- Transitive dependencies ("What needs to be done before X?")
- Impact analysis ("What breaks if I change this?")
- Resource allocation ("Who's overloaded?")

Semantic graphs can:

```
task:auth-123 → dependsOn → task:db-456
task:db-456  → assignedTo → person:bob
person:bob   → workload → 8 tasks
```

### 3. **Machine-Readable + Human-Readable**

The magic happens when you have **both**:

**Machine layer** (JSON-LD):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    /* structured data */
  ]
}
```

**Human layer** (Markdown):

```markdown
# Tasks

## In Progress

- Fix authentication bug (@alice, high priority)
```

Generate the Markdown **from** the graph. Let humans read it. Let agents query it.

## How code-hq Solves This

I built [code-hq](https://github.com/trentbrew/code-hq) to give AI agents semantic context.

Every project gets a `.code-hq/` directory with:

### 1. A Semantic Graph (`graph.jsonld`)

Stores tasks, notes, people, milestones as JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "task:auth-123",
      "@type": "Task",
      "title": "Fix authentication",
      "status": "in-progress",
      "assignee": { "@id": "person:alice" },
      "dependsOn": [{ "@id": "task:db-456" }]
    }
  ]
}
```

### 2. Query Interface (EQL-S + Natural Language)

Agents can query with Datalog:

```bash
code-hq query "FIND task WHERE ?t.status = 'blocked'"
```

Or natural language:

```bash
code-hq query "show overdue high priority tasks" --nl
```

### 3. Agent Workflows (`workflows/*.json`)

Predefined workflows agents can execute:

```json
{
  "name": "daily-standup",
  "steps": [
    {
      "query": "FIND task WHERE ?t.assignee = @me
                 AND ?t.updatedAt > yesterday"
    }
  ]
}
```

### 4. Human-Friendly CLI

```bash
code-hq init
code-hq create task "Fix auth bug" --priority high
code-hq tasks --status blocked
code-hq show --view kanban
```

Everything stays in sync. Humans use the CLI. Agents query the graph.

## Real-World Impact

Here's what changes when you give AI agents semantic context:

### Before (Flat Files)

**Me**: "What's blocking the auth feature?"
**AI**: _Searches TODO.md, finds 3 mentions, guesses based on proximity_
**Me**: "Actually check task dependencies"
**AI**: _Can't, no structured data_
**Me**: _Manually checks for 10 minutes_

### After (code-hq)

**Me**: "What's blocking the auth feature?"
**AI**:

```bash
code-hq query "FIND task WHERE task:auth-123 dependsOn* ?t
               AND ?t.status != 'done'"
```

Returns: `task:db-456` (Setup database, blocked, assigned to Bob)

**Done in 2 seconds. Accurate every time.**

## The Architecture

```
┌─────────────────────────┐
│   CLI (Human Interface) │
│   code-hq tasks         │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   Semantic Graph Layer  │
│   JSON-LD + EAV Store   │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   Query Engine (TQL)    │
│   Datalog + NL → EQL-S  │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   Agent Workflows       │
│   Automated reasoning   │
└─────────────────────────┘
```

The key insight: **Separate human interface from machine storage**.

- Humans → CLI, Markdown views, Kanban boards
- Agents → Structured queries, semantic relationships, workflows

## Why This Matters Now

We're entering the **agentic development** era:

- Cursor AI writing entire features
- Claude Code managing refactors
- Custom agents handling PR reviews

But they're all **context-starved**.

**code-hq is betting**: The teams that give their AI agents rich semantic context will ship 10x faster than those feeding them flat files.

## Try It

```bash
npx code-hq init
npx code-hq create task "Test semantic workflows"
npx code-hq show --view kanban
```

Open source. Local-first. Built for agents.

**GitHub**: https://github.com/trentbrew/code-hq
**Docs**: https://github.com/trentbrew/code-hq#readme

---

## What's Next?

I'm exploring:

1. **VSCode extension** - Visual graph editor
2. **GitHub sync** - Bidirectional issue linking
3. **Agent templates** - Common workflows (standup, PR review, sprint planning)
4. **Cross-project analytics** - Multi-repo insights

What agent workflows would be most useful for your team? [Open an issue](https://github.com/trentbrew/code-hq/issues) and let's build it together.

---

_Built on [TQL](https://github.com/trentbrew/TQL) - A schema-agnostic EAV engine with Datalog evaluation._
