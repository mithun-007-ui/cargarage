'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/context/AuthContext';
import { getBookingById } from 'src/lib/mockDb';
import { ClipboardCheck, FileText, CheckCircle, AlertTriangle, XCircle, ChevronLeft, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function VehicleHealthReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/health-report?id=${bookingId}`);
    }
  }, [user, loading, router, bookingId]);

  useEffect(() => {
    if (bookingId) {
      const data = getBookingById(bookingId);
      if (data) {
        setBooking(data);
      }
    }
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Diagnostic items checklist
  const systemChecks = [
    { name: 'OBD-II Fault Codes Scan', status: 'Passed', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Engine Compression & Leak test', status: 'Passed', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Brake Pads & Rotor Wear', status: 'Attention Required', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
    { name: 'Battery Volts & Charge Integrity', status: 'Passed', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Fluids & Level Check', status: 'Passed', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Air & Cabin Filtration', status: 'Attention Required', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/my-bookings')}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              Back to My Bookings
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden mb-8">
            {/* Header Banner */}
            <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-600 text-white rounded-2xl">
                  <ClipboardCheck size={28} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">Vehicle Health Inspection Report</h1>
                  <p className="text-xs text-slate-400">Diagnostic details for booking ID: <strong>{booking.id}</strong></p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-800 text-white border border-primary-700">
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Vehicle info block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Make / Model</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{booking.vehicle.make} {booking.vehicle.model}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Model Year</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{booking.vehicle.year}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Plate Number</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">{booking.vehicle.plateNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-wider">Technician Assigned</p>
                  <p className="text-sm font-bold text-primary-600 mt-1">David Miller (ASE)</p>
                </div>
              </div>

              {/* Attention Banner if awaiting approval */}
              {booking.status === 'Waiting for Approval' && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                    <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-850">Recommended Repairs Awaiting Approval</p>
                      <p className="text-xs text-slate-500 mt-0.5">Please review the repair recommendations and approve/reject individual items.</p>
                    </div>
                  </div>
                  <Link
                    href={`/repair-approval?id=${booking.id}`}
                    className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-accent-500/25 flex items-center gap-1 border border-accent-600 shrink-0 cursor-pointer"
                  >
                    Review Recommendations
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}

              {/* Diagnostics Grid */}
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Diagnostics Checklist</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {systemChecks.map((check, idx) => {
                    const Icon = check.icon;
                    return (
                      <div key={idx} className="border border-slate-100/80 rounded-xl p-4 flex items-center justify-between shadow-sm bg-white">
                        <span className="text-xs font-semibold text-slate-750">{check.name}</span>
                        <div className="flex items-center gap-1.5">
                          <Icon size={14} className={check.color.split(' ')[0]} />
                          <span className={`text-[10px] font-bold uppercase ${check.color.split(' ')[0]}`}>{check.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health report recommendations */}
              {booking.healthReport ? (
                <div className="space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Technician Observations & Notes</h2>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 leading-relaxed italic">
                    "{booking.healthReport.notes}"
                  </div>

                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider pt-2">Recommended Repairs Checklist</h2>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-5 py-3 font-bold text-slate-500">Repair Item</th>
                          <th className="px-5 py-3 font-bold text-slate-500 text-center">Cost</th>
                          <th className="px-5 py-3 font-bold text-slate-500 text-right">Approval Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {booking.healthReport.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20">
                            <td className="px-5 py-3.5 font-semibold text-slate-700">{item.name}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-800 text-center">${item.cost}</td>
                            <td className="px-5 py-3.5 text-right font-bold">
                              {item.approved === null ? (
                                <span className="text-orange-500">Pending Review</span>
                              ) : item.approved ? (
                                <span className="text-emerald-600">✓ Approved</span>
                              ) : (
                                <span className="text-red-500">✗ Rejected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                  <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                  Technician digital health report is currently pending. The diagnostic check will commence once the vehicle is received.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
