'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import VehicleBanner from 'src/components/VehicleBanner';
import { useAuth } from 'src/context/AuthContext';
import { addBooking } from 'src/lib/mockDb';
import { Calendar, Clock, ChevronLeft, AlertCircle, User, Mail, MapPin, Truck, Building2, Tag, Percent } from 'lucide-react';

const SERVICE_CENTERS = [
  { id: 'andheri', name: 'AutoCare Pro — Andheri West', address: 'Versova Link Rd, Andheri West, Mumbai 400058', timing: 'Mon–Sat: 8AM–7PM' },
  { id: 'bandra', name: 'AutoCare Pro — Bandra East', address: 'Station Rd, Bandra East, Mumbai 400051', timing: 'Mon–Sat: 9AM–6PM' },
  { id: 'powai', name: 'AutoCare Pro — Powai', address: 'Hiranandani Gardens, Powai, Mumbai 400076', timing: 'Mon–Sun: 8AM–8PM' },
];

const PICKUP_OPTIONS = [
  { id: 'dropoff', label: 'Drop-off at Center', icon: Building2, description: 'Drive your vehicle to the selected center.' },
  { id: 'pickup', label: 'Pickup & Delivery', icon: Truck, description: 'We pick up and drop off (₹499 extra).' },
];

const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default function SlotBookingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [pkg, setPkg] = useState(null);
  const [estPrice, setEstPrice] = useState(0);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceCenter, setServiceCenter] = useState('');
  const [pickupOption, setPickupOption] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sv = localStorage.getItem('booking_flow_vehicle');
    const ss = localStorage.getItem('booking_flow_services');
    const sp = localStorage.getItem('booking_flow_package');
    const pr = localStorage.getItem('booking_flow_estimated_price');
    if (sv) { try { setVehicle(JSON.parse(sv)); } catch (e) {} }
    if (ss) { try { setSelectedServices(JSON.parse(ss)); } catch (e) {} }
    if (sp) { try { const p = JSON.parse(sp); setPkg(p === 'none' ? null : p); } catch (e) {} }
    if (pr) setEstPrice(parseFloat(pr));
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  const getNextDays = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0) continue;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ value: dateStr, label: `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}` });
    }
    return days.slice(0, 10);
  };

  const pickupExtra = pickupOption === 'pickup' ? 499 : 0;
  const total = estPrice + pickupExtra;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) { setError('Please select a date and time slot.'); return; }
    if (!serviceCenter) { setError('Please select a service center.'); return; }
    if (!pickupOption) { setError('Please select a pickup option.'); return; }
    if (!name || !email) { setError('Please fill in your contact details.'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const center = SERVICE_CENTERS.find(c => c.id === serviceCenter);
      const newBooking = addBooking({
        customerName: name,
        customerEmail: email,
        vehicle: vehicle || { make: 'Unknown', model: 'Unknown', year: '2022', plateNumber: 'XX-00-XX-0000' },
        serviceType: selectedServices[0]?.name || 'General Service',
        selectedServices,
        packageSelected: pkg?.name || 'None',
        packagePrice: pkg?.price || 0,
        estimatedPrice: total,
        serviceCenter: center?.name || serviceCenter,
        pickupOption: pickupOption === 'pickup' ? 'Pickup & Delivery' : 'Drop-off',
        date, time,
      });
      localStorage.setItem('booking_flow_confirmed_id', newBooking.id);
      ['booking_flow_vehicle', 'booking_flow_services', 'booking_flow_service',
       'booking_flow_package', 'booking_flow_estimated_price'].forEach(k => localStorage.removeItem(k));
      router.push('/booking-confirmation');
    } catch (err) {
      setError('Failed to record booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow py-6">
        <div className="max-w-5xl mx-auto px-4">
          <ProgressBar currentStep={6} />

          {vehicle && (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          <div className="mb-5">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Schedule Your Service</h1>
            <p className="text-xs text-slate-400 mt-1">Pick a date, time slot, and service center to confirm your booking.</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={15} className="text-red-500 shrink-0" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
            {/* Left — Scheduler */}
            <div className="lg:col-span-8 space-y-4">

              {/* Date */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Calendar size={15} className="text-primary-600" /> Select Date
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {getNextDays().map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setDate(day.value)}
                      className={`p-2.5 border rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        date === day.value
                          ? 'border-primary-600 bg-primary-50 text-primary-800 font-bold ring-2 ring-primary-500/10'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-[9px] uppercase text-slate-400 font-semibold">{day.label.split(',')[0]}</span>
                      <span className="text-xs font-semibold">{day.label.split(',')[1]?.trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-primary-600" /> Select Time
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`py-2.5 border rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                        time === slot
                          ? 'border-primary-600 bg-primary-50 text-primary-800 font-bold ring-2 ring-primary-500/10'
                          : 'bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Center */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <MapPin size={15} className="text-primary-600" /> Service Center
                </h2>
                <div className="space-y-2">
                  {SERVICE_CENTERS.map(center => (
                    <button
                      key={center.id}
                      type="button"
                      onClick={() => setServiceCenter(center.id)}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all cursor-pointer ${
                        serviceCenter === center.id
                          ? 'border-primary-500 bg-primary-50/30'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${serviceCenter === center.id ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          <Building2 size={14} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${serviceCenter === center.id ? 'text-primary-800' : 'text-slate-700'}`}>{center.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{center.address}</p>
                          <p className="text-[10px] text-slate-400">{center.timing}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup Option */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Truck size={15} className="text-primary-600" /> Pickup Option
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PICKUP_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPickupOption(opt.id)}
                        className={`text-left p-4 border-2 rounded-xl transition-all cursor-pointer ${
                          pickupOption === opt.id
                            ? 'border-primary-500 bg-primary-50/30'
                            : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <Icon size={18} className={`mb-2 ${pickupOption === opt.id ? 'text-primary-600' : 'text-slate-400'}`} />
                        <p className={`text-xs font-bold ${pickupOption === opt.id ? 'text-primary-800' : 'text-slate-700'}`}>{opt.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — Contact & Confirm */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-4 pb-3 border-b border-slate-100">Contact Details</h2>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Name</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text" required value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium text-slate-700"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email" required value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium text-slate-700"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 text-slate-600">
                    {vehicle && <div className="flex justify-between"><span>Vehicle:</span><span className="font-semibold text-slate-800">{vehicle.make} {vehicle.model}</span></div>}
                    {selectedServices.length > 0 && <div className="flex justify-between"><span>Services:</span><span className="font-semibold text-slate-800">{selectedServices.length} selected</span></div>}
                    <div className="flex justify-between"><span>Package:</span><span className="font-semibold text-slate-800">{pkg?.name || 'None'}</span></div>
                    {pickupOption === 'pickup' && <div className="flex justify-between"><span>Pickup:</span><span className="font-semibold text-slate-800">+₹499</span></div>}
                    <div className="flex justify-between border-t border-slate-200/60 pt-1.5 mt-1">
                      <span className="font-bold text-slate-800">Total:</span>
                      <span className="font-black text-primary-800">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent-500/20 border border-accent-600 flex items-center justify-center gap-1.5 cursor-pointer text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Service Booking'}
                </button>
              </div>
            </div>
          </form>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.push('/estimator')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
