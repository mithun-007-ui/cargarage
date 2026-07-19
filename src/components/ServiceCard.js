'use client';

import React from 'react';
import * as Icons from 'lucide-react';

// Map service IDs to accent colours
const ACCENT = {
  'oil-change':              { strip: 'from-amber-500 to-orange-400',  icon: 'icon-amber',   price: 'text-amber-300'  },
  'brake-service':           { strip: 'from-rose-500 to-red-400',      icon: 'icon-rose',    price: 'text-rose-300'   },
  'ac-service':              { strip: 'from-cyan-500 to-blue-400',      icon: 'icon-cyan',    price: 'text-cyan-300'   },
  'battery-replacement':     { strip: 'from-violet-500 to-purple-400', icon: 'icon-violet',  price: 'text-violet-300' },
  'wheel-alignment':         { strip: 'from-rose-500 to-pink-400',     icon: 'icon-rose',    price: 'text-rose-300'   },
  'tyre-replacement':        { strip: 'from-rose-500 to-rose-400',     icon: 'icon-rose',    price: 'text-rose-300'   },
  'engine-diagnosis':        { strip: 'from-amber-500 to-yellow-400',  icon: 'icon-amber',   price: 'text-amber-300'  },
  'car-wash':                { strip: 'from-emerald-500 to-teal-400',  icon: 'icon-emerald', price: 'text-emerald-300'},
  'interior-cleaning':       { strip: 'from-emerald-500 to-green-400', icon: 'icon-emerald', price: 'text-emerald-300'},
  'exterior-polishing':      { strip: 'from-emerald-500 to-teal-400',  icon: 'icon-emerald', price: 'text-emerald-300'},
  'suspension-check':        { strip: 'from-rose-500 to-red-400',      icon: 'icon-rose',    price: 'text-rose-300'   },
  'coolant-replacement':     { strip: 'from-cyan-500 to-blue-400',     icon: 'icon-cyan',    price: 'text-cyan-300'   },
  'air-filter-replacement':  { strip: 'from-amber-400 to-yellow-300',  icon: 'icon-amber',   price: 'text-amber-300'  },
  'spark-plug-replacement':  { strip: 'from-amber-500 to-orange-300',  icon: 'icon-amber',   price: 'text-amber-300'  },
  'general-maintenance':     { strip: 'from-blue-500 to-primary-400',  icon: 'icon-blue',    price: 'text-blue-300'   },
};

const DEFAULT_ACCENT = { strip: 'from-primary-500 to-primary-400', icon: 'icon-blue', price: 'text-primary-300' };

export default function ServiceCard({ service, onSelect, selected }) {
  const IconComponent = Icons[service.icon] || Icons.Wrench;
  const accent = ACCENT[service.id] || DEFAULT_ACCENT;

  return (
    <div
      onClick={() => onSelect && onSelect(service)}
      className={`rounded-2xl border-2 transition-all duration-250 flex flex-col overflow-hidden group ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-primary-600 bg-[#0d1731] shadow-xl shadow-primary-900/30'
          : 'bg-[#111827] border-[#1e2d45] hover:border-[#253558] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
      }`}
    >
      {/* Category colour strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent.strip} ${selected ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'} transition-opacity`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${accent.icon}`}>
            <IconComponent size={22} />
          </div>
          <h3 className="text-base font-extrabold text-white leading-tight">{service.name}</h3>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-5">{service.description}</p>

        {/* Price row */}
        <div className="flex items-center justify-between border-t border-[#1e2d45] pt-4 mt-auto">
          <span className="text-xs font-semibold text-slate-500">Base Price</span>
          <span className={`text-xl font-black ${accent.price}`}>
            ₹{service.price?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
