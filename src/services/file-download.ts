import { supabase } from './supabase';

export interface FileMetadata {
  id: string;
  filename_disk: string;
  filename_download: string;
  title?: string | null;
  description?: string | null;
  type: string;
  storage: string;
}

/**
 * Downloads a file with proper metadata-based filename
 * Opens the file in a new tab from Supabase Storage
 * @param fileRef File reference object with metadata
 * @param fallbackName Optional fallback filename if metadata is not available
 */
export async function downloadFileWithMetadata(
  fileRef: FileMetadata | string,
  fallbackName?: string
): Promise<void> {
  if (!fileRef) {
    console.error('No file reference provided for download');
    return;
  }

  let metadata: FileMetadata;

  // If we have a string ID, fetch the metadata from Directus
  if (typeof fileRef === 'string') {
    try {
      const { data, error } = await supabase
        .from('directus_files')
        .select('id, filename_disk, filename_download, title, description, type, storage')
        .eq('id', fileRef)
        .single();

      if (error) {
        console.error('Error fetching file metadata:', error);
        return;
      }

      metadata = data as FileMetadata;
    } catch (error) {
      console.error('Error fetching file metadata:', error);
      return;
    }
  } else {
    metadata = fileRef;
  }

  // Construct the Supabase Storage URL
  const storageUrl = constructStorageUrl(metadata);
  if (!storageUrl) {
    console.error('Could not construct storage URL for file:', metadata.id);
    return;
  }

  // Determine the download filename - prefer metadata, fall back to generic name
  const downloadFilename = getDownloadFilename(metadata, fallbackName);

  // Open the file directly in a new tab
  // The browser will handle displaying it (PDFs, images) or downloading it based on content type
  window.open(storageUrl, '_blank', 'noopener,noreferrer');

  console.log(`✅ File opened: ${downloadFilename} from ${storageUrl}`);
}

/**
 * Gets the appropriate download filename from metadata
 * @param metadata File metadata
 * @param fallbackName Optional fallback name
 * @returns Filename to use for download
 */
function getDownloadFilename(metadata: FileMetadata, fallbackName?: string): string {
  // Priority order:
  // 1. Use title if it looks like a filename (has extension)
  // 2. Use filename_download if available and not a UUID
  // 3. Use title + inferred extension
  // 4. Use fallback name
  // 5. Use filename_disk as last resort

  const extension = getFileExtension(metadata);
  
  // Check if title looks like a proper filename (has extension)
  if (metadata.title && hasFileExtension(metadata.title)) {
    return metadata.title;
  }
  
  // Use filename_download if it's not just a UUID
  if (metadata.filename_download && !isUuidFilename(metadata.filename_download)) {
    return metadata.filename_download;
  }
  
  // Use title + extension if title exists
  if (metadata.title) {
    return `${metadata.title}${extension}`;
  }
  
  // Use fallback name if provided
  if (fallbackName) {
    return hasFileExtension(fallbackName) ? fallbackName : `${fallbackName}${extension}`;
  }
  
  // Last resort: use filename_disk
  return metadata.filename_download || metadata.filename_disk;
}

/**
 * Constructs the Supabase Storage URL for a file
 * @param metadata File metadata
 * @returns Storage URL or null if cannot construct
 */
function constructStorageUrl(metadata: FileMetadata): string | null {
  if (metadata.storage !== 'supabase') {
    console.warn('File is not stored in Supabase storage:', metadata.storage);
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return null;
  }

  // Files in Supabase Storage are stored in the 'directus-uploads' bucket with their filename_disk
  return `${supabaseUrl}/storage/v1/object/public/directus-uploads/${metadata.filename_disk}`;
}

/**
 * Gets file extension from metadata
 * @param metadata File metadata
 * @returns File extension with dot (e.g., '.pdf')
 */
function getFileExtension(metadata: FileMetadata): string {
  // Try to get extension from filename_disk
  if (metadata.filename_disk) {
    const match = metadata.filename_disk.match(/\.([^.]+)$/);
    if (match) {
      return `.${match[1]}`;
    }
  }

  // Infer from MIME type
  switch (metadata.type) {
    case 'application/pdf':
      return '.pdf';
    case 'application/x-revit':
    case 'application/octet-stream':
      return '.rfa'; // Common for Revit files
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/avif':
      return '.avif';
    case 'application/json':
      return '.json';
    default:
      return '';
  }
}

/**
 * Checks if a filename has an extension
 * @param filename Filename to check
 * @returns True if filename has extension
 */
function hasFileExtension(filename: string): boolean {
  return /\.[^.]+$/.test(filename);
}

/**
 * Checks if a filename is a UUID (36 characters with dashes)
 * @param filename Filename to check
 * @returns True if filename appears to be a UUID
 */
function isUuidFilename(filename: string): boolean {
  // Remove extension if present
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  // Check if it's a UUID pattern (36 characters with 4 dashes)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nameWithoutExt);
}

/**
 * Quick download function for spec sheets (with proper naming)
 * @param specSheetFileRef Spec sheet file reference
 * @param productName Optional product name for fallback filename
 */
export async function downloadSpecSheet(
  specSheetFileRef: FileMetadata | string,
  productName?: string
): Promise<void> {
  const fallbackName = productName ? `${productName}_Spec_Sheet` : 'Spec_Sheet';
  await downloadFileWithMetadata(specSheetFileRef, fallbackName);
}

/**
 * Quick download function for Revit files (with proper naming)
 * @param revitFileRef Revit file reference
 * @param productName Optional product name for fallback filename
 */
export async function downloadRevitFile(
  revitFileRef: FileMetadata | string,
  productName?: string
): Promise<void> {
  const fallbackName = productName ? `${productName}_Revit_File` : 'Revit_File';
  await downloadFileWithMetadata(revitFileRef, fallbackName);
}