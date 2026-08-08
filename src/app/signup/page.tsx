'use client';

/**
 * app/signup/page.tsx
 *
 * Sign-up page for Bug Slayers.
 * Matches the visual style of the login page (app/login/page.js) exactly.
 *
 * Flow:
 *  1. User fills in Full Name, Email, Phone, Password, Confirm Password.
 *  2. All fields are validated client-side before hitting the network.
 *  3. supabase.auth.signUp() creates the auth user AND passes full_name/phone
 *     in options.data (stored as raw_user_meta_data on the auth user).
 *     The DB trigger (handle_new_user) reads those fields and inserts the
 *     complete profiles row in one secure, SECURITY DEFINER operation.
 *  4. As a belt-and-suspenders fallback, IF supabase returns an active
 *     session immediately (i.e. "Confirm email" is OFF in Supabase Auth
 *     settings), we also upsert the profile from the client side. This
 *     covers any race condition between the trigger and this code.
 *     If there is NO session yet (email confirmation required), we skip the
 *     upsert — the trigger has already handled it with elevated permissions.
 *  5. Redirect to /login?message=... — the login page reads this query param
 *     and shows a green success banner.
 *
 * ⚠ RLS note: run fix_profiles_rls.sql in Supabase SQL Editor first.
 *   That script updates the trigger AND adds the correct RLS policies.
 */

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';  // same helper used everywhere
import {
  Wrench,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Tracks which fields currently have validation errors. */
interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Input style helper ───────────────────────────────────────────────────────

/**
 * Returns an inline style object for text inputs.
 * Matches the exact style used on the login page.
 *
 * @param hasError        - turns border red when true
 * @param paddingRight    - extra right padding for inputs that have an eye-icon button
 */
function inputStyle(hasError: boolean, paddingRight = '0.75rem'): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
    paddingLeft: '2.5rem',        // 40px — keeps text clear of the left icon
    paddingRight,
    fontSize: '1rem',             // 16px — prevents iOS Safari auto-zoom
    lineHeight: '1.5',
    color: '#202020',
    background: '#FFFFFF',
    border: `1px solid ${hasError ? '#EF4444' : '#E2D8CE'}`,
    borderRadius: '0.5rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    minHeight: '44px',            // accessible touch target
  };
}

// ─── SignUpContent ────────────────────────────────────────────────────────────

