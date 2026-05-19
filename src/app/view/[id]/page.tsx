import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";

// Enable ISR: Cache page for 1 hour, then revalidate in background
export const revalidate = 3600; // 1 hour in seconds

export default async function ViewDocumentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select(`
      *, 
      course:courses(short_name, slug),
      semester:semesters(label, semester_number),
      subject:subjects(name, slug),
      document_type:document_types(name, slug),
      exam_type:exam_types(name)
    `)
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (!doc) notFound();

  const backUrl = doc.course && doc.semester && doc.subject
    ? `/courses/${doc.course.slug}/semester-${doc.semester.semester_number}/${doc.subject.slug}`
    : "/courses";

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        {/* Info Bar */}
        <div className="bg-white border-b border-border">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link href={backUrl}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-text-main text-sm sm:text-base truncate">{doc.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {doc.course && <span className="text-xs text-text-muted">{doc.course.short_name}</span>}
                  {doc.semester && <><span className="text-xs text-text-muted">•</span><span className="text-xs text-text-muted">{doc.semester.label}</span></>}
                  {doc.subject && <><span className="text-xs text-text-muted">•</span><span className="text-xs text-text-muted">{doc.subject.name}</span></>}
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
                {doc.is_downloadable && (
                  <a href={doc.google_drive_view_url || doc.file_url} download target="_blank" rel="noopener noreferrer">
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </Button>
                  </a>
                )}
                <a href={doc.google_drive_view_url || doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Open in Tab
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Embed */}
        <div className="flex-1 bg-gray-100">
          <div className="max-w-5xl mx-auto px-0 sm:px-4 py-0 sm:py-4">
            <div className="bg-white sm:rounded-lg sm:shadow-md overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
              <iframe
                src={doc.google_drive_preview_url || `${doc.file_url}#toolbar=1&navpanes=0`}
                className="w-full h-full"
                title={doc.title}
                allow="autoplay"
              />
            </div>
          </div>
        </div>

        {/* Mobile fallback */}
        <div className="sm:hidden px-4 py-4 text-center bg-white border-t border-border">
          <p className="text-sm text-text-muted mb-3">
            If the PDF is not loading, tap the button below to open it directly.
          </p>
          <a href={doc.google_drive_view_url || doc.file_url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open PDF in Browser
            </Button>
          </a>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
