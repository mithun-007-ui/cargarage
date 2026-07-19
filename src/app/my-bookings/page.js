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
  History, Bell, User, ChevronRight, Lock, Check, X, Activity,
  AlertTriangle, ShieldCheck, Clock
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
  'Delivered': 'bg-green-50 text-green-800 border-green-100',
};

// ───── TAB COMPONENTS ─────

function MyVehiclesTab({ bookings }) {
  const vehicles = Array.from(
    new Map(bookings.map(b => [b.vehicle.plateNumber, b.vehicle])).values()
  );
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-slate-800">My Vehicles</h2>
      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          No vehicles registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {vehicles.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100">
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800">{v.make} {v.model}</h3>
                  <p className="font-mono text-xs text-slate-400">{v.plateNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[['Year', v.year], ['Fuel', v.fuelType], ['Transmission', v.transmission], ['KM Reading', v.kmReading ? `${v.kmReading} km` : 'N/A']].map(([k, val]) => (
                  <div key={k} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">{k}</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{val || 'N/A'}</p>
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
      <h2 className="text-lg font-extrabold text-slate-800">Track Service</h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <Clock size={36} className="mx-auto mb-3 text-slate-300" />
          No active bookings to track.
        </div>
      ) : (
        bookings.map(b => {
          const currentStep = Math.max(PIPELINE_STEPS.findIndex(s => s.key === b.status), 0);
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Booking Header */}
              <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-slate-400">{b.id}</p>
                  <h3 className="font-extrabold text-base mt-0.5">{b.vehicle.make} {b.vehicle.model}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{b.vehicle.plateNumber} &bull; {b.date} {b.time ? `at ${b.time}` : ''}</p>
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
                            state === 'done' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                            : state === 'active' ? 'bg-primary-600 shadow-md shadow-primary-600/40 ring-4 ring-primary-100'
                            : 'bg-slate-100 border border-slate-200'
                          }`}>
                            {state === 'done' && <Check size={16} strokeWidth={3} className="text-white" />}
                            {state === 'active' && (
                              <span className="w-3 h-3 bg-white rounded-full block animate-pulse" />
                            )}
                            {state === 'pending' && <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block" />}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                              state === 'done' ? 'bg-emerald-400' : 'bg-slate-200'
                            }`} />
                          )}
                        </div>

                        {/* Step content */}
                        <div className={`pb-5 ${isLast ? '' : ''} flex-1 min-w-0`}>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <p className={`text-base font-bold leading-snug ${
                              state === 'done' ? 'text-emerald-700'
                              : state === 'active' ? 'text-primary-700'
                              : 'text-slate-400'
                            }`}>
                              {step.label}
                            </p>
                            {state === 'active' && (
                              <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 rounded-full px-2 py-0.5 font-bold animate-pulse">
                                In Progress
                              </span>
                            )}
                          </div>
                          {state === 'done' && time && (
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Completed &bull; {time}
                            </p>
                          )}
                          {state === 'pending' && time && (
                            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                              <Clock size={11} /> Expected &bull; {time}
                            </p>
                          )}
                          {state === 'active' && b.technicianAssigned && (
                            <p className="text-xs text-primary-600 font-semibold mt-0.5">
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
  const getScoreColor = (s) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';
  const COMPONENT_STATUS_DOT = { 'Good': 'bg-emerald-500', 'Healthy': 'bg-emerald-500', 'Worn Out': 'bg-red-500', 'Need Replacement': 'bg-red-500', 'Gas Low': 'bg-amber-500', 'Low': 'bg-amber-500' };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-slate-800">Vehicle Health Reports</h2>
      {withReports.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">
          <FileText size={36} className="mx-auto mb-3 text-slate-300" />
          No reports have been shared with you yet.
        </div>
      ) : (
        withReports.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center gap-4">
              <div>
                <p className="text-xs text-slate-400 font-mono">{b.id}</p>
                <h3 className="font-extrabold">{b.vehicle.make} {b.vehicle.model}</h3>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Health Score</p>
                <p className={`text-2xl font-black ${getScoreColor(b.healthReport.healthScore)}`}>{b.healthReport.healthScore}%</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Component grid */}
              {b.healthReport.components && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(b.healthReport.components).map(([key, val]) => {
                    const dotColor = COMPONENT_STATUS_DOT[val] || 'bg-slate-400';
                    const label = { engine: 'Engine', brakes: 'Brakes', battery: 'Battery', tyres: 'Tyres', suspension: 'Suspension', ac: 'AC System' }[key] || key;
                    return (
                      <div key={key} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                          <span className="text-[10px] font-bold text-slate-500">{val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Notes */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs italic text-slate-500">"{b.healthReport.notes}"</div>
              {/* Navigate to repair approval */}
              {b.status === 'Waiting for Approval' && (
                <Link href={`/repair-approval?id=${b.id}`} className="w-full bg-accent-500 hover:bg-accent-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer">
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
      <h2 className="text-lg font-extrabold text-slate-800">Repair Approvals</h2>
      {eligible.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">
          <CheckSquare size={36} className="mx-auto mb-3 text-slate-300" />
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

          const PRIORITY_BADGE = { 'High': 'bg-red-100 text-red-700', 'Medium': 'bg-amber-100 text-amber-700', 'Low': 'bg-emerald-100 text-emerald-700' };

          return (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white p-5">
                <p className="text-xs text-slate-400 font-mono">{b.id} • {b.vehicle.make} {b.vehicle.model}</p>
                <h3 className="font-extrabold mt-0.5">Review Recommended Repairs</h3>
              </div>

              {submitted[b.id] ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <ShieldCheck size={28} />
                  </div>
                  <p className="font-extrabold text-slate-800">Decision Submitted!</p>
                  <p className="text-xs text-slate-400">The workshop has been notified of your choices.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className={`border rounded-2xl p-4 transition-all ${
                      bookingChoices[idx] === true ? 'border-emerald-200 bg-emerald-50/20' :
                      bookingChoices[idx] === false ? 'border-red-100 bg-red-50/10' :
                      'border-slate-100'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-extrabold text-slate-800 text-sm">{item.name}</h4>
                            {item.priority && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PRIORITY_BADGE[item.priority] || 'bg-slate-100 text-slate-600'}`}>
                                {item.priority} Priority
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">{item.description}</p>
                          )}
                          <p className="text-base font-black text-primary-700">₹{item.cost.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleToggle(b.id, idx, false)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                              bookingChoices[idx] === false
                                ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                                : 'border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-white'
                            }`}
                          >
                            <X size={12} /> Reject
                          </button>
                          <button
                            onClick={() => handleToggle(b.id, idx, true)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                              bookingChoices[idx] === true
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 bg-white'
                            }`}
                          >
                            <Check size={12} /> Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Summary Footer */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Base Service Cost</span><span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Approved Repairs</span><span className="font-semibold text-emerald-700">+₹{approvedTotal.toLocaleString('en-IN')}</span></div>
                    {rejectedTotal > 0 && (
                      <div className="flex justify-between"><span className="text-slate-500">Rejected Repairs</span><span className="font-semibold text-red-500 line-through">₹{rejectedTotal.toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 items-baseline">
                      <span className="font-extrabold text-slate-800">Final Estimated Bill</span>
                      <span className="text-lg font-black text-primary-700">₹{(basePrice + approvedTotal).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubmit(b.id)}
                    disabled={!allDecided || submitting[b.id]}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl text-sm font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
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
      <h2 className="text-lg font-extrabold text-slate-800">My Notifications</h2>
      {notifs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">No notifications yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {notifs.map(n => (
            <div key={n.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50/40 transition-colors ${n.unread ? 'bg-primary-50/20' : ''}`}>
              <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                <Bell size={14} />
              </div>
              <div className="flex-1">
                <p className={`text-sm leading-relaxed ${n.unread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{n.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(n.timestamp)}</p>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-extrabold text-slate-800">My Profile</h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-black text-2xl border border-primary-200">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">{user.name}</h3>
            <p className="text-sm text-slate-400">{user.email}</p>
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-bold border border-primary-100">{user.role}</span>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          {[['Full Name', user.name], ['Email Address', user.email], ['Account Role', user.role]].map(([label, val]) => (
            <div key={label}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
              <input defaultValue={val} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none" readOnly />
            </div>
          ))}
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer">Update Profile</button>
        </div>
      </div>
    </div>
  );
}

// ───── MAIN DASHBOARD ─────

const TABS = [
  { id: 'vehicles', label: 'My Vehicles', icon: Car },
  { id: 'bookings', label: 'My Bookings', icon: CalendarDays },
  { id: 'track', label: 'Track Service', icon: Activity },
  { id: 'health', label: 'Health Reports', icon: FileText },
  { id: 'approvals', label: 'Repair Approvals', icon: CheckSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
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
    <div className="min-h-screen bg-[#0d1220] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0d1220] flex flex-col items-center justify-center text-slate-400">
      <Lock size={32} className="mb-2 text-slate-600" />
      <p>Please log in to access your dashboard.</p>
    </div>
  );

  const approvalCount = bookings.filter(b => b.healthReport?.reportSent && b.status === 'Waiting for Approval').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1220]">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#111827] to-[#0d1a30] text-white rounded-3xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[#1e2d45]">
            <div>
              <h1 className="text-xl font-extrabold">Welcome back, {user.name}!</h1>
              <p className="text-sm text-slate-400 mt-1">Track your vehicles, manage bookings, and approve repairs.</p>
            </div>
            <Link href="/vehicle-selection" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0 border border-primary-500">
              + Book New Service
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar Tabs */}
            <aside className="lg:w-56 shrink-0">
              <div className="bg-[#111827] rounded-2xl border border-[#1e2d45] overflow-hidden">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const badge = tab.id === 'notifications' ? unreadCount : tab.id === 'approvals' ? approvalCount : 0;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition-all border-b border-[#1e2d45] last:border-0 cursor-pointer min-h-[48px] ${
                        isActive ? 'bg-primary-600/15 text-primary-400 font-extrabold border-l-2 border-l-primary-600' : 'text-slate-400 hover:bg-white/3 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-primary-400' : 'text-slate-500'} />
                      <span className="flex-1">{tab.label}</span>
                      {badge > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent-500 text-white text-[9px] font-black flex items-center justify-center">{badge}</span>
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
                  <h2 className="text-lg font-extrabold text-slate-800">My Bookings</h2>
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">
                      <CalendarDays size={36} className="mx-auto mb-3 text-slate-300" />
                      <p>No bookings yet. <Link href="/vehicle-selection" className="text-primary-600 hover:underline font-bold">Book your first service</Link></p>
                    </div>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">{b.id}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_BADGE[b.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>{b.status}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[10px]">Vehicle</p>
                            <p className="font-bold text-slate-700">{b.vehicle.make} {b.vehicle.model}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[10px]">Date & Time</p>
                            <p className="font-bold text-slate-700">{b.date} · {b.time}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase text-[10px]">Est. Cost</p>
                            <p className="font-extrabold text-primary-700">₹{parseFloat(b.estimatedPrice || 0).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        {b.status === 'Waiting for Approval' && (
                          <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2">
                            <button onClick={() => setActiveTab('approvals')} className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={12} /> Repairs Need Approval
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
              {activeTab === 'track' && <TrackServiceTab bookings={bookings} />}
              {activeTab === 'health' && <HealthReportsTab bookings={bookings} />}
              {activeTab === 'approvals' && <RepairApprovalsTab bookings={bookings} onDecisionSubmit={loadData} />}
              {activeTab === 'notifications' && <NotificationsTab user={user} />}
              {activeTab === 'profile' && <ProfileTab user={user} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
