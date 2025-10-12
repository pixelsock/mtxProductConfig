#!/usr/bin/env tsx
/**
 * Migration Script: Upload Missing Images to Supabase Storage
 *
 * This script migrates files from Directus to Supabase Storage.
 * It downloads files from Directus and uploads them to the directus-uploads bucket
 * in Supabase Storage using the format: {uuid}.{extension}
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

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://pim.dude.digital';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'directus-uploads';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface DirectusFile {
  id: string;
  filename_disk: string;
  type: string;
  storage: string;
}

interface MigrationStats {
  total: number;
  alreadyExists: number;
  downloaded: number;
  uploaded: number;
  failed: number;
  skipped: number;
}

/**
 * Get the file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/webp': '.webp',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/avif': '.avif',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/json': '.json',
  };
  return map[mimeType] || '';
}

/**
 * Get the file extension from filename_disk or type
 */
function getFileExtension(file: DirectusFile): string {
  // Try to extract from filename_disk first
  const match = file.filename_disk.match(/\.([^.]+)$/);
  if (match) {
    return `.${match[1]}`;
  }

  // Fall back to MIME type
  return getExtensionFromMimeType(file.type);
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
    console.error(`   ❌ Error checking if file exists: ${error.message}`);
    return false;
  }

  return data.length > 0;
}

/**
 * Download a file from Directus
 */
async function downloadFromDirectus(fileId: string): Promise<ArrayBuffer | null> {
  const url = `${DIRECTUS_URL}/assets/${fileId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Supabase-Migration-Script/1.0'
      }
    });

    if (!response.ok) {
      console.error(`   ❌ HTTP ${response.status} from Directus`);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error(`   ❌ Download failed:`, error);
    return null;
  }
}

/**
 * Upload a file to Supabase Storage
 */
async function uploadToSupabase(
  filename: string,
  fileData: ArrayBuffer,
  contentType: string
): Promise<boolean> {
  const { error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(filename, fileData, {
      contentType,
      cacheControl: 'no-cache',
      upsert: false
    });

  if (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    return false;
  }

  return true;
}

/**
 * Migrate a single file
 */
async function migrateFile(file: DirectusFile, stats: MigrationStats): Promise<void> {
  const extension = getFileExtension(file);

  if (!extension) {
    console.log(`⚠️  ${file.id} - No extension found (type: ${file.type}), skipping`);
    stats.skipped++;
    return;
  }

  const filename = `${file.id}${extension}`;
  console.log(`\n📄 Processing: ${filename}`);
  console.log(`   Type: ${file.type}`);

  // Check if already exists
  const exists = await fileExistsInStorage(filename);
  if (exists) {
    console.log(`   ✅ Already exists in Supabase Storage`);
    stats.alreadyExists++;
    return;
  }

  // Download from Directus
  console.log(`   ⬇️  Downloading from Directus...`);
  const fileData = await downloadFromDirectus(file.id);

  if (!fileData) {
    console.log(`   ❌ Download failed`);
    stats.failed++;
    return;
  }

  stats.downloaded++;
  console.log(`   ✅ Downloaded (${(fileData.byteLength / 1024).toFixed(2)} KB)`);

  // Upload to Supabase
  console.log(`   ⬆️  Uploading to Supabase Storage...`);
  const uploaded = await uploadToSupabase(filename, fileData, file.type);

  if (uploaded) {
    console.log(`   ✅ Uploaded successfully`);
    stats.uploaded++;
  } else {
    console.log(`   ❌ Upload failed`);
    stats.failed++;
  }
}

/**
 * Main migration function
 */
async function migrate(options: {
  limit?: number;
  dryRun?: boolean;
  imagesOnly?: boolean;
}) {
  console.log('\n🚀 Starting Directus → Supabase Storage Migration\n');
  console.log(`Configuration:`);
  console.log(`  Directus URL: ${DIRECTUS_URL}`);
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
  console.log(`  Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`  Limit: ${options.limit || 'none'}`);
  console.log(`  Dry Run: ${options.dryRun ? 'yes' : 'no'}`);
  console.log(`  Images Only: ${options.imagesOnly ? 'yes' : 'no'}\n`);

  // Get all files marked as storage='supabase' from directus_files
  let query = supabase
    .from('directus_files')
    .select('id, filename_disk, type, storage')
    .eq('storage', 'supabase');

  if (options.imagesOnly) {
    query = query.like('type', 'image/%');
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data: files, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch files from database:', error);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log('✅ No files to migrate');
    return;
  }

  console.log(`📊 Found ${files.length} files to process\n`);

  if (options.dryRun) {
    console.log('🏃 DRY RUN MODE - No files will be uploaded\n');
    files.slice(0, 10).forEach(file => {
      const ext = getFileExtension(file as DirectusFile);
      console.log(`   ${file.id}${ext} (${file.type})`);
    });
    if (files.length > 10) {
      console.log(`   ... and ${files.length - 10} more`);
    }
    return;
  }

  const stats: MigrationStats = {
    total: files.length,
    alreadyExists: 0,
    downloaded: 0,
    uploaded: 0,
    failed: 0,
    skipped: 0
  };

  // Process each file
  for (const file of files) {
    await migrateFile(file as DirectusFile, stats);

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));
  console.log(`Total files processed:    ${stats.total}`);
  console.log(`Already existed:          ${stats.alreadyExists}`);
  console.log(`Downloaded:               ${stats.downloaded}`);
  console.log(`Uploaded successfully:    ${stats.uploaded}`);
  console.log(`Failed:                   ${stats.failed}`);
  console.log(`Skipped:                  ${stats.skipped}`);
  console.log('='.repeat(50) + '\n');

  if (stats.failed > 0) {
    console.log('⚠️  Some files failed to migrate. Check the logs above for details.\n');
  } else {
    console.log('✅ Migration completed successfully!\n');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : undefined,
  dryRun: args.includes('--dry-run'),
  imagesOnly: args.includes('--images-only')
};

// Run migration
migrate(options).catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
