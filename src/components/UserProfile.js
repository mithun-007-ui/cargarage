'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from 'src/context/AuthContext';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const dashboardUrl = user.role === 'Admin' ? '/admin/dashboard' : '/';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full transition-all duration-200 focus:outline-none border border-slate-200 hover:scale-[1.02] cursor-pointer"
        id="user-profile-menu-button"
      >
        <div
          className="w-7 h-7 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm"
          style={{ background: '#E65313' }}
        >
          {user.role === 'Admin' ? 'A' : 'U'}
        </div>
        <span className="text-sm font-semibold pr-1" style={{ color: '#202020' }}>{user.role}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#667085' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 border border-slate-100 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
          </div>
          
          {user.role === 'Admin' && (
            <Link
              href={dashboardUrl}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full cursor-pointer"
            >
              <LayoutDashboard size={16} className="text-primary-600" />
              <span>Dashboard</span>
            </Link>
          )}
          
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer border-t border-slate-50"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
