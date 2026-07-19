'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { getBookingById } from 'src/lib/mockDb';
import { Check, ClipboardCheck, Calendar, Clock, Car, Wrench, Download, MapPin, Truck, Package, Hash, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import ProgressBar from 'src/components/ProgressBar';

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

  const handleDownloadReceipt = () => {
    window.print();
  };

  const trackerSteps = [
    { label: 'Booking Confirmed', key: 'Booked' },
    { label: 'Vehicle Received', key: 'Vehicle Received' },
    { label: 'Inspection', key: 'Inspection' },
    { label: 'Awaiting Approval', key: 'Waiting for Approval' },
    { label: 'Repair Started', key: 'Repair in Progress' },
    { label: 'Quality Check', key: 'Quality Check' },
    { label: 'Completed', key: 'Completed' },
  ];

  const currentStepIndex = booking
    ? trackerSteps.findIndex(s => s.key === booking.status)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-2xl mx-auto px-4">
          <ProgressBar currentStep={7} />

          {/* Success Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-5">
            {/* Top Success Banner */}
            <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 p-7 text-center text-white flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 border-2 border-white/30">
                <Check size={34} className="text-white" strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Booking Confirmed!</h1>
              <p className="text-primary-100 text-sm mt-1">Your service slot has been successfully reserved.</p>
            </div>

            <div className="p-6 space-y-5">
              {booking ? (
                <>
                  {/* Booking ID & Price */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Hash size={10} />Booking ID
                      </p>
                      <p className="text-lg font-extrabold text-slate-800 mt-0.5 font-mono">{booking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Estimated Total</p>
                      <p className="text-lg font-extrabold text-primary-800 mt-0.5">
                        ₹{parseFloat(booking.estimatedPrice).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 text-sm border-b border-slate-100 pb-5">
                    {/* Vehicle */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Car size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vehicle</p>
                        <p className="font-semibold text-slate-700">{booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})</p>
                        <p className="text-xs font-mono text-slate-400">{booking.vehicle.plateNumber}</p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Wrench size={15} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected Services</p>
                        {booking.selectedServices && booking.selectedServices.length > 0 ? (
                          <div className="mt-0.5 space-y-0.5">
                            {booking.selectedServices.map(s => (
                              <p key={s.id} className="text-xs text-slate-700 font-medium">• {s.name} — ₹{s.price.toLocaleString('en-IN')}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="font-semibold text-slate-700">{booking.serviceType}</p>
                        )}
                      </div>
                    </div>

                    {/* Package */}
                    {booking.packageSelected && booking.packageSelected !== 'None' && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Package size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Package</p>
                          <p className="font-semibold text-slate-700">{booking.packageSelected}</p>
                        </div>
                      </div>
                    )}

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                          <Calendar size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</p>
                          <p className="font-semibold text-slate-700 text-sm">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                          <Clock size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
                          <p className="font-semibold text-slate-700 text-sm">{booking.time}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Center */}
                    {booking.serviceCenter && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <MapPin size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Center</p>
                          <p className="font-semibold text-slate-700 text-sm">{booking.serviceCenter}</p>
                        </div>
                      </div>
                    )}

                    {/* Pickup Option */}
                    {booking.pickupOption && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Truck size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pickup</p>
                          <p className="font-semibold text-slate-700 text-sm">{booking.pickupOption}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking Progress Tracker */}
                  <div>
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Service Progress</h2>
                    <div className="relative">
                      {trackerSteps.map((step, idx) => {
                        const isComplete = idx < Math.max(currentStepIndex, 0);
                        const isCurrent = idx === Math.max(currentStepIndex, 0);
                        return (
                          <div key={step.key} className="flex items-start gap-3 mb-2.5 last:mb-0">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border-2 transition-all ${
                                isComplete ? 'bg-emerald-500 border-emerald-500 text-white'
                                : isCurrent ? 'bg-primary-600 border-primary-600 text-white'
                                : 'bg-white border-slate-200 text-slate-400'
                              }`}>
                                {isComplete ? '✓' : idx + 1}
                              </div>
                              {idx < trackerSteps.length - 1 && (
                                <div className={`w-0.5 h-4 mt-1 ${isComplete ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                              )}
                            </div>
                            <div className="pt-0.5">
                              <p className={`text-xs font-bold ${isCurrent ? 'text-primary-700' : isComplete ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {step.label}
                                {isCurrent && <span className="ml-1.5 text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-bold">Current</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed text-center pt-2 border-t border-slate-100">
                    A confirmation has been sent to <strong className="text-slate-600">{booking.customerEmail}</strong>. Please arrive on time with your vehicle.
                  </p>
                </>
              ) : (
                <div className="text-center py-6 text-slate-400">Loading confirmed details...</div>
              )}

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold transition-all text-xs cursor-pointer bg-white"
                >
                  <Download size={13} />
                  Download Receipt
                </button>
                <Link
                  href="/my-bookings"
                  className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-bold transition-all text-xs text-center shadow-md shadow-primary-600/10 cursor-pointer"
                >
                  <ChevronRight size={13} />
                  Track Booking
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-primary-600 transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
