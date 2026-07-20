'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import VehicleBanner from 'src/components/VehicleBanner';
import { addBooking } from 'src/lib/mockDb';
import { 
  CreditCard, 
  ChevronLeft, 
  AlertCircle, 
  ShieldCheck, 
  Wrench, 
  QrCode, 
  Building, 
  Lock, 
  Wallet,
  ArrowRight
} from 'lucide-react';

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
];

export default function PaymentPage() {
  const router = useRouter();

  // Booking details from flow
  const [vehicle, setVehicle] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [slotDetails, setSlotDetails] = useState(null);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, netbanking, cod
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  // Status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const sv = localStorage.getItem('booking_flow_vehicle');
    const ss = localStorage.getItem('booking_flow_services');
    const sp = localStorage.getItem('booking_flow_package');
    const sd = localStorage.getItem('booking_flow_slot_details');

    if (sv) { try { setVehicle(JSON.parse(sv)); } catch (e) {} }
    if (ss) { try { setSelectedServices(JSON.parse(ss)); } catch (e) {} }
    if (sp) { try { const p = JSON.parse(sp); setPkg(p === 'none' ? null : p); } catch (e) {} }
    if (sd) { try { setSlotDetails(JSON.parse(sd)); } catch (e) {} }
  }, []);

  // Redirect back if no slot details
  useEffect(() => {
    if (slotDetails === null && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if (!localStorage.getItem('booking_flow_slot_details')) {
          router.push('/booking');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [slotDetails, router]);

  // Card formatting
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setExpiry(value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(value);
  };

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!expiry.includes('/') || expiry.length !== 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cvv.length !== 3) {
        setError('Please enter a valid 3-digit CVV.');
        return;
      }
      if (!cardName.trim()) {
        setError('Please enter the cardholder name.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.includes('@') || upiId.length < 5) {
        setError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setError('Please select your bank.');
        return;
      }
    }

    // Start payment processing steps simulation
    setIsProcessing(true);
    setProcessStep(0);

    const steps = [
      'Initiating secure 256-bit SSL gateway connection...',
      'Verifying account balance and credentials...',
      'Authorizing transaction block...',
      'Securing service slot bookings...',
      'Generating electronic invoice details...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessStep(i + 1);
    }

    try {
      // Record booking in the mock database
      const newBooking = addBooking({
        customerName: slotDetails.customerName,
        customerEmail: slotDetails.customerEmail,
        vehicle: vehicle || { make: 'Unknown', model: 'Unknown', year: '2022', plateNumber: 'XX-00-XX-0000' },
        serviceType: selectedServices[0]?.name || 'General Service',
        selectedServices,
        packageSelected: pkg?.name || 'None',
        packagePrice: pkg?.price || 0,
        estimatedPrice: slotDetails.totalPrice,
        serviceCenter: slotDetails.serviceCenter,
        pickupOption: slotDetails.pickupOption,
        date: slotDetails.date,
        time: slotDetails.time,
      });

      // Set booking flow final ID
      localStorage.setItem('booking_flow_confirmed_id', newBooking.id);

      // Clean up localStorage booking items
      ['booking_flow_vehicle', 'booking_flow_services', 'booking_flow_service',
       'booking_flow_estimated_price', 'booking_flow_package', 'booking_flow_slot_details'].forEach(k => localStorage.removeItem(k));

      // Proceed to confirmation screen
      router.push('/booking-confirmation');
    } catch (err) {
      setError('Payment processed but failed to register the booking. Please contact support.');
      setIsProcessing(false);
    }
  };

  if (!slotDetails) {
    return (
      <div className="flex flex-col min-h-screen justify-between" style={{ background: '#F8F5F0' }}>
        <Navbar />
        <div className="text-center py-20">
          <Wrench className="animate-spin mx-auto text-[#E65313] mb-4" size={40} />
          <p className="font-bold text-slate-700">Loading Payment Gateway...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const stepsText = [
    'Connecting to banking network...',
    'Validating account authentication...',
    'Authorizing gateway token...',
    'Creating booking ticket...',
    'Booking confirmed!',
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      {/* Processing Transaction Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border" style={{ borderColor: '#E2D8CE' }}>
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#E65313] rounded-full animate-spin"></div>
              <Wrench size={30} className="text-[#E65313] animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">Processing Payment</h3>
            <p className="text-xs text-slate-400 mb-6">Do not close this page or press back.</p>

            <div className="space-y-3.5 text-left bg-slate-50 p-5 rounded-2xl border" style={{ borderColor: '#E2D8CE' }}>
              {stepsText.map((text, idx) => {
                const isActive = processStep === idx;
                const isPassed = processStep > idx;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                        isPassed ? 'bg-green-500 text-white' : isActive ? 'bg-[#E65313] text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs font-semibold ${isPassed ? 'text-green-600' : isActive ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <ProgressBar currentStep={5} />

          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="mb-5 mt-2">
            <span className="section-label">Step 5 of 5 · Secure Checkout</span>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#202020' }}>Payment Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">Complete your payment securely to finalize slot registration.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl p-3 flex items-center gap-2 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <AlertCircle size={15} className="shrink-0" style={{ color: '#DC2626' }} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
            {/* Left Column — Payment Method & Form */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Payment Methods Selection Tab */}
              <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: '#E2D8CE' }}>
                <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#E65313]" /> Select Payment Method
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Card Tab */}
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setError(''); }}
                    className="flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all"
                    style={paymentMethod === 'card' ? { borderColor: '#E65313', background: '#FFF3EE' } : { borderColor: '#E2D8CE', background: '#FFFFFF' }}
                  >
                    <CreditCard size={20} className={paymentMethod === 'card' ? 'text-[#E65313]' : 'text-slate-400'} />
                    <span className="text-xs font-bold" style={{ color: paymentMethod === 'card' ? '#E65313' : '#202020' }}>Credit/Debit Card</span>
                  </button>

                  {/* UPI Tab */}
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('upi'); setError(''); }}
                    className="flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all"
                    style={paymentMethod === 'upi' ? { borderColor: '#E65313', background: '#FFF3EE' } : { borderColor: '#E2D8CE', background: '#FFFFFF' }}
                  >
                    <QrCode size={20} className={paymentMethod === 'upi' ? 'text-[#E65313]' : 'text-slate-400'} />
                    <span className="text-xs font-bold" style={{ color: paymentMethod === 'upi' ? '#E65313' : '#202020' }}>UPI / QR Code</span>
                  </button>

                  {/* NetBanking Tab */}
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('netbanking'); setError(''); }}
                    className="flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all"
                    style={paymentMethod === 'netbanking' ? { borderColor: '#E65313', background: '#FFF3EE' } : { borderColor: '#E2D8CE', background: '#FFFFFF' }}
                  >
                    <Building size={20} className={paymentMethod === 'netbanking' ? 'text-[#E65313]' : 'text-slate-400'} />
                    <span className="text-xs font-bold" style={{ color: paymentMethod === 'netbanking' ? '#E65313' : '#202020' }}>Net Banking</span>
                  </button>

                  {/* Pay on Delivery Tab */}
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('cod'); setError(''); }}
                    className="flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all"
                    style={paymentMethod === 'cod' ? { borderColor: '#E65313', background: '#FFF3EE' } : { borderColor: '#E2D8CE', background: '#FFFFFF' }}
                  >
                    <Wallet size={20} className={paymentMethod === 'cod' ? 'text-[#E65313]' : 'text-slate-400'} />
                    <span className="text-xs font-bold" style={{ color: paymentMethod === 'cod' ? '#E65313' : '#202020' }}>Pay at Center</span>
                  </button>

                </div>
              </div>

              {/* Dynamic Payment Details Input */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: '#E2D8CE' }}>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  
                  {/* Credit/Debit Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      {/* Physical Card Layout Simulation */}
                      <div className="relative bg-[#211F1D] text-white rounded-2xl p-5 overflow-hidden shadow-lg border border-slate-700 max-w-sm mx-auto mb-6">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500 rounded-full mix-blend-screen filter blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400">Secure Payment Card</p>
                            <h4 className="text-sm font-black text-white mt-1">Bug Slayers Garage</h4>
                          </div>
                          <CreditCard size={24} className="text-orange-500" />
                        </div>
                        <div className="mb-6">
                          <p className="text-slate-400 text-[8px] uppercase tracking-wider">Card Number</p>
                          <p className="text-lg font-mono font-bold tracking-widest mt-1 text-white">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-slate-400 text-[8px] uppercase tracking-wider">Card Holder</p>
                            <p className="text-xs font-bold mt-1 text-white truncate max-w-[150px]">
                              {cardName.toUpperCase() || 'YOUR NAME'}
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <p className="text-slate-400 text-[8px] uppercase tracking-wider">Expires</p>
                              <p className="text-xs font-mono font-bold mt-1 text-white">{expiry || 'MM/YY'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[8px] uppercase tracking-wider">CVV</p>
                              <p className="text-xs font-mono font-bold mt-1 text-white">{cvv || '•••'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Input fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Card Holder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name as printed on card"
                            className="input-field font-medium text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="0000 0000 0000 0000"
                            className="input-field font-mono text-sm"
                            maxLength={19}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={expiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              className="input-field font-mono text-sm text-center"
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">CVV</label>
                            <input
                              type="password"
                              value={cvv}
                              onChange={handleCvvChange}
                              placeholder="123"
                              className="input-field font-mono text-sm text-center"
                              maxLength={3}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border rounded-2xl mb-4" style={{ borderColor: '#E2D8CE' }}>
                        <div className="w-36 h-36 bg-white border p-2 rounded-xl flex items-center justify-center shadow-sm relative">
                          <QrCode size={120} className="text-slate-800" />
                          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-3 text-center border rounded-xl">
                            <span className="text-[10px] font-black text-[#E65313] uppercase tracking-wider">Dynamic QR</span>
                            <span className="text-[9px] text-slate-400 mt-1">Generated upon entering UPI ID below</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-3 text-center">Scan QR code using Google Pay, PhonePe, Paytm, or BHIM UPI.</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobileNumber@upi, name@ybl, username@okhdfcbank"
                          className="input-field font-medium text-sm"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* NetBanking Form */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Popular Banks</label>
                      <div className="grid grid-cols-2 gap-3">
                        {POPULAR_BANKS.map(bank => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className="p-3 border rounded-xl text-left text-xs font-bold transition-all"
                            style={selectedBank === bank.id ? { borderColor: '#E65313', background: '#FFF3EE', color: '#E65313' } : { borderColor: '#E2D8CE', background: '#FFFFFF', color: '#667085' }}
                          >
                            {bank.name}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">All Banks</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="input-field text-sm font-semibold"
                        >
                          <option value="">Select a Bank...</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="canara">Canara Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Cash or Card at Service Center */}
                  {paymentMethod === 'cod' && (
                    <div className="p-5 bg-[#FFF3EE] rounded-2xl border flex items-start gap-3.5" style={{ borderColor: '#FFD9C8' }}>
                      <div className="p-2 bg-[#E65313] text-white rounded-xl">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#E65313]">Pay at Center after Service Completion</h4>
                        <p className="text-xs leading-relaxed text-slate-600 mt-1">
                          No advance payment is required online. You can pay via Credit Card, Debit Card, UPI, or Cash directly at the service center when your vehicle is ready for delivery.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Guarantee Seal */}
                  <div className="flex items-center gap-2 justify-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pt-4 border-t" style={{ borderColor: '#E2D8CE' }}>
                    <Lock size={12} className="text-green-500" />
                    <span>Secure 256-bit SSL encrypted transaction block</span>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/booking')}
                      className="btn-outline text-xs px-4"
                    >
                      <ChevronLeft size={14} /> Back to Slots
                    </button>
                    
                    <button
                      type="submit"
                      className="btn-primary py-3 px-8 text-xs font-bold shadow-lg shadow-orange-500/20"
                    >
                      {paymentMethod === 'cod' ? 'Confirm Slot' : `Pay ₹${slotDetails.totalPrice.toLocaleString('en-IN')}`} <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>

                </form>
              </div>

            </div>

            {/* Right Column — Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="sticky top-20">
                <div className="bg-white rounded-2xl border shadow-md p-5" style={{ borderColor: '#E2D8CE' }}>
                  <h2 className="font-bold text-gray-800 text-sm mb-4 pb-3 border-b" style={{ borderColor: '#E2D8CE' }}>Order Summary</h2>

                  <div className="space-y-4">
                    {/* Customer info */}
                    <div className="text-xs bg-slate-50 p-3.5 rounded-xl border space-y-1.5" style={{ borderColor: '#E2D8CE' }}>
                      <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Contact Info</p>
                      <p className="font-bold text-slate-700">{slotDetails.customerName}</p>
                      <p className="text-slate-500">{slotDetails.customerEmail}</p>
                    </div>

                    {/* Booking Details */}
                    <div className="text-xs bg-slate-50 p-3.5 rounded-xl border space-y-2" style={{ borderColor: '#E2D8CE' }}>
                      <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Scheduled Appointment</p>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Center</span>
                        <span className="font-bold text-slate-700">{slotDetails.serviceCenter}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: '#E2D8CE' }}>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Date</span>
                          <span className="font-bold text-slate-700">{slotDetails.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Time</span>
                          <span className="font-bold text-slate-700">{slotDetails.time}</span>
                        </div>
                      </div>
                      <div className="border-t pt-2" style={{ borderColor: '#E2D8CE' }}>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Delivery mode</span>
                        <span className="font-bold text-slate-700">{slotDetails.pickupOption}</span>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="text-xs bg-slate-50 p-3.5 rounded-xl border space-y-2.5" style={{ borderColor: '#E2D8CE' }}>
                      <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Cost breakdown</p>
                      
                      <div className="space-y-1.5 border-b pb-2" style={{ borderColor: '#E2D8CE' }}>
                        {selectedServices.map(s => (
                          <div key={s.id} className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-600 font-medium truncate max-w-[180px]">{s.name}</span>
                            <span className="font-semibold text-gray-800">₹{s.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        {pkg && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-gray-600 font-medium">Package ({pkg.name})</span>
                            <span className="font-semibold text-gray-800">₹{pkg.price.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-baseline pt-1">
                        <span className="font-bold text-gray-800 text-sm">Estimated Total:</span>
                        <span className="font-black text-lg text-[#E65313]">₹{slotDetails.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
