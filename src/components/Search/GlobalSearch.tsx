'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ChevronDown, Check,
  BookOpen, GraduationCap,
  SlidersHorizontal, Loader2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { cardHoverVariants } from '@/lib/motion';

export interface DocumentItem {
  id: string;
  title: string;
  year: number | null;
  file_url: string | null;
  is_downloadable: boolean;
  status: string;
  created_at: string;
  course?: {
    id: string;
    name: string;
    slug: string;
    short_name?: string;
  } | null;
  semester?: {
    id: string;
    label: string;
    semester_number: number;
  } | null;
  subject?: {
    id: string;
    name: string;
    slug: string;
    subject_code: string | null;
  } | null;
  department?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  document_type?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  exam_type?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface FilterOption {
  label: string;
  value: string;
  count: number;
}

export interface AvailableFilters {
  courses: FilterOption[];
  departments: FilterOption[];
  documentTypes: FilterOption[];
  examTypes: FilterOption[];
  years: FilterOption[];
}

interface SearchResponse {
  data: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  query: string;
  availableFilters?: AvailableFilters;
}

const popularSearches = [
  'B.Tech CSE',
  'Operating System',
  'BBA',
  'Semester 4',
  '2025',
  'PYQ',
];

export function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state initialization
  const initialQ = searchParams?.get('q') || '';
  const initialCourse = searchParams?.get('course') || '';
  const initialDept = searchParams?.get('department') || '';
  const initialType = searchParams?.get('type') || '';
  const initialExam = searchParams?.get('exam') || '';
  const initialYear = searchParams?.get('year') || '';

