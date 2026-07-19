'use client';

import React from 'react';
import { Car, Search, Filter, Plus } from 'lucide-react';

export default function AdminVehiclesPage() {
  const dummyVehicles = [
    { make: 'Tesla', model: 'Model Y', year: '2022', plateNumber: 'CA-888-XX', owner: 'John Doe' },
    { make: 'BMW', model: 'M3', year: '2021', plateNumber: 'NY-777-YY', owner: 'Sarah Jenkins' },
    { make: 'Ford', model: 'F-150', year: '2019', plateNumber: 'TX-444-ZZ', owner: 'Michael Chang' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Car className="text-accent-500" />
            Vehicle Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">Audit customer vehicle profiles, inspection records, and history notes.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/10 cursor-pointer">
          <Plus size={14} />
          Register Vehicle
        </button>
      </div>

      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            placeholder="Search vehicles by owner, plate, or model..."
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plate Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Model Year</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Owner Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dummyVehicles.map((vh, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-800">{vh.make} {vh.model}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{vh.plateNumber}</td>
                  <td className="px-6 py-4 text-slate-500">{vh.year}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary-700">{vh.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
