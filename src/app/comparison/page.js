'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import VehicleBanner from 'src/components/VehicleBanner';
import BillSummary from 'src/components/BillSummary';
import { getMockDb } from 'src/lib/mockDb';
import { Check, X, ChevronLeft, ChevronRight, Scale } from 'lucide-react';

const COMPARISON_ITEMS = [
  { name: 'Synthetic Oil & Filter Replacement', silver: true, gold: true, platinum: true },
  { name: 'Fluid Top-up (Brakes, Coolant)', silver: true, gold: true, platinum: true },
  { name: '24-Point Mechanical Check', silver: true, gold: true, platinum: true },
  { name: 'Battery Diagnostic Scan', silver: true, gold: true, platinum: true },
  { name: 'Full Tyre Rotation & Balance', silver: false, gold: true, platinum: true },
  { name: 'Air & Cabin Filters Replacement', silver: false, gold: true, platinum: true },
  { name: 'Brake System Deep Clean', silver: false, gold: true, platinum: true },
  { name: 'AC Efficiency Diagnostics', silver: false, gold: true, platinum: true },
  { name: 'Engine Carbon Cleanse Flush', silver: false, gold: false, platinum: true },
  { name: 'Wiper Blade Replacement', silver: false, gold: false, platinum: true },
  { name: 'Priority Lounge & Valet Towing', silver: false, gold: false, platinum: true },
];

export default function PackageComparisonPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const db = getMockDb();
    setPackages(db.packages);

    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    if (storedVehicle) { try { setVehicle(JSON.parse(storedVehicle)); } catch (e) {} }

    const storedServices = localStorage.getItem('booking_flow_services');
    if (storedServices) { try { setSelectedServices(JSON.parse(storedServices)); } catch (e) {} }

    const storedPkg = localStorage.getItem('booking_flow_package');
    if (storedPkg) {
      try {
        const parsed = JSON.parse(storedPkg);
        setSelectedPackage(parsed === 'none' ? 'none' : db.packages.find(p => p.id === parsed.id) || null);
      } catch (e) {}
    }
  }, []);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    localStorage.setItem('booking_flow_package', JSON.stringify(pkg));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow py-6">
        <div className="max-w-6xl mx-auto px-4">
          <ProgressBar currentStep={4} />

          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Comparison Table */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <Scale className="text-accent-500" size={20} /> Package Comparison
                </h1>
                <p className="text-xs text-slate-400 mt-1">Compare tiers and confirm your plan below.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="py-3.5 px-4 text-slate-600 font-bold">Plan Benefits</th>
                        {packages.map(pkg => (
                          <th key={pkg.id} className="py-3.5 px-4 font-extrabold text-slate-700 text-center">
                            <p>{pkg.name}</p>
                            <p className="text-primary-700 font-black text-sm mt-0.5">₹{pkg.price.toLocaleString('en-IN')}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {COMPARISON_ITEMS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="py-2.5 px-4 font-medium text-slate-700">{item.name}</td>
                          <td className="py-2.5 px-4 text-center">
                            {item.silver ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-300 mx-auto" />}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {item.gold ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-300 mx-auto" />}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {item.platinum ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-300 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50">
                        <td className="py-4 px-4 font-bold text-slate-700">Your Choice</td>
                        {packages.map(pkg => (
                          <td key={pkg.id} className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleSelectPackage(pkg)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                selectedPackage?.id === pkg.id
                                  ? 'bg-primary-700 border-primary-700 text-white'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              {selectedPackage?.id === pkg.id ? '✓ Selected' : 'Choose'}
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => handleSelectPackage('none')}
                className={`w-full py-3 rounded-2xl font-bold text-sm border-2 transition-all cursor-pointer flex items-center justify-center ${
                  selectedPackage === 'none'
                    ? 'border-primary-500 bg-primary-50/30 text-primary-800'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {selectedPackage === 'none' ? '✓ ' : ''}No Package — Primary Services Only
              </button>
            </div>

            {/* Bill Summary */}
            <div className="lg:col-span-1">
              <BillSummary
                vehicle={vehicle}
                selectedServices={selectedServices}
                selectedPackage={selectedPackage}
              />
            </div>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-5 mt-5">
            <button
              onClick={() => router.push('/packages')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <button
              onClick={() => router.push('/estimator')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
            >
              Continue to Estimator <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
