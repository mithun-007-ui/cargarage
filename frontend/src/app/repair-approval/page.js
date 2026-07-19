'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { getBookingById, updateHealthReportItem } from 'src/lib/mockDb';
import { Check, X, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

import ProgressBar from 'src/components/ProgressBar';

function RepairApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState(null);
  const [choices, setChoices] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      const data = getBookingById(bookingId);
      if (data && data.healthReport && data.healthReport.reportSent) {
        setBooking(data);
        const initialChoices = {};
        data.healthReport.items.forEach((item, idx) => {
          initialChoices[idx] = item.approved;
        });
        setChoices(initialChoices);
      }
    }
    setLoading(false);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-slate-400 mb-4">No repair approval request found.</p>
            <button onClick={() => router.push('/my-bookings')} className="text-primary-600 hover:underline font-bold cursor-pointer">Go to My Bookings</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleToggleChoice = (idx, approved) => {
    setChoices(prev => ({ ...prev, [idx]: approved }));
  };

  const approvedItems = booking.healthReport?.items.filter((_, idx) => choices[idx] === true) || [];
  const rejectedItems = booking.healthReport?.items.filter((_, idx) => choices[idx] === false) || [];
  const pendingItems = booking.healthReport?.items.filter((_, idx) => choices[idx] === null || choices[idx] === undefined) || [];

  const approvedRepairTotal = approvedItems.reduce((acc, item) => acc + item.cost, 0);
  const basePrice = parseFloat(booking.estimatedPrice) || 0;
  const finalTotal = basePrice + approvedRepairTotal;

  const handleSubmitApprovals = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      Object.keys(choices).forEach((idxKey) => {
        const itemIdx = parseInt(idxKey);
        const approvedStatus = choices[itemIdx];
        if (approvedStatus !== null && approvedStatus !== undefined) {
          updateHealthReportItem(booking.id, itemIdx, approvedStatus);
        }
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-4xl mx-auto px-4">
          <ProgressBar currentStep={9} />


          {/* Back button */}
          <div className="mb-5">
            <button
              onClick={() => router.push(`/health-report?id=${booking.id}`)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
              Back to Health Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Approval Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent-500 text-white rounded-2xl">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h1 className="text-lg font-extrabold tracking-tight">Review & Authorize Repairs</h1>
                      <p className="text-xs text-slate-400">Booking ID: <strong>{booking.id}</strong> • Approve or reject each item individually</p>
                    </div>
                  </div>
                </div>

                {success ? (
                  <div className="p-8 text-center space-y-5 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                      <ShieldCheck size={34} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Decisions Submitted!</h2>
                      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Your selections have been recorded. The technician team will proceed with authorized repairs only.</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 w-full max-w-xs border border-slate-100 text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Approved repairs:</span>
                        <span className="font-bold text-emerald-700">{approvedItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rejected repairs:</span>
                        <span className="font-bold text-red-600">{rejectedItems.length}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5">
                        <span className="font-bold text-slate-800">Final Bill:</span>
                        <span className="font-black text-primary-800 text-base">₹{finalTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/my-bookings')}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-8 rounded-xl text-sm transition-all shadow-md cursor-pointer"
                    >
                      Go to My Bookings
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-5">
                    {/* Technician Notes */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-slate-700">
                      <span className="font-bold text-amber-800">Technician Notes: </span>
                      <p className="mt-1 text-xs text-slate-600 italic">"{booking.healthReport?.notes}"</p>
                    </div>

                    {/* Itemized Repairs */}
                    <div>
                      <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">Recommended Repairs</h2>
                      <div className="space-y-3">
                        {booking.healthReport?.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`border rounded-2xl p-4 transition-all ${
                              choices[idx] === true
                                ? 'border-emerald-200 bg-emerald-50/30 ring-2 ring-emerald-500/10'
                                : choices[idx] === false
                                ? 'border-red-200 bg-red-50/20'
                                : 'border-slate-100 bg-white'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex-1">
                                <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                                )}
                                <p className="text-sm font-extrabold text-slate-700 mt-1.5">
                                  ₹{item.cost.toLocaleString('en-IN')}
                                </p>
                              </div>

                              <div className="flex gap-2 self-stretch sm:self-auto shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleChoice(idx, false)}
                                  className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    choices[idx] === false
                                      ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                                      : 'border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 bg-white'
                                  }`}
                                >
                                  <X size={13} />
                                  Reject
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleChoice(idx, true)}
                                  className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    choices[idx] === true
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                      : 'border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-500 hover:text-emerald-600 bg-white'
                                  }`}
                                >
                                  <Check size={13} />
                                  Approve
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit button */}
                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                      <button
                        onClick={handleSubmitApprovals}
                        disabled={isSubmitting || pendingItems.length > 0}
                        className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-7 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : pendingItems.length > 0 ? `Decide ${pendingItems.length} remaining` : 'Submit All Decisions'}
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Running Total Sidebar */}
            {!success && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 sticky top-24">
                  <h2 className="font-extrabold text-slate-800 text-sm pb-3 border-b border-slate-100 mb-4">Approval Summary</h2>

                  {/* Approved */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">✓ Approved Repairs</p>
                    {approvedItems.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">None approved yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {approvedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-600 truncate mr-2">{item.name}</span>
                            <span className="font-bold text-emerald-700 shrink-0">₹{item.cost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rejected */}
                  {rejectedItems.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">✗ Rejected Repairs</p>
                      <div className="space-y-1.5">
                        {rejectedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-500 line-through truncate mr-2">{item.name}</span>
                            <span className="text-slate-400 shrink-0">₹{item.cost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Service Cost</span>
                      <span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approved Repairs</span>
                      <span className="font-semibold text-emerald-700">+₹{approvedRepairTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800">Final Estimated Bill</span>
                      <span className="text-xl font-black text-primary-700">₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {pendingItems.length > 0 && (
                    <p className="text-[10px] text-amber-600 font-bold mt-3 text-center">
                      {pendingItems.length} item{pendingItems.length > 1 ? 's' : ''} pending your decision
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RepairApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <RepairApprovalContent />
    </Suspense>
  );
}
