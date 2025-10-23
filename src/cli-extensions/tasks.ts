/**
 * Tasks command - list and filter tasks
 */

import { filterEntities, formatTable, loadGraph } from './utils.js';

interface TasksOptions {
  status?: string;
  assignee?: string;
  priority?: string;
  tag?: string;
}

export async function tasksCommand(options: TasksOptions): Promise<void> {
  try {
    const { graph } = await loadGraph();
    
    // Build filters
    const filters: Record<string, any> = {};
    if (options.status) filters.status = options.status;
    if (options.assignee) filters.assignee = options.assignee;
    if (options.priority) filters.priority = options.priority;
    
    // Filter tasks
    let tasks = filterEntities(graph, 'Task', filters);
    
    // Tag filter (special case - array field)
    if (options.tag) {
      tasks = tasks.filter((task: any) => task.tags?.includes(options.tag));
    }
    
    // Sort by priority and status
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { blocked: 0, 'in-progress': 1, review: 2, todo: 3, done: 4 };
    
    tasks.sort((a: any, b: any) => {
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) - 
                          (priorityOrder[b.priority as keyof typeof priorityOrder] || 99);
      if (priorityDiff !== 0) return priorityDiff;
      
      return (statusOrder[a.status as keyof typeof statusOrder] || 99) - 
             (statusOrder[b.status as keyof typeof statusOrder] || 99);
    });
    
    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }
    
    console.log(`\n📋 Tasks (${tasks.length} found)\n`);
    
    // Format for display
    const displayData = tasks.map((task: any) => ({
      ID: task['@id'],
      Title: task.title?.substring(0, 40) || '',
      Status: task.status || '',
      Priority: task.priority || '',
      Assignee: task.assignee?.replace('person:', '@') || '',
      Due: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
    }));
    
    formatTable(displayData, ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Due']);
  } catch (error) {
    console.error('❌ Failed to list tasks:', error);
    process.exit(1);
  }
}
