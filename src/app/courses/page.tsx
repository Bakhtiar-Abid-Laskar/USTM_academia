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
    description: "Official course archives and past examination papers for USTM",
    url: "https://ustm-academia.vercel.app/courses",
    type: "website",
  },
};

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id, name, short_name, slug, duration_years, total_semesters, description,
      department:departments(name, code),
      semesters:semesters(id)
    `)
    .eq("is_active", true)
    .order("name");

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
              <span className="text-[#172554] font-semibold">Academic Programs</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="font-sans text-3xl sm:text-4xl font-bold text-[#172554] tracking-tight mb-2.5">
                All Academic Programs
              </h1>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Explore degree programs across all schools of USTM. Each curriculum contains verified
                semester-by-semester course structures, past exam question papers, and syllabi.
              </p>
            </div>
          </div>
        </section>

        {/* Program Cards Grid */}
        <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {!courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-[#DCE6F1] shadow-fine max-w-lg mx-auto">
              <BookOpen size={28} className="text-[#94A3B8] mb-2" />
              <h3 className="font-semibold text-[#172554] text-base">No programs currently indexed</h3>
              <p className="text-xs text-[#64748B] mt-1">Courses are being added to the database.</p>
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
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider font-sans bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                            {course.short_name}
                          </span>
                          <span className="text-xs font-tabular font-medium text-[#64748B]">
                            {course.total_semesters} Semesters
                          </span>
                        </div>

                        {/* Program Name */}
                        <h2 className="font-semibold text-base sm:text-lg text-[#172554] group-hover:text-[#1D4ED8] transition-colors leading-snug mb-2">
                          {course.name}
                        </h2>

                        {course.description && (
                          <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 mb-3">
                            {course.description}
                          </p>
                        )}

                        {deptName && (
                          <p className="text-xs text-[#64748B] flex items-start gap-1.5 mb-4">
                            <Building2 size={13} className="text-[#94A3B8] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{deptName}</span>
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-[#DCE6F1] flex items-center justify-between text-xs font-medium text-[#64748B] group-hover:text-[#172554] transition-colors mt-auto">
                        <span className="font-tabular">
                          {course.duration_years} Year Degree
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#1D4ED8] font-semibold group-hover:translate-x-1 transition-transform">
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
