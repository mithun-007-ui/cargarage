'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('autocare_user');
      setTimeout(() => {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('autocare_user');
          }
        }
        setLoading(false);
      }, 0);
    }
  }, []);

  // Protect routes based on role and login state
  useEffect(() => {
    if (loading) return;

    const isAdminRoute = pathname.startsWith('/admin');
    const isLoginRoute = pathname.startsWith('/login');
    
    if (isAdminRoute) {
      if (!user) {
        // Redirect to login if not logged in
        router.push('/login?redirect=' + encodeURIComponent(pathname));
      } else if (user.role !== 'Admin') {
        // Redirect non-admins to home page
        router.push('/');
      }
    } else if (user && user.role === 'Admin' && !isLoginRoute) {
      router.push('/admin/dashboard');
    }
  }, [user, loading, pathname, router]);

  const login = async (email, password) => {
    setLoading(true);
    // Mimic API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === 'user@gmail.com' && password === 'user123') {
      const loggedUser = { email, name: 'User', role: 'User' };
      setUser(loggedUser);
      localStorage.setItem('autocare_user', JSON.stringify(loggedUser));
      setLoading(false);
      return { success: true, role: 'User', redirect: '/' };
    } else if (email === 'admin@gmail.com' && password === 'admin123') {
      const loggedUser = { email, name: 'Admin', role: 'Admin' };
      setUser(loggedUser);
      localStorage.setItem('autocare_user', JSON.stringify(loggedUser));
      setLoading(false);
      return { success: true, role: 'Admin', redirect: '/admin/dashboard' };
    } else {
      setLoading(false);
      return { success: false, message: 'Invalid credentials. Please use user@gmail.com (user123) or admin@gmail.com (admin123)' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autocare_user');
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
