import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET — list semesters for a course, with document counts (single query, no N+1)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course_id");

  let query = supabase
    .from("semesters")
    .select("*, course:courses(id, name, short_name), documents(count)")
    .order("semester_number");

  if (courseId) query = query.eq("course_id", courseId);

  const { data: semesters, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For syllabus/qp counts, fetch all docs for the relevant semesters in ONE query
  const semIds = (semesters || []).map((s: any) => s.id);
  const syllabusMap: Record<string, number> = {};
  const qpMap: Record<string, number> = {};

  if (semIds.length > 0) {
    const { data: docs } = await supabase
      .from("documents")
      .select("semester_id, document_type_id")
      .in("semester_id", semIds);

    if (docs) {
      for (const doc of docs) {
        if (doc.document_type_id === 1) {
          syllabusMap[doc.semester_id] = (syllabusMap[doc.semester_id] || 0) + 1;
        } else if (doc.document_type_id === 2) {
          qpMap[doc.semester_id] = (qpMap[doc.semester_id] || 0) + 1;
        }
      }
    }
  }

  const result = (semesters || []).map((sem: any) => ({
    ...sem,
    document_count: sem.documents?.[0]?.count ?? 0,
    syllabus_count: syllabusMap[sem.id] || 0,
    qp_count: qpMap[sem.id] || 0,
    documents: undefined,
  }));

  return NextResponse.json(result);
}

// PUT — update a semester (title only)
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, label } = body;
  if (!id) return NextResponse.json({ error: "Missing semester id" }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("semesters")
    .update({ label })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
