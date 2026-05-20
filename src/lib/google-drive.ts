import { google } from "googleapis";
import { Readable } from "stream";

// Helper to convert Buffer to ReadableStream for Google Drive API
function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// Authenticate with Google
function getDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // 1. Support OAuth2 user credentials (if refresh token is provided)
  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: "v3", auth: oauth2Client });
  }

  // 2. Support Service Account JSON string
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (jsonStr) {
    const credentials = JSON.parse(jsonStr);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    return google.drive({ version: "v3", auth });
  }

  // 3. Support Service Account Email & Private Key
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (email && privateKey) {
    const credentials = { client_email: email, private_key: privateKey };
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    return google.drive({ version: "v3", auth });
  }

  throw new Error("Missing Google Drive credentials in environment variables.");
}

async function getOrCreateDriveFolder(drive: any, folderName: string, parentId: string) {
  // Check if folder exists
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id; // Return existing folder ID
  }

  // Create folder if it doesn't exist
  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  return folder.data.id;
}

export async function getOrCreateDrivePath(drive: any, rootId: string, path: string[]) {
  let currentParentId = rootId;
  for (const folderName of path) {
    if (!folderName) continue;
    currentParentId = await getOrCreateDriveFolder(drive, folderName, currentParentId);
  }
  return currentParentId;
}

export async function uploadPdfToGoogleDrive(
  file: File | Buffer,
  fileName: string,
  mimeType: string = "application/pdf",
  path: string[] = []
) {
  const drive = getDriveClient();
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!rootFolderId) {
    throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID in environment variables.");
  }

  // Resolve target folder based on the path array
  const targetFolderId = await getOrCreateDrivePath(drive, rootFolderId, path);

  let buffer: Buffer;
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  const fileMetadata = {
    name: fileName,
    parents: [targetFolderId],
  };

  const media = {
    mimeType: mimeType,
    body: bufferToStream(buffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
  });

  return response.data;
}

export async function makeGoogleDriveFilePublic(fileId: string) {
  const drive = getDriveClient();
  
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });
}

export async function deleteFileFromGoogleDrive(fileId: string) {
  const drive = getDriveClient();
  try {
    await drive.files.delete({ fileId });
  } catch (error: any) {
    // If file is already deleted or not found, we can log and ignore safely
    console.error(`Failed to delete Google Drive file ${fileId}:`, error.message);
  }
}

export function getGoogleDrivePreviewUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getGoogleDriveViewUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

// ─── Bulk Upload Helpers ───────────────────────────────────────

/** Export the drive client for direct use in bulk upload route */
export function getDriveClientExported() {
  return getDriveClient();
}

/** Check if a file with the given name already exists in a folder */
export async function checkFileExistsInFolder(
  drive: any,
  folderId: string,
  fileName: string
): Promise<{ exists: boolean; existingId?: string }> {
  const res = await drive.files.list({
    q: `name='${fileName.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files && res.data.files.length > 0) {
    return { exists: true, existingId: res.data.files[0].id };
  }
  return { exists: false };
}

/** Upload a PDF to Google Drive with exponential backoff retry on 403/500 errors */
export async function uploadPdfWithRetry(
  drive: any,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string,
  maxRetries: number = 3
): Promise<{ id: string; webViewLink?: string; webContentLink?: string }> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType,
        body: bufferToStream(buffer),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, webViewLink, webContentLink",
      });

      return response.data;
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status || error?.code;

      if (status === 404) {
        // Folder was deleted mid-upload; caller should re-create and retry
        throw new Error(`DRIVE_404: Target folder not found. It may have been deleted.`);
      }

      if (status === 409) {
        // Conflict — duplicate; try to find existing file
        const existing = await checkFileExistsInFolder(drive, folderId, fileName);
        if (existing.exists && existing.existingId) {
          return { id: existing.existingId };
        }
        throw error;
      }

      // Retry on 403 (rate limit) and 500 (server error) with exponential backoff
      if ((status === 403 || status === 500) && attempt < maxRetries) {
        const waitMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`Drive API ${status} error, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/** Set custom properties on a Drive file (title, description as appProperties) */
export async function setDriveFileProperties(
  drive: any,
  fileId: string,
  properties: Record<string, string>
): Promise<void> {
  try {
    await drive.files.update({
      fileId,
      requestBody: {
        appProperties: properties,
      },
    });
  } catch (error: any) {
    console.error(`Failed to set properties on Drive file ${fileId}:`, error.message);
    // Non-critical — don't throw
  }
}
