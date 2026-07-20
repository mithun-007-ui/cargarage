'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import VehicleBanner from 'src/components/VehicleBanner';
import { ChevronLeft, ChevronRight, Calculator, Receipt, HelpCircle, Wrench, Shield, Clock, Tag, Percent } from 'lucide-react';

export default function PriceEstimatorPage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    const storedServices = localStorage.getItem('booking_flow_services');
    const storedPackage = localStorage.getItem('booking_flow_package');
    if (storedVehicle) { try { setVehicle(JSON.parse(storedVehicle)); } catch (e) {} }
    if (storedServices) { try { setSelectedServices(JSON.parse(storedServices)); } catch (e) {} }
    if (storedPackage) {
      try {
        const parsed = JSON.parse(storedPackage);
        setPkg(parsed === 'none' ? null : parsed);
      } catch (e) {}
    }
  }, []);

  const servicesSubtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const packagePrice = pkg?.price || 0;
  const subtotal = servicesSubtotal + packagePrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const totalMins = selectedServices.reduce((acc, s) => acc + (s.duration || 60), 0) + (pkg ? 30 : 0);
  const durationText = totalMins >= 60
    ? `${Math.floor(totalMins / 60)}h ${totalMins % 60 > 0 ? (totalMins % 60) + 'm' : ''}`
    : `${totalMins}m`;

  const handleBook = () => {
    localStorage.setItem('booking_flow_estimated_price', total.toString());
    router.push('/booking');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />
      <main className="flex-grow py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <ProgressBar currentStep={5} />

          {/* Vehicle Banner */}
          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold tracking-tight flex items-center justify-center gap-2" style={{ color: '#202020' }}>
              <Calculator className="text-[#E65313]" size={20} /> Price Estimator
            </h1>
            <p className="text-xs text-gray-500 mt-1">Review your configuration and itemised cost breakdown.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Config Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-4" style={{ borderColor: '#E2D8CE' }}>
                <h2 className="font-bold text-gray-800 text-sm pb-3 border-b" style={{ borderColor: '#E2D8CE' }}>Configuration Summary</h2>

                {/* Services */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EE', color: '#E65313' }}>
                    <Wrench size={17} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-700 text-sm">Selected Services</h3>
                    {selectedServices.length > 0 ? (
                      <div className="mt-1.5 space-y-1.5">
                        {selectedServices.map(s => (
                          <div key={s.id} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#E65313' }} />
                              <span className="text-gray-700 font-medium">{s.name}</span>
                              {s.duration && <span className="text-gray-400 font-normal">(~{s.duration}min)</span>}
                            </div>
                            <span className="font-bold text-gray-800">₹{s.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-red-500 mt-0.5">No services selected. <Link href="/services" className="underline font-bold">Select now</Link></p>
                    )}
                  </div>
                </div>

                {/* Package */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                    <Shield size={17} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 text-sm">Service Package</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {pkg ? (
                        <span><strong style={{ color: '#7C3AED' }}>{pkg.name}</strong> — {pkg.description}</span>
                      ) : (
                        <span className="text-gray-400">None (Primary Services only)</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-3 rounded-xl p-3.5 border" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border" style={{ color: '#16A34A', borderColor: '#BBF7D0' }}>
                      <Clock size={17} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-700 text-sm">Estimated Completion</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Approximately <strong className="text-green-700 text-sm">{durationText}</strong> for {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}{pkg ? ' + package checks' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="border rounded-xl p-4 flex gap-3 text-xs text-gray-650" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                <HelpCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-gray-600">
                  <span className="font-bold text-amber-800">Please Note: </span>
                  This is an estimate. During inspection, if additional repairs are found, we'll share a digital Health Report for your approval. No repairs proceed without your consent.
                </div>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border shadow-sm p-5 sticky top-24" style={{ borderColor: '#E2D8CE' }}>
                <h2 className="font-bold text-gray-800 text-sm pb-3 border-b flex items-center gap-2 mb-4" style={{ borderColor: '#E2D8CE' }}>
                  <Receipt size={16} style={{ color: '#E65313' }} /> Estimated Invoice
                </h2>

                <div className="space-y-2 mb-4">
                  {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between text-xs">
                      <span className="text-gray-500">{s.name}</span>
                      <span className="font-semibold text-gray-800">₹{s.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {pkg && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Package ({pkg.name})</span>
                      <span className="font-semibold text-gray-800">₹{packagePrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2" style={{ borderColor: '#E2D8CE' }}>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500"><Tag size={11} />Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500"><Percent size={11} />GST (18%)</span>
                    <span className="font-semibold text-gray-800">₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-baseline" style={{ borderColor: '#E2D8CE' }}>
                    <span className="font-bold text-gray-800 text-base">Estimated Total</span>
                    <span className="text-2xl font-black text-[#E65313]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {selectedServices.length > 0 && (
                  <div className="mt-3 mb-4 border rounded-lg px-3 py-2 text-xs flex items-center gap-1.5" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' }}>
                    <Clock size={12} /> Estimated completion: <strong>{durationText}</strong>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  className="w-full btn-primary py-3 text-sm justify-center"
                >
                  Proceed to Book Slot <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => router.push('/comparison')}
              className="btn-outline text-sm"
            >
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
