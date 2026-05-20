import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Calendar, Building2, BookOpen, ChevronRight } from "lucide-react";

// Enable ISR: Cache page for 1 hour, then revalidate in background
export const revalidate = 3600; // 1 hour in seconds

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, department:departments(name)")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!course) notFound();

  // ✅ OPTIMIZED: Fetch semesters with subjects to count documents
  const { data: semesters } = await supabase
    .from("semesters")
    .select("*, subjects(id)")
    .eq("course_id", course.id)
    .eq("is_active", true)
    .order("semester_number");

  const deptName = typeof course.department === "object" && course.department
    ? course.department.name
    : course.department;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full">
        
        {/* Minimal Hero Header */}
        <div className="bg-white border-b border-slate-200 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500 mb-4 font-medium flex items-center flex-wrap gap-2" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 -ml-1">Home</Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <Link href="/courses" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">Courses</Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-800 font-semibold">{course.short_name}</span>
            </nav>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{course.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg text-slate-600 font-medium">{course.short_name}</span>
              {deptName && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1.5 text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {deptName}
                  </span>
                </>
              )}
            </div>
            
            {course.description && (
              <p className="mt-6 text-slate-600 max-w-3xl leading-relaxed">
                {course.description}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3 animate-fade-in">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            Select a Semester
          </h2>

          {!semesters || semesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm animate-fade-in">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Calendar className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No semesters available</h3>
              <p className="text-slate-500">Semesters for this course will be added soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {semesters.map((sem: any, index: number) => {
                const subjectCount = sem.subjects?.length || 0;
                return (
                  <Link 
                    key={sem.id} 
                    href={`/courses/${course.slug}/semester-${sem.semester_number}`}
                    className="will-animate animate-slide-up block group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <article className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 text-center relative overflow-hidden h-full flex flex-col justify-center">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity -mr-8 -mt-8 pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="text-4xl font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 tracking-tight">
                          {sem.semester_number}<sup className="text-xl font-bold text-slate-400 group-hover:text-blue-400">{getOrdinalSuffix(sem.semester_number)}</sup>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Semester</p>
                        
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100 transition-colors">
                          <BookOpen className="w-3.5 h-3.5" />
                          {subjectCount > 0 ? (
                            <span>{subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}</span>
                          ) : (
                            <span>Coming soon</span>
                          )}
                        </div>
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
