const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabase = createClient('http://127.0.0.1:54321', 'eyJhbG...'); // Wait, the local Supabase is probably not up.
}
