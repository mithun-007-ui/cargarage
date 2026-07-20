'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import UserProfile from './UserProfile';
import { Wrench, Menu, X, Bell, Phone, MessageCircle } from 'lucide-react';
import { getUnreadNotificationsCount } from 'src/lib/mockDb';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setUnreadCount(getUnreadNotificationsCount(user.email));
      }, 0);
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
      {/* ── Slim support bar ── */}
      <div
        className="w-full text-xs py-2 px-4 flex items-center justify-between gap-4"
        style={{ background: '#211F1D', color: '#9CA3AF' }}
      >
        <span className="hidden sm:block" style={{ color: '#9CA3AF' }}>
          🏆 Premium Car Service Garage — Coimbatore, Tamil Nadu
        </span>
        <div className="flex items-center gap-4 ml-auto">
          <a
            href="tel:+919626757303"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
            style={{ color: '#9CA3AF' }}
          >
            <Phone size={11} />
            +91 9626757303
          </a>
          <a
            href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
            style={{ color: '#9CA3AF' }}
          >
            <MessageCircle size={11} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav
        className="sticky top-0 z-40 transition-all duration-200"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2D8CE',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="text-white p-2 rounded-lg transition-transform duration-200 group-hover:scale-105"
                style={{ background: '#E65313' }}
              >
                <Wrench size={18} />
              </div>
              <span className="font-black text-xl tracking-tight" style={{ color: '#202020' }}>
                Bug&nbsp;<span style={{ color: '#E65313' }}>Slayers</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={
                    isActive(item.href)
                      ? { background: '#FFF3EE', color: '#E65313' }
                      : { color: '#667085' }
                  }
                  onMouseEnter={e => {
                    if (!isActive(item.href)) e.currentTarget.style.color = '#202020';
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item.href)) e.currentTarget.style.color = '#667085';
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {user && unreadCount > 0 && (
                <Link
                  href="/my-bookings?tab=notifications"
                  className="relative p-2 rounded-lg transition-colors"
                  style={{ color: '#667085' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#202020'}
                  onMouseLeave={e => e.currentTarget.style.color = '#667085'}
                >
                  <Bell size={18} />
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#E65313' }}
                  >
                    {unreadCount}
                  </span>
                </Link>
              )}
              {user ? (
                <UserProfile />
              ) : (
                <Link
                  href="/login"
                  className="text-white px-5 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#E65313' }}
                  id="navbar-login-button"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {user && unreadCount > 0 && (
                <Link
                  href="/my-bookings?tab=notifications"
                  className="relative p-1.5 rounded-lg"
                  style={{ color: '#667085' }}
                >
                  <Bell size={18} />
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#E65313' }}
                  >
                    {unreadCount}
                  </span>
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#202020' }}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #E2D8CE' }} className="md:hidden">
            <div className="px-3 pt-2 pb-2 space-y-0.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                  style={
                    isActive(item.href)
                      ? { background: '#FFF3EE', color: '#E65313' }
                      : { color: '#667085' }
                  }
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="px-4 pt-3 pb-4" style={{ borderTop: '1px solid #E2D8CE' }}>
              {user ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ background: '#E65313' }}
                    >
                      {user.role === 'Admin' ? 'A' : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#202020' }}>{user.role} Dashboard</div>
                      <div className="text-[10px] truncate max-w-[160px]" style={{ color: '#667085' }}>{user.email}</div>
                    </div>
                  </div>
                  <UserProfile />
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center block text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
                  style={{ background: '#E65313' }}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom CTA bar */}
      {pathname !== '/booking' && pathname !== '/vehicle-selection' && !pathname.startsWith('/admin') && pathname !== '/login' && pathname !== '/estimator' && pathname !== '/booking-confirmation' && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 p-3 z-40 flex items-center justify-between"
          style={{ background: '#FFFFFF', borderTop: '1px solid #E2D8CE', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider font-extrabold" style={{ color: '#9CA3AF' }}>Bug Slayers Garage</p>
            <p className="text-sm font-bold" style={{ color: '#202020' }}>Need Premium Service?</p>
          </div>
          <Link
            href="/vehicle-selection"
            className="text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#E65313' }}
          >
            Book Service
          </Link>
        </div>
      )}
    </>
  );
}
