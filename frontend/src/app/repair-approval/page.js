'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/context/AuthContext';
import { getBookingById, updateHealthReportItem } from 'src/lib/mockDb';
import { Check, X, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function RepairApprovalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  
  const [booking, setBooking] = useState(null);
  const [choices, setChoices] = useState({}); // { [itemIndex]: true/false }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/repair-approval?id=${bookingId}`);
    }
  }, [user, loading, router, bookingId]);

  useEffect(() => {
    if (bookingId) {
      const data = getBookingById(bookingId);
      if (data && data.healthReport) {
        setBooking(data);
        
        // Load default values based on prior choices
        const initialChoices = {};
        data.healthReport.items.forEach((item, idx) => {
          initialChoices[idx] = item.approved;
        });
        setChoices(initialChoices);
      }
    }
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggleChoice = (idx, approved) => {
    setChoices(prev => ({
      ...prev,
      [idx]: approved
    }));
  };

  const calculateApprovedCost = () => {
    let cost = parseFloat(booking.estimatedPrice);
    if (booking.healthReport) {
      booking.healthReport.items.forEach((item, idx) => {
        if (choices[idx] === true) {
          cost += item.cost;
        }
      });
    }
    return cost;
  };

  const handleSubmitApprovals = async () => {
    setIsSubmitting(true);
    
    // Mimic API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Loop through choices and update database items
      Object.keys(choices).forEach((idxKey) => {
        const itemIdx = parseInt(idxKey);
        const approvedStatus = choices[itemIdx];
        if (approvedStatus !== null) {
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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/health-report?id=${booking.id}`)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              Back to Health Report
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-8 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent-500 text-white rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">Review and Authorize Repairs</h1>
                  <p className="text-xs text-slate-400">Review technician recommended actions for booking ID: <strong>{booking.id}</strong></p>
                </div>
              </div>
            </div>

            {success ? (
              <div className="p-8 text-center space-y-6 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
                  <ShieldCheck size={36} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Approvals Submitted!</h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Your selection has been successfully recorded. The technician team will adjust work orders and proceed with the authorized repairs.</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/my-bookings')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-primary-600/10 cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                {/* Intro summary */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold text-amber-850">Technician Diagnostic Notes:</span>
                  <p className="mt-1.5 text-xs text-slate-600 italic">"{booking.healthReport?.notes}"</p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Itemized Recommendations</h2>
                  <div className="space-y-3">
                    {booking.healthReport?.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                          choices[idx] === true
                            ? 'border-emerald-200 bg-emerald-50/10 ring-2 ring-emerald-500/5'
                            : choices[idx] === false
                            ? 'border-red-200 bg-red-50/10'
                            : 'border-slate-150 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-slate-800">{item.name}</p>
                          <p className="text-xs font-extrabold text-slate-400">ESTIMATED COST: <span className="text-slate-750 font-bold">${item.cost}</span></p>
                        </div>

                        {/* Interactive toggle buttons */}
                        <div className="flex gap-2 self-stretch sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleToggleChoice(idx, false)}
                            className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              choices[idx] === false
                                ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/10'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 bg-white'
                            }`}
                          >
                            <X size={14} />
                            Decline
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleToggleChoice(idx, true)}
                            className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              choices[idx] === true
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 bg-white'
                            }`}
                          >
                            <Check size={14} />
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary card */}
                <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Total Adjustments</p>
                    <p className="text-2xl font-black text-primary-800 mt-1">${calculateApprovedCost().toFixed(2)}</p>
                  </div>
                  
                  <button
                    onClick={handleSubmitApprovals}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-8 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting selections...' : 'Submit Authorized Decisions'}
                    <ChevronRight size={16} />
                  </button>
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
