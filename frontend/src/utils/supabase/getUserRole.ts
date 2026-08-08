import { createClient } from 'src/utils/supabase/server';

/**
 * Server-side helper: returns the current user's role ('admin' | 'customer')
 * or null if not authenticated.
 *
 * Must only be called from Server Components, Server Actions, or Route Handlers.
 */
export async function getUserRole(): Promise<'admin' | 'customer' | null> {
  // createClient is async in this project (it awaits cookies())
  const supabase = await createClient();

  // Securely get the logged-in user (never trust the client session alone)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null; // Not authenticated
  }

  // Query only the role column for efficiency
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[getUserRole] Failed to fetch profile:', profileError?.message);
    return null;
  }

  return profile.role as 'admin' | 'customer';
}
