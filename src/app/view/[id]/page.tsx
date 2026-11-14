import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Download, ArrowLeft, ExternalLink, Calendar, BookOpen, Layers, ShieldCheck, GraduationCap } from "lucide-react";
import { Metadata } from "next";

// Enable ISR: Cache page for 1 hour, then revalidate in background
export const revalidate = 3600; // 1 hour in seconds

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("title, document_type:document_types(name)")
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (!doc) {
    return {
      title: "Document Not Found — USTM Academia",
      description: "The document you are looking for is not available in the archive.",
    };
  }

  const docTypeName = doc.document_type?.[0]?.name || "Document";

  return {
    title: `${doc.title} (${docTypeName}) — USTM Academia`,
    description: `${doc.title} — Official ${docTypeName} for University of Science and Technology Meghalaya (USTM). Access or download from the institutional archive.`,
    keywords: [doc.title, docTypeName, "USTM", "Question Paper", "Syllabus", "Meghalaya"],
    openGraph: {
      title: `${doc.title} — USTM Academia`,
      description: `Official ${docTypeName} from USTM Academia`,
      url: `https://ustm-academia.vercel.app/view/${params.id}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: doc.title,
      description: `Official ${docTypeName} from USTM Academia`,
    },
  };
}

export default async function ViewDocumentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select(`
      *, 
      course:courses(short_name, name, slug),
      semester:semesters(label, semester_number),
      subject:subjects(name, slug),
      document_type:document_types(name, slug),
      exam_type:exam_types(name)
    `)
    .eq("id", params.id)
    .eq("status", "published")
    .single();

  if (!doc) notFound();

  const isSyllabus = doc.document_type?.[0]?.slug === "syllabus";
  const docTypeName = doc.document_type?.[0]?.name || (isSyllabus ? "Syllabus" : "Question Paper");
  const directUrl = doc.google_drive_view_url || doc.file_url;
  const embedUrl = doc.google_drive_preview_url || `${doc.file_url}#toolbar=1&navpanes=0`;

  const backUrl = doc.course && doc.semester && doc.subject
    ? `/courses/${doc.course.slug}/semester-${doc.semester.semester_number}/${doc.subject.slug}`
    : doc.course
    ? `/courses/${doc.course.slug}`
    : "/courses";

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1 flex flex-col">
        {/* Archival Masthead Bar */}
        <section className="bg-surface border-b border-border/80 sticky top-16 z-20 backdrop-blur-md bg-surface/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Column: Navigation & Document Identification */}
              <div className="min-w-0 flex-1">
                {/* Academic Breadcrumb trail */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-2 font-mono flex-wrap">
                  <Link
                    href={backUrl}
                    className="inline-flex items-center gap-1 hover:text-ink transition-colors font-medium text-ink-muted hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Subject</span>
                  </Link>
                  <span className="text-border-strong">/</span>
                  {doc.course && (
                    <>
                      <span>{doc.course.short_name || doc.course.name}</span>
                      <span className="text-border-strong">/</span>
                    </>
                  )}
                  {doc.semester && (
                    <>
                      <span>Sem {doc.semester.semester_number}</span>
                      <span className="text-border-strong">/</span>
                    </>
                  )}
                  {doc.subject && (
                    <span className="truncate max-w-[200px] text-ink font-semibold">{doc.subject.name}</span>
                  )}
                </nav>

                {/* Primary Document Title */}
                <h1 className="font-editorial-heading text-lg sm:text-2xl text-ink font-semibold tracking-tight leading-snug truncate">
                  {doc.title}
                </h1>

                {/* Archival Specification Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                      isSyllabus
                        ? "bg-accent-gold-bg text-accent-gold border-accent-gold/40"
                        : "bg-accent-crimson-bg text-accent-crimson border-accent-crimson/40"
                    }`}
                  >
                    {isSyllabus ? <BookOpen className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                    {docTypeName}
                  </span>

                  {doc.year && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-surface-subtle text-ink-muted border border-border">
                      <Calendar className="w-3 h-3 opacity-70" />
                      {doc.year}
                    </span>
                  )}

                  {doc.exam_type && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-surface-subtle text-ink-muted border border-border">
                      <Layers className="w-3 h-3 opacity-70" />
                      {doc.exam_type.name}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-faint hidden sm:inline-flex">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Official Record
                  </span>
                </div>
              </div>

              {/* Right Column: Download & External View Actions */}
              <div className="flex items-center gap-2.5 flex-shrink-0 pt-1 lg:pt-0">
                {doc.is_downloadable && directUrl && (
                  <a
                    href={directUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-ink text-paper hover:bg-ink/90 active:scale-[0.98] transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-accent-gold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Archive</span>
                  </a>
                )}

                {directUrl && (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-surface hover:bg-surface-subtle text-ink border border-border active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-accent-gold"
                  >
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    <span>Open in Tab</span>
                  </a>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Reader Canvas / Document Embed Chamber */}
        <section className="flex-1 bg-surface-subtle/40 academic-grain py-4 sm:py-6 px-2 sm:px-6">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 190px)", minHeight: "580px" }}>
              {/* Document Reader Frame Header */}
              <div className="px-4 py-2.5 bg-surface-subtle/80 border-b border-border flex items-center justify-between text-xs font-mono text-ink-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{doc.title}.pdf</span>
                </div>
                <span className="hidden sm:inline-block text-[11px] text-ink-faint">
                  Document Reader View • Interactive Preview
                </span>
              </div>

              {/* Responsive PDF Iframe */}
              <div className="flex-1 w-full relative bg-slate-900/5">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  title={doc.title}
                  allow="autoplay"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Fast-Action Utility Banner */}
        <div className="sm:hidden px-4 py-3 bg-surface border-t border-border flex items-center justify-between gap-3">
          <div className="text-xs text-ink-muted leading-tight">
            Having trouble scrolling the PDF?
          </div>
          {directUrl && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-ink text-paper flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </a>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
