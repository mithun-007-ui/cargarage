'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getEmergencyRequests, updateEmergencyRequest } from 'src/lib/mockDb';
import {
  Phone, MapPin, Car, Clock, AlertTriangle, CheckCircle2,
  RefreshCw, ChevronDown, ChevronUp, Save, User, Timer, FileText,
} from 'lucide-react';

/* ─── Constants ─── */
const STATUS_FLOW = ['New', 'Assigned', 'On the Way', 'Reached Customer', 'Completed', 'Cancelled'];

const STATUS_STYLES = {
  'New':              { bg: 'rgba(239,68,68,0.12)',    color: '#f87171',  border: 'rgba(239,68,68,0.3)'    },
  'Assigned':         { bg: 'rgba(217,108,47,0.12)',   color: '#F28C45',  border: 'rgba(217,108,47,0.3)'   },
  'On the Way':       { bg: 'rgba(214,168,75,0.12)',   color: '#E8C060',  border: 'rgba(214,168,75,0.3)'   },
  'Reached Customer': { bg: 'rgba(99,130,255,0.12)',   color: '#93b4ff',  border: 'rgba(99,130,255,0.3)'   },
  'Completed':        { bg: 'rgba(16,185,129,0.12)',   color: '#34d399',  border: 'rgba(16,185,129,0.3)'   },
  'Cancelled':        { bg: 'rgba(100,80,72,0.12)',    color: '#9A8070',  border: 'rgba(100,80,72,0.3)'    },
};

/* ─── Helpers ─── */
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['New'];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function FieldValue({ value, fallback = '—' }) {
  const v = value ?? '';
  return (
    <span style={{ color: v ? '#1e293b' : '#94a3b8', fontStyle: v ? 'normal' : 'italic' }}>
      {v || fallback}
    </span>
  );
}

