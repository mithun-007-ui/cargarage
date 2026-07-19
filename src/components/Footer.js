'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060912] text-slate-400 border-t border-[#1e2d45] mt-auto pb-16 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-white">
              Bug <span className="text-primary-400">Slayers</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>© {new Date().getFullYear()} Premium Service Garage</span>
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs">
            <a href="tel:+919626757303" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-primary-400" />
              +91 9626757303
            </a>
            <a href="mailto:support@bugslayers.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={11} className="text-primary-400" />
              support@bugslayers.com
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin size={11} className="text-primary-400" />
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
