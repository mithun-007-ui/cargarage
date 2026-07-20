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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8" style={{ background: '#F8F5F0' }}>
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 rounded-2xl shadow-sm" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}>
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4 sm:mb-6">
            <div className="text-white p-2 rounded-xl transition-transform duration-300 group-hover:rotate-12" style={{ background: '#E65313' }}>
              <Wrench size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight" style={{ color: '#202020' }}>
              Bug <span style={{ color: '#E65313' }}>Slayers</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#202020' }}>Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Access bookings, view vehicle health reports, and approve repairs.
          </p>
        </div>

        {/* Demo Credentials Help Box */}
        <div className="rounded-xl p-4 text-xs space-y-2" style={{ background: '#FFF3EE', border: '1px solid #FFD9C8' }}>
          <p className="font-bold flex items-center gap-1" style={{ color: '#E65313' }}>
            💡 Quick Demo Credentials
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="pb-2.5 sm:pb-0 border-b sm:border-b-0 sm:border-r pr-2" style={{ borderColor: '#FFD9C8' }}>
              <p className="font-semibold uppercase tracking-wider text-[9px] mb-0.5 text-gray-500">User Access</p>
              <p className="text-gray-700">Email: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>user@gmail.com</span></p>
              <p className="text-gray-700">Password: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>user123</span></p>
            </div>
            <div className="pt-2.5 sm:pt-0 sm:pl-1">
              <p className="font-semibold uppercase tracking-wider text-[9px] mb-0.5 text-gray-500">Admin Access</p>
              <p className="text-gray-700">Email: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>admin@gmail.com</span></p>
              <p className="text-gray-700">Password: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>admin123</span></p>
            </div>
          </div>
        </div>

        {/* General Error Message */}
        {errorMessage && (
          <div className="rounded-xl p-3 flex items-start gap-2 text-sm animate-shake" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-500">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
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
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider block mb-1.5 text-gray-500">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
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
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1 text-red-500">{errors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-lg text-white transition-all duration-200 shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 cursor-pointer"
              style={{ background: '#E65313' }}
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
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center"><div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }}></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
