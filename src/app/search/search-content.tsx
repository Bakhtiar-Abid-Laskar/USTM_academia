"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Eye, Download, Inbox, AlertCircle } from "lucide-react";

interface SearchResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  query?: string;
}

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // ✅ FIX #6: Debounce timer reference
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const MIN_SEARCH_LENGTH = 2;
  const DEBOUNCE_DELAY_MS = 300;

  useEffect(() => {
    if (initialQ) doSearch(initialQ, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = useCallback(async (q: string, pageNum: number = 0) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    if (q.trim().length < MIN_SEARCH_LENGTH) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        page: String(pageNum),
        limit: "20",
      });
      const res = await fetch(`/api/search?${params}`);
      
      if (!res.ok) {
        if (res.status === 429) {
          setError("Search rate limit exceeded. Please wait a moment and try again.");
        } else if (res.status === 400) {
          setError("Search query is too long. Please use fewer characters.");
        } else {
          setError("Search failed. Please try again later.");
        }
        setResults([]);
        setTotalPages(0);
        return;
      }

      const data: SearchResponse = await res.json();
      if (Array.isArray(data.data)) {
        setResults(data.data);
        setTotalPages(data.pages || 0);
        setPage(pageNum);
      } else {
        setError("Unexpected response format");
        setResults([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Network error. Please check your connection and try again.");
      setResults([]);
      setTotalPages(0);
    }
    setLoading(false);
  }, []);

  // ✅ FIX #6: Debounce input change
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    
    // Cancel previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      if (value.trim().length < MIN_SEARCH_LENGTH) {
        setResults([]);
        setSearched(false);
        return;
      }

      router.replace(`/search?q=${encodeURIComponent(value.trim())}`);
      doSearch(value, 0);
    }, DEBOUNCE_DELAY_MS);
  }, [doSearch, router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Cancel debounce and search immediately
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
    doSearch(query, 0);
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      doSearch(query, page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      doSearch(query, page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-6">Search Documents</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search by title, subject, course... (min 2 characters)"
            value={query}
            onChange={e => handleInputChange(e.target.value)}
            className="pl-10"
            autoFocus
            maxLength={200}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6 flex gap-3 animate-slide-up">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-text-muted">Searching...</p>
        </div>
      ) : !searched ? (
        <div className="text-center py-16 text-text-muted animate-fade-in">
          <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">Search for documents</p>
          <p className="text-sm">Enter a course name, subject, or keyword to find question papers and syllabi.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-text-muted animate-fade-in">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">No results found</p>
          <p className="text-sm">Try different keywords or browse by course.</p>
          <Link href="/courses"><Button variant="outline" className="mt-4">Browse Courses</Button></Link>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-muted">
              {results.length} result{results.length !== 1 ? "s" : ""} found
              {totalPages > 1 && ` (Page ${page + 1} of ${totalPages})`}
            </p>
          </div>
          
          <div className="space-y-3">
            {results.map((doc: any, index: number) => (
              <div key={doc.id} className="will-animate animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-main text-sm sm:text-base">{doc.title}</h3>
                        <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-text-muted">
                          <span>{doc.course?.short_name}</span>
                          <span>•</span>
                          <span>{doc.semester?.label}</span>
                          <span>•</span>
                          <span>{doc.subject?.name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant={doc.document_type?.slug === "syllabus" ? "default" : "outline"}>
                            {doc.document_type?.name}
                          </Badge>
                          {doc.exam_type && <Badge variant="outline">{doc.exam_type.name}</Badge>}
                          {doc.year && <Badge variant="outline">{doc.year}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/view/${doc.id}`}>
                          <Button size="sm"><Eye className="h-3.5 w-3.5 mr-1.5" />View</Button>
                        </Link>
                        {doc.is_downloadable && (
                          <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Download</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* ✅ FIX #5: Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={page === 0 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page >= totalPages - 1 || loading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
