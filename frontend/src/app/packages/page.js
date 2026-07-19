'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import VehicleBanner from 'src/components/VehicleBanner';
import BillSummary from 'src/components/BillSummary';
import PackageCard from 'src/components/PackageCard';
import { getMockDb } from 'src/lib/mockDb';
import { ChevronLeft, ChevronRight, Check, X, Shield } from 'lucide-react';

const COMPARISON_ITEMS = [
  { name: 'Diagnostic Health Inspection', silver: '24-Point', gold: 'Full Digital Scan', platinum: 'Priority 120-Point' },
  { name: 'Synthetic Oil & Filter Flush', silver: true, gold: true, platinum: true },
  { name: 'Fluid Top-up & Calibrations', silver: 'Standard', gold: 'Premium', platinum: 'Ultra Premium' },
  { name: 'Air & Cabin Filters Swap', silver: false, gold: true, platinum: true },
  { name: 'Tyre Balance, Rotation & Align', silver: 'Pressure Only', gold: 'Rotation & Balance', platinum: 'Full Alignment' },
  { name: 'Wiper Blade Replacement', silver: false, gold: false, platinum: true },
  { name: 'Engine Carbon Cleanse', silver: false, gold: false, platinum: true },
  { name: 'Emergency Towing Coverage', silver: false, gold: false, platinum: '1 Year Free' },
];

export default function ChoosePackagePage() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const db = getMockDb();
    setPackages(db.packages);

    const storedServices = localStorage.getItem('booking_flow_services');
    if (storedServices) { try { setSelectedServices(JSON.parse(storedServices)); } catch (e) {} }

    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    if (storedVehicle) { try { setVehicle(JSON.parse(storedVehicle)); } catch (e) {} }

    const storedPackage = localStorage.getItem('booking_flow_package');
    if (storedPackage) {
      try {
        const parsed = JSON.parse(storedPackage);
        setSelectedPackage(parsed === 'none' ? 'none' : db.packages.find(p => p.id === parsed.id) || null);
      } catch (e) {}
    }
  }, []);

  const handleContinue = () => {
    const toStore = (!selectedPackage || selectedPackage === 'none') ? 'none' : selectedPackage;
    localStorage.setItem('booking_flow_package', JSON.stringify(toStore));
    router.push('/comparison');
  };

  const renderCell = (val) => {
    if (typeof val === 'boolean') {
      return val
        ? <Check size={14} className="text-emerald-500 mx-auto" />
        : <X size={14} className="text-slate-300 mx-auto" />;
    }
    return <span className="text-[10px] text-slate-600">{val}</span>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow py-6">
        <div className="max-w-6xl mx-auto px-4">
          <ProgressBar currentStep={3} />

          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Choose a Service Package</h1>
                <p className="text-xs text-slate-400 mt-1">Add a care bundle for extra savings. You can skip this step.</p>
              </div>

              {/* Package Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selectedPackage?.id === pkg.id}
                    onSelect={setSelectedPackage}
                  />
                ))}
              </div>

              {/* No Package */}
              <button
                onClick={() => setSelectedPackage('none')}
                className={`w-full py-3 rounded-2xl font-bold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedPackage === 'none'
                    ? 'border-primary-500 bg-primary-50/30 text-primary-800'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {selectedPackage === 'none' ? '✓ ' : ''}Continue with No Package (Primary Services Only)
              </button>

              {/* Comparison Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Shield size={15} className="text-primary-600" />
                  <h2 className="text-sm font-bold text-slate-800">Package Comparison</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="py-3 px-4 font-bold text-slate-600">Feature</th>
                        <th className="py-3 px-4 font-extrabold text-slate-700 text-center">Silver<br /><span className="text-primary-700 font-black">₹1,499</span></th>
                        <th className="py-3 px-4 font-extrabold text-slate-700 text-center">Gold<br /><span className="text-primary-700 font-black">₹2,499</span></th>
                        <th className="py-3 px-4 font-extrabold text-slate-700 text-center">Platinum<br /><span className="text-primary-700 font-black">₹3,999</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {COMPARISON_ITEMS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="py-2.5 px-4 text-slate-700 font-medium">{item.name}</td>
                          <td className="py-2.5 px-4 text-center">{renderCell(item.silver)}</td>
                          <td className="py-2.5 px-4 text-center">{renderCell(item.gold)}</td>
                          <td className="py-2.5 px-4 text-center">{renderCell(item.platinum)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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

          {/* Navigation */}
          <div className="border-t border-slate-200 pt-5 mt-5 flex justify-between">
            <button
              onClick={() => router.push('/services')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <button
              onClick={handleContinue}
              className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
            >
              Continue to Comparison <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
