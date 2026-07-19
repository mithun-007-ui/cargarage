'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Car,
  Wrench,
  Package,
  ClipboardCheck,
  CheckSquare,
  Clock,
  LogOut,
  Settings
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
    { name: 'Services', href: '/admin/services', icon: Wrench },
    { name: 'Service Packages', href: '/admin/packages', icon: Package },
    { name: 'Inspections & Reports', href: '/admin/inspections', icon: ClipboardCheck },
    { name: 'Repair Approvals', href: '/admin/approvals', icon: CheckSquare },
    { name: 'Slot Management', href: '/admin/slots', icon: Clock },
  ];

  const isActive = (href) => pathname === href;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-20">
      <div>
        {/* Brand Banner */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2.5">
          <div className="bg-accent-500 text-white p-1 rounded-lg">
            <Wrench size={16} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white uppercase tracking-wider leading-none">AutoCare Admin</h1>
            <p className="text-[10px] text-accent-500 font-semibold tracking-widest uppercase mt-0.5">Control Center</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-primary-800 text-white shadow-md shadow-primary-900/40 font-semibold'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all cursor-pointer text-left focus:outline-none"
        >
          <LogOut size={18} />
          <span>Logout Admin</span>
        </button>
      </div>
    </aside>
  );
}
