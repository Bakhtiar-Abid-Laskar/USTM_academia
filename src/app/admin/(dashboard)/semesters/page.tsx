"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Course, Semester } from "@/types";

export default function ManageSemestersPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [deleting, setDeleting] = useState<Semester | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ course_id: "", semester_number: 1, label: "" });

  useEffect(() => {
    fetch("/api/admin/courses").then(r => r.json()).then(d => { if (Array.isArray(d)) setCourses(d); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCourse ? `/api/admin/semesters?course_id=${selectedCourse}` : "/api/admin/semesters";
    fetch(url).then(r => r.json()).then(d => { if (Array.isArray(d)) setSemesters(d); setLoading(false); });
  }, [selectedCourse]);

  function openAdd() {
    setEditing(null);
    setForm({ course_id: selectedCourse || "", semester_number: 1, label: "Semester 1" });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(sem: Semester) {
    setEditing(sem);
    setForm({ course_id: sem.course_id, semester_number: sem.semester_number, label: sem.label });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch("/api/admin/semesters", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); setError(typeof err.error === "string" ? err.error : "Failed to save"); setSaving(false); return; }
    setDialogOpen(false); setSaving(false);
    const url = selectedCourse ? `/api/admin/semesters?course_id=${selectedCourse}` : "/api/admin/semesters";
    fetch(url).then(r => r.json()).then(d => { if (Array.isArray(d)) setSemesters(d); });
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    await fetch(`/api/admin/semesters?id=${deleting.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false); setSaving(false);
    const url = selectedCourse ? `/api/admin/semesters?course_id=${selectedCourse}` : "/api/admin/semesters";
    fetch(url).then(r => r.json()).then(d => { if (Array.isArray(d)) setSemesters(d); });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-main">Manage Semesters</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Semester</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <CardTitle>Semesters ({semesters.length})</CardTitle>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-white sm:ml-auto">
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.short_name}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted text-center py-8">Loading...</p>
          ) : semesters.length === 0 ? (
            <p className="text-text-muted text-center py-8">No semesters found. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-text-muted font-medium">Label</th>
                  <th className="text-left px-6 py-3 text-text-muted font-medium hidden sm:table-cell">Course</th>
                  <th className="text-left px-6 py-3 text-text-muted font-medium">Number</th>
                  <th className="text-right px-6 py-3 text-text-muted font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {semesters.map(sem => (
                    <tr key={sem.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3 font-medium text-text-main">{sem.label}</td>
                      <td className="px-6 py-3 text-text-muted hidden sm:table-cell">{(sem as any).course?.short_name || "-"}</td>
                      <td className="px-6 py-3 text-text-muted">{sem.semester_number}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(sem)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeleting(sem); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-error" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Semester" : "Add Semester"}</DialogTitle>
            <DialogDescription>{editing ? "Update semester details" : "Add a new semester"}</DialogDescription>
          </DialogHeader>
          {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course *</Label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">Select a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.short_name} — {c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester Number *</Label>
                <Input type="number" value={form.semester_number}
                  onChange={e => setForm({ ...form, semester_number: Number(e.target.value), label: `Semester ${e.target.value}` })} />
              </div>
              <div className="space-y-2">
                <Label>Label *</Label>
                <Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Semester 1" />
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Semester</DialogTitle>
            <DialogDescription>Delete &ldquo;{deleting?.label}&rdquo;? This will also delete associated subjects. Cannot be undone.</DialogDescription>
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
