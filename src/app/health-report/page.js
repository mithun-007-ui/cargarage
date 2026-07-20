'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { getBookingById } from 'src/lib/mockDb';
import { ClipboardCheck, FileText, CheckCircle, AlertTriangle, XCircle, ChevronLeft, ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import ProgressBar from 'src/components/ProgressBar';

const COMPONENT_STATUS = {
  'Good': { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-green-500', label: 'Good' },
  'Healthy': { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-green-500', label: 'Healthy' },
  'Worn Out': { color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500', label: 'Worn Out' },
  'Need Replacement': { color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500', label: 'Need Replacement' },
  'Gas Low': { color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500', label: 'Gas Low' },
  'Low': { color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500', label: 'Low' },
};

const getStatusConfig = (status) => COMPONENT_STATUS[status] || { color: 'text-gray-650 bg-gray-50 border-gray-200', dot: 'bg-gray-400', label: status };

const TRACKER_STEPS = [
  { label: 'Booking Confirmed', key: 'Booked' },
  { label: 'Vehicle Received', key: 'Vehicle Received' },
  { label: 'Inspection', key: 'Inspection' },
  { label: 'Awaiting Approval', key: 'Waiting for Approval' },
  { label: 'Repair Started', key: 'Repair in Progress' },
  { label: 'Quality Check', key: 'Quality Check' },
  { label: 'Completed', key: 'Completed' },
];

function VehicleHealthReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      const data = getBookingById(bookingId);
      if (data) {
        setBooking(data);
      }
    }
    setLoading(false);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F5F0' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-550 mb-4">Booking not found.</p>
            <Link href="/my-bookings" className="font-bold hover:underline" style={{ color: '#E65313' }}>Go to My Bookings</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = TRACKER_STEPS.findIndex(s => s.key === booking.status);
  const healthScore = booking.healthReport?.healthScore || 85;
  const components = booking.healthReport?.components || {};

  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-green-600', bg: '#16A34A', label: 'Excellent' };
    if (score >= 60) return { text: 'text-amber-600', bg: '#D97706', label: 'Fair' };
    return { text: 'text-red-650', bg: '#DC2626', label: 'Poor' };
  };

  const scoreConfig = getScoreColor(healthScore);

  const componentList = [
    { label: 'Engine', key: 'engine', icon: '⚙️' },
    { label: 'Brake Pads', key: 'brakes', icon: '🛑' },
    { label: 'Battery', key: 'battery', icon: '🔋' },
    { label: 'Tyres', key: 'tyres', icon: '🏎' },
    { label: 'Suspension', key: 'suspension', icon: '🔩' },
    { label: 'AC System', key: 'ac', icon: '❄️' },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-4xl mx-auto">
            <ProgressBar currentStep={8} />

            {/* Back */}
            <div className="mb-5">
              <button
                onClick={() => router.push('/my-bookings')}
                className="inline-flex items-center gap-1 text-xs transition-colors cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft size={13} />
                Back to My Bookings
              </button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5" style={{ borderColor: '#E2D8CE' }}>
              {/* Header */}
              <div className="p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ background: '#211F1D' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl text-white" style={{ background: '#E65313' }}>
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold tracking-tight">Vehicle Health Inspection Report</h1>
                    <p className="text-xs text-gray-400">Booking ID: <strong>{booking.id}</strong> • {booking.vehicle.make} {booking.vehicle.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-1">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}>
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Vehicle Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl p-4 border text-xs" style={{ background: '#F8F5F0', borderColor: '#E2D8CE' }}>
                  <div>
                    <p className="text-gray-450 font-bold uppercase tracking-wider">Make / Model</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{booking.vehicle.make} {booking.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-455 font-bold uppercase tracking-wider">Year</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{booking.vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-460 font-bold uppercase tracking-wider">Plate Number</p>
                    <p className="text-sm font-mono font-bold text-gray-800 mt-1">{booking.vehicle.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-465 font-bold uppercase tracking-wider">Technician</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#E65313' }}>David Miller (ASE)</p>
                  </div>
                </div>

                {/* Waiting for Approval Banner */}
                {booking.status === 'Waiting for Approval' && (
                  <div className="border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" style={{ background: '#FFF3EE', borderColor: '#FFD9C8' }}>
                    <div className="flex items-start gap-3 text-sm text-gray-750 leading-relaxed">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: '#E65313' }} />
                      <div>
                        <p className="font-bold" style={{ color: '#E65313' }}>Recommended Repairs Awaiting Your Approval</p>
                        <p className="text-xs text-gray-500 mt-0.5">Review and approve/reject individual repair items below.</p>
                      </div>
                    </div>
                    <Link
                      href={`/repair-approval?id=${booking.id}`}
                      className="btn-primary text-xs font-bold transition-all shrink-0 cursor-pointer text-white px-5 py-2 rounded-lg"
                    >
                      Review Repairs
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                )}

                {/* Health Report Content */}
                {booking.healthReport && booking.healthReport.reportSent ? (
                  <>
                    {/* Health Score */}
                    <div>
                      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2 text-gray-800">
                        <Activity size={14} />Overall Health Score
                      </h2>
                      <div className="flex items-center gap-5">
                        {/* Circle gauge */}
                        <div className="relative w-24 h-24 shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#E2D8CE" strokeWidth="10" />
                            <circle
                              cx="50" cy="50" r="38"
                              fill="none"
                              stroke={scoreConfig.bg}
                              strokeWidth="10"
                              strokeDasharray={`${(healthScore / 100) * 239} 239`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-xl font-black ${scoreConfig.text}`}>{healthScore}%</span>
                          </div>
                        </div>
                        <div>
                          <p className={`text-lg font-extrabold ${scoreConfig.text}`}>{scoreConfig.label} Condition</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                            {healthScore >= 80
                              ? 'Your vehicle is in great condition. Minor preventive maintenance recommended.'
                              : healthScore >= 60
                              ? 'Some attention needed. Review recommended repairs and prioritize critical items.'
                              : 'Immediate repairs required. Multiple critical systems need attention.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Component Health Grid */}
                    {Object.keys(components).length > 0 && (
                      <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-wider mb-3 text-gray-800">Component Health</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {componentList.map(comp => {
                            const status = components[comp.key] || 'Good';
                            const config = getStatusConfig(status);
                            return (
                              <div key={comp.key} className={`border rounded-xl p-3 flex items-center justify-between ${config.color}`} style={{ borderColor: '#E2D8CE' }}>
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{comp.icon}</span>
                                  <span className="text-xs font-bold text-gray-850">{comp.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                                  <span className="text-[10px] font-bold">{config.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Technician Notes */}
                    <div>
                      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-2 text-gray-850">Technician Notes</h2>
                      <div className="border rounded-2xl p-4 text-xs text-gray-600 leading-relaxed italic bg-gray-50 border-gray-150" style={{ borderColor: '#E2D8CE' }}>
                        "{booking.healthReport.notes}"
                      </div>
                    </div>

                    {/* Recommended Repairs */}
                    <div>
                      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-3 text-gray-850">Recommended Repairs</h2>
                      <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: '#E2D8CE' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b" style={{ background: '#F8F5F0', borderColor: '#E2D8CE' }}>
                              <th className="px-4 py-3 font-bold text-gray-500">Repair Item</th>
                              <th className="px-4 py-3 font-bold text-gray-500 text-center">Cost</th>
                              <th className="px-4 py-3 font-bold text-gray-500 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: '#E2D8CE' }}>
                            {booking.healthReport.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/20 bg-white">
                                <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 font-bold text-gray-800 text-center">₹{item.cost.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right font-bold">
                                  {item.approved === null ? (
                                    <span className="text-orange-500">Pending Review</span>
                                  ) : item.approved ? (
                                    <span className="text-green-600">✓ Approved</span>
                                  ) : (
                                    <span className="text-red-500">✗ Rejected</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : booking.healthReport ? (
                  <div className="border-2 border-dashed rounded-2xl p-10 text-center text-gray-400 text-sm bg-white" style={{ borderColor: '#E2D8CE' }}>
                    <FileText size={36} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-bold text-gray-700">Inspection Report Draft Prepared</p>
                    <p className="text-xs mt-1">Our service advisor is finalizing review and will release this report for your approval shortly.</p>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-2xl p-10 text-center text-gray-400 text-sm bg-white" style={{ borderColor: '#E2D8CE' }}>
                    <FileText size={36} className="mx-auto mb-3 text-gray-300" />
                    Technician health report is pending. The diagnostic check will begin once your vehicle is received.
                  </div>
                )}
              </div>
            </div>

            {/* Booking Tracker */}
            <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6" style={{ borderColor: '#E2D8CE' }}>
              <h2 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-gray-850">Service Progress Tracker</h2>
              <div className="flex items-start gap-0 overflow-x-auto pb-2">
                {TRACKER_STEPS.map((step, idx) => {
                  const isComplete = idx < Math.max(currentStepIndex, 0);
                  const isCurrent = idx === Math.max(currentStepIndex, 0);
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center min-w-[80px]">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all"
                          style={
                            isComplete ? { background: '#16A34A', borderColor: '#16A34A', color: '#FFFFFF' }
                            : isCurrent ? { background: '#E65313', borderColor: '#E65313', color: '#FFFFFF', boxShadow: '0 0 0 4px rgba(230,83,19,0.15)' }
                            : { background: '#FFFFFF', borderColor: '#E2D8CE', color: '#9CA3AF' }
                          }
                        >
                          {isComplete ? '✓' : idx + 1}
                        </div>
                        <p
                          className="text-[9px] font-bold mt-1.5 text-center leading-tight px-1"
                          style={{
                            color: isCurrent ? '#E65313' : isComplete ? '#16A34A' : '#9CA3AF'
                          }}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span
                            className="text-[8px] px-1 py-0.5 rounded-full font-bold mt-0.5"
                            style={{ background: '#FFF3EE', color: '#E65313', border: '1px solid #FFD9C8' }}
                          >
                            Now
                          </span>
                        )}
                      </div>
                      {idx < TRACKER_STEPS.length - 1 && (
                        <div
                          className="flex-1 h-0.5 mt-4"
                          style={{
                            background: isComplete ? '#16A34A' : '#E2D8CE',
                            minWidth: '24px'
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function VehicleHealthReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center"><div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }}></div></div>}>
      <VehicleHealthReportContent />
    </Suspense>
  );
}
