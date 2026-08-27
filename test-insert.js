import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfkqcbwsvlyytizfkvia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlma3FjYndzdmx5eXRpemZrdmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NzQ2ODEsImV4cCI6MjA5NzM1MDY4MX0.AsCUZU2tK5l7eSZUPMozZZobPgZmIkNH2_mKvk4M96o';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('media').insert({ title: 'Test Movie', slug: 'test-movie', type: 'movie' });
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
