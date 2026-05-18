import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicHeader, PublicFooter } from "@/components/public/layout";
import { FileText, Download, Eye, Inbox } from "lucide-react";

// Enable ISR: Cache page for 1 hour, then revalidate in background
export const revalidate = 3600; // 1 hour in seconds

export default async function SubjectDocumentsPage({
  params,
}: {
  params: { slug: string; semester: string; subject: string };
}) {
  const supabase = await createClient();

  const semNum = parseInt(params.semester.replace("semester-", ""));
  if (isNaN(semNum)) notFound();

  const { data: course } = await supabase.from("courses").select("*").eq("slug", params.slug).eq("is_active", true).single();
  if (!course) notFound();

  const { data: semester } = await supabase.from("semesters").select("*").eq("course_id", course.id).eq("semester_number", semNum).single();
  if (!semester) notFound();

  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", params.subject).eq("semester_id", semester.id).eq("course_id", course.id).single();
  if (!subject) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("*, document_type:document_types(*), exam_type:exam_types(*)")
    .eq("subject_id", subject.id)
    .eq("status", "published")
    .order("document_type_id")
    .order("year", { ascending: false });

  const syllabusDocs = documents?.filter((d: any) => d.document_type_id === 1) || [];
  const questionPapers = documents?.filter((d: any) => d.document_type_id === 2) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
          <nav className="text-sm text-text-muted mb-6 flex flex-wrap gap-1">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>›</span>
            <Link href="/courses" className="hover:text-primary">Courses</Link>
            <span>›</span>
            <Link href={`/courses/${course.slug}`} className="hover:text-primary">{course.short_name}</Link>
            <span>›</span>
            <Link href={`/courses/${course.slug}/${params.semester}`} className="hover:text-primary">{semester.label}</Link>
            <span>›</span>
            <span className="text-text-main font-medium">{subject.name}</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-1">{subject.name}</h1>
            <p className="text-text-muted text-sm">
              {course.short_name} • {semester.label}
              {subject.subject_code && ` • ${subject.subject_code}`}
            </p>
          </div>

          {(!documents || documents.length === 0) ? (
            <div className="text-center py-16 text-text-muted">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-medium mb-1">No documents available</p>
              <p className="text-sm">Documents for this subject will be uploaded soon.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Syllabus Section */}
              {syllabusDocs.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Syllabus
                  </h2>
                  <div className="space-y-3">
                    {syllabusDocs.map((doc: any) => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </section>
              )}

              {/* Question Papers Section */}
              {questionPapers.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Previous Year Question Papers
                  </h2>
                  <div className="space-y-3">
                    {questionPapers.map((doc: any) => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function DocumentCard({ doc }: { doc: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-main text-sm sm:text-base">{doc.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={doc.document_type?.slug === "syllabus" ? "default" : "outline"}>
                {doc.document_type?.name}
              </Badge>
              {doc.exam_type && <Badge variant="outline">{doc.exam_type.name}</Badge>}
              {doc.year && <Badge variant="outline">{doc.year}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/view/${doc.id}`}>
              <Button size="sm">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View PDF
              </Button>
            </Link>
            {doc.is_downloadable && (
              <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
