'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#211F1D' }} className="text-gray-400 mt-auto pb-16 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="text-white p-1.5 rounded-lg" style={{ background: '#E65313' }}>
                <Wrench size={16} />
              </div>
              <span className="font-black text-lg text-white">
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
            <ul className="space-y-2">
              {[
                { label: 'Services', href: '/services' },
                { label: 'Packages', href: '/packages' },
                { label: 'Book Service', href: '/vehicle-selection' },
                { label: 'My Bookings', href: '/my-bookings' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: '#9CA3AF' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="tel:+919626757303" className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#9CA3AF' }}>
                  <Phone size={13} style={{ color: '#E65313', flexShrink: 0 }} />
                  +91 9626757303
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-green-400"
                  style={{ color: '#9CA3AF' }}
                >
                  <MessageCircle size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <a href="mailto:support@bugslayers.com" className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#9CA3AF' }}>
                  <Mail size={13} style={{ color: '#E65313', flexShrink: 0 }} />
                  support@bugslayers.com
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
                  <MapPin size={13} style={{ color: '#E65313', flexShrink: 0 }} />
                  Coimbatore, Tamil Nadu
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#9CA3AF' }}>Terms &amp; Conditions</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#9CA3AF' }}>Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#9CA3AF' }}>Refund Policy</Link></li>
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
