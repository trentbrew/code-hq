#!/usr/bin/env bun

/**
 * code-hq CLI - Project knowledge graph for agentic development
 * 
 * Built on TQL engine with opinionated project management layer
 */

import { Command } from 'commander';
import { initCommand } from '../src/cli-extensions/init.js';
import { tasksCommand } from '../src/cli-extensions/tasks.js';
import { createCommand } from '../src/cli-extensions/create.js';
import { updateCommand } from '../src/cli-extensions/update.js';
import { notesCommand } from '../src/cli-extensions/notes.js';
import { milestonesCommand } from '../src/cli-extensions/milestones.js';
import { peopleCommand } from '../src/cli-extensions/people.js';
import { showCommand } from '../src/cli-extensions/show.js';
import { validateCommand } from '../src/cli-extensions/validate.js';
import { changelogGenerateCommand, changelogReleaseCommand } from '../src/cli-extensions/changelog.js';
import { initTelemetry, trackCommand, shutdownTelemetry } from '../src/telemetry.js';
import { EAVStore, jsonEntityFacts } from '../src/eav-engine.js';
import { DatalogEvaluator } from '../src/query/datalog-evaluator.js';
import { EQLSProcessor } from '../src/query/eqls-parser.js';
import { processQuery } from '../src/ai/orchestrator.js';

// Initialize telemetry
initTelemetry();

const program = new Command();

program
  .name('code-hq')
  .description('Project knowledge graph for agentic development')
  .version('1.1.0');

// ============================================
// code-hq specific commands (sugar layer)
// ============================================

program
  .command('init')
  .description('Initialize .code-hq/ in current project')
  .option('--global', 'Initialize global graph in ~/.code-hq/')
  .action(initCommand);

program
  .command('tasks')
  .description('List and filter tasks')
  .option('--status <status>', 'Filter by status (todo|in-progress|blocked|review|done)')
  .option('--assignee <person>', 'Filter by assignee')
  .option('--priority <priority>', 'Filter by priority (low|medium|high|critical)')
  .option('--tag <tag>', 'Filter by tag')
  .action(tasksCommand);

program
  .command('notes')
  .description('List and filter notes')
  .option('--type <type>', 'Filter by type (decision|meeting|research|idea|general)')
  .option('--tag <tag>', 'Filter by tag')
  .action(notesCommand);

program
  .command('milestones')
  .description('List and filter milestones')
  .option('--status <status>', 'Filter by status (planned|active|completed|cancelled)')
  .action(milestonesCommand);

program
  .command('people')
  .description('List and filter people')
  .option('--role <role>', 'Filter by role')
  .action(peopleCommand);

program
  .command('create <type> [title]')
  .description('Create a new entity (task, note, person, milestone)')
  .option('--title <title>', 'Entity title')
  .option('--description <desc>', 'Description')
  .option('--status <status>', 'Task status')
  .option('--priority <priority>', 'Task priority')
  .option('--assignee <person>', 'Task assignee')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--due <date>', 'Due date (ISO 8601)')
  .option('--note-type <type>', 'Note type (decision|meeting|research|idea|general)')
  .option('--content <text>', 'Note content')
  .option('--name <name>', 'Person name')
  .option('--email <email>', 'Person email')
  .option('--role <role>', 'Person role')
  .action(createCommand);

program
  .command('update <id>')
  .description('Update an existing entity')
  .option('--status <status>', 'Update status')
  .option('--priority <priority>', 'Update priority')
  .option('--assignee <person>', 'Update assignee')
  .option('--add-tags <tags>', 'Add tags (comma-separated)')
  .option('--actual-hours <hours>', 'Update actual hours')
  .action(updateCommand);

program
  .command('show')
  .description('Show entities in different views')
  .option('--view <type>', 'View type (kanban|calendar|graph)', 'datatable')
  .option('--entity <type>', 'Entity type to show', 'task')
  .action(showCommand);

program
  .command('validate')
  .description('Validate .code-hq/ graph and structure')
  .action(validateCommand);

// ============================================
// Changelog automation
// ============================================

