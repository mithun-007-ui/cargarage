'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { getBookings } from 'src/lib/mockDb';
import { Users, Search, Car, Calendar, Mail } from 'lucide-react';

export default function AdminCustomersPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');

  const load = useCallback(() => setBookings(getBookings()), []);
  useEffect(() => { load(); }, [load]);

  // Deduplicate by email
  const customers = Object.values(
    bookings.reduce((acc, b) => {
      const email = b.customerEmail?.toLowerCase() || 'unknown';
      if (!acc[email]) {
        acc[email] = {
          name: b.customerName || '—',
          email: b.customerEmail || '—',
          bookings: [],
          totalSpend: 0,
        };
      }
      acc[email].bookings.push(b);
      acc[email].totalSpend += b.estimatedPrice || 0;
      return acc;
    }, {})
  );

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Customers
          </h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} unique customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-orange-400" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">No customers found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.email} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: '#D96C2F' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 truncate"><Mail size={10} />{c.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Bookings</p>
                  <p className="text-lg font-extrabold text-slate-800 flex items-center justify-center gap-1">
                    <Calendar size={13} className="text-orange-400" />{c.bookings.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Total Spend</p>
                  <p className="text-lg font-extrabold text-slate-800">₹{c.totalSpend.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                {c.bookings.slice(0, 2).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <span className="flex items-center gap-1"><Car size={10} />{b.vehicle?.make} {b.vehicle?.model}</span>
                    <span className="font-mono text-slate-400">{b.id}</span>
                  </div>
                ))}
                {c.bookings.length > 2 && (
                  <p className="text-[10px] text-slate-400 text-center">+{c.bookings.length - 2} more booking{c.bookings.length - 2 > 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
