'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { LayoutDashboard, LogOut, Wrench, AlertTriangle } from 'lucide-react';
import { getEmergencyRequests } from 'src/lib/mockDb';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [emergencyCount, setEmergencyCount] = useState(0);

  useEffect(() => {
    const load = () => {
      const reqs = getEmergencyRequests();
      setEmergencyCount(reqs.filter(r => !['Completed', 'Cancelled'].includes(r.status)).length);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href) => pathname.startsWith(href);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/emergencies', label: 'Emergencies', icon: AlertTriangle, badge: emergencyCount },
  ];

  return (
    <aside className="w-56 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-20"
      style={{ background: '#2B211C', borderRight: '1px solid #5A463A' }}>
      <div>
        {/* Brand */}
        <div className="h-16 px-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #5A463A' }}>
          <div className="text-white p-1.5 rounded-lg" style={{ background: '#D96C2F' }}>
            <Wrench size={15} />
          </div>
          <div>
            <h1 className="font-extrabold text-xs uppercase tracking-wider leading-none" style={{ color: '#FFF7ED' }}>Bug Slayers</h1>
            <p className="text-[10px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: '#F28C45' }}>Admin Portal</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
              style={isActive(href)
                ? { background: '#D96C2F', color: '#FFF7ED' }
                : { color: '#9A8070' }}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                  style={{ background: isActive(href) ? 'rgba(255,255,255,0.3)' : '#B02020' }}>
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: '1px solid #5A463A' }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer text-left focus:outline-none"
          style={{ background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,30,30,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
