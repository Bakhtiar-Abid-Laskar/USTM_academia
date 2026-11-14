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
};

export const revalidate = 3600;

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
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* ── 1. PROFESSIONAL HERO SECTION ─────────────────────────────────── */}
        <section className="bg-[#EFF6FF] border-b border-[#DCE6F1] py-12 sm:py-18 lg:py-20">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Heading, Search & Quick Links */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Institutional Portal Label */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DBEAFE] border border-[#BFDBFE] text-[11px] font-semibold text-[#1D4ED8] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                  <span>USTM STUDENT RESOURCE PORTAL</span>
                </div>

                {/* Professional, Non-Italic Sans-Serif Heading */}
                <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172554] tracking-tight leading-[1.15]">
                  Your Academic Resources, <br className="hidden sm:inline" />
                  All in One Place.
                </h1>

                {/* Institutional Description */}
                <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl font-normal">
                  Access previous year question papers, official curricula, and semester syllabi
                  through a centralized academic resource library built for USTM students.
                </p>

                {/* Prominent Search Bar with Clear Alignment (No overlap) */}
                <div className="pt-1 max-w-xl">
                  <form
                    action="/search"
                    method="GET"
                    className="relative flex items-center w-full bg-white border border-[#DCE6F1] hover:border-[#2563EB] focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 rounded-xl shadow-fine transition-all p-1.5"
                  >
                    <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[#64748B] shrink-0">
                      <Search size={19} />
                    </div>
                    <input
                      type="text"
                      name="q"
                      autoComplete="off"
                      placeholder="Search by course, subject, or year..."
                      className="w-full py-2.5 px-2 bg-transparent text-sm sm:text-base text-[#172B4D] placeholder:text-[#94A3B8] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Search</span>
                      <ChevronRight size={14} />
                    </button>
                  </form>

                  {/* 3 Compact and Consistent Quick-Access Links */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs font-medium">
                    <span className="text-[#64748B] text-xs font-medium mr-1">Quick access:</span>
                    <Link
                      href="/search?type=question-paper"
                      className="px-3 py-1.5 rounded-lg border border-[#DCE6F1] bg-white hover:border-[#2563EB] hover:bg-[#F8FBFF] text-[#172B4D] transition-colors shadow-fine inline-flex items-center gap-1.5 font-medium"
                    >
                      <FileText size={13} className="text-[#1D4ED8]" />
                      Previous Year Questions
                    </Link>
                    <Link
                      href="/search?type=syllabus"
                      className="px-3 py-1.5 rounded-lg border border-[#DCE6F1] bg-white hover:border-[#2563EB] hover:bg-[#F8FBFF] text-[#172B4D] transition-colors shadow-fine inline-flex items-center gap-1.5 font-medium"
                    >
                      <BookOpen size={13} className="text-[#0284C7]" />
                      Semester Syllabi
                    </Link>
                    <Link
                      href="/courses"
                      className="px-3 py-1.5 rounded-lg border border-[#DCE6F1] bg-white hover:border-[#2563EB] hover:bg-[#F8FBFF] text-[#172B4D] transition-colors shadow-fine inline-flex items-center gap-1.5 font-medium"
                    >
                      <GraduationCap size={13} className="text-[#172554]" />
                      All Courses
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Catalog Digest Dashboard Card */}
              <div className="lg:col-span-5 space-y-3.5">
                <div className="rounded-xl border border-[#DCE6F1] bg-white p-6 shadow-card relative">
                  
                  {/* Card Header with Live Status */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#DCE6F1]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#172554] font-sans">
                        Live Catalog Digest
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B] bg-[#EFF6FF] border border-[#DCE6F1] px-2 py-0.5 rounded">
                      Live Database
                    </span>
                  </div>

                  {/* Statistics Row */}
                  <div className="grid grid-cols-3 gap-3 py-5 border-b border-[#DCE6F1]">
                    <div>
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#172554] font-tabular">
                        {totalDocs ?? 0}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-medium mt-0.5">
                        Verified Papers
                      </div>
                    </div>
                    <div>
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#172554] font-tabular">
                        {totalCourses ?? 0}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-medium mt-0.5">
                        Programs
                      </div>
                    </div>
                    <div>
                      <div className="font-sans text-2xl sm:text-3xl font-bold text-[#172554] font-tabular">
                        {totalDepts ?? 0}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-medium mt-0.5">
                        Departments
                      </div>
                    </div>
                  </div>

                  {/* Recent Additions List */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-semibold text-[#172554]">Recent Additions</span>
                      <Link href="/search" className="text-[#1D4ED8] hover:underline font-semibold text-xs">
                        Browse all →
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {recentDocs?.slice(0, 3).map((doc: any) => (
                        <Link
                          key={doc.id}
                          href={`/view/${doc.id}`}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-[#DCE6F1] bg-[#F8FBFF] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] transition-colors group"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="text-xs font-semibold text-[#172B4D] truncate group-hover:text-[#1D4ED8] transition-colors">
                              {doc.title}
                            </p>
                            <p className="text-[11px] text-[#64748B]">
                              {doc.course?.short_name || "Course"} · Sem {doc.semester?.semester_number || "—"}
                            </p>
                          </div>
                          <span className="font-tabular text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#DCE6F1] text-[#172554] shrink-0">
                            {doc.year || "2025"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* University Institutional Assurance Note */}
                <div className="p-3.5 rounded-xl border border-[#DCE6F1] bg-white flex items-center gap-2.5 text-xs text-[#64748B] shadow-fine">
                  <ShieldCheck size={16} className="text-[#16A34A] shrink-0" />
                  <span>
                    Official syllabus records and question archives for USTM students.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. BROWSE ACADEMIC PROGRAMS (COURSES) ─────────────────────────── */}
        <section className="bg-[#F8FBFF] border-b border-[#DCE6F1] py-14 sm:py-20">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#DCE6F1]">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] font-sans mb-1">
                  Academic Structure
                </div>
                <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#172554] tracking-tight">
                  Browse by Academic Program
                </h2>
              </div>

              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline group"
              >
                <span>View all programs directory</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {!courses || courses.length === 0 ? (
              <div className="p-10 text-center rounded-xl border border-dashed border-[#DCE6F1] bg-white">
                <BookOpen size={28} className="mx-auto text-[#94A3B8] mb-2" />
                <h3 className="font-semibold text-[#172554]">No programs available yet</h3>
                <p className="text-xs text-[#64748B] mt-1">Course archives will appear here shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      <article className="h-full bg-white border border-[#DCE6F1] hover:border-[#2563EB] rounded-xl p-5 sm:p-6 shadow-fine hover:shadow-card transition-all duration-150 flex flex-col justify-between">
                        <div>
                          {/* Top Meta Bar */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider font-sans bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                              {course.short_name}
                            </span>
                            <span className="text-xs font-tabular font-medium text-[#64748B]">
                              {course.total_semesters} Semesters
                            </span>
                          </div>

                          {/* Course Full Title */}
                          <h3 className="font-semibold text-base sm:text-lg text-[#172554] group-hover:text-[#1D4ED8] transition-colors leading-snug mb-2">
                            {course.name}
                          </h3>

                          {deptName && (
                            <p className="text-xs text-[#64748B] flex items-start gap-1.5 mb-4">
                              <Building2 size={13} className="text-[#94A3B8] shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{deptName}</span>
                            </p>
                          )}
                        </div>

                        {/* Bottom Footer Affordance */}
                        <div className="pt-3 border-t border-[#DCE6F1] flex items-center justify-between text-xs font-medium text-[#64748B] group-hover:text-[#172554] transition-colors mt-auto">
                          <span className="font-tabular">
                            {course.duration_years} Year Degree
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#1D4ED8] font-semibold group-hover:translate-x-1 transition-transform">
                            <span>Open Program</span>
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
        </section>

        {/* ── 3. ARCHIVAL ACTIVITY: RECENTLY ADDED PAPERS ───────────────────── */}
        {recentDocs && recentDocs.length > 0 && (
          <section className="bg-white py-14 sm:py-20">
            <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] font-sans mb-1">
                    Archival Activity
                  </div>
                  <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#172554] tracking-tight">
                    Recently Added Documents
                  </h2>
                </div>

                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  <span>Search all {totalDocs} records</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              {/* Table Container */}
              <div className="border border-[#DCE6F1] rounded-xl bg-white shadow-fine overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#DCE6F1] bg-[#F8FBFF] text-[#64748B] font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4 sm:px-6">Document Title</th>
                        <th className="py-3.5 px-4">Program</th>
                        <th className="py-3.5 px-4">Semester</th>
                        <th className="py-3.5 px-4">Year</th>
                        <th className="py-3.5 px-4">Classification</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE6F1] font-sans">
                      {recentDocs.map((doc: any) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-[#F8FBFF] transition-colors group"
                        >
                          {/* Title */}
                          <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#172B4D] group-hover:text-[#1D4ED8] transition-colors">
                            <Link href={`/view/${doc.id}`} className="block truncate max-w-xs sm:max-w-sm">
                              {doc.title}
                            </Link>
                          </td>

                          {/* Program */}
                          <td className="py-3.5 px-4 font-medium text-[#64748B] whitespace-nowrap">
                            {doc.course?.short_name || "—"}
                          </td>

                          {/* Semester */}
                          <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                            {doc.semester?.label || (doc.semester?.semester_number ? `Sem ${doc.semester.semester_number}` : "—")}
                          </td>

                          {/* Year */}
                          <td className="py-3.5 px-4 font-tabular font-bold text-[#172554] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE]">
                              {doc.year || "2025"}
                            </span>
                          </td>

                          {/* Classification */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F8FBFF] border border-[#DCE6F1] text-[#64748B]">
                              {doc.document_type?.name || "PYQ"}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                            <Link
                              href={`/view/${doc.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#DCE6F1] bg-white hover:bg-[#1D4ED8] hover:text-white hover:border-[#1D4ED8] text-xs font-semibold text-[#172B4D] shadow-fine transition-all"
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
