import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { BookOpen } from "lucide-react";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-text-main font-medium">Courses</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-6">All Courses</h1>

          {!courses || courses.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-medium mb-1">No courses available</p>
              <p className="text-sm">Courses will be added soon. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5">
                      <h2 className="font-semibold text-text-main text-lg mb-1">{course.short_name}</h2>
                      <p className="text-sm text-text-muted mb-3">{course.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {course.department && <Badge>{course.department}</Badge>}
                        <Badge variant="outline">{course.total_semesters} Semesters</Badge>
                        <Badge variant="outline">{course.duration_years} Years</Badge>
                      </div>
                      {course.description && (
                        <p className="text-xs text-text-muted mt-3 line-clamp-2">{course.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
