# Asset Storage Specification

## ADDED Requirements

### Requirement: File Migration Completeness

The system SHALL ensure all files marked with `storage='supabase'` in the `directus_files` table are present in Supabase Storage.

#### Scenario: Query unmigrated files

- **GIVEN** the `directus_files` table contains files with `storage='supabase'`
- **WHEN** a verification query is executed
- **THEN** the system SHALL return a list of file IDs that exist in the database but not in Supabase Storage
- **AND** the list SHALL include file type, filename, and size information

#### Scenario: All files migrated successfully

- **GIVEN** all files marked `storage='supabase'` have been uploaded
- **WHEN** verification query is executed
- **THEN** the system SHALL return an empty result set
- **AND** shall confirm total count of verified files

### Requirement: Multi-Format File Migration

The migration system SHALL support transferring files of all types from Directus to Supabase Storage, not limited to images.

#### Scenario: Migrate PDF document

- **GIVEN** a file with `type='application/pdf'` and `storage='supabase'`
- **WHEN** migration script processes the file
- **THEN** the file SHALL be downloaded from Directus as `{uuid}`
- **AND** SHALL be uploaded to Supabase Storage as `{uuid}.pdf`
- **AND** the content-type header SHALL be set to `application/pdf`

#### Scenario: Migrate JSON metadata file

- **GIVEN** a file with `type='application/json'` and `storage='supabase'`
- **WHEN** migration script processes the file
- **THEN** the file SHALL be uploaded to Supabase Storage as `{uuid}.json`
- **AND** SHALL be retrievable via public URL

#### Scenario: Migrate Revit family file

- **GIVEN** a file with `type='application/octet-stream'` or `type='application/x-revit'` and `filename_disk` ending in `.rfa`
- **WHEN** migration script processes the file
- **THEN** the file SHALL be uploaded to Supabase Storage as `{uuid}.rfa`
- **AND** SHALL preserve binary data integrity

### Requirement: File Extension Detection

The system SHALL determine the correct file extension for each migrated file using a priority-based approach.

#### Scenario: Extract extension from filename

- **GIVEN** a file with `filename_disk='product-spec.pdf'`
- **WHEN** determining file extension
- **THEN** the system SHALL extract `.pdf` from the filename
- **AND** SHALL use this extension when uploading to Supabase Storage

#### Scenario: Fallback to MIME type mapping

- **GIVEN** a file with `filename_disk=NULL` but `type='application/pdf'`
- **WHEN** determining file extension
- **THEN** the system SHALL map MIME type to `.pdf` extension
- **AND** SHALL use this extension for upload

#### Scenario: Handle unknown file type

- **GIVEN** a file with `type='application/octet-stream'` and `filename_disk=NULL`
- **WHEN** determining file extension
- **THEN** the system SHALL log a warning
- **AND** SHALL skip the file in migration
- **AND** SHALL include it in the failure report

### Requirement: Idempotent Migration

The migration process SHALL be safely re-runnable without causing duplicates or errors.

#### Scenario: Skip already migrated file

- **GIVEN** a file is already present in Supabase Storage as `{uuid}.pdf`
- **WHEN** migration script processes the same file UUID
- **THEN** the system SHALL detect existing file via storage API
- **AND** SHALL skip download and upload steps
- **AND** SHALL log "already migrated" status

#### Scenario: Resume after partial failure

- **GIVEN** migration was interrupted after processing 100 of 595 files
- **WHEN** migration script is re-executed
- **THEN** the system SHALL skip the 100 already-migrated files
- **AND** SHALL continue with remaining 495 files
- **AND** SHALL complete without errors

### Requirement: Error Logging and Reporting

The migration system SHALL provide detailed logging for all file operations and generate a summary report.

#### Scenario: Log successful file migration

- **GIVEN** a file is successfully migrated
- **WHEN** upload completes
- **THEN** the system SHALL log: file ID, filename, type, size, and success status
- **AND** the log format SHALL be: `✅ [TYPE] {uuid}.{ext} - {size} KB`

#### Scenario: Log failed download

- **GIVEN** Directus returns HTTP 404 for a file
- **WHEN** download fails
- **THEN** the system SHALL log: file ID, error type, HTTP status code
- **AND** SHALL increment failed counter
- **AND** SHALL continue processing next file

#### Scenario: Generate migration summary report

- **GIVEN** migration script has processed all files
- **WHEN** script completes
- **THEN** the system SHALL output a summary report containing:
  - Total files processed
  - Successfully migrated count
  - Failed count with reasons
  - Skipped count (already existed)
- **AND** report SHALL be saved to `migration-report-{timestamp}.log`

### Requirement: Post-Migration Verification

The system SHALL verify file accessibility and integrity after migration.

#### Scenario: Verify file exists in storage

- **GIVEN** a file was uploaded to Supabase Storage
- **WHEN** post-upload verification runs
- **THEN** the system SHALL make HEAD request to public URL
- **AND** SHALL confirm HTTP 200 response
- **AND** SHALL validate content-length header matches source file size

#### Scenario: Verify all database references

- **GIVEN** all files marked `storage='supabase'`
- **WHEN** bulk verification script runs
- **THEN** the system SHALL query Supabase Storage for each file UUID
- **AND** SHALL report any missing files
- **AND** SHALL generate list of IDs requiring re-migration

### Requirement: Asset URL Construction

The application SHALL construct correct public URLs for all file types stored in Supabase Storage.

#### Scenario: Build URL for PDF file

- **GIVEN** a product references file UUID `012ab2b2-727c-4818-a05c-5bd36260a7a3` with `type='application/pdf'`
- **WHEN** constructing asset URL
- **THEN** the system SHALL build URL: `{supabase-url}/storage/v1/object/public/directus-uploads/012ab2b2-727c-4818-a05c-5bd36260a7a3.pdf`
- **AND** the URL SHALL be publicly accessible without authentication

#### Scenario: Graceful fallback for missing file

- **GIVEN** a file UUID is referenced but doesn't exist in Supabase Storage
- **WHEN** attempting to load the asset
- **THEN** the system SHALL log error with file ID
- **AND** SHALL display placeholder or error message to user
- **AND** SHALL NOT throw unhandled exception that breaks navigation
