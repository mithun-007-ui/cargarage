'use client';

import React from 'react';
import { Users, Search, Filter, Plus } from 'lucide-react';

export default function AdminCustomersPage() {
  const dummyCustomers = [
    { name: 'John Doe', email: 'user@gmail.com', phone: '+1 (555) 019-2834', status: 'Active', bookingsCount: 1 },
    { name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 014-9844', status: 'Active', bookingsCount: 1 },
    { name: 'Michael Chang', email: 'm.chang@example.com', phone: '+1 (555) 012-7722', status: 'Active', bookingsCount: 1 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-accent-500" />
            Customer Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review registered user accounts, diagnostic histories, and feedback records.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary-600/10 cursor-pointer">
          <Plus size={14} />
          Register Customer
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            placeholder="Search customers..."
          />
        </div>
        <button className="border border-slate-250 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 bg-white cursor-pointer w-full sm:w-auto justify-center">
          <Filter size={14} />
          Filter Options
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Bookings</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dummyCustomers.map((cust, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-800">{cust.name}</td>
                  <td className="px-6 py-4 text-slate-650">{cust.email}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{cust.phone}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-center">{cust.bookingsCount}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px]">
                      {cust.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
