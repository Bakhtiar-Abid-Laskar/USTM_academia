-- ============================================================
-- USTM Academia — Complete Database Schema (Fresh Migration)
-- Consolidates all previous migrations into one comprehensive file
-- Date: May 20, 2026
-- ============================================================

-- ============================================================
-- 1. ADMINS TABLE
-- ============================================================
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

-- ============================================================
-- 2. DEPARTMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. COURSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  department VARCHAR(200), -- Legacy column (being deprecated)
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE, -- New column
  duration_years INTEGER NOT NULL,
  total_semesters INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. SEMESTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  semester_number INTEGER NOT NULL,
  label VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, semester_number)
);

-- ============================================================
-- 5. SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50),
  slug VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, semester_id, slug)
);

-- ============================================================
-- 6. DOCUMENT TYPES TABLE (Lookup)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_types (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- ============================================================
-- 7. EXAM TYPES TABLE (Lookup)
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_types (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- 8. DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  document_type_id SMALLINT NOT NULL REFERENCES document_types(id),
  exam_type_id SMALLINT REFERENCES exam_types(id),
  year SMALLINT,
  file_url TEXT,
  file_name VARCHAR(300) NOT NULL,
  file_size_bytes BIGINT,
  google_drive_file_id VARCHAR(255),
  google_drive_view_url TEXT,
  google_drive_preview_url TEXT,
  description TEXT,
  is_downloadable BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  uploaded_by UUID NOT NULL REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. UPLOAD LOGS TABLE
-- ============================================================
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
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Department indexes
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- Course indexes
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);

-- Semester indexes
CREATE INDEX IF NOT EXISTS idx_semesters_course ON semesters(course_id);
CREATE INDEX IF NOT EXISTS idx_semesters_department ON semesters(department_id);
CREATE INDEX IF NOT EXISTS idx_semesters_course_number ON semesters(course_id, semester_number);
CREATE INDEX IF NOT EXISTS idx_semesters_active ON semesters(is_active);

-- Subject indexes
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_course_semester ON subjects(course_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_subject ON documents(subject_id);
CREATE INDEX IF NOT EXISTS idx_documents_course ON documents(course_id);
CREATE INDEX IF NOT EXISTS idx_documents_semester ON documents(semester_id);
CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_documents_status_course ON documents(status, course_id);
CREATE INDEX IF NOT EXISTS idx_documents_status_semester ON documents(status, semester_id);
CREATE INDEX IF NOT EXISTS idx_documents_status_subject ON documents(status, subject_id);

-- Upload logs indexes
CREATE INDEX IF NOT EXISTS idx_upload_logs_admin ON upload_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_upload_logs_document ON upload_logs(document_id);

-- ============================================================
-- SEED DATA
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

-- Default Departments
INSERT INTO departments (name, code, description) VALUES
  ('Department of Engineering and Technology', 'engineering-technology', 'Engineering and technology programs'),
  ('Department of Computer Science', 'computer-science', 'Computer science and IT programs'),
  ('Department of Management', 'management', 'Business and management programs'),
  ('Department of Pharmacy', 'pharmacy', 'Pharmaceutical sciences programs'),
  ('Department of Allied Health Sciences', 'allied-health', 'Health sciences programs'),
  ('Department of Applied Sciences', 'applied-sciences', 'Applied sciences programs')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies (student-facing data)
DROP POLICY IF EXISTS "Public read admins" ON admins;
DROP POLICY IF EXISTS "Public read departments" ON departments;
DROP POLICY IF EXISTS "Public read courses" ON courses;
DROP POLICY IF EXISTS "Public read semesters" ON semesters;
DROP POLICY IF EXISTS "Public read subjects" ON subjects;
DROP POLICY IF EXISTS "Public read document_types" ON document_types;
DROP POLICY IF EXISTS "Public read exam_types" ON exam_types;
DROP POLICY IF EXISTS "Public read published documents" ON documents;
DROP POLICY IF EXISTS "Public read upload_logs" ON upload_logs;

CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read semesters" ON semesters FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read document_types" ON document_types FOR SELECT USING (true);
CREATE POLICY "Public read exam_types" ON exam_types FOR SELECT USING (true);
CREATE POLICY "Public read published documents" ON documents FOR SELECT USING (status = 'published');

-- Note: No policies for 'admins' and 'upload_logs' - completely locked down
-- Access only via backend service_role client

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
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

DROP TRIGGER IF EXISTS set_updated_at_departments ON departments;
CREATE TRIGGER set_updated_at_departments BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_courses ON courses;
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_semesters ON semesters;
CREATE TRIGGER set_updated_at_semesters BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_subjects ON subjects;
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_documents ON documents;
CREATE TRIGGER set_updated_at_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FULL TEXT SEARCH FUNCTION
-- ============================================================
DROP FUNCTION IF EXISTS search_documents(text);
CREATE OR REPLACE FUNCTION search_documents(search_query text)
RETURNS SETOF documents AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM documents d
  LEFT JOIN subjects s ON d.subject_id = s.id
  WHERE 
    d.status = 'published'
    AND (
      -- Full text search across title and subject name
      to_tsvector('english', d.title || ' ' || COALESCE(s.name, '')) @@ websearch_to_tsquery('english', search_query)
      -- Fallback to ILIKE for partial matches
      OR d.title ILIKE '%' || search_query || '%'
      OR s.name ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    -- Rank exact FTS matches higher
    ts_rank(to_tsvector('english', d.title || ' ' || COALESCE(s.name, '')), websearch_to_tsquery('english', search_query)) DESC,
    d.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- CLEANUP: Reset data (optional - comment out if not needed)
-- This is useful for resetting to a clean state
-- ============================================================
-- TRUNCATE upload_logs CASCADE;
-- TRUNCATE documents CASCADE;
-- TRUNCATE subjects CASCADE;
-- TRUNCATE semesters CASCADE;
-- TRUNCATE courses CASCADE;
-- TRUNCATE departments CASCADE;
-- TRUNCATE admins CASCADE;
