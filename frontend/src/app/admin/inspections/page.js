'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBookingById, addHealthReport } from 'src/lib/mockDb';
import { ClipboardCheck, Plus, Trash2, ChevronLeft, ArrowRight, Wrench, ShieldAlert } from 'lucide-react';

export default function AdminInspectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { name: 'Front Brake Pads Replacement', cost: 180 },
    { name: 'Front Rotors Replacement', cost: 220 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      const data = getBookingById(bookingId);
      if (data) {
        setBooking(data);
        if (data.healthReport) {
          setNotes(data.healthReport.notes || '');
          setItems(data.healthReport.items || []);
        }
      }
    }
  }, [bookingId]);

  const handleAddItem = () => {
    setItems(prev => [...prev, { name: '', cost: 0 }]);
  };

  const handleRemoveItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = field === 'cost' ? parseFloat(value) || 0 : value;
    setItems(next);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!booking) {
      setError('No booking selected.');
      return;
    }
    if (!notes) {
      setError('Please add observation/diagnostics notes.');
      return;
    }
    if (items.some(item => !item.name || item.cost <= 0)) {
      setError('All items must have a valid name and cost greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Add API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      addHealthReport(booking.id, notes, items);
      router.push(`/admin/bookings?id=${booking.id}`);
    } catch (err) {
      setError('Failed to record health inspection. Please check input parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer mb-2"
        >
          <ChevronLeft size={14} />
          Back to Bookings
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="text-accent-500" />
          Vehicle Inspection & Health Report
        </h1>
        <p className="text-sm text-slate-400 mt-1">Submit digital diagnostic reports and recommend mechanical repairs directly to the client.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {booking ? (
        <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form parameters Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              
              {/* Technician Diagnostic observations */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Technician Observation & Diagnostic Notes</label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium text-slate-700"
                  placeholder="e.g. Inspecting front braking system. Pad lining wear is below critical 3mm threshold. Rotors show thermal heat spots and surface distortion. Recommendation: replacement of pads and rotors immediately."
                />
              </div>

              {/* Repairs table list generator */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommended Repairs & Parts</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Recommended Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                          placeholder="e.g. Front Brake Pads Replacement"
                        />
                      </div>
                      <div className="w-28 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5">
                        <span className="text-xs text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          required
                          value={item.cost || ''}
                          onChange={(e) => handleItemChange(idx, 'cost', e.target.value)}
                          className="w-full pl-1 py-2 bg-transparent focus:outline-none text-xs text-slate-800 font-bold"
                          placeholder="180"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer border border-slate-100"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-6 text-slate-450 border border-dashed border-slate-200 rounded-xl text-xs">
                      No repairs recommended. The service check is clear of faults.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-lg shadow-accent-500/20 border border-accent-600 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Send Report to Customer'}
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          </div>

          {/* Booking Summary details column */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-3xl p-6 shadow-md space-y-6">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">Service Summary</h2>

              <div className="space-y-4 text-xs">
                {/* ID */}
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-500 font-semibold">Booking ID</span>
                  <span className="font-mono text-white font-bold">{booking.id}</span>
                </div>

                {/* Make */}
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-500 font-semibold">Vehicle Specs</span>
                  <span className="text-white font-bold">{booking.vehicle.make} {booking.vehicle.model}</span>
                </div>

                {/* Plate */}
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-500 font-semibold">Plate Number</span>
                  <span className="text-slate-400 font-mono">{booking.vehicle.plateNumber}</span>
                </div>

                {/* Service */}
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-500 font-semibold">Base Service Check</span>
                  <span className="text-white font-bold">{booking.serviceType}</span>
                </div>

                {/* Package */}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Bundled Package</span>
                  <span className="text-accent-500 font-bold">{booking.packageSelected}</span>
                </div>
              </div>
            </div>
          </div>

        </form>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400">
          Loading booking specifications...
        </div>
      )}
    </div>
  );
}
