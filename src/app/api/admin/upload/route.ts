import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeFileName } from "@/lib/utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      return NextResponse.json({ error: "File size must not exceed 20 MB" }, { status: 400 });
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

    // Generate unique file name
    const uuid = crypto.randomUUID();
    const sanitized = sanitizeFileName(file.name);
    const storagePath = `${uuid}_${sanitized}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await adminClient.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = adminClient.storage.from("documents").getPublicUrl(storagePath);

    // Save document metadata
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
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size_bytes: file.size,
        is_downloadable: metadata.is_downloadable !== false,
        status: metadata.status || "published",
        uploaded_by: adminData.id,
      })
      .select()
      .single();

    if (docError) {
      // Clean up uploaded file if db insert fails
      await adminClient.storage.from("documents").remove([storagePath]);
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    // Log the upload
    await adminClient.from("upload_logs").insert({
      admin_id: adminData.id,
      document_id: docData.id,
      action: "upload",
      file_name: file.name,
      notes: `Uploaded "${metadata.title}"`,
    });

    return NextResponse.json(docData, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
