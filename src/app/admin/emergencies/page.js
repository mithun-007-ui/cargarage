'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getEmergencyRequests, updateEmergencyStatus } from 'src/lib/mockDb';
import { Phone, MapPin, Car, Clock, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

const STATUS_FLOW = [
  'New',
  'Assigned',
  'On the Way',
  'Reached Customer',
  'Completed',
  'Cancelled',
];

const STATUS_STYLES = {
  'New':              { bg: 'rgba(239,68,68,0.12)',    color: '#f87171',  border: 'rgba(239,68,68,0.3)'    },
  'Assigned':         { bg: 'rgba(217,108,47,0.12)',   color: '#F28C45',  border: 'rgba(217,108,47,0.3)'   },
  'On the Way':       { bg: 'rgba(214,168,75,0.12)',   color: '#E8C060',  border: 'rgba(214,168,75,0.3)'   },
  'Reached Customer': { bg: 'rgba(99,130,255,0.12)',   color: '#93b4ff',  border: 'rgba(99,130,255,0.3)'   },
  'Completed':        { bg: 'rgba(16,185,129,0.12)',   color: '#34d399',  border: 'rgba(16,185,129,0.3)'   },
  'Cancelled':        { bg: 'rgba(100,80,72,0.12)',    color: '#9A8070',  border: 'rgba(100,80,72,0.3)'    },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['New'];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
}

function getNextStatuses(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || current === 'Completed' || current === 'Cancelled') return [];
  const next = [];
  if (STATUS_FLOW[idx + 1]) next.push(STATUS_FLOW[idx + 1]);
  if (current !== 'Cancelled') next.push('Cancelled');
  return [...new Set(next)];
}

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function AdminEmergenciesPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  const load = useCallback(() => {
    setRequests(getEmergencyRequests());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    await new Promise(r => setTimeout(r, 500));
    updateEmergencyStatus(id, newStatus);
    load();
    setUpdating(prev => ({ ...prev, [id]: false }));
  };

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const pendingCount = requests.filter(r => !['Completed', 'Cancelled'].includes(r.status)).length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Emergency Requests
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#D96C2F' }}>
                {pendingCount} active
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{requests.length} total request{requests.length !== 1 ? 's' : ''} in system</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border"
          style={{ background: '#2B211C', color: '#D8C8B8', borderColor: '#5A463A' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...STATUS_FLOW].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border min-h-[36px]"
            style={filter === s
              ? { background: '#D96C2F', color: '#FFF7ED', borderColor: 'rgba(242,140,69,0.5)' }
              : { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
            {s === 'all' ? 'All Requests' : s}
            {s !== 'all' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: 'rgba(0,0,0,0.08)' }}>
                {requests.filter(r => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 text-slate-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold">No emergency requests {filter !== 'all' ? `with status "${filter}"` : 'found'}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => {
            const nextStatuses = getNextStatuses(req.status);
            const isUpdating = updating[req.id];
            const isDone = ['Completed', 'Cancelled'].includes(req.status);
            return (
              <div key={req.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                style={{ borderColor: req.status === 'New' ? 'rgba(239,68,68,0.3)' : '#e2e8f0' }}>
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100"
                  style={{ background: req.status === 'New' ? 'rgba(239,68,68,0.04)' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{req.id}</span>
                    <StatusBadge status={req.status} />
                    {req.status === 'New' && (
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={12} /> Needs Immediate Attention
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {formatTime(req.timestamp)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                    {/* Customer */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Customer</p>
                      <p className="font-bold text-slate-800">{req.name}</p>
                      <a href={`tel:${req.phone}`} className="flex items-center gap-1 text-xs mt-0.5 hover:underline" style={{ color: '#D96C2F' }}>
                        <Phone size={11} /> {req.phone}
                      </a>
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Location</p>
                      <p className="font-semibold text-slate-700 flex items-start gap-1">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />{req.location}
                      </p>
                    </div>

                    {/* Vehicle */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle</p>
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <Car size={13} className="shrink-0 text-slate-400" />{req.vehicleDetails || '—'}
                      </p>
                    </div>

                    {/* Breakdown Type */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Breakdown Type</p>
                      <p className="font-semibold text-slate-700">{req.breakdownType || req.issue || '—'}</p>
                    </div>

                    {/* Towing */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Towing Required</p>
                      <p className="font-semibold" style={{ color: req.towingRequired ? '#f87171' : '#34d399' }}>
                        {req.towingRequired ? '✓ Yes' : '✗ No (Fix on site)'}
                      </p>
                    </div>

                    {/* Description */}
                    {req.issue && req.breakdownType && (
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                        <p className="text-xs text-slate-500 italic leading-relaxed">{req.issue}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Pipeline visual */}
                  <div className="mb-4 overflow-x-auto">
                    <div className="flex items-center gap-0 min-w-max">
                      {STATUS_FLOW.filter(s => s !== 'Cancelled').map((s, idx, arr) => {
                        const currentIdx = STATUS_FLOW.indexOf(req.status);
                        const stepIdx = STATUS_FLOW.indexOf(s);
                        const isDone = stepIdx < currentIdx || (req.status !== 'Cancelled' && s === req.status && req.status === 'Completed');
                        const isActive = s === req.status && req.status !== 'Cancelled';
                        const isPending = stepIdx > currentIdx;
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                                style={{
                                  background: isDone ? '#10b981' : isActive ? '#D96C2F' : '#e2e8f0',
                                  borderColor: isDone ? '#10b981' : isActive ? '#D96C2F' : '#d1d5db',
                                }}>
                                {isDone && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                              </div>
                              <p className="text-[9px] font-bold mt-1 max-w-[52px] text-center leading-tight"
                                style={{ color: isDone ? '#10b981' : isActive ? '#D96C2F' : '#9ca3af' }}>{s}</p>
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

                  {/* Action buttons */}
                  {!isDone && nextStatuses.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map(ns => (
                        <button
                          key={ns}
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(req.id, ns)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border min-h-[36px]"
                          style={ns === 'Cancelled'
                            ? { background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' }
                            : { background: '#D96C2F', color: '#FFF7ED', borderColor: 'rgba(242,140,69,0.5)', opacity: isUpdating ? 0.6 : 1 }}>
                          {isUpdating ? '...' : ns === 'Cancelled' ? 'Mark Cancelled' : `→ ${ns}`}
                        </button>
                      ))}
                    </div>
                  )}
                  {isDone && (
                    <p className="text-xs font-semibold" style={{ color: req.status === 'Completed' ? '#34d399' : '#9A8070' }}>
                      {req.status === 'Completed' ? '✓ Request completed successfully.' : '✗ Request was cancelled.'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
