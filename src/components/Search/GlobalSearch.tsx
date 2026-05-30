'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import algoliasearch from 'algoliasearch/lite';
import { 
  InstantSearch, 
  Hits, 
  Pagination,
  useInstantSearch,
  useSearchBox,
  useRefinementList
} from 'react-instantsearch';
import { FileText, Search, X, ChevronDown, Check, BookOpen, Clock, Building2, GraduationCap, AlertTriangle } from 'lucide-react';

// Create the Algolia client ONCE at module level — never inside a component.
// The `as any` cast bridges algoliasearch v4's type with react-instantsearch v7's expected type.
const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ''
);

// Wrap the client to avoid firing a search on empty query (initial mount).
// This prevents the flood of requests and unnecessary network calls when the page loads.
const searchClient = {
  ...algoliaClient,
  search(requests: any[]) {
    // If every request has an empty query, skip the network call entirely
    if (requests.every(({ params }: any) => !params?.query || params.query.trim() === '')) {
      return Promise.resolve({
        results: requests.map(() => ({
          hits: [],
          nbHits: 0,
          nbPages: 0,
          page: 0,
          processingTimeMS: 0,
          hitsPerPage: 20,
          exhaustiveNbHits: true,
          query: '',
          params: '',
          facets: {},
        })),
      });
    }
    return algoliaClient.search(requests);
  },
};

type AlgoliaDocumentHit = {
  objectID: string;
  title: string;
  year: number;
  file_url: string;
  status: string;
  subject: { name: string; code?: string; subject_code?: string };
  course: { name: string; short_name: string };
  department: string;
  semester: number;
  document_type: string;
  exam_type: string;
};

// 1. Custom Interactive SearchBox with popular chips
function CustomSearchBox() {
  const { query, refine, clear } = useSearchBox();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const popularSearches = [
    "B.Tech CSE", 
    "Previous Year Paper", 
    "Semester 4", 
    "Syllabus"
  ];

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full -mt-24 z-20 relative max-w-4xl mx-auto px-4">
       {/* Trust badges */}
       <div className="hidden md:flex flex-wrap justify-center gap-6 mb-6 text-sm font-medium text-blue-50/90 drop-shadow-sm">
         <span className="flex items-center gap-2"><FileText size={16} /> Previous Year Papers</span>
         <span className="flex items-center gap-2"><BookOpen size={16} /> Syllabi</span>
         <span className="flex items-center gap-2"><Clock size={16} /> Notes</span>
         <span className="flex items-center gap-2"><Building2 size={16} /> Department Resources</span>
       </div>

       {/* Input */}
       <div className="relative mb-6 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-6 h-6 transition-transform group-focus-within:scale-110" />
          <input 
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => refine(e.target.value)}
            placeholder="Search by subject, course, semester, or paper type..."
            className="w-full p-5 pl-16 pr-16 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white border border-transparent focus:border-blue-100 focus:ring-4 focus:ring-blue-500/20 outline-none text-lg md:text-xl transition-all [&::-webkit-search-cancel-button]:hidden text-slate-800 placeholder-slate-400"
          />
          {query && (
            <button 
              onClick={clear}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
       </div>

       {/* Chips */}
       <div className="flex flex-wrap justify-center gap-2">
          {popularSearches.map((chip, idx) => (
            <button 
              key={idx}
              onClick={() => refine(chip)}
              className="px-4 py-1.5 bg-white/90 hover:bg-white text-slate-800 border border-white/80 rounded-full text-xs md:text-sm font-semibold transition-all backdrop-blur-md shadow-sm hover:scale-105 hover:shadow-md"
            >
              {chip}
            </button>
          ))}
       </div>
    </div>
  )
}

