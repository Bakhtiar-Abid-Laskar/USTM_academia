"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import {
  Trash2, Loader2, Plus, Pencil, Folder, Search
} from "lucide-react";
import { slugify } from "@/lib/utils";

export default function SemesterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.departmentId as string;
  const courseId = params.courseId as string;
  const semesterId = params.semesterId as string;

  const [department, setDepartment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [semester, setSemester] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // CRUD Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", subject_code: "", slug: "" });

  useEffect(() => { loadData(); }, [departmentId, courseId, semesterId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    try {
      const [deptRes, coursesRes, semRes, subsRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch(`/api/admin/courses?department_id=${departmentId}`),
        fetch(`/api/admin/semesters?course_id=${courseId}`),
        fetch(`/api/admin/subjects?semester_id=${semesterId}`),
      ]);

      const allDepts = await deptRes.json();
      const allCourses = await coursesRes.json();
      const allSems = await semRes.json();
      const allSubs = await subsRes.json();

      if (Array.isArray(allDepts)) setDepartment(allDepts.find((d: any) => d.id === departmentId));
      if (Array.isArray(allCourses)) setCourse(allCourses.find((c: any) => c.id === courseId));
      if (Array.isArray(allSems)) setSemester(allSems.find((s: any) => s.id === semesterId));
      if (Array.isArray(allSubs)) setSubjects(allSubs);
    } catch (err) {
      console.error("Failed to load:", err);
    }
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", subject_code: "", slug: "" });
    setError(""); setDialogOpen(true);
  }

  function openEdit(sub: any) {
    setEditing(sub);
    setForm({ name: sub.name, subject_code: sub.subject_code || "", slug: sub.slug });
    setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const method = editing ? "PUT" : "POST";
    const body = editing 
      ? { id: editing.id, course_id: courseId, semester_id: semesterId, department_id: departmentId, ...form } 
      : { course_id: courseId, semester_id: semesterId, department_id: departmentId, ...form };
      
    const res = await fetch("/api/admin/subjects", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); setError(typeof err.error === "string" ? err.error : "Failed to save"); setSaving(false); return; }
    setDialogOpen(false); setSaving(false); loadData();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    await fetch(`/api/admin/subjects?id=${deleting.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false); setSaving(false); loadData();
  }

  const filtered = subjects.filter(sub => {
    return !search || sub.name.toLowerCase().includes(search.toLowerCase()) || (sub.subject_code && sub.subject_code.toLowerCase().includes(search.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!department || !course || !semester) {
    return <p className="text-text-muted text-center py-20">Semester not found.</p>;
  }

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "Departments", href: "/admin/dashboard" },
        { label: department.name, href: `/admin/departments/${departmentId}` },
        { label: course.short_name, href: `/admin/departments/${departmentId}/courses/${courseId}` },
        { label: semester.label },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">{semester.label} Subjects</h1>
          <p className="text-sm text-text-muted mt-1">{course.short_name} • {department.name}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />Add Subject
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Subject List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted mb-4">No subjects added for this semester yet.</p>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />Add First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-text-muted font-medium">Subject</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium hidden sm:table-cell">Code</th>
                    <th className="text-right px-4 py-3 text-text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(sub => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => router.push(`/admin/departments/${departmentId}/courses/${courseId}/semesters/${semesterId}/subjects/${sub.id}`)}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-text-main text-sm">{sub.name}</span>
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden sm:table-cell">{sub.subject_code || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeleting(sub); setDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>{editing ? "Update subject details" : "Add a new subject"}</DialogDescription>
          </DialogHeader>
          {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Data Structures and Algorithms" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject Code</Label>
                <Input value={form.subject_code} onChange={e => setForm({ ...form, subject_code: e.target.value })} placeholder="CS301" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="data-structures" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleting?.name}&rdquo;? Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
