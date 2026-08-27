import { createClient } from '@supabase/supabase-js';

// The environment variables get injected securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ajjckhgkcxfobkxsevlb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqamNraGdrY3hmb2JreHNldmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzA2NjksImV4cCI6MjEwMzMwNjY2OX0.Kudi3ZBAzXcjGQSapbKaknLWWklcpmBJNHs_wGkRReY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please configure them in the environment settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
      return $1.toUpperCase().replace('-', '').replace('_', '');
    });
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
}

export function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
}
