import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { subjectSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("course_id");
  const semesterId = searchParams.get("semester_id");

  let query = supabase
    .from("subjects")
    .select("*, course:courses(id, name, short_name), semester:semesters(id, label, semester_number)")
    .order("name");

  if (courseId) query = query.eq("course_id", courseId);
  if (semesterId) query = query.eq("semester_id", semesterId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.from("subjects").insert(parsed.data).select().single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "A subject with this slug already exists in this semester" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "Missing subject id" }, { status: 400 });

  const parsed = subjectSchema.safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.from("subjects").update(parsed.data).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing subject id" }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("subjects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
