'use client';

import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

export default function PackageCard({ pkg, onSelect, selected }) {
  const isPlatinum = pkg.id === 'platinum-care';
  
  return (
    <div
      onClick={() => onSelect && onSelect(pkg)}
      className={`relative bg-white rounded-2xl p-8 border shadow-sm transition-all duration-300 flex flex-col justify-between h-full group ${
        onSelect ? 'cursor-pointer hover:scale-[1.02]' : ''
      } ${
        selected
          ? 'border-primary-600 ring-2 ring-primary-500/20 bg-primary-50/10'
          : isPlatinum
          ? 'border-accent-100 shadow-md hover:shadow-lg hover:border-accent-200'
          : 'border-slate-100 hover:shadow-md hover:border-slate-200'
      }`}
    >
      {isPlatinum && (
        <div className="absolute -top-3 right-6 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
          <ShieldCheck size={12} />
          Recommended
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
        <p className="text-sm text-slate-400 mb-6">{pkg.description}</p>

        <div className="mb-6 flex items-baseline">
          <span className="text-4xl font-extrabold text-primary-800">₹{pkg.price}</span>
          <span className="text-slate-400 text-xs font-semibold ml-2">/ service bundle</span>
        </div>

        <ul className="space-y-3 mb-8">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className="bg-emerald-50 text-emerald-600 p-0.5 rounded-full mt-0.5 shrink-0">
                <Check size={12} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={(e) => {
          if (onSelect) {
            e.stopPropagation();
            onSelect(pkg);
          }
        }}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
          selected
            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/10'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
        }`}
      >
        {selected ? 'Package Selected' : 'Choose Package'}
      </button>
    </div>
  );
}