// 2. Clean Dropdown Filters
function FilterDropdown({ attribute, label }: { attribute: string, label: string }) {
  const { items, refine } = useRefinementList({ attribute, limit: 10 });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (items.length === 0) return null;

  const activeCount = items.filter(i => i.isRefined).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-colors shadow-sm ${activeCount > 0 ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}
      >
        {label}
        {activeCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeCount}</span>}
        <ChevronDown size={14} className={`transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 max-h-72 overflow-y-auto animate-fade-in">
            {items.map(item => (
              <label 
                key={item.value} 
                onClick={() => refine(item.value)}
                className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${item.isRefined ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                    {item.isRefined && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-slate-700 line-clamp-1">{item.label}</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">{item.count}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// 3. Premium Card Design (Semantic <article>)
const HitCard = ({ hit }: { hit: AlgoliaDocumentHit }) => {
  return (
    <Link href={`/view/${hit.objectID}`} className="block h-full">
      <article className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
      
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10 pointer-events-none" />

        {/* Top: Title & Year */}
        <div className="flex justify-between items-start mb-4 gap-4 relative z-10">
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 line-clamp-2 leading-snug transition-colors">
            {hit.title}
          </h3>
          {hit.year && (
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap border border-slate-200 shadow-sm">
              {hit.year}
            </span>
          )}
        </div>
        
        {/* Middle: Details */}
        <div className="text-sm text-slate-600 mb-6 flex-grow space-y-2.5 relative z-10">
          {hit.subject && (
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1 font-medium text-slate-700">{hit.subject.name}{(hit.subject.code || hit.subject.subject_code) ? <span className="text-slate-400 text-xs font-normal"> ({hit.subject.code || hit.subject.subject_code})</span> : null}</span>
            </div>
          )}
          {hit.course && (
            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1 font-medium text-slate-700">{hit.course.name} {hit.semester && <span className="text-blue-600 font-bold ml-1">· Sem {hit.semester}</span>}</span>
            </div>
          )}
        </div>

        {/* Bottom: Badges & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 relative z-10 mt-auto">
          <div className="flex flex-wrap gap-2">
            {hit.document_type && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100">
                <FileText size={12} /> {hit.document_type}
              </span>
            )}
            {hit.exam_type && (
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-100">
                {hit.exam_type}
              </span>
            )}
          </div>
          
          <span 
            className="text-sm font-bold text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1 group-hover:underline underline-offset-4 bg-blue-50/50 px-3 py-1.5 rounded-lg group-hover:bg-blue-100"
          >
            View <span className="hidden sm:inline">Document</span> &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
};

// 4. Results Wrapper (Loading, Empty, & Error States)
function ResultsWrapper({ children }: { children: React.ReactNode }) {
  const { status, results, error } = useInstantSearch();

  // Error State — Algolia connection failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-red-200 shadow-sm">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Search temporarily unavailable</h3>
        <p className="text-slate-500 mb-8 max-w-md">We&apos;re having trouble connecting to our search service. Please try again in a moment.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasQuery = results?.query && results.query.trim() !== '';
  const isSearching = status === 'loading' || status === 'stalled';
  const hasHits = results && results.hits && results.hits.length > 0;

  // Initial state — no query yet
  if (!hasQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <Search className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Start searching</h3>
        <p className="text-slate-500 max-w-md">Type a subject name, course, semester, or keyword above to find study materials.</p>
      </div>
    );
  }

  // Loading State (Skeleton) — Only on initial search before hits arrive
  if (isSearching && !hasHits) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-56 flex flex-col justify-between">
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
    );
  }

  // Empty State
  if (!hasHits && !isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <Search className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">No study materials found</h3>
        <p className="text-slate-500 mb-8 max-w-md">Try searching with another subject, course, semester, or year. You can also try clearing your filters.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Clear Search & Filters
        </button>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-200 ${isSearching ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="mb-6 flex justify-between items-center text-sm font-medium text-slate-500 px-1">
        <span>Showing {results?.nbHits || 0} results</span>
      </div>
      {children}
    </div>
  );
}

// 5. Main Component Assembly
export default function GlobalSearch() {
  return (
    <div className="w-full flex flex-col min-h-screen pb-20">
      
      {/* Hero Section Redesign */}
      <div className="bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pt-20 pb-36 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-[#0f172a] z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">
            Find Study Materials <span className="text-blue-400">Faster</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Search previous year question papers, syllabi, notes, and academic resources from USTM in seconds.
          </p>
        </div>
      </div>

      <InstantSearch 
        searchClient={searchClient as any} 
        indexName="documents_index"
        stalledSearchDelay={500}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <CustomSearchBox />
        
        <div className="w-full max-w-7xl mx-auto px-4 mt-12">
          
          {/* Horizontal Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-800 mr-2 flex items-center gap-2">
               Filters
            </span>
            <FilterDropdown attribute="department" label="Department" />
            <FilterDropdown attribute="course.name" label="Course" />
            <FilterDropdown attribute="document_type" label="Type" />
            <FilterDropdown attribute="exam_type" label="Exam" />
            <FilterDropdown attribute="year" label="Year" />
          </div>

          {/* Results Area */}
          <ResultsWrapper>
            <Hits 
              hitComponent={({ hit }) => <HitCard hit={hit as unknown as AlgoliaDocumentHit} />} 
              classNames={{
                list: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
                item: 'list-none h-full'
              }}
            />

            <div className="mt-12 flex justify-center">
              <Pagination 
                classNames={{
                  list: 'flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm',
                  item: 'flex items-center justify-center min-w-[36px] h-9 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-slate-100 text-slate-700',
                  selectedItem: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md',
                  disabledItem: 'opacity-40 cursor-not-allowed hover:bg-transparent',
                  link: 'w-full h-full flex items-center justify-center px-3'
                }}
              />
            </div>
          </ResultsWrapper>
          
        </div>
      </InstantSearch>
    </div>
  );
}
