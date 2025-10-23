/**
 * Validate command - validate graph structure and integrity
 */

import { loadGraph } from './utils.js';

export async function validateCommand(): Promise<void> {
  try {
    console.log('🔍 Validating .code-hq/ structure...\n');
    
    const { graph } = await loadGraph();
    
    let errors = 0;
    let warnings = 0;
    
    // Validate each entity
    for (const entity of graph['@graph']) {
      // Check required fields
      if (!entity['@id']) {
        console.error(`❌ Entity missing @id: ${JSON.stringify(entity).substring(0, 50)}`);
        errors++;
      }
      
      if (!entity['@type']) {
        console.error(`❌ Entity missing @type: ${entity['@id']}`);
        errors++;
      }
      
      // Validate based on type
      switch (entity['@type']) {
        case 'Task':
          if (!entity.title) {
            console.error(`❌ Task missing title: ${entity['@id']}`);
            errors++;
          }
          
          if (entity.status && !['todo', 'in-progress', 'blocked', 'review', 'done'].includes(entity.status)) {
            console.warn(`⚠️  Task has invalid status: ${entity['@id']} (${entity.status})`);
            warnings++;
          }
          
          if (entity.priority && !['low', 'medium', 'high', 'critical'].includes(entity.priority)) {
            console.warn(`⚠️  Task has invalid priority: ${entity['@id']} (${entity.priority})`);
            warnings++;
          }
          
          // Check for broken references
          if (entity.dependsOn) {
            for (const depId of entity.dependsOn) {
              const dep = graph['@graph'].find((e: any) => e['@id'] === depId);
              if (!dep) {
                console.warn(`⚠️  Task has broken dependency: ${entity['@id']} → ${depId}`);
                warnings++;
              }
            }
          }
          break;
          
        case 'Note':
          if (!entity.title) {
            console.error(`❌ Note missing title: ${entity['@id']}`);
            errors++;
          }
          break;
          
        case 'Person':
          if (!entity.name) {
            console.error(`❌ Person missing name: ${entity['@id']}`);
            errors++;
          }
          break;
          
        case 'Milestone':
          if (!entity.title || !entity.dueDate) {
            console.error(`❌ Milestone missing title or dueDate: ${entity['@id']}`);
            errors++;
          }
          break;
      }
    }
    
    // Check for duplicate IDs
    const ids = new Set<string>();
    for (const entity of graph['@graph']) {
      if (ids.has(entity['@id'])) {
        console.error(`❌ Duplicate entity ID: ${entity['@id']}`);
        errors++;
      }
      ids.add(entity['@id']);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Validation Summary`);
    console.log(`   Total entities: ${graph['@graph'].length}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Warnings: ${warnings}`);
    
    if (errors === 0 && warnings === 0) {
      console.log('\n✅ Graph is valid!');
    } else if (errors === 0) {
      console.log('\n⚠️  Graph is valid but has warnings');
    } else {
      console.log('\n❌ Graph has errors that should be fixed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}
