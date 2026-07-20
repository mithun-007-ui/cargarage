'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/context/AuthContext';
import {
  getBookings, getNotifications, markNotificationsAsRead,
  getUnreadNotificationsCount, updateHealthReportItem
} from 'src/lib/mockDb';
import {
  Car, CalendarDays, ClipboardList, FileText, CheckSquare, Receipt,
  History, Bell, ChevronRight, Lock, Check, X, Activity,
  AlertTriangle, ShieldCheck, Clock, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const PIPELINE_STEPS = [
  { label: 'Booked', key: 'Booked' },
  { label: 'Vehicle Received', key: 'Vehicle Received' },
  { label: 'Inspection Started', key: 'Inspection Started' },
  { label: 'Inspection Done', key: 'Inspection Completed' },
  { label: 'Awaiting Approval', key: 'Waiting for Approval' },
  { label: 'Repairs Approved', key: 'Customer Approved Repairs' },
  { label: 'Repair Started', key: 'Repair Started' },
  { label: 'Quality Check', key: 'Quality Check' },
  { label: 'Ready', key: 'Ready for Delivery' },
  { label: 'Delivered', key: 'Delivered' },
];

const STATUS_BADGE = {
  'Booked': 'bg-blue-50 text-blue-700 border-blue-100',
  'Vehicle Received': 'bg-purple-50 text-purple-700 border-purple-100',
  'Inspection Started': 'bg-amber-50 text-amber-700 border-amber-100',
  'Inspection Completed': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Waiting for Approval': 'bg-orange-50 text-orange-700 border-orange-100',
  'Customer Approved Repairs': 'bg-teal-50 text-teal-700 border-teal-100',
  'Repair Started': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Quality Check': 'bg-sky-50 text-sky-700 border-sky-100',
  'Ready for Delivery': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Delivered': 'bg-green-50 text-green-850 border-green-100',
};

// ───── TAB COMPONENTS ─────

function MyVehiclesTab({ bookings }) {
  const vehicles = Array.from(
    new Map(bookings.map(b => [b.vehicle.plateNumber, b.vehicle])).values()
  );
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-gray-800">My Vehicles</h2>
      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">
          No vehicles registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {vehicles.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-orange-100" style={{ background: '#FFF3EE', color: '#E65313' }}>
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800">{v.make} {v.model}</h3>
                  <p className="font-mono text-xs text-gray-400">{v.plateNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['Year', v.year], ['Fuel', v.fuelType], ['Transmission', v.transmission], ['KM Reading', v.kmReading ? `${v.kmReading} km` : 'N/A']].map(([k, val]) => (
                  <div key={k} className="rounded-lg p-2 border border-gray-100" style={{ background: '#F8F5F0' }}>
                    <p className="text-gray-400 text-[10px] font-bold uppercase">{k}</p>
                    <p className="font-semibold text-gray-700 mt-0.5">{val || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackServiceTab({ bookings }) {
  // Generates a mock timestamp offset from now (hours back or forward)
  function mockTime(hoursOffset) {
    const d = new Date();
    d.setHours(d.getHours() + hoursOffset);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Step metadata: done steps get a past time, current = 'In Progress', future = expected
  function getStepMeta(idx, currentStep) {
    const hoursBack = (currentStep - idx) * 4; // each step ~4h apart
    const hoursFwd = (idx - currentStep) * 6;
    if (idx < currentStep) return { state: 'done', time: mockTime(-hoursBack) };
    if (idx === currentStep) return { state: 'active' };
    return { state: 'pending', time: mockTime(hoursFwd) };
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-gray-800">Track Service</h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white">
          <Clock size={36} className="mx-auto mb-3 text-gray-300" />
          No active bookings to track.
        </div>
      ) : (
        bookings.map(b => {
          const currentStep = Math.max(PIPELINE_STEPS.findIndex(s => s.key === b.status), 0);
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Booking Header */}
              <div className="p-5 flex flex-wrap items-center justify-between gap-3 text-white" style={{ background: '#211F1D' }}>
                <div>
                  <p className="font-mono text-xs text-gray-400">{b.id}</p>
                  <h3 className="font-extrabold text-base mt-0.5">{b.vehicle.make} {b.vehicle.model}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{b.vehicle.plateNumber} &bull; {b.date} {b.time ? `at ${b.time}` : ''}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_BADGE[b.status] || 'bg-slate-700 text-slate-200 border-slate-600'}`}>
                  {b.status}
                </span>
              </div>

              {/* ── Amazon-style vertical timeline ── */}
              <div className="p-5 md:p-7">
                <div className="space-y-0">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const { state, time } = getStepMeta(idx, currentStep);
                    const isLast = idx === PIPELINE_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        {/* Icon + connector */}
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            state === 'done' ? 'bg-green-600 shadow-sm shadow-green-600/30'
                            : state === 'active' ? 'bg-[#E65313] shadow-md shadow-orange-600/40 ring-4 ring-orange-100'
                            : 'bg-white border border-gray-200'
                          }`}>
                            {state === 'done' && <Check size={16} strokeWidth={3} className="text-white" />}
                            {state === 'active' && (
                              <span className="w-3 h-3 bg-white rounded-full block animate-pulse" />
                            )}
                            {state === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-gray-300 block" />}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                              state === 'done' ? 'bg-green-650' : 'bg-gray-200'
                            }`} style={{ background: state === 'done' ? '#16A34A' : '#E2D8CE' }} />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="pb-5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <p className={`text-base font-bold leading-snug ${
                              state === 'done' ? 'text-green-700'
                              : state === 'active' ? 'text-[#E65313]'
                              : 'text-gray-400'
                            }`}>
                              {step.label}
                            </p>
                            {state === 'active' && (
                              <span className="text-xs font-bold animate-pulse px-2 py-0.5 rounded-full" style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}>
                                In Progress
                              </span>
                            )}
                          </div>
                          {state === 'done' && time && (
                            <p className="text-xs text-green-600 font-semibold mt-0.5 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Completed &bull; {time}
                            </p>
                          )}
                          {state === 'pending' && time && (
                            <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                              <Clock size={11} /> Expected &bull; {time}
                            </p>
                          )}
                          {state === 'active' && b.technicianAssigned && (
                            <p className="text-xs font-semibold mt-0.5 text-gray-600">
                              Technician: {b.technicianAssigned}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function HealthReportsTab({ bookings }) {
  const withReports = bookings.filter(b => b.healthReport?.reportSent);
  const getScoreColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';
  const COMPONENT_STATUS_DOT = { 'Good': 'bg-green-500', 'Healthy': 'bg-green-500', 'Worn Out': 'bg-red-500', 'Need Replacement': 'bg-red-500', 'Gas Low': 'bg-amber-500', 'Low': 'bg-amber-500' };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-gray-800">Vehicle Health Reports</h2>
      {withReports.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed rounded-2xl bg-white border-gray-200">
          <FileText size={36} className="mx-auto mb-3 text-gray-300" />
          No reports have been shared with you yet.
        </div>
      ) : (
        withReports.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 flex justify-between items-center gap-4 text-white" style={{ background: '#211F1D' }}>
              <div>
                <p className="text-xs text-gray-400 font-mono">{b.id}</p>
                <h3 className="font-extrabold">{b.vehicle.make} {b.vehicle.model}</h3>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Health Score</p>
                <p className={`text-2xl font-black ${getScoreColor(b.healthReport.healthScore)}`}>{b.healthReport.healthScore}%</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Component grid */}
              {b.healthReport.components && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(b.healthReport.components).map(([key, val]) => {
                    const dotColor = COMPONENT_STATUS_DOT[val] || 'bg-gray-400';
                    const label = { engine: 'Engine', brakes: 'Brakes', battery: 'Battery', tyres: 'Tyres', suspension: 'Suspension', ac: 'AC System' }[key] || key;
                    return (
                      <div key={key} className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                          <span className="text-[10px] font-bold text-gray-500">{val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Notes */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs italic text-gray-500">"{b.healthReport.notes}"</div>
              {/* Navigate to repair approval */}
              {b.status === 'Waiting for Approval' && (
                <Link href={`/repair-approval?id=${b.id}`} className="w-full bg-[#E65313] hover:opacity-95 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                  <AlertTriangle size={14} /> Review & Approve Repairs
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RepairApprovalsTab({ bookings, onDecisionSubmit }) {
  const [choices, setChoices] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitted, setSubmitted] = useState({});

  const eligible = bookings.filter(b => b.healthReport?.reportSent && b.status === 'Waiting for Approval');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-gray-800">Repair Approvals</h2>
      {eligible.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed rounded-2xl bg-white border-gray-200">
          <CheckSquare size={36} className="mx-auto mb-3 text-gray-300" />
          No repair approvals pending.
        </div>
      ) : (
        eligible.map(b => {
          const bookingChoices = choices[b.id] || {};
          const items = b.healthReport.items;
          const allDecided = items.every((_, idx) => bookingChoices[idx] !== undefined);
          const approvedTotal = items.filter((item, idx) => bookingChoices[idx] === true).reduce((s, item) => s + item.cost, 0);
          const rejectedTotal = items.filter((item, idx) => bookingChoices[idx] === false).reduce((s, item) => s + item.cost, 0);
          const basePrice = parseFloat(b.estimatedPrice) || 0;

          const handleToggle = (bId, idx, val) => {
            setChoices(prev => ({
              ...prev,
              [bId]: { ...(prev[bId] || {}), [idx]: val }
            }));
          };

          const handleSubmit = async (bId) => {
            setSubmitting(prev => ({ ...prev, [bId]: true }));
            await new Promise(r => setTimeout(r, 700));
            const bChoices = choices[bId] || {};
            Object.keys(bChoices).forEach(idxStr => {
              updateHealthReportItem(bId, parseInt(idxStr), bChoices[idxStr]);
            });
            setSubmitted(prev => ({ ...prev, [bId]: true }));
            setSubmitting(prev => ({ ...prev, [bId]: false }));
            if (onDecisionSubmit) onDecisionSubmit();
          };

          const PRIORITY_BADGE = { 'High': 'bg-red-50 text-red-700 border-red-100', 'Medium': 'bg-amber-50 text-amber-700 border-amber-100', 'Low': 'bg-green-50 text-green-700 border-green-100' };

          return (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 text-white" style={{ background: '#211F1D' }}>
                <p className="text-xs text-gray-400 font-mono">{b.id} • {b.vehicle.make} {b.vehicle.model}</p>
                <h3 className="font-extrabold mt-0.5">Review Recommended Repairs</h3>
              </div>

              {submitted[b.id] ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-50 text-green-650 rounded-full flex items-center justify-center mx-auto border border-green-100">
                    <ShieldCheck size={28} />
                  </div>
                  <p className="font-extrabold text-gray-800">Decision Submitted!</p>
                  <p className="text-xs text-gray-400">The workshop has been notified of your choices.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className={`border rounded-2xl p-4 transition-all ${
                      bookingChoices[idx] === true ? 'border-green-200 bg-green-50/10' :
                      bookingChoices[idx] === false ? 'border-red-200 bg-red-50/10' :
                      'border-gray-150 bg-white'
                    }`} style={{ borderColor: bookingChoices[idx] === true ? '#BBF7D0' : bookingChoices[idx] === false ? '#FECACA' : '#E2D8CE' }}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-extrabold text-gray-800 text-sm">{item.name}</h4>
                            {item.priority && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PRIORITY_BADGE[item.priority] || 'bg-gray-100 text-gray-600'}`}>
                                {item.priority} Priority
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.description}</p>
                          )}
                          <p className="text-base font-black text-[#E65313]">₹{item.cost.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleToggle(b.id, idx, false)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                              bookingChoices[idx] === false
                                ? 'bg-red-650 border-red-650 text-white shadow-sm'
                                : 'border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-white'
                            }`}
                            style={bookingChoices[idx] === false ? { background: '#DC2626', borderColor: '#DC2626' } : {}}
                          >
                            <X size={12} /> Reject
                          </button>
                          <button
                            onClick={() => handleToggle(b.id, idx, true)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                              bookingChoices[idx] === true
                                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                : 'border-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-650 hover:border-green-200 bg-white'
                            }`}
                            style={bookingChoices[idx] === true ? { background: '#16A34A', borderColor: '#16A34A' } : {}}
                          >
                            <Check size={12} /> Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary Footer */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-2 text-xs" style={{ borderColor: '#E2D8CE' }}>
                    <div className="flex justify-between"><span className="text-gray-500">Base Service Cost</span><span className="font-semibold text-gray-800">₹{basePrice.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Approved Repairs</span><span className="font-semibold text-green-700">+₹{approvedTotal.toLocaleString('en-IN')}</span></div>
                    {rejectedTotal > 0 && (
                      <div className="flex justify-between"><span className="text-gray-500">Rejected Repairs</span><span className="font-semibold text-red-500 line-through">₹{rejectedTotal.toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200 items-baseline">
                      <span className="font-extrabold text-gray-800">Final Estimated Bill</span>
                      <span className="text-lg font-black text-[#E65313]">₹{(basePrice + approvedTotal).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubmit(b.id)}
                    disabled={!allDecided || submitting[b.id]}
                    className="w-full bg-[#E65313] hover:opacity-95 text-white py-3 rounded-lg text-sm font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {submitting[b.id] ? 'Submitting...' : !allDecided ? `Decide ${items.filter((_, idx) => bookingChoices[idx] === undefined).length} remaining item(s)` : 'Submit Decision'}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function NotificationsTab({ user }) {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => {
    const list = getNotifications(user.email);
    setNotifs(list);
    markNotificationsAsRead(user.email);
  }, [user.email]);

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-gray-800">My Notifications</h2>
      {notifs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed rounded-2xl bg-white border-gray-200">No notifications yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {notifs.map(n => (
            <div key={n.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/40 transition-colors ${n.unread ? 'bg-orange-50/10' : ''}`}>
              <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`} style={n.unread ? { background: '#FFF3EE', color: '#E65313' } : {}}>
                <Bell size={14} />
              </div>
              <div className="flex-1">
                <p className={`text-sm leading-relaxed ${n.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{n.text}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(n.timestamp)}</p>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full bg-[#E65313] mt-2 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───── MAIN DASHBOARD ─────

const TABS = [
  { id: 'bookings', label: 'My Bookings', icon: CalendarDays },
  { id: 'vehicles', label: 'My Vehicles', icon: Car },
  { id: 'track', label: 'Track Service', icon: Activity },
  { id: 'health', label: 'Health Reports', icon: FileText },
  { id: 'approvals', label: 'Repair Approvals', icon: CheckSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function CustomerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = () => {
    if (!user) return;
    const all = getBookings().filter(b => b.customerEmail?.toLowerCase() === user.email?.toLowerCase());
    setBookings(all);
    setUnreadCount(getUnreadNotificationsCount(user.email));
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/my-bookings');
  }, [user, loading, router]);

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }} />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col items-center justify-center text-gray-500">
      <Lock size={32} className="mb-2 text-gray-400" />
      <p>Please log in to access your dashboard.</p>
    </div>
  );

  const approvalCount = bookings.filter(b => b.healthReport?.reportSent && b.status === 'Waiting for Approval').length;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-8">
          {/* Header */}
          <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 shadow-sm">
            <div>
              <h1 className="text-xl font-extrabold text-gray-800">Welcome back, {user.name}!</h1>
              <p className="text-sm mt-1 text-gray-500">Track your vehicles, manage bookings, and approve repairs.</p>
            </div>
            <Link href="/vehicle-selection"
              className="text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
              style={{ background: '#E65313' }}>
              + Book New Service
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar Tabs */}
            <aside className="lg:w-56 shrink-0">
              <div className="sticky top-20 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const badge = tab.id === 'notifications' ? unreadCount : tab.id === 'approvals' ? approvalCount : 0;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition-all cursor-pointer min-h-[48px]"
                      style={{
                        borderBottom: '1px solid #E2D8CE',
                        background: isActive ? '#FFF3EE' : 'transparent',
                        color: isActive ? '#E65313' : '#667085',
                        borderLeft: isActive ? '3px solid #E65313' : '3px solid transparent',
                      }}
                    >
                      <Icon size={16} style={{ color: isActive ? '#E65313' : '#9CA3AF' }} />
                      <span className="flex-1" style={{ color: isActive ? '#E65313' : '#667085' }}>{tab.label}</span>
                      {badge > 0 && (
                        <span className="w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center" style={{ background: '#E65313' }}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {activeTab === 'vehicles' && <MyVehiclesTab bookings={bookings} />}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-gray-800">My Bookings</h2>
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white" style={{ color: '#667085', border: '1px dashed #E2D8CE' }}>
                      <CalendarDays size={36} className="mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                      <p>No bookings yet. <Link href="/vehicle-selection" className="font-bold hover:underline" style={{ color: '#E65313' }}>Book your first service</Link></p>
                    </div>
                  ) : (
                    /* Only this inner container scrolls horizontally on small screens */
                    <div style={{ overflowX: 'auto' }}>
                      <div style={{ minWidth: '640px' }}>
                        {bookings.map(b => (
                          <div key={b.id} className="rounded-2xl p-5 transition-all bg-white border border-gray-200 shadow-sm mb-4">
                            {/* Header row */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-gray-100 text-gray-500 border border-gray-200">{b.id}</span>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_BADGE[b.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>{b.status}</span>
                            </div>
                            {/* Details grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                              <div>
                                <p className="font-bold uppercase text-[10px] mb-1 text-gray-400">Vehicle</p>
                                <p className="font-bold text-gray-800">{b.vehicle.make} {b.vehicle.model}</p>
                                <p className="font-mono text-gray-500">{b.vehicle.plateNumber}</p>
                              </div>
                              <div>
                                <p className="font-bold uppercase text-[10px] mb-1 text-gray-400">Date &amp; Time</p>
                                <p className="font-bold text-gray-800">{b.date}</p>
                                <p className="text-gray-500">{b.time || '—'}</p>
                              </div>
                              <div>
                                <p className="font-bold uppercase text-[10px] mb-1 text-gray-400">Services</p>
                                <p className="font-bold text-gray-800">{b.services?.length || 0} service{b.services?.length !== 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <p className="font-bold uppercase text-[10px] mb-1 text-gray-400">Est. Cost</p>
                                <p className="font-extrabold text-base text-[#E65313]">₹{parseFloat(b.estimatedPrice || 0).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-150" style={{ borderColor: '#E2D8CE' }}>
                              {b.status === 'Waiting for Approval' && (
                                <button onClick={() => setActiveTab('approvals')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                  style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}>
                                  <AlertTriangle size={12} /> Approve Repairs
                                </button>
                              )}
                              {['Booked'].includes(b.status) && (
                                <button onClick={() => setActiveTab('track')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}>
                                  Reschedule
                                </button>
                              )}
                              {['Booked'].includes(b.status) && (
                                <button
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                  Cancel
                                </button>
                              )}
                              <button onClick={() => setActiveTab('track')}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                                View Details
                              </button>
                              {['Completed', 'Ready for Delivery', 'Delivered'].includes(b.status) && (
                                <button
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
                                  🧾 Invoice
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'track' && <TrackServiceTab bookings={bookings} />}
              {activeTab === 'health' && <HealthReportsTab bookings={bookings} />}
              {activeTab === 'approvals' && <RepairApprovalsTab bookings={bookings} onDecisionSubmit={loadData} />}
              {activeTab === 'notifications' && <NotificationsTab user={user} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
