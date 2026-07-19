'use client';

import React from 'react';
import { Calendar, Clock, Car, ChevronRight, Eye } from 'lucide-react';

export default function BookingTable({ bookings, onActionClick, onSelect }) {
  const getStatusBadge = (status) => {
    const configs = {
      'Booked': 'bg-blue-50 text-blue-700 border-blue-100',
      'Vehicle Received': 'bg-purple-50 text-purple-700 border-purple-100',
      'Inspection': 'bg-amber-50 text-amber-700 border-amber-100',
      'Waiting for Approval': 'bg-orange-50 text-orange-700 border-orange-100',
      'Repair in Progress': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };

    const style = configs[status] || 'bg-slate-50 text-slate-700 border-slate-100';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
        {status}
      </span>
    );
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <p className="text-slate-400 font-medium">No bookings found matching filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service & Package</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((booking) => (
              <tr 
                key={booking.id} 
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => onSelect && onSelect(booking)}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{booking.customerName}</p>
                    <p className="text-xs text-slate-400">{booking.customerEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {booking.vehicle.make} {booking.vehicle.model}
                      </p>
                      <p className="text-xs font-mono text-slate-400">{booking.vehicle.plateNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{booking.serviceType}</p>
                    <p className="text-xs text-slate-400">
                      Package: <span className="font-medium text-primary-600">{booking.packageSelected}</span>
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={13} className="text-accent-500" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={13} className="text-slate-400" />
                      <span>{booking.time}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    {onActionClick && (
                      <button
                        onClick={() => onActionClick(booking)}
                        className="bg-primary-50 text-primary-700 hover:bg-primary-100 hover:text-primary-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Manage
                        <ChevronRight size={14} />
                      </button>
                    )}
                    {onSelect && (
                      <button
                        onClick={() => onSelect(booking)}
                        className="border border-slate-200 text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
