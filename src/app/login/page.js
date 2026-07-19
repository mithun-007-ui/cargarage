'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from 'src/context/AuthContext';
import { Wrench, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

function LoginContent() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || (user.role === 'Admin' ? '/admin/dashboard' : '/');
      router.push(redirect);
    }
  }, [user, router, searchParams]);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email address is invalid';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Successful login, context useEffect will handle redirect
        router.push(res.redirect);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="bg-accent-500 text-white p-2 rounded-xl transition-transform duration-300 group-hover:rotate-12">
              <Wrench size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">
              AutoCare <span className="text-accent-500">Pro</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Access bookings, view vehicle health reports, and approve repairs.
          </p>
        </div>

        {/* Demo Credentials Help Box */}
        <div className="bg-primary-50/50 border border-primary-100/80 rounded-xl p-4 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-primary-800 flex items-center gap-1">
            💡 Quick Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="border-r border-primary-100/80 pr-2">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-[9px] mb-0.5">User Access</p>
              <p>Email: <span className="font-mono font-semibold text-slate-800">user@gmail.com</span></p>
              <p>Password: <span className="font-mono font-semibold text-slate-800">user123</span></p>
            </div>
            <div className="pl-1">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-[9px] mb-0.5">Admin Access</p>
              <p>Email: <span className="font-mono font-semibold text-slate-800">admin@gmail.com</span></p>
              <p>Password: <span className="font-mono font-semibold text-slate-800">admin123</span></p>
            </div>
          </div>
        </div>

        {/* General Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-sm text-red-700 animate-shake">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 block w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all ${
                    errors.email ? 'border-red-300 ring-2 ring-red-500/10' : 'border-slate-200'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 block w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all ${
                    errors.password ? 'border-red-300 ring-2 ring-red-500/10' : 'border-slate-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg shadow-primary-600/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-primary-600 disabled:scale-100 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
