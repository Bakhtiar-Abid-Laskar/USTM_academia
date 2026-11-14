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

  const semesterNum = parseInt(params.semester.replace("semester-", ""));
  if (isNaN(semesterNum)) notFound();

  // 1. Fetch course details
  const { data: course } = await supabase
    .from("courses")
    .select("id, name, short_name, slug")
    .eq("slug", params.slug)
    .single();

  if (!course) notFound();

  // 2. Fetch semester details
  const { data: semester } = await supabase
    .from("semesters")
    .select("id, semester_number, label")
    .eq("course_id", course.id)
    .eq("semester_number", semesterNum)
    .single();

  if (!semester) notFound();

  // 3. Fetch subjects with their active documents count
  const { data: subjects } = await supabase
    .from("subjects")
    .select(`
      id, name, slug, subject_code,
      documents:documents(id, document_type_id, status)
    `)
    .eq("course_id", course.id)
    .eq("semester_id", semester.id)
    .order("name");

  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* Header Section */}
        <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="text-[#172554] font-semibold">{semester.label}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] font-sans mb-1">
                {course.short_name} · Semester Curriculum
              </div>
              <h1 className="font-sans text-3xl sm:text-4xl font-bold text-[#172554] tracking-tight mb-2">
                {semester.label}
              </h1>
              <p className="text-sm text-[#64748B]">
                {course.name}
              </p>
            </div>
          </div>
        </section>

        {/* Subject Cards Grid */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#DCE6F1] mb-6">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#1D4ED8]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#172554] font-sans">
                Curriculum Subjects
              </h2>
            </div>
            <span className="text-xs font-medium text-[#64748B]">
              Select a subject to view syllabi and past exam papers
            </span>
          </div>

          {!subjects || subjects.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-[#DCE6F1] bg-white max-w-lg mx-auto">
              <FileText size={28} className="mx-auto text-[#94A3B8] mb-2" />
              <h3 className="font-semibold text-[#172554]">No subjects catalogued yet</h3>
              <p className="text-xs text-[#64748B] mt-1">Subjects for this semester will be updated soon.</p>
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
                    <article className="h-full bg-white border border-[#DCE6F1] hover:border-[#2563EB] rounded-xl p-5 sm:p-6 shadow-fine hover:shadow-card transition-all duration-150 flex flex-col justify-between">
                      <div>
                        {/* Subject Code badge if present */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          {subject.subject_code ? (
                            <span className="font-mono text-[11px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                              {subject.subject_code}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                              Subject
                            </span>
                          )}
                        </div>

                        {/* Subject Title */}
                        <h3 className="font-semibold text-base sm:text-lg text-[#172554] group-hover:text-[#1D4ED8] transition-colors leading-snug mb-3">
                          {subject.name}
                        </h3>
                      </div>

                      {/* Paper Counts Badges */}
                      <div className="pt-3 border-t border-[#DCE6F1] flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-tabular font-medium text-[#64748B] bg-[#F8FBFF] border border-[#DCE6F1] px-2 py-0.5 rounded text-[11px]">
                            {qpCount} {qpCount === 1 ? "PYQ" : "PYQs"}
                          </span>
                          <span className="font-tabular font-medium text-[#64748B] bg-[#F8FBFF] border border-[#DCE6F1] px-2 py-0.5 rounded text-[11px]">
                            {syllabusCount} Syllabus
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 font-semibold text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">
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
