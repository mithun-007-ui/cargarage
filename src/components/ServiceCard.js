'use client';

import React from 'react';
import * as Icons from 'lucide-react';

export default function ServiceCard({ service, onSelect, selected }) {
  // Dynamically resolve icon from Lucide React
  const IconComponent = Icons[service.icon] || Icons.Wrench;

  return (
    <div
      onClick={() => onSelect && onSelect(service)}
      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 flex flex-col justify-between h-full group ${
        onSelect ? 'cursor-pointer hover:scale-[1.02]' : ''
      } ${
        selected
          ? 'border-primary-600 ring-2 ring-primary-500/25 bg-primary-50/20'
          : 'border-slate-100 hover:shadow-md hover:border-slate-200'
      }`}
    >
      <div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
            selected
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
              : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
          }`}
        >
          <IconComponent size={24} />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">{service.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{service.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
        <span className="text-sm font-semibold text-slate-400">Base Price</span>
        <span className="text-xl font-extrabold text-primary-800">₹{service.price}</span>
      </div>
    </div>
  );
}
