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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow py-6">
        <div className="max-w-5xl mx-auto px-4">
          <ProgressBar currentStep={5} />

          {/* Vehicle Banner */}
          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="mb-5 text-center">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
              <Calculator className="text-accent-500" size={20} /> Price Estimator
            </h1>
            <p className="text-xs text-slate-400 mt-1">Review your configuration and itemised cost breakdown.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Config Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <h2 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">Configuration Summary</h2>

                {/* Services */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench size={17} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-700 text-sm">Selected Services</h3>
                    {selectedServices.length > 0 ? (
                      <div className="mt-1.5 space-y-1.5">
                        {selectedServices.map(s => (
                          <div key={s.id} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                              <span className="text-slate-700 font-medium">{s.name}</span>
                              {s.duration && <span className="text-slate-400">(~{s.duration}min)</span>}
                            </div>
                            <span className="font-bold text-slate-800">₹{s.price.toLocaleString('en-IN')}</span>
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
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Shield size={17} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">Service Package</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pkg ? (
                        <span><strong className="text-indigo-600">{pkg.name}</strong> — {pkg.description}</span>
                      ) : (
                        <span className="text-slate-400">None (Primary Services only)</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
                    <div className="w-9 h-9 bg-white text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                      <Clock size={17} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700 text-sm">Estimated Completion</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Approximately <strong className="text-emerald-700 text-sm">{durationText}</strong> for {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}{pkg ? ' + package checks' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-xs text-slate-600">
                <HelpCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-amber-800">Please Note: </span>
                  This is an estimate. During inspection, if additional repairs are found, we'll share a digital Health Report for your approval. No repairs proceed without your consent.
                </div>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 sticky top-24">
                <h2 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 flex items-center gap-2 mb-4">
                  <Receipt size={16} className="text-accent-500" /> Estimated Invoice
                </h2>

                <div className="space-y-2 mb-4">
                  {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between text-xs">
                      <span className="text-slate-500">{s.name}</span>
                      <span className="font-semibold text-slate-700">₹{s.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {pkg && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Package ({pkg.name})</span>
                      <span className="font-semibold text-slate-700">₹{packagePrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-500"><Tag size={11} />Subtotal</span>
                    <span className="font-semibold text-slate-700">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-500"><Percent size={11} />GST (18%)</span>
                    <span className="font-semibold text-slate-700">₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-slate-800 text-base">Estimated Total</span>
                    <span className="text-2xl font-black text-primary-800">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {selectedServices.length > 0 && (
                  <div className="mt-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-xs text-emerald-700 flex items-center gap-1.5">
                    <Clock size={12} /> Estimated completion: <strong>{durationText}</strong>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  className="w-full bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent-500/20 border border-accent-600 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  Proceed to Book Slot <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={() => router.push('/comparison')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
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
