'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { LayoutDashboard, LogOut, Wrench } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href) => pathname.startsWith(href);

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-20">
      <div>
        {/* Brand Banner */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-2.5">
          <div className="bg-accent-500 text-white p-1.5 rounded-lg">
            <Wrench size={15} />
          </div>
          <div>
            <h1 className="font-extrabold text-xs text-white uppercase tracking-wider leading-none">AutoCare</h1>
            <p className="text-[10px] text-accent-500 font-semibold tracking-widest uppercase mt-0.5">Admin Portal</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-3 py-4 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
              isActive('/admin/dashboard')
                ? 'bg-primary-600 text-white shadow-md shadow-primary-900/40'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all cursor-pointer text-left focus:outline-none"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
