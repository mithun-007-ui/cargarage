'use client';

/**
 * app/signup/page.tsx
 *
 * Sign-up page for Bug Slayers.
 * Includes Searchable Autocomplete State, District & Area selection with aligned 4-row 2-column grid.
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  MapPin,
  Building,
  Navigation,
} from 'lucide-react';
import SearchableSelect, { SelectOption } from '@/components/SearchableSelect';
import { getStates, getDistricts, getAreas } from '@/lib/supabaseDb';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  state?: string;
  district?: string;
  area?: string;
}

// ─── Input style helper ───────────────────────────────────────────────────────

function inputStyle(hasError: boolean, paddingRight = '0.75rem'): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    paddingLeft: '2.25rem',
    paddingRight,
    fontSize: '0.875rem', // 14px compact
    lineHeight: '1.4',
    color: '#202020',
    background: '#FFFFFF',
    border: `1px solid ${hasError ? '#EF4444' : '#E2D8CE'}`,
    borderRadius: '0.5rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    minHeight: '38px',
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

  // ── Location state ────────────────────────────────────────────────────────
  const [statesList, setStatesList]       = useState<SelectOption[]>([]);
  const [districtsList, setDistrictsList] = useState<SelectOption[]>([]);
  const [areasList, setAreasList]         = useState<SelectOption[]>([]);

  const [selectedState, setSelectedState]       = useState<SelectOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectOption | null>(null);
  const [selectedArea, setSelectedArea]         = useState<SelectOption | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]                           = useState<FormErrors>({});
  const [serverError, setServerError]                 = useState('');
  const [isSubmitting, setIsSubmitting]               = useState(false);

  // Load states on mount
  useEffect(() => {
    async function loadStatesData() {
      const list = await getStates();
      setStatesList(list);
    }
    loadStatesData();
  }, []);

  // Cascading behavior: State selection resets District & Area
  const handleStateChange = async (stateOpt: SelectOption | null) => {
    setSelectedState(stateOpt);
    setSelectedDistrict(null);
    setSelectedArea(null);
    setDistrictsList([]);
    setAreasList([]);

    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: undefined }));
    }

    if (stateOpt?.id) {
      const list = await getDistricts(stateOpt.id);
      setDistrictsList(list);
    }
  };

  // Cascading behavior: District selection resets Area
  const handleDistrictChange = async (distOpt: SelectOption | null) => {
    setSelectedDistrict(distOpt);
    setSelectedArea(null);
    setAreasList([]);

    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: undefined }));
    }

    if (distOpt?.id) {
      const list = await getAreas(distOpt.id);
      setAreasList(list);
    }
  };

  const handleAreaChange = (areaOpt: SelectOption | null) => {
    setSelectedArea(areaOpt);
    if (errors.area) {
      setErrors((prev) => ({ ...prev, area: undefined }));
    }
  };

  // ─── Client-side validation ───────────────────────────────────────────────

  const validate = (): boolean => {
    const temp: FormErrors = {};

    if (!fullName.trim()) {
      temp.fullName = 'Full name is required';
    }

    if (!email) {
      temp.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      temp.email = 'Email address is invalid';
    }

    const digitsOnly = phone.replace(/[\s\-+()]/g, '');
    if (!phone.trim()) {
      temp.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(digitsOnly)) {
      temp.phone = 'Valid phone number required';
    }

    if (!selectedState) {
      temp.state = 'State is required';
    }

    if (!selectedDistrict) {
      temp.district = 'District is required';
    }

    if (!selectedArea) {
      temp.area = 'Area is required';
    }

    if (!password) {
      temp.password = 'Password is required';
    } else if (password.length < 6) {
      temp.password = 'Min 6 characters required';
    }

    if (!confirmPassword) {
      temp.confirmPassword = 'Please confirm password';
    } else if (password !== confirmPassword) {
      temp.confirmPassword = 'Passwords do not match';
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // ─── Submit handler ───────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            state_id: selectedState?.id,
            district_id: selectedDistrict?.id,
            area_id: selectedArea?.id,
            state: selectedState?.name,
            district: selectedDistrict?.name,
            area: selectedArea?.name,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered') ||
            signUpError.message.toLowerCase().includes('user already exists')) {
          setServerError(
            'An account with this email already exists. Please log in instead.'
          );
        } else {
          setServerError(signUpError.message);
        }
        return;
      }

      const newUser = signUpData?.user;

      if (newUser) {
        const hasActiveSession = !!signUpData?.session;

        if (hasActiveSession) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              {
                id:          newUser.id,
                email:       newUser.email,
                full_name:   fullName.trim(),
                phone:       phone.trim(),
                state_id:    selectedState?.id,
                district_id: selectedDistrict?.id,
                area_id:     selectedArea?.id,
                state:       selectedState?.name,
                district:    selectedDistrict?.name,
                area:        selectedArea?.name,
                role:        'customer',
              },
              { onConflict: 'id' }
            );

          if (profileError) {
            console.error('[signup] Fallback profile upsert failed:', profileError.message);
          }
        }
      }

      router.push('/login?message=' + encodeURIComponent('Account created successfully! Please log in.'));

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E65313';
    e.target.style.boxShadow  = '0 0 0 3px rgba(230,83,19,0.1)';
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    e.target.style.borderColor = hasError ? '#EF4444' : '#E2D8CE';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-4 sm:px-6"
      style={{ background: '#F8F5F0' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-sm my-auto"
        style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}
      >
        {/* Header */}
        <div className="text-center px-6 pt-5 pb-3" style={{ borderBottom: '1px solid #F1E9DF' }}>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: '#202020' }}>
            Create your account
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: '#667085' }}>
            Join us for transparent, hassle-free car servicing.
          </p>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div
            className="mx-6 mt-3 rounded-xl p-2.5 flex items-start gap-2 text-xs"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>
              {serverError}{' '}
              {serverError.toLowerCase().includes('already exists') && (
                <Link href="/login" style={{ color: '#DC2626', fontWeight: 600, textDecoration: 'underline' }}>
                  Log in
                </Link>
              )}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-3" noValidate>

          {/* Row 1: Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#667085' }}
              >
                Full Name *
              </label>
              <div className="relative">
                <span
                  className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center pointer-events-none"
                  style={{ color: '#9CA3AF' }}
                >
                  <User size={14} />
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
                <p className="text-[11px] mt-1 text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#667085' }}
              >
                Email address *
              </label>
              <div className="relative">
                <span
                  className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center pointer-events-none"
                  style={{ color: '#9CA3AF' }}
                >
                  <Mail size={14} />
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
                <p className="text-[11px] mt-1 text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Row 2: Phone & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#667085' }}
              >
                Phone Number *
              </label>
              <div className="relative">
                <span
                  className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center pointer-events-none"
                  style={{ color: '#9CA3AF' }}
                >
                  <Phone size={14} />
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
                <p className="text-[11px] mt-1 text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Searchable State */}
            <SearchableSelect
              id="signup-state"
              label="State *"
              placeholder="Search state..."
              options={statesList}
              value={selectedState?.id || null}
              onChange={handleStateChange}
              disabled={isSubmitting}
              error={errors.state}
              icon={<MapPin size={14} />}
            />
          </div>

          {/* Row 3: District & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Searchable District */}
            <SearchableSelect
              id="signup-district"
              label="District *"
              placeholder={selectedState ? "Search district..." : "Select State first"}
              options={districtsList}
              value={selectedDistrict?.id || null}
              onChange={handleDistrictChange}
              disabled={isSubmitting || !selectedState}
              error={errors.district}
              icon={<Building size={14} />}
            />

            {/* Searchable Area (Locality in District) */}
            <SearchableSelect
              id="signup-area"
              label="Area / Locality *"
              placeholder={selectedDistrict ? "Search area..." : "Select District first"}
              options={areasList}
              value={selectedArea?.id || null}
              onChange={handleAreaChange}
              disabled={isSubmitting || !selectedDistrict}
              error={errors.area}
              icon={<Navigation size={14} />}
            />
          </div>

          {/* Row 4: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#667085' }}
              >
                Password *
              </label>
              <div className="relative">
                <span
                  className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center pointer-events-none"
                  style={{ color: '#9CA3AF' }}
                >
                  <Lock size={14} />
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
                    ...inputStyle(!!errors.password, '2.5rem'),
                    letterSpacing: showPassword ? 'normal' : '0.1em',
                  }}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e, !!errors.password)}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center transition-colors cursor-pointer"
                  style={{ color: '#9CA3AF' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] mt-1 text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#667085' }}
              >
                Confirm Password *
              </label>
              <div className="relative">
                <span
                  className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center pointer-events-none"
                  style={{ color: '#9CA3AF' }}
                >
                  <Lock size={14} />
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
                    ...inputStyle(!!errors.confirmPassword, '2.5rem'),
                    letterSpacing: showConfirmPassword ? 'normal' : '0.1em',
                  }}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e, !!errors.confirmPassword)}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center transition-colors cursor-pointer"
                  style={{ color: '#9CA3AF' }}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] mt-1 text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white transition-all duration-200 cursor-pointer"
              style={{
                background: '#E65313',
                minHeight: '42px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Link to login */}
          <p className="text-center text-xs pt-1" style={{ color: '#667085' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: '#E65313' }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

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
