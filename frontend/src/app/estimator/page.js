'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { ChevronLeft, ChevronRight, Calculator, FileSpreadsheet, Receipt, HelpCircle, Car, Wrench, Shield } from 'lucide-react';

export default function PriceEstimatorPage() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [service, setService] = useState(null);
  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    // Retrieve selections
    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    const storedService = localStorage.getItem('booking_flow_service');
    const storedPackage = localStorage.getItem('booking_flow_package');

    if (storedVehicle) setVehicle(JSON.parse(storedVehicle));
    if (storedService) setService(JSON.parse(storedService));
    if (storedPackage) {
      try {
        const parsed = JSON.parse(storedPackage);
        setPkg(parsed === 'none' ? null : parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const servicePrice = service?.price || 0;
  const packagePrice = pkg?.price || 0;
  const subtotal = servicePrice + packagePrice;
  const shopSupplies = subtotal > 0 ? 12.50 : 0;
  const estimatedTax = (subtotal + shopSupplies) * 0.08;
  const totalEstimate = subtotal + shopSupplies + estimatedTax;

  const handleBookSlot = () => {
    // Store estimated total
    localStorage.setItem('booking_flow_estimated_price', totalEstimate.toFixed(2));
    router.push('/booking');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider max-w-3xl mx-auto">
            <span className="text-emerald-600 font-medium">✓ 1. Vehicle</span>
            <span className="text-emerald-600 font-medium">✓ 2. Service</span>
            <span className="text-emerald-600 font-medium">✓ 3. Package</span>
            <span className="text-primary-600 border-b-2 border-primary-600 pb-1">4. Price Estimation</span>
          </div>

          <div className="text-center mb-10 max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
              <Calculator className="text-accent-500" />
              Quote Estimator
            </h1>
            <p className="text-sm text-slate-400 mt-2">Review your selected configuration and itemized cost breakdown.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Configuration Summary Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
                <h2 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-150">Configuration Summary</h2>
                
                {/* Vehicle Selected */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">Selected Vehicle</h3>
                    {vehicle ? (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {vehicle.make} {vehicle.model} ({vehicle.year}) — <span className="font-mono text-slate-400">{vehicle.plateNumber}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 mt-0.5">No vehicle selected. <Link href="/vehicle-selection" className="underline">Select now</Link></p>
                    )}
                  </div>
                </div>

                {/* Service Selected */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">Primary Service</h3>
                    {service ? (
                      <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
                        <p className="font-semibold text-slate-700">{service.name}</p>
                        <p className="text-slate-400">{service.description}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500 mt-0.5">No service selected. <Link href="/services" className="underline">Select now</Link></p>
                    )}
                  </div>
                </div>

                {/* Package Selected */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm">Service Care Package</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pkg ? (
                        <span><strong className="text-indigo-600">{pkg.name}</strong> Upgrade — {pkg.description}</span>
                      ) : (
                        <span className="text-slate-400">None (Primary Service Check only)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Notice Box */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-xs text-slate-600">
                <HelpCircle size={18} className="text-amber-500 shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-bold text-amber-800">Please Note:</span> This price quote is an estimate. During inspection, if the technician identifies critical repairs, we will compile a digital Health Report for your approval. No repairs will proceed without your explicit consent.
                </div>
              </div>
            </div>

            {/* Price Estimator Invoice Column */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sticky top-24">
                <h2 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2 mb-4">
                  <Receipt size={18} className="text-accent-500" />
                  Estimated Invoice
                </h2>

                <div className="space-y-3.5 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Service ({service?.name || 'None'})</span>
                    <span className="font-semibold text-slate-700">${servicePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Package Upgrade ({pkg?.name || 'None'})</span>
                    <span className="font-semibold text-slate-700">${packagePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shop Supplies & Recycling</span>
                    <span className="font-semibold text-slate-700">${shopSupplies.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Sales Tax (8%)</span>
                    <span className="font-semibold text-slate-700">${estimatedTax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-baseline">
                    <span className="font-bold text-slate-800 text-base">Estimated Total</span>
                    <span className="text-2xl font-black text-primary-800">${totalEstimate.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBookSlot}
                  className="w-full bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold transition-all text-center shadow-lg shadow-accent-500/20 hover:shadow-accent-500/35 border border-accent-600 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  Proceed to Book Slot
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-start">
            <button
              onClick={() => router.push('/packages')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
