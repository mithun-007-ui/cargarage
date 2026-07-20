'use client';

import React from 'react';
import { Receipt, Tag, Percent, ArrowRight } from 'lucide-react';

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
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-2" style={{ background: '#211F1D' }}>
        <Receipt size={16} style={{ color: '#E65313' }} />
        <h2 className="font-extrabold text-sm text-white">Bill Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Vehicle */}
        {vehicle && (
          <div className="pb-4 text-sm" style={{ borderBottom: '1px solid #E2D8CE' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Vehicle</p>
            <p className="font-bold" style={{ color: '#202020' }}>{vehicle.make} {vehicle.model}</p>
            <p className="mt-0.5 text-xs" style={{ color: '#667085' }}>{vehicle.year} · {vehicle.fuelType} · {vehicle.transmission}</p>
          </div>
        )}

        {/* Package */}
        {selectedPackage && selectedPackage !== 'none' && (
          <div className="pb-4 text-sm" style={{ borderBottom: '1px solid #E2D8CE' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Selected Package</p>
            <div className="flex justify-between items-center">
              <p className="font-bold" style={{ color: '#E65313' }}>{selectedPackage.name}</p>
              <span className="font-bold" style={{ color: '#202020' }}>₹{selectedPackage.price?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Services */}
        <div className="space-y-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Services Breakdown</p>
          {selectedServices.length === 0 ? (
            <p className="italic py-1 text-xs" style={{ color: '#9CA3AF' }}>No services selected yet</p>
          ) : (
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#E65313' }} />
                    <span className="text-xs truncate" style={{ color: '#374151' }}>{s.name}</span>
                  </div>
                  <span className="text-xs font-bold shrink-0 ml-2" style={{ color: '#202020' }}>₹{s.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-3 text-sm" style={{ borderTop: '1px solid #E2D8CE' }}>
          <div className="flex justify-between" style={{ color: '#667085' }}>
            <span className="flex items-center gap-1 text-xs"><Tag size={11} /> Subtotal</span>
            <span className="font-semibold text-xs" style={{ color: '#374151' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between" style={{ color: '#667085' }}>
            <span className="flex items-center gap-1 text-xs"><Percent size={11} /> GST (18%)</span>
            <span className="font-semibold text-xs" style={{ color: '#374151' }}>₹{gst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2" style={{ borderTop: '1px solid #E2D8CE' }}>
            <span className="font-extrabold text-sm" style={{ color: '#202020' }}>Estimated Total</span>
            <span className="text-2xl font-black" style={{ color: '#E65313' }}>₹{total.toLocaleString('en-IN')}</span>
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

        <p className="text-[10px] leading-relaxed" style={{ color: '#9CA3AF' }}>
          * Estimates are base prices. Final cost is confirmed after diagnostic inspection and your approval.
        </p>
      </div>
    </div>
  );
}
