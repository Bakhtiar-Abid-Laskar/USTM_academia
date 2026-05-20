import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Metadata } from "next";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { BookOpen, GraduationCap, Building2 } from "lucide-react";

// Enable ISR: Cache page for 1 hour, then revalidate in background
export const revalidate = 3600; // 1 hour in seconds

// ✅ SEO: Dynamic metadata for courses page
export const metadata: Metadata = {
  title: "All Courses - USTM Academia",
  description: "Browse all available courses at USTM. Find question papers and syllabus for engineering, science, and other programs.",
  keywords: ["USTM courses", "engineering", "science", "question papers", "syllabi"],
  openGraph: {
    title: "All Courses - USTM Academia",
    description: "Browse all available courses at USTM and access study materials.",
    url: "https://ustm-academia.vercel.app/courses",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Courses - USTM Academia",
    description: "Browse USTM courses and access study materials",
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="flex-1 w-full">
        
        {/* Minimal Hero Header */}
        <div className="bg-white border-b border-slate-200 py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500 mb-4 font-medium" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 -ml-1">Home</Link>
              <span className="mx-2 text-slate-300">›</span>
              <span className="text-slate-800 font-semibold">Courses</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                <GraduationCap className="h-7 w-7" />
              </div>
              All Courses
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl text-lg">
              Browse all academic programs and access related study materials, question papers, and syllabi.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {!courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm animate-fade-in">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <BookOpen className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No courses available</h3>
              <p className="text-slate-500">Courses will be added soon. Please check back later.</p>
            </div>
          ) : (
            // ✅ ANIMATIONS: Staggered course cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {courses.map((course: any, index: number) => {
                const deptName = typeof course.department === "object" && course.department
                  ? course.department.name
                  : course.department;

                return (
                  <div key={course.id} role="listitem" className="will-animate animate-slide-up h-full" style={{ animationDelay: `${index * 50}ms` }}>
                    <Link href={`/courses/${course.slug}`} className="block h-full group">
                      <article className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <h2 className="font-bold text-xl text-slate-900 group-hover:text-blue-700 transition-colors mb-2">{course.short_name}</h2>
                          <p className="text-sm text-slate-600 mb-4">{course.name}</p>
                          
                          {course.description && (
                            <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                          )}
                          
                          <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
                            {deptName && (
                              <div className="flex items-start gap-2">
                                <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                <span className="text-sm font-medium text-slate-700">{deptName}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-bold border border-blue-100">{course.total_semesters} Semesters</span>
                              <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-bold border border-indigo-100">{course.duration_years} Years</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
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
