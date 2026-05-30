import { createClient, createAdminClient } from "@/lib/supabase/server";
import { safeGetUser } from "@/lib/supabase/auth";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeFileName } from "@/lib/utils";
import { 
  uploadPdfToGoogleDrive, 
  makeGoogleDriveFilePublic, 
  getGoogleDrivePreviewUrl, 
  getGoogleDriveViewUrl,
  deleteFileFromGoogleDrive 
} from "@/lib/google-drive";
import { uploadLimiter, createRateLimitKey } from "@/lib/rate-limit";

const MAX_FILE_SIZE_MB = Number(process.env.MAX_PDF_UPLOAD_SIZE_MB || "25");
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await safeGetUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ✅ FIX #1: Add rate limiting
  const rateLimitKey = createRateLimitKey(user.id, "upload");
  const { success: rateLimitSuccess, retryAfter } = await uploadLimiter.check(rateLimitKey);
  
  if (!rateLimitSuccess) {
    return NextResponse.json(
      { 
        error: `Upload limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      { status: 429 } // Too Many Requests
    );
  }

  let googleDriveFileId: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "File must have a .pdf extension" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size must not exceed ${MAX_FILE_SIZE_MB} MB` }, { status: 400 });
    }

    // Support both formats: JSON metadata string OR individual form fields
    const metadataStr = formData.get("metadata") as string | null;
    let metadata: any;

    if (metadataStr) {
      metadata = JSON.parse(metadataStr);
    } else {
      metadata = {
        title: formData.get("title"),
        subject_id: formData.get("subject_id"),
        course_id: formData.get("course_id"),
        semester_id: formData.get("semester_id"),
        department_id: formData.get("department_id"),
        document_type_id: formData.get("document_type_id"),
        exam_type_id: formData.get("exam_type_id"),
        year: formData.get("year"),
        is_downloadable: formData.get("is_downloadable") !== "false",
        status: formData.get("status") || "published",
      };
    }

    // Validate required fields
    if (!metadata.title || !metadata.subject_id || !metadata.course_id ||
        !metadata.semester_id || !metadata.document_type_id) {
      return NextResponse.json({ error: "Missing required metadata fields" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get admin record
    const { data: adminData } = await adminClient
      .from("admins")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!adminData) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 403 });
    }

    // Fetch names for Google Drive folder organization
    const [{ data: course }, { data: semester }, { data: subject }] = await Promise.all([
      adminClient.from("courses").select("department, name").eq("id", metadata.course_id).single(),
      adminClient.from("semesters").select("label").eq("id", metadata.semester_id).single(),
      adminClient.from("subjects").select("name").eq("id", metadata.subject_id).single(),
    ]);

    const folderPath = [];
    if (course?.department) folderPath.push(course.department);
    if (course?.name) folderPath.push(course.name);
    if (semester?.label) folderPath.push(semester.label);
    if (subject?.name) folderPath.push(subject.name);

    // Generate unique file name
    const timestamp = Math.floor(Date.now() / 1000);
    const sanitized = sanitizeFileName(file.name.replace('.pdf', ''));
    const storagePath = `${sanitized}-${timestamp}.pdf`;

    // ✅ FIX #2: Upload to Google Drive FIRST
    const driveUploadResponse = await uploadPdfToGoogleDrive(file, storagePath, file.type, folderPath);
    
    if (!driveUploadResponse.id) {
      return NextResponse.json({ error: "Google Drive upload failed: No ID returned" }, { status: 500 });
    }
    
    googleDriveFileId = driveUploadResponse.id;
    
    // Make file viewable
    await makeGoogleDriveFilePublic(googleDriveFileId);

    const previewUrl = getGoogleDrivePreviewUrl(googleDriveFileId);
    const viewUrl = getGoogleDriveViewUrl(googleDriveFileId);

    // ✅ FIX #3: Database insert with error handling & cleanup
    const { data: docData, error: docError } = await adminClient
      .from("documents")
      .insert({
        title: metadata.title,
        subject_id: metadata.subject_id,
        course_id: metadata.course_id,
        semester_id: metadata.semester_id,
        department_id: metadata.department_id || null,
        document_type_id: Number(metadata.document_type_id),
        exam_type_id: metadata.exam_type_id ? Number(metadata.exam_type_id) : null,
        year: metadata.year ? Number(metadata.year) : null,
        file_url: null,
        google_drive_file_id: googleDriveFileId,
        google_drive_preview_url: previewUrl,
        google_drive_view_url: viewUrl,
        file_name: file.name,
        file_size_bytes: file.size,
        is_downloadable: metadata.is_downloadable !== false,
        status: metadata.status || "published",
        uploaded_by: adminData.id,
      })
      .select()
      .single();

    if (docError) {
      // ❌ CLEANUP: Database insert failed, delete from Google Drive
      try {
        await deleteFileFromGoogleDrive(googleDriveFileId);
        console.log(`✅ Cleaned up orphaned file: ${googleDriveFileId}`);
      } catch (cleanupError) {
        console.error(`⚠️ Failed to cleanup orphaned file ${googleDriveFileId}:`, cleanupError);
        // Log for manual intervention
      }
      
      return NextResponse.json(
        { 
          error: "Failed to save document metadata",
          details: docError.message 
        }, 
        { status: 500 }
      );
    }

    // ✅ Log the upload (non-critical - if this fails, document is still valid)
    try {
      await adminClient.from("upload_logs").insert({
        admin_id: adminData.id,
        document_id: docData.id,
        action: "upload",
        file_name: file.name,
        notes: `Uploaded "${metadata.title}" to Google Drive`,
      });
    } catch (logError) {
      console.error("Failed to log upload action:", logError);
      // Don't fail the request - document was created successfully
    }

    return NextResponse.json(docData, { status: 201 });
    
  } catch (err: any) {
    console.error("Upload error:", err);
    
    // ❌ CLEANUP: If anything failed, try to cleanup orphaned Google Drive file
    if (googleDriveFileId) {
      try {
        await deleteFileFromGoogleDrive(googleDriveFileId);
        console.log(`✅ Cleaned up orphaned file after error: ${googleDriveFileId}`);
      } catch (cleanupError) {
        console.error(`⚠️ Failed to cleanup orphaned file ${googleDriveFileId}:`, cleanupError);
      }
    }
    
    return NextResponse.json(
      { error: err.message || "Upload failed" }, 
      { status: 500 }
    );
  }
}
