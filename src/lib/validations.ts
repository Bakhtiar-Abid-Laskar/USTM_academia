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
