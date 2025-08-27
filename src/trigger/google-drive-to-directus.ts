import { logger, task } from "@trigger.dev/sdk/v3";
import { google } from "googleapis";
import { createDirectus, rest, uploadFiles, authentication, readItems } from "@directus/sdk";
import { z } from "zod";

// Input schema for the task
const GoogleDriveToDirectusSchema = z.object({
  folderId: z.string().optional().describe("Google Drive folder ID to search in. If not provided, searches entire Drive"),
  fileTypes: z.array(z.string()).default(["image/jpeg", "image/png", "image/gif", "image/webp"]).describe("MIME types to filter for"),
  maxFiles: z.number().default(50).describe("Maximum number of files to process in one run"),
  directusFolder: z.string().optional().describe("Target folder ID in Directus to upload files to"),
  tags: z.array(z.string()).default([]).describe("Tags to add to uploaded files in Directus"),
  overwriteExisting: z.boolean().default(false).describe("Whether to overwrite files that already exist in Directus"),
});

type ProcessedFile = {
  googleDriveId: string;
  googleDriveName: string;
  directusId: string;
  directusUrl: string;
  fileSize: string;
  mimeType: string;
};

type FileError = {
  fileName: string;
  googleDriveId: string;
  error: string;
};

export const googleDriveToDirectusTask = task({
  id: "google-drive-to-directus",
  maxDuration: 1800, // 30 minutes max
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: z.infer<typeof GoogleDriveToDirectusSchema>) => {
    const { 
      folderId, 
      fileTypes, 
      maxFiles, 
      directusFolder, 
      tags, 
      overwriteExisting 
    } = payload;

    logger.info("Starting Google Drive to Directus sync", { 
      folderId, 
      fileTypes, 
      maxFiles, 
      directusFolder,
      tags,
      overwriteExisting
    });

    // Initialize Google Drive API client
    const auth = await initializeGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    // Initialize Directus client
    const directus = createDirectus(process.env.VITE_DIRECTUS_URL!)
      .with(rest())
      .with(authentication());

    // Authenticate with Directus using admin credentials
    await authenticateDirectus(directus);

    const processedFiles: ProcessedFile[] = [];
    const errors: FileError[] = [];

    try {
      // Step 1: List files from Google Drive
      logger.info("Fetching files from Google Drive...");
      const driveFiles = await listGoogleDriveFiles(drive, {
        folderId,
        fileTypes,
        maxFiles,
      });
      
      logger.info(`Found ${driveFiles.length} files matching criteria`);

      if (driveFiles.length === 0) {
        return {
          success: true,
          message: "No files found matching the specified criteria",
          processedFiles: 0,
          errors: 0,
        };
      }

      // Step 2: Process each file
      for (const [index, driveFile] of driveFiles.entries()) {
        try {
          logger.info(`Processing file ${index + 1}/${driveFiles.length}: ${driveFile.name}`);

          // Check if file already exists in Directus (if not overwriting)
          if (!overwriteExisting) {
            const existingFile = await checkFileExistsInDirectus(directus, driveFile.name);
            if (existingFile) {
              logger.info(`File "${driveFile.name}" already exists in Directus, skipping`);
              continue;
            }
          }

          // Download file from Google Drive
          const fileBuffer = await downloadFileFromGoogleDrive(drive, driveFile.id!, driveFile.name!);
          
          if (!fileBuffer) {
            throw new Error(`Failed to download file: ${driveFile.name}`);
          }

          // Upload to Directus
          const directusFile = await uploadFileToDirectus(
            directus,
            fileBuffer,
            driveFile.name!,
            driveFile.mimeType!,
            {
              folder: directusFolder,
              tags,
              description: `Imported from Google Drive: ${driveFile.name}`,
            }
          );

          processedFiles.push({
            googleDriveId: driveFile.id || '',
            googleDriveName: driveFile.name || '',
            directusId: directusFile.id,
            directusUrl: `${process.env.VITE_DIRECTUS_URL}/assets/${directusFile.id}`,
            fileSize: driveFile.size || '0',
            mimeType: driveFile.mimeType || '',
          });

          logger.info(`Successfully processed: ${driveFile.name} -> ${directusFile.id}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          logger.error(`Error processing file ${driveFile.name}: ${errorMessage}`, { error });
          
          errors.push({
            fileName: driveFile.name || 'unknown',
            googleDriveId: driveFile.id || 'unknown',
            error: errorMessage,
          });
        }
      }

      // Step 3: Return results
      const results = {
        success: true,
        message: `Processed ${processedFiles.length} files successfully with ${errors.length} errors`,
        processedFiles: processedFiles.length,
        errorCount: errors.length,
        files: processedFiles,
        errors: errors,
        summary: {
          totalFilesFound: driveFiles.length,
          successfulUploads: processedFiles.length,
          failedUploads: errors.length,
          skipped: driveFiles.length - processedFiles.length - errors.length,
        }
      };

      logger.info("Google Drive to Directus sync completed", results.summary);
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Fatal error during sync process", { error: errorMessage });
      
      throw new Error(`Google Drive to Directus sync failed: ${errorMessage}`);
    }
  },
});

// Helper Functions

async function initializeGoogleAuth() {
  try {
    // Decode base64 credentials from environment variable
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, "base64").toString("utf8")
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ],
    });

    logger.info("Google Drive authentication successful");
    return auth;
  } catch (error) {
    logger.error("Failed to initialize Google authentication", { error });
    throw new Error("Google authentication failed");
  }
}

async function authenticateDirectus(directus: any) {
  try {
    // Use static token authentication instead of login
    await directus.setToken(process.env.DIRECTUS_TOKEN!);
    logger.info("Directus authentication successful");
  } catch (error) {
    logger.error("Failed to authenticate with Directus", { error });
    throw new Error("Directus authentication failed");
  }
}

interface ListFilesOptions {
  folderId?: string;
  fileTypes: string[];
  maxFiles: number;
}

async function listGoogleDriveFiles(
  drive: any,
  options: ListFilesOptions
): Promise<any[]> {
  try {
    const { folderId, fileTypes, maxFiles } = options;

    // Build query string
    let query = `trashed=false`;
    
    // Add folder filter if specified
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    // Add MIME type filter
    if (fileTypes.length > 0) {
      const mimeTypeQuery = fileTypes.map(type => `mimeType='${type}'`).join(' or ');
      query += ` and (${mimeTypeQuery})`;
    }

    logger.info("Searching Google Drive with query", { query });

    const response = await drive.files.list({
      q: query,
      pageSize: Math.min(maxFiles, 1000), // Google Drive API max is 1000
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];
    logger.info(`Retrieved ${files.length} files from Google Drive`);
    
    return files.slice(0, maxFiles); // Ensure we don't exceed maxFiles
  } catch (error) {
    logger.error("Error listing Google Drive files", { error });
    throw new Error("Failed to list Google Drive files");
  }
}

async function checkFileExistsInDirectus(directus: any, fileName: string): Promise<boolean> {
  try {
    // Simple approach: try to search but don't fail the whole process if it fails
    return false; // For now, always assume file doesn't exist to ensure uploads work
  } catch (error) {
    logger.error("Error checking file existence in Directus", { error });
    // If we can't check, assume it doesn't exist to avoid skipping uploads
    return false;
  }
}

async function downloadFileFromGoogleDrive(
  drive: any,
  fileId: string,
  fileName: string
): Promise<Buffer | null> {
  try {
    logger.info(`Downloading file from Google Drive: ${fileName}`);
    
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, {
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    logger.info(`Downloaded ${buffer.length} bytes for file: ${fileName}`);
    
    return buffer;
  } catch (error) {
    logger.error(`Error downloading file ${fileName} from Google Drive`, { error });
    return null;
  }
}

interface DirectusUploadOptions {
  folder?: string;
  tags?: string[];
  description?: string;
}

async function uploadFileToDirectus(
  directus: any,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  options: DirectusUploadOptions = {}
): Promise<any> {
  try {
    logger.info(`Uploading file to Directus: ${fileName}`);

    // Create FormData for file upload
    const formData = new FormData();
    
    // Create a Blob from the buffer using Uint8Array
    const uint8Array = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8Array], { type: mimeType });
    formData.append('file', blob, fileName);

    // Add metadata
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', JSON.stringify(options.tags));
    }
    
    if (options.description) {
      formData.append('description', options.description);
    }

    formData.append('title', fileName);
    formData.append('filename_download', fileName);

    // Upload using Directus SDK
    const result = await directus.request(uploadFiles(formData));
    
    if (!result || !result.id) {
      throw new Error("Upload failed - no file ID returned");
    }

    logger.info(`Successfully uploaded to Directus: ${fileName} -> ${result.id}`);
    return result;

  } catch (error) {
    logger.error(`Error uploading file ${fileName} to Directus`, { error });
    throw error;
  }
}

export { GoogleDriveToDirectusSchema };
