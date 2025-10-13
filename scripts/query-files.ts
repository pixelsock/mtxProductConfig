#!/usr/bin/env tsx
/**
 * Query Script: Check directus_files table for file information and migration status
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Database } from '../supabase';

// Load environment variables from .env.local
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  // .env.local not found, try .env
  try {
    const envPath = join(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    // Continue with existing env vars
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Query 1: Get specific file information
 */
async function querySpecificFile(fileId: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Query 1: File Information for ID: ${fileId}`);
  console.log('='.repeat(70));

  const { data, error } = await supabase
    .from('directus_files')
    .select('id, filename_disk, type, storage')
    .eq('id', fileId)
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!data) {
    console.log('⚠️  File not found');
    return;
  }

  console.log('\nFile Details:');
  console.log(`  ID:            ${data.id}`);
  console.log(`  Filename:      ${data.filename_disk}`);
  console.log(`  Type:          ${data.type}`);
  console.log(`  Storage:       ${data.storage}`);
}

/**
 * Query 2: Count non-image files still needing migration
 */
async function countNonImageFiles() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('Query 2: Count of Non-Image Files with storage="supabase"');
  console.log('='.repeat(70));

  const { count, error } = await supabase
    .from('directus_files')
    .select('*', { count: 'exact', head: true })
    .eq('storage', 'supabase')
    .not('type', 'like', 'image/%');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`\nTotal non-image files needing migration: ${count}`);
}

/**
 * Query 3: Group non-image files by type
 */
async function groupNonImageFilesByType() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('Query 3: Non-Image Files Grouped by Type');
  console.log('='.repeat(70));

  // Supabase doesn't support GROUP BY directly in the client library,
  // so we'll fetch all non-image files and group them in memory
  const { data, error } = await supabase
    .from('directus_files')
    .select('id, filename_disk, type, storage')
    .eq('storage', 'supabase')
    .not('type', 'like', 'image/%');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('\n✅ No non-image files found with storage="supabase"');
    return;
  }

  // Group by type
  const grouped = data.reduce((acc, file) => {
    const type = file.type || 'unknown';
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        files: []
      };
    }
    acc[type].count++;
    acc[type].files.push({
      id: file.id,
      filename: file.filename_disk || file.id
    });
    return acc;
  }, {} as Record<string, { count: number; files: Array<{ id: string; filename: string }> }>);

  console.log('\nFile Types Summary:');
  console.log('-'.repeat(70));

  // Sort by count descending
  const sortedTypes = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);

  for (const [type, info] of sortedTypes) {
    console.log(`\n📄 Type: ${type}`);
    console.log(`   Count: ${info.count}`);
    console.log(`   Files:`);

    // Show first 5 files for each type
    info.files.slice(0, 5).forEach(file => {
      console.log(`     - ${file.id} (${file.filename})`);
    });

    if (info.files.length > 5) {
      console.log(`     ... and ${info.files.length - 5} more`);
    }
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`Total: ${data.length} non-image files across ${sortedTypes.length} types`);
}

/**
 * Query 4: Sample of non-image files
 */
async function showSampleNonImageFiles(limit: number = 10) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Query 4: Sample of Non-Image Files (first ${limit})`);
  console.log('='.repeat(70));

  const { data, error } = await supabase
    .from('directus_files')
    .select('id, filename_disk, type, storage')
    .eq('storage', 'supabase')
    .not('type', 'like', 'image/%')
    .limit(limit);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('\n✅ No non-image files found');
    return;
  }

  console.log(`\nShowing ${data.length} files:\n`);

  data.forEach((file, index) => {
    console.log(`${index + 1}. ${file.id}`);
    console.log(`   Filename: ${file.filename_disk}`);
    console.log(`   Type:     ${file.type}`);
    console.log(`   Storage:  ${file.storage}\n`);
  });
}

/**
 * Main function
 */
async function main() {
  console.log('\n🔍 Querying directus_files table...\n');

  // Run all queries
  await querySpecificFile('012ab2b2-727c-4818-a05c-5bd36260a7a3');
  await countNonImageFiles();
  await groupNonImageFilesByType();
  await showSampleNonImageFiles(10);

  console.log('\n✅ All queries completed!\n');
}

// Run queries
main().catch(error => {
  console.error('\n❌ Query failed:', error);
  process.exit(1);
});
