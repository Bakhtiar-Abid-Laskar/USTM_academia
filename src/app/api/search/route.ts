import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { searchLimiter, getClientIp, createRateLimitKey } from "@/lib/rate-limit";

// Constants
const MAX_SEARCH_LENGTH = 200; // Prevent DoS with very long search strings
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  // ✅ FIX #5: Add rate limiting on search
  const clientIp = getClientIp(request);
  const rateLimitKey = createRateLimitKey(clientIp, "search");
  const { success: rateLimitSuccess, retryAfter } = await searchLimiter.check(rateLimitKey);
  
  if (!rateLimitSuccess) {
    return NextResponse.json(
      { error: `Search rate limit exceeded. Try again in ${retryAfter} seconds.` },
      { status: 429 }
    );
  }

  try {
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT))),
      MAX_LIMIT
    );

    // ✅ FIX #6: Validate search query length to prevent DoS
    if (q.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        { 
          error: `Search query exceeds ${MAX_SEARCH_LENGTH} character limit`,
          maxLength: MAX_SEARCH_LENGTH
        },
        { status: 400 }
      );
    }

    // ✅ FIX #5: Add pagination support
    const offset = page * limit;

    const selectColumns = `
      id, title, year, file_url, is_downloadable, status, created_at,
      course:courses(id, short_name, slug),
      semester:semesters(id, label, semester_number),
      subject:subjects(id, name, slug),
      document_type:document_types(id, name, slug),
      exam_type:exam_types(id, name, slug)
    `;

    if (q.length === 0) {
      // Fallback: Return published documents ordered by newest first
      const { data, error, count } = await supabase
        .from("documents")
        .select(selectColumns, { count: "exact" })
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        data: data || [],
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
        hasNextPage: offset + limit < (count || 0),
        hasPreviousPage: page > 0,
      });
    }

    // Use Full-Text Search RPC function
    const { data: searchResults, error: rpcError } = await supabase.rpc(
      "search_documents",
      { search_query: q }
    );

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    const docIds = searchResults?.map((doc: any) => doc.id) || [];
    
    if (docIds.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        pages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        query: q,
      });
    }

    // Get total count and paginated results
    const { data, error: queryError, count } = await supabase
      .from("documents")
      .select(selectColumns, { count: "exact" })
      .in("id", docIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
      hasNextPage: offset + limit < (count || 0),
      hasPreviousPage: page > 0,
      query: q,
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
