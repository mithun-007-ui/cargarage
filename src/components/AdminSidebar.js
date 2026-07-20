'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import {
  LayoutDashboard, LogOut, Wrench, AlertTriangle,
  ClipboardList, Bell, Settings, Users,
} from 'lucide-react';
import { getEmergencyRequests, getUnreadNotificationsCount } from 'src/lib/mockDb';

/* ── 6 core nav items ── */
const NAV_ITEMS = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/emergencies',  label: 'Emergencies',  icon: AlertTriangle,  badge: 'emergency' },
  { href: '/admin/bookings',     label: 'Bookings',     icon: ClipboardList },
  { href: '/admin/customers',    label: 'Customers',    icon: Users },
  { href: '/admin/notifications',label: 'Notifications',icon: Bell,           badge: 'notifications' },
  { href: '/admin/settings',     label: 'Settings',     icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const load = () => {
      const reqs = getEmergencyRequests();
      setEmergencyCount(reqs.filter(r => !['Completed', 'Cancelled'].includes(r.status)).length);
      setNotifCount(getUnreadNotificationsCount('admin@gmail.com'));
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href) =>
    pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));

  const getBadgeCount = (badge) => {
    if (badge === 'emergency') return emergencyCount;
    if (badge === 'notifications') return notifCount;
    return 0;
  };

  return (
    /*
     * fixed + hidden on mobile (mobile uses the drawer in layout.js)
     * nav area: flex-1 overflow-y-auto  →  scrolls if many items are added
     * logo + logout: shrink-0           →  always visible, never pushed off screen
     */
    <aside
      className="fixed top-0 left-0 bottom-0 w-56 flex-col z-40 hidden md:flex"
      style={{ background: '#2B211C', borderRight: '1px solid #5A463A' }}
    >
      {/* ── Logo (pinned top) ── */}
      <div
        className="shrink-0 h-14 px-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #5A463A' }}
      >
        <div className="p-1.5 rounded-lg shrink-0" style={{ background: '#D96C2F' }}>
          <Wrench size={14} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-[11px] uppercase tracking-wider leading-none" style={{ color: '#FFF7ED' }}>Bug Slayers</p>
          <p className="text-[9px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: '#F28C45' }}>Admin Portal</p>
        </div>
      </div>

      {/* ── Scrollable nav (grows to fill, scrolls if overflow) ── */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-2 space-y-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#5A463A transparent' }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          const count = badge ? getBadgeCount(badge) : 0;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-150 group"
              style={active
                ? { background: '#D96C2F', color: '#FFF7ED' }
                : { color: '#9A8070' }
              }
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span
                  className="shrink-0 min-w-[20px] h-5 px-1 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                  style={{ background: active ? 'rgba(255,255,255,0.3)' : '#B02020' }}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout (pinned bottom) ── */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid #5A463A' }}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[12px] font-bold text-red-400 hover:text-red-300 transition-all cursor-pointer text-left focus:outline-none"
          style={{ background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,30,30,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
