'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import UserProfile from './UserProfile';
import { Wrench, Menu, X, Bell } from 'lucide-react';
import { getUnreadNotificationsCount } from 'src/lib/mockDb';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setUnreadCount(getUnreadNotificationsCount(user.email));
      // Refresh count every 15s
      const interval = setInterval(() => {
        setUnreadCount(getUnreadNotificationsCount(user.email));
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Packages', href: '/packages' },
    { name: 'Book Service', href: '/vehicle-selection' },
    { name: 'My Bookings', href: '/my-bookings' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      <nav className="bg-primary-800 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo & Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
                <div className="bg-primary-600 text-white p-2 rounded-xl transition-all duration-300 group-hover:rotate-12 shadow-md shadow-primary-600/30">
                  <Wrench size={18} />
                </div>
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center">
                  Bug&nbsp;<span className="text-primary-500 font-extrabold bg-none text-transparent bg-clip-border">Slayers</span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:bg-slate-800/80 ${
                    isActive(item.href)
                      ? 'text-white bg-primary-600 shadow-sm border border-primary-500/35'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side: Profile / Auth button */}
            <div className="hidden md:flex items-center gap-4">
              {user && unreadCount > 0 && (
                <Link href="/my-bookings?tab=notifications" className="relative p-1 text-slate-300 hover:text-white transition-colors">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                </Link>
              )}
              {user ? (
                <UserProfile />
              ) : (
                <Link
                  href="/login"
                  className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-primary-600/20 border border-primary-500 flex items-center gap-1.5 cursor-pointer"
                  id="navbar-login-button"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              {user && unreadCount > 0 && (
                <Link href="/my-bookings?tab=notifications" className="relative p-1 mr-3 text-slate-300 hover:text-white transition-colors">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X size={22} fill="none" /> : <Menu size={22} fill="none" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-850 animate-in slide-in-from-top-4 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-4 border-t border-slate-850 px-4">
              {user ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.role === 'Admin' ? 'A' : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{user.role} Dashboard</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{user.email}</div>
                    </div>
                  </div>
                  <UserProfile />
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-center block text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer border border-primary-500"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Sticky Mobile "Book Service" CTA bar at the bottom (except on booking/login/admin/estimator pages to prevent overlapping forms) */}
      {pathname !== '/booking' && pathname !== '/vehicle-selection' && !pathname.startsWith('/admin') && pathname !== '/login' && pathname !== '/estimator' && pathname !== '/booking-confirmation' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 shadow-lg flex items-center justify-between animate-in">
          <div className="text-left">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Bug Slayers Garage</p>
            <p className="text-xs font-bold text-white">Need Premium Service?</p>
          </div>
          <Link href="/vehicle-selection" className="bg-primary-600 hover:bg-primary-700 active:scale-[0.97] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-600/25 border border-primary-500">
            Book Service
          </Link>
        </div>
      )}
    </>
  );
}
