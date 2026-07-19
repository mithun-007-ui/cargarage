'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { getMockDb } from 'src/lib/mockDb';
import { Check, X, ChevronLeft, ChevronRight, Scale } from 'lucide-react';

export default function PackageComparisonPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const db = getMockDb();
    setPackages(db.packages);

    const storedPkg = localStorage.getItem('booking_flow_package');
    if (storedPkg) {
      try {
        const parsed = JSON.parse(storedPkg);
        setSelectedPackage(parsed === 'none' ? 'none' : db.packages.find(p => p.id === parsed.id) || null);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    localStorage.setItem('booking_flow_package', JSON.stringify(pkg));
  };

  const handleContinue = () => {
    router.push('/estimator');
  };

  const comparisonItems = [
    { name: 'Synthetic Oil & Filter Replacement', silver: true, gold: true, platinum: true },
    { name: 'Fluid Top-up (Brakes, Coolant)', silver: true, gold: true, platinum: true },
    { name: '24-Point Mechanical Check', silver: true, gold: true, platinum: true },
    { name: 'Battery Diagnostic Scan', silver: true, gold: true, platinum: true },
    { name: 'Full Tyre Rotation & Balance', silver: false, gold: true, platinum: true },
    { name: 'Air & Cabin Filters Replacement', silver: false, gold: true, platinum: true },
    { name: 'Brake System Deep Clean', silver: false, gold: true, platinum: true },
    { name: 'AC Efficiency Diagnostics', silver: false, gold: true, platinum: true },
    { name: 'Engine Carbon Cleanse Flush', silver: false, false: false, platinum: true },
    { name: 'Wiper Blade Replacement', silver: false, false: false, platinum: true },
    { name: 'Priority Lounge & Valet Towing', silver: false, false: false, platinum: true },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
              <Scale className="text-accent-500" />
              Package Comparison Matrix
            </h1>
            <p className="text-sm text-slate-400 mt-2">Evaluate specific differences between care tiers and select the plan that fits your drive.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 md:p-8 mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-4 text-slate-650 font-bold">Plan Benefits</th>
                    <th className="py-4 px-4 font-extrabold text-slate-700 text-center">
                      <p>Silver Care</p>
                      <p className="text-sm text-primary-800 font-black mt-1">$149</p>
                    </th>
                    <th className="py-4 px-4 font-extrabold text-slate-700 text-center">
                      <p>Gold Care</p>
                      <p className="text-sm text-primary-800 font-black mt-1">$249</p>
                    </th>
                    <th className="py-4 px-4 font-extrabold text-slate-700 text-center">
                      <p>Platinum Care</p>
                      <p className="text-sm text-primary-800 font-black mt-1">$399</p>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {comparisonItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      <td className="py-3 px-4 font-medium text-slate-700">{item.name}</td>
                      <td className="py-3 px-4 text-center">
                        {item.silver ? <Check size={16} className="text-emerald-500 mx-auto" /> : <X size={16} className="text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.gold ? <Check size={16} className="text-emerald-500 mx-auto" /> : <X size={16} className="text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.platinum ? <Check size={16} className="text-emerald-500 mx-auto" /> : <X size={16} className="text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Radio pickers */}
                  <tr>
                    <td className="py-4 px-4 font-bold text-slate-700">Selection Choice</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleSelectPackage(pkg)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            selectedPackage?.id === pkg.id
                              ? 'bg-primary-800 border-primary-800 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {selectedPackage?.id === pkg.id ? 'Selected' : 'Choose Plan'}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <button
              onClick={() => handleSelectPackage('none')}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs border transition-colors cursor-pointer flex items-center justify-center shadow-sm ${
                selectedPackage === 'none'
                  ? 'border-primary-600 bg-primary-50/20 text-primary-800'
                  : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
              }`}
            >
              Continue with No Package Plan (Primary Service Only)
            </button>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-6">
            <button
              onClick={() => router.push('/packages')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleContinue}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
            >
              Continue to Estimator
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
