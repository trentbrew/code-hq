/**
 * Initialize .code-hq/ directory structure
 */

import { mkdir, writeFile, exists, readFile, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INITIAL_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': []
};

const INITIAL_CONFIG = {
  version: '1.0.0',
  project: {
    name: '',
    repository: ''
  },
  defaults: {
    taskStatus: 'todo',
    taskPriority: 'medium',
    assignee: null
  },
  views: {
    default: 'datatable',
    taskView: 'kanban'
  },
  integrations: {},
  workflows: {
    autorun: []
  }
};

const TASK_MANAGEMENT_PROMPT = `# Task Management Guide for AI Agents

## Available Commands

Query tasks:
- \`code-hq query "FIND task WHERE ?t.assignee = @me"\`
- \`code-hq tasks --status blocked\`

Create tasks:
- \`code-hq create task "Fix authentication bug" --assignee @alice --priority high\`

Update progress:
- \`code-hq update task:123 --status in-progress\`
- \`code-hq update task:123 --actual-hours 2\`

## Workflow Examples

When starting work:
1. Query your assigned tasks
2. Update status to in-progress
3. Link to relevant files

When blocked:
1. Update status to blocked
2. Create note explaining blocker
3. Link blocker to related task
`;

const DAILY_STANDUP_WORKFLOW = {
  name: 'daily-standup',
  description: 'Generate standup report for assigned tasks',
  steps: [
    {
      id: 'fetch-graph',
      type: 'source',
      source: {
        kind: 'file',
        url: '.code-hq/graph.jsonld'
      },
      out: 'graph.json'
    },
    {
      id: 'my-tasks',
      type: 'query',
      from: 'fetch-graph',
      needs: ['fetch-graph'],
      query: 'FIND task AS ?t WHERE ?t.assignee = "@me" AND ?t.updatedAt > "{{yesterday}}" RETURN ?t',
      out: 'my-tasks.json'
    }
  ]
};

export async function initCommand(options: { global?: boolean }) {
  const targetDir = options.global 
    ? join(process.env.HOME || '~', '.code-hq')
    : '.code-hq';

  try {
    // Check if already initialized
    const alreadyExists = await exists(targetDir).catch(() => false);
    if (alreadyExists) {
      console.log(`⚠️  ${targetDir} already exists. Skipping initialization.`);
      return;
    }

    console.log(`📁 Initializing ${targetDir}...`);

    // Create directory structure
    await mkdir(targetDir, { recursive: true });
    await mkdir(join(targetDir, 'entities'), { recursive: true });
    await mkdir(join(targetDir, 'views'), { recursive: true });
    await mkdir(join(targetDir, 'workflows'), { recursive: true });
    await mkdir(join(targetDir, 'prompts'), { recursive: true });
    await mkdir(join(targetDir, 'schema'), { recursive: true });
    await mkdir(join(targetDir, '.meta'), { recursive: true });

    // Create initial graph
    await writeFile(
      join(targetDir, 'graph.jsonld'),
      JSON.stringify(INITIAL_GRAPH, null, 2)
    );

    // Create config
    await writeFile(
      join(targetDir, '.meta', 'config.json'),
      JSON.stringify(INITIAL_CONFIG, null, 2)
    );

    // Create entity markdown views
    await writeFile(join(targetDir, 'entities', 'tasks.md'), '# Tasks\n\n_No tasks yet. Create one with `code-hq create task "Title"`_\n');
    await writeFile(join(targetDir, 'entities', 'notes.md'), '# Notes\n\n_No notes yet. Create one with `code-hq create note "Title"`_\n');
    await writeFile(join(targetDir, 'entities', 'people.md'), '# People\n\n_No people yet._\n');
    await writeFile(join(targetDir, 'entities', 'milestones.md'), '# Milestones\n\n_No milestones yet._\n');

    // Copy agent prompt templates from templates directory  
    // Resolve templates path relative to this file
    const templatesDir = join(__dirname, '..', 'templates', 'prompts');
    
    // Ensure workflows directory exists
    await mkdir(join(targetDir, 'prompts', 'workflows'), { recursive: true });
    
    try {
      // Copy main prompts
      await copyFile(
        join(templatesDir, '_index.md'),
        join(targetDir, 'prompts', '_index.md')
      );
      await copyFile(
        join(templatesDir, 'task-management.md'),
        join(targetDir, 'prompts', 'task-management.md')
      );
      await copyFile(
        join(templatesDir, 'query-examples.md'),
        join(targetDir, 'prompts', 'query-examples.md')
      );
      await copyFile(
        join(templatesDir, 'note-taking.md'),
        join(targetDir, 'prompts', 'note-taking.md')
      );
      
      // Copy workflow templates
      await copyFile(
        join(templatesDir, 'workflows', 'daily-standup.md'),
        join(targetDir, 'prompts', 'workflows', 'daily-standup.md')
      );
      await copyFile(
        join(templatesDir, 'workflows', 'pr-review.md'),
        join(targetDir, 'prompts', 'workflows', 'pr-review.md')
      );
    } catch (error) {
      // Fallback to basic template if copy fails
      console.warn('⚠️  Could not copy template files, using basic templates');
      console.warn(`    Template path: ${templatesDir}`);
      console.warn(`    Error: ${error}`);
      await writeFile(
        join(targetDir, 'prompts', 'task-management.md'),
        TASK_MANAGEMENT_PROMPT
      );
    }

    // Create default workflow
    await writeFile(
      join(targetDir, 'workflows', 'daily-standup.json'),
      JSON.stringify(DAILY_STANDUP_WORKFLOW, null, 2)
    );

    // Create .gitignore for .meta directory
    await writeFile(
      join(targetDir, '.gitignore'),
      '.meta/cache/\n.meta/indexes/\n'
    );

    console.log('✅ Initialized .code-hq/');
    console.log('\nDirectory structure:');
    console.log('  .code-hq/');
    console.log('  ├── graph.jsonld          # Your knowledge graph');
    console.log('  ├── entities/             # Human-readable views');
    console.log('  ├── views/                # UI view configs');
    console.log('  ├── workflows/            # Agent workflows');
    console.log('  ├── prompts/              # Agent guidance');
    console.log('  └── schema/               # Custom entity schemas');
    console.log('\nNext steps:');
    console.log('  code-hq create task "Your first task" --priority high');
    console.log('  code-hq tasks');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}
