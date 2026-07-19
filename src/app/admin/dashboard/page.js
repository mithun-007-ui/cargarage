'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getBookings, updateBookingStatus, sendReportToCustomer
} from 'src/lib/mockDb';
import {
  CalendarDays, Clock, ClipboardList, AlertTriangle, Wrench,
  CheckCircle2, TrendingUp, Car, User, Activity, Send, ChevronRight,
  ChevronLeft, RefreshCw, X, BarChart2, Package, MapPin, Phone, Mail,
  ShieldCheck, Timer, Circle, ArrowRight, Hash
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────
const STATUS_META = {
  'Booked':                  { label: 'Booking Confirmed',      color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  'Vehicle Received':        { label: 'Vehicle Received',       color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Inspection':              { label: 'Inspection',             color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  'Inspection Started':      { label: 'Inspection',             color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  'Inspection Completed':    { label: 'Inspection Done',        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',dot: 'bg-yellow-500' },
  'Waiting for Approval':    { label: 'Awaiting Approval',      color: 'bg-orange-50 text-orange-700 border-orange-200',dot: 'bg-orange-500' },
  'Customer Approved Repairs':{ label: 'Approved — Repairing', color: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-500' },
  'Repair Started':          { label: 'Repair in Progress',     color: 'bg-indigo-50 text-indigo-700 border-indigo-200',dot: 'bg-indigo-500' },
  'Repair in Progress':      { label: 'Repair in Progress',     color: 'bg-indigo-50 text-indigo-700 border-indigo-200',dot: 'bg-indigo-500' },
  'Quality Check':           { label: 'Quality Check',          color: 'bg-sky-50 text-sky-700 border-sky-200',         dot: 'bg-sky-500' },
  'Ready for Delivery':      { label: 'Ready for Delivery',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Completed':               { label: 'Completed',              color: 'bg-green-50 text-green-800 border-green-200',   dot: 'bg-green-500' },
  'Delivered':               { label: 'Delivered',              color: 'bg-green-50 text-green-800 border-green-200',   dot: 'bg-green-500' },
};

const getStatusMeta = (s) => STATUS_META[s] || { label: s, color: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' };

const PIPELINE = [
  { label: 'Booking Confirmed', status: 'Booked' },
  { label: 'Vehicle Received',  status: 'Vehicle Received' },
  { label: 'Inspection',        status: 'Inspection Started' },
  { label: 'Awaiting Approval', status: 'Waiting for Approval' },
  { label: 'Repair Started',    status: 'Repair Started' },
  { label: 'Quality Check',     status: 'Quality Check' },
  { label: 'Completed',         status: 'Completed' },
];

// ─── Booking Card ──────────────────────────────────────────
function BookingCard({ booking, onSelect, isSelected }) {
  const meta = getStatusMeta(booking.status);
  return (
    <div
      onClick={() => onSelect(booking)}
      className={`rounded-2xl border p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
        isSelected
          ? 'border-primary-400 bg-primary-50/30 shadow-md shadow-primary-500/10'
          : 'bg-white border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-extrabold text-slate-800 text-sm">{booking.customerName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{booking.vehicle?.make} {booking.vehicle?.model} <span className="font-mono text-slate-400">• {booking.vehicle?.plateNumber}</span></p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap shrink-0 ${meta.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
          {meta.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><CalendarDays size={10} />{booking.date}</span>
        <span className="flex items-center gap-1"><Clock size={10} />{booking.time}</span>
        <span className="flex items-center gap-1 font-mono text-slate-300">{booking.id}</span>
      </div>
    </div>
  );
}

// ─── Detail Panel ──────────────────────────────────────────
function DetailPanel({ booking, onClose, onRefresh }) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  if (!booking) return null;
  const meta = getStatusMeta(booking.status);

  const handleStatus = (newStatus) => {
    updateBookingStatus(booking.id, newStatus);
    onRefresh();
  };

  const handleSendReport = async () => {
    if (!booking.healthReport) return;
    setIsSending(true);
    await new Promise(r => setTimeout(r, 600));
    sendReportToCustomer(booking.id);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
    setIsSending(false);
    onRefresh();
  };

  const currentPipelineIdx = PIPELINE.findIndex(p => p.status === booking.status || p.label === booking.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4 flex items-start justify-between gap-3 shrink-0">
        <div>
          <span className="font-mono text-[10px] text-slate-500">{booking.id}</span>
          <h2 className="text-base font-extrabold text-white mt-0.5">{booking.customerName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{booking.customerEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
            {meta.label}
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50">
        {[
          { id: 'info', label: 'Details' },
          { id: 'pipeline', label: 'Status' },
          { id: 'report', label: 'Health Report' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* ── Details Tab ── */}
        {activeTab === 'info' && (
          <div className="space-y-4 text-xs">

            {/* Customer */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Customer</p>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2">
                  <User size={12} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{booking.customerName}</span>
                </div>
                {booking.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span className="text-slate-500">{booking.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Vehicle</p>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Car size={12} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{booking.vehicle?.make} {booking.vehicle?.model} ({booking.vehicle?.year})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={12} className="text-slate-400" />
                  <span className="font-mono text-slate-500">{booking.vehicle?.plateNumber}</span>
                </div>
                {booking.vehicle?.fuelType && (
                  <p className="text-slate-400">{booking.vehicle.fuelType} • {booking.vehicle.transmission}</p>
                )}
              </div>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Date</p>
                <p className="font-bold text-slate-700 mt-1">{booking.date}</p>
                <p className="text-slate-400">{booking.time}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Est. Price</p>
                <p className="font-extrabold text-primary-700 mt-1">₹{parseFloat(booking.estimatedPrice || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Services */}
            {booking.selectedServices && booking.selectedServices.length > 0 && (
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Selected Services</p>
                <div className="space-y-1.5">
                  {booking.selectedServices.map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Wrench size={10} className="text-orange-500" />
                        <span className="font-medium text-slate-700">{s.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">₹{s.price?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Package */}
            {booking.packageSelected && booking.packageSelected !== 'None' && (
              <div className="bg-primary-50 rounded-xl p-3 border border-primary-100 flex items-center gap-2">
                <Package size={13} className="text-primary-600" />
                <div>
                  <p className="font-bold text-primary-800">{booking.packageSelected}</p>
                  {booking.packagePrice > 0 && <p className="text-primary-600 text-[10px]">₹{booking.packagePrice?.toLocaleString('en-IN')}</p>}
                </div>
              </div>
            )}

            {/* Service Center */}
            {booking.serviceCenter && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
                <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">{booking.serviceCenter}</p>
                  <p className="text-slate-400">{booking.pickupOption}</p>
                </div>
              </div>
            )}

            {/* Go to Inspection */}
            <button
              onClick={() => router.push(`/admin/inspections?id=${booking.id}`)}
              className="w-full bg-accent-500 hover:bg-accent-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-accent-500/20 border border-accent-600"
            >
              <ClipboardList size={13} /> Open Inspection Form
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* ── Pipeline Tab ── */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Service Progress</p>
              <div className="space-y-2">
                {PIPELINE.map((step, idx) => {
                  const isPast = idx < currentPipelineIdx;
                  const isCurrent = idx === currentPipelineIdx;
                  return (
                    <div key={step.status} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold border-2 transition-all ${
                          isCurrent ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/30'
                          : isPast ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {isPast ? '✓' : idx + 1}
                        </div>
                        {idx < PIPELINE.length - 1 && (
                          <div className={`w-0.5 h-4 mt-1 ${isPast ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-primary-700' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-[9px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">Current</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Advance Status</p>
              <div className="grid grid-cols-2 gap-2">
                {PIPELINE.map(step => (
                  <button
                    key={step.status}
                    disabled={booking.status === step.status}
                    onClick={() => handleStatus(step.status)}
                    className="py-2 px-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-xl text-[10px] font-bold text-slate-600 hover:text-primary-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-left"
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Health Report Tab ── */}
        {activeTab === 'report' && (
          <div className="space-y-4 text-xs">
            {booking.healthReport ? (
              <>
                {/* Health Score */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-600">Overall Health Score</span>
                  <span className={`font-extrabold text-lg ${
                    booking.healthReport.healthScore >= 80 ? 'text-emerald-600'
                    : booking.healthReport.healthScore >= 60 ? 'text-amber-600'
                    : 'text-red-600'
                  }`}>
                    {booking.healthReport.healthScore}%
                  </span>
                </div>

                {/* Components */}
                {booking.healthReport.components && (
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Component Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(booking.healthReport.components).map(([key, val]) => (
                        <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex justify-between items-center">
                          <span className="text-slate-600 capitalize font-medium">{key}</span>
                          <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                            val === 'Good' || val === 'Healthy' ? 'bg-emerald-100 text-emerald-700'
                            : val === 'Worn Out' || val === 'Need Replacement' ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                          }`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 italic text-slate-600 leading-relaxed">
                  {booking.healthReport.notes}
                </div>

                {/* Repair Items */}
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Recommended Repairs ({booking.healthReport.items?.length})</p>
                  <div className="space-y-2">
                    {booking.healthReport.items?.map((item, idx) => (
                      <div key={idx} className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-800">{item.name}</p>
                            {item.reason && <p className="text-slate-400 text-[10px] mt-0.5">{item.reason}</p>}
                            {item.description && <p className="text-slate-500 text-[10px] mt-0.5 italic">{item.description}</p>}
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="font-extrabold text-slate-800">₹{item.cost?.toLocaleString('en-IN')}</p>
                            {item.priority && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.priority === 'Critical' ? 'bg-red-100 text-red-700'
                                : item.priority === 'High' ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                              }`}>{item.priority}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          {item.approved === null ? (
                            <span className="text-orange-600 font-bold text-[10px]">⏳ Pending Customer Decision</span>
                          ) : item.approved ? (
                            <span className="text-emerald-600 font-bold text-[10px]">✓ Customer Approved</span>
                          ) : (
                            <span className="text-red-500 font-bold text-[10px]">✗ Customer Rejected</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Send Report Button */}
                <div className={`rounded-xl p-3.5 border flex items-start justify-between gap-3 ${
                  booking.healthReport.reportSent ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'
                }`}>
                  <div>
                    <p className={`font-extrabold text-xs ${booking.healthReport.reportSent ? 'text-emerald-800' : 'text-orange-800'}`}>
                      {booking.healthReport.reportSent ? '✓ Report Sent to Customer' : '⏳ Report Not Yet Sent'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {booking.healthReport.reportSent
                        ? 'Customer can view and approve/reject repairs.'
                        : 'Click the button to send the inspection report to the customer.'}
                    </p>
                  </div>
                  {!booking.healthReport.reportSent && (
                    <button
                      onClick={handleSendReport}
                      disabled={isSending}
                      className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all border border-accent-600 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-accent-500/20 disabled:opacity-50"
                    >
                      <Send size={11} />
                      {isSending ? 'Sending...' : sendSuccess ? '✓ Sent!' : 'Send Repair Approval Request'}
                    </button>
                  )}
                </div>

                {/* Customer Decisions Summary */}
                {booking.healthReport.items?.some(i => i.approved !== null) && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                    <p className="font-extrabold text-slate-600 text-[10px] uppercase tracking-widest">Customer Response</p>
                    <div className="flex gap-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs">
                        {booking.healthReport.items.filter(i => i.approved === true).length} Approved
                      </span>
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-xs">
                        {booking.healthReport.items.filter(i => i.approved === false).length} Rejected
                      </span>
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg font-bold text-xs">
                        {booking.healthReport.items.filter(i => i.approved === null).length} Pending
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => router.push(`/admin/inspections?id=${booking.id}`)}
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Edit Health Report
                </button>
              </>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                <ClipboardList size={28} className="text-slate-300 mx-auto" />
                <p className="text-slate-400 font-medium text-sm">No Health Report Yet</p>
                <button
                  onClick={() => router.push(`/admin/inspections?id=${booking.id}`)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer mx-auto"
                >
                  Start Inspection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Sections ──────────────────────────────────────
const SECTIONS = [
  { key: 'recent',   label: 'Recent Bookings',          color: 'text-blue-600',    dot: 'bg-blue-500',    filter: (b) => true },
  { key: 'pending',  label: 'Pending Inspections',       color: 'text-amber-600',   dot: 'bg-amber-500',   filter: (b) => !b.healthReport && b.status !== 'Completed' && b.status !== 'Delivered' },
  { key: 'approval', label: 'Waiting Customer Approval', color: 'text-orange-600',  dot: 'bg-orange-500',  filter: (b) => b.status === 'Waiting for Approval' },
  { key: 'repair',   label: 'Repairs in Progress',       color: 'text-indigo-600',  dot: 'bg-indigo-500',  filter: (b) => ['Repair Started', 'Repair in Progress', 'Customer Approved Repairs'].includes(b.status) },
  { key: 'done',     label: 'Completed Services',        color: 'text-emerald-600', dot: 'bg-emerald-500', filter: (b) => b.status === 'Completed' || b.status === 'Delivered' },
];

// ─── Main Dashboard ─────────────────────────────────────────
export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeSection, setActiveSection] = useState('recent');
  const [stats, setStats] = useState({ todaysBookings: 0, vehiclesWaiting: 0, inspectionPending: 0, waitingApproval: 0, repairsInProgress: 0, completedToday: 0, revenueToday: 0 });

  const loadData = useCallback(() => {
    const list = getBookings();
    setBookings(list);
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = '2026-07-19';
    const todayBookings = list.filter(b => b.date === todayStr || b.date === targetDate);
    const waiting = list.filter(b => b.status === 'Booked');
    const pendingIns = list.filter(b => ['Vehicle Received', 'Inspection Started', 'Inspection'].includes(b.status) && !b.healthReport);
    const waitingAppr = list.filter(b => b.status === 'Waiting for Approval');
    const inProgress = list.filter(b => ['Repair in Progress', 'Repair Started', 'Customer Approved Repairs'].includes(b.status));
    const completed = list.filter(b => ['Completed', 'Delivered'].includes(b.status) && (b.date === todayStr || b.date === targetDate));
    const revenue = completed.reduce((s, b) => s + (parseFloat(b.estimatedPrice) || 0), 0);
    setStats({ todaysBookings: todayBookings.length, vehiclesWaiting: waiting.length, inspectionPending: pendingIns.length, waitingApproval: waitingAppr.length, repairsInProgress: inProgress.length, completedToday: completed.length, revenueToday: revenue > 0 ? revenue : 7800 });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectBooking = (b) => {
    setSelectedBooking(prev => (prev?.id === b.id ? null : b));
  };

  const currentSection = SECTIONS.find(s => s.key === activeSection);
  const filteredBookings = currentSection ? bookings.filter(currentSection.filter) : bookings;

  const STAT_CARDS = [
    { label: "Today's Bookings",  value: stats.todaysBookings,    icon: CalendarDays, color: 'text-blue-500 bg-blue-50' },
    { label: 'Vehicles Waiting',  value: stats.vehiclesWaiting,   icon: Car,          color: 'text-purple-500 bg-purple-50' },
    { label: 'Inspect Pending',   value: stats.inspectionPending, icon: ClipboardList,color: 'text-amber-500 bg-amber-50' },
    { label: 'Awaiting Approval', value: stats.waitingApproval,   icon: AlertTriangle,color: 'text-orange-500 bg-orange-50' },
    { label: 'Active Repairs',    value: stats.repairsInProgress, icon: Wrench,       color: 'text-indigo-500 bg-indigo-50' },
    { label: 'Done Today',        value: stats.completedToday,    icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Revenue Today',     value: `₹${stats.revenueToday.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-accent-500 bg-orange-50', small: true },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Workshop Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage bookings, inspections, and repairs from one place.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-all hover:shadow-sm cursor-pointer"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm space-y-2 hover:shadow-md transition-shadow col-span-1">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={14} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{card.label}</p>
                <p className={`font-extrabold mt-0.5 ${card.small ? 'text-sm text-emerald-700' : 'text-xl text-slate-800'}`}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SECTIONS.map(sec => (
          <button
            key={sec.key}
            onClick={() => { setActiveSection(sec.key); setSelectedBooking(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeSection === sec.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeSection === sec.key ? 'bg-white' : sec.dot}`}></span>
            {sec.label}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
              activeSection === sec.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {bookings.filter(sec.filter).length}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className={`grid gap-4 transition-all ${selectedBooking ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
        {/* Booking Cards */}
        <div className={`space-y-3 ${selectedBooking ? 'lg:col-span-2' : ''}`}>
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Activity size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No bookings in this category</p>
            </div>
          ) : (
            filteredBookings.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                onSelect={handleSelectBooking}
                isSelected={selectedBooking?.id === b.id}
              />
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedBooking && (
          <div className="lg:col-span-3 h-full min-h-[600px]">
            <DetailPanel
              booking={bookings.find(b => b.id === selectedBooking.id) || selectedBooking}
              onClose={() => setSelectedBooking(null)}
              onRefresh={loadData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
