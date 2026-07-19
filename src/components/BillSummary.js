'use client';

import React from 'react';
import { Receipt, Tag, Percent, Car } from 'lucide-react';

export default function BillSummary({ vehicle, selectedServices = [], selectedPackage = null }) {
  const servicesSubtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const packagePrice = selectedPackage && selectedPackage !== 'none' ? (selectedPackage.price || 0) : 0;
  const subtotal = servicesSubtotal + packagePrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 sticky top-24">
      <h2 className="font-extrabold text-slate-800 text-sm pb-3 border-b border-slate-100 flex items-center gap-2 mb-4">
        <Receipt size={16} className="text-accent-500" />
        Bill Summary
      </h2>

      {/* Vehicle */}
      {vehicle && (
        <div className="mb-4 pb-3 border-b border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vehicle</p>
          <p className="text-sm font-bold text-slate-700">{vehicle.make} {vehicle.model}</p>
          <p className="text-xs text-slate-400">{vehicle.year} • {vehicle.fuelType}</p>
        </div>
      )}

      {/* Package */}
      {selectedPackage && selectedPackage !== 'none' && (
        <div className="mb-3 pb-3 border-b border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Package</p>
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-primary-700">{selectedPackage.name}</p>
            <span className="text-xs font-bold text-slate-700">₹{selectedPackage.price?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Selected Services */}
      <div className="space-y-1.5 mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Services</p>
        {selectedServices.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No services selected yet</p>
        ) : (
          selectedServices.map(s => (
            <div key={s.id} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                <span className="text-slate-700 font-medium">{s.name}</span>
              </div>
              <span className="font-bold text-slate-800">₹{s.price.toLocaleString('en-IN')}</span>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="flex justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1"><Tag size={11} />Subtotal</span>
          <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1"><Percent size={11} />GST (18%)</span>
          <span className="font-semibold">₹{gst.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-800 text-sm">Estimated Total</span>
          <span className="text-xl font-black text-primary-700">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
        * Final price may vary based on inspection findings.
      </p>
    </div>
  );
}
