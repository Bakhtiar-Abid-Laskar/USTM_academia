import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { Calendar } from "lucide-react";

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

  const { data: semesters } = await supabase
    .from("semesters")
    .select("*, subjects:subjects(count)")
    .eq("course_id", course.id)
    .eq("is_active", true)
    .order("semester_number");

  // Get document counts per semester
  const semesterIds = semesters?.map(s => s.id) || [];
  const docCounts: Record<string, number> = {};
  if (semesterIds.length > 0) {
    const { data: docs } = await supabase
      .from("documents")
      .select("semester_id")
      .eq("course_id", course.id)
      .eq("status", "published")
      .in("semester_id", semesterIds);
    if (docs) {
      docs.forEach((d: any) => {
        docCounts[d.semester_id] = (docCounts[d.semester_id] || 0) + 1;
      });
    }
  }

  const deptName = typeof course.department === "object" && course.department
    ? course.department.name
    : course.department;

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/courses" className="hover:text-primary">Courses</Link>
            <span className="mx-2">›</span>
            <span className="text-text-main font-medium">{course.short_name}</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-2">{course.short_name}</h1>
            <p className="text-text-muted">{course.name}</p>
            {deptName && <Badge className="mt-2">{deptName}</Badge>}
          </div>

          <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Select a Semester
          </h2>

          {!semesters || semesters.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No semesters available for this course yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {semesters.map((sem: any) => (
                <Link key={sem.id} href={`/courses/${course.slug}/semester-${sem.semester_number}`}>
                  <Card className="hover:shadow-md transition-shadow text-center h-full">
                    <CardContent className="p-5">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {sem.semester_number}<sup className="text-lg font-semibold">{getOrdinalSuffix(sem.semester_number)}</sup>
                      </div>
                      <p className="text-sm font-medium text-text-main mb-2">Semester</p>
                      <div className="flex flex-col gap-1 text-xs text-text-muted">
                        {docCounts[sem.id] ? (
                          <span>{docCounts[sem.id]} documents</span>
                        ) : (
                          <span className="text-gray-400">No documents yet</span>
                        )}
                      </div>
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
