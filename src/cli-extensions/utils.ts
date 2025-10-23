/**
 * Utility functions for CLI commands
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { EAVStore, jsonEntityFacts } from '../eav-engine.js';

export interface Graph {
  '@context': string;
  '@graph': any[];
}

export async function loadGraph(path: string = '.code-hq/graph.jsonld'): Promise<{ graph: Graph; store: EAVStore }> {
  try {
    const content = await readFile(path, 'utf-8');
    const graph: Graph = JSON.parse(content);
    
    // Load into EAV store for querying
    const store = new EAVStore();
    for (const entity of graph['@graph']) {
      const entityId = entity['@id'];
      const entityType = entity['@type'];
      const facts = jsonEntityFacts(entityId, entity, entityType);
      store.addFacts(facts);
    }
    
    return { graph, store };
  } catch (error) {
    throw new Error(`Failed to load graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function saveGraph(graph: Graph, path: string = '.code-hq/graph.jsonld'): Promise<void> {
  try {
    await writeFile(path, JSON.stringify(graph, null, 2));
  } catch (error) {
    throw new Error(`Failed to save graph: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function findEntity(graph: Graph, id: string): any | undefined {
  return graph['@graph'].find((entity: any) => entity['@id'] === id);
}

export function updateEntity(graph: Graph, id: string, updates: Record<string, any>): boolean {
  const entity = findEntity(graph, id);
  if (!entity) return false;
  
  Object.assign(entity, updates);
  entity.updatedAt = new Date().toISOString();
  return true;
}

export function addEntity(graph: Graph, entity: any): void {
  graph['@graph'].push(entity);
}

export function deleteEntity(graph: Graph, id: string): boolean {
  const index = graph['@graph'].findIndex((entity: any) => entity['@id'] === id);
  if (index === -1) return false;
  
  graph['@graph'].splice(index, 1);
  return true;
}

export function filterEntities(graph: Graph, type: string, filters: Record<string, any> = {}): any[] {
  let entities = graph['@graph'].filter((e: any) => e['@type'] === type);
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      entities = entities.filter((e: any) => {
        if (Array.isArray(e[key])) {
          return e[key].includes(value);
        }
        return e[key] === value;
      });
    }
  }
  
  return entities;
}

export function formatTable(data: any[], columns?: string[]): void {
  if (data.length === 0) {
    console.log('No results found.');
    return;
  }
  
  const keys = columns || Object.keys(data[0]);
  
  // Calculate column widths
  const widths: Record<string, number> = {};
  for (const key of keys) {
    widths[key] = Math.max(key.length, 8);
  }
  
  for (const row of data) {
    for (const key of keys) {
      const value = String(row[key] || '');
      widths[key] = Math.max(widths[key]!, value.length);
    }
  }
  
  // Print header
  let header = '';
  for (const key of keys) {
    header += key.padEnd(widths[key]! + 2);
  }
  console.log(header);
  console.log('-'.repeat(header.length));
  
  // Print rows
  for (const row of data) {
    let line = '';
    for (const key of keys) {
      const value = String(row[key] || '');
      line += value.padEnd(widths[key]! + 2);
    }
    console.log(line);
  }
}
