/**
 * Show command - display entities in different views
 */

import { filterEntities, formatTable, loadGraph } from './utils.js';

interface ShowOptions {
  view?: string;
  entity?: string;
}

export async function showCommand(options: ShowOptions): Promise<void> {
  const view = options.view || 'datatable';
  const entityType = options.entity || 'task';
  
  try {
    const { graph } = await loadGraph();
    
    const entities = filterEntities(graph, entityType.charAt(0).toUpperCase() + entityType.slice(1));
    
    if (entities.length === 0) {
      console.log(`No ${entityType}s found.`);
      return;
    }
    
    switch (view) {
      case 'datatable':
        showDatatable(entities, entityType);
        break;
        
      case 'kanban':
        showKanban(entities, entityType);
        break;
        
      case 'calendar':
        showCalendar(entities, entityType);
        break;
        
      case 'graph':
        console.log('📊 Graph view coming soon...');
        console.log('For now, use: code-hq query "FIND task RETURN ?t" --format json');
        break;
        
      default:
        console.error(`❌ Unknown view type: ${view}`);
        console.error('Supported views: datatable, kanban, calendar, graph');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to show entities:', error);
    process.exit(1);
  }
}

function showDatatable(entities: any[], entityType: string): void {
  console.log(`\n📊 ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}s (Datatable View)\n`);
  
  if (entityType === 'task') {
    const displayData = entities.map((e: any) => ({
      ID: e['@id'],
      Title: e.title?.substring(0, 30) || '',
      Status: e.status || '',
      Priority: e.priority || '',
      Assignee: e.assignee?.replace('person:', '@') || '',
      Due: e.dueDate ? new Date(e.dueDate).toLocaleDateString() : '',
    }));
    formatTable(displayData);
  } else {
    formatTable(entities);
  }
}

function showKanban(entities: any[], entityType: string): void {
  if (entityType !== 'task') {
    console.error('❌ Kanban view is only available for tasks');
    return;
  }
  
  const columns = {
    todo: [] as any[],
    'in-progress': [] as any[],
    blocked: [] as any[],
    review: [] as any[],
    done: [] as any[],
  };
  
  for (const task of entities) {
    const status = task.status || 'todo';
    if (columns[status as keyof typeof columns]) {
      columns[status as keyof typeof columns].push(task);
    }
  }
  
  console.log('\n📋 Kanban Board\n');
  console.log('┌────────────┬────────────┬────────────┬────────────┬────────────┐');
  console.log('│   To Do    │ In Progress│  Blocked   │   Review   │    Done    │');
  console.log('├────────────┼────────────┼────────────┼────────────┼────────────┤');
  
  const maxRows = Math.max(
    columns.todo.length,
    columns['in-progress'].length,
    columns.blocked.length,
    columns.review.length,
    columns.done.length
  );
  
  for (let i = 0; i < maxRows; i++) {
    const row = [
      formatKanbanCard(columns.todo[i]),
      formatKanbanCard(columns['in-progress'][i]),
      formatKanbanCard(columns.blocked[i]),
      formatKanbanCard(columns.review[i]),
      formatKanbanCard(columns.done[i]),
    ];
    console.log(`│${row.join('│')}│`);
  }
  
  console.log('└────────────┴────────────┴────────────┴────────────┴────────────┘');
}

function formatKanbanCard(task: any): string {
  if (!task) return '            ';
  
  const title = task.title?.substring(0, 10) || '';
  const priority = task.priority ? `[${task.priority.charAt(0).toUpperCase()}]` : '';
  return ` ${title.padEnd(8)} ${priority}`.substring(0, 12);
}

function showCalendar(entities: any[], entityType: string): void {
  console.log('\n📅 Calendar View\n');
  
  // Group by due date
  const byDate: Record<string, any[]> = {};
  
  for (const entity of entities) {
    if (entity.dueDate) {
      const date = new Date(entity.dueDate).toLocaleDateString();
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(entity);
    }
  }
  
  const sortedDates = Object.keys(byDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  for (const date of sortedDates) {
    const items = byDate[date];
    if (!items) continue;
    console.log(`\n${date} (${items.length} item${items.length > 1 ? 's' : ''})`);
    for (const item of items) {
      const priority = item.priority ? `[${item.priority}]` : '';
      console.log(`  • ${item.title} ${priority}`);
    }
  }
}
