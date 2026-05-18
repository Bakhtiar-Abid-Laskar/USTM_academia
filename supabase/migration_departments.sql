-- ============================================================
-- USTM Academia — Schema Migration: Add Departments
-- Run AFTER schema.sql has been executed
-- ============================================================

-- 1. Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add department_id column to courses (nullable first for migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Add department_id to semesters for denormalized access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'semesters' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE semesters ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Add department_id to subjects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE subjects ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Add department_id to documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Migrate existing courses: create departments from the text "department" field
INSERT INTO departments (name, code)
SELECT DISTINCT
  department,
  LOWER(REGEXP_REPLACE(REGEXP_REPLACE(department, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
FROM courses
WHERE department IS NOT NULL AND department != ''
ON CONFLICT (code) DO NOTHING;

-- 7. Link existing courses to their department records
UPDATE courses c
SET department_id = d.id
FROM departments d
WHERE c.department = d.name
  AND c.department_id IS NULL;

-- 8. Propagate department_id to semesters
UPDATE semesters s
SET department_id = c.department_id
FROM courses c
WHERE s.course_id = c.id
  AND s.department_id IS NULL
  AND c.department_id IS NOT NULL;

-- 9. Propagate department_id to subjects
UPDATE subjects sub
SET department_id = c.department_id
FROM courses c
WHERE sub.course_id = c.id
  AND sub.department_id IS NULL
  AND c.department_id IS NOT NULL;

-- 10. Propagate department_id to documents
UPDATE documents doc
SET department_id = c.department_id
FROM courses c
WHERE doc.course_id = c.id
  AND doc.department_id IS NULL
  AND c.department_id IS NOT NULL;

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_semesters_department ON semesters(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_department ON documents(department_id);

-- 12. RLS for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON departments;
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage departments" ON departments;
CREATE POLICY "Admin manage departments" ON departments FOR ALL USING (true) WITH CHECK (true);

-- 13. Updated_at trigger for departments
DROP TRIGGER IF EXISTS set_updated_at_departments ON departments;
CREATE TRIGGER set_updated_at_departments
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed some default departments if table is empty
-- ============================================================
INSERT INTO departments (name, code, description) VALUES
  ('Department of Engineering and Technology', 'engineering-technology', 'Engineering and technology programs'),
  ('Department of Computer Science', 'computer-science', 'Computer science and IT programs'),
  ('Department of Management', 'management', 'Business and management programs'),
  ('Department of Pharmacy', 'pharmacy', 'Pharmaceutical sciences programs'),
  ('Department of Allied Health Sciences', 'allied-health', 'Health sciences programs'),
  ('Department of Applied Sciences', 'applied-sciences', 'Applied sciences programs')
ON CONFLICT (code) DO NOTHING;
