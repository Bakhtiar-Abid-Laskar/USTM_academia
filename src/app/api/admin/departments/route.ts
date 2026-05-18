import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET — list all departments with counts (single query, no N+1)
export async function GET() {
  const supabase = await createClient();

  // Use Supabase's built-in relation counting to avoid N+1
  const { data: departments, error } = await supabase
    .from("departments")
    .select("*, courses(count), documents(count)")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten the nested count objects
  const result = (departments || []).map((dept: any) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    is_active: dept.is_active,
    created_at: dept.created_at,
    updated_at: dept.updated_at,
    course_count: dept.courses?.[0]?.count ?? 0,
    document_count: dept.documents?.[0]?.count ?? 0,
  }));

  return NextResponse.json(result);
}

// POST — create a department
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name || !body.code) {
    return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("departments")
    .insert({
      name: body.name,
      code: body.code,
      description: body.description || null,
      is_active: body.is_active !== false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A department with this code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT — update a department
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, ...updateData } = body;
  if (!id) return NextResponse.json({ error: "Missing department id" }, { status: 400 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("departments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — delete a department
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing department id" }, { status: 400 });

  const adminClient = createAdminClient();

  // Check for courses
  const { count } = await adminClient
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("department_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: department has ${count} course(s). Delete courses first.` },
      { status: 409 }
    );
  }

  const { error } = await adminClient.from("departments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
