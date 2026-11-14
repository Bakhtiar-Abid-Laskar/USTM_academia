import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { searchLimiter, getClientIp, createRateLimitKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_SEARCH_LENGTH = 200;
const DEFAULT_LIMIT = 18;
const MAX_LIMIT = 100;

interface DocumentRow {
  id: string;
  title: string;
  year: number | null;
  file_url: string | null;
  is_downloadable: boolean;
  status: string;
  created_at: string;
  course: {
    id: string;
    name?: string;
    short_name?: string;
    slug?: string;
  } | null;
  semester: {
    id: string;
    label?: string;
    semester_number?: number;
  } | null;
  subject: {
    id: string;
    name?: string;
    subject_code?: string;
    slug?: string;
  } | null;
  department?: {
    id: string;
    name?: string;
    code?: string;
  } | null;
  document_type: {
    id: number;
    name?: string;
    slug?: string;
  } | null;
  exam_type: {
    id: number;
    name?: string;
    slug?: string;
  } | null;
}

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
  const filterCourse = searchParams.get("course") || "";
  const filterDepartment = searchParams.get("department") || "";
  const filterDocType = searchParams.get("document_type") || searchParams.get("type") || "";
  const filterExamType = searchParams.get("exam_type") || searchParams.get("exam") || "";
  const filterYear = searchParams.get("year") || "";
  const filterSemester = searchParams.get("semester") || "";

  const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10));
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)),
    MAX_LIMIT
  );
  const offset = page * limit;

  if (q.length > MAX_SEARCH_LENGTH) {
    return NextResponse.json(
      { error: `Search query exceeds ${MAX_SEARCH_LENGTH} character limit` },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // ── Fetch all published documents with full relations ───────────────────
    const { data: rawDocs, error } = await supabase
      .from("documents")
      .select(`
        id, title, year, file_url, is_downloadable, status, created_at,
        course:courses(id, name, short_name, slug),
        semester:semesters(id, label, semester_number),
        subject:subjects(id, name, subject_code, slug),
        department:departments(id, name, code),
        document_type:document_types(id, name, slug),
        exam_type:exam_types(id, name, slug)
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase search fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allDocs = (rawDocs || []) as unknown as DocumentRow[];

    // ── Collect Available Filters (Facets) ──────────────────────────────────
    const filterMaps = {
      courses: new Map<string, { label: string; value: string; count: number }>(),
      departments: new Map<string, { label: string; value: string; count: number }>(),
      documentTypes: new Map<string, { label: string; value: string; count: number }>(),
      examTypes: new Map<string, { label: string; value: string; count: number }>(),
      years: new Map<string, { label: string; value: string; count: number }>(),
    };

    for (const doc of allDocs) {
      if (doc.course?.short_name || doc.course?.name) {
        const key = doc.course.short_name || doc.course.name || "";
        const entry = filterMaps.courses.get(key) || { label: key, value: key, count: 0 };
        entry.count++;
        filterMaps.courses.set(key, entry);
      }
      if (doc.department?.name) {
        const key = doc.department.name;
        const entry = filterMaps.departments.get(key) || { label: key, value: key, count: 0 };
        entry.count++;
        filterMaps.departments.set(key, entry);
      }
      if (doc.document_type?.name) {
        const key = doc.document_type.name;
        const entry = filterMaps.documentTypes.get(key) || { label: key, value: key, count: 0 };
        entry.count++;
        filterMaps.documentTypes.set(key, entry);
      }
      if (doc.exam_type?.name) {
        const key = doc.exam_type.name;
        const entry = filterMaps.examTypes.get(key) || { label: key, value: key, count: 0 };
        entry.count++;
        filterMaps.examTypes.set(key, entry);
      }
      if (doc.year) {
        const key = String(doc.year);
        const entry = filterMaps.years.get(key) || { label: key, value: key, count: 0 };
        entry.count++;
        filterMaps.years.set(key, entry);
      }
    }

    // ── Apply Explicit Filters ──────────────────────────────────────────────
    let filtered = allDocs.filter((doc) => {
      if (filterCourse) {
        const target = filterCourse.toLowerCase();
        const cName = doc.course?.name?.toLowerCase() || "";
        const cShort = doc.course?.short_name?.toLowerCase() || "";
        const cSlug = doc.course?.slug?.toLowerCase() || "";
        if (cName !== target && cShort !== target && cSlug !== target) return false;
      }
      if (filterDepartment) {
        const target = filterDepartment.toLowerCase();
        const dName = doc.department?.name?.toLowerCase() || "";
        const dCode = doc.department?.code?.toLowerCase() || "";
        if (dName !== target && dCode !== target) return false;
      }
      if (filterDocType) {
        const target = filterDocType.toLowerCase();
        const dtName = doc.document_type?.name?.toLowerCase() || "";
        const dtSlug = doc.document_type?.slug?.toLowerCase() || "";
        if (dtName !== target && dtSlug !== target) return false;
      }
      if (filterExamType) {
        const target = filterExamType.toLowerCase();
        const etName = doc.exam_type?.name?.toLowerCase() || "";
        const etSlug = doc.exam_type?.slug?.toLowerCase() || "";
        if (etName !== target && etSlug !== target) return false;
      }
      if (filterYear) {
        if (String(doc.year) !== filterYear) return false;
      }
      if (filterSemester) {
        const target = filterSemester.toLowerCase();
        const semNum = String(doc.semester?.semester_number || "");
        const semLabel = doc.semester?.label?.toLowerCase() || "";
        if (semNum !== target && semLabel !== target) return false;
      }
      return true;
    });

    // ── Apply Query & Semantic Ranking (Strong Multi-Field Search) ───────────
    if (q) {
      const cleanQ = q.toLowerCase();
      // Tokenize query words
      const rawTokens = cleanQ.split(/[\s,._\-\/]+/).filter((t) => t.length > 0);

      // Handle common acronyms & synonyms
      const tokens: string[] = [];
      for (const t of rawTokens) {
        tokens.push(t);
        if (t === "pyq" || t === "pyqs") tokens.push("previous", "year", "question");
        if (t === "paper" || t === "papers") tokens.push("question");
        if (t === "sem") tokens.push("semester");
      }

      const scoredDocs = filtered.map((doc) => {
        let score = 0;

        const title = (doc.title || "").toLowerCase();
        const subjName = (doc.subject?.name || "").toLowerCase();
        const subjCode = (doc.subject?.subject_code || "").toLowerCase();
        const courseName = (doc.course?.name || "").toLowerCase();
        const courseShort = (doc.course?.short_name || "").toLowerCase();
        const deptName = (doc.department?.name || "").toLowerCase();
        const semLabel = (doc.semester?.label || "").toLowerCase();
        const semNum = String(doc.semester?.semester_number || "");
        const docTypeName = (doc.document_type?.name || "").toLowerCase();
        const examTypeName = (doc.exam_type?.name || "").toLowerCase();
        const yearStr = String(doc.year || "");

        // 1. Exact phrase matches (highest relevance)
        if (title === cleanQ) score += 200;
        else if (title.startsWith(cleanQ)) score += 120;
        else if (title.includes(cleanQ)) score += 80;

        if (subjName === cleanQ) score += 150;
        else if (subjName.includes(cleanQ)) score += 70;

        if (subjCode && subjCode.includes(cleanQ)) score += 90;

        if (courseShort === cleanQ) score += 100;
        else if (courseShort.includes(cleanQ)) score += 60;
        else if (courseName.includes(cleanQ)) score += 50;

        if (deptName.includes(cleanQ)) score += 30;
        if (semLabel.includes(cleanQ)) score += 40;
        if (docTypeName.includes(cleanQ)) score += 30;
        if (examTypeName.includes(cleanQ)) score += 25;
        if (yearStr === cleanQ) score += 40;

        // 2. Token-level matching across all fields
        let matchedTokens = 0;
        for (const token of tokens) {
          let tokenFound = false;

          if (title.includes(token)) {
            score += 25;
            tokenFound = true;
          }
          if (subjName.includes(token)) {
            score += 25;
            tokenFound = true;
          }
          if (subjCode && subjCode.includes(token)) {
            score += 20;
            tokenFound = true;
          }
          if (courseShort.includes(token)) {
            score += 25;
            tokenFound = true;
          }
          if (courseName.includes(token)) {
            score += 15;
            tokenFound = true;
          }
          if (semLabel.includes(token) || semNum === token) {
            score += 20;
            tokenFound = true;
          }
          if (deptName.includes(token)) {
            score += 10;
            tokenFound = true;
          }
          if (docTypeName.includes(token)) {
            score += 15;
            tokenFound = true;
          }
          if (examTypeName.includes(token)) {
            score += 10;
            tokenFound = true;
          }
          if (yearStr.includes(token)) {
            score += 15;
            tokenFound = true;
          }

          if (tokenFound) matchedTokens++;
        }

        // Bonus if multiple query tokens matched
        if (matchedTokens > 1) {
          score += matchedTokens * 20;
        }

        return { doc, score };
      });

      // Filter out documents with zero relevance score
      const matchingScored = scoredDocs.filter((item) => item.score > 0);

      // Sort by score descending, then newest created_at
      matchingScored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.doc.created_at).getTime() - new Date(a.doc.created_at).getTime();
      });

      filtered = matchingScored.map((item) => item.doc);
    }

    const total = filtered.length;
    const paginatedData = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedData,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNextPage: offset + limit < total,
      hasPreviousPage: page > 0,
      query: q,
      availableFilters: {
        courses: Array.from(filterMaps.courses.values()),
        departments: Array.from(filterMaps.departments.values()),
        documentTypes: Array.from(filterMaps.documentTypes.values()),
        examTypes: Array.from(filterMaps.examTypes.values()),
        years: Array.from(filterMaps.years.values()).sort((a, b) => b.label.localeCompare(a.label)),
      },
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
