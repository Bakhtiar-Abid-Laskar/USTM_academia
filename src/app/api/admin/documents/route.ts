import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET — list documents with optional filters
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from("documents")
    .select(`
      *,
      course:courses(id, short_name),
      semester:semesters(id, label),
      subject:subjects(id, name),
      document_type:document_types(id, name, slug),
      exam_type:exam_types(id, name, slug)
    `)
    .order("created_at", { ascending: false });

  const courseId = searchParams.get("course_id");
  const semesterId = searchParams.get("semester_id");
  const subjectId = searchParams.get("subject_id");
  const docTypeId = searchParams.get("document_type_id");
  const status = searchParams.get("status");

  if (courseId) query = query.eq("course_id", courseId);
  if (semesterId) query = query.eq("semester_id", semesterId);
  if (subjectId) query = query.eq("subject_id", subjectId);
  if (docTypeId) query = query.eq("document_type_id", Number(docTypeId));
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT — update document metadata
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ...updateData } = body;
  if (!id) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

  const adminClient = createAdminClient();

  const { data: adminData } = await adminClient
    .from("admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  const { data, error } = await adminClient
    .from("documents")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the update
  if (adminData) {
    await adminClient.from("upload_logs").insert({
      admin_id: adminData.id,
      document_id: id,
      action: "update",
      file_name: data.file_name,
      notes: `Updated metadata for "${data.title}"`,
    });
  }

  return NextResponse.json(data);
}

// DELETE — delete a document
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

  const adminClient = createAdminClient();

  const { data: adminData } = await adminClient
    .from("admins")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  // Get document to find file path
  const { data: doc } = await adminClient.from("documents").select("*").eq("id", id).single();
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  // Delete from Google Drive or Supabase Storage (fallback for old docs)
  if (doc.google_drive_file_id) {
    const { deleteFileFromGoogleDrive } = await import("@/lib/google-drive");
    await deleteFileFromGoogleDrive(doc.google_drive_file_id);
  } else if (doc.file_url) {
    // Extract storage path from URL for old Supabase Storage docs
    const url = new URL(doc.file_url);
    const pathParts = url.pathname.split("/storage/v1/object/public/documents/");
    if (pathParts[1]) {
      await adminClient.storage.from("documents").remove([decodeURIComponent(pathParts[1])]);
    }
  }

  // Delete from database
  const { error } = await adminClient.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the deletion
  if (adminData) {
    await adminClient.from("upload_logs").insert({
      admin_id: adminData.id,
      document_id: null,
      action: "delete",
      file_name: doc.file_name,
      notes: `Deleted "${doc.title}"`,
    });
  }

  return NextResponse.json({ success: true });
}