  // Component state
  const [query, setQuery] = useState(initialQ);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedExam, setSelectedExam] = useState(initialExam);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AvailableFilters>({
    courses: [],
    departments: [],
    documentTypes: [],
    examTypes: [],
    years: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Native Fetch with AbortController ──────────────────────────────────────
  const fetchResults = useCallback(
    async (
      q: string,
      pageIndex: number,
      course: string,
      dept: string,
      type: string,
      exam: string,
      year: string
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        params.set('page', String(pageIndex));
        params.set('limit', '18');
        if (course) params.set('course', course);
        if (dept) params.set('department', dept);
        if (type) params.set('type', type);
        if (exam) params.set('exam', exam);
        if (year) params.set('year', year);

        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Search request failed (${res.status})`);
        }

        const data: SearchResponse = await res.json();
        setDocuments(data.data || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.pages || 0);
        setPage(data.page || 0);

        if (data.availableFilters) {
          setFilters(data.availableFilters);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[Search] Error:', err);
          setError('Failed to fetch academic records. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Synchronize URL with active state ──────────────────────────────────────
  const updateUrl = useCallback(
    (
      newQ: string,
      newCourse: string,
      newDept: string,
      newType: string,
      newExam: string,
      newYear: string
    ) => {
      const params = new URLSearchParams();
      if (newQ.trim()) params.set('q', newQ.trim());
      if (newCourse) params.set('course', newCourse);
      if (newDept) params.set('department', newDept);
      if (newType) params.set('type', newType);
      if (newExam) params.set('exam', newExam);
      if (newYear) params.set('year', newYear);

      const qs = params.toString();
      router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
    },
    [router]
  );

  // Initial load
  useEffect(() => {
    fetchResults(initialQ, 0, initialCourse, initialDept, initialType, initialExam, initialYear);
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Input change with fast debounce ───────────────────────────────────────
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      updateUrl(val, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
      fetchResults(val, 0, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
    }, 250);
  };

  const handleChipClick = (chipText: string) => {
    setQuery(chipText);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateUrl(chipText, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
    fetchResults(chipText, 0, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
  };

  const handleClearAll = () => {
    setQuery('');
    setSelectedCourse('');
    setSelectedDept('');
    setSelectedType('');
    setSelectedExam('');
    setSelectedYear('');
    updateUrl('', '', '', '', '', '');
    fetchResults('', 0, '', '', '', '', '');
  };

  const handleFilterToggle = (
    type: 'course' | 'dept' | 'type' | 'exam' | 'year',
    val: string
  ) => {
    let nextCourse = selectedCourse;
    let nextDept = selectedDept;
    let nextType = selectedType;
    let nextExam = selectedExam;
    let nextYear = selectedYear;

    if (type === 'course') nextCourse = selectedCourse === val ? '' : val;
    if (type === 'dept') nextDept = selectedDept === val ? '' : val;
    if (type === 'type') nextType = selectedType === val ? '' : val;
    if (type === 'exam') nextExam = selectedExam === val ? '' : val;
    if (type === 'year') nextYear = selectedYear === val ? '' : val;

    setSelectedCourse(nextCourse);
    setSelectedDept(nextDept);
    setSelectedType(nextType);
    setSelectedExam(nextExam);
    setSelectedYear(nextYear);

    updateUrl(query, nextCourse, nextDept, nextType, nextExam, nextYear);
    fetchResults(query, 0, nextCourse, nextDept, nextType, nextExam, nextYear);
  };

  const hasActiveFilters = Boolean(
    query || selectedCourse || selectedDept || selectedType || selectedExam || selectedYear
  );

  return (
    <div className="w-full flex flex-col min-h-screen pb-24 bg-[#EFF6FF]">
      
      {/* ── Search Hero Header ───────────────────────────────────────────── */}
      <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            
            {/* Academic Portal badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DBEAFE] border border-[#BFDBFE] text-xs font-semibold text-[#1D4ED8] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
              <span>USTM Central Archive Search</span>
              <span className="text-[#94A3B8]">·</span>
              <span className="font-tabular font-bold text-[#172554]">{totalCount} items indexed</span>
            </div>

            {/* Clean Sans-serif Heading (No Italic Serif) */}
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172554] tracking-tight mb-3">
              Find Any Paper, Instantly.
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mb-6">
              Search by subject title, course code, semester number, or year. Clean, direct access
              to verified question papers and curricula without login barriers.
            </p>

            {/* ── Primary Search Box with Safe Padding (No Icon Overlap) ─────── */}
            <div className="relative mb-4 group">
              <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1D4ED8] transition-colors pointer-events-none flex items-center">
                <Search size={20} />
              </div>

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search 'B.Tech CSE', 'Operating System', 'Semester 4', '2025'..."
                className="w-full py-3.5 sm:py-4 pl-12 sm:pl-14 pr-24 rounded-xl border border-[#DCE6F1] bg-white shadow-fine focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 outline-none text-base text-[#172B4D] placeholder:text-[#94A3B8] transition-all [&::-webkit-search-cancel-button]:hidden"
              />

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => handleQueryChange('')}
                    aria-label="Clear search"
                    className="p-1.5 text-[#94A3B8] hover:text-[#172B4D] hover:bg-[#F8FBFF] rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold bg-[#F8FBFF] border border-[#DCE6F1] text-[#64748B] rounded">
                  ESC
                </kbd>
              </div>
            </div>

            {/* ── Quick Search Chips ────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#64748B] font-medium mr-1 hidden sm:inline">Popular:</span>
              {popularSearches.map((chip) => {
                const isSelected = query.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-fine'
                        : 'bg-white hover:bg-[#F8FBFF] hover:border-[#2563EB] text-[#172B4D] border-[#DCE6F1] shadow-fine'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Catalog & Filter Ledger ──────────────────────────────────── */}
      <main className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
        
        {/* Filter Ledger Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-[#DCE6F1] mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748B] mr-2">
            <SlidersHorizontal size={14} className="text-[#1D4ED8]" />
            <span>Filters</span>
          </div>

          {/* Department Filter */}
          {filters.departments.length > 0 && (
            <EditorialDropdown
              label="Department"
              selectedValue={selectedDept}
              options={filters.departments}
              onSelect={(val) => handleFilterToggle('dept', val)}
            />
          )}

          {/* Course Filter */}
          {filters.courses.length > 0 && (
            <EditorialDropdown
              label="Course"
              selectedValue={selectedCourse}
              options={filters.courses}
              onSelect={(val) => handleFilterToggle('course', val)}
            />
          )}

          {/* Document Type Filter */}
          {filters.documentTypes.length > 0 && (
            <EditorialDropdown
              label="Type"
              selectedValue={selectedType}
              options={filters.documentTypes}
              onSelect={(val) => handleFilterToggle('type', val)}
            />
          )}

          {/* Exam Type Filter */}
          {filters.examTypes.length > 0 && (
            <EditorialDropdown
              label="Exam"
              selectedValue={selectedExam}
              options={filters.examTypes}
              onSelect={(val) => handleFilterToggle('exam', val)}
            />
          )}

          {/* Year Filter */}
          {filters.years.length > 0 && (
            <EditorialDropdown
              label="Year"
              selectedValue={selectedYear}
              options={filters.years}
              onSelect={(val) => handleFilterToggle('year', val)}
            />
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA580C] hover:text-orange-700 px-3 py-1.5 rounded-lg hover:bg-[#FFEDD5] transition-colors"
            >
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>

        {/* ── Status Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 text-xs sm:text-sm font-medium text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-tabular font-bold text-[#172554] text-base">{totalCount}</span>
            <span>records found</span>
            {query && (
              <span className="text-[#172554] font-semibold text-sm">
                for &ldquo;{query}&rdquo;
              </span>
            )}
          </div>

          {loading && (
            <span className="flex items-center gap-2 text-[#1D4ED8] font-semibold text-xs animate-pulse">
              <Loader2 size={13} className="animate-spin" /> Querying catalog...
            </span>
          )}
        </div>

        {/* ── Error Notification ─────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* ── Loading Skeleton State ──────────────────────────────────────── */}
        {loading && documents.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white p-6 rounded-xl border border-[#DCE6F1] h-48 flex flex-col justify-between shadow-fine"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 bg-[#EFF6FF] rounded w-20" />
                    <div className="h-5 bg-[#EFF6FF] rounded w-12" />
                  </div>
                  <div className="h-5 bg-[#EFF6FF] rounded w-3/4 mb-2.5" />
                  <div className="h-3.5 bg-[#EFF6FF] rounded w-1/2" />
                </div>
                <div className="pt-3 border-t border-[#DCE6F1] flex justify-between items-center">
                  <div className="h-4 bg-[#EFF6FF] rounded w-24" />
                  <div className="h-4 bg-[#EFF6FF] rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-[#DCE6F1] shadow-fine max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-3 border border-[#BFDBFE]">
              <BookOpen size={22} className="text-[#1D4ED8]" />
            </div>
            <h3 className="font-sans text-xl font-bold text-[#172554] mb-1.5">
              No matching records found
            </h3>
            <p className="text-sm text-[#64748B] mb-5 max-w-md">
              We couldn&apos;t find documents matching your criteria. Try loosening your filters or
              searching by course name (e.g. &ldquo;B.Tech CSE&rdquo;).
            </p>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-fine transition-all"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          /* ── Document Cards Grid ──────────────────────────────────────── */
          <div className="space-y-6">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-150 ${
                loading ? 'opacity-60 pointer-events-none' : 'opacity-100'
              }`}
            >
              {documents.map((doc) => (
                <EditorialDocumentCard key={doc.id} doc={doc} />
              ))}
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-[#DCE6F1]">
                <button
                  onClick={() => {
                    const prevP = Math.max(0, page - 1);
                    setPage(prevP);
                    fetchResults(query, prevP, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
                    window.scrollTo({ top: 220, behavior: 'smooth' });
                  }}
                  disabled={page === 0 || loading}
                  className="px-3.5 py-1.5 border border-[#DCE6F1] rounded-lg text-xs font-semibold bg-white hover:bg-[#F8FBFF] disabled:opacity-40 transition-colors text-[#172B4D] shadow-fine"
                >
                  ← Previous
                </button>

                <span className="text-xs font-medium text-[#64748B] font-tabular">
                  Page <strong className="text-[#172554]">{page + 1}</strong> of {totalPages}
                </span>

                <button
                  onClick={() => {
                    const nextP = page + 1;
                    if (nextP < totalPages) {
                      setPage(nextP);
                      fetchResults(query, nextP, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
                      window.scrollTo({ top: 220, behavior: 'smooth' });
                    }
                  }}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-3.5 py-1.5 border border-[#DCE6F1] rounded-lg text-xs font-semibold bg-white hover:bg-[#F8FBFF] disabled:opacity-40 transition-colors text-[#172B4D] shadow-fine"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Editorial Document Card Component ───────────────────────────────────────
const EditorialDocumentCard = React.memo(function EditorialDocumentCard({
  doc,
}: {
  doc: DocumentItem;
}) {
  const courseDisplay = doc.course?.short_name || doc.course?.name || '';
  const semDisplay = doc.semester?.label || (doc.semester?.semester_number ? `Sem ${doc.semester.semester_number}` : '');

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className="h-full"
    >
      <Link href={`/view/${doc.id}`} className="block h-full group">
        <article className="bg-white border border-[#DCE6F1] hover:border-[#2563EB] rounded-xl p-5 shadow-fine hover:shadow-card transition-all duration-150 flex flex-col h-full justify-between">
          <div>
            {/* Top Metadata Header: Year & Doc Type */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8] font-sans bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                {doc.document_type?.name || 'Document'}
              </span>
              {doc.year && (
                <span className="font-tabular text-xs font-bold px-2 py-0.5 rounded bg-[#F8FBFF] border border-[#DCE6F1] text-[#172554]">
                  {doc.year}
                </span>
              )}
            </div>

            {/* Title & Subject */}
            <div className="space-y-1.5 mb-3">
              <h3 className="font-semibold text-base text-[#172554] group-hover:text-[#1D4ED8] transition-colors leading-snug line-clamp-2">
                {doc.title}
              </h3>

              {doc.subject?.name && (
                <p className="text-xs text-[#64748B] flex items-center gap-1.5 line-clamp-1">
                  <BookOpen size={13} className="text-[#94A3B8] shrink-0" />
                  <span>{doc.subject.name}</span>
                  {doc.subject.subject_code && (
                    <span className="font-mono text-[10px] text-[#94A3B8]">
                      ({doc.subject.subject_code})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Academic Context (Course & Semester) */}
          <div className="pt-3 border-t border-[#DCE6F1] flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#64748B] line-clamp-1">
              <GraduationCap size={14} className="text-[#94A3B8] shrink-0" />
              <span className="font-semibold text-[#172554]">{courseDisplay}</span>
              {semDisplay && <span className="text-[#94A3B8]">· {semDisplay}</span>}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform shrink-0">
              View <ArrowUpRight size={13} />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
});

// ─── Editorial Dropdown Filter Component ─────────────────────────────────────
function EditorialDropdown({
  label,
  selectedValue,
  options,
  onSelect,
}: {
  label: string;
  selectedValue: string;
  options: FilterOption[];
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-fine ${
          selectedValue
            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8] font-bold'
            : 'bg-white hover:bg-[#F8FBFF] hover:border-[#2563EB] border-[#DCE6F1] text-[#172B4D]'
        }`}
      >
        <span>{selectedValue || label}</span>
        {selectedValue && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
        )}
        <ChevronDown
          size={13}
          className={`transition-transform text-[#64748B] ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-[#DCE6F1] rounded-xl shadow-card z-40 py-1.5 max-h-68 overflow-y-auto"
          >
            {selectedValue && (
              <button
                onClick={() => {
                  onSelect('');
                  setOpen(false);
                }}
                className="w-full text-left px-3.5 py-1.5 text-[11px] font-bold text-[#EA580C] hover:bg-[#FFEDD5] border-b border-[#DCE6F1] flex items-center justify-between"
              >
                <span>Clear {label} filter</span>
                <X size={12} />
              </button>
            )}

            {options.map((opt) => {
              const isSelected = selectedValue === opt.value;
              return (
                <label
                  key={opt.value}
                  onClick={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2 text-xs hover:bg-[#F8FBFF] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#EFF6FF] font-semibold text-[#1D4ED8]' : 'text-[#172B4D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 line-clamp-1 pr-2">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
                          : 'border-[#BFD0E2]'
                      }`}
                    >
                      {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </div>
                  <span className="font-tabular text-[10px] text-[#64748B] bg-white border border-[#DCE6F1] px-1.5 py-0.5 rounded">
                    {opt.count}
                  </span>
                </label>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobalSearch;
