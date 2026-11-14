import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { searchLimiter, getClientIp, createRateLimitKey } from "@/lib/rate-limit";

const MAX_SEARCH_LENGTH = 200;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Shared select columns for all document queries
const SELECT_COLUMNS = `
  id, title, year, file_url, is_downloadable, status, created_at,
  course:courses(id, short_name, slug),
  semester:semesters(id, label, semester_number),
  subject:subjects(id, name, slug),
  document_type:document_types(id, name, slug),
  exam_type:exam_types(id, name, slug)
`;

export async function GET(request: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const clientIp = getClientIp(request);
  const rateLimitKey = createRateLimitKey(clientIp, "search");
  const { success: rateLimitSuccess, retryAfter } = await searchLimiter.check(rateLimitKey);

  if (!rateLimitSuccess) {
    return NextResponse.json(
      { error: `Search rate limit exceeded. Try again in ${retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10));
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)),
    MAX_LIMIT
  );
  const offset = page * limit;

  // ── Validate query length ─────────────────────────────────────────────────
  if (q.length > MAX_SEARCH_LENGTH) {
    return NextResponse.json(
      { error: `Search query exceeds ${MAX_SEARCH_LENGTH} character limit` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    // ── Empty query: return latest published documents ─────────────────────
    if (q.length === 0) {
      const { data, error, count } = await supabase
        .from("documents")
        .select(SELECT_COLUMNS, { count: "exact" })
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Supabase list error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const total = count ?? 0;
      return NextResponse.json({
        data: data ?? [],
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: offset + limit < total,
        hasPreviousPage: page > 0,
        query: "",
      });
    }

    // ── Full-text search via Supabase ilike (fuzzy on title, subject, course)
    // Strategy: use direct ilike on joined columns via text search rather than
    // a stored proc, so we don't depend on the DB having search_documents RPC.
    // We do two passes:
    //  1) exact/prefix match on title (highest relevance)
    //  2) broader ilike across related fields via RPC if available, else fallback
    // This ensures search ALWAYS works even without RPC.

    // Try the RPC-based full-text search first (more powerful if the proc exists)
    const { data: rpcResults, error: rpcError } = await supabase.rpc(
      "search_documents",
      { search_query: q }
    );

    let docIds: string[] = [];
    let totalCount = 0;

    if (!rpcError && Array.isArray(rpcResults) && rpcResults.length > 0) {
      // RPC succeeded — use ranked IDs
      docIds = rpcResults.map((r: any) => r.id);
      totalCount = docIds.length;
    } else {
      // RPC unavailable or returned nothing — fallback to multi-field ilike
      const term = `%${q.replace(/[%_]/g, '\\$&')}%`;

      // Search across title directly on documents table
      const { data: directHits, error: directError, count } = await supabase
        .from("documents")
        .select("id, title, created_at", { count: "exact" })
        .eq("status", "published")
        .or(
          `title.ilike.${term}`
        )
        .order("created_at", { ascending: false });

      if (directError) {
        console.error("Search fallback error:", directError);
        return NextResponse.json({ error: directError.message }, { status: 500 });
      }

      docIds = (directHits ?? []).map((r: any) => r.id);
      totalCount = count ?? docIds.length;
    }

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

    // ── Paginate: slice the ranked IDs, then fetch full details ───────────
    const paginatedIds = docIds.slice(offset, offset + limit);

    const { data, error: fetchError } = await supabase
      .from("documents")
      .select(SELECT_COLUMNS)
      .in("id", paginatedIds)
      .eq("status", "published");

    if (fetchError) {
      console.error("Document fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Restore the ranked order that .in() destroys
    const idOrder = new Map(paginatedIds.map((id, idx) => [id, idx]));
    const orderedData = (data ?? []).sort(
      (a: any, b: any) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0)
    );

    return NextResponse.json({
      data: orderedData,
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasNextPage: offset + limit < totalCount,
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
