/**
 * Notes command - list and filter notes
 */

import { filterEntities, formatTable, loadGraph } from './utils.js';

interface NotesOptions {
  type?: string;
  tag?: string;
}

export async function notesCommand(options: NotesOptions): Promise<void> {
  try {
    const { graph } = await loadGraph();
    
    // Build filters
    const filters: Record<string, any> = {};
    if (options.type) filters.type = options.type;
    
    // Filter notes
    let notes = filterEntities(graph, 'Note', filters);
    
    // Tag filter (special case - array field)
    if (options.tag) {
      notes = notes.filter((note: any) => note.tags?.includes(options.tag));
    }
    
    // Sort by most recent first
    notes.sort((a: any, b: any) => {
      return new Date(b.updatedAt || b.createdAt).getTime() - 
             new Date(a.updatedAt || a.createdAt).getTime();
    });
    
    if (notes.length === 0) {
      console.log('No notes found.');
      return;
    }
    
    console.log(`\n📝 Notes (${notes.length} found)\n`);
    
    // Format for display
    const displayData = notes.map((note: any) => ({
      ID: note['@id'],
      Title: note.title?.substring(0, 50) || '',
      Type: note.type || '',
      Tags: note.tags?.join(', ') || '',
      Updated: new Date(note.updatedAt || note.createdAt).toLocaleDateString(),
    }));
    
    formatTable(displayData, ['ID', 'Title', 'Type', 'Tags', 'Updated']);
  } catch (error) {
    console.error('❌ Failed to list notes:', error);
    process.exit(1);
  }
}
