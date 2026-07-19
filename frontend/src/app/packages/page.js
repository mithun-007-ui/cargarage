'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import PackageCard from 'src/components/PackageCard';
import { getMockDb } from 'src/lib/mockDb';
import { ChevronLeft, ChevronRight, Check, X, ShieldAlert } from 'lucide-react';

export default function ChoosePackagePage() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [service, setService] = useState(null);

  useEffect(() => {
    const db = getMockDb();
    setPackages(db.packages);

    // Retrieve selected service
    const storedService = localStorage.getItem('booking_flow_service');
    if (storedService) {
      try {
        setService(JSON.parse(storedService));
      } catch (e) {
        console.error(e);
      }
    }

    // Retrieve previous selected package if any
    const storedPackage = localStorage.getItem('booking_flow_package');
    if (storedPackage) {
      try {
        const parsedPkg = JSON.parse(storedPackage);
        if (parsedPkg === 'none') {
          setSelectedPackage('none');
        } else {
          setSelectedPackage(db.packages.find(p => p.id === parsedPkg.id) || null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleContinue = () => {
    if (!selectedPackage) {
      // Default to none if not selected
      localStorage.setItem('booking_flow_package', JSON.stringify('none'));
    } else if (selectedPackage === 'none') {
      localStorage.setItem('booking_flow_package', JSON.stringify('none'));
    } else {
      localStorage.setItem('booking_flow_package', JSON.stringify(selectedPackage));
    }
    
    // Redirect to Estimator
    router.push('/estimator');
  };

  // Matrix Comparison data
  const comparisonItems = [
    { name: 'Diagnostic Health Inspection', silver: '24-Point', gold: 'Full Digital Scan', platinum: 'Priority 120-Point' },
    { name: 'Synthetic Oil & Filter Flush', silver: true, gold: true, platinum: true },
    { name: 'Fluid Top-up & Calibrations', silver: 'Standard', gold: 'Premium', platinum: 'Ultra Premium' },
    { name: 'Air & Cabin Filters Swap', silver: false, gold: true, platinum: true },
    { name: 'Tire Balance, Rotation & Align', silver: 'Pressure Only', gold: 'Rotation & Balance', platinum: 'Rotation, Balance & Alignment' },
    { name: 'Wiper Blade Replacement', silver: false, gold: false, platinum: true },
    { name: 'Engine Carbon Cleanse', silver: false, gold: false, platinum: true },
    { name: 'Emergency Towing Coverage', silver: false, gold: false, platinum: '1 Year Free' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider max-w-3xl mx-auto">
            <span className="text-emerald-600 font-medium">✓ 1. Vehicle</span>
            <span className="text-emerald-600 font-medium">✓ 2. Services</span>
            <span className="text-primary-600 border-b-2 border-primary-600 pb-1">3. Packages Selection</span>
            <span className="text-slate-300">4. Estimate & Book</span>
          </div>

          <div className="text-center mb-10 max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Upgrade Your Service Bundle</h1>
            <p className="text-sm text-slate-400 mt-2">Combine your primary maintenance service with one of our value-packed care plans.</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                selected={selectedPackage?.id === pkg.id}
                onSelect={handleSelectPackage}
              />
            ))}
          </div>

          {/* Option for No Package */}
          <div className="max-w-md mx-auto mb-16">
            <button
              onClick={() => handleSelectPackage('none')}
              className={`w-full py-4 rounded-2xl font-bold text-sm border transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                selectedPackage === 'none'
                  ? 'border-primary-600 bg-primary-50/20 text-primary-800'
                  : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-800'
              }`}
            >
              Continue with No Package (Primary Service Only)
            </button>
          </div>

          {/* Comparison Matrix */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl mx-auto p-6 md:p-8 mb-12">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Compare Package Specifications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-3 px-4 font-bold text-slate-600">Features Included</th>
                    <th className="py-3 px-4 font-bold text-primary-800">Silver Care</th>
                    <th className="py-3 px-4 font-bold text-primary-800">Gold Care</th>
                    <th className="py-3 px-4 font-bold text-primary-800">Platinum Care</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {typeof item.silver === 'boolean' ? (
                          item.silver ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-300" />
                        ) : item.silver}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {typeof item.gold === 'boolean' ? (
                          item.gold ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-300" />
                        ) : item.gold}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {typeof item.platinum === 'boolean' ? (
                          item.platinum ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-300" />
                        ) : item.platinum}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-slate-200 pt-6 flex justify-between max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/services')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            
            <button
              onClick={handleContinue}
              className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
            >
              Continue to Estimation
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
