import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { BookOpen } from "lucide-react";

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
    card: "summary",
    title: "All Courses",
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
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8 animate-fade-in">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-text-main font-medium">Courses</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-6">All Courses</h1>

          {!courses || courses.length === 0 ? (
            <div className="text-center py-16 text-text-muted animate-fade-in">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-medium mb-1">No courses available</p>
              <p className="text-sm">Courses will be added soon. Please check back later.</p>
            </div>
          ) : (
            // ✅ ANIMATIONS: Staggered course cards with scroll-triggered animations
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
              {courses.map((course: any, index: number) => {
                const deptName = typeof course.department === "object" && course.department
                  ? course.department.name
                  : course.department;

                return (
                  <div key={course.id} role="listitem" className="will-animate animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <Link href={`/courses/${course.slug}`} className="block h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
                      <Card className="hover:shadow-md transition-shadow duration-200 h-full">
                        <CardContent className="p-5">
                          <h2 className="font-semibold text-text-main text-lg mb-1">{course.short_name}</h2>
                          <p className="text-sm text-text-muted mb-3">{course.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {deptName && <Badge>{deptName}</Badge>}
                            <Badge variant="outline">{course.total_semesters} Semesters</Badge>
                            <Badge variant="outline">{course.duration_years} Years</Badge>
                          </div>
                          {course.description && (
                            <p className="text-xs text-text-muted mt-3 line-clamp-2">{course.description}</p>
                          )}
                        </CardContent>
                      </Card>
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
