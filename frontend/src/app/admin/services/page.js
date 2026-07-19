'use client';

import React, { useState, useEffect } from 'react';
import { getMockDb } from 'src/lib/mockDb';
import { Wrench, Plus, CircleDollarSign } from 'lucide-react';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const db = getMockDb();
    setServices(db.services);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Wrench className="text-accent-500" />
            Service Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Add, update, or remove repair services and modify default labor pricing.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/10 cursor-pointer">
          <Plus size={14} />
          Create Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((sv) => (
          <div key={sv.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex justify-between items-start gap-4">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800">{sv.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{sv.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block mb-1">Base Price</span>
              <span className="text-lg font-black text-primary-800">${sv.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