const changelog = program.command('changelog').description('Automate changelog generation from git history');

changelog
  .command('generate')
  .description('Generate changelog entry from git commits since last tag')
  .option('--version <version>', 'Specify version manually (e.g., 1.2.0)')
  .option('--dry-run', 'Preview without writing to CHANGELOG.md')
  .action(changelogGenerateCommand);

changelog
  .command('release')
  .description('Prepare release: update package.json version and create git tag')
  .option('--version <version>', 'Specify version manually (e.g., 1.2.0)')
  .action(changelogReleaseCommand);

// ============================================
// Raw TQL query power (kept from TQL)
// ============================================

program
  .command('query <eql>')
  .description('Run raw EQL-S query on project graph')
  .option('--nl', 'Natural language mode')
  .option('-f, --format <format>', 'Output format (json|table|csv)', 'table')
  .option('--limit <number>', 'Limit results', '0')
  .action(async (eql: string, options: any) => {
    const startTime = Date.now();
    try {
      // Load graph into EAV store
      const { readFile } = await import('fs/promises');
      const graphContent = await readFile('.code-hq/graph.jsonld', 'utf-8');
      const graph = JSON.parse(graphContent);
      
      const store = new EAVStore();
      for (const entity of graph['@graph']) {
        const facts = jsonEntityFacts(entity['@id'], entity, entity['@type']);
        store.addFacts(facts);
      }
      
      // Process query
      let processedQuery = eql;
      
      if (options.nl) {
        console.log('🧠 Processing natural language query...');
        const catalog = store.getCatalog();
        const catalogInfo = Array.from(catalog.entries())
          .slice(0, 20)
          .map(([attr, entry]) => ({
            attribute: attr,
            type: entry.type,
            examples: entry.examples.slice(0, 2),
          }));
        
        const result = await processQuery(eql, {
          catalog: catalogInfo,
          dataStats: store.getStats(),
        });
        
        if (result.eqlsQuery) {
          processedQuery = result.eqlsQuery;
          console.log(`📝 Generated EQL-S: ${processedQuery}`);
        }
      }
      
      // Execute query
      const eqlsProcessor = new EQLSProcessor();
      eqlsProcessor.setSchema(store.getCatalog());
      const parseResult = eqlsProcessor.process(processedQuery);
      
      if (parseResult.errors.length > 0) {
        console.error('❌ Query parsing errors:');
        for (const error of parseResult.errors) {
          console.error(`  Line ${error.line}, Column ${error.column}: ${error.message}`);
        }
        process.exit(1);
      }
      
      const evaluator = new DatalogEvaluator(store);
      const queryResult = evaluator.evaluate(parseResult.query!);
      
      const limitedResults = options.limit > 0
        ? queryResult.bindings.slice(0, parseInt(options.limit))
        : queryResult.bindings;
      
      console.log(`\n📊 Query Results (${limitedResults.length} rows)\n`);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(limitedResults, null, 2));
      } else {
        console.table(limitedResults);
      }
      
      trackCommand('query', 'run', Date.now() - startTime, true);
    } catch (error) {
      console.error('Query failed:', error);
      trackCommand('query', 'run', Date.now() - startTime, false, 'QueryError');
      process.exit(1);
    }
  });

// ============================================
// Help text
// ============================================

program.addHelpText('after', `

Examples:
  # Initialize project
  code-hq init

  # Create task
  code-hq create task "Fix authentication bug" --priority high --assignee @alice

  # List blocked tasks
  code-hq tasks --status blocked

  # Show kanban board
  code-hq show --view kanban

  # Raw TQL query
  code-hq query "FIND task WHERE ?t.status = 'blocked' RETURN ?t"

  # Natural language query
  code-hq query "show me all overdue high priority tasks" --nl

  # Generate changelog
  code-hq changelog generate --dry-run
  code-hq changelog generate
  code-hq changelog release
`);

program.parse();

// Shutdown telemetry on exit
process.on('exit', shutdownTelemetry);
process.on('SIGINT', () => {
  shutdownTelemetry();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdownTelemetry();
  process.exit(0);
});
