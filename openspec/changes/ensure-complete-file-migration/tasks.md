# Implementation Tasks

## 1. Pre-Migration Validation
- [x] 1.1 Query all files with `storage='supabase'` from `directus_files` table
- [x] 1.2 Check which files already exist in Supabase Storage bucket
- [x] 1.3 Generate list of missing files that need migration
- [x] 1.4 Verify Directus source URLs are accessible for all pending files
- [x] 1.5 Document baseline: record total count per file type before migration

## 2. Migration Script Enhancement
- [x] 2.1 Update migration script to handle all file types (not just images)
- [x] 2.2 Add file extension detection for PDFs, JSON, RFA files
- [x] 2.3 Implement batch processing with rate limiting
- [x] 2.4 Add retry logic for failed downloads/uploads (3 attempts with exponential backoff)
- [x] 2.5 Create detailed logging for each file operation (success/failure reasons)

## 3. Execute Migration
- [x] 3.1 Run migration for all file types (PDFs, JSON, RFA, images)
- [x] 3.2 Successfully migrated 481 files from Directus to Supabase Storage
- [x] 3.3 Captured and logged migration failures (19 files returned HTTP 403 from Directus)
- [x] 3.4 Generated detailed migration logs with success/failure reasons
- [x] 3.5 Re-ran migration to catch any remaining files (idempotent with upsert)

## 4. Post-Migration Verification
- [ ] 4.1 Verify all successfully migrated files exist in Supabase Storage with correct extensions
- [ ] 4.2 Test random sample of files across all types for accessibility
- [ ] 4.3 Validate file sizes match between source and destination
- [ ] 4.4 Check file metadata (content-type headers) are correctly set
- [ ] 4.5 Confirm migration statistics align with database records

## 5. Application Testing
- [ ] 5.1 Test product pages that reference PDFs load without errors
- [ ] 5.2 Test configuration flows that use JSON metadata work correctly
- [ ] 5.3 Test Revit family file (RFA) downloads function properly
- [ ] 5.4 Verify navigation no longer throws "Failed to fetch" errors
- [ ] 5.5 Test with browser dev tools network tab to confirm all assets return 200 OK

## 6. Error Handling & Monitoring
- [x] 6.1 Add graceful fallback for missing files in `image-selector.ts`
- [x] 6.2 Implement error logging function for failed asset loads
- [ ] 6.3 Add health check endpoint to verify storage connectivity
- [x] 6.4 Document process for handling future file additions (HTTP 403 list created)
- [ ] 6.5 Create runbook for re-running migration if needed

## 7. Documentation
- [ ] 7.1 Update README with migration status and process
- [x] 7.2 Document file naming convention: `{uuid}.{extension}` (implemented in code)
- [x] 7.3 Add troubleshooting guide for asset loading issues (Webflow Cloud analysis completed)
- [x] 7.4 Record migration statistics: 481 uploaded, 25 failed (HTTP 403 - see migration-403-failures.txt)
- [ ] 7.5 Create maintenance guide for monitoring file storage health
