'use client';

import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { 
  InstantSearch, 
  SearchBox, 
  Hits, 
  Pagination,
  useInstantSearch
} from 'react-instantsearch';
import { FileText, Loader2, Calendar } from 'lucide-react';

// Use the Search-Only API key for the frontend
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'APP_ID',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'SEARCH_KEY'
);

// Loading State Component
const LoadingIndicator = () => {
  const { status } = useInstantSearch();
  if (status === 'loading' || status === 'stalled') {
    return <Loader2 className="animate-spin text-blue-600 h-5 w-5" />;
  }
  return null;
};

// Define hit type based on our indexed data
type AlgoliaDocumentHit = {
  objectID: string;
  title: string;
  year: number;
  file_url: string;
  status: string;
  subject: { name: string; code: string };
  course: { name: string; short_name: string };
  department: string;
  semester: number;
  document_type: string;
  exam_type: string;
};

// Custom Hit (Card) Component
const HitCard = ({ hit }: { hit: AlgoliaDocumentHit }) => {
  return (
    <a 
      href={hit.file_url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block border rounded-xl p-5 hover:shadow-lg transition bg-white cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600 line-clamp-2">
          {hit.title}
        </h3>
        {hit.year && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1">
            <Calendar size={12} /> {hit.year}
          </span>
        )}
      </div>
      
      <div className="text-sm text-slate-500 space-y-1 mb-4">
        {hit.subject && (
          <p>
            <span className="font-medium text-slate-700">Subject:</span> {hit.subject.name} {hit.subject.code ? `(${hit.subject.code})` : ''}
          </p>
        )}
        {hit.course && (
          <p>
            <span className="font-medium text-slate-700">Course:</span> {hit.course.short_name || hit.course.name} 
            {hit.semester && ` - Sem ${hit.semester}`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {hit.document_type && (
          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">
            <FileText size={14} /> {hit.document_type}
          </span>
        )}
        {hit.exam_type && (
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">
            {hit.exam_type}
          </span>
        )}
      </div>
    </a>
  );
};

export default function GlobalSearch() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white pt-20 pb-24 px-4 shadow-inner mb-10 text-center rounded-b-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Find Your Study Materials <br className="hidden md:block"/> In Seconds.
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto opacity-90">
          Search thousands of USTM question papers, syllabi, and academic documents instantly.
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 pb-12">
        <InstantSearch searchClient={searchClient as any} indexName="documents_index">
          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            {/* Main Search Area */}
            <div className="w-full -mt-24 z-10 relative">
              <div className="relative mb-8">
                <SearchBox 
                  placeholder="Search subjects, PYQs, syllabuses..."
                  classNames={{
                    root: 'w-full shadow-2xl rounded-2xl bg-white',
                    form: 'relative flex items-center',
                    input: 'w-full p-5 pl-14 pr-12 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 outline-none text-xl transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
                    submitIcon: 'absolute left-5 text-blue-500 w-6 h-6',
                    resetIcon: 'absolute right-5 text-slate-300 w-5 h-5 hover:text-slate-500 cursor-pointer transition-colors'
                  }}
                />
                <div className="absolute right-14 top-1/2 -translate-y-1/2">
                  <LoadingIndicator />
                </div>
              </div>

            {/* Results Grid */}
            <Hits 
              hitComponent={({ hit }) => <HitCard hit={hit as unknown as AlgoliaDocumentHit} />} 
              classNames={{
                list: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
                item: 'list-none'
              }}
            />

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <Pagination 
                classNames={{
                  list: 'flex gap-2 items-center',
                  item: 'flex items-center justify-center min-w-[32px] h-8 rounded-md bg-white border border-slate-200 text-sm hover:bg-slate-50 cursor-pointer transition-colors',
                  selectedItem: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
                  disabledItem: 'opacity-50 cursor-not-allowed hover:bg-white',
                  link: 'w-full h-full flex items-center justify-center px-3'
                }}
              />
            </div>
          </div>
          
        </div>
      </InstantSearch>
      </div>
    </div>
  );
}
