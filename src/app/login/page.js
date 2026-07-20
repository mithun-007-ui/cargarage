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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6" style={{ background: '#F8F5F0' }}>
      <div className="w-full max-w-md rounded-2xl shadow-sm" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}>

        {/* ── Header ── */}
        <div className="text-center px-6 pt-8 pb-5" style={{ borderBottom: '1px solid #F1E9DF' }}>
          <Link href="/" className="inline-flex items-center gap-2 group mb-5">
            <div className="text-white p-2 rounded-xl transition-transform duration-300 group-hover:rotate-12" style={{ background: '#E65313' }}>
              <Wrench size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#202020' }}>
              Bug <span style={{ color: '#E65313' }}>Slayers</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#202020' }}>Sign in to your account</h2>
          <p className="mt-1.5 text-sm" style={{ color: '#667085' }}>
            Access bookings, vehicle health reports and repairs.
          </p>
        </div>

        {/* ── Demo Credentials ── */}
        <div className="mx-6 mt-5 rounded-xl p-4 text-xs" style={{ background: '#FFF3EE', border: '1px solid #FFD9C8' }}>
          <p className="font-bold mb-3 flex items-center gap-1.5" style={{ color: '#E65313' }}>
            💡 Quick Demo Credentials
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-[11.5px] leading-relaxed">
            <div>
              <p className="font-bold uppercase tracking-wider text-[9px] mb-1" style={{ color: '#9CA3AF' }}>User Access</p>
              <p style={{ color: '#374151' }}>Email: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>user@gmail.com</span></p>
              <p style={{ color: '#374151' }}>Password: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>user123</span></p>
            </div>
            <div className="pt-3 sm:pt-0" style={{ borderTop: '1px solid #FFD9C8' }}>
              <p className="font-bold uppercase tracking-wider text-[9px] mb-1 sm:hidden" style={{ color: '#9CA3AF' }}>Admin Access</p>
              <p className="font-bold uppercase tracking-wider text-[9px] mb-1 hidden sm:block" style={{ color: '#9CA3AF' }}>Admin Access</p>
              <p style={{ color: '#374151' }}>Email: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>admin@gmail.com</span></p>
              <p style={{ color: '#374151' }}>Password: <span className="font-mono font-semibold" style={{ color: '#E65313' }}>admin123</span></p>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {errorMessage && (
          <div className="mx-6 mt-4 rounded-xl p-3 flex items-start gap-2 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-8 space-y-4">

          {/* Email */}
          <div>
            <label htmlFor="email-address" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#667085' }}>
              Email address
            </label>
            <div className="relative">
              {/* Left icon — absolutely positioned, does NOT affect input width */}
              <span className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none" style={{ color: '#9CA3AF' }}>
                <Mail size={15} />
              </span>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  display: 'block',
                  width: '100%',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  paddingLeft: '2.5rem',   /* 40px — clear of the icon */
                  paddingRight: '0.75rem',
                  fontSize: '1rem',        /* 16px prevents iOS auto-zoom */
                  lineHeight: '1.5',
                  color: '#202020',
                  background: '#FFFFFF',
                  border: `1px solid ${errors.email ? '#EF4444' : '#E2D8CE'}`,
                  borderRadius: '0.5rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '44px',
                }}
                onFocus={e => { e.target.style.borderColor = '#E65313'; e.target.style.boxShadow = '0 0 0 3px rgba(230,83,19,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.email ? '#EF4444' : '#E2D8CE'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            {errors.email && <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#667085' }}>
              Password
            </label>
            <div className="relative">
              <span className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none" style={{ color: '#9CA3AF' }}>
                <Lock size={15} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  display: 'block',
                  width: '100%',
                  paddingTop: '0.625rem',
                  paddingBottom: '0.625rem',
                  paddingLeft: '2.5rem',
                  paddingRight: '2.75rem',  /* 44px — clear of the eye icon */
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  color: '#202020',
                  background: '#FFFFFF',
                  border: `1px solid ${errors.password ? '#EF4444' : '#E2D8CE'}`,
                  borderRadius: '0.5rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '44px',
                  letterSpacing: showPassword ? 'normal' : '0.1em',
                }}
                onFocus={e => { e.target.style.borderColor = '#E65313'; e.target.style.boxShadow = '0 0 0 3px rgba(230,83,19,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.password ? '#EF4444' : '#E2D8CE'; e.target.style.boxShadow = 'none'; }}
              />
              {/* Eye toggle */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.password}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-white transition-all duration-200 cursor-pointer"
              style={{
                background: '#E65313',
                minHeight: '48px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F5F0' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
