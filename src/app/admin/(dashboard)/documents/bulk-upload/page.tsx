"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import { validateBulkBatch } from "@/lib/validations";
import type {
  Course,
  Semester,
  Subject,
  BulkUploadFileItem,
  BulkUploadMetadata,
} from "@/types";

// ─── Constants ───
const MAX_FILE_SIZE_MB = 50;
const TOTAL_BATCH_LIMIT_MB = 500;
const VALIDATION_DEBOUNCE_MS = 400;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function createDefaultMetadata(): BulkUploadMetadata {
  return {
    title: "",
    course_id: "",
    semester_id: "",
    subject_id: "",
    document_type_id: "2",
    exam_type_id: "",
    year: "",
    is_downloadable: true,
    status: "published",
  };
}

function titleFromFileName(name: string): string {
  return name
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: BulkUploadFileItem["status"] }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "uploading":
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Uploading
        </Badge>
      );
    case "done":
      return (
        <Badge variant="success">
          <Check className="h-3 w-3 mr-1" />
          Done
        </Badge>
      );
    case "error":
      return (
        <Badge variant="error">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
  }
}

// ─── Completion Indicator ───
function isMetadataComplete(meta: BulkUploadMetadata): boolean {
  return !!(
    meta.title.trim().length >= 3 &&
    meta.course_id &&
    meta.semester_id &&
    meta.subject_id &&
    meta.document_type_id
  );
}

