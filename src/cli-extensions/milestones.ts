/**
 * Milestones command - list and filter milestones
 */

import { filterEntities, formatTable, loadGraph } from './utils.js';

interface MilestonesOptions {
  status?: string;
}

export async function milestonesCommand(options: MilestonesOptions): Promise<void> {
  try {
    const { graph } = await loadGraph();
    
    // Build filters
    const filters: Record<string, any> = {};
    if (options.status) filters.status = options.status;
    
    // Filter milestones
    let milestones = filterEntities(graph, 'Milestone', filters);
    
    // Sort by due date
    milestones.sort((a: any, b: any) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    if (milestones.length === 0) {
      console.log('No milestones found.');
      return;
    }
    
    console.log(`\n🎯 Milestones (${milestones.length} found)\n`);
    
    // Format for display
    const displayData = milestones.map((milestone: any) => ({
      ID: milestone['@id'],
      Title: milestone.title?.substring(0, 40) || '',
      Status: milestone.status || '',
      Progress: `${milestone.progress || 0}%`,
      Due: new Date(milestone.dueDate).toLocaleDateString(),
      Tasks: milestone.tasks?.length || 0,
    }));
    
    formatTable(displayData, ['ID', 'Title', 'Status', 'Progress', 'Due', 'Tasks']);
  } catch (error) {
    console.error('❌ Failed to list milestones:', error);
    process.exit(1);
  }
}
