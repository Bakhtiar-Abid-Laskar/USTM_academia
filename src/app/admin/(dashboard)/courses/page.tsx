"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Course } from "@/types";

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "", short_name: "", slug: "", department: "",
    duration_years: 4, total_semesters: 8, description: "",
  });

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
      else setCourses([]);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchCourses(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", short_name: "", slug: "", department: "", duration_years: 4, total_semesters: 8, description: "" });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setForm({
      name: course.name, short_name: course.short_name, slug: course.slug,
      department: course.department || "", duration_years: course.duration_years,
      total_semesters: course.total_semesters, description: course.description || "",
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;

    const res = await fetch("/api/admin/courses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(typeof err.error === "string" ? err.error : "Failed to save course");
      setSaving(false);
      return;
    }

    setDialogOpen(false);
    setSaving(false);
    fetchCourses();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    const res = await fetch(`/api/admin/courses?id=${deleting.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      setError(typeof err.error === "string" ? err.error : "Failed to delete");
    }
    setDeleteDialogOpen(false);
    setSaving(false);
    fetchCourses();
  }

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.short_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-main">Manage Courses</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <CardTitle>All Courses ({courses.length})</CardTitle>
            <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="sm:max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted text-center py-8">Loading courses...</p>
          ) : filtered.length === 0 ? (
            <p className="text-text-muted text-center py-8">No courses found.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-text-muted font-medium">Course</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium hidden sm:table-cell">Department</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium hidden md:table-cell">Semesters</th>
                    <th className="text-right px-6 py-3 text-text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(course => (
                    <tr key={course.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3">
                        <div className="font-medium text-text-main">{course.short_name}</div>
                        <div className="text-xs text-text-muted">{course.name}</div>
                      </td>
                      <td className="px-6 py-3 text-text-muted hidden sm:table-cell">{course.department || "-"}</td>
                      <td className="px-6 py-3 text-text-muted hidden md:table-cell">{course.total_semesters}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(course)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeleting(course); setDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>{editing ? "Update course details" : "Enter course information"}</DialogDescription>
          </DialogHeader>
          {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={e => { setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) }); }} placeholder="Bachelor of Technology in Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short Name *</Label>
                <Input value={form.short_name} onChange={e => setForm({ ...form, short_name: e.target.value })} placeholder="B.Tech CSE" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="btech-cse" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="School of Engineering" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input type="number" value={form.duration_years} onChange={e => setForm({ ...form, duration_years: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Total Semesters *</Label>
                <Input type="number" value={form.total_semesters} onChange={e => setForm({ ...form, total_semesters: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional course description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleting?.short_name}&rdquo;? This will also delete all associated semesters, subjects, and documents. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
