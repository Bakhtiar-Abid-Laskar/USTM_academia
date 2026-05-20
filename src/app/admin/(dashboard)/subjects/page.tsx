"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import type { Course, Semester, Subject } from "@/types";

export default function ManageSubjectsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ course_id: "", semester_id: "", name: "", subject_code: "", slug: "" });

  useEffect(() => {
    fetch("/api/admin/courses").then(r => r.json()).then(d => { if (Array.isArray(d)) setCourses(d); });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetch(`/api/admin/semesters?course_id=${selectedCourse}`).then(r => r.json()).then(d => {
        if (Array.isArray(d)) setSemesters(d);
        setSelectedSemester("");
      });
    } else {
      setSemesters([]);
      setSelectedSemester("");
    }
  }, [selectedCourse]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSubjects(); }, [selectedCourse, selectedSemester]);

  async function fetchSubjects() {
    setLoading(true);
    let url = "/api/admin/subjects?";
    if (selectedCourse) url += `course_id=${selectedCourse}&`;
    if (selectedSemester) url += `semester_id=${selectedSemester}&`;
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data)) setSubjects(data);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ course_id: selectedCourse || "", semester_id: selectedSemester || "", name: "", subject_code: "", slug: "" });
    setError(""); setDialogOpen(true);
  }

  function openEdit(sub: Subject) {
    setEditing(sub);
    setForm({ course_id: sub.course_id, semester_id: sub.semester_id, name: sub.name, subject_code: sub.subject_code || "", slug: sub.slug });
    setError(""); setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const method = editing ? "PUT" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch("/api/admin/subjects", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); setError(typeof err.error === "string" ? err.error : "Failed to save"); setSaving(false); return; }
    setDialogOpen(false); setSaving(false); fetchSubjects();
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    await fetch(`/api/admin/subjects?id=${deleting.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false); setSaving(false); fetchSubjects();
  }

  // Fetch semesters for the dialog form
  const [formSemesters, setFormSemesters] = useState<Semester[]>([]);
  useEffect(() => {
    if (form.course_id && dialogOpen) {
      fetch(`/api/admin/semesters?course_id=${form.course_id}`).then(r => r.json()).then(d => {
        if (Array.isArray(d)) setFormSemesters(d);
      });
    }
  }, [form.course_id, dialogOpen]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-main">Manage Subjects</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Subject</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <CardTitle>Subjects ({subjects.length})</CardTitle>
            <div className="flex gap-2 sm:ml-auto flex-wrap">
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.short_name}</option>)}
              </select>
              {selectedCourse && (
                <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted text-center py-8">Loading...</p>
          ) : subjects.length === 0 ? (
            <p className="text-text-muted text-center py-8">No subjects found.</p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-text-muted font-medium">Subject</th>
                  <th className="text-left px-6 py-3 text-text-muted font-medium hidden sm:table-cell">Code</th>
                  <th className="text-left px-6 py-3 text-text-muted font-medium hidden md:table-cell">Course</th>
                  <th className="text-left px-6 py-3 text-text-muted font-medium hidden md:table-cell">Semester</th>
                  <th className="text-right px-6 py-3 text-text-muted font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {subjects.map(sub => (
                    <tr key={sub.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-3 font-medium text-text-main">{sub.name}</td>
                      <td className="px-6 py-3 text-text-muted hidden sm:table-cell">{sub.subject_code || "-"}</td>
                      <td className="px-6 py-3 text-text-muted hidden md:table-cell">{(sub as any).course?.short_name || "-"}</td>
                      <td className="px-6 py-3 text-text-muted hidden md:table-cell">{(sub as any).semester?.label || "-"}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/documents?course_id=${sub.course_id}&semester_id=${sub.semester_id}&subject_id=${sub.id}`}>
                            <Button variant="ghost" size="icon" title="View Documents">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/documents/bulk-upload?course_id=${sub.course_id}&semester_id=${sub.semester_id}&subject_id=${sub.id}`}>
                            <Button variant="ghost" size="icon" title="Bulk Upload">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(sub)} title="Edit Subject">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeleting(sub); setDeleteDialogOpen(true); }} title="Delete Subject">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>{editing ? "Update subject details" : "Add a new subject"}</DialogDescription>
          </DialogHeader>
          {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course *</Label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value, semester_id: "" })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.short_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Semester *</Label>
              <select value={form.semester_id} onChange={e => setForm({ ...form, semester_id: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">Select semester</option>
                {formSemesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>Delete &ldquo;{deleting?.name}&rdquo;? Cannot be undone.</DialogDescription>
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
