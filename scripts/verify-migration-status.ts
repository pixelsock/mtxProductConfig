#!/usr/bin/env tsx
/**
 * Verification Script: Check migration status and identify missing files
 *
 * This script:
 * 1. Queries all files marked with storage='supabase' in directus_files
 * 2. Checks which files actually exist in Supabase Storage
 * 3. Generates a list of missing files that need migration
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
  // .env.local not found, continue with existing env vars
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'directus-uploads';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface DirectusFile {
  id: string;
  filename_disk: string | null;
  type: string;
  storage: string;
}

interface MigrationStatus {
  totalMarkedForSupabase: number;
  existingInStorage: number;
  missingFromStorage: number;
  missingFiles: Array<{
    id: string;
    filename: string;
    type: string;
    expectedFilename: string;
  }>;
  byType: Record<string, {
    total: number;
    existing: number;
    missing: number;
  }>;
}

/**
 * Get file extension from filename_disk or MIME type
 */
function getFileExtension(file: DirectusFile): string {
  // Try filename_disk first
  if (file.filename_disk) {
    const match = file.filename_disk.match(/\.([^.]+)$/);
    if (match) {
      return `.${match[1]}`;
    }
  }

  // Fallback to MIME type
  const mimeMap: Record<string, string> = {
    'image/webp': '.webp',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/avif': '.avif',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'application/octet-stream': '.rfa',
    'application/x-revit': '.rfa',
  };

  return mimeMap[file.type] || '';
}

/**
 * Check if a file exists in Supabase Storage
 */
async function fileExistsInStorage(filename: string): Promise<boolean> {
  const { data, error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .list('', {
      limit: 1,
      search: filename
    });

  if (error) {
    console.error(`   ⚠️  Error checking file ${filename}: ${error.message}`);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Main verification function
 */
async function verifyMigrationStatus(): Promise<MigrationStatus> {
  console.log('\n🔍 Verifying Migration Status\n');
  console.log(`Configuration:`);
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
  console.log(`  Storage Bucket: ${STORAGE_BUCKET}\n`);

  // Get all files marked for Supabase
  console.log('📊 Querying directus_files table...');
  const { data: files, error } = await supabase
    .from('directus_files')
    .select('id, filename_disk, type, storage')
    .eq('storage', 'supabase');

  if (error) {
    console.error('❌ Failed to fetch files from database:', error);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log('✅ No files marked for Supabase storage');
    return {
      totalMarkedForSupabase: 0,
      existingInStorage: 0,
      missingFromStorage: 0,
      missingFiles: [],
      byType: {}
    };
  }

  console.log(`   Found ${files.length} files marked with storage='supabase'\n`);

  const status: MigrationStatus = {
    totalMarkedForSupabase: files.length,
    existingInStorage: 0,
    missingFromStorage: 0,
    missingFiles: [],
    byType: {}
  };

  // Check each file
  console.log('🔎 Checking which files exist in Supabase Storage...');
  console.log('   (This may take a few minutes)\n');

  for (let i = 0; i < files.length; i++) {
    const file = files[i] as DirectusFile;
    const extension = getFileExtension(file);

    if (!extension) {
      console.log(`   ⚠️  ${file.id}: No extension found (type: ${file.type})`);
      continue;
    }

    const expectedFilename = `${file.id}${extension}`;
    const exists = await fileExistsInStorage(expectedFilename);

    // Initialize type stats if needed
    if (!status.byType[file.type]) {
      status.byType[file.type] = { total: 0, existing: 0, missing: 0 };
    }
    status.byType[file.type].total++;

    if (exists) {
      status.existingInStorage++;
      status.byType[file.type].existing++;
    } else {
      status.missingFromStorage++;
      status.byType[file.type].missing++;
      status.missingFiles.push({
        id: file.id,
        filename: file.filename_disk || 'unknown',
        type: file.type,
        expectedFilename
      });
    }

    // Progress indicator
    if ((i + 1) % 50 === 0) {
      console.log(`   Checked ${i + 1}/${files.length} files...`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return status;
}

/**
 * Print detailed report
 */
function printReport(status: MigrationStatus) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 Migration Status Report');
  console.log('='.repeat(70));

  console.log(`\nOverall Status:`);
  console.log(`  Total files marked for Supabase:  ${status.totalMarkedForSupabase}`);
  console.log(`  Files existing in Storage:        ${status.existingInStorage} ✅`);
  console.log(`  Files missing from Storage:       ${status.missingFromStorage} ❌`);

  const percentage = status.totalMarkedForSupabase > 0
    ? ((status.existingInStorage / status.totalMarkedForSupabase) * 100).toFixed(1)
    : '0.0';
  console.log(`  Migration Progress:               ${percentage}%`);

  console.log(`\nBreakdown by File Type:`);
  console.log('-'.repeat(70));

  const sortedTypes = Object.entries(status.byType)
    .sort((a, b) => b[1].missing - a[1].missing);

  for (const [type, stats] of sortedTypes) {
    const typePercentage = ((stats.existing / stats.total) * 100).toFixed(1);
    console.log(`\n📄 ${type}`);
    console.log(`   Total:    ${stats.total}`);
    console.log(`   Existing: ${stats.existing} ✅`);
    console.log(`   Missing:  ${stats.missing} ❌`);
    console.log(`   Progress: ${typePercentage}%`);
  }

  if (status.missingFiles.length > 0) {
    console.log(`\n\nMissing Files (first 20):`);
    console.log('-'.repeat(70));

    status.missingFiles.slice(0, 20).forEach((file, index) => {
      console.log(`${index + 1}. ${file.expectedFilename}`);
      console.log(`   ID:       ${file.id}`);
      console.log(`   Type:     ${file.type}`);
      console.log(`   Original: ${file.filename}\n`);
    });

    if (status.missingFiles.length > 20) {
      console.log(`   ... and ${status.missingFiles.length - 20} more missing files`);
    }
  }

  console.log('\n' + '='.repeat(70));

  if (status.missingFromStorage === 0) {
    console.log('✅ All files successfully migrated!\n');
  } else {
    console.log(`⚠️  ${status.missingFromStorage} files need to be migrated\n`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const status = await verifyMigrationStatus();
    printReport(status);
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
main();
