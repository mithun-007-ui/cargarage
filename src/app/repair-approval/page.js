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
    setTimeout(() => {
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
    }, 0);
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
          <div className="text-center p-8">
            <p className="mb-4 text-gray-500">No repair approval request found.</p>
            <button onClick={() => router.push('/my-bookings')} className="font-bold cursor-pointer hover:underline text-[#E65313]">Go to My Bookings</button>
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
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-4xl mx-auto px-4">
          <ProgressBar currentStep={9} />

          {/* Back button */}
          <div className="mb-5">
            <button
              onClick={() => router.push(`/my-bookings`)}
              className="inline-flex items-center gap-1 text-xs transition-colors cursor-pointer text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={13} />
              Back to My Bookings
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Approval Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#E2D8CE' }}>
                {/* Header */}
                <div className="p-6 text-white" style={{ background: '#211F1D' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-red-650 text-white" style={{ background: '#DC2626' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h1 className="text-lg font-extrabold tracking-tight">Review & Authorize Repairs</h1>
                      <p className="text-xs text-gray-400">Booking ID: <strong>{booking.id}</strong> • Approve or reject each item individually</p>
                    </div>
                  </div>
                </div>

                {success ? (
                  <div className="p-8 text-center space-y-5 flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                      <ShieldCheck size={34} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Decisions Submitted!</h2>
                      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Your selections have been recorded. The technician team will proceed with authorized repairs only.</p>
                    </div>
                    <div className="rounded-2xl p-4 w-full max-w-xs border text-sm space-y-1.5 bg-gray-50 border-gray-150" style={{ borderColor: '#E2D8CE' }}>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Approved repairs:</span>
                        <span className="font-bold text-green-700">{approvedItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rejected repairs:</span>
                        <span className="font-bold text-red-600">{rejectedItems.length}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1.5" style={{ borderColor: '#E2D8CE' }}>
                        <span className="font-bold text-gray-800">Final Bill:</span>
                        <span className="font-black text-base text-[#E65313]">₹{finalTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/my-bookings')}
                      className="btn-primary font-bold text-sm transition-all"
                    >
                      Go to My Bookings
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-5">
                    {/* Technician Notes */}
                    <div className="border rounded-2xl p-4 text-sm text-gray-800" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                      <span className="font-bold text-amber-800">Technician Notes: </span>
                      <p className="mt-1 text-xs text-gray-600 italic">"{booking.healthReport?.notes}"</p>
                    </div>

                    {/* Itemized Repairs */}
                    <div>
                      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-3 text-gray-500">Recommended Repairs</h2>
                      <div className="space-y-3">
                        {booking.healthReport?.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="border rounded-2xl p-4 transition-all bg-white"
                            style={{
                              borderColor: choices[idx] === true ? '#BBF7D0' : choices[idx] === false ? '#FECACA' : '#E2D8CE',
                              background: choices[idx] === true ? '#F0FDF4' : choices[idx] === false ? '#FEF2F2' : '#FFFFFF'
                            }}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex-1">
                                <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
                                )}
                                <p className="text-sm font-extrabold mt-1.5 text-[#E65313]">
                                  ₹{item.cost.toLocaleString('en-IN')}
                                </p>
                              </div>

                              <div className="flex gap-2 self-stretch sm:self-auto shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleChoice(idx, false)}
                                  className={`flex-1 sm:flex-none px-4 py-2 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    choices[idx] === false
                                      ? 'text-white border-red-650'
                                      : 'border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 bg-white'
                                  }`}
                                  style={choices[idx] === false ? { background: '#DC2626', borderColor: '#DC2626' } : {}}
                                >
                                  <X size={13} />
                                  Reject
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleChoice(idx, true)}
                                  className={`flex-1 sm:flex-none px-4 py-2 border rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    choices[idx] === true
                                      ? 'text-white border-green-600'
                                      : 'border-gray-200 hover:bg-green-50 hover:border-green-200 text-gray-500 hover:text-green-700 bg-white'
                                  }`}
                                  style={choices[idx] === true ? { background: '#16A34A', borderColor: '#16A34A' } : {}}
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
                    <div className="pt-4 flex justify-end border-t" style={{ borderColor: '#E2D8CE' }}>
                      <button
                        onClick={handleSubmitApprovals}
                        disabled={isSubmitting || pendingItems.length > 0}
                        className="btn-primary active:scale-[0.98] text-white px-7 py-3 rounded-lg font-bold transition-all text-sm flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-2xl border p-5 sticky top-24" style={{ borderColor: '#E2D8CE' }}>
                  <h2 className="font-extrabold text-sm pb-3 border-b mb-4 text-gray-800" style={{ borderColor: '#E2D8CE' }}>Approval Summary</h2>

                  {/* Approved */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1.5">✓ Approved Repairs</p>
                    {approvedItems.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">None approved yet</p>
                    ) : (
                      <div className="space-y-1.5">
                        {approvedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600 truncate mr-2">{item.name}</span>
                            <span className="font-bold text-green-700 shrink-0">₹{item.cost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rejected */}
                  {rejectedItems.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">✗ Rejected Repairs</p>
                      <div className="space-y-1.5">
                        {rejectedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-500 line-through truncate mr-2">{item.name}</span>
                            <span className="text-gray-400 shrink-0">₹{item.cost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-2 pt-3 border-t text-xs" style={{ borderColor: '#E2D8CE' }}>
                    <div className="flex justify-between text-gray-500">
                      <span>Base Service Cost</span>
                      <span className="font-semibold text-gray-800">₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Approved Repairs</span>
                      <span className="font-semibold text-green-700">+₹{approvedRepairTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t" style={{ borderColor: '#E2D8CE' }}>
                      <span className="font-bold text-gray-800">Final Estimated Bill</span>
                      <span className="text-xl font-black text-[#E65313]">₹{finalTotal.toLocaleString('en-IN')}</span>
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
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center"><div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }}></div></div>}>
      <RepairApprovalContent />
    </Suspense>
  );
}
