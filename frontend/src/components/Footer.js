'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-accent-500 text-white p-1.5 rounded-lg">
                <Wrench size={18} />
              </div>
              <span className="font-extrabold text-lg text-white">
                AutoCare <span className="text-accent-500">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium, transparent, and hassle-free vehicle servicing. Certified mechanics, state-of-the-art diagnostics, and instant repair approvals.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent-500 transition-colors">Services</Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-accent-500 transition-colors">Service Packages</Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-accent-500 transition-colors">Book a Slot</Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-accent-500 transition-colors">My Bookings</Link>
              </li>
            </ul>
          </div>

          {/* Hours Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Business Hours</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Clock size={16} className="text-accent-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white">Monday - Friday</p>
                  <p className="text-xs text-slate-400">8:00 AM - 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={16} className="text-accent-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white">Saturday</p>
                  <p className="text-xs text-slate-400">9:00 AM - 4:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={16} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400">Sunday</p>
                  <p className="text-xs text-slate-500">Closed</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-accent-500 mt-0.5 shrink-0" />
                <span>+1 (800) 555-CARE</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-accent-500 mt-0.5 shrink-0" />
                <span>support@autocarepro.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-accent-500 mt-0.5 shrink-0" />
                <span className="leading-relaxed">100 Service Lane, Motor City, CA 90210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AutoCare Pro. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