export default function BulkUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── File State ───
  const [items, setItems] = useState<BulkUploadFileItem[]>([]);
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ─── Reference Data ───
  const [courses, setCourses] = useState<Course[]>([]);
  const [semestersMap, setSemestersMap] = useState<Record<string, Semester[]>>({});
  const [subjectsMap, setSubjectsMap] = useState<Record<string, Subject[]>>({});

  // ─── Shared Metadata for "Apply to All" ───
  const [sharedMeta, setSharedMeta] = useState<BulkUploadMetadata>(() => {
    const meta = createDefaultMetadata();
    // Only pre-fill if we have course_id (this avoids hydration mismatch if we used searchParams directly, but since we are in a client component effect it is better to set it inside an effect or init function if searchParams is available. Wait, useSearchParams is available during render. Let's just use it.)
    if (searchParams) {
      if (searchParams.get("course_id")) meta.course_id = searchParams.get("course_id")!;
      if (searchParams.get("semester_id")) meta.semester_id = searchParams.get("semester_id")!;
      if (searchParams.get("subject_id")) meta.subject_id = searchParams.get("subject_id")!;
    }
    return meta;
  });
  const [sharedSemesters, setSharedSemesters] = useState<Semester[]>([]);
  const [sharedSubjects, setSharedSubjects] = useState<Subject[]>([]);

  // ─── Validation ───
  const [validationErrors, setValidationErrors] = useState<
    { fileIndex: number; field: string; message: string; severity: "error" | "warning" }[]
  >([]);
  const [validationWarnings, setValidationWarnings] = useState<
    { fileIndex: number; field: string; message: string; severity: "error" | "warning" }[]
  >([]);
  const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Upload State ───
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [batchId] = useState(() => generateId());

  // ─── Drag and Drop State ───
  const [isDragOver, setIsDragOver] = useState(false);

  // ─── Load Courses ───
  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCourses(d);
      });
  }, []);

  // ─── Shared Meta: Load Semesters on Course Change ───
  useEffect(() => {
    if (sharedMeta.course_id) {
      fetchSemesters(sharedMeta.course_id).then(setSharedSemesters);
    } else {
      setSharedSemesters([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedMeta.course_id]);

  // ─── Shared Meta: Load Subjects on Semester Change ───
  useEffect(() => {
    if (sharedMeta.semester_id) {
      fetchSubjects(sharedMeta.semester_id).then(setSharedSubjects);
    } else {
      setSharedSubjects([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedMeta.semester_id]);

  // ─── Debounced Validation ───
  const runValidation = useCallback(() => {
    if (validationTimer.current) clearTimeout(validationTimer.current);
    validationTimer.current = setTimeout(() => {
      if (items.length === 0) {
        setValidationErrors([]);
        setValidationWarnings([]);
        return;
      }
      const files = items.map((it) => it.file);
      const metas = items.map((it) => it.metadata);
      const result = validateBulkBatch(files, metas);
      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
    }, VALIDATION_DEBOUNCE_MS);
  }, [items]);

  useEffect(() => {
    runValidation();
    return () => {
      if (validationTimer.current) clearTimeout(validationTimer.current);
    };
  }, [runValidation]);

  // ─── Fetch Helpers ───
  async function fetchSemesters(courseId: string): Promise<Semester[]> {
    if (semestersMap[courseId]) return semestersMap[courseId];
    const res = await fetch(`/api/admin/semesters?course_id=${courseId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setSemestersMap((prev) => ({ ...prev, [courseId]: data }));
      return data;
    }
    return [];
  }

  async function fetchSubjects(semesterId: string): Promise<Subject[]> {
    if (subjectsMap[semesterId]) return subjectsMap[semesterId];
    const res = await fetch(`/api/admin/subjects?semester_id=${semesterId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setSubjectsMap((prev) => ({ ...prev, [semesterId]: data }));
      return data;
    }
    return [];
  }

  // ─── File Selection ───
  function addFiles(fileList: FileList) {
    const newItems: BulkUploadFileItem[] = [];
    const existingNames = new Set(items.map((i) => i.file.name.toLowerCase()));
    let rejected = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check PDF type
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        rejected++;
        continue;
      }

      // Skip duplicates already in list
      if (existingNames.has(file.name.toLowerCase())) {
        continue;
      }

      const id = generateId();
      newItems.push({
        id,
        file,
        sequence: items.length + newItems.length + 1,
        metadata: {
          ...createDefaultMetadata(),
          title: titleFromFileName(file.name),
        },
        status: "pending",
      });
      existingNames.add(file.name.toLowerCase());
    }

    if (rejected > 0) {
      alert(`${rejected} non-PDF file(s) were rejected.`);
    }

    if (newItems.length > 0) {
      const allItems = [...items, ...newItems];
      setItems(allItems);
      // Expand new panels
      const newExpanded = new Set(expandedPanels);
      newItems.forEach((ni) => newExpanded.add(ni.id));
      setExpandedPanels(newExpanded);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }

  // ─── Drag & Drop ───
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  // ─── File List Actions ───
  function removeFile(id: string) {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      return filtered.map((item, idx) => ({ ...item, sequence: idx + 1 }));
    });
    setExpandedPanels((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function moveFile(id: string, direction: "up" | "down") {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const newItems = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
      return newItems.map((item, i) => ({ ...item, sequence: i + 1 }));
    });
  }

  function updateMetadata(id: string, updates: Partial<BulkUploadMetadata>) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, metadata: { ...item.metadata, ...updates } }
          : item
      )
    );
  }

  function togglePanel(id: string) {
    setExpandedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ─── Bulk Actions ───
  function applySharedToAll() {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        metadata: {
          ...item.metadata,
          course_id: sharedMeta.course_id || item.metadata.course_id,
          semester_id: sharedMeta.semester_id || item.metadata.semester_id,
          subject_id: sharedMeta.subject_id || item.metadata.subject_id,
          document_type_id: sharedMeta.document_type_id || item.metadata.document_type_id,
          exam_type_id: sharedMeta.exam_type_id || item.metadata.exam_type_id,
          year: sharedMeta.year || item.metadata.year,
          is_downloadable: sharedMeta.is_downloadable,
          status: sharedMeta.status,
        },
      }))
    );
  }

  function copyFromFirst() {
    if (items.length === 0) return;
    const firstMeta = items[0].metadata;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === 0
          ? item
          : {
              ...item,
              metadata: {
                ...firstMeta,
                title: item.metadata.title, // Keep individual titles
              },
            }
      )
    );
  }

  // ─── Upload Execution ───
  async function handleUpload() {
    // Final validation
    const files = items.filter((i) => i.status !== "done").map((it) => it.file);
    const metas = items.filter((i) => i.status !== "done").map((it) => it.metadata);
    const result = validateBulkBatch(files, metas);

    if (!result.valid) {
      setValidationErrors(result.errors);
      setValidationWarnings(result.warnings);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsUploading(true);
    const pendingItems = items.filter((i) => i.status !== "done");
    setUploadProgress({ current: 0, total: pendingItems.length });

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];

      // Set uploading status
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "uploading" as const, error: undefined } : it
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("metadata", JSON.stringify(item.metadata));
        formData.append("sequence_number", String(item.sequence));
        formData.append("batch_id", batchId);

        const res = await fetch("/api/admin/bulk-upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "error" as const, error: data.error || "Upload failed" }
                : it
            )
          );
        } else {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: "done" as const,
                    result: {
                      documentId: data.document?.id,
                      driveFileId: data.driveFileId,
                      driveViewUrl: data.driveViewUrl,
                    },
                  }
                : it
            )
          );
        }
      } catch (err: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "error" as const, error: err.message || "Network error" }
              : it
          )
        );
      }

      setUploadProgress({ current: i + 1, total: pendingItems.length });
    }

    setIsUploading(false);
    setShowResults(true);
  }

  // ─── Post-Upload Actions ───
  function clearCompleted() {
    setItems((prev) => {
      const remaining = prev.filter((i) => i.status !== "done");
      return remaining.map((item, idx) => ({ ...item, sequence: idx + 1 }));
    });
    if (items.every((i) => i.status === "done")) {
      setShowResults(false);
    }
  }

  function retryFailed() {
    setItems((prev) =>
      prev.map((item) =>
        item.status === "error" ? { ...item, status: "pending" as const, error: undefined } : item
      )
    );
    setShowResults(false);
  }

  // ─── Computed Values ───
  const totalSize = items.reduce((acc, i) => acc + i.file.size, 0);
  const pendingCount = items.filter((i) => i.status === "pending" || i.status === "error").length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const isValid = validationErrors.length === 0 && items.length > 0 && pendingCount > 0;

  function getItemErrors(fileIndex: number) {
    return validationErrors.filter((e) => e.fileIndex === fileIndex);
  }

  function getItemWarnings(fileIndex: number) {
    return validationWarnings.filter((w) => w.fileIndex === fileIndex);
  }

  // ─── Render ───
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Bulk Upload Documents</h1>
          <p className="text-sm text-text-muted mt-1">
            Upload multiple PDFs at once with metadata
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/documents")}>
          ← Back
        </Button>
      </div>

      {/* ────── Validation Summary Banner ────── */}
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-red-800 font-medium text-sm">
            <AlertCircle className="h-4 w-4" />
            {validationErrors.length} error{validationErrors.length !== 1 ? "s" : ""} found — fix
            before uploading
          </div>
          <ul className="mt-2 text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
            {validationErrors.slice(0, 10).map((err, i) => (
              <li key={i}>
                {err.fileIndex >= 0 ? `File #${err.fileIndex + 1}` : "Batch"}: {err.message}
              </li>
            ))}
            {validationErrors.length > 10 && (
              <li className="text-red-500">...and {validationErrors.length - 10} more</li>
            )}
          </ul>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
            <AlertTriangle className="h-4 w-4" />
            {validationWarnings.length} warning{validationWarnings.length !== 1 ? "s" : ""}
          </div>
          <ul className="mt-1 text-xs text-amber-700 space-y-0.5 max-h-20 overflow-y-auto">
            {validationWarnings.slice(0, 5).map((w, i) => (
              <li key={i}>
                {w.fileIndex >= 0 ? `File #${w.fileIndex + 1}` : "Batch"}: {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ────── Upload Progress Bar ────── */}
      {isUploading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between text-sm font-medium text-blue-800 mb-2">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </span>
            <span>
              {uploadProgress.current} of {uploadProgress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ────── Results Summary ────── */}
      {showResults && !isUploading && (
        <div className="mb-6 border rounded-lg overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 border-b">
            <h3 className="font-semibold text-text-main">Upload Complete</h3>
          </div>
          <div className="p-4 bg-white">
            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="font-medium">{doneCount} succeeded</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-5 w-5 text-error" />
                  <span className="font-medium">{errorCount} failed</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button size="sm" onClick={clearCompleted}>
                {errorCount > 0 ? "Clear Completed" : "Done"}
              </Button>
              {errorCount > 0 && (
                <Button size="sm" variant="outline" onClick={retryFailed}>
                  Retry Failed
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/admin/documents")}
              >
                View Documents
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 1: FILE SELECTION ═══════════════ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>1. Select PDF Files</span>
            {items.length > 0 && (
              <span className="text-sm font-normal text-text-muted">
                {items.length} file{items.length !== 1 ? "s" : ""} selected •{" "}
                {formatFileSize(totalSize)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${
                isDragOver
                  ? "border-primary-500 bg-primary-50 scale-[1.01]"
                  : "border-border hover:border-primary-300 hover:bg-gray-50"
              }
              ${isUploading ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload
              className={`h-10 w-10 mx-auto mb-3 transition-colors ${
                isDragOver ? "text-primary-500" : "text-text-muted"
              }`}
            />
            <p className="text-sm font-medium text-text-main mb-1">
              {isDragOver
                ? "Drop PDF files here"
                : "Drag & drop PDFs here, or click to browse"}
            </p>
            <p className="text-xs text-text-muted">
              Only .pdf files • Max {MAX_FILE_SIZE_MB} MB per file •{" "}
              {TOTAL_BATCH_LIMIT_MB} MB total batch limit
            </p>
          </div>

          {/* File List with Warning for > 20 files */}
          {items.length > 20 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              Large batch ({items.length} files). Uploads will take longer.
            </div>
          )}

          {/* File List */}
          {items.length > 0 && (
            <div className="mt-4 space-y-2">
              {items.map((item, index) => {
                const itemErrors = getItemErrors(index);
                const itemWarnings = getItemWarnings(index);
                const isExpanded = expandedPanels.has(item.id);
                const complete = isMetadataComplete(item.metadata);
                const hasError = itemErrors.length > 0 || item.status === "error";

                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                      hasError
                        ? "border-red-300 bg-red-50/30"
                        : item.status === "done"
                          ? "border-green-300 bg-green-50/30"
                          : "border-border"
                    }`}
                  >
                    {/* File Header Row */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => togglePanel(item.id)}
                    >
                      {/* Sequence Number */}
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center">
                        {item.sequence}
                      </span>

                      {/* File Icon */}
                      <FileText className="h-5 w-5 text-primary-500 flex-shrink-0" />

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-main truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatFileSize(item.file.size)}
                          {item.error && (
                            <span className="text-red-600 ml-2">• {item.error}</span>
                          )}
                        </p>
                      </div>

                      {/* Completion Indicator */}
                      {complete && item.status === "pending" && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <StatusBadge status={item.status} />

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveFile(item.id, "up")}
                          disabled={index === 0 || isUploading}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5 text-text-muted" />
                        </button>
                        <button
                          onClick={() => moveFile(item.id, "down")}
                          disabled={index === items.length - 1 || isUploading}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5 text-text-muted" />
                        </button>
                        <button
                          onClick={() => removeFile(item.id)}
                          disabled={isUploading || item.status === "uploading"}
                          className="p-1 rounded hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>

                      {/* Chevron */}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-text-muted flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-text-muted flex-shrink-0" />
                      )}
                    </div>

                    {/* Expanded Metadata Form */}
                    {isExpanded && (
                      <FileMetadataForm
                        item={item}
                        index={index}
                        courses={courses}
                        semestersMap={semestersMap}
                        subjectsMap={subjectsMap}
                        errors={itemErrors}
                        warnings={itemWarnings}
                        disabled={isUploading || item.status === "done"}
                        onUpdateMetadata={(updates) => updateMetadata(item.id, updates)}
                        onFetchSemesters={fetchSemesters}
                        onFetchSubjects={fetchSubjects}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════ STEP 2: SHARED METADATA ═══════════════ */}
      {items.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>2. Shared Metadata</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyFromFirst}
                  disabled={items.length < 2 || isUploading}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy from #1
                </Button>
              </div>
            </CardTitle>
            <p className="text-xs text-text-muted mt-1">
              Set common fields here and apply to all files at once
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Course */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Course *</Label>
                <select
                  value={sharedMeta.course_id}
                  onChange={(e) =>
                    setSharedMeta({ ...sharedMeta, course_id: e.target.value, semester_id: "", subject_id: "" })
                  }
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                  disabled={isUploading}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.short_name} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Semester */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Semester *</Label>
                  <select
                    value={sharedMeta.semester_id}
                    onChange={(e) =>
                      setSharedMeta({ ...sharedMeta, semester_id: e.target.value, subject_id: "" })
                    }
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                    disabled={!sharedMeta.course_id || isUploading}
                  >
                    <option value="">Select semester</option>
                    {sharedSemesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Subject *</Label>
                  <select
                    value={sharedMeta.subject_id}
                    onChange={(e) =>
                      setSharedMeta({ ...sharedMeta, subject_id: e.target.value })
                    }
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                    disabled={!sharedMeta.semester_id || isUploading}
                  >
                    <option value="">Select subject</option>
                    {sharedSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Document Type *</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="shared_doc_type"
                      value="1"
                      checked={sharedMeta.document_type_id === "1"}
                      onChange={() =>
                        setSharedMeta({
                          ...sharedMeta,
                          document_type_id: "1",
                          exam_type_id: "",
                          year: "",
                        })
                      }
                      disabled={isUploading}
                    />
                    Syllabus
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="shared_doc_type"
                      value="2"
                      checked={sharedMeta.document_type_id === "2"}
                      onChange={() =>
                        setSharedMeta({ ...sharedMeta, document_type_id: "2" })
                      }
                      disabled={isUploading}
                    />
                    Question Paper
                  </label>
                </div>
              </div>

              {/* Year + Exam Type (for Question Paper) */}
              {sharedMeta.document_type_id === "2" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Year</Label>
                    <Input
                      type="number"
                      value={sharedMeta.year}
                      onChange={(e) =>
                        setSharedMeta({ ...sharedMeta, year: e.target.value })
                      }
                      placeholder="2024"
                      min="2000"
                      max="2100"
                      disabled={isUploading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Exam Type</Label>
                    <select
                      value={sharedMeta.exam_type_id}
                      onChange={(e) =>
                        setSharedMeta({ ...sharedMeta, exam_type_id: e.target.value })
                      }
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      disabled={isUploading}
                    >
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Status</Label>
                  <select
                    value={sharedMeta.status}
                    onChange={(e) =>
                      setSharedMeta({
                        ...sharedMeta,
                        status: e.target.value as BulkUploadMetadata["status"],
                      })
                    }
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                    disabled={isUploading}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Download</Label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={sharedMeta.is_downloadable}
                      onChange={(e) =>
                        setSharedMeta({
                          ...sharedMeta,
                          is_downloadable: e.target.checked,
                        })
                      }
                      disabled={isUploading}
                    />
                    Allow students to download
                  </label>
                </div>
              </div>

              {/* Apply to All Button */}
              <Button
                onClick={applySharedToAll}
                disabled={isUploading || !sharedMeta.course_id}
                className="w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply to All Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════ SUBMIT ═══════════════ */}
      {items.length > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl flex items-center justify-between gap-4">
            <div className="text-sm text-text-muted">
              {pendingCount > 0 && (
                <span>
                  {pendingCount} file{pendingCount !== 1 ? "s" : ""} ready to upload
                </span>
              )}
              {doneCount > 0 && (
                <span className="text-green-600 ml-3">
                  {doneCount} uploaded
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 ml-3">
                  {errorCount} failed
                </span>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={!isValid || isUploading}
              className="min-w-[200px]"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading {uploadProgress.current}/{uploadProgress.total}...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {pendingCount} File{pendingCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Per-File Metadata Form Component ───

interface FileMetadataFormProps {
  item: BulkUploadFileItem;
  index: number;
  courses: Course[];
  semestersMap: Record<string, Semester[]>;
  subjectsMap: Record<string, Subject[]>;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
  disabled: boolean;
  onUpdateMetadata: (updates: Partial<BulkUploadMetadata>) => void;
  onFetchSemesters: (courseId: string) => Promise<Semester[]>;
  onFetchSubjects: (semesterId: string) => Promise<Subject[]>;
}

function FileMetadataForm({
  item,
  index, // eslint-disable-line @typescript-eslint/no-unused-vars
  courses,
  semestersMap,
  subjectsMap,
  errors,
  warnings,
  disabled,
  onUpdateMetadata,
  onFetchSemesters,
  onFetchSubjects,
}: FileMetadataFormProps) {
  const meta = item.metadata;
  const semesters = semestersMap[meta.course_id] || [];
  const subjects = subjectsMap[meta.semester_id] || [];

  function getFieldError(field: string) {
    return errors.find((e) => e.field === field)?.message;
  }

  // Load semesters when course changes
  async function handleCourseChange(courseId: string) {
    onUpdateMetadata({ course_id: courseId, semester_id: "", subject_id: "" });
    if (courseId) {
      await onFetchSemesters(courseId);
    }
  }

  async function handleSemesterChange(semesterId: string) {
    onUpdateMetadata({ semester_id: semesterId, subject_id: "" });
    if (semesterId) {
      await onFetchSubjects(semesterId);
    }
  }

  const titleError = getFieldError("title");
  const courseError = getFieldError("course_id");
  const semesterError = getFieldError("semester_id");
  const subjectError = getFieldError("subject_id");
  const docTypeError = getFieldError("document_type_id");

  return (
    <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-gray-50/50 space-y-3 animate-fade-in">
      {/* Title */}
      <div className="space-y-1">
        <Label className="text-xs font-medium">
          Title *
          {meta.title.length > 0 && (
            <span className="text-text-muted ml-2">
              {meta.title.length}/120
            </span>
          )}
        </Label>
        <Input
          value={meta.title}
          onChange={(e) => onUpdateMetadata({ title: e.target.value })}
          placeholder="Document title"
          maxLength={120}
          disabled={disabled}
          className={titleError ? "border-red-400 focus:border-red-500" : ""}
        />
        {titleError && <p className="text-xs text-red-600">{titleError}</p>}
      </div>

      {/* Course → Semester → Subject */}
      <div className="space-y-1">
        <Label className="text-xs font-medium">Course *</Label>
        <select
          value={meta.course_id}
          onChange={(e) => handleCourseChange(e.target.value)}
          className={`w-full border rounded-md px-3 py-2 text-sm bg-white ${
            courseError ? "border-red-400" : "border-border"
          }`}
          disabled={disabled}
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.short_name} — {c.name}
            </option>
          ))}
        </select>
        {courseError && <p className="text-xs text-red-600">{courseError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Semester *</Label>
          <select
            value={meta.semester_id}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white ${
              semesterError ? "border-red-400" : "border-border"
            }`}
            disabled={!meta.course_id || disabled}
          >
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {semesterError && <p className="text-xs text-red-600">{semesterError}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Subject *</Label>
          <select
            value={meta.subject_id}
            onChange={(e) => onUpdateMetadata({ subject_id: e.target.value })}
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white ${
              subjectError ? "border-red-400" : "border-border"
            }`}
            disabled={!meta.semester_id || disabled}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {subjectError && <p className="text-xs text-red-600">{subjectError}</p>}
        </div>
      </div>

      {/* Document Type */}
      <div className="space-y-1">
        <Label className="text-xs font-medium">Document Type *</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={`doc_type_${item.id}`}
              value="1"
              checked={meta.document_type_id === "1"}
              onChange={() =>
                onUpdateMetadata({
                  document_type_id: "1",
                  exam_type_id: "",
                  year: "",
                })
              }
              disabled={disabled}
            />
            Syllabus
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name={`doc_type_${item.id}`}
              value="2"
              checked={meta.document_type_id === "2"}
              onChange={() => onUpdateMetadata({ document_type_id: "2" })}
              disabled={disabled}
            />
            Question Paper
          </label>
        </div>
        {docTypeError && <p className="text-xs text-red-600">{docTypeError}</p>}
      </div>

      {/* Year + Exam Type (for Question Paper) */}
      {meta.document_type_id === "2" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Year</Label>
            <Input
              type="number"
              value={meta.year}
              onChange={(e) => onUpdateMetadata({ year: e.target.value })}
              placeholder="2024"
              min="2000"
              max="2100"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Exam Type</Label>
            <select
              value={meta.exam_type_id}
              onChange={(e) => onUpdateMetadata({ exam_type_id: e.target.value })}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
              disabled={disabled}
            >
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Status</Label>
          <select
            value={meta.status}
            onChange={(e) =>
              onUpdateMetadata({
                status: e.target.value as BulkUploadMetadata["status"],
              })
            }
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
            disabled={disabled}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Download</Label>
          <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={meta.is_downloadable}
              onChange={(e) =>
                onUpdateMetadata({ is_downloadable: e.target.checked })
              }
              disabled={disabled}
            />
            Allow download
          </label>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <div>
            {warnings.map((w, i) => (
              <p key={i}>{w.message}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
