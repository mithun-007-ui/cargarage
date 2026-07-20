'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import UserProfile from './UserProfile';
import {
  Wrench, Menu, X, Bell, Phone, MessageCircle,
  Home, Zap, Package, Stethoscope, CalendarCheck, BookOpen,
  ChevronRight,
} from 'lucide-react';
import { getUnreadNotificationsCount } from 'src/lib/mockDb';

const NAV_ITEMS = [
  { name: 'Home',         href: '/',                  icon: Home },
  { name: 'Services',     href: '/services',           icon: Zap },
  { name: 'Packages',     href: '/packages',           icon: Package },
  { name: 'AI Diagnostic',href: '/diagnostic',         icon: Stethoscope },
  { name: 'Book Service', href: '/vehicle-selection',  icon: CalendarCheck },
  { name: 'My Bookings',  href: '/my-bookings',        icon: BookOpen },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);

  /* ── scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── notifications ── */
  useEffect(() => {
    if (!user) return;
    const fetch = () => setUnreadCount(getUnreadNotificationsCount(user.email));
    setTimeout(fetch, 0);
    const t = setInterval(fetch, 15000);
    return () => clearInterval(t);
  }, [user]);

  /* ── close drawer on outside click ── */
  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMobileOpen]);

  /* ── lock scroll while drawer open ── */
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* ══════════════════════════════════════
          TOP UTILITY BAR
      ══════════════════════════════════════ */}
      <div className="navbar-utility-bar">
        <span className="navbar-utility-brand hidden sm:block">
          🏆 Premium Car Service — Coimbatore, Tamil Nadu
        </span>
        <div className="navbar-utility-actions">
          <a href="tel:+919626757303" className="navbar-utility-link">
            <Phone size={11} />
            +91 96267 57303
          </a>
          <span className="navbar-utility-divider" />
          <a
            href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-utility-link navbar-whatsapp"
          >
            <MessageCircle size={11} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN NAV
      ══════════════════════════════════════ */}
      <nav className={`navbar-root${scrolled ? ' navbar-scrolled' : ''}`}>
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <Link href="/" className="navbar-logo group">
            <div className="navbar-logo-icon group-hover:scale-110 group-hover:rotate-[-8deg] transition-transform duration-300">
              <Wrench size={17} strokeWidth={2.5} />
            </div>
            <span className="navbar-logo-text">
              Bug&nbsp;<span className="navbar-logo-accent">Slayers</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="navbar-links hidden md:flex" style={{ gap: '2.25rem' }}>
            {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href} className="relative">
                  <Link
                    href={href}
                    className={`navbar-link${active ? ' navbar-link-active' : ''}`}
                  >
                    <Icon
                      size={13}
                      className="navbar-link-icon"
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {name}
                    {active && <span className="navbar-active-dot" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Desktop Right Side ── */}
          <div className="navbar-right hidden md:flex">
            {/* Bell */}
            {user && unreadCount > 0 && (
              <Link
                href="/my-bookings?tab=notifications"
                className="navbar-bell"
                title={`${unreadCount} unread notifications`}
              >
                <Bell size={17} />
                <span className="navbar-bell-badge animate-pulse-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Link>
            )}

            {user ? (
              <UserProfile />
            ) : (
              <Link href="/login" className="navbar-cta-btn" id="navbar-login-button">
                Login
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {/* ── Mobile Right (bell + hamburger) ── */}
          <div className="flex md:hidden items-center gap-1.5">
            {user && unreadCount > 0 && (
              <Link href="/my-bookings?tab=notifications" className="navbar-bell">
                <Bell size={17} />
                <span className="navbar-bell-badge animate-pulse-glow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Link>
            )}

            <button
              onClick={() => setIsMobileOpen(true)}
              className="navbar-hamburger"
              aria-label="Open menu"
            >
              <Menu size={21} strokeWidth={2} />
            </button>
          </div>

        </div>
      </nav>

      {/* ══════════════════════════════════════
          MOBILE DRAWER OVERLAY
      ══════════════════════════════════════ */}
      {isMobileOpen && (
        <div className="navbar-overlay" aria-hidden="true" />
      )}

      {/* ══════════════════════════════════════
          MOBILE DRAWER PANEL
      ══════════════════════════════════════ */}
      <div
        ref={drawerRef}
        className={`navbar-drawer${isMobileOpen ? ' navbar-drawer-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="navbar-drawer-header">
          <Link href="/" className="navbar-logo group" onClick={() => setIsMobileOpen(false)}>
            <div className="navbar-logo-icon">
              <Wrench size={16} strokeWidth={2.5} />
            </div>
            <span className="navbar-logo-text">
              Bug&nbsp;<span className="navbar-logo-accent">Slayers</span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="navbar-drawer-close"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="navbar-drawer-nav">
          {NAV_ITEMS.map(({ name, href, icon: Icon }, idx) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className={`navbar-drawer-link${active ? ' navbar-drawer-link-active' : ''}`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <span className={`navbar-drawer-icon${active ? ' navbar-drawer-icon-active' : ''}`}>
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="flex-1">{name}</span>
                {active && <ChevronRight size={14} style={{ color: '#E65313' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer — user block */}
        <div className="navbar-drawer-footer">
          {user ? (
            <div className="navbar-drawer-user">
              <div className="navbar-drawer-avatar">
                {user.role === 'Admin' ? 'A' : user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: '#202020' }}>
                  {user.role === 'Admin' ? 'Admin Dashboard' : 'My Profile'}
                </p>
                <p className="text-[10px] truncate" style={{ color: '#667085' }}>{user.email}</p>
              </div>
              <UserProfile />
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileOpen(false)}
              className="navbar-drawer-login"
            >
              Login to your account
              <ChevronRight size={15} />
            </Link>
          )}

          {/* Quick contact strip */}
          <div className="navbar-drawer-contact">
            <a href="tel:+919626757303" className="navbar-drawer-contact-btn">
              <Phone size={13} />
              Call Us
            </a>
            <a
              href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-drawer-contact-btn navbar-drawer-whatsapp"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM CTA BAR
      ══════════════════════════════════════ */}
      {pathname !== '/booking' &&
        pathname !== '/vehicle-selection' &&
        !pathname.startsWith('/admin') &&
        pathname !== '/login' &&
        pathname !== '/booking-confirmation' && (
          <div className="navbar-bottom-cta md:hidden">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-extrabold" style={{ color: '#9CA3AF' }}>
                Bug Slayers Garage
              </p>
              <p className="text-sm font-bold" style={{ color: '#202020' }}>
                Need Premium Service?
              </p>
            </div>
            <Link href="/vehicle-selection" className="navbar-cta-btn">
              Book Now
              <ChevronRight size={14} />
            </Link>
          </div>
        )}

      {/* ══════════════════════════════════════
          SCOPED STYLES
      ══════════════════════════════════════ */}
      <style>{`
        /* ─── Utility bar ─── */
        .navbar-utility-bar {
          width: 100%;
          background: #211F1D;
          color: #9CA3AF;
          font-size: 0.95rem;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          letter-spacing: 0.01em;
        }
        .navbar-utility-brand { color: #9CA3AF; font-weight: 500; }
        .navbar-utility-actions { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
        .navbar-utility-divider { width: 1px; height: 12px; background: #3A3836; }
        .navbar-utility-link {
          display: flex; align-items: center; gap: 0.35rem;
          color: #9CA3AF; text-decoration: none;
          transition: color 0.18s;
        }
        .navbar-utility-link:hover { color: #fff; }
        .navbar-whatsapp:hover { color: #4ade80 !important; }

        /* ─── Main nav shell ─── */
        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 40;
          background: #FFFFFF;
          border-bottom: 1px solid #E2D8CE;
          transition: box-shadow 0.25s, background 0.25s, backdrop-filter 0.25s;
        }
        .navbar-scrolled {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 2px 20px rgba(0,0,0,0.07);
        }
        .navbar-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 1rem;
        }
        @media (min-width: 640px)  { .navbar-inner { padding: 0 1.5rem; } }
        @media (min-width: 1024px) { .navbar-inner { padding: 0 2.5rem; } }

        /* ─── Logo ─── */
        .navbar-logo {
          display: flex; align-items: center; gap: 0.6rem;
          text-decoration: none; flex-shrink: 0;
        }
        .navbar-logo-icon {
          background: linear-gradient(135deg, #E65313, #C8430B);
          color: #fff;
          padding: 0.45rem;
          border-radius: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(230,83,19,0.35);
        }
        
          font-weight: 900;
          font-size: 1.125rem;
          letter-spacing: -0.03em;
          color: #202020;
        }
        .navbar-logo-accent { color: #E65313; }

        /* ─── Desktop links ─── */
        .navbar-links {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 2.25rem;
          margin: 0; padding: 0;
          /* Hide on small screens */
          @media (max-width: 767px) { display: none; }
        }
        .navbar-link {
          position: relative;
          display: flex; align-items: center; gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          border-radius: 0.625rem;
          font-size: 1rem;
          font-weight: 600;
          color: #667085;
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
        }
        .navbar-link:hover {
          color: #202020;
          background: #F8F5F0;
        }
        .navbar-link-active {
          background: #FFF3EE !important;
          color: #E65313 !important;
        }
        .navbar-link-icon { flex-shrink: 0; opacity: 0.75; }
        .navbar-link-active .navbar-link-icon { opacity: 1; }
        .navbar-active-dot {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px;
          border-radius: 999px;
          background: #E65313;
        }

        /* ─── Right side ─── */
        .navbar-right { display: flex; align-items: center; gap: 2rem; }

        /* ─── Bell ─── */
        .navbar-bell {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border-radius: 0.625rem;
          color: #667085;
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
        }
        .navbar-bell:hover { color: #202020; background: #F8F5F0; }
        .navbar-bell-badge {
          position: absolute;
          top: -2px; right: -2px;
          background: #E65313;
          color: #fff;
          font-size: 0.5rem;
          font-weight: 900;
          min-width: 16px; height: 16px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 3px;
          border: 2px solid #fff;
        }

        /* ─── CTA button ─── */
        .navbar-cta-btn {
          display: inline-flex; align-items: center; gap: 0.3rem;
          background: linear-gradient(135deg, #E65313, #C8430B);
          color: #fff;
          font-size: 1.0625rem;
          font-weight: 700;
          padding: 0.5rem 1.1rem;
          border-radius: 0.625rem;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(230,83,19,0.3);
          transition: box-shadow 0.2s, transform 0.15s, opacity 0.15s;
          white-space: nowrap;
        }
        .navbar-cta-btn:hover {
          box-shadow: 0 4px 18px rgba(230,83,19,0.45);
          transform: translateY(-1px);
        }
        .navbar-cta-btn:active { transform: scale(0.97); }

        /* ─── Hamburger ─── */
        .navbar-hamburger {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px;
          border-radius: 0.625rem;
          border: 1.5px solid #E2D8CE;
          color: #202020;
          background: transparent;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
        }
        .navbar-hamburger:hover { background: #F8F5F0; border-color: #ccc; }

        /* ─── Overlay ─── */
        .navbar-overlay {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(2px);
          animation: overlayIn 0.2s ease forwards;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        /* ─── Drawer ─── */
        .navbar-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          z-index: 50;
          width: min(320px, 88vw);
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        .navbar-drawer-open { transform: translateX(0); }

        .navbar-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid #E2D8CE;
        }
        .navbar-drawer-close {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          border-radius: 0.5rem;
          border: 1.5px solid #E2D8CE;
          color: #667085;
          background: transparent;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .navbar-drawer-close:hover { background: #F8F5F0; color: #202020; }

        .navbar-drawer-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .navbar-drawer-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 0.875rem;
          border-radius: 0.75rem;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 600;
          color: #667085;
          transition: background 0.18s, color 0.18s;
          animation: drawerLinkIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes drawerLinkIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .navbar-drawer-link:hover { background: #F8F5F0; color: #202020; }
        .navbar-drawer-link-active { background: #FFF3EE !important; color: #E65313 !important; }

        .navbar-drawer-icon {
          width: 32px; height: 32px;
          border-radius: 0.5rem;
          display: flex; align-items: center; justify-content: center;
          background: #F8F5F0;
          color: #667085;
          flex-shrink: 0;
          transition: background 0.18s, color 0.18s;
        }
        .navbar-drawer-icon-active {
          background: #FFD9C8 !important;
          color: #E65313 !important;
        }

        /* Drawer footer */
        .navbar-drawer-footer {
          border-top: 1px solid #E2D8CE;
          padding: 1rem 1.125rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .navbar-drawer-user {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem;
          background: #F8F5F0;
          border-radius: 0.75rem;
          border: 1px solid #E2D8CE;
        }
        .navbar-drawer-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #E65313, #C8430B);
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .navbar-drawer-login {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          background: linear-gradient(135deg, #E65313, #C8430B);
          color: #fff;
          font-size: 1rem; font-weight: 700;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(230,83,19,0.3);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .navbar-drawer-login:hover { box-shadow: 0 4px 18px rgba(230,83,19,0.45); transform: translateY(-1px); }

        .navbar-drawer-contact {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;
        }
        .navbar-drawer-contact-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          padding: 0.55rem 0.75rem;
          border-radius: 0.625rem;
          font-size: 0.825rem; font-weight: 600;
          text-decoration: none;
          border: 1.5px solid #E2D8CE;
          color: #667085;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
        }
        .navbar-drawer-contact-btn:hover { background: #F8F5F0; color: #202020; }
        .navbar-drawer-whatsapp:hover { border-color: #4ade80; color: #16a34a; background: #f0fdf4; }

        /* ─── Bottom CTA bar ─── */
        .navbar-bottom-cta {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid #E2D8CE;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
          /* Hide on larger screens */
          @media (min-width: 768px) { display: none; }
          @media (max-width: 767px) { padding: 0.75rem 0.875rem; }
        }
      `}</style>
    </>
  );
}
