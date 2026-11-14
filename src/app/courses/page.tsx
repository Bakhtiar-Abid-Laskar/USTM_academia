import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Metadata } from "next";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { BookOpen, Building2, ArrowUpRight, ChevronRight } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Academic Programs & Courses — USTM Academia",
  description:
    "Browse all university courses and departments at USTM. Access previous year question papers, syllabi, and semester curricula.",
  keywords: ["USTM courses", "engineering", "management", "science", "question papers", "syllabi", "programs"],
  openGraph: {
    title: "Academic Programs & Courses — USTM Academia",
    description: "Browse all available programs at USTM and access study materials.",
    url: "https://ustm-academia.vercel.app/courses",
    type: "website",
  },
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*, department:departments(name)")
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
            <nav className="text-xs text-ink-muted mb-4 font-medium flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-accent-gold transition-colors">
                Home
              </Link>
              <ChevronRight size={12} className="text-ink-faint" />
              <span className="text-ink font-semibold">Academic Programs</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="font-editorial-heading text-3xl sm:text-5xl font-normal text-ink tracking-tight mb-3">
                All Academic Programs
              </h1>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Explore degree programs across all schools of USTM. Each curriculum contains verified
                semester-by-semester course structures, past exam question papers, and syllabi.
              </p>
            </div>
          </div>
        </section>

        {/* ── Program Cards Grid ───────────────────────────────────────────── */}
        <div className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-16">
          {!courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface rounded-2xl border border-dashed border-border shadow-fine max-w-lg mx-auto">
              <BookOpen size={28} className="text-ink-faint mb-3" />
              <h3 className="font-semibold text-ink text-base">No programs currently indexed</h3>
              <p className="text-xs text-ink-muted mt-1">Courses are being added to the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => {
                const deptName =
                  typeof course.department === "object" && course.department
                    ? course.department.name
                    : course.department;

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="block group h-full"
                  >
                    <article className="h-full bg-surface border border-border hover:border-accent-gold/60 rounded-xl p-6 sm:p-7 shadow-fine hover:shadow-editorial transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent-gold/40 group-hover:bg-accent-gold transition-colors" />

                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold text-accent-gold uppercase tracking-wider font-sans">
                            {course.short_name}
                          </span>
                          <span className="text-xs font-tabular font-medium text-ink-muted bg-surface-subtle border border-border px-2.5 py-0.5 rounded">
                            {course.total_semesters} Semesters
                          </span>
                        </div>

                        {/* Program Name */}
                        <h2 className="font-semibold text-lg text-ink group-hover:text-accent-gold transition-colors leading-snug mb-3">
                          {course.name}
                        </h2>

                        {course.description && (
                          <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 mb-4">
                            {course.description}
                          </p>
                        )}

                        {deptName && (
                          <p className="text-xs text-ink-muted flex items-start gap-1.5 mb-6">
                            <Building2 size={13} className="text-ink-faint shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{deptName}</span>
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-ink-muted group-hover:text-ink transition-colors mt-auto">
                        <span className="font-tabular text-ink-faint">
                          {course.duration_years} Year Degree
                        </span>
                        <span className="inline-flex items-center gap-1 text-accent-gold group-hover:translate-x-1 transition-transform">
                          <span>Explore Semesters</span>
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
