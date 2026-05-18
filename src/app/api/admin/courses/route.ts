import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET — list courses, optionally filtered by department_id (single query, no N+1)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("department_id");

  const supabase = await createClient();

  // Use Supabase relation counting to avoid N+1
  let query = supabase
    .from("courses")
    .select("*, department:departments(id, name, code), documents(count)")
    .order("name");

  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten the nested count
  const result = (data || []).map((course: any) => ({
    ...course,
    document_count: course.documents?.[0]?.count ?? 0,
    documents: undefined, // Remove raw nested array
  }));

  return NextResponse.json(result);
}

// POST — create a course (with auto-created semesters)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, short_name, slug, department_id, duration_years, total_semesters, description } = body;

  if (!name || !short_name || !slug || !department_id) {
    return NextResponse.json({ error: "Name, short name, slug, and department are required" }, { status: 400 });
  }

  if (!total_semesters || total_semesters < 1 || total_semesters > 12) {
    return NextResponse.json({ error: "Semester count must be between 1 and 12" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Create course
  const { data: course, error: courseError } = await adminClient
    .from("courses")
    .insert({
      name,
      short_name,
      slug,
      department_id,
      department: body.department_name || null,
      duration_years: duration_years || Math.ceil(total_semesters / 2),
      total_semesters,
      description: description || null,
    })
    .select()
    .single();

  if (courseError) {
    if (courseError.code === "23505") {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: courseError.message }, { status: 500 });
  }

  // Auto-create semesters
  const semesters = Array.from({ length: total_semesters }, (_, i) => ({
    course_id: course.id,
    department_id,
    semester_number: i + 1,
    label: `Semester ${i + 1}`,
  }));

  const { error: semError } = await adminClient.from("semesters").insert(semesters);
  if (semError) {
    await adminClient.from("courses").delete().eq("id", course.id);
    return NextResponse.json({ error: "Failed to create semesters: " + semError.message }, { status: 500 });
  }

  return NextResponse.json(course, { status: 201 });
}

// PUT — update a course
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "Missing course id" }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("courses")
    .update({
      name: rest.name,
      short_name: rest.short_name,
      slug: rest.slug,
      description: rest.description || null,
      duration_years: rest.duration_years,
      is_active: rest.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — delete a course (checks for documents)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing course id" }, { status: 400 });

  const adminClient = createAdminClient();

  const { count } = await adminClient
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("course_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: course has ${count} document(s). Delete documents first.` },
      { status: 409 }
    );
  }

  const { error } = await adminClient.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
