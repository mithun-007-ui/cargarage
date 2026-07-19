'use client';

import React, { useState, useEffect } from 'react';
import { getMockDb } from 'src/lib/mockDb';
import { Package, Check, Plus } from 'lucide-react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const db = getMockDb();
    setPackages(db.packages);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="text-accent-500" />
            Service Packages Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure Silver, Gold, and Platinum maintenance bundle structures and discount packages.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/10 cursor-pointer">
          <Plus size={14} />
          Create Care Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-extrabold text-slate-800">{pkg.name}</h3>
                <span className="text-sm font-black text-primary-800">${pkg.price}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{pkg.description}</p>
              
              <ul className="space-y-2 mb-6">
                {pkg.features.map((ft, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-650">
                    <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
              Edit Package Structure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
