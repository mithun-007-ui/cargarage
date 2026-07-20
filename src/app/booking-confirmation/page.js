'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { getBookingById } from 'src/lib/mockDb';
import { Check, Calendar, Clock, Car, Wrench, Download, MapPin, Truck, Package, Hash, ChevronRight } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-2xl mx-auto">
            <ProgressBar currentStep={7} />

            {/* Success Card */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5" style={{ borderColor: '#E2D8CE' }}>
              {/* Top Success Banner */}
              <div className="p-7 text-center text-white flex flex-col items-center" style={{ background: '#211F1D' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border-2" style={{ background: 'rgba(230,83,19,0.1)', borderColor: '#E65313' }}>
                  <Check size={34} style={{ color: '#E65313' }} strokeWidth={3} />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white">Booking Confirmed!</h1>
                <p className="text-gray-400 text-sm mt-1">Your service slot has been successfully reserved.</p>
              </div>

              <div className="p-6 space-y-5">
                {booking ? (
                  <>
                    {/* Booking ID & Price */}
                    <div className="flex justify-between items-center border rounded-2xl p-4 text-xs" style={{ background: '#F8F5F0', borderColor: '#E2D8CE' }}>
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Hash size={10} />Booking ID
                        </p>
                        <p className="text-lg font-extrabold mt-0.5 font-mono" style={{ color: '#202020' }}>{booking.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 font-bold uppercase tracking-wider">Estimated Total</p>
                        <p className="text-lg font-extrabold mt-0.5" style={{ color: '#E65313' }}>
                          ₹{parseFloat(booking.estimatedPrice).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3 text-sm border-b pb-5" style={{ borderColor: '#E2D8CE' }}>
                      {/* Vehicle */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                          <Car size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Vehicle</p>
                          <p className="font-semibold text-gray-800">{booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.year})</p>
                          <p className="text-xs font-mono text-gray-400">{booking.vehicle.plateNumber}</p>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}>
                          <Wrench size={15} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Selected Services</p>
                          {booking.selectedServices && booking.selectedServices.length > 0 ? (
                            <div className="mt-0.5 space-y-0.5">
                              {booking.selectedServices.map(s => (
                                <p key={s.id} className="text-xs text-gray-700 font-medium">• {s.name} — ₹{s.price.toLocaleString('en-IN')}</p>
                              ))}
                            </div>
                          ) : (
                            <p className="font-semibold text-gray-850">{booking.serviceType}</p>
                          )}
                        </div>
                      </div>

                      {/* Package */}
                      {booking.packageSelected && booking.packageSelected !== 'None' && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
                            <Package size={15} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Package</p>
                            <p className="font-semibold text-gray-800">{booking.packageSelected}</p>
                          </div>
                        </div>
                      )}

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 border border-gray-200">
                            <Calendar size={15} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Date</p>
                            <p className="font-semibold text-gray-800 text-sm">{booking.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 border border-gray-200">
                            <Clock size={15} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Time</p>
                            <p className="font-semibold text-gray-800 text-sm">{booking.time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Service Center */}
                      {booking.serviceCenter && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                            <MapPin size={15} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Service Center</p>
                            <p className="font-semibold text-gray-800 text-sm">{booking.serviceCenter}</p>
                          </div>
                        </div>
                      )}

                      {/* Pickup Option */}
                      {booking.pickupOption && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>
                            <Truck size={15} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-405 font-bold uppercase tracking-wider">Pickup</p>
                            <p className="font-semibold text-gray-800 text-sm">{booking.pickupOption}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Progress Tracker */}
                    <div>
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Service Progress</h2>
                      <div className="relative">
                        {trackerSteps.map((step, idx) => {
                          const isComplete = idx < Math.max(currentStepIndex, 0);
                          const isCurrent = idx === Math.max(currentStepIndex, 0);
                          return (
                            <div key={step.key} className="flex items-start gap-3 mb-2.5 last:mb-0">
                              <div className="flex flex-col items-center">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border-2 transition-all"
                                  style={
                                    isComplete ? { background: '#16A34A', borderColor: '#16A34A', color: '#FFFFFF' }
                                    : isCurrent ? { background: '#E65313', borderColor: '#E65313', color: '#FFFFFF' }
                                    : { background: '#FFFFFF', borderColor: '#E2D8CE', color: '#9CA3AF' }
                                  }
                                >
                                  {isComplete ? '✓' : idx + 1}
                                </div>
                                {idx < trackerSteps.length - 1 && (
                                  <div
                                    className="w-0.5 h-4 mt-1"
                                    style={{ background: isComplete ? '#16A34A' : '#E2D8CE' }}
                                  />
                                )}
                              </div>
                              <div className="pt-0.5">
                                <p
                                  className="text-xs font-bold"
                                  style={{
                                    color: isCurrent ? '#E65313' : isComplete ? '#16A34A' : '#9CA3AF'
                                  }}
                                >
                                  {step.label}
                                  {isCurrent && (
                                    <span
                                      className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                                      style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}
                                    >
                                      Current
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed text-center pt-2 border-t" style={{ borderColor: '#E2D8CE' }}>
                      A confirmation has been sent to <strong className="text-gray-600">{booking.customerEmail}</strong>. Please arrive on time with your vehicle.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-400">Loading confirmed details...</div>
                )}

                {/* CTAs */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex items-center justify-center gap-1.5 btn-outline text-xs"
                  >
                    <Download size={13} />
                    Download Receipt
                  </button>
                  <Link
                    href="/my-bookings"
                    className="flex items-center justify-center gap-1.5 btn-primary text-xs"
                  >
                    <ChevronRight size={13} />
                    Track Booking
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link href="/" className="text-xs text-gray-500 hover:opacity-80 transition-colors font-medium">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
