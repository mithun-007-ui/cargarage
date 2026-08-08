'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function getSessionAndProfile() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (mounted) {
        setUser({
          ...session.user,
          name: profile?.full_name || session.user.email,
          role: profile?.role || 'customer',
          phone: profile?.phone,
          active: profile?.active !== false
        });
        setLoading(false);
      }
    }

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (mounted) {
          setUser({
            ...session.user,
            name: profile?.full_name || session.user.email,
            role: profile?.role || 'customer',
            phone: profile?.phone,
            active: profile?.active !== false
          });
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Protect routes based on role and login state
  useEffect(() => {
    if (loading) return;

    const isAdminRoute = pathname.startsWith('/admin');
    const isLoginRoute = pathname.startsWith('/login');
    
    if (isAdminRoute) {
      if (!user) {
        // Redirect to login if not logged in
        router.push('/login?redirect=' + encodeURIComponent(pathname));
      } else if (user.role !== 'admin') {
        // Redirect non-admins to home page
        router.push('/');
      }
    } else if (user && user.role === 'admin' && !isLoginRoute) {
      router.push('/admin/dashboard');
    }
  }, [user, loading, pathname, router]);

  const login = async (email, password) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }

    // Fetch the profile so we know the role immediately — don't wait for
    // onAuthStateChange, which fires asynchronously and can lose the race.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'customer';

    // ── DEBUG (remove after confirming fix) ──────────────────────────────────
    console.log('🔍 Login debug:', {
      userId: data.user.id,
      email: data.user.email,
      profileRow: profile,       // full row — is this null? does role exist?
      resolvedRole: role,        // what role we ended up with
    });
    // ────────────────────────────────────────────────────────────────────────

    // Honour a ?redirect= deep-link (e.g. someone bookmarked /admin/bookings
    // and was sent to login). Read it from the URL at the moment of login.
    // Using window.location here is safe: login() is always called by a user
    // interaction (button click), never during SSR.
    const params = new URLSearchParams(window.location.search);
    const pendingRedirect = params.get('redirect');
    const destination =
      pendingRedirect ||
      (role === 'admin' ? '/admin/dashboard' : '/');

    // Perform the redirect here, inside login(), so we don't race the
    // onAuthStateChange listener that updates `user` state.
    router.push(destination);

    // Still return the result so the login page can handle errors cleanly.
    return { success: true, role, redirect: destination };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
