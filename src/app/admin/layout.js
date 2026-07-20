'use client';

import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import AdminSidebar from 'src/components/AdminSidebar';
import { Wrench, Menu, X, LayoutDashboard, LogOut, AlertTriangle, ClipboardList, Bell, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* Same 6 items mirrored for the mobile drawer */
const MOBILE_NAV = [
  { href: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/emergencies',   label: 'Emergencies',   icon: AlertTriangle },
  { href: '/admin/bookings',      label: 'Bookings',      icon: ClipboardList },
  { href: '/admin/customers',     label: 'Customers',     icon: Users },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings',      label: 'Settings',      icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#1F1A17' }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-4"
          style={{ borderColor: '#D96C2F', borderTopColor: 'transparent' }} />
        <p className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#9A8070' }}>
          Verifying Admin Permissions…
        </p>
      </div>
    );
  }

  const close = () => setMobileOpen(false);
  const isActive = (href) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Desktop fixed sidebar */}
      <AdminSidebar />

      {/* ── Mobile top bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center justify-between"
        style={{ background: '#2B211C', borderBottom: '1px solid #5A463A' }}
      >
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={close}>
          <div className="p-1 rounded-lg" style={{ background: '#D96C2F' }}>
            <Wrench size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-xs tracking-wider uppercase" style={{ color: '#FFF7ED' }}>
            Bug Slayers Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#D8C8B8' }}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col pt-14"
          style={{ background: 'rgba(27,22,19,0.98)' }}
        >
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={active
                    ? { background: '#D96C2F', color: '#FFF7ED' }
                    : { color: '#D8C8B8' }
                  }
                >
                  <Icon size={18} className="shrink-0"
                    style={{ color: active ? '#FFF7ED' : '#F28C45' }} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="shrink-0 p-4" style={{ borderTop: '1px solid #5A463A' }}>
            <button
              onClick={() => { close(); logout(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 font-bold transition-all cursor-pointer"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,30,30,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      {/*  md:ml-56 → pushed right of the 224px fixed sidebar on desktop
          pt-14    → clears the mobile top bar height                        */}
      <div className="md:ml-56 pt-14 md:pt-0 min-h-screen flex flex-col">
        {/* Desktop topbar strip */}
        <header className="hidden md:flex items-center justify-between h-14 bg-white border-b border-slate-100 px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500">Workshop Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
              style={{ background: '#D96C2F' }}>
              A
            </div>
            <span className="text-xs font-bold text-slate-700">Administrator</span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
