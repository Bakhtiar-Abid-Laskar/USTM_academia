import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { slugifyFileName, zeroPad } from "@/lib/utils";
import { bulkUploadItemSchema } from "@/lib/validations";
import {
  getDriveClientExported,
  getOrCreateDrivePath,
  uploadPdfWithRetry,
  makeGoogleDriveFilePublic,
  setDriveFileProperties,
  checkFileExistsInFolder,
  getGoogleDrivePreviewUrl,
  getGoogleDriveViewUrl,
} from "@/lib/google-drive";

const MAX_FILE_SIZE_MB = Number(process.env.MAX_PDF_UPLOAD_SIZE_MB || "50");
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

// PDF magic bytes: %PDF (hex: 25 50 44 46)
function isPdfByMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46    // F
  );
}

// Strip HTML tags and trim whitespace from strings
function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function POST(request: NextRequest) {
  // ─── 1. Auth Check ───
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data: adminData } = await adminClient
    .from("admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminData) {
    return NextResponse.json(
      { error: "Admin account not found" },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const metadataStr = formData.get("metadata") as string | null;
    const sequenceNumber = Number(formData.get("sequence_number") || "1");
    const batchId = (formData.get("batch_id") as string) || "unknown";

    // ─── 2. File Validation ───
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must have a .pdf extension" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must not exceed ${MAX_FILE_SIZE_MB} MB` },
        { status: 400 }
      );
    }

    // Read file buffer for magic bytes check
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isPdfByMagicBytes(buffer)) {
      return NextResponse.json(
        { error: "File does not appear to be a valid PDF (magic bytes check failed)" },
        { status: 400 }
      );
    }

    // ─── 3. Metadata Validation ───
    if (!metadataStr) {
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    let rawMetadata: any;
    try {
      rawMetadata = JSON.parse(metadataStr);
    } catch {
      return NextResponse.json(
        { error: "Invalid metadata JSON" },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    if (rawMetadata.title) rawMetadata.title = sanitizeString(rawMetadata.title);

    // Validate with schema (server-side re-validation)
    const parseResult = bulkUploadItemSchema.safeParse(rawMetadata);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      );
      return NextResponse.json(
        { error: `Validation failed: ${issues.join("; ")}` },
        { status: 400 }
      );
    }

    const metadata = parseResult.data;

    // ─── 4. Build Drive Folder Path ───
    const [{ data: course }, { data: semester }, { data: subject }] =
      await Promise.all([
        adminClient
          .from("courses")
          .select("department, name")
          .eq("id", metadata.course_id)
          .single(),
        adminClient
          .from("semesters")
          .select("label")
          .eq("id", metadata.semester_id)
          .single(),
        adminClient
          .from("subjects")
          .select("name")
          .eq("id", metadata.subject_id)
          .single(),
      ]);

    const folderPath: string[] = [];
    if (course?.department) folderPath.push(course.department);
    if (course?.name) folderPath.push(course.name);
    if (semester?.label) folderPath.push(semester.label);
    if (subject?.name) folderPath.push(subject.name);

    // ─── 5. Resolve Drive Folder & Upload ───
    const drive = getDriveClientExported();
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!rootFolderId) {
      return NextResponse.json(
        { error: "Missing GOOGLE_DRIVE_FOLDER_ID configuration" },
        { status: 500 }
      );
    }

    // Create/verify folder hierarchy synchronously
    let targetFolderId: string;
    try {
      targetFolderId = await getOrCreateDrivePath(
        drive,
        rootFolderId,
        folderPath
      );
    } catch (err: any) {
      console.error("Failed to create Drive folder path:", err);
      return NextResponse.json(
        { error: `Failed to create Drive folder: ${err.message}` },
        { status: 500 }
      );
    }

    // ─── 6. Generate Filename ───
    const slugTitle = slugifyFileName(metadata.title);
    const padWidth = sequenceNumber >= 100 ? 3 : 2;
    const fileName = `${zeroPad(sequenceNumber, padWidth)}_${slugTitle}.pdf`;

    // Check for existing file with same name, append _v2, _v3 etc.
    let version = 1;
    let finalFileName = fileName;
    while (true) {
      const exists = await checkFileExistsInFolder(
        drive,
        targetFolderId,
        finalFileName
      );
      if (!exists.exists) break;
      version++;
      finalFileName = `${zeroPad(sequenceNumber, padWidth)}_${slugTitle}_v${version}.pdf`;
      if (version > 20) {
        // Safety: prevent infinite loop
        finalFileName = `${zeroPad(sequenceNumber, padWidth)}_${slugTitle}_${Date.now()}.pdf`;
        break;
      }
    }

    // ─── 7. Upload to Drive ───
    let driveResponse: { id: string };
    try {
      driveResponse = await uploadPdfWithRetry(
        drive,
        buffer,
        finalFileName,
        "application/pdf",
        targetFolderId
      );
    } catch (err: any) {
      // On 404 (folder deleted), try to re-create and retry once
      if (err.message?.includes("DRIVE_404")) {
        try {
          const retriedFolderId = await getOrCreateDrivePath(
            drive,
            rootFolderId,
            folderPath
          );
          driveResponse = await uploadPdfWithRetry(
            drive,
            buffer,
            finalFileName,
            "application/pdf",
            retriedFolderId
          );
        } catch (retryErr: any) {
          return NextResponse.json(
            { error: `Drive upload failed after retry: ${retryErr.message}` },
            { status: 500 }
          );
        }
      } else {
        const status = err?.response?.status || err?.code;
        let userMessage = `Drive upload failed: ${err.message}`;
        if (status === 403) {
          userMessage =
            "Google Drive rate limit exceeded. Please wait a moment and retry.";
        }
        return NextResponse.json({ error: userMessage }, { status: 500 });
      }
    }

    const fileId = driveResponse.id;

    // ─── 8. Make File Public ───
    try {
      await makeGoogleDriveFilePublic(fileId);
    } catch (err: any) {
      console.error("Failed to make file public:", err.message);
      // Non-critical — continue
    }

    // ─── 9. Set Drive File Properties ───
    await setDriveFileProperties(drive, fileId, {
      title: metadata.title,
      uploadedBy: adminData.id,
      batchId: batchId,
    });

    const previewUrl = getGoogleDrivePreviewUrl(fileId);
    const viewUrl = getGoogleDriveViewUrl(fileId);

    // ─── 10. Save to Database ───
    const { data: docData, error: docError } = await adminClient
      .from("documents")
      .insert({
        title: metadata.title,
        subject_id: metadata.subject_id,
        course_id: metadata.course_id,
        semester_id: metadata.semester_id,
        document_type_id: metadata.document_type_id,
        exam_type_id: metadata.exam_type_id || null,
        year: metadata.year || null,
        file_url: null,
        google_drive_file_id: fileId,
        google_drive_preview_url: previewUrl,
        google_drive_view_url: viewUrl,
        file_name: finalFileName,
        file_size_bytes: file.size,
        is_downloadable: metadata.is_downloadable !== false,
        status: metadata.status || "published",
        uploaded_by: adminData.id,
      })
      .select()
      .single();

    if (docError) {
      return NextResponse.json(
        { error: `Database error: ${docError.message}` },
        { status: 500 }
      );
    }

    // ─── 11. Log Upload ───
    await adminClient.from("upload_logs").insert({
      admin_id: adminData.id,
      document_id: docData.id,
      action: "upload",
      file_name: finalFileName,
      notes: `[Bulk Upload batch:${batchId}] Uploaded "${metadata.title}" (${sequenceNumber}) to Google Drive`,
    });

    return NextResponse.json(
      {
        success: true,
        document: docData,
        driveFileId: fileId,
        driveViewUrl: viewUrl,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Bulk upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
