"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import {
  Trash2, Loader2, Eye, Upload, FileText, Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function SubjectDetailPage() {
  const params = useParams();
  const departmentId = params.departmentId as string;
  const courseId = params.courseId as string;
  const semesterId = params.semesterId as string;
  const subjectId = params.subjectId as string;

  const [department, setDepartment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [semester, setSemester] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  // Upload dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    document_type_id: "2", exam_type_id: "", year: new Date().getFullYear().toString(),
    is_downloadable: true,
  });
  const [file, setFile] = useState<File | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  useEffect(() => { loadData(); }, [departmentId, courseId, semesterId, subjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    try {
      const [deptRes, coursesRes, semRes, subsRes, docsRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch(`/api/admin/courses?department_id=${departmentId}`),
        fetch(`/api/admin/semesters?course_id=${courseId}`),
        fetch(`/api/admin/subjects?semester_id=${semesterId}`),
        fetch(`/api/admin/documents?subject_id=${subjectId}`),
      ]);

      const allDepts = await deptRes.json();
      const allCourses = await coursesRes.json();
      const allSems = await semRes.json();
      const allSubs = await subsRes.json();
      const allDocs = await docsRes.json();

      if (Array.isArray(allDepts)) setDepartment(allDepts.find((d: any) => d.id === departmentId));
      if (Array.isArray(allCourses)) setCourse(allCourses.find((c: any) => c.id === courseId));
      if (Array.isArray(allSems)) setSemester(allSems.find((s: any) => s.id === semesterId));
      if (Array.isArray(allSubs)) setSubject(allSubs.find((s: any) => s.id === subjectId));
      if (Array.isArray(allDocs)) setDocuments(allDocs);
    } catch (err) {
      console.error("Failed to load:", err);
    }
    setLoading(false);
  }

  async function handleUpload() {
    if (!file) { setUploadError("Please select a PDF file"); return; }
    if (!uploadForm.title) { setUploadError("Title is required"); return; }

    setUploading(true);
    setUploadError("");

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", uploadForm.title);
      formData.append("subject_id", subjectId);
      formData.append("course_id", courseId);
      formData.append("semester_id", semesterId);
      formData.append("department_id", departmentId);
      formData.append("document_type_id", uploadForm.document_type_id);
      if (uploadForm.exam_type_id) formData.append("exam_type_id", uploadForm.exam_type_id);
      if (uploadForm.year) formData.append("year", uploadForm.year);
      formData.append("is_downloadable", String(uploadForm.is_downloadable));

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        setUploadError(err.error || "Upload failed");
        setUploading(false);
        return;
      }

      setUploadOpen(false);
      setFile(null);
      setUploadForm({
        title: "",
        document_type_id: "2", exam_type_id: "", year: new Date().getFullYear().toString(),
        is_downloadable: true,
      });
      loadData();
    } catch {
      setUploadError("Upload failed. Please try again.");
    }
    setUploading(false);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteSaving(true);
    await fetch(`/api/admin/documents?id=${deleting.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false);
    setDeleteSaving(false);
    loadData();
  }

  const filtered = documents.filter(doc => {
    const matchSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || String(doc.document_type_id) === filterType;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!department || !course || !semester || !subject) {
    return <p className="text-text-muted text-center py-20">Subject not found.</p>;
  }

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "Departments", href: "/admin/dashboard" },
        { label: department.name, href: `/admin/departments/${departmentId}` },
        { label: course.short_name, href: `/admin/departments/${departmentId}/courses/${courseId}` },
        { label: semester.label, href: `/admin/departments/${departmentId}/courses/${courseId}/semesters/${semesterId}` },
        { label: subject.name },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">{subject.name}</h1>
          <p className="text-sm text-text-muted mt-1">{subject.subject_code ? `${subject.subject_code} • ` : ""}{semester.label} • {course.short_name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/documents/bulk-upload?course_id=${courseId}&semester_id=${semesterId}&subject_id=${subjectId}`}>
            <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Bulk Upload</Button>
          </Link>
          <Button onClick={() => { setUploadError(""); setUploadOpen(true); }}>
            <Upload className="h-4 w-4 mr-2" />Upload Document
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-border rounded-md px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          <option value="1">Syllabus</option>
          <option value="2">Question Paper</option>
        </select>
      </div>

      {/* Document List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-text-muted mb-4">No documents uploaded for this subject yet.</p>
            <div className="flex justify-center gap-3">
              <Link href={`/admin/documents/bulk-upload?course_id=${courseId}&semester_id=${semesterId}&subject_id=${subjectId}`}>
                <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Bulk Upload</Button>
              </Link>
              <Button onClick={() => { setUploadError(""); setUploadOpen(true); }}>
                <Upload className="h-4 w-4 mr-2" />Upload First Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-text-muted font-medium">Title</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">Year</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">Status</th>
                    <th className="text-left px-4 py-3 text-text-muted font-medium hidden lg:table-cell">Uploaded</th>
                    <th className="text-right px-4 py-3 text-text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => (
                    <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-text-main text-sm">{doc.title}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant={doc.document_type?.slug === "syllabus" ? "default" : "outline"}>
                          {doc.document_type?.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted hidden md:table-cell">{doc.year || "-"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant={doc.status === "published" ? "default" : "outline"}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />View
                            </Button>
                          </a>
                          <Button variant="ghost" size="icon"
                            onClick={() => { setDeleting(doc); setDeleteDialogOpen(true); }}>
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

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a PDF to {subject.name}
            </DialogDescription>
          </DialogHeader>
          {uploadError && <div className="text-sm text-error bg-red-50 p-3 rounded-md">{uploadError}</div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Title *</Label>
              <Input value={uploadForm.title}
                onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="Data Structures Mid Term 2024" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <select value={uploadForm.document_type_id}
                  onChange={e => setUploadForm({ ...uploadForm, document_type_id: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="1">Syllabus</option>
                  <option value="2">Question Paper</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={uploadForm.year}
                  onChange={e => setUploadForm({ ...uploadForm, year: e.target.value })}
                  placeholder="2024" />
              </div>
            </div>

            {uploadForm.document_type_id === "2" && (
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <select value={uploadForm.exam_type_id}
                  onChange={e => setUploadForm({ ...uploadForm, exam_type_id: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select exam type</option>
                  <option value="1">Mid Term</option>
                  <option value="2">End Semester</option>
                  <option value="3">Internal Exam</option>
                  <option value="4">Practical Exam</option>
                  <option value="5">Other</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label>PDF File *</Label>
              <Input type="file" accept=".pdf,application/pdf"
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-text-muted">Only PDF files. Max 20 MB.</p>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="downloadable" checked={uploadForm.is_downloadable}
                onChange={e => setUploadForm({ ...uploadForm, is_downloadable: e.target.checked })} />
              <Label htmlFor="downloadable" className="text-sm cursor-pointer">Allow download</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleting?.title}&rdquo;? The PDF will also be removed from storage. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteSaving}>
              {deleteSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
