/**
 * Task entity schema
 */

export interface Task {
  '@id': string;
  '@type': 'Task';
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string; // Reference to person:id
  reviewer?: string; // Reference to person:id
  dueDate?: string; // ISO 8601
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependsOn?: string[]; // Array of task:id references
  blockedBy?: string[]; // Array of task:id references
  relatedFiles?: string[]; // Array of file paths
  milestone?: string; // Reference to milestone:id
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export const TASK_STATUSES = ['todo', 'in-progress', 'blocked', 'review', 'done'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export function createTask(data: Partial<Task> & { title: string }): Task {
  const now = new Date().toISOString();
  const id = data['@id'] || `task:${Date.now()}`;
  
  return {
    '@id': id,
    '@type': 'Task',
    title: data.title,
    description: data.description,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    assignee: data.assignee,
    reviewer: data.reviewer,
    dueDate: data.dueDate,
    estimatedHours: data.estimatedHours,
    actualHours: data.actualHours,
    tags: data.tags || [],
    dependsOn: data.dependsOn,
    blockedBy: data.blockedBy,
    relatedFiles: data.relatedFiles,
    milestone: data.milestone,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}
