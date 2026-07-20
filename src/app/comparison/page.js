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
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />
      <main className="flex-grow py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <ProgressBar currentStep={4} />

          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Comparison Table */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                  <Scale className="text-orange-500" size={20} style={{ color: '#E65313' }} /> Package Comparison
                </h1>
                <p className="text-xs text-gray-500 mt-1">Compare tiers and confirm your plan below.</p>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E2D8CE' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: '#E2D8CE', background: '#F8F5F0' }}>
                        <th className="py-3.5 px-4 font-bold text-gray-600">Plan Benefits</th>
                        {packages.map(pkg => (
                          <th key={pkg.id} className="py-3.5 px-4 font-extrabold text-gray-700 text-center">
                            <p>{pkg.name}</p>
                            <p className="font-black text-sm mt-0.5" style={{ color: '#E65313' }}>₹{pkg.price.toLocaleString('en-IN')}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#E2D8CE' }}>
                      {COMPARISON_ITEMS.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-4 font-medium text-gray-800">{item.name}</td>
                          <td className="py-2.5 px-4 text-center">
                            {item.silver ? <Check size={14} className="text-green-600 mx-auto" /> : <X size={14} className="text-gray-300 mx-auto" />}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {item.gold ? <Check size={14} className="text-green-600 mx-auto" /> : <X size={14} className="text-gray-300 mx-auto" />}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {item.platinum ? <Check size={14} className="text-green-600 mx-auto" /> : <X size={14} className="text-gray-300 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50/30">
                        <td className="py-4 px-4 font-bold text-gray-800">Your Choice</td>
                        {packages.map(pkg => (
                          <td key={pkg.id} className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleSelectPackage(pkg)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                              style={
                                selectedPackage?.id === pkg.id
                                  ? { background: '#E65313', borderColor: '#E65313', color: '#FFFFFF' }
                                  : { background: '#FFFFFF', borderColor: '#E2D8CE', color: '#667085' }
                              }
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
                className="w-full py-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer flex items-center justify-center"
                style={
                  selectedPackage === 'none'
                    ? { borderColor: '#E65313', background: '#FFF3EE', color: '#E65313' }
                    : { background: '#FFFFFF', borderColor: '#E2D8CE', color: '#667085' }
                }
              >
                {selectedPackage === 'none' ? '✓ ' : ''}No Package — Primary Services Only
              </button>
            </div>

            {/* Bill Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <BillSummary
                  vehicle={vehicle}
                  selectedServices={selectedServices}
                  selectedPackage={selectedPackage}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t pt-5 mt-5" style={{ borderColor: '#E2D8CE' }}>
            <button
              onClick={() => router.push('/packages')}
              className="btn-outline text-sm"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <button
              onClick={() => router.push('/estimator')}
              className="btn-primary text-sm"
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
