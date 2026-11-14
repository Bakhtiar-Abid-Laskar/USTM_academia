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

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

interface SearchApiResponse {
  data: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  query: string;
  availableFilters?: {
    courses: FilterOption[];
    departments: FilterOption[];
    documentTypes: FilterOption[];
    examTypes: FilterOption[];
    years: FilterOption[];
  };
}

export default function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get('q') || '';
  const initialCourse = searchParams.get('course') || '';
  const initialDept = searchParams.get('department') || '';
  const initialType = searchParams.get('type') || '';
  const initialExam = searchParams.get('exam') || '';
  const initialYear = searchParams.get('year') || '';

  const [query, setQuery] = useState(initialQ);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedExam, setSelectedExam] = useState(initialExam);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<{
    courses: FilterOption[];
    departments: FilterOption[];
    documentTypes: FilterOption[];
    examTypes: FilterOption[];
    years: FilterOption[];
  }>({
    courses: [],
    departments: [],
    documentTypes: [],
    examTypes: [],
    years: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSearches = [
    'B.Tech CSE',
    'Semester 4',
    'Operating System',
    'Previous Year Paper',
    'Constitution of India',
    'BBA',
  ];

  // ── Fetch Documents from Native Database API ──────────────────────────────
  const fetchResults = useCallback(
    async (
      q: string,
      pageNum: number,
      courseVal: string,
      deptVal: string,
      typeVal: string,
      examVal: string,
      yearVal: string
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (courseVal) params.set('course', courseVal);
        if (deptVal) params.set('department', deptVal);
        if (typeVal) params.set('type', typeVal);
        if (examVal) params.set('exam', examVal);
        if (yearVal) params.set('year', yearVal);
        params.set('page', String(pageNum));
        params.set('limit', '18');

        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          throw new Error('Search failed to load results.');
        }

        const data: SearchApiResponse = await res.json();
        setDocuments(data.data || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.pages || 0);
        setPage(data.page || 0);

        if (data.availableFilters) {
          setFilters((prev) => ({
            courses: data.availableFilters?.courses?.length ? data.availableFilters.courses : prev.courses,
            departments: data.availableFilters?.departments?.length ? data.availableFilters.departments : prev.departments,
            documentTypes: data.availableFilters?.documentTypes?.length ? data.availableFilters.documentTypes : prev.documentTypes,
            examTypes: data.availableFilters?.examTypes?.length ? data.availableFilters.examTypes : prev.examTypes,
            years: data.availableFilters?.years?.length ? data.availableFilters.years : prev.years,
          }));
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError('Could not complete search. Please try again.');
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateUrl('', '', '', '', '', '');
    fetchResults('', 0, '', '', '', '', '');
    inputRef.current?.focus();
  };

  const handleFilterToggle = (type: 'course' | 'dept' | 'type' | 'exam' | 'year', val: string) => {
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
    <div className="w-full flex flex-col min-h-screen pb-24">
      {/* ── Modern Academic Editorial Hero ─────────────────────────────────── */}
      <section className="border-b border-border bg-surface relative overflow-hidden py-14 sm:py-20 academic-grain">
        <div className="max-w-editorial mx-auto px-4 sm:px-8">
          <div className="max-w-3xl">
            {/* Academic Archive badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border text-xs font-semibold text-ink-muted mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              <span>USTM Central Archive Search</span>
              <span className="text-ink-faint">·</span>
              <span className="font-tabular text-ink font-bold">{totalCount} items indexed</span>
            </div>

            <h1 className="font-editorial-heading text-3xl sm:text-5xl lg:text-6xl font-normal text-ink tracking-tight mb-4">
              Find Any Paper, <span className="italic font-editorial-serif text-accent-gold">Instantly.</span>
            </h1>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-2xl mb-8">
              Search by subject title, course code, semester number, or year. Clean, direct access
              to verified question papers and curricula without login barriers.
            </p>

            {/* ── Primary Search Box ────────────────────────────────────────── */}
            <div className="relative mb-5 group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-accent-gold transition-colors">
                <Search size={20} />
              </div>

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search 'B.Tech CSE', 'Operating System', 'Semester 4', '2025'..."
                className="w-full p-4 sm:p-5 pl-13 sm:pl-14 pr-24 rounded-xl sm:rounded-2xl border border-border bg-paper shadow-fine focus:bg-surface focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/10 outline-none text-base sm:text-lg text-ink placeholder:text-ink-faint transition-all [&::-webkit-search-cancel-button]:hidden"
              />

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => handleQueryChange('')}
                    aria-label="Clear search"
                    className="p-1.5 text-ink-faint hover:text-ink hover:bg-surface-subtle rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold bg-surface border border-border text-ink-muted rounded shadow-fine">
                  ESC
                </kbd>
              </div>
            </div>

            {/* ── Quick Search Chips ────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink-faint font-medium mr-1 hidden sm:inline">Popular:</span>
              {popularSearches.map((chip) => {
                const isSelected = query.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-ink text-surface border-ink shadow-fine'
                        : 'bg-surface hover:bg-surface-subtle text-ink-muted hover:text-ink border-border shadow-fine hover:-translate-y-0.5'
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
      <main className="max-w-editorial mx-auto px-4 sm:px-8 mt-8 w-full">
        {/* Filter Ledger Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pb-6 border-b border-border mb-8">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted mr-2">
            <SlidersHorizontal size={14} className="text-accent-gold" />
            <span>Refine</span>
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
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-accent-crimson hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-accent-crimson-bg transition-colors"
            >
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>

        {/* ── Status Header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 text-xs sm:text-sm font-medium text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-tabular font-bold text-ink text-base">{totalCount}</span>
            <span>papers found</span>
            {query && (
              <span className="text-ink font-serif italic text-sm">
                for &ldquo;{query}&rdquo;
              </span>
            )}
          </div>

          {loading && (
            <span className="flex items-center gap-2 text-accent-gold font-semibold text-xs animate-pulse">
              <Loader2 size={13} className="animate-spin" /> Querying catalog...
            </span>
          )}
        </div>

        {/* ── Error Notification ─────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl bg-accent-crimson-bg border border-red-200 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-accent-crimson flex-shrink-0" />
            <p className="text-sm text-accent-crimson font-medium">{error}</p>
          </div>
        )}

        {/* ── Loading Skeleton State ──────────────────────────────────────── */}
        {loading && documents.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-surface p-6 rounded-xl border border-border h-52 flex flex-col justify-between shadow-fine"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 bg-surface-subtle rounded w-20" />
                    <div className="h-5 bg-surface-subtle rounded w-12" />
                  </div>
                  <div className="h-5 bg-surface-subtle rounded w-3/4 mb-2.5" />
                  <div className="h-3.5 bg-surface-subtle rounded w-1/2" />
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <div className="h-4 bg-surface-subtle rounded w-24" />
                  <div className="h-4 bg-surface-subtle rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface rounded-2xl border border-dashed border-border shadow-fine max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center mb-4 border border-border">
              <BookOpen size={24} className="text-ink-faint" />
            </div>
            <h3 className="font-editorial-heading text-2xl font-normal text-ink mb-2">
              No matching archive records
            </h3>
            <p className="text-sm text-ink-muted mb-6 max-w-md">
              We couldn&apos;t find documents matching your criteria. Try loosening your filters or
              searching by course name (e.g. &ldquo;B.Tech CSE&rdquo;).
            </p>
            <button
              onClick={handleClearAll}
              className="px-5 py-2.5 bg-ink text-surface hover:bg-accent-navy text-xs font-semibold rounded-lg shadow-fine transition-all"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          /* ── Document Cards Grid ──────────────────────────────────────── */
          <div className="space-y-8">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-200 ${
                loading ? 'opacity-60 pointer-events-none' : 'opacity-100'
              }`}
            >
              {documents.map((doc) => (
                <EditorialDocumentCard key={doc.id} doc={doc} />
              ))}
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-border">
                <button
                  onClick={() => {
                    const prevP = Math.max(0, page - 1);
                    setPage(prevP);
                    fetchResults(query, prevP, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
                    window.scrollTo({ top: 260, behavior: 'smooth' });
                  }}
                  disabled={page === 0 || loading}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold bg-surface hover:bg-surface-subtle disabled:opacity-30 transition-colors text-ink shadow-fine"
                >
                  ← Previous
                </button>

                <span className="text-xs font-medium text-ink-muted font-tabular">
                  Page <strong className="text-ink">{page + 1}</strong> of {totalPages}
                </span>

                <button
                  onClick={() => {
                    const nextP = page + 1;
                    if (nextP < totalPages) {
                      setPage(nextP);
                      fetchResults(query, nextP, selectedCourse, selectedDept, selectedType, selectedExam, selectedYear);
                      window.scrollTo({ top: 260, behavior: 'smooth' });
                    }
                  }}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold bg-surface hover:bg-surface-subtle disabled:opacity-30 transition-colors text-ink shadow-fine"
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
        <article className="bg-surface border border-border hover:border-accent-gold/60 rounded-xl p-5 sm:p-6 shadow-fine hover:shadow-editorial transition-all duration-200 flex flex-col h-full relative overflow-hidden">
          {/* Subtle paper top edge line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold/20 via-accent-gold/60 to-accent-gold/20 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Top Metadata Header: Year & Doc Type */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-gold font-sans">
              {doc.document_type?.name || 'Document'}
            </span>
            {doc.year && (
              <span className="font-tabular text-xs font-bold px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink">
                {doc.year}
              </span>
            )}
          </div>

          {/* Title & Subject */}
          <div className="flex-grow space-y-2 mb-4">
            <h3 className="font-semibold text-base sm:text-lg text-ink group-hover:text-accent-gold transition-colors leading-snug line-clamp-2">
              {doc.title}
            </h3>

            {doc.subject?.name && (
              <p className="text-xs text-ink-muted flex items-center gap-1.5 line-clamp-1">
                <BookOpen size={13} className="text-ink-faint shrink-0" />
                <span>{doc.subject.name}</span>
                {doc.subject.subject_code && (
                  <span className="font-mono text-[10px] text-ink-faint">
                    ({doc.subject.subject_code})
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Academic Context (Course & Semester) */}
          <div className="pt-3.5 border-t border-border flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-ink-muted line-clamp-1">
              <GraduationCap size={14} className="text-ink-faint shrink-0" />
              <span className="font-semibold text-ink">{courseDisplay}</span>
              {semDisplay && <span className="text-ink-faint">· {semDisplay}</span>}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-gold group-hover:translate-x-0.5 transition-transform shrink-0">
              Read <ArrowUpRight size={13} />
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
            ? 'bg-accent-gold-bg border-accent-gold text-accent-gold font-bold'
            : 'bg-surface hover:bg-surface-subtle border-border text-ink-muted hover:text-ink'
        }`}
      >
        <span>{selectedValue || label}</span>
        {selectedValue && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
        )}
        <ChevronDown
          size={13}
          className={`transition-transform text-ink-faint ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 w-60 bg-surface border border-border rounded-xl shadow-editorial z-40 py-1.5 max-h-68 overflow-y-auto"
          >
            {selectedValue && (
              <button
                onClick={() => {
                  onSelect('');
                  setOpen(false);
                }}
                className="w-full text-left px-3.5 py-1.5 text-[11px] font-bold text-accent-crimson hover:bg-accent-crimson-bg border-b border-border flex items-center justify-between"
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
                  className={`flex items-center justify-between px-3.5 py-2 text-xs hover:bg-surface-subtle cursor-pointer transition-colors ${
                    isSelected ? 'bg-surface-subtle font-semibold text-ink' : 'text-ink-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5 line-clamp-1 pr-2">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-accent-gold border-accent-gold text-white'
                          : 'border-border-strong'
                      }`}
                    >
                      {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="truncate">{opt.label}</span>
                  </div>
                  <span className="font-tabular text-[10px] text-ink-faint bg-surface border border-border px-1.5 py-0.5 rounded">
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
