import { createClient } from '@supabase/supabase-js';
import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_KEY) {
  console.error("❌ ERROR: Algolia API keys are missing in .env.local!");
  console.error("Please add NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY.");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: Supabase API keys are missing in .env.local!");
  process.exit(1);
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex('documents_index');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncAllDocuments() {
  console.log("🚀 Starting bulk sync from Supabase to Algolia...");
  
  // Fetch all published documents
  const { data: docData, error } = await supabase
    .from('documents')
    .select(`
      id, title, year, file_url, created_at,
      subjects ( name, subject_code ),
      courses ( name, short_name ),
      departments ( name ),
      semesters ( semester_number ),
      document_types ( name ),
      exam_types ( name )
    `)
    .eq('status', 'published');

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    process.exit(1);
  }

  if (!docData || docData.length === 0) {
    console.log("⚠️ No published documents found in the database.");
    process.exit(0);
  }

  console.log(`📦 Found ${docData.length} published documents. Formatting data...`);

  const objects = docData.map((data) => ({
    objectID: data.id,
    title: data.title,
    year: data.year,
    file_url: data.file_url,
    status: 'published',
    subject: Array.isArray(data.subjects) ? data.subjects[0] : data.subjects,
    course: Array.isArray(data.courses) ? data.courses[0] : data.courses,
    department: Array.isArray(data.departments) ? data.departments[0]?.name : data.departments?.name,
    semester: Array.isArray(data.semesters) ? data.semesters[0]?.semester_number : data.semesters?.semester_number,
    document_type: Array.isArray(data.document_types) ? data.document_types[0]?.name : data.document_types?.name,
    exam_type: Array.isArray(data.exam_types) ? data.exam_types[0]?.name : data.exam_types?.name,
    timestamp: new Date(data.created_at).getTime(),
  }));

  try {
    console.log("☁️ Sending to Algolia...");
    const response = await index.saveObjects(objects);
    console.log(`✅ Success! Synced ${response.objectIDs.length} documents to Algolia index 'documents_index'.`);
  } catch (err) {
    console.error("❌ Algolia sync failed:", err);
  }
}

syncAllDocuments();
