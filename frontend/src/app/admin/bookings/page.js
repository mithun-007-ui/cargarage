'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookingTable from 'src/components/BookingTable';
import { getBookings, getBookingById, updateBookingStatus } from 'src/lib/mockDb';
import { Calendar, Clock, Car, User, ClipboardList, CheckCircle, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // Load and refresh list
  const refreshList = () => {
    const list = getBookings();
    setBookings(list);

    if (highlightId) {
      const match = list.find(b => b.id === highlightId);
      if (match) setSelectedBooking(match);
    } else if (list.length > 0 && !selectedBooking) {
      setSelectedBooking(list[0]);
    }
  };

  useEffect(() => {
    refreshList();
  }, [highlightId]);

  const handleStatusChange = (bookingId, newStatus) => {
    const updated = updateBookingStatus(bookingId, newStatus);
    if (updated) {
      setSelectedBooking(updated);
      refreshList();
    }
  };

  const handleCreateInspection = (bookingId) => {
    router.push(`/admin/inspections?id=${bookingId}`);
  };

  const statuses = ['All', 'Booked', 'Vehicle Received', 'Inspection', 'Waiting for Approval', 'Repair in Progress', 'Completed'];

  const filteredBookings = filterStatus === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manage Appointments</h1>
        <p className="text-sm text-slate-400 mt-1">Track vehicle lifecycles, update repair status codes, and issue health clearances.</p>
      </div>

      {/* Filter tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === status
                ? 'bg-primary-800 text-white shadow-md shadow-primary-900/10'
                : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table list Column */}
        <div className="lg:col-span-7 space-y-4">
          <BookingTable
            bookings={filteredBookings}
            onActionClick={(b) => setSelectedBooking(b)}
            onSelect={(b) => setSelectedBooking(b)}
          />
        </div>

        {/* Detailed details panel Column */}
        <div className="lg:col-span-5">
          {selectedBooking ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6 sticky top-24">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedBooking.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-850 mt-2">{selectedBooking.customerName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Current Status</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Status Update Selectors */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Advance Service Phase</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Receive Vehicle', status: 'Vehicle Received' },
                    { label: 'Inspect & Diag', status: 'Inspection' },
                    { label: 'Begin Repairs', status: 'Repair in Progress' },
                    { label: 'Finalize & Complete', status: 'Completed' }
                  ].map((act) => (
                    <button
                      key={act.status}
                      disabled={selectedBooking.status === act.status}
                      onClick={() => handleStatusChange(selectedBooking.id, act.status)}
                      className="py-2 px-3 bg-white hover:bg-primary-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-primary-800 transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 cursor-pointer"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle & Customer cards */}
              <div className="space-y-4 text-xs">
                {/* Vehicle details */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Car size={16} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Vehicle Specs</p>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {selectedBooking.vehicle.make} {selectedBooking.vehicle.model} ({selectedBooking.vehicle.year})
                    </p>
                    <p className="font-mono text-slate-400 mt-0.5">{selectedBooking.vehicle.plateNumber}</p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Customer Contact</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedBooking.customerEmail}</p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-wider">Job Setup</p>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      Service: <strong className="text-slate-800">{selectedBooking.serviceType}</strong>
                    </p>
                    <p className="text-slate-500 mt-0.5">Package Upgrade: {selectedBooking.packageSelected}</p>
                  </div>
                </div>
              </div>

              {/* Health Report Status */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Health Report</h3>
                  {!selectedBooking.healthReport && (
                    <button
                      onClick={() => handleCreateInspection(selectedBooking.id)}
                      className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-accent-600 cursor-pointer"
                    >
                      Create Report
                    </button>
                  )}
                </div>

                {selectedBooking.healthReport ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="bg-slate-50 rounded-xl p-3 text-slate-500 border border-slate-100 italic">
                      "{selectedBooking.healthReport.notes}"
                    </div>
                    
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-3 py-2 text-slate-500 font-bold">Recommended Part/Repair</th>
                            <th className="px-3 py-2 text-slate-500 font-bold text-center">Cost</th>
                            <th className="px-3 py-2 text-slate-500 font-bold text-right">Approval</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedBooking.healthReport.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-slate-700 font-semibold">{item.name}</td>
                              <td className="px-3 py-2 text-slate-800 font-bold text-center">${item.cost}</td>
                              <td className="px-3 py-2 text-right">
                                {item.approved === null ? (
                                  <span className="text-orange-500 font-bold">Pending</span>
                                ) : item.approved ? (
                                  <span className="text-emerald-600 font-bold">Approved</span>
                                ) : (
                                  <span className="text-red-500 font-bold">Declined</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreateInspection(selectedBooking.id)}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-2 rounded-xl font-bold transition-all text-center cursor-pointer"
                      >
                        Modify Report
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                    No Health Report created yet. Click above to define diagnostics.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center text-slate-400">
              Select an appointment from the list to display details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
