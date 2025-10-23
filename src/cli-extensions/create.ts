/**
 * Create command - create new entities
 */

import { addEntity, loadGraph, saveGraph } from './utils.js';
import { createTask } from '../entities/task.js';
import { createNote } from '../entities/note.js';
import { createPerson } from '../entities/person.js';
import { createMilestone } from '../entities/milestone.js';

interface CreateOptions {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  tags?: string;
  due?: string;
  noteType?: string;
  content?: string;
  name?: string;
  email?: string;
  role?: string;
}

export async function createCommand(entityType: string, titleArg: string | undefined, options: CreateOptions): Promise<void> {
  try {
    const { graph } = await loadGraph();
    
    const title = titleArg || options.title;
    
    let entity: any;
    
    switch (entityType.toLowerCase()) {
      case 'task':
        if (!title) {
          console.error('❌ Task title is required');
          process.exit(1);
        }
        entity = createTask({
          title,
          description: options.description,
          status: options.status as any,
          priority: options.priority as any,
          assignee: options.assignee,
          tags: options.tags ? options.tags.split(',').map(t => t.trim()) : [],
          dueDate: options.due,
        });
        break;
        
      case 'note':
        if (!title) {
          console.error('❌ Note title is required');
          process.exit(1);
        }
        entity = createNote({
          title,
          content: options.content || options.description || '',
          type: (options.noteType as any) || 'general',
          tags: options.tags ? options.tags.split(',').map(t => t.trim()) : [],
        });
        break;
        
      case 'person':
        const name = title || options.name;
        if (!name) {
          console.error('❌ Person name is required');
          process.exit(1);
        }
        entity = createPerson({
          name,
          email: options.email,
          role: options.role,
        });
        break;
        
      case 'milestone':
        if (!title || !options.due) {
          console.error('❌ Milestone title and due date are required');
          process.exit(1);
        }
        entity = createMilestone({
          title,
          description: options.description,
          dueDate: options.due,
        });
        break;
        
      default:
        console.error(`❌ Unknown entity type: ${entityType}`);
        console.error('Supported types: task, note, person, milestone');
        process.exit(1);
    }
    
    addEntity(graph, entity);
    await saveGraph(graph);
    
    console.log(`✅ Created ${entityType}: ${entity['@id']}`);
    console.log(`   Title: ${entity.title || entity.name}`);
    if (entity.status) console.log(`   Status: ${entity.status}`);
    if (entity.priority) console.log(`   Priority: ${entity.priority}`);
    if (entity.assignee) console.log(`   Assignee: ${entity.assignee}`);
  } catch (error) {
    console.error('❌ Failed to create entity:', error);
    process.exit(1);
  }
}
