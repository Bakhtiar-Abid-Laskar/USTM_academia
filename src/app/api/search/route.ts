import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const courseId = searchParams.get("course_id");
  const docTypeId = searchParams.get("document_type_id");

  let query = supabase
    .from("documents")
    .select(`
      id, title, year, file_url, is_downloadable, status, created_at,
      course:courses(id, short_name, slug),
      semester:semesters(id, label, semester_number),
      subject:subjects(id, name, slug),
      document_type:document_types(id, name, slug),
      exam_type:exam_types(id, name, slug)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.or(`title.ilike.%${q}%,subject.name.ilike.%${q}%`);
  }
  if (courseId) query = query.eq("course_id", courseId);
  if (docTypeId) query = query.eq("document_type_id", Number(docTypeId));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
