'use client';

import React from 'react';
import * as Icons from 'lucide-react';

export default function StatCard({ title, value, icon, color = 'blue' }) {
  const IconComponent = Icons[icon] || Icons.CircleDot;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      iconBg: 'bg-blue-100/50',
    },
    orange: {
      bg: 'bg-orange-50 text-orange-600 border-orange-100',
      iconBg: 'bg-orange-100/50',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconBg: 'bg-emerald-100/50',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      iconBg: 'bg-amber-100/50',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconBg: 'bg-purple-100/50',
    }
  }[color] || {
    bg: 'bg-slate-50 text-slate-600 border-slate-100',
    iconBg: 'bg-slate-100/50',
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex items-center gap-5`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses.bg} ${colorClasses.iconBg}`}>
        <IconComponent size={24} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
