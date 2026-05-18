import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET — all dashboard data in ONE response (stats + departments + recent uploads)
export async function GET() {
  const adminClient = createAdminClient();

  const [depts, courses, docs, recentDocs, departments] = await Promise.all([
    adminClient.from("departments").select("*", { count: "exact", head: true }),
    adminClient.from("courses").select("*", { count: "exact", head: true }),
    adminClient.from("documents").select("*", { count: "exact", head: true }),
    adminClient
      .from("documents")
      .select("id, title, created_at, course:courses(short_name), document_type:document_types(name, slug)")
      .order("created_at", { ascending: false })
      .limit(5),
    adminClient
      .from("departments")
      .select("*, courses(count), documents(count)")
      .order("name"),
  ]);

  const departmentList = (departments.data || []).map((dept: any) => ({
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

  return NextResponse.json({
    department_count: depts.count || 0,
    course_count: courses.count || 0,
    document_count: docs.count || 0,
    recent_uploads: recentDocs.data || [],
    departments: departmentList,
  });
}
