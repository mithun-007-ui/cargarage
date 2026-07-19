'use client';

import React, { useState, useEffect } from 'react';
import { getBookings } from 'src/lib/mockDb';
import { CheckSquare, ArrowRight, User, Car, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminApprovalsPage() {
  const [approvalsList, setApprovalsList] = useState([]);

  useEffect(() => {
    const list = getBookings();
    // Filter bookings that have a health report
    const withReports = list.filter(b => b.healthReport);
    setApprovalsList(withReports);
  }, []);

  const getApprovalCounts = (report) => {
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    report.items.forEach((item) => {
      if (item.approved === true) approved++;
      else if (item.approved === false) rejected++;
      else pending++;
    });

    return { approved, rejected, pending, total: report.items.length };
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <CheckSquare className="text-accent-500" />
          Repair Approvals Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">Monitor user decisions on recommended repair tasks and track approved invoice costs.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer & Vehicle</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnostic Observation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Summary</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {approvalsList.map((booking) => {
                const { approved, rejected, pending, total } = getApprovalCounts(booking.healthReport);
                return (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 space-y-1">
                      <p className="font-bold text-slate-850">{booking.customerName}</p>
                      <p className="text-slate-400 font-mono text-[10px]">{booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.plateNumber})</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-500 line-clamp-1 italic max-w-xs">"{booking.healthReport.notes}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          <ThumbsUp size={12} /> {approved}
                        </span>
                        <span className="flex items-center gap-1 text-red-650 bg-red-50 px-2 py-0.5 rounded font-bold">
                          <ThumbsDown size={12} /> {rejected}
                        </span>
                        {pending > 0 && (
                          <span className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-0.5 rounded font-bold animate-pulse">
                            <Clock size={12} /> {pending} pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full font-bold border text-[10px] bg-slate-50 text-slate-600 border-slate-100">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/bookings?id=${booking.id}`}
                        className="bg-primary-50 hover:bg-primary-100 text-primary-750 hover:text-primary-800 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        Manage
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {approvalsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No active approvals checklists found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
