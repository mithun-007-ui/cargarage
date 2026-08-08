'use client';

import React from 'react';
import { Receipt, Tag, Percent, Clock, ChevronRight, Car, Package, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PremiumBillSummary({ vehicle, selectedServices = [], selectedPackage = null }) {
  const router = useRouter();

  const servicesSubtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const packagePrice = selectedPackage && selectedPackage.id !== 'none' ? (selectedPackage.price || 0) : 0;
  const subtotal = servicesSubtotal + packagePrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const discount = 0; // Configurable if needed

  const totalMins = selectedServices.reduce((acc, s) => acc + (s.duration || 60), 0) + (selectedPackage && selectedPackage.id !== 'none' ? 30 : 0);
  const durationText = totalMins >= 60
    ? `${Math.floor(totalMins / 60)}h ${totalMins % 60 > 0 ? (totalMins % 60) + 'm' : ''}`
    : `${totalMins}m`;

  const totalServices = selectedServices.length;

  const isButtonDisabled = !selectedPackage;

  const handleBookSlot = () => {
    if (isButtonDisabled) return;
    localStorage.setItem('booking_flow_estimated_price', total.toString());
    router.push('/booking');
  };

  return (
    <div className="bg-[#141C2E] rounded-2xl border border-slate-800 shadow-xl p-5 sticky top-24 text-white">
      <h2 className="font-extrabold text-white text-lg pb-4 border-b border-slate-800 flex items-center gap-2 mb-4">
        <Receipt size={18} className="text-[#FF6B00]" />
        Live Bill Summary
      </h2>

      {/* Selected Vehicle */}
      {vehicle && (
        <div className="mb-4 pb-4 border-b border-slate-800">
          <p className="text-[10px] font-bold text-[#A1A9B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Car size={12} /> Selected Vehicle
          </p>
          <p className="text-sm font-bold text-white">{vehicle.make} {vehicle.model}</p>
          <p className="text-xs text-[#A1A9B8]">{vehicle.year} • {vehicle.fuelType}</p>
        </div>
      )}

      {/* Package */}
      <div className="mb-4 pb-4 border-b border-slate-800">
        <p className="text-[10px] font-bold text-[#A1A9B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Package size={12} /> Package
        </p>
        {selectedPackage ? (
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-[#2563EB]">{selectedPackage.name}</p>
            <span className="text-sm font-bold text-white">₹{packagePrice.toLocaleString('en-IN')}</span>
          </div>
        ) : (
          <p className="text-xs text-[#A1A9B8] italic">No package selected.</p>
        )}
      </div>

      {/* Selected Services */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] font-bold text-[#A1A9B8] uppercase tracking-wider flex items-center gap-1.5">
            <Wrench size={12} /> Services ({totalServices})
          </p>
        </div>
        {totalServices === 0 ? (
          <p className="text-xs text-[#A1A9B8] italic">No extra services selected.</p>
        ) : (
          <div className="max-h-32 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {selectedServices.map(s => (
              <div key={s.id} className="flex justify-between items-start text-xs">
                <span className="text-slate-300 pr-2 leading-tight">{s.name}</span>
                <span className="font-bold text-white shrink-0">₹{s.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800">
        <div className="flex justify-between text-xs text-[#A1A9B8]">
          <span className="flex items-center gap-1"><Tag size={12} />Subtotal</span>
          <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-xs text-[#A1A9B8]">
          <span className="flex items-center gap-1"><Percent size={12} />GST (18%)</span>
          <span className="font-semibold text-white">₹{gst.toLocaleString('en-IN')}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs text-[#22C55E]">
            <span>Discount</span>
            <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-3 border-t border-slate-800 mt-2">
          <span className="font-bold text-white text-sm">Grand Total</span>
          <span className="text-2xl font-black text-[#FF6B00]">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Estimated Time */}
      {(totalServices > 0 || selectedPackage) && (
        <div className="mt-4 mb-5 bg-[#123EA8]/10 border border-[#123EA8]/30 rounded-xl px-3 py-2.5 text-xs text-blue-200 flex items-center gap-2">
          <Clock size={14} className="text-[#2563EB]" /> 
          <span>Est. Completion: <strong className="text-white">{durationText}</strong></span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleBookSlot}
        disabled={isButtonDisabled}
        className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
          isButtonDisabled
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-[#FF6B00] hover:bg-[#ff7b1a] text-white shadow-[0_4px_14px_0_rgba(255,107,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.23)] hover:-translate-y-0.5'
        }`}
      >
        Proceed to Book Slot <ChevronRight size={16} />
      </button>
    </div>
  );
}
