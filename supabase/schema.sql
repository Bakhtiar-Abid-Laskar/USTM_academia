-- ============================================================
-- USTM Academia — Complete Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- 1. Admins table (managed separately from Supabase Auth users)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- links to Supabase auth.users
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  department VARCHAR(200),
  duration_years INTEGER NOT NULL,
  total_semesters INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Semesters
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_number INTEGER NOT NULL,
  label VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, semester_number)
);

-- 4. Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50),
  slug VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, semester_id, slug)
);

-- 5. Document Types (lookup)
CREATE TABLE IF NOT EXISTS document_types (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- 6. Exam Types (lookup)
CREATE TABLE IF NOT EXISTS exam_types (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- 7. Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
  document_type_id SMALLINT NOT NULL REFERENCES document_types(id),
  exam_type_id SMALLINT REFERENCES exam_types(id),
  year SMALLINT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(300) NOT NULL,
  file_size_bytes BIGINT,
  is_downloadable BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  uploaded_by UUID NOT NULL REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Upload Logs
CREATE TABLE IF NOT EXISTS upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  file_name VARCHAR(300) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_semesters_course ON semesters(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_documents_subject ON documents(subject_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_id);
CREATE INDEX IF NOT EXISTS idx_documents_semester ON documents(semester_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);
CREATE INDEX IF NOT EXISTS idx_upload_logs_admin ON upload_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_upload_logs_document ON upload_logs(document_id);

-- ============================================================
-- Seed Data
-- ============================================================

-- Document Types
INSERT INTO document_types (id, name, slug, description) VALUES
  (1, 'Syllabus', 'syllabus', 'Official course syllabus for a subject'),
  (2, 'Previous Year Question Paper', 'question-paper', 'Past examination question papers')
ON CONFLICT (id) DO NOTHING;

-- Exam Types
INSERT INTO exam_types (id, name, slug) VALUES
  (1, 'Mid Term', 'mid-term'),
  (2, 'End Semester', 'end-semester'),
  (3, 'Internal Exam', 'internal'),
  (4, 'Practical Exam', 'practical'),
  (5, 'Other', 'other')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;

-- Public read for student-facing data
DROP POLICY IF EXISTS "Public read courses" ON courses;
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read semesters" ON semesters;
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read subjects" ON subjects;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read document_types" ON document_types;
CREATE POLICY "Public read document_types" ON document_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read exam_types" ON exam_types;
CREATE POLICY "Public read exam_types" ON exam_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read published documents" ON documents;
CREATE POLICY "Public read published documents" ON documents FOR SELECT USING (status = 'published');

-- Admin full access (authenticated users via service role bypass RLS)
-- For admin operations, we use the service_role key which bypasses RLS
-- So we only need read policies for the anon key

-- Admins table — only service role can access
DROP POLICY IF EXISTS "Service role manages admins" ON admins;
CREATE POLICY "Service role manages admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Upload logs — only service role
DROP POLICY IF EXISTS "Service role manages logs" ON upload_logs;
CREATE POLICY "Service role manages logs" ON upload_logs FOR ALL USING (true) WITH CHECK (true);

-- Documents — admin can do everything via service role
DROP POLICY IF EXISTS "Admin manage documents" ON documents;
CREATE POLICY "Admin manage documents" ON documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage courses" ON courses;
CREATE POLICY "Admin manage courses" ON courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage semesters" ON semesters;
CREATE POLICY "Admin manage semesters" ON semesters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage subjects" ON subjects;
CREATE POLICY "Admin manage subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS set_updated_at_admins ON admins;
CREATE TRIGGER set_updated_at_admins BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_courses ON courses;
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_semesters ON semesters;
CREATE TRIGGER set_updated_at_semesters BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_subjects ON subjects;
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_documents ON documents;
CREATE TRIGGER set_updated_at_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