function SignUpContent() {
  const router = useRouter();

  // ── Form field state ──────────────────────────────────────────────────────
  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                           = useState<FormErrors>({});
  const [serverError, setServerError]                 = useState('');
  const [isSubmitting, setIsSubmitting]               = useState(false);

  // ─── Client-side validation ───────────────────────────────────────────────

  /**
   * Runs every field through its rule. Populates `errors` state and
   * returns true only when there are zero errors.
   */
  const validate = (): boolean => {
    const temp: FormErrors = {};

    // Full name — must not be blank
    if (!fullName.trim()) {
      temp.fullName = 'Full name is required';
    }

    // Email — required + basic format check
    if (!email) {
      temp.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      temp.email = 'Email address is invalid';
    }

    // Phone — required, strip formatting chars, then check 7–15 digits
    const digitsOnly = phone.replace(/[\s\-+()]/g, '');
    if (!phone.trim()) {
      temp.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(digitsOnly)) {
      temp.phone = 'Enter a valid phone number (7–15 digits)';
    }

    // Password — required + minimum length
    if (!password) {
      temp.password = 'Password is required';
    } else if (password.length < 6) {
      temp.password = 'Password must be at least 6 characters';
    }

    // Confirm password — required + must match
    if (!confirmPassword) {
      temp.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      // This is the inline mismatch error the user requested
      temp.confirmPassword = 'Passwords do not match';
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // ─── Submit handler ───────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Step 1 — client-side validation gate
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Step 2 — Create the Supabase auth user.
      // `options.data` is written to auth.users.raw_user_meta_data.
      // If your DB trigger reads raw_user_meta_data it can pick these up
      // directly — see the "Should you update the trigger?" note below.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (signUpError) {
        // "User already registered" is the most common error — give a friendly message
        if (signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('user already exists')) {
          setServerError(
            'An account with this email already exists. Please log in instead.'
          );
        } else {
          setServerError(signUpError.message);
        }
        return; // finally block re-enables the button
      }

      const newUser = signUpData?.user;

      if (newUser) {
        // Step 3 — Belt-and-suspenders profile upsert.
        //
        // PRIMARY path: the DB trigger (handle_new_user) runs SECURITY DEFINER
        // and writes full_name + phone directly from raw_user_meta_data. It
        // doesn't need a client-side session and bypasses RLS entirely.
        //
        // FALLBACK path: if supabase returned an active session (i.e. Supabase
        // Auth has "Confirm email" turned OFF), we also upsert from the client.
        // This handles any race condition where our code runs before the trigger.
        //
        // WHY we check for a session first:
        // If "Confirm email" is ON, signUpData.session is null — the user hasn't
        // verified yet so they have no JWT. Without a JWT the anon role is used,
        // which has no INSERT/UPDATE permission on profiles → RLS violation.
        // In that case the trigger is the only writer, so we skip the upsert.
        const hasActiveSession = !!signUpData?.session;

        if (hasActiveSession) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              {
                id:        newUser.id,
                email:     newUser.email,
                full_name: fullName.trim(),
                phone:     phone.trim(),
                role:      'customer', // always start as customer
              },
              { onConflict: 'id' }
            );

          if (profileError) {
            // Still non-fatal — the trigger already wrote the row.
            // Log it so you can debug if full_name/phone are missing.
            console.error('[signup] Fallback profile upsert failed:', profileError.message);
          }
        }
        // If !hasActiveSession: trigger wrote the profile — nothing to do here.
      }

      // Step 4 — Go to login. The login page reads ?message= and shows a
      // green success banner (see login/page.js lines 102-108).
      router.push('/login?message=' + encodeURIComponent('Account created! Please log in.'));

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setServerError(msg);
    } finally {
      // Always re-enable submit, whether we succeeded or failed
      setIsSubmitting(false);
    }
  };

  // ─── Focus / blur helpers ─────────────────────────────────────────────────

  /** Orange highlight ring on focus — same as login page */
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E65313';
    e.target.style.boxShadow  = '0 0 0 3px rgba(230,83,19,0.1)';
  };

  /** Reverts border to error-red or default on blur */
  const onBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    e.target.style.borderColor = hasError ? '#EF4444' : '#E2D8CE';
    e.target.style.boxShadow   = 'none';
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6"
      style={{ background: '#F8F5F0' }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-sm"
        style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}
      >

        {/* ── Header ── */}
        <div className="text-center px-6 pt-8 pb-5" style={{ borderBottom: '1px solid #F1E9DF' }}>
          {/* Logo — identical to login page */}
          <Link href="/" className="inline-flex items-center gap-2 group mb-5">
            <div
              className="text-white p-2 rounded-xl transition-transform duration-300 group-hover:rotate-12"
              style={{ background: '#E65313' }}
            >
              <Wrench size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#202020' }}>
              Bug <span style={{ color: '#E65313' }}>Slayers</span>
            </span>
          </Link>

          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#202020' }}>
            Create your account
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: '#667085' }}>
            Join Bug Slayers for transparent, hassle-free car servicing.
          </p>
        </div>

        {/* ── Server error banner ── */}
        {serverError && (
          <div
            className="mx-6 mt-4 rounded-xl p-3 flex items-start gap-2 text-sm"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              {serverError}{' '}
              {/* If email already exists, offer a quick link to /login */}
              {serverError.toLowerCase().includes('already exists') && (
                <Link href="/login" style={{ color: '#DC2626', fontWeight: 600, textDecoration: 'underline' }}>
                  Log in
                </Link>
              )}
            </span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-8 space-y-4" noValidate>

          {/* ── 1. Full Name ── */}
          <div>
            <label
              htmlFor="full-name"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#667085' }}
            >
              Full Name
            </label>
            <div className="relative">
              <span
                className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none"
                style={{ color: '#9CA3AF' }}
              >
                <User size={15} />
              </span>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                disabled={isSubmitting}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                style={inputStyle(!!errors.fullName)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.fullName)}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.fullName}</p>
            )}
          </div>

          {/* ── 2. Email ── */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#667085' }}
            >
              Email address
            </label>
            <div className="relative">
              <span
                className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none"
                style={{ color: '#9CA3AF' }}
              >
                <Mail size={15} />
              </span>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle(!!errors.email)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.email)}
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.email}</p>
            )}
          </div>

          {/* ── 3. Phone Number ── */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#667085' }}
            >
              Phone Number
            </label>
            <div className="relative">
              <span
                className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none"
                style={{ color: '#9CA3AF' }}
              >
                <Phone size={15} />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                disabled={isSubmitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                style={inputStyle(!!errors.phone)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.phone)}
              />
            </div>
            {errors.phone && (
              <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.phone}</p>
            )}
          </div>

          {/* ── 4. Password ── */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#667085' }}
            >
              Password
            </label>
            <div className="relative">
              <span
                className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none"
                style={{ color: '#9CA3AF' }}
              >
                <Lock size={15} />
              </span>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...inputStyle(!!errors.password, '2.75rem'), // 44px — clears eye icon
                  letterSpacing: showPassword ? 'normal' : '0.1em',
                }}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.password)}
              />
              {/* Eye toggle — identical to login page */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{errors.password}</p>
            )}
          </div>

          {/* ── 5. Confirm Password ── */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#667085' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <span
                className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-none"
                style={{ color: '#9CA3AF' }}
              >
                <Lock size={15} />
              </span>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...inputStyle(!!errors.confirmPassword, '2.75rem'),
                  letterSpacing: showConfirmPassword ? 'normal' : '0.1em',
                }}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.confirmPassword)}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Inline mismatch error — shown immediately after validation */}
            {errors.confirmPassword && (
              <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* ── Submit button ── */}
          <div className="pt-2">
            <button
              id="signup-submit-btn"
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
                  {/* Spinning loader — identical to login page */}
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* ── Link to login ── */}
          <p className="text-center text-sm pt-2" style={{ color: '#667085' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: '#E65313' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C44510')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#E65313')}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

/**
 * Wrapping in <Suspense> is required by Next.js App Router whenever a
 * client component uses useRouter() or useSearchParams() — matches the
 * pattern on the login page.
 */
export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: '#F8F5F0' }}
        >
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#E65313', borderTopColor: 'transparent' }}
          />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
