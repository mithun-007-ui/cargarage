'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBookingById, addHealthReport } from 'src/lib/mockDb';
import {
  ClipboardCheck, Plus, Trash2, ChevronLeft, ArrowRight,
  Wrench, AlertTriangle, CheckCircle2, Car, User, Hash, Activity
} from 'lucide-react';

// ─── Component Health Matrix ──────────────────────────────
const COMPONENTS = [
  { key: 'engine',           label: 'Engine',            icon: '⚙️' },
  { key: 'battery',          label: 'Battery',           icon: '🔋' },
  { key: 'brakePads',        label: 'Brake Pads',        icon: '🛑' },
  { key: 'tyres',            label: 'Tyres',             icon: '🔘' },
  { key: 'ac',               label: 'AC System',         icon: '❄️' },
  { key: 'suspension',       label: 'Suspension',        icon: '🔩' },
  { key: 'transmission',     label: 'Transmission',      icon: '⚙' },
  { key: 'electricalSystem', label: 'Electrical System', icon: '⚡' },
];

const COMPONENT_OPTIONS = ['Good', 'Healthy', 'Satisfactory', 'Worn Out', 'Low', 'Needs Attention', 'Need Replacement', 'Critical'];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const HEALTH_STATUS_COLOR = (val) => {
  if (val === 'Good' || val === 'Healthy' || val === 'Satisfactory') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (val === 'Worn Out' || val === 'Need Replacement' || val === 'Critical') return 'bg-red-50 text-red-700 border-red-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

const DEFAULT_COMPONENTS = {
  engine: 'Good', battery: 'Good', brakePads: 'Good', tyres: 'Good',
  ac: 'Good', suspension: 'Good', transmission: 'Good', electricalSystem: 'Good',
};

const DEFAULT_ITEM = () => ({ name: '', reason: '', priority: 'High', cost: 0, description: '' });

function AdminInspectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [notes, setNotes] = useState('');
  const [healthScore, setHealthScore] = useState(85);
  const [components, setComponents] = useState(DEFAULT_COMPONENTS);
  const [items, setItems] = useState([DEFAULT_ITEM()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    if (bookingId) {
      const data = getBookingById(bookingId);
      if (data) {
        setBooking(data);
        if (data.healthReport) {
          setNotes(data.healthReport.notes || '');
          setHealthScore(data.healthReport.healthScore || 85);
          if (data.healthReport.components) setComponents({ ...DEFAULT_COMPONENTS, ...data.healthReport.components });
          if (data.healthReport.items?.length > 0) setItems(data.healthReport.items.map(i => ({ ...DEFAULT_ITEM(), ...i })));
        }
      }
    }
  }, [bookingId]);

  const handleAddItem = () => {
    const newItem = DEFAULT_ITEM();
    setItems(prev => [...prev, newItem]);
    setExpandedItem(items.length);
  };

  const handleRemoveItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
    setExpandedItem(null);
  };

  const handleItemChange = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = field === 'cost' ? (parseFloat(value) || 0) : value;
    setItems(next);
  };

  const handleComponentChange = (key, value) => {
    setComponents(prev => ({ ...prev, [key]: value }));
    // Auto-adjust health score based on component health
    const updatedComponents = { ...components, [key]: value };
    const allVals = Object.values(updatedComponents);
    const badCount = allVals.filter(v => ['Worn Out', 'Need Replacement', 'Critical'].includes(v)).length;
    const warnCount = allVals.filter(v => ['Needs Attention', 'Low'].includes(v)).length;
    const score = Math.max(10, 100 - (badCount * 15) - (warnCount * 7));
    setHealthScore(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking) { setError('No booking selected.'); return; }
    if (!notes.trim()) { setError('Please add diagnostic observations.'); return; }
    if (items.length > 0 && items.some(item => !item.name)) { setError('Each repair item must have a name.'); return; }
    if (items.length > 0 && items.some(item => item.cost <= 0)) { setError('Each repair item must have a cost greater than ₹0.'); return; }

    setIsSubmitting(true);
    setError('');
    await new Promise(r => setTimeout(r, 700));
    try {
      addHealthReport(booking.id, notes, items, healthScore, components);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Failed to save inspection report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const healthColor = healthScore >= 80 ? 'text-emerald-600' : healthScore >= 60 ? 'text-amber-600' : 'text-red-600';
  const healthBg = healthScore >= 80 ? 'bg-emerald-50 border-emerald-200' : healthScore >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer mb-2 group"
        >
          <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ClipboardCheck className="text-accent-500" size={20} />
          Vehicle Inspection & Health Report
        </h1>
        <p className="text-xs text-slate-400 mt-1">Fill in the inspection checklist and add repair recommendations for customer approval.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 shrink-0" /> {error}
        </div>
      )}

      {booking ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Left: Inspection Form */}
          <div className="lg:col-span-8 space-y-4">

            {/* 1. Overall Health Score */}
            <div className={`bg-white rounded-2xl p-5 border shadow-sm ${healthBg}`}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={14} className="text-primary-600" /> Overall Vehicle Health Score
                </label>
                <span className={`text-2xl font-extrabold ${healthColor}`}>{healthScore}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={healthScore}
                onChange={e => setHealthScore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Critical (0)</span><span>Average (50)</span><span>Excellent (100)</span>
              </div>
            </div>

            {/* 2. Component Health Matrix */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" /> Component Health Checklist
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMPONENTS.map(comp => (
                  <div key={comp.key} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${HEALTH_STATUS_COLOR(components[comp.key])}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{comp.icon}</span>
                      <span className="text-xs font-bold text-slate-700">{comp.label}</span>
                    </div>
                    <select
                      value={components[comp.key]}
                      onChange={e => handleComponentChange(comp.key, e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                    >
                      {COMPONENT_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Diagnostic Notes */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-3">
                Technician Diagnostic Notes *
              </h2>
              <textarea
                required rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium text-slate-700 resize-none"
                placeholder="e.g. Front brake pads below critical threshold. Tyre pressure low on all wheels. Battery voltage nominal. Recommend replacing brake pads and balancing tyres."
              />
            </div>

            {/* 4. Repair Recommendations */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  <Wrench size={13} className="text-accent-500" /> Repair Recommendations
                </h2>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Repair
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                    {/* Item Header */}
                    <div
                      onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                      className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 ${
                          item.priority === 'Critical' ? 'bg-red-100 text-red-700'
                          : item.priority === 'High' ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-200 text-slate-600'
                        }`}>{idx + 1}</span>
                        <span className="text-xs font-bold text-slate-700 truncate">{item.name || 'New Repair Item'}</span>
                        {item.cost > 0 && <span className="text-xs font-bold text-slate-500 shrink-0">₹{item.cost.toLocaleString('en-IN')}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.priority && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.priority === 'Critical' ? 'bg-red-100 text-red-700'
                            : item.priority === 'High' ? 'bg-orange-100 text-orange-700'
                            : item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-500'
                          }`}>{item.priority}</span>
                        )}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleRemoveItem(idx); }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Form */}
                    {expandedItem === idx && (
                      <div className="p-4 space-y-3 border-t border-slate-100">
                        {/* Row 1: Name + Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Repair Name *</label>
                            <input
                              type="text" required value={item.name}
                              onChange={e => handleItemChange(idx, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium text-slate-700"
                              placeholder="e.g. Front Brake Pads Replacement"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                            <select
                              value={item.priority}
                              onChange={e => handleItemChange(idx, 'priority', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                            >
                              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Row 2: Reason + Cost */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason</label>
                            <input
                              type="text" value={item.reason}
                              onChange={e => handleItemChange(idx, 'reason', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium text-slate-700"
                              placeholder="e.g. Pad wear below 3mm threshold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated Cost *</label>
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                              <span className="text-xs text-slate-400 font-bold">₹</span>
                              <input
                                type="number" required min="1"
                                value={item.cost || ''}
                                onChange={e => handleItemChange(idx, 'cost', e.target.value)}
                                className="w-full pl-1 py-2 bg-transparent focus:outline-none text-xs text-slate-800 font-bold"
                                placeholder="3500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description (for customer)</label>
                          <textarea
                            rows={2} value={item.description}
                            onChange={e => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium text-slate-700 resize-none"
                            placeholder="e.g. The brake pad lining has worn below the safe minimum. Replacing ensures safe stopping distances."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No repairs recommended — click "Add Repair" to add one.
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-white"
              >
                <ChevronLeft size={13} /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-accent-500/20 border border-accent-600 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Saving...' : 'Save Inspection Report'}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl p-5 shadow-md space-y-4 sticky top-4">
              <h2 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Car size={13} className="text-accent-500" /> Booking Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500 font-semibold">Booking ID</span>
                  <span className="font-mono text-white font-bold">{booking.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500 font-semibold">Customer</span>
                  <span className="text-white font-bold">{booking.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500 font-semibold">Vehicle</span>
                  <span className="text-white font-bold">{booking.vehicle?.make} {booking.vehicle?.model}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500 font-semibold">Plate</span>
                  <span className="text-slate-400 font-mono">{booking.vehicle?.plateNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500 font-semibold">Fuel / Trans</span>
                  <span className="text-white font-bold">{booking.vehicle?.fuelType || '—'} / {booking.vehicle?.transmission || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500 font-semibold">Service Date</span>
                  <span className="text-white font-bold">{booking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Package</span>
                  <span className="text-accent-500 font-bold">{booking.packageSelected || 'None'}</span>
                </div>
              </div>

              {/* Selected Services */}
              {booking.selectedServices?.length > 0 && (
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Services Booked</p>
                  {booking.selectedServices.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-400">{s.name}</span>
                      <span className="text-white font-bold">₹{s.price?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Repair total preview */}
              {items.filter(i => i.name && i.cost > 0).length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Repair Estimate</p>
                  {items.filter(i => i.name).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 truncate pr-2">{item.name || 'Item ' + (i+1)}</span>
                      <span className="text-white font-bold shrink-0">₹{(item.cost || 0).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-extrabold mt-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-300">Total Est.</span>
                    <span className="text-accent-500">₹{items.reduce((s, i) => s + (i.cost || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
          {bookingId
            ? 'Loading booking details...'
            : 'No booking selected. Please go back and select a booking to inspect.'}
        </div>
      )}
    </div>
  );
}

export default function AdminInspectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminInspectionsContent />
    </Suspense>
  );
}
