import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { FileText } from "lucide-react";

// Enable ISR: Cache page for 1 hour, then revalidate in background
export const revalidate = 3600; // 1 hour in seconds

export default async function SemesterSubjectsPage({
  params,
}: {
  params: { slug: string; semester: string };
}) {
  const supabase = await createClient();

  // Parse semester number from URL (semester-3 → 3)
  const semNum = parseInt(params.semester.replace("semester-", ""));
  if (isNaN(semNum)) notFound();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!course) notFound();

  const { data: semester } = await supabase
    .from("semesters")
    .select("*")
    .eq("course_id", course.id)
    .eq("semester_number", semNum)
    .single();

  if (!semester) notFound();

  // ✅ OPTIMIZED: Fetch subjects with document relationships to count locally
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, documents(id, document_type_id)")
    .eq("course_id", course.id)
    .eq("semester_id", semester.id)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          <nav className="text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/courses" className="hover:text-primary">Courses</Link>
            <span className="mx-2">›</span>
            <Link href={`/courses/${course.slug}`} className="hover:text-primary">{course.short_name}</Link>
            <span className="mx-2">›</span>
            <span className="text-text-main font-medium">{semester.label}</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-1">{semester.label}</h1>
            <p className="text-text-muted">{course.short_name} — {course.name}</p>
          </div>

          {!subjects || subjects.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium mb-1">No subjects available</p>
              <p className="text-sm">Subjects for this semester will be updated soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject: any) => {
                // ✅ OPTIMIZED: Calculate counts from aggregated documents data
                const docList = subject.documents || [];
                const syllabusCount = docList.filter((d: any) => d.document_type_id === 1).length;
                const qpCount = docList.filter((d: any) => d.document_type_id === 2).length;
                const total = syllabusCount + qpCount;
                
                return (
                  <Link key={subject.id} href={`/courses/${course.slug}/${params.semester}/${subject.slug}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-text-main mb-1">{subject.name}</h3>
                        {subject.subject_code && (
                          <p className="text-xs text-text-muted mb-3">Code: {subject.subject_code}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {syllabusCount > 0 && <Badge variant="default">{syllabusCount} Syllabus</Badge>}
                          {qpCount > 0 && <Badge variant="outline">{qpCount} Question Papers</Badge>}
                          {total === 0 && <span className="text-xs text-gray-400">No documents yet</span>}
                        </div>
                      </CardContent>
                    </Card>
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
