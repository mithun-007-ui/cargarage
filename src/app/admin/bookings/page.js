'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { getBookings, updateBookingStatus, assignTechnician } from 'src/lib/mockDb';
import { ClipboardList, Search, RefreshCw, Car, Calendar, Clock, User, Wrench } from 'lucide-react';

const STATUS_COLORS = {
  'Booked':              { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
  'Booking Confirmed':   { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
  'Vehicle Received':    { bg: '#FFF7ED', color: '#D96C2F', border: '#FED7AA' },
  'Inspection Pending':  { bg: '#FEFCE8', color: '#CA8A04', border: '#FEF08A' },
  'Waiting for Approval':{ bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  'Repair in Progress':  { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'Completed':           { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'Cancelled':           { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS['Cancelled'];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [techInput, setTechInput] = useState({});

  const load = useCallback(() => setBookings(getBookings()), []);
  useEffect(() => { load(); }, [load]);

  const statuses = ['all', ...new Set(bookings.map(b => b.status))];
  const filtered = bookings.filter(b => {
    const matchesSearch = !search ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.id?.toLowerCase().includes(search.toLowerCase()) ||
      `${b.vehicle?.make} ${b.vehicle?.model}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAssign = (id) => {
    const name = techInput[id]?.trim();
    if (!name) return;
    assignTechnician(id, name);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <ClipboardList size={20} className="text-orange-500" /> All Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1">{bookings.length} total bookings</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border self-start"
          style={{ background: '#2B211C', color: '#D8C8B8', borderColor: '#5A463A' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or vehicle…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-orange-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none">
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">No bookings found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{b.id}</span>
                  <Badge status={b.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><User size={13} />{b.customerName}</span>
                  <span className="flex items-center gap-1"><Car size={13} />{b.vehicle?.make} {b.vehicle?.model}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} />{b.date}</span>
                  <span className="flex items-center gap-1"><Clock size={13} />{b.time}</span>
                  <span className="font-bold text-slate-800">₹{b.estimatedPrice?.toLocaleString()}</span>
                </div>
              </div>
              {expandedId === b.id && (
                <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50 space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Customer Email</p><p>{b.customerEmail || '—'}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Services</p><p>{b.selectedServices?.map(s => s.name).join(', ') || '—'}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Package</p><p>{b.packageSelected || 'None'}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Service Center</p><p>{b.serviceCenter || '—'}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Pickup Option</p><p>{b.pickupOption || '—'}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Created</p><p>{fmt(b.createdAt)}</p></div>
                  </div>
                  {/* Assign technician */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Wrench size={12} /> Assign Technician:</span>
                    <input value={techInput[b.id] || b.technician || ''}
                      onChange={e => setTechInput(prev => ({ ...prev, [b.id]: e.target.value }))}
                      placeholder="Technician name"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-400" />
                    <button onClick={() => handleAssign(b.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                      style={{ background: '#D96C2F' }}>Assign</button>
                  </div>
                  {/* Status change */}
                  <div className="flex flex-wrap gap-2">
                    {['Vehicle Received', 'Inspection Pending', 'Repair in Progress', 'Completed', 'Cancelled'].map(s => (
                      <button key={s} onClick={() => { updateBookingStatus(b.id, s); load(); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer"
                        style={b.status === s
                          ? { background: '#D96C2F', color: '#FFF7ED', borderColor: 'rgba(217,108,47,0.5)' }
                          : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
