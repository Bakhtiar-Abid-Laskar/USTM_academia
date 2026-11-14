import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { FileText, ArrowUpRight, ChevronRight, BookOpen } from "lucide-react";

export const revalidate = 3600;

export default async function SemesterSubjectsPage({
  params,
}: {
  params: { slug: string; semester: string };
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

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, documents(id, document_type_id)")
    .eq("course_id", course.id)
    .eq("semester_id", semester.id)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* ── Editorial Header ─────────────────────────────────────────────── */}
        <section className="border-b border-border bg-surface py-12 sm:py-16 academic-grain">
          <div className="max-w-editorial mx-auto px-4 sm:px-8">
            {/* Breadcrumb */}
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
              <span className="text-ink font-semibold">{semester.label}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-wider text-accent-gold font-sans mb-1">
                {course.short_name} · Semester Curriculum
              </div>
              <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-ink tracking-tight mb-2">
                {semester.label}
              </h1>
              <p className="text-sm text-ink-muted">
                {course.name}
              </p>
            </div>
          </div>
        </section>

        {/* ── Subject Cards Grid ───────────────────────────────────────────── */}
        <div className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-8">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-accent-gold" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-sans">
                Curriculum Subjects
              </h2>
            </div>
            <span className="text-xs font-medium text-ink-muted">
              Select a subject to view syllabi and past exam papers
            </span>
          </div>

          {!subjects || subjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface max-w-lg mx-auto">
              <FileText size={28} className="mx-auto text-ink-faint mb-3" />
              <h3 className="font-semibold text-ink">No subjects catalogued yet</h3>
              <p className="text-xs text-ink-muted mt-1">Subjects for this semester will be updated soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject: any) => {
                const docList = subject.documents || [];
                const syllabusCount = docList.filter((d: any) => d.document_type_id === 1).length;
                const qpCount = docList.filter((d: any) => d.document_type_id === 2).length;

                return (
                  <Link
                    key={subject.id}
                    href={`/courses/${course.slug}/${params.semester}/${subject.slug}`}
                    className="block group h-full"
                  >
                    <article className="h-full bg-surface border border-border hover:border-accent-gold/60 rounded-xl p-6 shadow-fine hover:shadow-editorial transition-all duration-200 flex flex-col justify-between group-hover:-translate-y-0.5">
                      <div>
                        {/* Subject Code badge if present */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          {subject.subject_code ? (
                            <span className="font-mono text-[11px] font-bold text-accent-gold bg-accent-gold-bg px-2 py-0.5 rounded border border-accent-gold/30">
                              {subject.subject_code}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-ink-faint tracking-wider">
                              Subject
                            </span>
                          )}
                        </div>

                        {/* Subject Title */}
                        <h3 className="font-semibold text-base sm:text-lg text-ink group-hover:text-accent-gold transition-colors leading-snug mb-4">
                          {subject.name}
                        </h3>
                      </div>

                      {/* Paper Counts Badges */}
                      <div className="pt-4 border-t border-border flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {qpCount > 0 && (
                            <span className="font-tabular px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink-muted text-[11px] font-medium">
                              {qpCount} PYQ{qpCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {syllabusCount > 0 && (
                            <span className="font-tabular px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink-muted text-[11px] font-medium">
                              Syllabus
                            </span>
                          )}
                          {qpCount === 0 && syllabusCount === 0 && (
                            <span className="text-ink-faint text-[11px]">No papers yet</span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 font-bold text-accent-gold group-hover:translate-x-1 transition-transform">
                          <span>View</span>
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
