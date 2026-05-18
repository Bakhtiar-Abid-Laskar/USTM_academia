import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const courseId = searchParams.get("course_id");
  const docTypeId = searchParams.get("document_type_id");

  try {
    let query;
    const selectColumns = `
      id, title, year, file_url, is_downloadable, status, created_at,
      course:courses(id, short_name, slug),
      semester:semesters(id, label, semester_number),
      subject:subjects(id, name, slug),
      document_type:document_types(id, name, slug),
      exam_type:exam_types(id, name, slug)
    `;

    if (q.trim()) {
      // Use the powerful Full-Text Search RPC function to get document IDs
      const { data: searchResults, error: rpcError } = await supabase.rpc(
        "search_documents",
        { search_query: q.trim() }
      );

      if (rpcError) {
        return NextResponse.json(
          { error: rpcError.message },
          { status: 500 }
        );
      }

      // Extract IDs from RPC results
      const docIds = searchResults?.map((doc: any) => doc.id) || [];
      
      if (docIds.length === 0) {
        return NextResponse.json([]);
      }

      // Fetch full documents with relationships using the IDs from search
      query = supabase
        .from("documents")
        .select(selectColumns)
        .in("id", docIds)
        .order("created_at", { ascending: false });
    } else {
      // Fallback to normal query when no search term is provided
      query = supabase
        .from("documents")
        .select(selectColumns)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(50);

      if (courseId) query = query.eq("course_id", courseId);
      if (docTypeId) query = query.eq("document_type_id", Number(docTypeId));
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
