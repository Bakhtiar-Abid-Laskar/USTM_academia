import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Building2, ArrowUpRight, ChevronRight, Layers, GraduationCap } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("name, short_name, description")
    .eq("slug", params.slug)
    .single();

  if (!course) return { title: "Course Not Found — USTM Academia" };

  return {
    title: `${course.name} (${course.short_name}) Semesters & Papers — USTM Academia`,
    description: `Access question papers, syllabi, and semester subjects for ${course.name} at USTM.`,
  };
}

function getOrdinalSuffix(i: number): string {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  // Fetch course details
  const { data: course } = await supabase
    .from("courses")
    .select(`
      id, name, short_name, slug, duration_years, total_semesters, description,
      department:departments(name, code)
    `)
    .eq("slug", params.slug)
    .single();

  if (!course) notFound();

  // Fetch semesters belonging to this course
  const { data: semesters } = await supabase
    .from("semesters")
    .select(`
      id, semester_number, label,
      subjects:subjects(id)
    `)
    .eq("course_id", course.id)
    .order("semester_number");

  const dept: any = Array.isArray(course.department) ? course.department[0] : course.department;
  const deptName = typeof dept === "object" && dept ? dept.name : (typeof dept === "string" ? dept : undefined);

  return (
    <div className="flex flex-col min-h-screen bg-[#EFF6FF] text-[#172B4D]">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* Header Section */}
        <section className="border-b border-[#DCE6F1] bg-[#EFF6FF] py-12 sm:py-16">
          <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3 font-mono">
              <Link href="/" className="hover:text-[#1D4ED8] transition-colors">
                Home
              </Link>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <Link href="/courses" className="hover:text-[#1D4ED8] transition-colors">
                Courses
              </Link>
              <ChevronRight size={12} className="text-[#94A3B8]" />
              <span className="text-[#172554] font-semibold">{course.short_name}</span>
            </nav>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8] font-sans bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  {course.short_name} Curriculum
                </span>
                {deptName && (
                  <>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="text-xs text-[#64748B] flex items-center gap-1">
                      <Building2 size={12} /> {deptName}
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-sans text-3xl sm:text-4xl font-bold text-[#172554] tracking-tight mb-3 leading-tight">
                {course.name}
              </h1>

              {course.description && (
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-5 max-w-2xl">
                  {course.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5 text-xs font-medium">
                <span className="px-3 py-1 rounded-md bg-white border border-[#DCE6F1] text-[#172B4D]">
                  Duration: <strong className="font-tabular text-[#172554]">{course.duration_years} Years</strong>
                </span>
                <span className="px-3 py-1 rounded-md bg-white border border-[#DCE6F1] text-[#172B4D]">
                  Structure: <strong className="font-tabular text-[#172554]">{course.total_semesters} Semesters</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Semester Tiles Grid */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#DCE6F1] mb-6">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#1D4ED8]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#172554] font-sans">
                Select Semester
              </h2>
            </div>
            <span className="text-xs font-medium text-[#64748B]">
              Choose your semester to access subjects and papers
            </span>
          </div>

          {!semesters || semesters.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-[#DCE6F1] bg-white max-w-lg mx-auto">
              <GraduationCap size={28} className="mx-auto text-[#94A3B8] mb-2" />
              <h3 className="font-semibold text-[#172554]">Semesters pending release</h3>
              <p className="text-xs text-[#64748B] mt-1">Course semesters will be published shortly.</p>
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
                    <article className="h-full bg-white border border-[#DCE6F1] hover:border-[#2563EB] rounded-xl p-5 sm:p-6 shadow-fine hover:shadow-card transition-all duration-150 flex flex-col justify-between">
                      {/* Top Large Roman / Ordinal numeral */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-3xl sm:text-4xl font-bold text-[#172554] group-hover:text-[#1D4ED8] transition-colors font-tabular">
                          0{sem.semester_number}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
                          {sem.semester_number}
                          {getOrdinalSuffix(sem.semester_number)} Term
                        </span>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-base text-[#172554] group-hover:text-[#1D4ED8] transition-colors mb-1">
                          {sem.label || `Semester ${sem.semester_number}`}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          {subjectCount} active {subjectCount === 1 ? "curriculum subject" : "curriculum subjects"}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#DCE6F1] flex items-center justify-between text-xs font-semibold text-[#1D4ED8] group-hover:translate-x-0.5 transition-transform">
                        <span>Browse Subjects</span>
                        <ArrowUpRight size={13} />
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
