# 🗄️ USTM Academia — Database Migrations

## 📁 Migration Files Structure

This directory contains the database migration files for USTM Academia.

### Active Migrations

#### `001_complete_schema.sql` ⭐ (Main Migration)
**Consolidated Fresh Migration** combining all previous migrations into one comprehensive file.

**Includes:**
- ✅ All table schemas (admins, departments, courses, semesters, subjects, documents, etc.)
- ✅ All indexes for performance optimization
- ✅ Row Level Security (RLS) policies
- ✅ Trigger functions for `updated_at` columns
- ✅ Full-text search function
- ✅ Seed data (document types, exam types, default departments)

**What was consolidated:**
- `schema.sql` — Base schema with tables and RLS
- `migration_departments.sql` — Department system and relationships
- `migration_documents_description.sql` — Document descriptions
- `migration_google_drive.sql` — Google Drive integration

---

## 🚀 How to Use

### Option 1: First-Time Setup (Fresh Database)
If you're starting with a fresh database:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

2. **Run the migration**
   - Copy the entire contents of `001_complete_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

3. **Verify**
   - All tables should be created successfully
   - Check the "Tables" section in Supabase to confirm

### Option 2: Reset Existing Database
If you want to reset an existing database and start fresh:

1. **Delete existing tables** (⚠️ This will delete all data!)
   ```sql
   -- Uncomment the TRUNCATE commands at the end of 001_complete_schema.sql
   TRUNCATE upload_logs CASCADE;
   TRUNCATE documents CASCADE;
   TRUNCATE subjects CASCADE;
   TRUNCATE semesters CASCADE;
   TRUNCATE courses CASCADE;
   TRUNCATE departments CASCADE;
   TRUNCATE admins CASCADE;
   ```

2. **Run the migration**
   - Follow the steps in Option 1

---

## 🧹 Cleaning Up PDFs

### Delete All Uploaded PDFs

A cleanup script is provided to remove all PDFs from:
- ✅ Supabase Storage
- ✅ Google Drive
- ✅ Database Records
- ✅ Upload Logs

#### Prerequisites
```bash
# Install dependencies (if not already installed)
npm install @supabase/supabase-js googleapis dotenv
```

#### Run the Cleanup Script

```bash
# From project root
node cleanup-pdfs.js
```

#### What it does:
1. **Supabase Storage** — Deletes all PDF files from the `documents` bucket
2. **Database** — Removes all document records from the `documents` table
3. **Google Drive** — Deletes files from Google Drive using service account credentials
4. **Upload Logs** — Clears all upload history from `upload_logs` table

#### Output Example:
```
╔═══════════════════════════════════════════╗
║  USTM Academia — PDF Cleanup Script      ║
╚═══════════════════════════════════════════╝

⏰ Started at: 2026-05-20T10:30:00.000Z

📦 [SUPABASE] Fetching all files from storage...
📦 [SUPABASE] Found 15 file(s). Deleting...
✅ [SUPABASE] Deleted "syllabus-2024.pdf"
✅ [SUPABASE] Successfully deleted 15 file(s).

📊 [DATABASE] Deleting document records...
📊 [DATABASE] Found 15 document(s). Deleting...
✅ [DATABASE] Successfully deleted 15 document(s).

☁️  [GOOGLE DRIVE] Preparing to delete 12 file(s)...
✅ [GOOGLE DRIVE] Deleted file ID: 1a2b3c4d5e6f7g8h9i0j
✅ [GOOGLE DRIVE] Cleanup complete!

📋 [LOGS] Clearing upload logs...
✅ [LOGS] Upload logs cleared.

╔═══════════════════════════════════════════╗
║  ✅ Cleanup Complete!                    ║
╚═══════════════════════════════════════════╝

⏰ Completed at: 2026-05-20T10:30:15.000Z
```

---

## 📋 Migration History

### Previous Migrations (Now Consolidated)

These files have been consolidated into `001_complete_schema.sql`:

| File | Purpose | Status |
|------|---------|--------|
| `schema.sql` | Base schema | ✅ Consolidated |
| `migration_departments.sql` | Department system | ✅ Consolidated |
| `migration_documents_description.sql` | Document descriptions | ✅ Consolidated |
| `migration_google_drive.sql` | Google Drive fields | ✅ Consolidated |

**Consolidation Reason:** Single migration file is easier to version control and deploy.

---

## 🛡️ Database Schema Overview

### Tables

1. **admins** — Administrator users
   - Linked to Supabase Auth users
   - Role-based access control
   - Login tracking

2. **departments** — University departments
   - Computer Science, Engineering, Management, etc.
   - Linked to courses, semesters, subjects

3. **courses** — Degree programs
   - Engineering, B.Tech, B.Pharma, etc.
   - Duration and semester information

4. **semesters** — Course semesters
   - Semester 1-8 for each course
   - Active/inactive status

5. **subjects** — Course subjects
   - Associated with semester and course
   - Subject codes and slugs for URLs

6. **documents** — Question papers and syllabi
   - Linked to courses, subjects, exams
   - Google Drive integration
   - Download tracking

7. **document_types** — Lookup table
   - Syllabus, Question Paper, etc.

8. **exam_types** — Lookup table
   - Mid Term, End Semester, etc.

9. **upload_logs** — Audit trail
   - Tracks all document uploads/deletions
   - Admin actions and notes

### Key Features

- ✅ **Full Text Search** — Search documents by title and subject
- ✅ **Row Level Security** — Public students can only see published docs
- ✅ **Referential Integrity** — CASCADE deletes for consistency
- ✅ **Automatic Timestamps** — `created_at` and `updated_at` fields
- ✅ **Performance Indexes** — Optimized for common queries

---

## ⚠️ Important Notes

### Before Running Migration

1. **Backup Your Data** (if you have existing data)
   ```bash
   # Export current data from Supabase
   # (Use Supabase Dashboard > Data > Export)
   ```

2. **Test in Development First**
   - Always test migrations on a dev/staging database first
   - Only run on production after testing

### After Running Migration

1. **Verify Tables Created**
   - Check Supabase Dashboard > Tables
   - Verify all 9 tables exist

2. **Seed Data Loaded**
   - Document Types: 2 records
   - Exam Types: 5 records
   - Departments: 6 records

3. **Upload PDF Files**
   - Use the admin dashboard to upload documents
   - Or use the `/api/admin/upload` endpoint

---

## 🔧 Troubleshooting

### Issue: "Table already exists" error
**Solution:** The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: Permission denied errors
**Solution:** Ensure you're using the `service_role` key (not the public `anon` key) for admin operations.

### Issue: Google Drive cleanup fails
**Solution:** 
- Ensure `ustm-academia-e2efc54ed855.json` credentials file exists
- Check Google Drive API is enabled in Google Cloud Console
- Verify the service account has access to the files

### Issue: Supabase connection fails
**Solution:**
- Check `.env.local` file has correct Supabase credentials
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

---

## 📚 References

- [Supabase SQL Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📝 Migration Template

For adding new migrations in the future, use this naming convention:

```
002_add_new_feature.sql
003_update_existing_table.sql
```

Always:
- ✅ Use `IF NOT EXISTS` clauses for idempotency
- ✅ Include comprehensive comments
- ✅ Test in dev environment first
- ✅ Document what changed in this file

---

**Last Updated:** May 20, 2026  
**Migration Status:** ✅ Fresh & Consolidated  
**Ready for Production:** ✅ Yes
