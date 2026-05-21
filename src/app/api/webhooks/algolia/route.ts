import { NextResponse } from 'next/server';
import algoliasearch from 'algoliasearch';
import { createClient } from '@supabase/supabase-js';

// Initialize Algolia
const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'APP_ID',
  process.env.ALGOLIA_ADMIN_KEY || 'ADMIN_KEY'
);
const index = client.initIndex('documents_index');

// Initialize Supabase Admin to fetch relations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Helper to fetch documents with relationships and sync to Algolia
 */
async function syncDocumentsToAlgolia(documentIds: string[]) {
  if (documentIds.length === 0) return;
  
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
    .in('id', documentIds)
    .eq('status', 'published');

  if (error || !docData) {
    console.error('Supabase fetch error:', error);
    return;
  }

  const objects = docData.map((data: any) => ({
    objectID: data.id,
    title: data.title,
    year: data.year,
    file_url: data.file_url,
    status: 'published',
    subject: (() => {
      const s = Array.isArray(data.subjects) ? data.subjects[0] : data.subjects;
      return s ? { name: s.name, code: s.subject_code, subject_code: s.subject_code } : null;
    })(),
    course: Array.isArray(data.courses) ? data.courses[0] : data.courses,
    department: Array.isArray(data.departments) ? data.departments[0]?.name : data.departments?.name,
    semester: Array.isArray(data.semesters) ? data.semesters[0]?.semester_number : data.semesters?.semester_number,
    document_type: Array.isArray(data.document_types) ? data.document_types[0]?.name : data.document_types?.name,
    exam_type: Array.isArray(data.exam_types) ? data.exam_types[0]?.name : data.exam_types?.name,
    timestamp: new Date(data.created_at).getTime(),
  }));

  if (objects.length > 0) {
    await index.saveObjects(objects);
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Secret (Security) against any of the 3 secrets
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const validSecrets = [
      process.env.SUPABASE_WEBHOOK_SECRET1,
      process.env.SUPABASE_WEBHOOK_SECRET2,
      process.env.SUPABASE_WEBHOOK_SECRET3
    ].filter(Boolean); // Filter out undefined/empty ones
    
    // Only verify if at least one secret is configured
    if (validSecrets.length > 0 && (!token || !validSecrets.includes(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    // --- DOCUMENTS WEBHOOK ---
    if (table === 'documents') {
      // Handle Deletion or Unpublishing
      if (type === 'DELETE' || (type === 'UPDATE' && record.status !== 'published')) {
        const idToDelete = type === 'DELETE' ? old_record.id : record.id;
        await index.deleteObject(idToDelete);
        return NextResponse.json({ message: 'Deleted document from Algolia' });
      }

      // Handle Creation/Update
      if ((type === 'INSERT' || type === 'UPDATE') && record.status === 'published') {
        await syncDocumentsToAlgolia([record.id]);
        return NextResponse.json({ message: 'Upserted document to Algolia' });
      }
    } 
    // --- SUBJECTS WEBHOOK ---
    else if (table === 'subjects') {
      // When a subject name changes, re-index all related published documents
      if (type === 'UPDATE') {
        const { data } = await supabase
          .from('documents')
          .select('id')
          .eq('subject_id', record.id)
          .eq('status', 'published');
          
        const documentIds = data?.map(d => d.id) || [];
        await syncDocumentsToAlgolia(documentIds);
        return NextResponse.json({ message: `Updated ${documentIds.length} related documents for subject` });
      }
    }
    // --- COURSES WEBHOOK ---
    else if (table === 'courses') {
      // When a course name changes, re-index all related published documents
      if (type === 'UPDATE') {
        const { data } = await supabase
          .from('documents')
          .select('id')
          .eq('course_id', record.id)
          .eq('status', 'published');
          
        const documentIds = data?.map(d => d.id) || [];
        await syncDocumentsToAlgolia(documentIds);
        return NextResponse.json({ message: `Updated ${documentIds.length} related documents for course` });
      }
    }

    return NextResponse.json({ message: 'Ignored (No relevant action taken)' });
  } catch (error) {
    console.error('Algolia Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
