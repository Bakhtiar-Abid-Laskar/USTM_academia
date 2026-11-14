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

  const semesterNum = parseInt(params.semester.replace("semester-", ""));
  if (isNaN(semesterNum)) notFound();

  // 1. Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, short_name, slug")
    .eq("slug", params.slug)
    .single();

  if (!course) notFound();

  // 2. Fetch semester
  const { data: semester } = await supabase
    .from("semesters")
    .select("id, semester_number, label")
    .eq("course_id", course.id)
    .eq("semester_number", semesterNum)
    .single();

  if (!semester) notFound();

  // 3. Fetch subject
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug, subject_code")
    .eq("course_id", course.id)
    .eq("semester_id", semester.id)
    .eq("slug", params.subject)
    .single();

  if (!subject) notFound();

  // 4. Fetch published documents for this subject
  const { data: documents } = await supabase
    .from("documents")
    .select(`
      id, title, year, file_url, is_downloadable, status,
      document_type_id,
      document_type:document_types(id, name, slug),
      exam_type:exam_types(name)
    `)
    .eq("subject_id", subject.id)
    .eq("status", "published")
    .order("year", { ascending: false });

  const questionPapers = (documents || []).filter(
    (d: any) => d.document_type_id === 2 || d.document_type?.slug === "question-paper"
  );
  const syllabusDocs = (documents || []).filter(
    (d: any) => d.document_type_id === 1 || d.document_type?.slug === "syllabus"
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* Header Section */}
        <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="text-xs text-[#64748B] mb-3 font-mono flex items-center flex-wrap gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#1D4ED8] transition-colors">
                Home
              </Link>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <Link href="/courses" className="hover:text-[#1D4ED8] transition-colors">
                Courses
              </Link>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <Link href={`/courses/${course.slug}`} className="hover:text-[#1D4ED8] transition-colors">
                {course.short_name}
              </Link>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <Link href={`/courses/${course.slug}/${params.semester}`} className="hover:text-[#1D4ED8] transition-colors">
                {semester.label}
              </Link>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <span className="text-[#172554] font-semibold">{subject.name}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] font-sans bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  {course.short_name} · {semester.label}
                </span>
                {subject.subject_code && (
                  <>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="font-mono text-xs text-[#172554] font-bold bg-white border border-[#DCE6F1] px-2 py-0.5 rounded">
                      {subject.subject_code}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-sans text-3xl sm:text-4xl font-bold text-[#172554] tracking-tight mb-2">
                {subject.name}
              </h1>
              <p className="text-sm text-[#64748B]">
                Official syllabus PDFs and historical examination question papers catalogued for this subject.
              </p>
            </div>
          </div>
        </section>

        {/* Documents Content */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
          {!documents || documents.length === 0 ? (
            <div className="p-14 text-center rounded-xl border border-dashed border-[#DCE6F1] bg-white max-w-lg mx-auto">
              <FileText size={32} className="mx-auto text-[#94A3B8] mb-2" />
              <h3 className="font-semibold text-[#172554] text-base">No papers archived yet</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Papers for this subject are currently being verified and will be uploaded soon.
              </p>
            </div>
          ) : (
            <>
              {/* Question Papers Section */}
              {questionPapers.length > 0 && (
                <section>
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F1] mb-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#172554] font-sans flex items-center gap-2">
                      <FileText size={16} className="text-[#1D4ED8]" />
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
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCE6F1] mb-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#172554] font-sans flex items-center gap-2">
                      <BookOpen size={16} className="text-[#0284C7]" />
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
    <article className="bg-white border border-[#DCE6F1] hover:border-[#2563EB] rounded-xl p-5 shadow-fine hover:shadow-card transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-tabular text-xs font-bold px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#172554]">
            {doc.year || "2025"}
          </span>
          {doc.exam_type?.name && (
            <span className="text-[11px] font-semibold text-[#1D4ED8] bg-[#F8FBFF] px-2 py-0.5 rounded border border-[#DCE6F1]">
              {doc.exam_type.name}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-base text-[#172554] group-hover:text-[#1D4ED8] transition-colors leading-snug mb-3">
          {doc.title}
        </h3>
      </div>

      <div className="pt-3 border-t border-[#DCE6F1] flex items-center justify-between gap-2 mt-auto">
        <Link
          href={`/view/${doc.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE6F1] bg-white hover:bg-[#F8FBFF] text-xs font-semibold text-[#172B4D] shadow-fine transition-colors"
        >
          <Eye size={13} className="text-[#64748B]" />
          <span>View Online</span>
        </Link>

        {doc.is_downloadable && (
          <a
            href={doc.google_drive_view_url || doc.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-fine transition-colors"
          >
            <Download size={13} />
            <span>Download</span>
          </a>
        )}
      </div>
    </article>
  );
}
