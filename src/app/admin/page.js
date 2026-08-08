/**
 * app/admin/page.js
 *
 * The root /admin route. Redirects to /admin/dashboard.
 * Auth + role protection is handled by:
 *   1. AuthContext.js — client-side guard (redirects non-admins immediately)
 *   2. admin/layout.js — renders a loading spinner until role is confirmed
 *
 * This page adds a server-side layer: if somehow a user lands here on the
 * server before the client guard fires, they are redirected at the edge.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AdminIndexPage() {
  const supabase = await createClient();

  // Verify the user is logged in and is an admin on the server side
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in — send to login
    redirect('/login?redirect=/admin/dashboard');
  }

  // Check role in the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Logged in but not an admin — send to home
    redirect('/');
  }

  // Admin confirmed — redirect to the dashboard
  redirect('/admin/dashboard');
}
