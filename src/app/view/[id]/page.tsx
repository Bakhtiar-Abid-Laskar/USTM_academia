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
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1 flex flex-col">
        {/* Document Masthead Bar */}
        <section className="bg-white border-b border-[#DCE6F1] sticky top-16 z-20 shadow-fine">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Column: Navigation & Document Identification */}
              <div className="min-w-0 flex-1">
                {/* Academic Breadcrumb trail */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2 font-mono flex-wrap">
                  <Link
                    href={backUrl}
                    className="inline-flex items-center gap-1 hover:text-[#1D4ED8] transition-colors font-medium text-[#64748B] hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Subject</span>
                  </Link>
                  <span className="text-[#BFD0E2]">/</span>
                  {doc.course && (
                    <>
                      <span>{doc.course.short_name || doc.course.name}</span>
                      <span className="text-[#BFD0E2]">/</span>
                    </>
                  )}
                  {doc.semester && (
                    <>
                      <span>Sem {doc.semester.semester_number}</span>
                      <span className="text-[#BFD0E2]">/</span>
                    </>
                  )}
                  {doc.subject && (
                    <span className="truncate max-w-[220px] text-[#172554] font-semibold">{doc.subject.name}</span>
                  )}
                </nav>

                {/* Primary Document Title */}
                <h1 className="font-sans text-xl sm:text-2xl text-[#172554] font-bold tracking-tight leading-snug truncate">
                  {doc.title}
                </h1>

                {/* Archival Specification Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${
                      isSyllabus
                        ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                        : "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                    }`}
                  >
                    {isSyllabus ? <BookOpen className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                    {docTypeName}
                  </span>

                  {doc.year && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-[#F8FBFF] text-[#172554] border border-[#DCE6F1]">
                      <Calendar className="w-3 h-3 text-[#64748B]" />
                      {doc.year}
                    </span>
                  )}

                  {doc.exam_type && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-[#F8FBFF] text-[#64748B] border border-[#DCE6F1]">
                      <Layers className="w-3 h-3 text-[#64748B]" />
                      {doc.exam_type.name}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded hidden sm:inline-flex">
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
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white transition-all shadow-fine"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Paper</span>
                  </a>
                )}

                {directUrl && (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-white hover:bg-[#F8FBFF] text-[#172B4D] border border-[#DCE6F1] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Open in Tab</span>
                  </a>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Reader Canvas / Document Embed Frame */}
        <section className="flex-1 bg-[#EFF6FF] py-4 sm:py-6 px-3 sm:px-6">
          <div className="max-w-6xl mx-auto h-full">
            <div className="bg-white rounded-xl border border-[#DCE6F1] shadow-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 190px)", minHeight: "580px" }}>
              {/* Document Reader Frame Header */}
              <div className="px-4 py-2.5 bg-[#F8FBFF] border-b border-[#DCE6F1] flex items-center justify-between text-xs font-mono text-[#64748B]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{doc.title}.pdf</span>
                </div>
                <span className="hidden sm:inline-block text-[11px] text-[#94A3B8]">
                  Interactive Document Viewer
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
        <div className="sm:hidden px-4 py-3 bg-white border-t border-[#DCE6F1] flex items-center justify-between gap-3">
          <div className="text-xs text-[#64748B] leading-tight">
            Having trouble viewing the PDF?
          </div>
          {directUrl && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1D4ED8] text-white flex-shrink-0"
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
