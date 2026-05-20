import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const courseSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters").max(200),
  short_name: z.string().min(2, "Short name is required").max(50),
  slug: z.string().min(2, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  department: z.string().max(200).optional().or(z.literal("")),
  department_id: z.string().uuid().optional(),
  duration_years: z.coerce.number().int().min(1).max(10),
  total_semesters: z.coerce.number().int().min(1).max(20),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export const semesterSchema = z.object({
  course_id: z.string().uuid("Please select a course"),
  department_id: z.string().uuid().optional(),
  semester_number: z.coerce.number().int().min(1, "Semester number must be at least 1").max(20),
  label: z.string().min(2, "Label is required").max(100),
});

export const subjectSchema = z.object({
  course_id: z.string().uuid("Please select a course"),
  semester_id: z.string().uuid("Please select a semester"),
  department_id: z.string().uuid().optional().or(z.literal("")).or(z.null()),
  name: z.string().min(2, "Subject name is required").max(255),
  subject_code: z.string().max(50).optional().or(z.literal("")).or(z.null()),
  slug: z.string().min(2, "Slug is required").max(150).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
});

export const documentUploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(300),
  course_id: z.string().uuid("Please select a course"),
  semester_id: z.string().uuid("Please select a semester"),
  subject_id: z.string().uuid("Please select a subject"),
  document_type_id: z.coerce.number().int().min(1, "Please select a document type"),
  exam_type_id: z.coerce.number().int().optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  is_downloadable: z.boolean().default(true),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(6, "Current password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Please confirm your new password"),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─── Bulk Upload Validation ───────────────────────────────────

const currentYear = new Date().getFullYear();

export const bulkUploadItemSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters")
    .transform((s) => s.trim()),
  course_id: z.string().uuid("Please select a course"),
  semester_id: z.string().uuid("Please select a semester"),
  subject_id: z.string().uuid("Please select a subject"),
  document_type_id: z.coerce.number().int().min(1, "Please select a document type"),
  exam_type_id: z.coerce.number().int().optional(),
  year: z.coerce.number().int().min(2000).max(currentYear + 1).optional(),
  is_downloadable: z.boolean().default(true),
  status: z.enum(["published", "draft", "archived"]).default("published"),
});

export type BulkUploadItemInput = z.infer<typeof bulkUploadItemSchema>;

