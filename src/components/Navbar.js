'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import UserProfile from './UserProfile';
import { Wrench, Menu, X, Calendar } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Packages', href: '/packages' },
    { name: 'Book Service', href: '/vehicle-selection' },
    { name: 'My Bookings', href: '/my-bookings' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-primary-800 text-white shadow-md border-b border-primary-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-accent-500 text-white p-1.5 rounded-lg transition-transform duration-300 group-hover:rotate-12">
                <Wrench size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                AutoCare <span className="text-accent-500">Pro</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 ${
                  isActive(item.href)
                    ? 'text-white bg-white/15 shadow-sm'
                    : 'text-primary-100 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side: Profile / Auth button */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <UserProfile />
            ) : (
              <Link
                href="/login"
                className="bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/35 border border-accent-600 flex items-center gap-1.5 cursor-pointer"
                id="navbar-login-button"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-primary-200 hover:text-white hover:bg-primary-700 focus:outline-none transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-900 border-t border-primary-800 animate-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-primary-800 px-4">
            {user ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white text-primary-800 rounded-full flex items-center justify-center font-bold">
                    {user.role === 'Admin' ? 'A' : 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user.role} Dashboard</div>
                    <div className="text-xs text-primary-300 truncate max-w-[180px]">{user.email}</div>
                  </div>
                </div>
                <UserProfile />
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-accent-500 hover:bg-accent-600 text-center block text-white px-4 py-2.5 rounded-lg text-base font-semibold shadow-md transition-all cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
