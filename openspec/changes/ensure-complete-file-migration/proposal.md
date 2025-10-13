# Ensure Complete File Migration to Supabase Storage

## Why

The application is experiencing "Failed to fetch" errors because file references in the database point to Supabase Storage, but not all files have been migrated from Directus. There are 595 non-image files (PDFs, JSON, RFA files) marked with `storage='supabase'` in the `directus_files` table that haven't been uploaded to Supabase Storage yet. This causes the application to fail when trying to load these assets, breaking user experience and navigation flows.

## What Changes

- **Complete migration** of all remaining files (595 non-image files) from Directus to Supabase Storage
- **Verification system** to ensure all files marked as `storage='supabase'` actually exist in Supabase Storage
- **Error handling** to gracefully handle missing files and provide clear diagnostics
- **Migration validation** to confirm file integrity and accessibility after migration
- **Comprehensive logging** to track migration progress and identify failures

Affected file types:
- PDFs: 147 files (product documentation, spec sheets)
- JSON: 296 files (configuration data, metadata)
- RFA: 152 files (Revit family files)

## Impact

### Affected Specs
- **asset-storage** (new capability): File storage and retrieval system

### Affected Code
- `scripts/migrate-images-to-supabase.ts` - Migration script (needs to handle all file types)
- `src/services/image-selector.ts` - Asset URL construction
- `src/services/supabase.ts` - Supabase client configuration
- Database: `directus_files` table (595 rows need validation)
- Supabase Storage: `directus-uploads` bucket

### User Impact
- **Current**: Application crashes with "Failed to fetch" errors when accessing products with unmigrated file references
- **After Fix**: All product assets load reliably, navigation works smoothly
- **No breaking changes**: Existing migrated files continue to work

### Migration Risk
- Low risk: Files are being copied, not moved (original Directus files remain as backup)
- Rollback plan: Database records can be reverted to `storage='directus'` if needed
