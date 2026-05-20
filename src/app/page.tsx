import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Search, BookOpen, ChevronRight, FileText, GraduationCap, Building2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader, PublicFooter } from "@/components/public/layout";

// ✅ SEO: Dynamic metadata for home page
export const metadata: Metadata = {
  title: "USTM Academia - Question Papers & Syllabi",
  description: "Access free previous year question papers and syllabus PDFs for all courses at USTM. Study materials for engineering and science programs.",
  keywords: ["USTM", "question papers", "syllabus", "previous year papers", "exam preparation"],
  openGraph: {
    title: "USTM Academia - Question Papers & Syllabi",
    description: "Access free previous year question papers and syllabus PDFs for all courses at USTM.",
    url: "https://ustm-academia.vercel.app",
    siteName: "USTM Academia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "USTM Academia",
    description: "Free question papers and syllabi for USTM courses",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, department:departments(name)")
    .eq("is_active", true)
    .order("name")
    .limit(12);

  const { data: recentDocs } = await supabase
    .from("documents")
    .select("id, title, year, created_at, document_type:document_types(name, slug), course:courses(short_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader />
      
      <main className="flex-1 w-full relative">
        
        {/* Premium Hero Section */}
        <section className="bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pt-24 pb-32 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-[#0f172a] z-0" />
          <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
            <Image
              src="/ustm-logo.png"
              alt="USTM Logo - University of Science and Technology Meghalaya"
              width={80}
              height={80}
              sizes="80px"
              quality={80}
              className="mx-auto mb-8 rounded-full bg-white p-1.5 shadow-2xl animate-scale-in"
              priority
            />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md leading-tight animate-slide-up" style={{ animationDelay: "100ms" }}>
              USTM Academic <span className="text-blue-400">Resource Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
              Instantly access previous year question papers, syllabi, notes, and academic resources for all courses at the University of Science and Technology Meghalaya.
            </p>
            
            <div className="max-w-2xl mx-auto relative group animate-slide-up" style={{ animationDelay: "300ms" }}>
              <Link href="/search" className="block w-full relative focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 w-6 h-6 transition-transform group-hover:scale-110" />
                <div className="w-full p-5 pl-16 pr-6 rounded-2xl shadow-2xl bg-white border border-transparent outline-none text-lg text-slate-500 text-left transition-all group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-text">
                  Search subjects, courses, papers...
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">Search</span>
                </div>
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm font-medium text-blue-50/80 drop-shadow-sm animate-slide-up" style={{ animationDelay: "400ms" }}>
              <span className="flex items-center gap-2"><FileText size={16} /> PYQs</span>
              <span className="flex items-center gap-2"><BookOpen size={16} /> Syllabi</span>
              <span className="flex items-center gap-2"><Clock size={16} /> Notes</span>
              <span className="flex items-center gap-2"><Building2 size={16} /> Department Resources</span>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 -mt-10 relative z-20">
          <div className="flex items-center justify-between mb-8 animate-fade-in bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              Browse Courses
            </h2>
            <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-3 py-2 hover:bg-blue-50 rounded-lg">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {!courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm animate-fade-in">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <BookOpen className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No courses available</h3>
              <p className="text-slate-500">Courses will be added soon. Please check back later.</p>
            </div>
          ) : (
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
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors mb-2">{course.short_name}</h3>
                          <p className="text-sm text-slate-600 mb-6 flex-grow">{course.name}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {deptName && <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">{deptName}</span>}
                            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100">{course.total_semesters} Semesters</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Documents Section */}
        {recentDocs && recentDocs.length > 0 && (
          <section className="bg-white border-t border-slate-200 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-8 animate-fade-in">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Clock className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Recently Added</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {recentDocs.map((doc: any, index: number) => (
                  <div key={doc.id} role="listitem" className="will-animate animate-slide-up h-full" style={{ animationDelay: `${index * 50}ms` }}>
                    <Link href={`/view/${doc.id}`} className="block h-full group">
                      <article className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-10 -mt-10 pointer-events-none" />
                        
                        <div className="flex justify-between items-start mb-4 gap-4 relative z-10">
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 line-clamp-2 leading-snug transition-colors">
                            {doc.title}
                          </h3>
                          {doc.year && (
                            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap border border-slate-200 shadow-sm">
                              {doc.year}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 relative z-10 mt-auto">
                          <div className="flex flex-wrap gap-2">
                            {doc.document_type && (
                              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium border ${
                                doc.document_type.slug === "syllabus" 
                                  ? "bg-blue-50 text-blue-700 border-blue-100" 
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
                              }`}>
                                <FileText size={12} /> {doc.document_type.name}
                              </span>
                            )}
                          </div>
                          
                          {doc.course && (
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Building2 size={12} /> {doc.course.short_name}
                            </span>
                          )}
                        </div>
                      </article>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <PublicFooter />
    </div>
  );
}
