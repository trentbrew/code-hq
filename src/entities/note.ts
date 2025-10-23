/**
 * Note entity schema
 */

export interface Note {
  '@id': string;
  '@type': 'Note';
  title: string;
  content: string; // Markdown
  type: 'decision' | 'meeting' | 'research' | 'idea' | 'general';
  tags: string[];
  relatedTo?: string[]; // Array of entity references
  createdBy?: string; // Reference to person:id
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export const NOTE_TYPES = ['decision', 'meeting', 'research', 'idea', 'general'] as const;

export function createNote(data: Partial<Note> & { title: string; content: string }): Note {
  const now = new Date().toISOString();
  const id = data['@id'] || `note:${Date.now()}`;
  
  return {
    '@id': id,
    '@type': 'Note',
    title: data.title,
    content: data.content,
    type: data.type || 'general',
    tags: data.tags || [],
    relatedTo: data.relatedTo,
    createdBy: data.createdBy,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}
