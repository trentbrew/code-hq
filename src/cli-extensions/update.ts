/**
 * Update command - update existing entities
 */

import { loadGraph, saveGraph, updateEntity, findEntity } from './utils.js';

interface UpdateOptions {
  status?: string;
  priority?: string;
  assignee?: string;
  addTags?: string;
  actualHours?: string;
}

export async function updateCommand(entityId: string, options: UpdateOptions): Promise<void> {
  try {
    const { graph } = await loadGraph();
    
    const entity = findEntity(graph, entityId);
    if (!entity) {
      console.error(`❌ Entity not found: ${entityId}`);
      process.exit(1);
    }
    
    const updates: Record<string, any> = {};
    
    if (options.status) updates.status = options.status;
    if (options.priority) updates.priority = options.priority;
    if (options.assignee) updates.assignee = options.assignee;
    if (options.actualHours) updates.actualHours = parseFloat(options.actualHours);
    
    if (options.addTags) {
      const newTags = options.addTags.split(',').map(t => t.trim());
      updates.tags = [...new Set([...(entity.tags || []), ...newTags])];
    }
    
    if (Object.keys(updates).length === 0) {
      console.log('⚠️  No updates specified');
      return;
    }
    
    const success = updateEntity(graph, entityId, updates);
    
    if (!success) {
      console.error(`❌ Failed to update entity: ${entityId}`);
      process.exit(1);
    }
    
    await saveGraph(graph);
    
    console.log(`✅ Updated ${entityId}`);
    for (const [key, value] of Object.entries(updates)) {
      console.log(`   ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
    }
  } catch (error) {
    console.error('❌ Failed to update entity:', error);
    process.exit(1);
  }
}
