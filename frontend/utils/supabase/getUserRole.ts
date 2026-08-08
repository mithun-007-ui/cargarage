import { createClient } from './server';

export async function getUserRole() {
  const supabase = await createClient();
  
  // 1. Get the current user session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null; // Not authenticated
  }

  // 2. Fetch the user's role from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user role:', profileError);
    return null;
  }

  return profile.role as 'admin' | 'customer';
}
