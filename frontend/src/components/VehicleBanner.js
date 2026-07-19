'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Fuel, Calendar, Edit2 } from 'lucide-react';

// Brand color map for pill avatars
const BRAND_COLORS = {
  'Toyota': { bg: '#CC0000', text: '#fff' },
  'Hyundai': { bg: '#002C5F', text: '#fff' },
  'Honda': { bg: '#CC0000', text: '#fff' },
  'Maruti Suzuki': { bg: '#0075BF', text: '#fff' },
  'Tata': { bg: '#003366', text: '#fff' },
  'Mahindra': { bg: '#E4002B', text: '#fff' },
  'Kia': { bg: '#BB162B', text: '#fff' },
  'MG': { bg: '#C8102E', text: '#fff' },
  'Volkswagen': { bg: '#001E50', text: '#fff' },
  'Skoda': { bg: '#4BA82E', text: '#fff' },
  'Renault': { bg: '#EFDF00', text: '#333' },
  'Nissan': { bg: '#C3002F', text: '#fff' },
  'BMW': { bg: '#0066B2', text: '#fff' },
  'Mercedes-Benz': { bg: '#222222', text: '#fff' },
  'Audi': { bg: '#BB0000', text: '#fff' },
};

// Short abbreviations for brand logos
const BRAND_ABBR = {
  'Toyota': 'TY',
  'Hyundai': 'HY',
  'Honda': 'HO',
  'Maruti Suzuki': 'MS',
  'Tata': 'TA',
  'Mahindra': 'MH',
  'Kia': 'KI',
  'MG': 'MG',
  'Volkswagen': 'VW',
  'Skoda': 'SK',
  'Renault': 'RN',
  'Nissan': 'NS',
  'BMW': 'BMW',
  'Mercedes-Benz': 'MB',
  'Audi': 'AU',
};

function BrandBadge({ make, size = 'md' }) {
  const color = BRAND_COLORS[make] || { bg: '#1e40af', text: '#fff' };
  const abbr = BRAND_ABBR[make] || (make ? make.slice(0, 2).toUpperCase() : 'XX');
  const dim = size === 'sm' ? 'w-8 h-8 text-[9px]' : 'w-12 h-12 text-[11px]';
  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center font-extrabold tracking-widest border border-white/10 shrink-0`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {abbr}
    </div>
  );
}

export default function VehicleBanner({ vehicle, compact = false }) {
  const router = useRouter();
  if (!vehicle) return null;

  if (compact) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <BrandBadge make={vehicle.make} size="sm" />
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-extrabold text-slate-800">{vehicle.make} {vehicle.model}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{vehicle.year}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{vehicle.fuelType}</span>
            {vehicle.transmission && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{vehicle.transmission}</span>
              </>
            )}
            {vehicle.color && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{vehicle.color}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push('/vehicle-selection')}
          className="text-primary-600 hover:text-primary-700 text-xs font-bold cursor-pointer flex items-center gap-1 hover:underline transition-colors shrink-0 ml-2"
        >
          <Edit2 size={11} /> Edit Vehicle
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-4 flex items-center justify-between shadow-md shadow-primary-800/10">
      <div className="flex items-center gap-4">
        <BrandBadge make={vehicle.make} size="lg" />
        <div>
          <h3 className="text-white font-extrabold text-base">{vehicle.make} {vehicle.model}</h3>
          <div className="flex items-center gap-2 text-primary-200 text-xs mt-0.5 flex-wrap">
            <span className="flex items-center gap-1"><Calendar size={10} />{vehicle.year}</span>
            <span className="text-primary-300/50">•</span>
            <span className="flex items-center gap-1"><Fuel size={10} />{vehicle.fuelType}</span>
            {vehicle.transmission && (
              <>
                <span className="text-primary-300/50">•</span>
                <span>{vehicle.transmission}</span>
              </>
            )}
            {vehicle.color && (
              <>
                <span className="text-primary-300/50">•</span>
                <span>{vehicle.color}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-primary-200 text-[10px] font-bold uppercase">Reg. No.</p>
        <p className="text-white font-mono font-bold text-sm">{vehicle.plateNumber}</p>
      </div>
    </div>
  );
}
