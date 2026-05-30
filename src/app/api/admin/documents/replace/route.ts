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

const MAX_FILE_SIZE_MB = Number(process.env.MAX_PDF_UPLOAD_SIZE_MB || "25");
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await safeGetUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentId = formData.get("document_id") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!documentId) return NextResponse.json({ error: "No document ID provided" }, { status: 400 });

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

    // Get existing document
    const { data: existingDoc } = await adminClient
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
      
    if (!existingDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Fetch names for Google Drive folder organization
    const [{ data: course }, { data: semester }, { data: subject }] = await Promise.all([
      adminClient.from("courses").select("department, name").eq("id", existingDoc.course_id).single(),
      adminClient.from("semesters").select("label").eq("id", existingDoc.semester_id).single(),
      adminClient.from("subjects").select("name").eq("id", existingDoc.subject_id).single(),
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

    // Upload to Google Drive
    const driveUploadResponse = await uploadPdfToGoogleDrive(file, storagePath, file.type, folderPath);
    
    if (!driveUploadResponse.id) {
      return NextResponse.json({ error: "Google Drive upload failed: No ID returned" }, { status: 500 });
    }
    
    const fileId = driveUploadResponse.id;
    
    // Make file viewable
    await makeGoogleDriveFilePublic(fileId);

    const previewUrl = getGoogleDrivePreviewUrl(fileId);
    const viewUrl = getGoogleDriveViewUrl(fileId);

    // Update document metadata in DB
    const { data: docData, error: docError } = await adminClient
      .from("documents")
      .update({
        google_drive_file_id: fileId,
        google_drive_preview_url: previewUrl,
        google_drive_view_url: viewUrl,
        file_name: file.name,
        file_size_bytes: file.size,
      })
      .eq("id", documentId)
      .select()
      .single();

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    // Delete old file if it existed
    if (existingDoc.google_drive_file_id) {
      await deleteFileFromGoogleDrive(existingDoc.google_drive_file_id);
    } else if (existingDoc.file_url) {
      try {
        const url = new URL(existingDoc.file_url);
        const pathParts = url.pathname.split("/storage/v1/object/public/documents/");
        if (pathParts[1]) {
          await adminClient.storage.from("documents").remove([decodeURIComponent(pathParts[1])]);
        }
      } catch (e) {
        console.error("Failed to delete old supabase file", e);
      }
    }

    // Log the replace
    await adminClient.from("upload_logs").insert({
      admin_id: adminData.id,
      document_id: documentId,
      action: "replace",
      file_name: file.name,
      notes: `Replaced PDF for "${existingDoc.title}"`,
    });

    return NextResponse.json(docData, { status: 200 });
  } catch (err: any) {
    console.error("Replace error:", err);
    return NextResponse.json({ error: err.message || "Replace failed" }, { status: 500 });
  }
}
