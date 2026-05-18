"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, FileText, X } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import type { Course, Semester, Subject } from "@/types";

export default function UploadDocumentPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "", course_id: "", semester_id: "", subject_id: "",
    document_type_id: "2", exam_type_id: "", year: "",
    is_downloadable: true, status: "published",
  });

  useEffect(() => {
    fetch("/api/admin/courses").then(r => r.json()).then(d => { if (Array.isArray(d)) setCourses(d); });
  }, []);

  useEffect(() => {
    if (form.course_id) {
      fetch(`/api/admin/semesters?course_id=${form.course_id}`).then(r => r.json()).then(d => {
        if (Array.isArray(d)) setSemesters(d);
      });
      setForm(f => ({ ...f, semester_id: "", subject_id: "" }));
    }
  }, [form.course_id]);

  useEffect(() => {
    if (form.semester_id) {
      fetch(`/api/admin/subjects?semester_id=${form.semester_id}`).then(r => r.json()).then(d => {
        if (Array.isArray(d)) setSubjects(d);
      });
      setForm(f => ({ ...f, subject_id: "" }));
    }
  }, [form.semester_id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Only PDF files are allowed"); return; }
    if (f.size > 20 * 1024 * 1024) { setError("File must be less than 20 MB"); return; }
    setFile(f);
    setError("");
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) { setError("Please select a PDF file"); return; }
    if (!form.title || !form.course_id || !form.semester_id || !form.subject_id || !form.document_type_id) {
      setError("Please fill in all required fields"); return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(form));

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Upload failed");
        setUploading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/documents"), 1500);
    } catch {
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-text-main mb-2">Upload Successful!</h2>
            <p className="text-text-muted">Redirecting to documents...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-main mb-6">Upload Document</h1>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Document Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-5">
            {error && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{error}</div>}

            {/* File Upload */}
            <div className="space-y-2">
              <Label>PDF File *</Label>
              {file ? (
                <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-gray-50">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">{file.name}</p>
                    <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                  <Upload className="h-8 w-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted mb-2">Select a PDF file (max 20 MB)</p>
                  <Input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="max-w-xs mx-auto" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Data Structures End Semester 2023" />
            </div>

            {/* Course → Semester → Subject (cascading) */}
            <div className="space-y-2">
              <Label>Course *</Label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.short_name} — {c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester *</Label>
                <select value={form.semester_id} onChange={e => setForm({ ...form, semester_id: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white" disabled={!form.course_id}>
                  <option value="">Select semester</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white" disabled={!form.semester_id}>
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="doc_type" value="1" checked={form.document_type_id === "1"}
                    onChange={() => setForm({ ...form, document_type_id: "1", exam_type_id: "", year: "" })} />
                  Syllabus
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="doc_type" value="2" checked={form.document_type_id === "2"}
                    onChange={() => setForm({ ...form, document_type_id: "2" })} />
                  Question Paper
                </label>
              </div>
            </div>

            {/* Year + Exam Type (only for Question Paper) */}
            {form.document_type_id === "2" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2023" min="2000" max="2100" />
                </div>
                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <select value={form.exam_type_id} onChange={e => setForm({ ...form, exam_type_id: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                    <option value="">Select exam type</option>
                    <option value="1">Mid Term</option>
                    <option value="2">End Semester</option>
                    <option value="3">Internal Exam</option>
                    <option value="4">Practical Exam</option>
                    <option value="5">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Status + Downloadable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Download</Label>
                <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
                  <input type="checkbox" checked={form.is_downloadable}
                    onChange={e => setForm({ ...form, is_downloadable: e.target.checked })} />
                  Allow students to download
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Upload & Publish</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
