'use client';

import React from 'react';
import { Clock, Check, Plus, Settings } from 'lucide-react';

export default function AdminSlotsPage() {
  const timeSlots = [
    { time: '08:00 AM', status: 'Active', capacity: 3, booked: 1 },
    { time: '09:00 AM', status: 'Active', capacity: 3, booked: 2 },
    { time: '10:00 AM', status: 'Active', capacity: 3, booked: 3 },
    { time: '11:00 AM', status: 'Active', capacity: 3, booked: 2 },
    { time: '01:00 PM', status: 'Active', capacity: 3, booked: 0 },
    { time: '02:00 PM', status: 'Active', capacity: 3, booked: 1 },
    { time: '03:00 PM', status: 'Active', capacity: 3, booked: 1 },
    { time: '04:00 PM', status: 'Active', capacity: 3, booked: 0 },
    { time: '05:00 PM', status: 'Active', capacity: 3, booked: 0 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Clock className="text-accent-500" />
            Slot & Schedule Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure service bay hours, daily capacity thresholds, and override scheduling conflicts.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/10 cursor-pointer">
          <Plus size={14} />
          Create Time Slot
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {timeSlots.map((slot, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-xs">{slot.time}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded">
                {slot.status}
              </span>
            </div>
            
            <div className="text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Slots Booked:</span>
                <span className="font-bold text-slate-800">{slot.booked} / {slot.capacity}</span>
              </div>
              <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${slot.booked === slot.capacity ? 'bg-red-500' : 'bg-primary-600'}`} 
                  style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
