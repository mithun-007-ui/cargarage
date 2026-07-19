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
import { ChevronLeft, ChevronRight, Check, X, Shield, Star, AlertCircle } from 'lucide-react';

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
    if (!vehicle) router.push('/vehicle-selection');
    else router.push('/comparison');
  };

  const renderCell = (val) => {
    if (typeof val === 'boolean') {
      return val
        ? <Check size={15} className="text-emerald-400 mx-auto" strokeWidth={3} />
        : <X size={15} className="text-slate-600 mx-auto" />;
    }
    return <span className="text-xs text-slate-300 font-semibold">{val}</span>;
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'linear-gradient(180deg, #0d1220 0%, #060912 100%)' }}>
      <Navbar />
      <main className="flex-grow py-6 md:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

          {vehicle && <ProgressBar currentStep={3} />}

          {/* Page Header */}
          <div className="mb-8 mt-2">
            <span className="section-label">Step 3 of 6 · Package Selection</span>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl icon-violet flex items-center justify-center shrink-0">
                <Shield size={18} />
              </div>
              Compare Care Packages
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-lg">
              Select a bundled care package to save up to 25% on combined service fees. Or continue with individual services only.
            </p>
          </div>

          {vehicle && (
            <div className="mb-6">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">

              {/* Package Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {packages.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selectedPackage?.id === pkg.id}
                    onSelect={setSelectedPackage}
                  />
                ))}
              </div>

              {/* No Package option */}
              <button
                onClick={() => setSelectedPackage('none')}
                className={`w-full py-4 rounded-2xl font-bold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedPackage === 'none'
                    ? 'border-primary-600 bg-primary-600/10 text-primary-300'
                    : 'bg-[#111827] border-[#1e2d45] text-slate-400 hover:border-[#253558] hover:text-slate-200'
                }`}
              >
                {selectedPackage === 'none' ? '✓ ' : ''}Continue with No Package (Services Only)
              </button>

              {/* Comparison table */}
              <div className="bg-[#111827] rounded-3xl border border-[#1e2d45] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1e2d45] flex items-center gap-2.5" style={{ background: 'linear-gradient(90deg, #141f33, #111827)' }}>
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Features Comparison Matrix</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#1e2d45]" style={{ background: 'linear-gradient(90deg, #141f33, #111827)' }}>
                        <th className="py-3.5 px-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Feature</th>
                        <th className="py-3.5 px-5 font-black text-slate-300 text-center">Silver<br /><span className="text-slate-500 text-xs font-normal">₹1,499</span></th>
                        <th className="py-3.5 px-5 font-black text-amber-300 text-center">Gold<br /><span className="text-amber-500/70 text-xs font-normal">₹2,499</span></th>
                        <th className="py-3.5 px-5 font-black text-violet-300 text-center">Platinum<br /><span className="text-violet-500/70 text-xs font-normal">₹3,999</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d45]">
                      {COMPARISON_ITEMS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/2 transition-colors">
                          <td className="py-3.5 px-5 text-slate-300 font-semibold">{item.name}</td>
                          <td className="py-3.5 px-5 text-center">{renderCell(item.silver)}</td>
                          <td className="py-3.5 px-5 text-center">{renderCell(item.gold)}</td>
                          <td className="py-3.5 px-5 text-center">{renderCell(item.platinum)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <BillSummary
                  vehicle={vehicle}
                  selectedServices={selectedServices}
                  selectedPackage={selectedPackage}
                  isPublic={!vehicle}
                  onActionClick={handleContinue}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          {vehicle && (
            <div className="divider-dark mt-8 pt-6 flex justify-between">
              <button
                onClick={() => router.push('/services')}
                className="border border-[#1e2d45] text-slate-400 hover:bg-[#111827] hover:text-white px-5 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer min-h-[48px]"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleContinue} className="btn-primary text-sm">
                Continue to Comparison <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