/* ─── Admin detail / action panel ─── */
function AdminPanel({ req, onSaved }) {
  const isDone = ['Completed', 'Cancelled'].includes(req.status);

  const [form, setForm] = useState({
    status:       req.status       ?? 'New',
    mechanic:     req.mechanic     ?? '',
    contactNo:    req.contactNo    ?? '',
    eta:          req.eta          ?? '',
    adminNotes:   req.adminNotes   ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // keep form in sync when parent re-loads (e.g. after refresh)
  useEffect(() => {
    setForm({
      status:     req.status     ?? 'New',
      mechanic:   req.mechanic   ?? '',
      contactNo:  req.contactNo  ?? '',
      eta:        req.eta        ?? '',
      adminNotes: req.adminNotes ?? '',
    });
  }, [req.id, req.status, req.mechanic, req.contactNo, req.eta, req.adminNotes]);

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 350));
    updateEmergencyRequest(req.id, form);
    setSaving(false);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  /* common input style */
  const inp = {
    display: 'block',
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: '#1e293b',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '40px',
  };

  return (
    <div className="border-t border-slate-100 p-5 space-y-5 bg-slate-50 rounded-b-2xl">

      {/* ── Status selector ── */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Update Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map(s => (
            <button
              key={s}
              type="button"
              disabled={isDone && s !== req.status}
              onClick={() => setForm(prev => ({ ...prev, status: s }))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={form.status === s
                ? { background: '#D96C2F', color: '#FFF7ED', borderColor: 'rgba(217,108,47,0.5)' }
                : s === 'Cancelled'
                  ? { background: 'rgba(239,68,68,0.06)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }
                  : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Assignment fields ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mechanic / Driver */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            <User size={10} /> Assign Mechanic / Driver
          </label>
          <input
            type="text"
            value={form.mechanic}
            onChange={set('mechanic')}
            placeholder="e.g. Ramesh Kumar"
            disabled={isDone}
            style={inp}
            onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            <Phone size={10} /> Contact Number
          </label>
          <input
            type="tel"
            value={form.contactNo}
            onChange={set('contactNo')}
            placeholder="e.g. 98765 43210"
            disabled={isDone}
            style={inp}
            onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* ETA */}
        <div>
          <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            <Timer size={10} /> Estimated Arrival Time
          </label>
          <input
            type="text"
            value={form.eta}
            onChange={set('eta')}
            placeholder="e.g. 15 minutes, 3:30 PM"
            disabled={isDone}
            style={inp}
            onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Admin Notes */}
      <div>
        <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          <FileText size={10} /> Admin Notes
        </label>
        <textarea
          rows={3}
          value={form.adminNotes}
          onChange={set('adminNotes')}
          placeholder="Internal notes — visible only to admin team."
          disabled={isDone}
          style={{ ...inp, resize: 'vertical', minHeight: '72px', lineHeight: '1.5' }}
          onFocus={e => { e.target.style.borderColor = '#D96C2F'; e.target.style.boxShadow = '0 0 0 2px rgba(217,108,47,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Save + feedback */}
      <div className="flex items-center gap-3 flex-wrap">
        {!isDone && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
            style={{ background: '#D96C2F', opacity: saving ? 0.7 : 1, minHeight: '40px' }}
          >
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              : <><Save size={14} /> Save / Update</>
            }
          </button>
        )}
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <CheckCircle2 size={15} /> Saved successfully
          </span>
        )}
        {isDone && (
          <p className="text-xs font-semibold" style={{ color: req.status === 'Completed' ? '#34d399' : '#9A8070' }}>
            {req.status === 'Completed' ? '✓ Request completed.' : '✗ Request was cancelled.'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function AdminEmergenciesPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({});  // { [id]: bool }

  const load = useCallback(() => {
    setRequests(getEmergencyRequests());
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => !['Completed', 'Cancelled'].includes(r.status)).length;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            Emergency Requests
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#D96C2F' }}>
                {pendingCount} active
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{requests.length} total request{requests.length !== 1 ? 's' : ''} in system</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border self-start sm:self-auto"
          style={{ background: '#2B211C', color: '#D8C8B8', borderColor: '#5A463A' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...STATUS_FLOW].map(s => {
          const count = s === 'all' ? requests.length : requests.filter(r => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border min-h-[36px]"
              style={filter === s
                ? { background: '#D96C2F', color: '#FFF7ED', borderColor: 'rgba(242,140,69,0.5)' }
                : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }
              }
            >
              {s === 'all' ? 'All' : s}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: 'rgba(0,0,0,0.08)' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold">No emergency requests {filter !== 'all' ? `with status "${filter}"` : 'found'}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => {
            const isOpen = !!expanded[req.id];
            const isDone = ['Completed', 'Cancelled'].includes(req.status);
            const currentIdx = STATUS_FLOW.indexOf(req.status);

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                style={{ borderColor: req.status === 'New' ? 'rgba(239,68,68,0.3)' : '#e2e8f0' }}
              >
                {/* ── Card header ── */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  style={{ background: req.status === 'New' ? 'rgba(239,68,68,0.04)' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
                >
                  <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0">{req.id}</span>
                    <StatusBadge status={req.status} />
                    {req.status === 'New' && (
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={11} /> Needs Immediate Attention
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {formatTime(req.timestamp)}
                    </span>
                    <button
                      onClick={() => toggleExpand(req.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                      style={{ borderColor: '#e2e8f0', color: '#475569', background: '#fff' }}
                    >
                      {isOpen ? <><ChevronUp size={13} /> Collapse</> : <><ChevronDown size={13} /> Manage</>}
                    </button>
                  </div>
                </div>

                {/* ── Info grid ── */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

                    {/* Customer */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer</p>
                      <p className="font-bold text-slate-800"><FieldValue value={req.name} /></p>
                      {req.phone
                        ? <a href={`tel:${req.phone}`} className="flex items-center gap-1 text-xs mt-0.5 hover:underline" style={{ color: '#D96C2F' }}>
                            <Phone size={11} /> {req.phone}
                          </a>
                        : <p className="text-xs mt-0.5 text-slate-400 italic">No phone</p>
                      }
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location</p>
                      <p className="font-semibold text-slate-700 flex items-start gap-1 text-sm">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-slate-400" />
                        <FieldValue value={req.location} fallback="Location not provided" />
                      </p>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle</p>
                      <p className="font-semibold text-slate-700 flex items-center gap-1 text-sm">
                        <Car size={12} className="shrink-0 text-slate-400" />
                        <FieldValue value={req.vehicleDetails} fallback="Not specified" />
                      </p>
                    </div>

                    {/* Breakdown type */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Breakdown Type</p>
                      <p className="font-semibold text-slate-700 text-sm">
                        <FieldValue value={req.breakdownType || req.issue} fallback="Not specified" />
                      </p>
                    </div>

                    {/* Towing */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Towing Required</p>
                      <p className="font-semibold text-sm" style={{ color: req.towingRequired ? '#f87171' : '#34d399' }}>
                        {req.towingRequired === undefined
                          ? <span className="text-slate-400 italic font-normal">Not specified</span>
                          : req.towingRequired ? '✓ Yes' : '✗ No — Fix on site'}
                      </p>
                    </div>

                    {/* Description (only if extra info beyond breakdownType) */}
                    {req.issue && req.breakdownType && req.issue !== req.breakdownType && (
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                        <p className="text-xs text-slate-500 italic leading-relaxed">{req.issue}</p>
                      </div>
                    )}

                    {/* Assignment summary (visible even when panel is collapsed) */}
                    {req.mechanic && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assigned To</p>
                        <p className="font-semibold text-slate-700 text-sm">{req.mechanic}</p>
                        {req.contactNo && <p className="text-xs text-slate-500">{req.contactNo}</p>}
                      </div>
                    )}
                    {req.eta && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Est. Arrival</p>
                        <p className="font-semibold text-slate-700 text-sm">{req.eta}</p>
                      </div>
                    )}
                  </div>

                  {/* ── Status pipeline ── */}
                  <div className="mt-5 overflow-x-auto">
                    <div className="flex items-center min-w-max gap-0">
                      {STATUS_FLOW.filter(s => s !== 'Cancelled').map((s, idx, arr) => {
                        const stepIdx = STATUS_FLOW.indexOf(s);
                        const done = req.status !== 'Cancelled' && stepIdx < currentIdx;
                        const active = s === req.status && req.status !== 'Cancelled';
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center">
                              <div
                                className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                                style={{
                                  background: done ? '#10b981' : active ? '#D96C2F' : '#e2e8f0',
                                  borderColor: done ? '#10b981' : active ? '#D96C2F' : '#d1d5db',
                                }}
                              >
                                {done   && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                {active && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                              </div>
                              <p className="text-[9px] font-bold mt-1 max-w-[52px] text-center leading-tight"
                                style={{ color: done ? '#10b981' : active ? '#D96C2F' : '#9ca3af' }}>
                                {s}
                              </p>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className="h-0.5 w-6 mb-4 mx-0.5 shrink-0"
                                style={{ background: stepIdx < currentIdx ? '#10b981' : '#e2e8f0' }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Expandable admin panel ── */}
                {isOpen && (
                  <AdminPanel req={req} onSaved={load} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
