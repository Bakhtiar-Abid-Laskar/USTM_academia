import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Search, BookOpen, ChevronRight } from "lucide-react";
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
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
            <Image
              src="/ustm-logo.png"
              alt="USTM Logo - University of Science and Technology Meghalaya"
              width={72}
              height={72}
              sizes="72px"
              quality={60}
              className="mx-auto mb-4 rounded-full bg-white p-1 shadow-lg"
              // ✅ PERFORMANCE: Hero logo is LCP image
              priority
            />
            <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
              USTM Academic Resource Portal
            </h1>
            <p className="text-primary-200 text-sm sm:text-lg mb-8 max-w-2xl mx-auto">
              Access previous year question papers and syllabus PDFs for all courses at the University of Science and Technology Meghalaya.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-5 py-3 text-sm text-primary-100 transition-colors duration-200 max-w-lg w-full justify-center sm:justify-start"
            >
              <Search className="h-5 w-5 flex-shrink-0" />
              <span>Search for courses, subjects, or question papers...</span>
            </Link>
          </div>
        </section>

        {/* Courses */}
        <section className="max-w-content mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Browse Courses
            </h2>
            <Link href="/courses" className="text-sm text-primary font-medium hover:underline flex items-center gap-1 transition-colors duration-200">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {!courses || courses.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No courses available yet. Check back soon.</p>
            </div>
          ) : (
            // ✅ ANIMATIONS: Staggered list with scroll-triggered animations
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
              {courses.map((course: any, index: number) => {
                const deptName = typeof course.department === "object" && course.department
                  ? course.department.name
                  : course.department;

                return (
                  <div key={course.id} role="listitem" className="will-animate animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <Link href={`/courses/${course.slug}`}>
                      <Card className="hover:shadow-md transition-shadow duration-200 h-full">
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-text-main mb-1">{course.short_name}</h3>
                          <p className="text-sm text-text-muted mb-3 line-clamp-2">{course.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {deptName && <Badge>{deptName}</Badge>}
                            <Badge variant="outline">{course.total_semesters} Sem</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Documents */}
        {recentDocs && recentDocs.length > 0 && (
          <section className="bg-white border-t border-border">
            <div className="max-w-content mx-auto px-4 sm:px-6 py-10 sm:py-16">
              <h2 className="text-xl sm:text-2xl font-bold text-text-main mb-6">Recently Added</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[250px]" role="list">
                {recentDocs.map((doc: any, index: number) => (
                  <div key={doc.id} role="listitem" className="will-animate animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <Link href={`/view/${doc.id}`}>
                      <Card className="hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-4">
                          <p className="font-medium text-text-main text-sm mb-2 line-clamp-2">{doc.title}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={doc.document_type?.slug === "syllabus" ? "default" : "outline"}>
                              {doc.document_type?.name}
                            </Badge>
                            {doc.year && <Badge variant="outline">{doc.year}</Badge>}
                            <span className="text-xs text-text-muted">{doc.course?.short_name}</span>
                          </div>
                        </CardContent>
                      </Card>
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
