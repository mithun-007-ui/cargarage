'use client';

import React, { useState } from 'react';
import BillSummary from './BillSummary';
import { ChevronUp, ChevronDown, Receipt } from 'lucide-react';
import { useBooking } from 'src/context/BookingContext';

export default function BookingLayout({
  children,
  vehicle,
  selectedServices,
  selectedPackage,
  bookingDate,
  bookingTime,
  bookingId,
  pickupOption,
  finalAmount,
  showAction = false,
  onActionClick = null,
  actionLabel = 'Continue to Next Step',
  isActionDisabled = false,
  isPublic = false,
}) {
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const context = useBooking();

  // Determine if there is any data to show
  const hasSelections =
    vehicle !== undefined ? !!vehicle :
    (!!context?.vehicle || (context?.selectedServices && context.selectedServices.length > 0) || (context?.selectedPackage && context.selectedPackage !== 'none'));

  const billSummaryProps = {
    vehicle,
    selectedServices,
    selectedPackage,
    bookingDate,
    bookingTime,
    bookingId,
    pickupOption,
    finalAmount,
    showAction,
    onActionClick,
    actionLabel,
    isActionDisabled,
    isPublic,
  };

  return (
    <div className="relative">
      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area — left 8 cols */}
        <div className="lg:col-span-8 w-full">
          {children}
        </div>

        {/* Desktop Sticky Sidebar — right 4 cols, visible on lg+ */}
        <div className="hidden lg:block lg:col-span-4">
          <div style={{ position: 'sticky', top: '100px' }}>
            <BillSummary {...billSummaryProps} />
          </div>
        </div>
      </div>

      {/* Below-content summary on mobile/tablet */}
      <div className="mt-8 lg:hidden block">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: '#9CA3AF' }}>Booking Overview</h3>
        <BillSummary {...billSummaryProps} />
      </div>

      {/* Mobile sticky bottom "View Bill Summary" toggle bar */}
      {hasSelections && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex flex-col transition-all duration-300"
          style={{ background: '#211F1D', borderTop: '1px solid #333', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
              className="flex items-center gap-2 text-white font-bold text-sm py-1"
            >
              <Receipt size={16} style={{ color: '#E65313' }} />
              <span>{isMobileSummaryOpen ? 'Hide Summary' : 'View Bill Summary'}</span>
              {isMobileSummaryOpen ? <ChevronDown size={14} className="text-gray-300" /> : <ChevronUp size={14} className="text-gray-300" />}
            </button>

            {showAction && onActionClick && !isMobileSummaryOpen && (
              <button
                onClick={onActionClick}
                disabled={isActionDisabled}
                className="text-white text-xs font-bold py-2 px-4 rounded-lg transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: isActionDisabled ? '#444' : '#E65313' }}
              >
                {actionLabel}
              </button>
            )}
          </div>

          {/* Slide-up summary panel */}
          {isMobileSummaryOpen && (
            <div className="mt-3 max-h-[75vh] overflow-y-auto">
              <BillSummary {...billSummaryProps} />
            </div>
          )}
        </div>
      )}

      {/* Extra bottom spacing on mobile so fixed bar doesn't overlap content */}
      {hasSelections && <div className="h-16 lg:hidden" />}
    </div>
  );
}
