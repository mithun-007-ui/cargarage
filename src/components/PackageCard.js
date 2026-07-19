'use client';

import React from 'react';
import { Check, ShieldCheck, Zap, Star, Award } from 'lucide-react';

const PACKAGE_STYLES = {
  'silver-care': {
    strip: 'from-slate-400 to-slate-500',
    badge: null,
    icon: <Zap size={14} className="text-slate-300" />,
    iconBg: 'bg-slate-500/20 border-slate-500/30 text-slate-300',
    priceCls: 'text-slate-100',
    btnActive: 'bg-[#334155] hover:bg-[#3d5068] text-white border-slate-400',
    btnIdle: 'bg-[#111827] hover:bg-[#1e2d45] text-slate-300 border-[#1e2d45]',
    checkIcon: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  'gold-care': {
    strip: 'from-amber-400 to-yellow-300',
    badge: null,
    icon: <Star size={14} className="text-amber-300" fill="currentColor" />,
    iconBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    priceCls: 'text-amber-300',
    btnActive: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400',
    btnIdle: 'bg-[#111827] hover:bg-[#1e2d45] text-amber-300 border-amber-500/30',
    checkIcon: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  },
  'platinum-care': {
    strip: 'from-violet-500 to-purple-400',
    badge: 'BEST VALUE',
    icon: <Award size={14} className="text-violet-300" />,
    iconBg: 'bg-violet-500/20 border-violet-500/30 text-violet-300',
    priceCls: 'text-violet-300',
    btnActive: 'bg-violet-600 hover:bg-violet-700 text-white border-violet-400',
    btnIdle: 'bg-[#111827] hover:bg-[#1a1230] text-violet-300 border-violet-500/30',
    checkIcon: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  },
};

export default function PackageCard({ pkg, onSelect, selected }) {
  const style = PACKAGE_STYLES[pkg.id] || PACKAGE_STYLES['silver-care'];

  return (
    <div
      onClick={() => onSelect && onSelect(pkg)}
      className={`relative rounded-2xl border-2 transition-all duration-250 flex flex-col overflow-hidden h-full group ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-primary-600 bg-[#0d1731] shadow-xl shadow-primary-900/20'
          : 'bg-[#111827] border-[#1e2d45] hover:border-[#253558] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
      }`}
    >
      {/* Colour strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.strip}`} />

      {/* Best value badge */}
      {style.badge && (
        <div className={`absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          pkg.id === 'platinum-care' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
        }`}>
          {style.badge}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${style.iconBg}`}>
            {style.icon}
          </div>
          <h3 className="text-lg font-extrabold text-white">{pkg.name}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-5 mt-1">{pkg.description}</p>

        {/* Price */}
        <div className="mb-5 flex items-baseline gap-1.5">
          <span className={`text-4xl font-black ${style.priceCls}`}>₹{pkg.price.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-xs font-semibold">/ bundle</span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {pkg.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className={`p-0.5 rounded-full mt-0.5 shrink-0 border ${style.checkIcon}`}>
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={e => { if (onSelect) { e.stopPropagation(); onSelect(pkg); } }}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all border cursor-pointer min-h-[48px] ${
            selected ? style.btnActive : style.btnIdle
          }`}
        >
          {selected ? '✓ Package Selected' : 'Choose This Package'}
        </button>
      </div>
    </div>
  );
}
