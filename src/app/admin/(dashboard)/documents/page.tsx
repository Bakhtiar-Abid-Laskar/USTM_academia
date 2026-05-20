"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Loader2, Eye, Upload, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Course, Semester, Subject } from "@/types";

export default function ManageDocumentsPage() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/courses").then(r => r.json()).then(d => { if (Array.isArray(d)) setCourses(d); });
    
    // Parse URL params on mount
    const courseId = searchParams.get("course_id");
    const semesterId = searchParams.get("semester_id");
    const subjectId = searchParams.get("subject_id");
    if (courseId) setSelectedCourse(courseId);
    if (semesterId) setSelectedSemester(semesterId);
    if (subjectId) setSelectedSubject(subjectId);
  }, [searchParams]);

  useEffect(() => {
    if (selectedCourse) {
      fetch(`/api/admin/semesters?course_id=${selectedCourse}`).then(r => r.json()).then(d => {
        if (Array.isArray(d)) setSemesters(d);
      });
    } else {
      setSemesters([]);
      setSelectedSemester("");
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedSemester) {
      fetch(`/api/admin/subjects?semester_id=${selectedSemester}`).then(r => r.json()).then(d => {
        if (Array.isArray(d)) setSubjects(d);
      });
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedSemester]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDocuments(); }, [selectedCourse, selectedSemester, selectedSubject, selectedStatus]);

  async function fetchDocuments() {
    setLoading(true);
    let url = "/api/admin/documents?";
    if (selectedCourse) url += `course_id=${selectedCourse}&`;
    if (selectedSemester) url += `semester_id=${selectedSemester}&`;
    if (selectedSubject) url += `subject_id=${selectedSubject}&`;
    if (selectedStatus) url += `status=${selectedStatus}&`;
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data)) setDocuments(data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    await fetch(`/api/admin/documents?id=${deleting.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false); setSaving(false); fetchDocuments();
  }

  const triggerReplace = (id: string) => {
    setReplacingId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !replacingId) return;
    const file = e.target.files[0];
    
    // reset input
    e.target.value = '';
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_id", replacingId);

      const res = await fetch("/api/admin/documents/replace", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to replace document");
      } else {
        alert("PDF replaced successfully");
        fetchDocuments();
      }
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      alert("Error replacing document");
    } finally {
      setSaving(false);
      setReplacingId(null);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="application/pdf"
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-main">Manage Documents</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/admin/documents/bulk-upload" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-2" />Bulk Upload</Button>
          </Link>
          <Link href="/admin/documents/upload" className="flex-1 sm:flex-initial">
            <Button className="w-full sm:w-auto"><Upload className="h-4 w-4 mr-2" />Upload New</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
            <CardTitle className="whitespace-nowrap">Documents ({documents.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
              <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedSemester(""); setSelectedSubject(""); }}
                className="border border-border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto">
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.short_name}</option>)}
              </select>
              {selectedCourse && (
                <select value={selectedSemester} onChange={e => { setSelectedSemester(e.target.value); setSelectedSubject(""); }}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto">
                  <option value="">All Semesters</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              )}
              {selectedSemester && (
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto">
                  <option value="">All Subjects</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto">
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-muted text-center py-8">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-text-muted text-center py-8">No documents found.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-main text-sm truncate">{doc.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">{doc.course?.short_name}</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted">{doc.semester?.label}</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted">{doc.subject?.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={doc.document_type?.slug === "syllabus" ? "default" : "outline"}>
                         {doc.document_type?.name}
                      </Badge>
                      {doc.exam_type && <Badge variant="outline">{doc.exam_type.name}</Badge>}
                      {doc.year && <Badge variant="outline">{doc.year}</Badge>}
                      <Badge variant={doc.status === "published" ? "success" : doc.status === "draft" ? "outline" : "warning"}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                    <span className="text-xs text-text-muted hidden sm:block">{formatDate(doc.created_at)}</span>
                    <a href={doc.google_drive_view_url || doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" />View</Button>
                    </a>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => triggerReplace(doc.id)}
                      disabled={saving && replacingId === doc.id}
                    >
                      {saving && replacingId === doc.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Replace
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeleting(doc); setDeleteDialogOpen(true); }} disabled={saving}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Delete &ldquo;{deleting?.title}&rdquo;? The PDF file will also be removed from storage. This cannot be undone.
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
