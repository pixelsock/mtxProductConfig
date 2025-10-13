# Technical Design: Complete File Migration to Supabase Storage

## Context

The application uses a hybrid asset storage system in transition:
- **Legacy**: Directus-hosted files at `https://pim.dude.digital/assets/{uuid}`
- **Target**: Supabase Storage at `{supabase-url}/storage/v1/object/public/directus-uploads/{uuid}.{ext}`

The `directus_files` table contains a `storage` field indicating intended location:
- `storage='directus'`: File still served from legacy Directus
- `storage='supabase'`: File should exist in Supabase Storage

**Problem**: 595 files marked `storage='supabase'` don't actually exist in Supabase Storage bucket yet, causing application errors.

**Constraints**:
- Cannot delete Directus files (maintain backup)
- Must preserve file UUIDs (database references)
- Zero downtime requirement (users shouldn't experience outages)
- Large file handling (some RFA files >10MB)

## Goals

1. Migrate all 595 remaining files to Supabase Storage
2. Ensure file integrity and accessibility
3. Provide comprehensive error logging
4. Enable verification of migration completeness

## Non-Goals

- Changing file UUIDs or database schema
- Optimizing image formats (that's a separate concern)
- Implementing CDN caching (future enhancement)
- Migrating files not marked for Supabase

## Decisions

### Decision 1: Enhanced Migration Script

**Approach**: Extend existing `migrate-images-to-supabase.ts` to handle all file types

**Why**:
- Already has infrastructure for Directus→Supabase transfer
- Maintains consistent naming: `{uuid}.{extension}`
- Reuses connection pooling and error handling

**Changes needed**:
```typescript
// Current: Only handles images with `type LIKE 'image/%'`
// New: Handle all file types with proper extension mapping

const extensionMap = {
  'application/pdf': '.pdf',
  'application/json': '.json',
  'application/octet-stream': '.rfa',  // Revit files
  'application/x-revit': '.rfa',
  // ... existing image types
};
```

**Alternatives considered**:
- ✗ Separate scripts per file type: More code duplication
- ✗ Manual upload via Supabase UI: Not scalable (595 files)

### Decision 2: File Extension Detection

**Approach**: Use `filename_disk` field as source of truth, fallback to MIME type

**Why**:
- `filename_disk` preserves original extension from upload
- MIME type can be ambiguous (e.g., `application/octet-stream` for RFA)
- Supabase Storage requires explicit extensions for proper content-type headers

**Implementation**:
```typescript
function getFileExtension(file: DirectusFile): string {
  // Priority 1: Extract from filename_disk
  if (file.filename_disk) {
    const match = file.filename_disk.match(/\.([^.]+)$/);
    if (match) return `.${match[1]}`;
  }

  // Priority 2: Map from MIME type
  return getExtensionFromMimeType(file.type);
}
```

### Decision 3: Batch Processing with Rate Limiting

**Approach**: Process files in batches of 10 with 100ms delay between files

**Why**:
- Directus API may have rate limits
- Supabase Storage has concurrent upload limits
- Prevents overwhelming network connections
- Allows monitoring progress in real-time

**Parameters**:
- Batch size: 10 files
- Inter-file delay: 100ms
- Retry attempts: 3
- Retry backoff: Exponential (1s, 2s, 4s)

### Decision 4: Verification Strategy

**Approach**: Multi-stage verification

1. **Pre-migration**: Check if file exists in Supabase before upload
2. **Post-upload**: Verify file is accessible via HEAD request
3. **Post-migration**: Bulk verification of all 595 files

**Why**:
- Idempotent: Can safely re-run migration
- Detects partial failures
- Provides confidence in completion

**SQL for verification**:
```sql
-- Find files marked supabase but not uploaded
SELECT df.id, df.filename_disk, df.type
FROM directus_files df
WHERE df.storage = 'supabase'
  AND NOT EXISTS (
    SELECT 1 FROM storage.objects so
    WHERE so.bucket_id = 'directus-uploads'
      AND so.name LIKE df.id || '%'
  );
```

### Decision 5: Error Handling

**Approach**: Log failures but continue processing

**Why**:
- One file failure shouldn't block entire migration
- Detailed logs enable targeted re-runs
- Provides visibility into systemic issues (e.g., Directus offline)

**Error categories**:
1. **Download failures**: Directus unreachable or file missing
2. **Upload failures**: Supabase Storage errors or quota limits
3. **Validation failures**: File size mismatch or corruption

**Logging format**:
```
❌ [PDF] 012ab2b2-727c-4818-a05c-5bd36260a7a3.pdf
   Download: HTTP 404 from Directus
   Action: Mark for manual review
```

## Risks & Trade-offs

### Risk 1: Directus Downtime During Migration
- **Likelihood**: Low (Directus is stable production system)
- **Impact**: High (migration would fail for all pending files)
- **Mitigation**: Run during low-traffic hours, implement retry logic

### Risk 2: Supabase Storage Quota
- **Likelihood**: Medium (595 files, some large RFA files)
- **Impact**: Medium (migration would pause at quota limit)
- **Mitigation**: Check quota before starting, monitor during migration

### Risk 3: File Corruption During Transfer
- **Likelihood**: Very Low (HTTP is reliable)
- **Impact**: High (broken files in production)
- **Mitigation**: Verify file size and hash post-upload

### Trade-off: Speed vs Safety

**Decision**: Prioritize safety over speed
- Slower processing (100ms delays) but higher reliability
- Verification steps add time but ensure correctness
- Users benefit from stable system, not fastest migration

## Migration Plan

### Phase 1: Preparation (No user impact)
1. Run dry-run to validate file access
2. Check Supabase Storage quota
3. Backup `directus_files` table snapshot

### Phase 2: Execution (Zero downtime)
1. Migrate PDFs (147 files, ~15 minutes)
2. Migrate JSON (296 files, ~30 minutes)
3. Migrate RFA (152 files, ~20 minutes)
4. Total estimated time: ~65 minutes

### Phase 3: Verification (User-facing improvements)
1. Run verification script
2. Test sample files from each type
3. Monitor application error logs for 24 hours

### Rollback Plan

If critical issues discovered post-migration:

1. **Option A - Revert storage field**:
   ```sql
   UPDATE directus_files
   SET storage = 'directus'
   WHERE storage = 'supabase'
     AND id IN (...failed_ids...);
   ```
   Application will fall back to Directus URLs.

2. **Option B - Fix in place**:
   Re-run migration for failed files only.

**RTO (Recovery Time Objective)**: <5 minutes
**RPO (Recovery Point Objective)**: Zero data loss (Directus files remain)

## Open Questions

1. **Q**: Should we implement parallel processing for faster migration?
   **A**: No - rate limiting is more important for system stability

2. **Q**: Do we need to validate file content (checksums)?
   **A**: File size comparison is sufficient for MVP, checksums in future enhancement

3. **Q**: How to handle files that fail after 3 retry attempts?
   **A**: Log to separate failure report, manual review required

4. **Q**: Should migration script support resume from checkpoint?
   **A**: Yes - script should skip files already in Storage (idempotent)
