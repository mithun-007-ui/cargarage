import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Client Supabase URL:', url); // Temporary debugging

  if (!url || !key || url.trim() === '' || key.trim() === '') {
    throw new Error('Supabase environment variables are missing or empty! Please check your .env.local file.');
  }

  return createBrowserClient(url, key)
}
