import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Building2, BookOpen, ArrowUpRight, ChevronRight, Layers, GraduationCap } from "lucide-react";

export const revalidate = 3600;

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, department:departments(name, code)")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!course) notFound();

  // Fetch semesters with subjects
  const { data: semesters } = await supabase
    .from("semesters")
    .select("*, subjects(id)")
    .eq("course_id", course.id)
    .eq("is_active", true)
    .order("semester_number");

  const deptName =
    typeof course.department === "object" && course.department
      ? course.department.name
      : course.department;

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* ── Editorial Header ─────────────────────────────────────────────── */}
        <section className="border-b border-border bg-surface py-12 sm:py-16 academic-grain">
          <div className="max-w-editorial mx-auto px-4 sm:px-8">
            {/* Breadcrumb */}
            <nav className="text-xs text-ink-muted mb-4 font-medium flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-accent-gold transition-colors">
                Home
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <Link href="/courses" className="hover:text-accent-gold transition-colors">
                Courses
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <span className="text-ink font-semibold">{course.short_name}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-gold font-sans">
                  {course.short_name} Curriculum
                </span>
                {deptName && (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span className="text-xs text-ink-muted flex items-center gap-1">
                      <Building2 size={12} /> {deptName}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-ink tracking-tight mb-4 leading-tight">
                {course.name}
              </h1>

              {course.description && (
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-6 max-w-2xl">
                  {course.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-xs font-medium">
                <span className="px-3 py-1 rounded-md bg-surface-subtle border border-border text-ink">
                  Duration: <strong className="font-tabular">{course.duration_years} Years</strong>
                </span>
                <span className="px-3 py-1 rounded-md bg-surface-subtle border border-border text-ink">
                  Structure: <strong className="font-tabular">{course.total_semesters} Semesters</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Semester Tiles Grid ─────────────────────────────────────────── */}
        <div className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-8">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-accent-gold" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink font-sans">
                Select Semester
              </h2>
            </div>
            <span className="text-xs font-medium text-ink-muted">
              Choose your semester to access subjects and papers
            </span>
          </div>

          {!semesters || semesters.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface max-w-lg mx-auto">
              <GraduationCap size={28} className="mx-auto text-ink-faint mb-3" />
              <h3 className="font-semibold text-ink">Semesters pending release</h3>
              <p className="text-xs text-ink-muted mt-1">Course semesters will be published shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {semesters.map((sem: any) => {
                const subjectCount = sem.subjects?.length || 0;
                return (
                  <Link
                    key={sem.id}
                    href={`/courses/${course.slug}/semester-${sem.semester_number}`}
                    className="block group"
                  >
                    <article className="h-full bg-surface border border-border hover:border-accent-gold/60 rounded-xl p-6 shadow-fine hover:shadow-editorial transition-all duration-200 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-0.5">
                      {/* Top Large Roman / Ordinal numeral */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-editorial-heading text-3xl sm:text-4xl font-normal text-ink group-hover:text-accent-gold transition-colors font-tabular">
                          0{sem.semester_number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-subtle border border-border text-ink-muted">
                          {sem.semester_number}
                          {getOrdinalSuffix(sem.semester_number)} Term
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-semibold text-base text-ink mb-1 group-hover:text-accent-gold transition-colors">
                          {sem.label}
                        </h3>
                        <p className="text-xs text-ink-muted flex items-center gap-1.5">
                          <BookOpen size={13} className="text-ink-faint shrink-0" />
                          <span>
                            {subjectCount > 0
                              ? `${subjectCount} Subject${subjectCount > 1 ? "s" : ""} Indexed`
                              : "Subjects catalogued"}
                          </span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-ink-faint group-hover:text-accent-gold transition-colors mt-auto">
                        <span>Access Papers</span>
                        <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
