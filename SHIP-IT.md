# 🚀 SHIP IT - Immediate Actions

## ✅ Done
- [x] GitHub repo created: https://github.com/trentbrew/codehq
- [x] LICENSE.md added (MIT)
- [x] Roadmap added to README

## 🎯 Next 15 Minutes

### 1. Git Commit & Push

```bash
cd /Users/trentbrew/TURTLE/Projects/DevTools/CODEHQ/v1

# Add all files
git add .

# Commit
git commit -m "Initial release: code-hq v1.0.0

- Fork of TQL with project management layer
- CLI commands: init, create, update, tasks, notes, show, validate
- Entity schemas: Task, Person, Note, Milestone
- Built on TQL's EAV + Datalog engine
- Agent-native design with semantic graph storage"

# Push to GitHub
git push -u origin main

# Tag the release
git tag v1.0.0
git push origin v1.0.0
```

### 2. Update package.json for npm

Add these fields before publishing:

```json
{
  "keywords": [
    "project-management",
    "knowledge-graph",
    "ai-agents",
    "datalog",
    "eav",
    "task-management",
    "semantic-web",
    "json-ld"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/trentbrew/codehq.git"
  },
  "bugs": {
    "url": "https://github.com/trentbrew/codehq/issues"
  },
  "homepage": "https://github.com/trentbrew/codehq#readme",
  "author": "Trent Brew <trentbrew@gmail.com>",
  "license": "MIT"
}
```

### 3. Test Local Install

```bash
# Test that it works globally
npm link

# Try it in a new directory
cd /tmp
mkdir test-codehq && cd test-codehq
code-hq init
code-hq create task "Test deployment" --priority high
code-hq tasks

# If everything works, unlink
npm unlink -g code-hq
```

### 4. Publish to npm

```bash
cd /Users/trentbrew/TURTLE/Projects/DevTools/CODEHQ/v1

# Login to npm (if not already)
npm login

# Publish (might need to use a scoped package if 'code-hq' is taken)
npm publish

# If 'code-hq' is taken, use scoped:
# npm publish --access public
```

**Note**: If `code-hq` is taken on npm, use `@trentbrew/code-hq` instead.

## 🎬 Launch Tweet Thread (Ready to Copy)

```
🚀 Launching code-hq – A project knowledge graph built for AI agents

Most PM tools weren't designed for agentic workflows.
AI needs *semantic context*, not flat files or proprietary APIs.

code-hq fixes this 🧵

1/ Every project gets a `.code-hq/` directory with a semantic graph
   
   ✓ Tasks, notes, people, milestones
   ✓ JSON-LD format (machine-readable)
   ✓ Markdown views (human-readable)
   ✓ Git-friendly, local-first

2/ AI agents can read/write project state natively

code-hq query "show blocked tasks with dependencies"

No parsing fragile text. No brittle APIs. Just structured queries.

3/ Built on TQL – a schema-agnostic EAV engine with Datalog
   
   • Transitive queries (dependencies)
   • Natural language support
   • Agent workflow runtime built-in

4/ Works with your existing AI tools
   
   Cursor, Claude Code, Windsurf, Cline
   
   Just point them at .code-hq/prompts/
   They understand the semantic context

5/ Try it now:

npx code-hq init
npx code-hq create task "Test code-hq"
npx code-hq show --view kanban

Open source. Local-first. Agent-native.

📦 npm: npm install -g code-hq
🔗 GitHub: github.com/trentbrew/codehq
📖 Docs: github.com/trentbrew/codehq#readme

What agent workflows should we build next? 💬
```

## 📱 Social Media Posts

### Hacker News (Show HN)

**Title**: Show HN: code-hq – Project knowledge graph for AI agents

**Body**:
```
I built code-hq – a local-first project management system designed specifically for AI agents.

The problem: AI assistants (Cursor, Claude Code, etc.) struggle with project context. They can't reliably track tasks, understand dependencies, or maintain semantic relationships.

The solution: Every project gets a `.code-hq/` directory with a semantic graph of tasks, notes, people, and milestones stored as JSON-LD. AI agents can query it with natural language or Datalog.

Key features:
- CLI for task management (`code-hq init`, `code-hq create task`, etc.)
- Semantic graph storage (JSON-LD)
- Powerful query language (EQL-S + natural language)
- Built-in agent workflows
- Git-friendly, local-first

Built on TQL (a schema-agnostic EAV engine with Datalog evaluation that I built earlier).

Try it: `npx code-hq init`

GitHub: https://github.com/trentbrew/codehq

Would love feedback on what agent workflows would be most useful!
```

### Reddit r/programming

**Title**: I built a project management system designed for AI agents (open source)

**Body**: Same as HN but add:
```
Tech stack: TypeScript/Bun, EAV store, Datalog evaluator

The core insight: AI agents need structured, semantic context to be truly useful. 
code-hq provides that in a way that's natural for humans (Markdown + CLI) 
but rigorous enough for machines to reason over (EAV + Datalog).
```

### LinkedIn

```
🚀 Just launched code-hq – an open-source project management tool built specifically for AI agents.

The insight: AI assistants need semantic context, not flat files.

code-hq stores your project as a knowledge graph:
→ Tasks, notes, people, milestones
→ Queryable with natural language
→ Git-friendly, local-first
→ Agent-native design

Built on TQL (EAV + Datalog engine).
MIT licensed.

Try it: npx code-hq init

Would love to hear what the developer community thinks!

#OpenSource #AI #DeveloperTools #AgenticAI
```

## 📊 Week 1 Metrics to Track

- GitHub stars ⭐
- npm downloads 📦
- Issues/discussions opened 💬
- Community feedback 🗣️
- Feature requests 📋

## 🎯 Week 1 Goals

**Days 1-2**: Launch + Listen
- Post on all channels
- Respond to every comment/issue within 24h
- Document common questions
- Fix critical bugs

**Days 3-4**: Content
- Record 3-min demo video
- Write "Why AI Agents Need Semantic Context" blog post
- Create 3 example agent workflows

**Days 5-7**: Polish
- Improve error messages based on feedback
- Add missing docs
- Plan next features based on requests

## 🛠️ Quick Wins for V1.1 (Based on Early Feedback)

Likely requests:
- Better error messages
- Interactive `code-hq init` with prompts
- `code-hq link` command for relationships
- Export to GitHub Projects
- Import from Linear

## 💡 Content Ideas (Next 30 Days)

1. **Blog**: "Building Agent-Native Tools: Lessons from code-hq"
2. **Video**: "Using code-hq with Cursor AI"
3. **Tutorial**: "Your First Agent Workflow in 10 Minutes"
4. **Case Study**: "How I Built [X] with AI + code-hq"
5. **Comparison**: "code-hq vs Linear vs JIRA for Solo Devs"

## 🎮 Ready to Ship?

Run these commands:

```bash
# 1. Commit
git add .
git commit -m "Initial release: code-hq v1.0.0"
git push -u origin main
git tag v1.0.0
git push origin v1.0.0

# 2. Test
npm link
code-hq --version

# 3. Publish
npm publish

# 4. Announce
# Post the tweet thread above
# Post on HN, Reddit, LinkedIn

# 5. Celebrate
echo "🎉 code-hq is live!"
```

---

**You built it. Now ship it.** 🚀