export interface BulkValidationError {
  fileIndex: number;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface BulkValidationResult {
  valid: boolean;
  errors: BulkValidationError[];
  warnings: BulkValidationError[];
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50");
const TOTAL_BATCH_LIMIT_MB = 500;

export function validateBulkBatch(
  files: File[],
  metadataArray: Record<string, any>[]
): BulkValidationResult {
  const errors: BulkValidationError[] = [];
  const warnings: BulkValidationError[] = [];

  // Batch must have at least 1 file
  if (files.length === 0) {
    errors.push({ fileIndex: -1, field: "files", message: "At least 1 file is required", severity: "error" });
    return { valid: false, errors, warnings };
  }

  // Warn if > 20 files
  if (files.length > 20) {
    warnings.push({
      fileIndex: -1,
      field: "files",
      message: `Large batch: ${files.length} files. This may take a while.`,
      severity: "warning",
    });
  }

  let totalSize = 0;
  const fileNames = new Map<string, number[]>();
  const titles = new Map<string, number[]>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const meta = metadataArray[i];

    // ─── File-level checks ───
    if (file.type !== "application/pdf") {
      errors.push({ fileIndex: i, field: "file", message: "File must be a PDF (application/pdf)", severity: "error" });
    }

    if (file.size === 0) {
      errors.push({ fileIndex: i, field: "file", message: "File is empty (0 bytes)", severity: "error" });
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      errors.push({
        fileIndex: i,
        field: "file",
        message: `File exceeds ${MAX_FILE_SIZE_MB} MB limit`,
        severity: "error",
      });
    }

    totalSize += file.size;

    // Track duplicate filenames (case-insensitive)
    const lowerName = file.name.toLowerCase();
    if (!fileNames.has(lowerName)) fileNames.set(lowerName, []);
    fileNames.get(lowerName)!.push(i);

    // ─── Metadata-level checks ───
    if (meta) {
      const result = bulkUploadItemSchema.safeParse(meta);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            fileIndex: i,
            field: issue.path.join(".") || "metadata",
            message: issue.message,
            severity: "error",
          });
        }
      }

      // Track duplicate titles
      if (meta.title) {
        const lowerTitle = meta.title.trim().toLowerCase();
        if (!titles.has(lowerTitle)) titles.set(lowerTitle, []);
        titles.get(lowerTitle)!.push(i);
      }
    } else {
      errors.push({ fileIndex: i, field: "metadata", message: "Missing metadata", severity: "error" });
    }
  }

  // ─── Batch-level checks ───

  // Duplicate filenames
  fileNames.forEach((indices, name) => {
    if (indices.length > 1) {
      indices.forEach((idx) => {
        errors.push({
          fileIndex: idx,
          field: "file",
          message: `Duplicate filename: "${name}"`,
          severity: "error",
        });
      });
    }
  });

  // Duplicate titles (warn, not block)
  titles.forEach((indices, title) => {
    if (indices.length > 1) {
      indices.forEach((idx) => {
        warnings.push({
          fileIndex: idx,
          field: "title",
          message: `Duplicate title: "${title}"`,
          severity: "warning",
        });
      });
    }
  });

  // Total batch size
  if (totalSize > TOTAL_BATCH_LIMIT_MB * 1024 * 1024) {
    errors.push({
      fileIndex: -1,
      field: "batch",
      message: `Total batch size (${(totalSize / 1024 / 1024).toFixed(1)} MB) exceeds ${TOTAL_BATCH_LIMIT_MB} MB limit`,
      severity: "error",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── UPDATE/PUT Validation Schemas ────────────────────────────

/**
 * ✅ Whitelist of allowed fields for updates
 * This prevents unauthorized field modifications (e.g., admin_id, created_at)
 */

export const documentUpdateSchema = z.object({
  id: z.string().uuid("Invalid document ID"),
  title: z.string().min(3).max(300).optional(),
  year: z.number().int().min(2000).max(currentYear + 1).optional(),
  is_downloadable: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  // ❌ NOT ALLOWED: admin_id, created_at, google_drive_file_id, file_url
}).strict(); // Reject any other fields

export const courseUpdateSchema = z.object({
  id: z.string().uuid("Invalid course ID"),
  name: z.string().min(3).max(200).optional(),
  short_name: z.string().min(2).max(50).optional(),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
  duration_years: z.number().int().min(1).max(10).optional(),
  total_semesters: z.number().int().min(1).max(20).optional(),
  // ❌ NOT ALLOWED: department_id (can't move between depts), slug (breaks URLs)
}).strict();

export const departmentUpdateSchema = z.object({
  id: z.string().uuid("Invalid department ID"),
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
  // ❌ NOT ALLOWED: code (breaks foreign keys)
}).strict();

export const subjectUpdateSchema = z.object({
  id: z.string().uuid("Invalid subject ID"),
  name: z.string().min(2).max(255).optional(),
  subject_code: z.string().max(50).optional(),
  // ❌ NOT ALLOWED: course_id, semester_id (can't move between courses)
}).strict();

export const semesterUpdateSchema = z.object({
  id: z.string().uuid("Invalid semester ID"),
  label: z.string().min(2).max(100).optional(),
  semester_number: z.number().int().min(1).max(20).optional(),
  // ❌ NOT ALLOWED: course_id (can't move between courses)
}).strict();

export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;
export type SubjectUpdateInput = z.infer<typeof subjectUpdateSchema>;
export type SemesterUpdateInput = z.infer<typeof semesterUpdateSchema>;
