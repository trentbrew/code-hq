<img width="219" height="139" alt="image" src="https://github.com/user-attachments/assets/85b05e6e-233e-4d94-a363-82e611e5ec60" />

# Project Knowledge Graph for Agentic Development

**code-hq** is a project-scoped knowledge graph system designed for agentic development workflows. It combines TQL's powerful EAV query engine with opinionated conventions for project management, creating a semantic memory layer that both humans and AI agents can read, write, and reason over.

**Core Principle**: Every project gets a `.code-hq/` directory containing a semantic graph of tasks, notes, people, milestones, and custom entities—queryable via CLI, manipulated by AI agents, and visualizable in rich UIs.

<img width="7708" height="4364" alt="image" src="https://github.com/user-attachments/assets/fda804d9-cc6a-4118-be6f-b3078c48d94c" />

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

### Built on [TQL](https://github.com/trentbrew/TQL)

code-hq is powered by **TQL** (Tree Query Language), a schema-agnostic EAV engine with Datalog evaluation. TQL provides the query engine, while code-hq adds project management conventions and rich UIs.

## Project structure

```
├── src/
│   ├── eav-engine.ts        # Facts store, flattening, index maintenance
│   ├── query/               # EQL-S parser, Datalog evaluator, generators
│   ├── cli/                 # TQL CLI entrypoint + helpers
│   ├── ai/                  # Natural language orchestrator & providers
│   ├── graph/               # Agent graph runtime, validators, executors
│   ├── analytics/           # Dataset insights, relationship mining
│   ├── adapters/            # Integrations for workflows & tools
│   ├── telemetry.ts         # Diagnostics + tracing hooks
│   └── index.ts             # Public bundler-friendly exports
├── examples/                # End-to-end demos and playground scripts
├── docs/                    # Deep-dive documentation
├── data/                    # Sample datasets for demos and tests
└── test/                    # Vitest suites (projection, workflows, etc.)
```

## Capabilities

- **Schema agnostic ingestion** – Any JSON becomes `attr(e,a,v)` facts with dot-path attributes and link support.
- **Datalog + EQL-S** – Semi-naive evaluator with projections, filters, regex, math, date ops, and ordering.
- **TQL CLI** – `bun run tql` to load local/remote data, run EQL-S, or translate natural language with `--nl`.
- **NL orchestrator** – `src/ai/` routes natural-language prompts to structured queries with optional tool calls.
- **Agent graph runtime** – Deterministic node/edge engine for complex LLM workflows with budgets and tracing.
- **Analytics toolkit** – Relationship analysis, schema inference, and dataset introspection helpers.

## Usage

### Programmatic example

```typescript
import { EAVStore, jsonEntityFacts } from './src/index.js';

const store = new EAVStore();

const jsonData = {
  id: 1,
  title: 'Hello World',
  tags: ['demo', 'example'],
  metrics: { views: 100 },
};

store.addFacts(jsonEntityFacts('post:1', jsonData, 'post'));

const titles = store.getFactsByAttribute('title');
console.log(titles);
```

### CLI example

```bash
bun run tql \
	-d https://jsonplaceholder.typicode.com/users \
	-q "FIND user AS ?u RETURN ?u.id, ?u.email"

# With natural language translation
bun run tql -d data/posts.json -q "posts with >1000 views" --nl
```

## Development

```bash
# Type checking
bun run typecheck

# Build distributable bundle
bun run build

# Run Vitest suites
bun run test

# Clean build artifacts
bun run clean
```

## Documentation & resources

- [EAV Engine Guide](docs/EAV-README.md)
- [Workflows & Agent Graphs](docs/WORKFLOWS.md)
- [Tree-of-Thought Planner](docs/TOT-PLANNER.md)
- [Analytics toolkit overview](docs/ANALYTICS-README.md)
- [Examples directory](examples/) for runnable scripts and demos

Built with [Bun](https://bun.sh) for fast TypeScript execution.

## Roadmap

### Open Source (Always Free)

- ✅ CLI tool
- ✅ Local storage
- ✅ Entity schemas
- ✅ Query language
- ✅ Basic VSCode extension

### Cloud Features (Future, Paid)

- 🔄 Cloud sync & backup
- 🌐 Web dashboard
- 👥 Team collaboration
- 📊 Advanced analytics
- 🏢 Enterprise SSO

code-hq core will always be free and open source.
Premium features help us sustain development.
