'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/context/AuthContext';
import { getBookings } from 'src/lib/mockDb';
import { Calendar, Clock, Car, ClipboardList, AlertCircle, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/my-bookings');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const allBookings = getBookings();
      // Filter bookings for the logged-in customer email
      const filtered = allBookings.filter(
        b => b.customerEmail.toLowerCase() === user.email.toLowerCase()
      );
      setUserBookings(filtered);
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const configs = {
      'Booked': 'bg-blue-50 text-blue-700 border-blue-100',
      'Vehicle Received': 'bg-purple-50 text-purple-700 border-purple-100',
      'Inspection': 'bg-amber-50 text-amber-700 border-amber-100',
      'Waiting for Approval': 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse',
      'Repair in Progress': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${configs[status] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <Lock size={32} className="mb-2 text-slate-300" />
        <p>Please log in to view your bookings.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Service Bookings</h1>
              <p className="text-sm text-slate-400 mt-1">Track diagnostic updates, approve repair requests, and view invoices.</p>
            </div>
            <Link
              href="/booking"
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-primary-600/10 hover:shadow-primary-600/20 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              Book Another Service
            </Link>
          </div>

          {userBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-150 p-12 text-center max-w-lg mx-auto">
              <ClipboardList size={48} className="text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-800 mb-1">No Bookings Yet</h2>
              <p className="text-sm text-slate-400 mb-6">You have not scheduled any service appointments yet.</p>
              <Link
                href="/booking"
                className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all inline-block shadow-lg shadow-accent-500/25"
              >
                Schedule First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md hover:border-slate-200 transition-all duration-200"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        {booking.id}
                      </span>
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-slate-400">Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Main config details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700">
                          {booking.vehicle.make} {booking.vehicle.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400 shrink-0" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Service:</span>
                        <span className="font-semibold text-slate-800">{booking.serviceType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 md:justify-end shrink-0 border-t border-slate-50 pt-4 md:pt-0 md:border-0">
                    {booking.healthReport && (
                      <Link
                        href={`/health-report?id=${booking.id}`}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 bg-white cursor-pointer"
                      >
                        Health Report
                      </Link>
                    )}
                    
                    {booking.status === 'Waiting for Approval' && (
                      <Link
                        href={`/repair-approval?id=${booking.id}`}
                        className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 shadow-md shadow-accent-500/20 cursor-pointer border border-accent-600 animate-pulse"
                      >
                        Approve Repairs
                        <ChevronRight size={14} />
                      </Link>
                    )}

                    {booking.status !== 'Waiting for Approval' && (
                      <div className="text-xs font-bold text-slate-400 px-2 py-2 text-center md:text-right">
                        Est. Cost: <span className="text-primary-800 font-extrabold text-sm">${parseFloat(booking.estimatedPrice).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
