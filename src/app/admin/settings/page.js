'use client';

import React, { useState, useEffect } from 'react';
import {
  getSlotsSettings, updateSlotsSettings, getCoupons,
  addCoupon, deleteCoupon, resetDb, getMockDb,
} from 'src/lib/mockDb';
import { Settings, Save, Trash2, Plus, AlertTriangle, RefreshCw, CheckCircle2, Tag } from 'lucide-react';

const INP = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  color: '#1e293b',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: '40px',
};

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100" style={{ background: '#f8fafc' }}>
        <h2 className="font-extrabold text-sm text-slate-700">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  /* ── Slots settings ── */
  const [slotLimit, setSlotLimit] = useState(5);
  const [slotSaved, setSlotSaved] = useState(false);

  /* ── Coupons ── */
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', description: '' });
  const [couponError, setCouponError] = useState('');

  /* ── Stats ── */
  const [stats, setStats] = useState({ bookings: 0, reviews: 0, emergency: 0 });

  /* ── Reset ── */
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const load = () => {
    const s = getSlotsSettings();
    setSlotLimit(s.defaultLimit ?? 5);
    setCoupons(getCoupons());
    const db = getMockDb();
    setStats({
      bookings: (db.bookings || []).length,
      reviews: (db.reviews || []).length,
      emergency: (db.emergencyRequests || []).length,
    });
  };

  useEffect(() => { load(); }, []);

  const saveSlots = () => {
    updateSlotsSettings({ defaultLimit: Number(slotLimit) });
    setSlotSaved(true);
    setTimeout(() => setSlotSaved(false), 2500);
  };

  const handleAddCoupon = () => {
    setCouponError('');
    const code = newCoupon.code.trim().toUpperCase();
    const discount = Number(newCoupon.discount);
    if (!code) return setCouponError('Coupon code is required.');
    if (!discount || discount < 1 || discount > 100) return setCouponError('Discount must be between 1 and 100.');
    addCoupon({ code, discount, description: newCoupon.description.trim() || `${discount}% off` });
    setNewCoupon({ code: '', discount: '', description: '' });
    setCoupons(getCoupons());
  };

  const handleDeleteCoupon = (code) => {
    deleteCoupon(code);
    setCoupons(getCoupons());
  };

  const handleReset = () => {
    resetDb();
    setResetConfirm(false);
    setResetDone(true);
    load();
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="mb-2">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
          <Settings size={20} className="text-orange-500" /> Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage workshop configuration and data.</p>
      </div>

      {/* ── Database stats ── */}
      <Section title="📊 Database Overview">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Bookings', value: stats.bookings },
            { label: 'Reviews', value: stats.reviews },
            { label: 'Emergency Req.', value: stats.emergency },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-2xl font-extrabold text-slate-800">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all"
            style={{ background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
            <RefreshCw size={12} /> Refresh Stats
          </button>
        </div>
      </Section>

      {/* ── Slot limit ── */}
      <Section title="📅 Daily Slot Limit">
        <p className="text-sm text-slate-500 mb-4">Set the maximum number of bookings allowed per day.</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={50}
            value={slotLimit}
            onChange={e => setSlotLimit(e.target.value)}
            style={{ ...INP, maxWidth: '120px' }}
            onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
          <span className="text-sm text-slate-500">slots / day</span>
          <button onClick={saveSlots}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
            style={{ background: '#D96C2F' }}>
            <Save size={14} /> Save
          </button>
          {slotSaved && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <CheckCircle2 size={15} /> Saved
            </span>
          )}
        </div>
      </Section>

      {/* ── Coupons ── */}
      <Section title="🏷️ Discount Coupons">
        {/* Existing */}
        {coupons.length === 0 ? (
          <p className="text-sm text-slate-400 italic mb-4">No coupons yet.</p>
        ) : (
          <div className="space-y-2 mb-5">
            {coupons.map(c => (
              <div key={c.code}
                className="flex items-center justify-between gap-3 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-orange-400 shrink-0" />
                  <span className="font-mono font-bold text-orange-600 text-sm">{c.code}</span>
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#D96C2F' }}>
                    {c.discount}% off
                  </span>
                  <span className="text-xs text-slate-500">{c.description}</span>
                </div>
                <button onClick={() => handleDeleteCoupon(c.code)}
                  className="text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                  title="Delete coupon">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Add New Coupon</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="Code (e.g. SAVE20)" value={newCoupon.code}
              onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              style={INP}
              onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            <input placeholder="Discount %" type="number" min={1} max={100} value={newCoupon.discount}
              onChange={e => setNewCoupon(p => ({ ...p, discount: e.target.value }))}
              style={INP}
              onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            <input placeholder="Description (optional)" value={newCoupon.description}
              onChange={e => setNewCoupon(p => ({ ...p, description: e.target.value }))}
              style={INP}
              onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
          </div>
          {couponError && <p className="text-xs text-red-500">{couponError}</p>}
          <button onClick={handleAddCoupon}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
            style={{ background: '#D96C2F' }}>
            <Plus size={14} /> Add Coupon
          </button>
        </div>
      </Section>

      {/* ── Reset database ── */}
      <Section title="⚠️ Reset Database">
        <p className="text-sm text-slate-600 mb-4">
          Resets all bookings, reviews, emergency requests and notifications to the initial demo data.
          This <strong>cannot be undone.</strong>
        </p>
        {!resetConfirm ? (
          <button onClick={() => setResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer transition-all"
            style={{ background: 'rgba(239,68,68,0.06)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' }}>
            <AlertTriangle size={14} /> Reset to Demo Data
          </button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm font-bold text-red-500">Are you sure? All data will be wiped.</p>
            <button onClick={handleReset}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
              style={{ background: '#ef4444' }}>
              Yes, Reset Now
            </button>
            <button onClick={() => setResetConfirm(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer"
              style={{ background: '#fff', color: '#475569', borderColor: '#e2e8f0' }}>
              Cancel
            </button>
          </div>
        )}
        {resetDone && (
          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-3">
            <CheckCircle2 size={15} /> Database reset to demo data.
          </p>
        )}
      </Section>
    </div>
  );
}
