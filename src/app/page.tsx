import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Metadata } from "next";
import {
  Search, BookOpen, ArrowUpRight, FileText, GraduationCap,
  Building2, ShieldCheck, ChevronRight
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

export const metadata: Metadata = {
  title: "USTM Academia — Academic Question Papers & Curricula",
  description:
    "Official centralized repository for University of Science and Technology Meghalaya students. Access verified previous year question papers (PYQs) and syllabi.",
  keywords: ["USTM", "question papers", "syllabus", "previous year papers", "exam preparation", "PYQ"],
  openGraph: {
    title: "USTM Academia — Academic Question Papers & Curricula",
    description: "Access verified previous year question papers and syllabi for USTM courses.",
    url: "https://ustm-academia.vercel.app",
    siteName: "USTM Academia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "USTM Academia — Academic Repository",
    description: "Verified question papers and syllabi for USTM students",
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Fetch courses with department and semester count
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id, name, short_name, slug, duration_years, total_semesters, description,
      department:departments(name, code),
      semesters:semesters(id)
    `)
    .eq("is_active", true)
    .order("name");

  // 2. Fetch recently published documents with full relations
  const { data: recentDocs } = await supabase
    .from("documents")
    .select(`
      id, title, year, file_url, is_downloadable, created_at,
      document_type:document_types(name, slug),
      exam_type:exam_types(name, slug),
      course:courses(short_name, slug),
      semester:semesters(label, semester_number),
      subject:subjects(name, subject_code, slug)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  // 3. Live catalog metrics
  const { count: totalDocs } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  const { count: totalCourses } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: totalDepts } = await supabase
    .from("departments")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* ── 1. ASYMMETRIC EDITORIAL HERO ─────────────────────────────────── */}
        <section className="border-b border-border bg-surface relative overflow-hidden py-16 sm:py-24 academic-grain">
          <div className="max-w-editorial mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Editorial Headline & Primary Search */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border text-xs font-semibold text-ink-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                  <span>Central University Repository</span>
                  <span className="text-ink-faint">·</span>
                  <span>Free Student Access</span>
                </div>

                <h1 className="font-editorial-heading text-4xl sm:text-6xl lg:text-7xl font-normal text-ink tracking-tight leading-[1.05]">
                  The Academic Archive{" "}
                  <span className="italic font-editorial-serif text-accent-gold block sm:inline">
                    for USTM Students.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
                  An authoritative, open library of previous year question papers, official curricula,
                  and semester syllabi. Zero login friction, optimized for mobile connectivity.
                </p>

                {/* Search Bar Affordance */}
                <div className="pt-2 max-w-xl">
                  <Link
                    href="/search"
                    className="group block relative rounded-2xl border border-border bg-paper p-4 sm:p-5 pl-13 pr-32 shadow-fine hover:shadow-editorial hover:border-accent-gold/60 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-gold/20"
                  >
                    <Search
                      size={20}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-faint group-hover:text-accent-gold transition-colors"
                    />
                    <span className="text-sm sm:text-base text-ink-faint font-normal block truncate">
                      Search by course, subject, or year...
                    </span>
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink text-surface group-hover:bg-accent-navy text-xs font-semibold shadow-fine transition-all">
                      <span>Search</span>
                      <ChevronRight size={13} />
                    </span>
                  </Link>

                  {/* Quick Filter Categories */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
                    <span className="text-ink-faint">Direct jump:</span>
                    <Link
                      href="/search?type=question-paper"
                      className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors shadow-fine inline-flex items-center gap-1.5"
                    >
                      <FileText size={13} className="text-accent-gold" />
                      PYQs
                    </Link>
                    <Link
                      href="/search?type=syllabus"
                      className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors shadow-fine inline-flex items-center gap-1.5"
                    >
                      <BookOpen size={13} className="text-accent-navy" />
                      Syllabi
                    </Link>
                    <Link
                      href="/courses"
                      className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-ink-muted hover:text-ink transition-colors shadow-fine inline-flex items-center gap-1.5"
                    >
                      <GraduationCap size={13} className="text-accent-crimson" />
                      All Courses
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Archive Digest & Real Metrics */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-editorial relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink font-sans">
                        Live Catalog Digest
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-ink-faint">Live Database</span>
                  </div>

                  {/* Real Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 py-5 border-b border-border">
                    <div>
                      <div className="font-editorial-heading text-2xl sm:text-3xl font-normal text-ink font-tabular">
                        {totalDocs ?? 0}
                      </div>
                      <div className="text-[11px] text-ink-muted font-medium mt-0.5">
                        Verified Papers
                      </div>
                    </div>
                    <div>
                      <div className="font-editorial-heading text-2xl sm:text-3xl font-normal text-ink font-tabular">
                        {totalCourses ?? 0}
                      </div>
                      <div className="text-[11px] text-ink-muted font-medium mt-0.5">
                        Programs
                      </div>
                    </div>
                    <div>
                      <div className="font-editorial-heading text-2xl sm:text-3xl font-normal text-ink font-tabular">
                        {totalDepts ?? 0}
                      </div>
                      <div className="text-[11px] text-ink-muted font-medium mt-0.5">
                        Departments
                      </div>
                    </div>
                  </div>

                  {/* Recently Uploaded Micro Feed */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-ink-muted">
                      <span className="font-semibold text-ink">Recent additions</span>
                      <Link href="/search" className="text-accent-gold hover:underline font-bold text-[11px]">
                        Browse all →
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {recentDocs?.slice(0, 3).map((doc: any) => (
                        <Link
                          key={doc.id}
                          href={`/view/${doc.id}`}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-accent-gold/40 hover:bg-surface-subtle transition-all group"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-xs font-semibold text-ink truncate group-hover:text-accent-gold transition-colors">
                              {doc.title}
                            </p>
                            <p className="text-[11px] text-ink-faint">
                              {doc.course?.short_name} · Sem {doc.semester?.semester_number}
                            </p>
                          </div>
                          <span className="font-tabular text-[10px] font-bold px-2 py-0.5 rounded bg-paper border border-border text-ink-muted shrink-0">
                            {doc.year || "2025"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* University Accreditation Note */}
                <div className="p-4 rounded-xl border border-border bg-surface-subtle/60 flex items-center gap-3 text-xs text-ink-muted">
                  <ShieldCheck size={18} className="text-accent-gold shrink-0" />
                  <span>
                    Indexed according to official USTM semester curricula guidelines.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. BROWSE ACADEMIC PROGRAMS (COURSES) ─────────────────────────── */}
        <section className="max-w-editorial mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-border">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent-gold font-sans mb-1">
                Academic Hierarchy
              </div>
              <h2 className="font-editorial-heading text-2xl sm:text-4xl font-normal text-ink">
                Browse by Academic Program
              </h2>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-accent-gold transition-colors group"
            >
              <span>View complete curriculum directory</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {!courses || courses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface">
              <BookOpen size={28} className="mx-auto text-ink-faint mb-3" />
              <h3 className="font-semibold text-ink">No programs available yet</h3>
              <p className="text-xs text-ink-muted mt-1">Course archives will appear here shortly.</p>
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
                      {/* Department Accent Ribbon */}
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-accent-gold/40 group-hover:bg-accent-gold transition-colors" />

                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[11px] font-bold text-accent-gold uppercase tracking-wider font-sans">
                            {course.short_name}
                          </span>
                          <span className="text-xs font-tabular font-medium text-ink-muted bg-surface-subtle border border-border px-2.5 py-0.5 rounded">
                            {course.total_semesters} Semesters
                          </span>
                        </div>

                        {/* Course Full Title */}
                        <h3 className="font-semibold text-lg text-ink group-hover:text-accent-gold transition-colors leading-snug mb-3">
                          {course.name}
                        </h3>

                        {deptName && (
                          <p className="text-xs text-ink-muted flex items-start gap-1.5 mb-6">
                            <Building2 size={13} className="text-ink-faint shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{deptName}</span>
                          </p>
                        )}
                      </div>

                      {/* Bottom Footer Affordance */}
                      <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-ink-muted group-hover:text-ink transition-colors mt-auto">
                        <span className="font-tabular text-ink-faint">
                          {course.duration_years} Year Degree
                        </span>
                        <span className="inline-flex items-center gap-1 text-accent-gold group-hover:translate-x-1 transition-transform">
                          <span>Open Archive</span>
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 3. ACADEMIC LEDGER: RECENTLY ADDED PAPERS ────────────────────── */}
        {recentDocs && recentDocs.length > 0 && (
          <section className="border-t border-border bg-surface py-16 sm:py-24">
            <div className="max-w-editorial mx-auto px-4 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-accent-gold font-sans mb-1">
                    Archival Activity
                  </div>
                  <h2 className="font-editorial-heading text-2xl sm:text-4xl font-normal text-ink">
                    Recently Added Documents
                  </h2>
                </div>

                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 text-xs font-bold text-ink hover:text-accent-gold transition-colors"
                >
                  <span>Search all {totalDocs} records</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              {/* Ledger Table Container */}
              <div className="border border-border rounded-xl bg-paper shadow-fine overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-surface-subtle/80 text-ink-muted font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                        <th className="py-3.5 px-4">Program</th>
                        <th className="py-3.5 px-4">Semester</th>
                        <th className="py-3.5 px-4">Year</th>
                        <th className="py-3.5 px-4">Classification</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-sans">
                      {recentDocs.map((doc: any) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-surface transition-colors group"
                        >
                          {/* Title */}
                          <td className="py-4 px-4 sm:px-6 font-semibold text-ink group-hover:text-accent-gold transition-colors">
                            <Link href={`/view/${doc.id}`} className="block truncate max-w-xs sm:max-w-sm">
                              {doc.title}
                            </Link>
                          </td>

                          {/* Program */}
                          <td className="py-4 px-4 font-medium text-ink-muted whitespace-nowrap">
                            {doc.course?.short_name || "—"}
                          </td>

                          {/* Semester */}
                          <td className="py-4 px-4 text-ink-muted whitespace-nowrap">
                            {doc.semester?.label || (doc.semester?.semester_number ? `Sem ${doc.semester.semester_number}` : "—")}
                          </td>

                          {/* Year */}
                          <td className="py-4 px-4 font-tabular font-bold text-ink whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-surface border border-border">
                              {doc.year || "2025"}
                            </span>
                          </td>

                          {/* Classification */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-subtle border border-border text-ink-muted">
                              {doc.document_type?.name || "PYQ"}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <Link
                              href={`/view/${doc.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-ink hover:text-surface hover:border-ink text-xs font-semibold text-ink shadow-fine transition-all"
                            >
                              <span>View</span>
                              <ArrowUpRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
