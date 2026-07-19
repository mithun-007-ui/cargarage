'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-white">Vehicle<span className="text-accent-500">Care</span></span>
            <span className="text-slate-600">•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs">
            <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-accent-500" />
              +91 98765 43210
            </a>
            <a href="mailto:support@vehiclecare.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} className="text-accent-500" />
              support@vehiclecare.com
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin size={11} className="text-accent-500" />
              Coimbatore, Tamil Nadu
            </span>
          </div>

          {/* Legal */}
          <div className="flex items-center gap-4 text-xs">
            <Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
