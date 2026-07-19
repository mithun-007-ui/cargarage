'use client';

import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import AdminSidebar from 'src/components/AdminSidebar';
import { Menu, X, Wrench, LayoutDashboard, CalendarDays, Users, Car, ClipboardCheck, CheckSquare, Clock, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If loading or user isn't Admin, display loading spinner/guard
  if (loading || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Verifying Admin Permissions...</p>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
    { name: 'Services', href: '/admin/services', icon: Wrench },
    { name: 'Service Packages', href: '/admin/packages', icon: Wrench },
    { name: 'Inspections & Reports', href: '/admin/inspections', icon: ClipboardCheck },
    { name: 'Repair Approvals', href: '/admin/approvals', icon: CheckSquare },
    { name: 'Slot Management', href: '/admin/slots', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar (visible on md+) */}
      <AdminSidebar />

      {/* Mobile Top Navigation (visible on mobile/tablet) */}
      <div className="md:hidden bg-slate-900 text-white w-full h-16 px-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="bg-accent-500 text-white p-1 rounded-lg">
            <Wrench size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-wider uppercase">AutoCare Admin</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/90 z-25 flex flex-col pt-16">
          <div className="p-4 space-y-1 overflow-y-auto grow">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-base font-semibold"
                >
                  <Icon size={20} className="text-slate-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all font-semibold"
            >
              <LogOut size={20} />
              <span>Logout Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top-bar with user info (optional, helps keep consistent navbar styles) */}
        <header className="hidden md:flex items-center justify-between h-16 bg-white border-b border-slate-100 px-8 shrink-0 z-10">
          <div>
            <h2 className="text-sm font-semibold text-slate-500">Welcome back, Admin</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-primary-800 flex items-center justify-center font-bold border border-slate-200">
              A
            </div>
            <span className="text-sm font-semibold text-slate-700">Administrator</span>
          </div>
        </header>

        {/* Dynamic page children content */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
