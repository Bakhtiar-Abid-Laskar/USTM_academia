-- Migration: Add Google Drive fields to documents table
ALTER TABLE documents 
ADD COLUMN google_drive_file_id VARCHAR(255),
ADD COLUMN google_drive_view_url TEXT,
ADD COLUMN google_drive_preview_url TEXT;

-- Drop NOT NULL constraint on file_url since new documents use Google Drive
ALTER TABLE documents ALTER COLUMN file_url DROP NOT NULL;
