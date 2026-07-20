'use client';

import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import AdminSidebar from 'src/components/AdminSidebar';
import { Wrench, Menu, X, LayoutDashboard, LogOut, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ background: '#1F1A17' }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: '#D96C2F', borderTopColor: 'transparent' }}></div>
        <p className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#9A8070' }}>Verifying Admin Permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#f8fafc' }}>
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Top Bar */}
      <div className="md:hidden text-white w-full h-14 px-4 flex items-center justify-between sticky top-0 z-30"
        style={{ background: '#2B211C', borderBottom: '1px solid #5A463A' }}>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="text-white p-1 rounded-lg" style={{ background: '#D96C2F' }}>
            <Wrench size={14} />
          </div>
          <span className="font-extrabold text-xs tracking-wider uppercase" style={{ color: '#FFF7ED' }}>Bug Slayers Admin</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-25 flex flex-col pt-14" style={{ background: 'rgba(31,26,23,0.97)' }}>
          <div className="p-4 space-y-1">
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ color: '#D8C8B8' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,108,47,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LayoutDashboard size={18} style={{ color: '#F28C45' }} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/emergencies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ color: '#D8C8B8' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,108,47,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <AlertTriangle size={18} style={{ color: '#f87171' }} />
              <span>Emergencies</span>
            </Link>
          </div>
          <div className="p-4 mt-auto" style={{ borderTop: '1px solid #5A463A' }}>
            <button
              onClick={() => { setIsMobileMenuOpen(false); logout(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 font-bold transition-all"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,30,30,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="hidden md:flex items-center justify-between h-14 bg-white border-b border-slate-100 px-6 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-500">Workshop Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="text-xs font-bold text-slate-700">Administrator</span>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
