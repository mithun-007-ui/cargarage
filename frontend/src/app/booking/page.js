'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { useAuth } from 'src/context/AuthContext';
import { addBooking } from 'src/lib/mockDb';
import { Calendar, Clock, ChevronLeft, CheckCircle2, User, Mail, Sparkles } from 'lucide-react';

export default function SlotBookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehicle, setVehicle] = useState(null);
  const [service, setService] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [estPrice, setEstPrice] = useState(0);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load configuration
  useEffect(() => {
    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    const storedService = localStorage.getItem('booking_flow_service');
    const storedPackage = localStorage.getItem('booking_flow_package');
    const storedPrice = localStorage.getItem('booking_flow_estimated_price');

    if (storedVehicle) setVehicle(JSON.parse(storedVehicle));
    if (storedService) setService(JSON.parse(storedService));
    if (storedPackage) {
      try {
        const parsed = JSON.parse(storedPackage);
        setPkg(parsed === 'none' ? null : parsed);
      } catch (e) {
        console.error(e);
      }
    }
    if (storedPrice) setEstPrice(parseFloat(storedPrice));

    // Prefill name/email if user is logged in
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Generate next 7 days for slot selection
  const getNextDays = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // Skip Sundays
      if (d.getDay() === 0) continue;

      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
      days.push({ value: dateStr, label });
    }
    return days;
  };

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Please select both a date and a time slot.');
      return;
    }
    if (!name || !email) {
      setError('Please fill in your contact information.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Prepare booking object
    const bookingDetails = {
      customerName: name,
      customerEmail: email,
      vehicle: vehicle || { make: 'Toyota', model: 'Camry', year: '2020', plateNumber: 'MOCK-123' },
      serviceType: service?.name || 'General Maintenance',
      packageSelected: pkg?.name || 'None',
      estimatedPrice: estPrice || 149.00,
      date,
      time
    };

    // Add to DB
    try {
      const newBooking = addBooking(bookingDetails);
      localStorage.setItem('booking_flow_confirmed_id', newBooking.id);
      
      // Clear flow selections from state
      localStorage.removeItem('booking_flow_vehicle');
      localStorage.removeItem('booking_flow_service');
      localStorage.removeItem('booking_flow_package');
      localStorage.removeItem('booking_flow_estimated_price');

      router.push('/booking-confirmation');
    } catch (err) {
      setError('Failed to record booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysList = getNextDays();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Schedule Your Service</h1>
            <p className="text-sm text-slate-400 mt-2">Pick an available calendar date and daily time slot to bring in your vehicle.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-700 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Scheduler Selection */}
            <div className="lg:col-span-8 space-y-6">
              {/* Date Selector */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary-600" />
                  Select Service Date
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {daysList.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setDate(day.value)}
                      className={`p-3.5 border rounded-xl text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        date === day.value
                          ? 'border-primary-600 bg-primary-50 text-primary-800 font-bold ring-2 ring-primary-500/10'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-350 text-slate-700'
                      }`}
                    >
                      <span className="text-xs uppercase text-slate-400">{day.label.split(',')[0]}</span>
                      <span className="text-sm font-semibold">{day.label.split(',')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot Selector */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary-600" />
                  Select Arrival Time
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`py-3 px-2 border rounded-xl text-center text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        time === slot
                          ? 'border-primary-600 bg-primary-50 text-primary-800 font-bold ring-2 ring-primary-500/10'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-350 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Details & Confirm */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
                <h2 className="font-bold text-slate-800 text-sm mb-4 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-accent-500" />
                  Booking Details
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Name field */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={14} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium text-slate-700"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={14} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium text-slate-700"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Summary cost */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-semibold text-slate-800">{service?.name || 'General Maintenance'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span className="font-semibold text-slate-800">{pkg?.name || 'None'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-1.5 mt-1.5 text-sm font-bold">
                      <span className="text-slate-800">Total Estimate:</span>
                      <span className="text-primary-800">${estPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold transition-all text-center shadow-lg shadow-accent-500/20 hover:shadow-accent-500/35 border border-accent-600 flex items-center justify-center gap-1.5 cursor-pointer text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Service Booking'}
                </button>
              </div>
            </div>
          </form>

          {/* Back button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.push('/estimator')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
