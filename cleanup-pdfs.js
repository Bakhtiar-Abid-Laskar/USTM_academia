#!/usr/bin/env node

/**
 * USTM Academia — PDF Cleanup Script
 * Deletes all uploaded PDFs from Supabase storage and Google Drive
 * Usage: node cleanup-pdfs.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Initialize Supabase admin client (service role - has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Delete all PDFs from Supabase storage
 */
async function deleteFromSupabase() {
  console.log("\n📦 [SUPABASE] Fetching all files from storage...");

  try {
    const { data: files, error } = await supabase.storage
      .from("documents")
      .list("", { limit: 1000 });

    if (error) {
      throw error;
    }

    if (!files || files.length === 0) {
      console.log("✅ [SUPABASE] No files found in storage.");
      return;
    }

    console.log(`📦 [SUPABASE] Found ${files.length} file(s). Deleting...`);

    // Delete all files
    for (const file of files) {
      const { error: deleteError } = await supabase.storage
        .from("documents")
        .remove([file.name]);

      if (deleteError) {
        console.log(
          `❌ [SUPABASE] Failed to delete "${file.name}": ${deleteError.message}`
        );
      } else {
        console.log(`✅ [SUPABASE] Deleted "${file.name}"`);
      }
    }

    console.log(`✅ [SUPABASE] Successfully deleted ${files.length} file(s).`);
  } catch (error) {
    console.error("❌ [SUPABASE] Error during cleanup:", error.message);
  }
}

/**
 * Delete all documents from database
 */
async function deleteFromDatabase() {
  console.log("\n📊 [DATABASE] Deleting document records...");

  try {
    const { data: docs, error: fetchError } = await supabase
      .from("documents")
      .select("id, google_drive_file_id");

    if (fetchError) {
      throw fetchError;
    }

    if (!docs || docs.length === 0) {
      console.log("✅ [DATABASE] No documents found in database.");
      return;
    }

    console.log(`📊 [DATABASE] Found ${docs.length} document(s). Deleting...`);

    // Delete all document records
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ [DATABASE] Successfully deleted ${docs.length} document(s).`);
    
    // Return Google Drive file IDs for Google Drive cleanup
    return docs
      .filter((doc) => doc.google_drive_file_id)
      .map((doc) => doc.google_drive_file_id);
  } catch (error) {
    console.error("❌ [DATABASE] Error during cleanup:", error.message);
  }
}

/**
 * Delete files from Google Drive using googleapis
 */
async function deleteFromGoogleDrive(fileIds) {
  if (!fileIds || fileIds.length === 0) {
    console.log("✅ [GOOGLE DRIVE] No files to delete from Google Drive.");
    return;
  }

  console.log(
    `\n☁️  [GOOGLE DRIVE] Preparing to delete ${fileIds.length} file(s)...`
  );

  try {
    const { google } = require("googleapis");
    const fs = require("fs");

    // Read service account credentials
    const credentialsPath = path.join(
      process.cwd(),
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
        "ustm-academia-e2efc54ed855.json"
    );

    if (!fs.existsSync(credentialsPath)) {
      console.warn(
        `⚠️  [GOOGLE DRIVE] Credentials file not found at: ${credentialsPath}`
      );
      console.log(
        "⚠️  [GOOGLE DRIVE] Please ensure service account JSON is available for Google Drive cleanup."
      );
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Delete each file
    for (const fileId of fileIds) {
      try {
        await drive.files.delete({ fileId });
        console.log(`✅ [GOOGLE DRIVE] Deleted file ID: ${fileId}`);
      } catch (error) {
        if (error.message.includes("404")) {
          console.log(`⚠️  [GOOGLE DRIVE] File ${fileId} not found (already deleted).`);
        } else {
          console.log(`❌ [GOOGLE DRIVE] Failed to delete ${fileId}: ${error.message}`);
        }
      }
    }

    console.log(`✅ [GOOGLE DRIVE] Cleanup complete!`);
  } catch (error) {
    console.error("❌ [GOOGLE DRIVE] Error during cleanup:", error.message);
    console.log("⚠️  [GOOGLE DRIVE] Manual cleanup may be required.");
  }
}

/**
 * Clear upload logs (optional)
 */
async function clearUploadLogs() {
  console.log("\n📋 [LOGS] Clearing upload logs...");

  try {
    const { error } = await supabase
      .from("upload_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (error) {
      throw error;
    }

    console.log("✅ [LOGS] Upload logs cleared.");
  } catch (error) {
    console.error("❌ [LOGS] Error clearing upload logs:", error.message);
  }
}

/**
 * Main cleanup function
 */
async function cleanup() {
  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║  USTM Academia — PDF Cleanup Script      ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log(`\n⏰ Started at: ${new Date().toISOString()}`);

  try {
    // 1. Delete from Supabase storage
    await deleteFromSupabase();

    // 2. Delete from database and get Google Drive file IDs
    const googleDriveFileIds = await deleteFromDatabase();

    // 3. Delete from Google Drive
    await deleteFromGoogleDrive(googleDriveFileIds);

    // 4. Clear upload logs
    await clearUploadLogs();

    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║  ✅ Cleanup Complete!                    ║");
    console.log("╚═══════════════════════════════════════════╝");
    console.log(`\n⏰ Completed at: ${new Date().toISOString()}\n`);
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanup();
