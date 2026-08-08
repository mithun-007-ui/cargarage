'use client';

import React from 'react';
import { Check, Zap, Star, Award } from 'lucide-react';

const PACKAGE_STYLES = {
  'silver-care': {
    strip: 'from-slate-300 to-gray-400',
    accentColor: '#64748B',
    badge: null,
    icon: <Zap size={16} style={{ color: '#64748B' }} />,
    iconBg: '#F1F5F9',
    iconBorder: '#CBD5E1',
    priceCls: '#64748B',
    selectedBorder: '#64748B',
    selectedBg: '#F8FAFC',
    checkBg: '#F1F5F9',
    checkColor: '#64748B',
  },
  'gold-care': {
    strip: 'from-amber-400 to-yellow-400',
    accentColor: '#D97706',
    badge: null,
    icon: <Star size={16} style={{ color: '#D97706' }} fill="currentColor" />,
    iconBg: '#FFFBEB',
    iconBorder: '#FDE68A',
    priceCls: '#D97706',
    selectedBorder: '#D97706',
    selectedBg: '#FFFDF0',
    checkBg: '#FFFBEB',
    checkColor: '#D97706',
  },
  'platinum-care': {
    strip: 'from-violet-500 to-purple-400',
    accentColor: '#7C3AED',
    badge: 'BEST VALUE',
    icon: <Award size={16} style={{ color: '#7C3AED' }} />,
    iconBg: '#F5F3FF',
    iconBorder: '#DDD6FE',
    priceCls: '#7C3AED',
    selectedBorder: '#7C3AED',
    selectedBg: '#FAF8FF',
    checkBg: '#F5F3FF',
    checkColor: '#7C3AED',
  },
};

export default function PackageCard({ pkg, onSelect, selected }) {
  const style = PACKAGE_STYLES[pkg.id] || PACKAGE_STYLES['silver-care'];

  return (
    <div
      onClick={() => onSelect && onSelect(pkg)}
      className={`relative rounded-2xl border-2 transition-all duration-200 flex flex-col overflow-hidden h-full ${
        onSelect ? 'cursor-pointer' : ''
      }`}
      style={
        selected
          ? { borderColor: style.selectedBorder, background: style.selectedBg, boxShadow: `0 4px 20px ${style.selectedBorder}20` }
          : { background: '#FFFFFF', borderColor: '#E2D8CE' }
      }
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = style.accentColor; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${style.accentColor}15`; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#E2D8CE'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } }}
    >
      {/* Colour strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.strip}`} />

      {/* Best value badge */}
      {style.badge && (
        <div
          className="absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ background: style.iconBg, color: style.accentColor, border: `1px solid ${style.iconBorder}` }}
        >
          {style.badge}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
            style={{ background: style.iconBg, borderColor: style.iconBorder }}
          >
            {style.icon}
          </div>
          <h3 className="text-lg font-extrabold" style={{ color: '#202020' }}>{pkg.name}</h3>
        </div>
        <p className="text-sm mb-5 mt-1 leading-relaxed" style={{ color: '#667085' }}>{pkg.description}</p>

        {/* Price */}
        <div className="mb-5 flex items-baseline gap-1.5">
          <span className="text-3xl font-black" style={{ color: style.priceCls }}>₹{pkg.price.toLocaleString('en-IN')}</span>
          <span className="text-sm font-semibold" style={{ color: '#9CA3AF' }}>/ bundle</span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {pkg.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
              <span
                className="p-0.5 rounded-full mt-0.5 shrink-0 border flex items-center justify-center"
                style={{ background: style.checkBg, borderColor: style.iconBorder, width: '18px', height: '18px' }}
              >
                <Check size={11} strokeWidth={3} style={{ color: style.checkColor }} />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={e => { if (onSelect) { e.stopPropagation(); onSelect(pkg); } }}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer min-h-[44px]"
          style={
            selected
              ? { background: style.accentColor, color: '#FFFFFF', border: 'none' }
              : { background: 'transparent', color: style.accentColor, border: `1.5px solid ${style.accentColor}` }
          }
        >
          {selected ? '✓ Package Selected' : 'Choose This Package'}
        </button>
      </div>
    </div>
  );
}
