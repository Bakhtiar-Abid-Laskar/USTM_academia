/* ──────────────────────────────────────────────
   Database row types – mirrors Supabase tables
   ────────────────────────────────────────────── */

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  department: string | null;
  duration_years: number;
  total_semesters: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  course_id: string;
  semester_number: number;
  label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  course?: Course;
}

export interface Subject {
  id: string;
  course_id: string;
  semester_id: string;
  name: string;
  subject_code: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  course?: Course;
  semester?: Semester;
}

export interface DocumentType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ExamType {
  id: number;
  name: string;
  slug: string;
}

export interface Document {
  id: string;
  title: string;
  subject_id: string;
  course_id: string;
  semester_id: string;
  document_type_id: number;
  exam_type_id: number | null;
  year: number | null;
  file_url: string | null;
  file_name: string;
  file_size_bytes: number | null;
  google_drive_file_id: string | null;
  google_drive_view_url: string | null;
  google_drive_preview_url: string | null;
  is_downloadable: boolean;
  status: "published" | "draft" | "archived";
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  // joined
  subject?: Subject;
  course?: Course;
  semester?: Semester;
  document_type?: DocumentType;
  exam_type?: ExamType;
}

export interface UploadLog {
  id: string;
  admin_id: string;
  document_id: string | null;
  action: "upload" | "update" | "delete" | "replace";
  file_name: string;
  notes: string | null;
  created_at: string;
  // joined
  admin?: Admin;
  document?: Document;
}

/* ─── Form Input Types ─── */

export interface CourseInput {
  name: string;
  short_name: string;
  slug: string;
  department?: string;
  duration_years: number;
  total_semesters: number;
  description?: string;
}

export interface SemesterInput {
  course_id: string;
  semester_number: number;
  label: string;
}

export interface SubjectInput {
  course_id: string;
  semester_id: string;
  name: string;
  subject_code?: string;
  slug: string;
}

export interface DocumentInput {
  title: string;
  subject_id: string;
  course_id: string;
  semester_id: string;
  document_type_id: number;
  exam_type_id?: number;
  year?: number;
  is_downloadable: boolean;
  status: "published" | "draft" | "archived";
}

/* ─── Dashboard Stats ─── */

export interface DashboardStats {
  totalCourses: number;
  totalSubjects: number;
  totalDocuments: number;
  documentsThisMonth: number;
}

/* ─── Bulk Upload Types ─── */

export interface BulkUploadMetadata {
  title: string;
  course_id: string;
  semester_id: string;
  subject_id: string;
  document_type_id: string;
  exam_type_id: string;
  year: string;
  is_downloadable: boolean;
  status: "published" | "draft" | "archived";
}

export interface BulkUploadFileItem {
  id: string;
  file: File;
  sequence: number;
  metadata: BulkUploadMetadata;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: {
    documentId: string;
    driveFileId: string;
    driveViewUrl: string;
  };
}

export interface BulkUploadResult {
  success: boolean;
  document?: Document;
  driveFileId?: string;
  driveViewUrl?: string;
  error?: string;
}
