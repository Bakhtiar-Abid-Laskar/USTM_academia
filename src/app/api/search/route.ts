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
    // PostgREST doesn't support OR across tables natively.
    // We first find matching subjects, then include them in the documents OR filter.
    const { data: matchedSubjects } = await supabase
      .from("subjects")
      .select("id")
      .ilike("name", `%${q}%`);

    const subjectIds = matchedSubjects?.map(s => s.id) || [];

    if (subjectIds.length > 0) {
      const subjectIdList = `(${subjectIds.join(',')})`;
      query = query.or(`title.ilike.%${q}%,subject_id.in.${subjectIdList}`);
    } else {
      query = query.ilike("title", `%${q}%`);
    }
  }
  if (courseId) query = query.eq("course_id", courseId);
  if (docTypeId) query = query.eq("document_type_id", Number(docTypeId));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
