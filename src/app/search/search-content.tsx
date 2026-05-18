"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Eye, Download, Inbox } from "lucide-react";

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
    doSearch(query);
  }

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-6">Search Documents</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search by title, subject, course..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-text-muted">Searching...</p>
        </div>
      ) : !searched ? (
        <div className="text-center py-16 text-text-muted">
          <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">Search for documents</p>
          <p className="text-sm">Enter a course name, subject, or keyword to find question papers and syllabi.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">No results found</p>
          <p className="text-sm">Try different keywords or browse by course.</p>
          <Link href="/courses"><Button variant="outline" className="mt-4">Browse Courses</Button></Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-text-muted mb-4">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          <div className="space-y-3">
            {results.map((doc: any) => (
              <Card key={doc.id}>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
