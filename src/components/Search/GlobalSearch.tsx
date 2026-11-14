'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText, Search, X, ChevronDown, Check,
  BookOpen, Clock, Building2, GraduationCap,
  SlidersHorizontal, Loader2, Sparkles, AlertCircle
} from 'lucide-react';

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
    <div className="w-full flex flex-col min-h-screen pb-20">
      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <div className="bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pt-20 pb-36 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-[#0f172a] z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles size={14} className="text-blue-400" />
            <span>Instant Academic Database Search</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">
            Find Study Materials <span className="text-blue-400">Faster</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Search previous year question papers, syllabi, notes, and academic resources across USTM in seconds.
          </p>
        </div>
      </div>

      {/* ── Search Bar & Popular Chips ────────────────────────────────────── */}
      <div className="w-full -mt-24 z-20 relative max-w-4xl mx-auto px-4">
        {/* Trust Badges */}
        <div className="hidden md:flex flex-wrap justify-center gap-6 mb-6 text-sm font-medium text-blue-50/90 drop-shadow-sm">
          <span className="flex items-center gap-2">
            <FileText size={16} /> Previous Year Papers
          </span>
          <span className="flex items-center gap-2">
            <BookOpen size={16} /> Syllabi
          </span>
          <span className="flex items-center gap-2">
            <Clock size={16} /> Notes
          </span>
          <span className="flex items-center gap-2">
            <Building2 size={16} /> Department Resources
          </span>
        </div>

        {/* Search Input Box */}
        <div className="relative mb-5 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-6 h-6 transition-transform group-focus-within:scale-110" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by subject, course, semester, year, or paper..."
            className="w-full p-5 pl-16 pr-16 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white border border-transparent focus:border-blue-100 focus:ring-4 focus:ring-blue-500/20 outline-none text-lg md:text-xl transition-all [&::-webkit-search-cancel-button]:hidden text-slate-800 placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              aria-label="Clear search"
              className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick-Search Chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {popularSearches.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-4 py-1.5 bg-white/90 hover:bg-white text-slate-800 border border-white/80 rounded-full text-xs md:text-sm font-semibold transition-all backdrop-blur-md shadow-sm hover:scale-105 hover:shadow-md"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content & Filters ────────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-10">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-slate-200">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-2 mr-1">
            <SlidersHorizontal size={15} /> Filters
          </span>

          {/* Department Filter Dropdown */}
          {filters.departments.length > 0 && (
            <NativeDropdown
              label="Department"
              selectedValue={selectedDept}
              options={filters.departments}
              onSelect={(val) => handleFilterToggle('dept', val)}
            />
          )}

          {/* Course Filter Dropdown */}
          {filters.courses.length > 0 && (
            <NativeDropdown
              label="Course"
              selectedValue={selectedCourse}
              options={filters.courses}
              onSelect={(val) => handleFilterToggle('course', val)}
            />
          )}

          {/* Document Type Dropdown */}
          {filters.documentTypes.length > 0 && (
            <NativeDropdown
              label="Type"
              selectedValue={selectedType}
              options={filters.documentTypes}
              onSelect={(val) => handleFilterToggle('type', val)}
            />
          )}

          {/* Exam Type Dropdown */}
          {filters.examTypes.length > 0 && (
            <NativeDropdown
              label="Exam"
              selectedValue={selectedExam}
              options={filters.examTypes}
              onSelect={(val) => handleFilterToggle('exam', val)}
            />
          )}

          {/* Year Dropdown */}
          {filters.years.length > 0 && (
            <NativeDropdown
              label="Year"
              selectedValue={selectedYear}
              options={filters.years}
              onSelect={(val) => handleFilterToggle('year', val)}
            />
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <X size={13} /> Clear all filters
            </button>
          )}
        </div>

        {/* ── Search Status Header ───────────────────────────────────────── */}
        <div className="mb-6 flex justify-between items-center text-sm font-medium text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-800">{totalCount}</strong> document
            {totalCount !== 1 ? 's' : ''}
            {query && <span> for &ldquo;{query}&rdquo;</span>}
          </span>
          {loading && (
            <span className="flex items-center gap-2 text-blue-600 animate-pulse text-xs font-semibold">
              <Loader2 size={13} className="animate-spin" /> Searching...
            </span>
          )}
        </div>

        {/* ── Error Notification ─────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Loading Skeleton ───────────────────────────────────────────── */}
        {loading && documents.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-56 flex flex-col justify-between"
              >
                <div>
                  <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-5" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-3" />
                  <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-50 mt-4">
                  <div className="h-6 bg-slate-200 rounded-md w-24" />
                  <div className="h-6 bg-slate-200 rounded-md w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Search className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No study materials found</h3>
            <p className="text-slate-500 mb-8 max-w-md">
              Try searching with another keyword (e.g. &ldquo;B.Tech&rdquo;, &ldquo;Operating System&rdquo;,
              &ldquo;Semester 4&rdquo;), or clear your active filters.
            </p>
            <button
              onClick={handleClearAll}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          /* ── Result Cards Grid ────────────────────────────────────────── */
          <div className="space-y-8">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
                loading ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => {
                    const prevP = Math.max(0, page - 1);
                    setPage(prevP);
                    fetchResults(
                      query,
                      prevP,
                      selectedCourse,
                      selectedDept,
                      selectedType,
                      selectedExam,
                      selectedYear
                    );
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={page === 0 || loading}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm text-slate-700"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-600 px-3">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    const nextP = page + 1;
                    if (nextP < totalPages) {
                      setPage(nextP);
                      fetchResults(
                        query,
                        nextP,
                        selectedCourse,
                        selectedDept,
                        selectedType,
                        selectedExam,
                        selectedYear
                      );
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm text-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Individual Document Card ────────────────────────────────────────────────
const DocumentCard = React.memo(function DocumentCard({ doc }: { doc: DocumentItem }) {
  const courseDisplay = doc.course?.short_name || doc.course?.name || '';
  const semDisplay = doc.semester?.label || (doc.semester?.semester_number ? `Sem ${doc.semester.semester_number}` : '');

  return (
    <Link href={`/view/${doc.id}`} className="block h-full">
      <article className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
        {/* Subtle hover background highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10 pointer-events-none" />

        {/* Top: Title & Year */}
        <div className="flex justify-between items-start mb-4 gap-4 relative z-10">
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 line-clamp-2 leading-snug transition-colors">
            {doc.title}
          </h3>
          {doc.year && (
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap border border-slate-200 shadow-sm">
              {doc.year}
            </span>
          )}
        </div>

        {/* Middle: Details */}
        <div className="text-sm text-slate-600 mb-6 flex-grow space-y-2.5 relative z-10">
          {doc.subject?.name && (
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1 font-medium text-slate-700">
                {doc.subject.name}
                {doc.subject.subject_code && (
                  <span className="text-slate-400 text-xs font-normal ml-1">
                    ({doc.subject.subject_code})
                  </span>
                )}
              </span>
            </div>
          )}

          {courseDisplay && (
            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1 font-medium text-slate-700">
                {courseDisplay}
                {semDisplay && (
                  <span className="text-blue-600 font-bold ml-1.5">· {semDisplay}</span>
                )}
              </span>
            </div>
          )}

          {doc.department?.name && (
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1 text-slate-500 text-xs">
                {doc.department.name}
              </span>
            </div>
          )}
        </div>

        {/* Bottom: Badges & Call to action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 relative z-10 mt-auto">
          <div className="flex flex-wrap gap-2">
            {doc.document_type?.name && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100">
                <FileText size={12} /> {doc.document_type.name}
              </span>
            )}
            {doc.exam_type?.name && (
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-100">
                {doc.exam_type.name}
              </span>
            )}
          </div>

          <span className="text-sm font-bold text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1 group-hover:underline underline-offset-4 bg-blue-50/50 px-3 py-1.5 rounded-lg group-hover:bg-blue-100">
            View <span className="hidden sm:inline">Document</span> →
          </span>
        </div>
      </article>
    </Link>
  );
});

// ─── Filter Dropdown Component ───────────────────────────────────────────────
function NativeDropdown({
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
        className={`flex items-center gap-2 px-3.5 py-1.5 bg-white border rounded-lg text-sm font-medium transition-colors shadow-sm ${
          selectedValue
            ? 'border-blue-500 text-blue-700 bg-blue-50/60 font-semibold'
            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <span>{selectedValue || label}</span>
        {selectedValue && (
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            1
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform text-slate-400 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 max-h-72 overflow-y-auto">
          {selectedValue && (
            <button
              onClick={() => {
                onSelect('');
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border-b border-slate-100 flex items-center justify-between"
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
                className={`flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer group ${
                  isSelected ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300 group-hover:border-blue-400'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-slate-700 line-clamp-1">{opt.label}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  {opt.count}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
