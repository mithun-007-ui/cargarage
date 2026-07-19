'use client';

import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import AdminSidebar from 'src/components/AdminSidebar';
import { Wrench, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Verifying Admin Permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white w-full h-14 px-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="bg-accent-500 text-white p-1 rounded-lg">
            <Wrench size={14} />
          </div>
          <span className="font-extrabold text-xs tracking-wider uppercase">AutoCare Admin</span>
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
        <div className="md:hidden fixed inset-0 bg-slate-900/95 z-25 flex flex-col pt-14">
          <div className="p-4 space-y-1">
            <Link
              href="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm font-bold"
            >
              <LayoutDashboard size={18} className="text-primary-400" />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="p-4 border-t border-slate-800 mt-auto">
            <button
              onClick={() => { setIsMobileMenuOpen(false); logout(); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all font-bold"
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
