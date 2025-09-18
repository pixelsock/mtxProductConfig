// Dynamic Schema Introspection Service
import { supabase } from './supabase';

export interface TableSchema {
  name: string;
  exists: boolean;
  columns?: string[];
}

export interface DatabaseSchema {
  tables: Map<string, TableSchema>;
  initialized: boolean;
}

// Global schema cache
let schemaCache: DatabaseSchema = {
  tables: new Map(),
  initialized: false
};

// Expected table names for the configurator
const EXPECTED_TABLES = [
  'product_lines',
  'frame_colors',
  'accessories',
  'mirror_controls', // May not exist - handled gracefully
  'mirror_styles',
  'mounting_options',
  'light_directions',
  'color_temperatures',
  'light_outputs',
  'drivers',
  'frame_thicknesses',
  'sizes',
  'products',
  'rules',
  'configuration_images' // May not exist - handled gracefully
];

// Critical tables that must exist for basic functionality
const CRITICAL_TABLES = [
  'product_lines',
  'frame_colors',
  'mirror_styles',
  'mounting_options',
  'light_directions',
  'color_temperatures',
  'light_outputs',
  'drivers',
  'frame_thicknesses',
  'sizes'
];

/**
 * Introspect the database schema by attempting to query each expected table
 */
export async function introspectSchema(): Promise<DatabaseSchema> {
  if (schemaCache.initialized) {
    return schemaCache;
  }

  console.log('🔍 Starting dynamic schema introspection...');

  const tableChecks = EXPECTED_TABLES.map(async (tableName) => {
    try {
      // Try to query the table with a LIMIT 0 to check if it exists
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ Table '${tableName}' does not exist: ${error.message}`);
        return { name: tableName, exists: false };
      } else {
        console.log(`✅ Table '${tableName}' exists`);
        return { name: tableName, exists: true };
      }
    } catch (error) {
      console.log(`❌ Table '${tableName}' check failed:`, error);
      return { name: tableName, exists: false };
    }
  });

  const results = await Promise.all(tableChecks);

  // Update cache
  schemaCache.tables.clear();
  results.forEach(result => {
    schemaCache.tables.set(result.name, result);
  });
  schemaCache.initialized = true;

  const existingTables = results.filter(r => r.exists).map(r => r.name);
  const missingTables = results.filter(r => !r.exists).map(r => r.name);

  // Check critical tables
  const missingCriticalTables = CRITICAL_TABLES.filter(table => !existingTables.includes(table));
  const missingOptionalTables = missingTables.filter(table => !CRITICAL_TABLES.includes(table));

  console.log(`✅ Schema introspection complete:`);
  console.log(`  - Found ${existingTables.length} tables: ${existingTables.join(', ')}`);

  if (missingCriticalTables.length > 0) {
    console.error(`❌ CRITICAL tables missing: ${missingCriticalTables.join(', ')}`);
  }

  if (missingOptionalTables.length > 0) {
    console.log(`⚠️ Optional tables missing: ${missingOptionalTables.join(', ')}`);
  }

  return schemaCache;
}

/**
 * Check if a specific table exists in the database
 */
export function tableExists(tableName: string): boolean {
  if (!schemaCache.initialized) {
    console.warn(`Schema not initialized. Call introspectSchema() first.`);
    return false;
  }

  return schemaCache.tables.get(tableName)?.exists || false;
}

/**
 * Get all existing tables
 */
export function getExistingTables(): string[] {
  if (!schemaCache.initialized) {
    return [];
  }

  return Array.from(schemaCache.tables.entries())
    .filter(([_, schema]) => schema.exists)
    .map(([name, _]) => name);
}

/**
 * Get all missing tables
 */
export function getMissingTables(): string[] {
  if (!schemaCache.initialized) {
    return [];
  }

  return Array.from(schemaCache.tables.entries())
    .filter(([_, schema]) => !schema.exists)
    .map(([name, _]) => name);
}

/**
 * Check if all critical tables are available
 */
export function areCriticalTablesAvailable(): boolean {
  if (!schemaCache.initialized) {
    console.warn(`Schema not initialized. Call introspectSchema() first.`);
    return false;
  }

  return CRITICAL_TABLES.every(tableName => tableExists(tableName));
}

/**
 * Get missing critical tables
 */
export function getMissingCriticalTables(): string[] {
  if (!schemaCache.initialized) {
    return CRITICAL_TABLES;
  }

  return CRITICAL_TABLES.filter(tableName => !tableExists(tableName));
}

/**
 * Reset the schema cache (useful for testing or forcing re-introspection)
 */
export function resetSchemaCache(): void {
  schemaCache = {
    tables: new Map(),
    initialized: false
  };
}

/**
 * Safe table query - only attempts to query if table exists
 */
export async function safeTableQuery<T>(
  tableName: string,
  queryBuilder: (table: any) => Promise<{ data: T[] | null; error: any }>
): Promise<T[]> {
  if (!tableExists(tableName)) {
    console.log(`⚠️ Skipping query for non-existent table: ${tableName}`);
    return [];
  }

  try {
    const result = await queryBuilder(supabase.from(tableName));

    if (result.error) {
      console.error(`❌ Error querying ${tableName}:`, result.error);
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error(`❌ Exception querying ${tableName}:`, error);
    return [];
  }
}