/**
 * Milestone entity schema
 */

export interface Milestone {
  '@id': string;
  '@type': 'Milestone';
  title: string;
  description?: string;
  dueDate: string; // ISO 8601
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  tasks?: string[]; // Array of task:id references
  progress: number; // 0-100
}

export const MILESTONE_STATUSES = ['planned', 'active', 'completed', 'cancelled'] as const;

export function createMilestone(data: Partial<Milestone> & { title: string; dueDate: string }): Milestone {
  const id = data['@id'] || `milestone:${Date.now()}`;
  
  return {
    '@id': id,
    '@type': 'Milestone',
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    status: data.status || 'planned',
    tasks: data.tasks,
    progress: data.progress || 0,
  };
}
