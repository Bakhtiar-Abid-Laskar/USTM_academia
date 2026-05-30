import { createClient, createAdminClient } from "@/lib/supabase/server";
import { safeGetUser } from "@/lib/supabase/auth";
import { NextRequest, NextResponse } from "next/server";
import { documentUpdateSchema } from "@/lib/validations";
import { deleteFileFromGoogleDrive } from "@/lib/google-drive";

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
  const user = await safeGetUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    
    // ✅ FIX #3: Validate input against schema to prevent unauthorized field updates
    const parsed = documentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: "Invalid input",
          details: parsed.error.issues.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    const adminClient = createAdminClient();

    const { data: adminData } = await adminClient
      .from("admins")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    const { data, error } = await adminClient
      .from("documents")
      .update(cleanUpdateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log the update (non-critical)
    if (adminData) {
      try {
        await adminClient.from("upload_logs").insert({
          admin_id: adminData.id,
          document_id: id,
          action: "update",
          file_name: data.file_name,
          notes: `Updated metadata for "${data.title}"`,
        });
      } catch (logError) {
        console.error("Failed to log update action:", logError);
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Update error:", err);
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}

// DELETE — delete a document
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const user = await safeGetUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing document id" }, { status: 400 });

  try {
    const adminClient = createAdminClient();

    const { data: adminData } = await adminClient
      .from("admins")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    // Get document metadata
    const { data: doc } = await adminClient.from("documents").select("*").eq("id", id).single();
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // ✅ FIX #2: Delete from Google Drive/Storage FIRST
    // If Drive delete fails, DB record is untouched and we can retry
    if (doc.google_drive_file_id) {
      try {
        await deleteFileFromGoogleDrive(doc.google_drive_file_id);
      } catch (driveError: any) {
        // Only fail if it's not a "not found" error (404 means already deleted, which is OK)
        if (driveError.code !== 404 && driveError.status !== 404) {
          return NextResponse.json(
            { error: `Cannot delete file from storage: ${driveError.message}` },
            { status: 500 }
          );
        }
        // 404 is acceptable - file already deleted from Drive
      }
    } else if (doc.file_url) {
      // Fallback: Old Supabase Storage files
      try {
        const url = new URL(doc.file_url);
        const pathParts = url.pathname.split("/storage/v1/object/public/documents/");
        if (pathParts[1]) {
          await adminClient.storage.from("documents").remove([decodeURIComponent(pathParts[1])]);
        }
      } catch (storageError) {
        console.warn("Failed to delete from Supabase Storage:", storageError);
        // Non-blocking - continue with DB deletion
      }
    }

    // ✅ Delete from database (only if storage delete succeeded)
    const { error: dbError } = await adminClient.from("documents").delete().eq("id", id);
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    // ✅ Log the deletion (non-critical)
    if (adminData) {
      try {
        await adminClient.from("upload_logs").insert({
          admin_id: adminData.id,
          document_id: null,
          action: "delete",
          file_name: doc.file_name,
          notes: `Deleted "${doc.title}"`,
        });
      } catch (logError) {
        console.error("Failed to log deletion action:", logError);
      }
    }

    return NextResponse.json({ success: true, message: "Document deleted successfully" });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: err.message || "Deletion failed" }, { status: 500 });
  }
}

