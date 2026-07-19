'use client';

import React from 'react';
import { Receipt, Tag, Percent, ArrowRight, Check } from 'lucide-react';

export default function BillSummary({ 
  vehicle, 
  selectedServices = [], 
  selectedPackage = null,
  isPublic = false,
  onActionClick = null
}) {
  const servicesSubtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const packagePrice = selectedPackage && selectedPackage !== 'none' ? (selectedPackage.price || 0) : 0;
  const subtotal = servicesSubtotal + packagePrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1e2d45] p-5 space-y-4">
      <div>
        <h2 className="font-extrabold text-white text-sm pb-3 border-b border-[#1e2d45] flex items-center gap-2">
          <Receipt size={16} className="text-primary-400" />
          Bill Summary
        </h2>
      </div>

      {/* Vehicle */}
      {vehicle && (
        <div className="pb-3 border-b border-[#1e2d45] text-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle</p>
          <p className="font-bold text-white">{vehicle.make} {vehicle.model}</p>
          <p className="text-slate-500 mt-0.5">{vehicle.year} · {vehicle.fuelType} · {vehicle.transmission}</p>
        </div>
      )}

      {/* Package */}
      {selectedPackage && selectedPackage !== 'none' && (
        <div className="pb-3 border-b border-[#1e2d45] text-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Package</p>
          <div className="flex justify-between items-center">
            <p className="font-bold text-primary-400">{selectedPackage.name}</p>
            <span className="font-bold text-white">₹{selectedPackage.price?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Services */}
      <div className="space-y-2 text-xs">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Services Breakdown</p>
        {selectedServices.length === 0 ? (
          <p className="text-slate-600 italic py-1">No services selected yet</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
            {selectedServices.map(s => (
              <div key={s.id} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                  <span className="text-slate-300 font-medium truncate text-[11px]">{s.name}</span>
                </div>
                <span className="font-bold text-white shrink-0 ml-2">₹{s.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 pt-3 border-t border-[#1e2d45] text-xs">
        <div className="flex justify-between text-slate-500">
          <span className="flex items-center gap-1"><Tag size={11} /> Subtotal</span>
          <span className="font-semibold text-slate-300">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span className="flex items-center gap-1"><Percent size={11} /> GST (18%)</span>
          <span className="font-semibold text-slate-300">₹{gst.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-[#1e2d45]">
          <span className="font-extrabold text-white text-xs">Estimated Total</span>
          <span className="text-2xl font-black text-primary-400">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {onActionClick && (
        <button
          onClick={onActionClick}
          disabled={selectedServices.length === 0}
          className="w-full btn-primary py-3 text-sm justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isPublic ? 'Proceed to Vehicle Details' : 'Continue to Next Step'}
          <ArrowRight size={15} />
        </button>
      )}

      <p className="text-[10px] text-slate-600 leading-relaxed">
        * Estimates are base prices. Final cost is confirmed after diagnostic inspection and your approval.
      </p>
    </div>
  );
}
