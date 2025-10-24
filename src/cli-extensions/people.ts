/**
 * People command - list and filter people
 */

import { filterEntities, formatTable, loadGraph } from './utils.js';

interface PeopleOptions {
  role?: string;
}

export async function peopleCommand(options: PeopleOptions): Promise<void> {
  try {
    const { graph } = await loadGraph();
    
    // Build filters
    const filters: Record<string, any> = {};
    if (options.role) filters.role = options.role;
    
    // Filter people
    const people = filterEntities(graph, 'Person', filters);
    
    // Sort by name
    people.sort((a: any, b: any) => {
      return (a.name || '').localeCompare(b.name || '');
    });
    
    if (people.length === 0) {
      console.log('No people found.');
      return;
    }
    
    console.log(`\n👥 People (${people.length} found)\n`);
    
    // Format for display
    const displayData = people.map((person: any) => ({
      ID: person['@id'],
      Name: person.name || '',
      Email: person.email || '',
      Role: person.role || '',
    }));
    
    formatTable(displayData, ['ID', 'Name', 'Email', 'Role']);
  } catch (error) {
    console.error('❌ Failed to list people:', error);
    process.exit(1);
  }
}
