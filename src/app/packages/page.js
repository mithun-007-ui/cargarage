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
import { ChevronLeft, ChevronRight, Check, X, Shield, Star } from 'lucide-react';

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
        ? <Check size={15} className="text-green-600 mx-auto" strokeWidth={3} />
        : <X size={15} className="text-gray-300 mx-auto" />;
    }
    return <span className="text-xs text-gray-700 font-semibold">{val}</span>;
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />
      <main className="flex-grow py-6 md:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

          {vehicle && <ProgressBar currentStep={3} />}

          {/* Page Header */}
          <div className="mb-8 mt-2">
            <span className="section-label">Step 3 of 6 · Package Selection</span>
            <h1 className="text-2xl md:text-3xl font-black mt-1 tracking-tight flex items-center gap-2.5" style={{ color: '#202020' }}>
              <div className="w-9 h-9 rounded-xl icon-orange flex items-center justify-center shrink-0">
                <Shield size={18} />
              </div>
              Compare Care Packages
            </h1>
            <p className="text-[#667085] text-sm mt-1.5 max-w-lg">
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
                className="w-full py-4 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                style={selectedPackage === 'none'
                  ? { borderColor: '#E65313', background: '#FFF3EE', color: '#E65313' }
                  : { background: '#FFFFFF', borderColor: '#E2D8CE', color: '#667085' }}
              >
                {selectedPackage === 'none' ? '✓ ' : ''}Continue with No Package (Services Only)
              </button>

              {/* Comparison table */}
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}>
                <div className="px-5 py-4 flex items-center gap-2.5" style={{ background: '#F8F5F0', borderBottom: '1px solid #E2D8CE' }}>
                  <Star size={14} style={{ color: '#E65313' }} fill="currentColor" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#202020]">Features Comparison Matrix</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr style={{ background: '#FFFFFF', borderBottom: '1px solid #E2D8CE' }}>
                        <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-xs" style={{ color: '#667085' }}>Feature</th>
                        <th className="py-3.5 px-5 font-black text-center" style={{ color: '#64748B' }}>Silver<br /><span className="text-xs font-normal" style={{ color: '#94A3B8' }}>₹1,499</span></th>
                        <th className="py-3.5 px-5 font-black text-center" style={{ color: '#D97706' }}>Gold<br /><span className="text-xs font-normal" style={{ color: '#F59E0B' }}>₹2,499</span></th>
                        <th className="py-3.5 px-5 font-black text-center" style={{ color: '#7C3AED' }}>Platinum<br /><span className="text-xs font-normal" style={{ color: '#A78BFA' }}>₹3,999</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D8CE]">
                      {COMPARISON_ITEMS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F5F0]/50 transition-colors">
                          <td className="py-3.5 px-5 font-semibold" style={{ color: '#202020' }}>{item.name}</td>
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
            <div className="divider mt-8 pt-6 flex justify-between">
              <button
                onClick={() => router.push('/services')}
                className="btn-outline text-sm"
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
