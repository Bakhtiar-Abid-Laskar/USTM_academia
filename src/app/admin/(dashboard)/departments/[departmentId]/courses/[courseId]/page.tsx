"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { Loader2, FileText, BookOpen, ChevronRight } from "lucide-react";

interface Semester {
  id: string;
  semester_number: number;
  label: string;
  document_count: number;
  syllabus_count: number;
  qp_count: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const departmentId = params.departmentId as string;
  const courseId = params.courseId as string;

  const [department, setDepartment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [deptRes, coursesRes, semRes] = await Promise.all([
          fetch("/api/admin/departments"),
          fetch(`/api/admin/courses?department_id=${departmentId}`),
          fetch(`/api/admin/semesters?course_id=${courseId}`),
        ]);
        const allDepts = await deptRes.json();
        const allCourses = await coursesRes.json();
        const allSems = await semRes.json();

        if (Array.isArray(allDepts)) {
          setDepartment(allDepts.find((d: any) => d.id === departmentId));
        }
        if (Array.isArray(allCourses)) {
          setCourse(allCourses.find((c: any) => c.id === courseId));
        }
        if (Array.isArray(allSems)) setSemesters(allSems);
      } catch (err) {
        console.error("Failed to load:", err);
      }
      setLoading(false);
    }
    load();
  }, [departmentId, courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!department || !course) {
    return <p className="text-text-muted text-center py-20">Course not found.</p>;
  }

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "Departments", href: "/admin/dashboard" },
        { label: department.name, href: `/admin/departments/${departmentId}` },
        { label: course.short_name },
      ]} />

      {/* Course Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-main">{course.short_name}</h1>
        <p className="text-sm text-text-muted mt-1">{course.name}</p>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant="outline">{course.total_semesters} Semesters</Badge>
          <Badge variant="outline">{course.duration_years} Years</Badge>
        </div>
      </div>

      {/* Semesters Grid */}
      <h2 className="text-lg font-semibold text-text-main mb-4">Semesters</h2>

      {semesters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted">No semesters found for this course.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {semesters.map(sem => (
            <Link
              key={sem.id}
              href={`/admin/departments/${departmentId}/courses/${courseId}/semesters/${sem.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{sem.semester_number}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-muted" />
                  </div>
                  <h3 className="font-semibold text-text-main text-sm mb-3">{sem.label}</h3>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Documents</span>
                      <Badge variant="outline" className="text-xs">{sem.document_count}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Syllabus</span>
                      <span className="text-text-main font-medium">{sem.syllabus_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Question Papers</span>
                      <span className="text-text-main font-medium">{sem.qp_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
