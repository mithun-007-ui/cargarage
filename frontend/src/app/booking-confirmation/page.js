'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { getBookingById } from 'src/lib/mockDb';
import { Check, ClipboardCheck, Calendar, Clock, Car, Wrench, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('booking_flow_confirmed_id');
    if (storedId) {
      const details = getBookingById(storedId);
      if (details) {
        setBooking(details);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50 flex items-center justify-center">
        <div className="max-w-xl w-full px-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            {/* Top Success Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center text-white flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border-2 border-white/30 animate-bounce">
                <Check size={36} className="text-white" strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Booking Confirmed!</h1>
              <p className="text-emerald-100 text-sm mt-1">We have reserved your servicing slot successfully.</p>
            </div>

            {/* Content Details */}
            <div className="p-8 space-y-6">
              {booking ? (
                <>
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Booking ID</p>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">{booking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Estimated Total</p>
                      <p className="text-base font-extrabold text-primary-800 mt-0.5">${parseFloat(booking.estimatedPrice).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Summary grid */}
                  <div className="space-y-4 text-sm border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Car size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vehicle</p>
                        <p className="font-semibold text-slate-700">{booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <Wrench size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Service Type</p>
                        <p className="font-semibold text-slate-700">{booking.serviceType} <span className="text-xs font-normal text-slate-400">(Package: {booking.packageSelected})</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date</p>
                          <p className="font-semibold text-slate-700">{booking.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Time</p>
                          <p className="font-semibold text-slate-700">{booking.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed text-center">
                    A confirmation email was dispatched to <strong className="text-slate-600">{booking.customerEmail}</strong>. Please bring your vehicle in at the scheduled time. You can check the service progress inside your dashboard.
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  Loading confirmed details...
                </div>
              )}

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Link
                  href="/my-bookings"
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-bold transition-all text-sm text-center cursor-pointer bg-white"
                >
                  View My Bookings
                </Link>
                <Link
                  href="/"
                  className="bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold transition-all text-sm text-center shadow-md shadow-primary-600/10 cursor-pointer"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
