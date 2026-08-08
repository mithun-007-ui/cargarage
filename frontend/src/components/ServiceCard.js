'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { Clock } from 'lucide-react';

const ACCENT = {
  'oil-change':             { strip: 'from-amber-400 to-orange-300', icon: 'icon-amber' },
  'brake-service':          { strip: 'from-rose-400 to-red-300',     icon: 'icon-rose'  },
  'ac-service':             { strip: 'from-cyan-400 to-blue-300',    icon: 'icon-cyan'  },
  'battery-replacement':    { strip: 'from-violet-400 to-purple-300',icon: 'icon-violet'},
  'wheel-alignment':        { strip: 'from-rose-400 to-pink-300',    icon: 'icon-rose'  },
  'tyre-replacement':       { strip: 'from-rose-400 to-rose-300',    icon: 'icon-rose'  },
  'engine-diagnosis':       { strip: 'from-amber-400 to-yellow-300', icon: 'icon-amber' },
  'car-wash':               { strip: 'from-emerald-400 to-teal-300', icon: 'icon-emerald'},
  'interior-cleaning':      { strip: 'from-emerald-400 to-green-300',icon: 'icon-emerald'},
  'exterior-polishing':     { strip: 'from-emerald-400 to-teal-300', icon: 'icon-emerald'},
  'suspension-check':       { strip: 'from-rose-400 to-red-300',     icon: 'icon-rose'  },
  'coolant-replacement':    { strip: 'from-cyan-400 to-blue-300',    icon: 'icon-cyan'  },
  'air-filter-replacement': { strip: 'from-amber-300 to-yellow-200', icon: 'icon-amber' },
  'spark-plug-replacement': { strip: 'from-amber-400 to-orange-300', icon: 'icon-amber' },
  'general-maintenance':    { strip: 'from-blue-400 to-indigo-300',  icon: 'icon-blue'  },
};

const DEFAULT_ACCENT = { strip: 'from-orange-400 to-orange-300', icon: 'icon-orange' };

export default function ServiceCard({ service, onSelect, selected }) {
  const IconComponent = Icons[service.icon] || Icons.Wrench;
  const accent = ACCENT[service.id] || DEFAULT_ACCENT;

  return (
    <div
      onClick={() => onSelect && onSelect(service)}
      className={`rounded-2xl border-2 transition-all duration-200 flex flex-col overflow-hidden group ${
        onSelect ? 'cursor-pointer' : ''
      }`}
      style={
        selected
          ? { borderColor: '#E65313', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(230,83,19,0.12)' }
          : { background: '#FFFFFF', borderColor: '#E2D8CE' }
      }
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = '#E65313'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(230,83,19,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#E2D8CE'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; } }}
    >
      {/* Category colour strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent.strip}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent.icon}`}>
            <IconComponent size={20} />
          </div>
          <h3 className="text-base font-extrabold leading-tight" style={{ color: '#202020' }}>{service.name}</h3>
        </div>

        <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#667085' }}>{service.description}</p>

        {/* Price row */}
        <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop: '1px solid #E2D8CE' }}>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
            <Clock size={11} />
            {service.duration} min
          </div>
          <span className="text-xl font-black" style={{ color: '#E65313' }}>
            ₹{service.price?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
