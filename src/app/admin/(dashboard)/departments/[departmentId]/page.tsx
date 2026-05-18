"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import {
  Plus, Pencil, Trash2, Loader2, BookOpen, FileText, ChevronRight, Search,
} from "lucide-react";
import { slugify } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

interface Course {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  description: string | null;
  total_semesters: number;
  duration_years: number;
  is_active: boolean;
  document_count: number;
}

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Course form
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [courseForm, setCourseForm] = useState({
    name: "", short_name: "", slug: "", description: "",
    total_semesters: 8, duration_years: 4,
  });

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Course | null>(null);

  // Edit department
  const [editDeptDialogOpen, setEditDeptDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "" });
  const [deptSaving, setDeptSaving] = useState(false);
  const [deptError, setDeptError] = useState("");

  // Delete department
  const [deleteDeptDialogOpen, setDeleteDeptDialogOpen] = useState(false);

  useEffect(() => { loadData(); }, [departmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    try {
      const [deptRes, coursesRes] = await Promise.all([
        fetch(`/api/admin/departments`),
        fetch(`/api/admin/courses?department_id=${departmentId}`),
      ]);
      const allDepts = await deptRes.json();
      const coursesData = await coursesRes.json();

      if (Array.isArray(allDepts)) {
        const dept = allDepts.find((d: any) => d.id === departmentId);
        if (dept) setDepartment(dept);
      }
      if (Array.isArray(coursesData)) setCourses(coursesData);
    } catch (err) {
      console.error("Failed to load:", err);
    }
    setLoading(false);
  }

  // Course CRUD
  function openAddCourse() {
    setEditing(null);
    setCourseForm({ name: "", short_name: "", slug: "", description: "", total_semesters: 8, duration_years: 4 });
    setError("");
    setCourseDialogOpen(true);
  }

  function openEditCourse(course: Course) {
    setEditing(course);
    setCourseForm({
      name: course.name, short_name: course.short_name, slug: course.slug,
      description: course.description || "", total_semesters: course.total_semesters,
      duration_years: course.duration_years,
    });
    setError("");
    setCourseDialogOpen(true);
  }

  async function handleSaveCourse() {
    if (!courseForm.name || !courseForm.short_name || !courseForm.slug) {
      setError("Name, short name, and slug are required");
      return;
    }
    if (courseForm.total_semesters < 1 || courseForm.total_semesters > 12) {
      setError("Semester count must be between 1 and 12");
      return;
    }
    setSaving(true);
    setError("");

    const method = editing ? "PUT" : "POST";
    const body = editing
      ? { id: editing.id, ...courseForm }
      : { ...courseForm, department_id: departmentId, department_name: department?.name };

    const res = await fetch("/api/admin/courses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to save");
      setSaving(false);
      return;
    }

    setCourseDialogOpen(false);
    setSaving(false);
    loadData();
  }

  async function handleDeleteCourse() {
    if (!deleting) return;
    setSaving(true);
    const res = await fetch(`/api/admin/courses?id=${deleting.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to delete");
    }
    setDeleteDialogOpen(false);
    setSaving(false);
    loadData();
  }

  // Department edit
  function openEditDept() {
    if (!department) return;
    setDeptForm({ name: department.name, code: department.code, description: department.description || "" });
    setDeptError("");
    setEditDeptDialogOpen(true);
  }

  async function handleSaveDept() {
    if (!department) return;
    setDeptSaving(true);
    setDeptError("");
    const res = await fetch("/api/admin/departments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: department.id, ...deptForm }),
    });
    if (!res.ok) {
      const err = await res.json();
      setDeptError(err.error || "Failed to update");
      setDeptSaving(false);
      return;
    }
    setEditDeptDialogOpen(false);
    setDeptSaving(false);
    loadData();
  }

  async function handleDeleteDept() {
    if (!department) return;
    setDeptSaving(true);
    const res = await fetch(`/api/admin/departments?id=${department.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      setDeptError(err.error || "Failed to delete");
      setDeptSaving(false);
      return;
    }
    router.push("/admin/dashboard");
  }

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.short_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!department) {
    return <p className="text-text-muted text-center py-20">Department not found.</p>;
  }

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "Departments", href: "/admin/dashboard" },
        { label: department.name },
      ]} />

      {/* Department Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">{department.name}</h1>
          {department.description && <p className="text-sm text-text-muted mt-1">{department.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditDept}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteDeptDialogOpen(true)} className="text-error border-error/30 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
          </Button>
        </div>
      </div>

      {/* Courses Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-text-main">Courses ({courses.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-56" />
          </div>
          <Button onClick={openAddCourse}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
        </div>
      </div>

      {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md mb-4">{error}</div>}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted mb-4">No courses in this department yet.</p>
            <Button onClick={openAddCourse}><Plus className="h-4 w-4 mr-2" />Create First Course</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-text-main text-sm">{course.short_name}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.preventDefault(); openEditCourse(course); }}
                      className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-text-main">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setDeleting(course); setDeleteDialogOpen(true); }}
                      className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-error">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-3 line-clamp-2">{course.name}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{course.total_semesters} Semesters</Badge>
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />{course.document_count} Docs
                  </Badge>
                </div>
                <Link href={`/admin/departments/${departmentId}/courses/${course.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Course <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update course details" : `Add a new course to ${department.name}`}
            </DialogDescription>
          </DialogHeader>
          {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={courseForm.name}
                onChange={e => setCourseForm({ ...courseForm, name: e.target.value, slug: slugify(e.target.value) })}
                placeholder="Bachelor of Technology in Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short Name *</Label>
                <Input value={courseForm.short_name}
                  onChange={e => setCourseForm({ ...courseForm, short_name: e.target.value })}
                  placeholder="B.Tech CSE" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={courseForm.slug}
                  onChange={e => setCourseForm({ ...courseForm, slug: e.target.value })}
                  placeholder="btech-cse" />
              </div>
            </div>
            {!editing && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Semesters *</Label>
                  <Input type="number" min="1" max="12" value={courseForm.total_semesters}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setCourseForm({ ...courseForm, total_semesters: val, duration_years: Math.ceil(val / 2) });
                    }} />
                  <p className="text-xs text-text-muted">Semesters will be auto-created</p>
                </div>
                <div className="space-y-2">
                  <Label>Duration (Years)</Label>
                  <Input type="number" min="1" max="6" value={courseForm.duration_years}
                    onChange={e => setCourseForm({ ...courseForm, duration_years: Number(e.target.value) })} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={courseForm.description}
                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Optional course description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCourse} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Update" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleting?.short_name}&rdquo;? This will also delete all semesters and documents. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={editDeptDialogOpen} onOpenChange={setEditDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department details</DialogDescription>
          </DialogHeader>
          {deptError && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{deptError}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeptDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDept} disabled={deptSaving}>
              {deptSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={deleteDeptDialogOpen} onOpenChange={setDeleteDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{department.name}&rdquo;. You must remove all courses first.
            </DialogDescription>
          </DialogHeader>
          {deptError && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{deptError}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDeptDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDept} disabled={deptSaving}>
              {deptSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
