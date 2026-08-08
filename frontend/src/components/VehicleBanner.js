'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, Fuel, Calendar, Edit2 } from 'lucide-react';

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

const BRAND_ABBR = {
  'Toyota': 'TY', 'Hyundai': 'HY', 'Honda': 'HO', 'Maruti Suzuki': 'MS',
  'Tata': 'TA', 'Mahindra': 'MH', 'Kia': 'KI', 'MG': 'MG',
  'Volkswagen': 'VW', 'Skoda': 'SK', 'Renault': 'RN', 'Nissan': 'NS',
  'BMW': 'BMW', 'Mercedes-Benz': 'MB', 'Audi': 'AU',
};

function BrandBadge({ make, size = 'md' }) {
  const color = BRAND_COLORS[make] || { bg: '#E65313', text: '#fff' };
  const abbr = BRAND_ABBR[make] || (make ? make.slice(0, 2).toUpperCase() : 'XX');
  const dim = size === 'sm' ? 'w-8 h-8 text-[9px]' : 'w-10 h-10 text-[10px]';
  return (
    <div
      className={`${dim} rounded-lg flex items-center justify-center font-extrabold tracking-widest shrink-0`}
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
      <div
        className="rounded-xl px-4 py-3 flex items-center justify-between"
        style={{ background: '#FFFFFF', border: '1px solid #E2D8CE', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <BrandBadge make={vehicle.make} size="sm" />
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-extrabold" style={{ color: '#202020' }}>{vehicle.make} {vehicle.model}</span>
            <span style={{ color: '#E2D8CE' }}>•</span>
            <span style={{ color: '#667085' }}>{vehicle.year}</span>
            <span style={{ color: '#E2D8CE' }}>•</span>
            <span style={{ color: '#667085' }}>{vehicle.fuelType}</span>
            {vehicle.transmission && (
              <>
                <span style={{ color: '#E2D8CE' }}>•</span>
                <span style={{ color: '#667085' }}>{vehicle.transmission}</span>
              </>
            )}
            {vehicle.color && (
              <>
                <span style={{ color: '#E2D8CE' }}>•</span>
                <span style={{ color: '#667085' }}>{vehicle.color}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push('/vehicle-selection')}
          className="text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors shrink-0 ml-2 hover:opacity-80"
          style={{ color: '#E65313' }}
        >
          <Edit2 size={11} /> Edit
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 flex items-center justify-between"
      style={{ background: '#211F1D', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-4">
        <BrandBadge make={vehicle.make} size="lg" />
        <div>
          <h3 className="text-white font-extrabold text-base">{vehicle.make} {vehicle.model}</h3>
          <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap" style={{ color: '#9CA3AF' }}>
            <span className="flex items-center gap-1"><Calendar size={10} />{vehicle.year}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Fuel size={10} />{vehicle.fuelType}</span>
            {vehicle.transmission && <><span>•</span><span>{vehicle.transmission}</span></>}
            {vehicle.color && <><span>•</span><span>{vehicle.color}</span></>}
          </div>
        </div>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-[10px] font-bold uppercase" style={{ color: '#6B7280' }}>Reg. No.</p>
        <p className="text-white font-mono font-bold text-sm">{vehicle.plateNumber}</p>
      </div>
    </div>
  );
}
