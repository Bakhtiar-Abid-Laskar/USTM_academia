'use client';

import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { 
  InstantSearch, 
  SearchBox, 
  Hits, 
  RefinementList, 
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
    <div className="w-full max-w-7xl mx-auto p-4">
      <InstantSearch searchClient={searchClient as any} indexName="documents_index">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="col-span-1 space-y-6 hidden md:block">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-semibold mb-3 text-slate-800 flex items-center justify-between">
                Document Type
              </h4>
              <RefinementList 
                attribute="document_type" 
                classNames={{
                  label: 'flex items-center gap-3 text-sm text-slate-600 my-2 cursor-pointer hover:text-blue-600 transition-colors',
                  checkbox: 'rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4',
                  count: 'bg-slate-100 px-2 py-0.5 rounded-full text-xs ml-auto text-slate-500',
                  list: 'space-y-2'
                }}
              />
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-semibold mb-3 text-slate-800">Department</h4>
              <RefinementList 
                attribute="department" 
                searchable 
                searchablePlaceholder="Search departments..."
                classNames={{
                  label: 'flex items-center gap-3 text-sm text-slate-600 my-2 cursor-pointer hover:text-blue-600 transition-colors',
                  checkbox: 'rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4',
                  count: 'bg-slate-100 px-2 py-0.5 rounded-full text-xs ml-auto text-slate-500',
                  list: 'space-y-2',
                  searchBox: 'mb-3 [&_input]:w-full [&_input]:p-2 [&_input]:text-sm [&_input]:rounded-md [&_input]:border [&_input]:border-slate-200 [&_input]:outline-none [&_input]:focus:border-blue-500'
                }}
              />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <h4 className="font-semibold mb-3 text-slate-800">Exam Type</h4>
              <RefinementList 
                attribute="exam_type" 
                classNames={{
                  label: 'flex items-center gap-3 text-sm text-slate-600 my-2 cursor-pointer hover:text-blue-600 transition-colors',
                  checkbox: 'rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4',
                  count: 'bg-slate-100 px-2 py-0.5 rounded-full text-xs ml-auto text-slate-500',
                  list: 'space-y-2'
                }}
              />
            </div>
          </div>

          {/* Main Search Area */}
          <div className="col-span-1 md:col-span-3">
            <div className="relative mb-6">
              <SearchBox 
                placeholder="Search subjects, PYQs, syllabuses..."
                classNames={{
                  root: 'w-full shadow-sm rounded-xl',
                  form: 'relative flex items-center',
                  input: 'w-full p-4 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-lg transition-all',
                  submitIcon: 'absolute left-4 text-slate-400 w-5 h-5',
                  resetIcon: 'absolute right-12 text-slate-400 w-4 h-4 hover:text-slate-600 cursor-pointer'
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
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
  );
}
