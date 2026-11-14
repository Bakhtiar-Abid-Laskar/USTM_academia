import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { FileText, Download, Eye, ChevronRight, BookOpen } from "lucide-react";

export const revalidate = 3600;

export default async function SubjectDocumentsPage({
  params,
}: {
  params: { slug: string; semester: string; subject: string };
}) {
  const supabase = await createClient();

  const semNum = parseInt(params.semester.replace("semester-", ""));
  if (isNaN(semNum)) notFound();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!course) notFound();

  const { data: semester } = await supabase
    .from("semesters")
    .select("*")
    .eq("course_id", course.id)
    .eq("semester_number", semNum)
    .single();

  if (!semester) notFound();

  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", params.subject)
    .eq("semester_id", semester.id)
    .eq("course_id", course.id)
    .single();

  if (!subject) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("*, document_type:document_types(*), exam_type:exam_types(*)")
    .eq("subject_id", subject.id)
    .eq("status", "published")
    .order("document_type_id")
    .order("year", { ascending: false });

  const syllabusDocs = documents?.filter((d: any) => d.document_type_id === 1) || [];
  const questionPapers = documents?.filter((d: any) => d.document_type_id === 2) || [];

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* ── Editorial Header ─────────────────────────────────────────────── */}
        <section className="border-b border-border bg-surface py-12 sm:py-16 academic-grain">
          <div className="max-w-editorial mx-auto px-4 sm:px-8">
            {/* Breadcrumb Hierarchy */}
            <nav className="text-xs text-ink-muted mb-4 font-medium flex items-center flex-wrap gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-accent-gold transition-colors">
                Home
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <Link href="/courses" className="hover:text-accent-gold transition-colors">
                Courses
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <Link href={`/courses/${course.slug}`} className="hover:text-accent-gold transition-colors">
                {course.short_name}
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <Link href={`/courses/${course.slug}/${params.semester}`} className="hover:text-accent-gold transition-colors">
                {semester.label}
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <span className="text-ink font-semibold">{subject.name}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-gold font-sans">
                  {course.short_name} · {semester.label}
                </span>
                {subject.subject_code && (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span className="font-mono text-xs text-ink font-bold bg-surface-subtle border border-border px-2 py-0.5 rounded">
                      {subject.subject_code}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-ink tracking-tight mb-2">
                {subject.name}
              </h1>
              <p className="text-sm text-ink-muted">
                Official syllabus PDFs and historical examination question papers catalogued for this subject.
              </p>
            </div>
          </div>
        </section>

        {/* ── Documents Content ────────────────────────────────────────────── */}
        <div className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-12">
          {!documents || documents.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-surface max-w-lg mx-auto">
              <FileText size={32} className="mx-auto text-ink-faint mb-3" />
              <h3 className="font-semibold text-ink text-base">No papers archived yet</h3>
              <p className="text-xs text-ink-muted mt-1">
                Papers for this subject are currently being verified and will be uploaded soon.
              </p>
            </div>
          ) : (
            <>
              {/* Question Papers Section */}
              {questionPapers.length > 0 && (
                <section>
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-sans flex items-center gap-2">
                      <FileText size={16} className="text-accent-gold" />
                      Previous Year Question Papers ({questionPapers.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {questionPapers.map((doc: any) => (
                      <DocumentTile key={doc.id} doc={doc} />
                    ))}
                  </div>
                </section>
              )}

              {/* Syllabus Section */}
              {syllabusDocs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-sans flex items-center gap-2">
                      <BookOpen size={16} className="text-accent-navy" />
                      Course Syllabus ({syllabusDocs.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {syllabusDocs.map((doc: any) => (
                      <DocumentTile key={doc.id} doc={doc} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function DocumentTile({ doc }: { doc: any }) {
  return (
    <article className="bg-surface border border-border hover:border-accent-gold/60 rounded-xl p-5 shadow-fine hover:shadow-editorial transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-tabular text-xs font-bold px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink">
            {doc.year || "2025"}
          </span>
          {doc.exam_type?.name && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold">
              {doc.exam_type.name}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-base text-ink group-hover:text-accent-gold transition-colors leading-snug mb-3">
          {doc.title}
        </h3>
      </div>

      <div className="pt-3.5 border-t border-border flex items-center justify-between gap-2 mt-auto">
        <Link
          href={`/view/${doc.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink shadow-fine transition-colors"
        >
          <Eye size={13} className="text-ink-faint" />
          <span>View Online</span>
        </Link>

        {doc.is_downloadable && (
          <a
            href={doc.google_drive_view_url || doc.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink hover:bg-accent-navy text-surface text-xs font-semibold shadow-fine transition-colors"
          >
            <Download size={13} />
            <span>Download</span>
          </a>
        )}
      </div>
    </article>
  );
}
