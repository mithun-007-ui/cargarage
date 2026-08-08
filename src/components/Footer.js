'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Wrench, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#211F1D' }} className="text-gray-400 mt-auto pb-16 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="text-white p-1.5 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-[-8deg] duration-300" style={{ background: '#E65313' }}>
                <Wrench size={16} />
              </div>
              <span className="font-black text-lg text-white group-hover:text-orange-400 transition-colors duration-200">
                Bug <span style={{ color: '#E65313' }}>Slayers</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
              Premium car servicing with full transparency. Certified mechanics, OEM parts, and item-by-item approval before any work starts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-1">
              {[
                { label: 'Services', href: '/services' },
                { label: 'Packages', href: '/packages' },
                { label: 'Book Service', href: '/vehicle-selection' },
                { label: 'My Bookings', href: '/my-bookings' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm py-1 transition-all duration-200 rounded-lg"
                    style={{ color: '#9CA3AF' }}
                  >
                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0"
                      style={{ color: '#E65313' }}
                    />
                    <span className="group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+919626757303"
                  className="group flex items-center gap-2.5 text-sm py-1.5 px-2.5 rounded-lg transition-all duration-200 hover:bg-orange-500/10"
                  style={{ color: '#9CA3AF' }}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-orange-500/20" style={{ background: 'rgba(230,83,19,0.12)' }}>
                    <Phone size={13} style={{ color: '#E65313' }} />
                  </div>
                  <span className="group-hover:text-orange-400 transition-colors duration-200">+91 9626757303</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-sm py-1.5 px-2.5 rounded-lg transition-all duration-200 hover:bg-green-500/10"
                  style={{ color: '#9CA3AF' }}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-green-500/20" style={{ background: 'rgba(22,163,74,0.12)' }}>
                    <MessageCircle size={13} style={{ color: '#16A34A' }} />
                  </div>
                  <span className="group-hover:text-green-400 transition-colors duration-200">WhatsApp Us</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@bugslayers.com"
                  className="group flex items-center gap-2.5 text-sm py-1.5 px-2.5 rounded-lg transition-all duration-200 hover:bg-orange-500/10"
                  style={{ color: '#9CA3AF' }}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-orange-500/20" style={{ background: 'rgba(230,83,19,0.12)' }}>
                    <Mail size={13} style={{ color: '#E65313' }} />
                  </div>
                  <span className="group-hover:text-orange-400 transition-colors duration-200">support@bugslayers.com</span>
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2.5 text-sm py-1.5 px-2.5" style={{ color: '#9CA3AF' }}>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(230,83,19,0.12)' }}>
                    <MapPin size={13} style={{ color: '#E65313' }} />
                  </div>
                  Coimbatore, Tamil Nadu
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-1">
              {[
                { label: 'Terms & Conditions', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Refund Policy', href: '#' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm py-1 transition-all duration-200"
                    style={{ color: '#9CA3AF' }}
                  >
                    <ChevronRight
                      size={13}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0"
                      style={{ color: '#E65313' }}
                    />
                    <span className="group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            © {new Date().getFullYear()} Bug Slayers Premium Service Garage. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Built for transparent, hassle-free car care.
          </p>
        </div>
      </div>
    </footer>
  );
}
