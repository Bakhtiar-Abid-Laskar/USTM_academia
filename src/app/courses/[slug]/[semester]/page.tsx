import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { FileText } from "lucide-react";

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

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", course.id)
    .eq("semester_id", semester.id)
    .eq("is_active", true)
    .order("name");

  // Get document counts per subject
  const subjectIds = subjects?.map(s => s.id) || [];
  const docCounts: Record<string, { syllabus: number; qp: number }> = {};
  if (subjectIds.length > 0) {
    const { data: docs } = await supabase
      .from("documents")
      .select("subject_id, document_type_id")
      .eq("status", "published")
      .in("subject_id", subjectIds);
    if (docs) {
      docs.forEach((d: any) => {
        if (!docCounts[d.subject_id]) docCounts[d.subject_id] = { syllabus: 0, qp: 0 };
        if (d.document_type_id === 1) docCounts[d.subject_id].syllabus++;
        else docCounts[d.subject_id].qp++;
      });
    }
  }

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
                const counts = docCounts[subject.id] || { syllabus: 0, qp: 0 };
                const total = counts.syllabus + counts.qp;
                return (
                  <Link key={subject.id} href={`/courses/${course.slug}/${params.semester}/${subject.slug}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-text-main mb-1">{subject.name}</h3>
                        {subject.subject_code && (
                          <p className="text-xs text-text-muted mb-3">Code: {subject.subject_code}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {counts.syllabus > 0 && <Badge variant="default">{counts.syllabus} Syllabus</Badge>}
                          {counts.qp > 0 && <Badge variant="outline">{counts.qp} Question Papers</Badge>}
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
