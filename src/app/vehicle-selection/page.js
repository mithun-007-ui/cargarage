'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import {
  Car, ChevronRight, AlertCircle, CheckCircle2, Fuel, Settings, Gauge,
  ShieldCheck, Receipt, MapPin, Star
} from 'lucide-react';

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2005 + 1 }, (_, i) => CURRENT_YEAR - i);

const BRAND_MODELS = {
  "Toyota": ["Fortuner", "Innova Crysta", "Glanza", "Urban Cruiser Hyryder", "Camry"],
  "Hyundai": ["Creta", "Venue", "i20", "Verna", "Alcazar", "Exter"],
  "Honda": ["City", "Amaze", "Elevate", "WR-V"],
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "Fronx", "Ertiga", "Grand Vitara"],
  "Tata": ["Nexon", "Punch", "Harrier", "Safari", "Altroz", "Tiago"],
  "Mahindra": ["Scorpio N", "XUV700", "Thar", "Bolero", "XUV 3XO"],
  "Kia": ["Seltos", "Sonet", "Carens", "Syros"],
  "MG": ["Hector", "Astor", "Comet EV", "Gloster", "Windsor EV"],
  "Volkswagen": ["Virtus", "Taigun"],
  "Skoda": ["Slavia", "Kushaq", "Superb"],
  "BMW": ["X1", "X3", "X5", "3 Series", "5 Series"],
  "Mercedes-Benz": ["A-Class", "C-Class", "GLC", "GLE", "E-Class"],
  "Audi": ["A4", "A6", "Q3", "Q5", "Q7"],
  "Renault": ["Kiger", "Triber", "Kwid"],
  "Nissan": ["Magnite", "X-Trail"]
};

function getBrandDisplay(make) {
  if (!make) return { abbr: 'XX' };
  return { abbr: String(make).trim().slice(0, 2).toUpperCase() };
}

const benefits = [
  { icon: Receipt, title: 'Transparent Estimate', desc: 'Itemized quote before any work begins. No surprises.' },
  { icon: ShieldCheck, title: 'Secure Booking', desc: 'Your data is encrypted. Cancel anytime free of charge.' },
  { icon: MapPin, title: 'Pickup & Drop-off', desc: 'We collect and return your vehicle from your doorstep.' },
  { icon: Star, title: 'Genuine OEM Parts', desc: 'Only certified parts with manufacturer warranty.' },
];

const LABEL = "text-xs font-bold uppercase tracking-wider block mb-1.5 text-gray-500";
const INPUT = "input-field w-full";
const SELECT = "input-field w-full cursor-pointer";

export default function VehicleSelectionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    make: '', model: '', plateNumber: '', year: String(CURRENT_YEAR),
    fuelType: '', transmission: '', kmReading: '', color: '',
  });
  const [savedVehicle, setSavedVehicle] = useState(null);
  const [error, setError] = useState('');
  const [stepsStatus, setStepsStatus] = useState({
    vehicle: false,
    services: false,
    package: false,
    slot: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('booking_flow_vehicle');
    setTimeout(() => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm({
            make: parsed.make || '', model: parsed.model || '', plateNumber: parsed.plateNumber || '',
            year: parsed.year || String(CURRENT_YEAR), fuelType: parsed.fuelType || '',
            transmission: parsed.transmission || '', kmReading: parsed.kmReading || '', color: parsed.color || ''
          });
          setSavedVehicle(parsed);
        } catch (e) { console.error(e); }
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vehicleSaved = localStorage.getItem('booking_flow_vehicle');
      const servicesSaved = localStorage.getItem('booking_flow_services');
      const packageSaved = localStorage.getItem('booking_flow_package');
      const slotSaved = localStorage.getItem('booking_flow_confirmed_id');
      
      setStepsStatus({
        vehicle: !!vehicleSaved,
        services: !!servicesSaved && JSON.parse(servicesSaved).length > 0,
        package: !!packageSaved,
        slot: !!slotSaved
      });
    }
  }, [savedVehicle]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'make') next.model = '';
      return next;
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.make || !form.model || !form.plateNumber || !form.fuelType || !form.transmission || !form.kmReading) {
      setError('Please fill in all required vehicle details.');
      return;
    }
    setError('');
    localStorage.setItem('booking_flow_vehicle', JSON.stringify(form));
    setSavedVehicle(form);
    router.push('/services');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <ProgressBar currentStep={1} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6">

            {/* ── Left: Form Card ── */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="rounded-3xl shadow-sm p-7 md:p-8" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}>
                <div className="flex items-center gap-3 mb-7">
                  <div className="p-3 rounded-xl" style={{ background: '#FFF3EE', color: '#E65313' }}>
                    <Car size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-gray-800">Enter Your Vehicle Details</h1>
                    <p className="text-sm text-gray-400 mt-0.5">All required fields are marked *</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl p-3.5 flex items-center gap-2.5 text-sm animate-shake"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Brand */}
                    <div>
                      <label className={LABEL}>Vehicle Brand *</label>
                      <select required value={form.make} onChange={e => handleChange('make', e.target.value)} className={SELECT}>
                        <option value="">Select Brand</option>
                        {Object.keys(BRAND_MODELS).map(brand => <option key={brand} value={brand}>{brand}</option>)}
                      </select>
                    </div>

                    {/* Model */}
                    <div>
                      <label className={LABEL}>Vehicle Model *</label>
                      <select required disabled={!form.make} value={form.model} onChange={e => handleChange('model', e.target.value)} className={SELECT + ' disabled:opacity-50 disabled:cursor-not-allowed'}>
                        <option value="">Select Model</option>
                        {form.make && BRAND_MODELS[form.make]?.map(model => <option key={model} value={model}>{model}</option>)}
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <label className={LABEL}>Manufacturing Year *</label>
                      <select value={form.year} onChange={e => handleChange('year', e.target.value)} className={SELECT}>
                        {YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                      </select>
                    </div>

                    {/* Fuel Type */}
                    <div>
                      <label className={LABEL}>Fuel Type *</label>
                      <select required value={form.fuelType} onChange={e => handleChange('fuelType', e.target.value)} className={SELECT}>
                        <option value="">Select Fuel Type</option>
                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Transmission */}
                    <div>
                      <label className={LABEL}>Transmission *</label>
                      <select required value={form.transmission} onChange={e => handleChange('transmission', e.target.value)} className={SELECT}>
                        <option value="">Select Transmission</option>
                        {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Reg Number */}
                    <div>
                      <label className={LABEL}>Registration Number *</label>
                      <input
                        type="text" required value={form.plateNumber}
                        onChange={e => handleChange('plateNumber', e.target.value.toUpperCase())}
                        className={INPUT + ' font-mono uppercase'}
                        placeholder="e.g. TN38AB1234"
                      />
                    </div>

                    {/* KM Reading */}
                    <div>
                      <label className={LABEL}>Current KM Reading *</label>
                      <div className="relative">
                        <input
                          type="number" required min="0" value={form.kmReading}
                          onChange={e => handleChange('kmReading', e.target.value)}
                          className={INPUT + ' pr-12'}
                          placeholder="e.g. 28000"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">km</span>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className={LABEL}>Vehicle Colour <span className="font-normal text-gray-400">(optional)</span></label>
                      <input
                        type="text" value={form.color}
                        onChange={e => handleChange('color', e.target.value)}
                        className={INPUT}
                        placeholder="e.g. Pearl White"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end mt-2" style={{ borderTop: '1px solid #E2D8CE' }}>
                    <button
                      type="submit"
                      className="btn-primary text-base"
                    >
                      Continue to Services
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Saved vehicle card */}
              {savedVehicle && (
                <div className="mt-6">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3 text-gray-500">Saved Vehicle</h2>
                  <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}>
                    <div className="p-4 flex items-center justify-between" style={{ background: '#F8F5F0', borderBottom: '1px solid #E2D8CE' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white"
                          style={{ background: '#E65313' }}>
                          {getBrandDisplay(savedVehicle.make).abbr}
                        </div>
                        <div>
                          <p className="font-extrabold text-base text-gray-800">{savedVehicle.make} {savedVehicle.model}</p>
                          <p className="text-xs mt-0.5 text-gray-500">{savedVehicle.year} • {savedVehicle.fuelType} • {savedVehicle.transmission}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Reg. No.</p>
                        <p className="font-mono font-bold text-sm text-gray-800">{savedVehicle.plateNumber}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5"><Gauge size={14} style={{ color: '#E65313' }} /> {savedVehicle.kmReading ? parseInt(savedVehicle.kmReading).toLocaleString('en-IN') : '—'} km</div>
                      <div className="flex items-center gap-1.5"><Fuel size={14} style={{ color: '#E65313' }} /> {savedVehicle.fuelType}</div>
                      <div className="flex items-center gap-1.5"><Settings size={14} style={{ color: '#E65313' }} /> {savedVehicle.transmission}</div>
                      <div className="ml-auto flex items-center gap-1 text-green-600 font-bold">
                        <CheckCircle2 size={14} /> Saved
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Premium Visual Panel ── */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-6">

              {/* ── Booking Progress Stepper ── */}
              <div className="card p-6 md:p-8 space-y-6" style={{ background: '#FFFFFF', borderColor: '#E2D8CE' }}>
                <div>
                  <h2 className="text-xl font-black text-gray-800">Booking Progress</h2>
                  <p className="text-xs text-gray-500 mt-1">Complete each stage to book your premium car service.</p>
                </div>

                {/* Stepper responsive container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 1, label: 'Vehicle Details', desc: 'Enter brand, model and mileage.', active: true, completed: stepsStatus.vehicle },
                    { id: 2, label: 'Select Services', desc: 'Choose repairs with clear pricing.', active: false, completed: stepsStatus.services },
                    { id: 3, label: 'Choose Package', desc: 'Compare Silver, Gold & Platinum care.', active: false, completed: stepsStatus.package },
                    { id: 4, label: 'Book Slot', desc: 'Schedule a convenient time slot.', active: false, completed: stepsStatus.slot },
                  ].map((step) => {
                    const isCurrent = step.active;
                    const isCompleted = step.completed;

                    return (
                      <div
                        key={step.id}
                        className="p-4 rounded-2xl border-2 flex flex-col justify-between transition-all hover:scale-[1.01]"
                        style={{
                          background: isCurrent ? '#FFF3EE' : '#FFFFFF',
                          borderColor: isCurrent ? '#E65313' : isCompleted ? '#16A34A' : '#E2D8CE',
                        }}
                      >
                        <div>
                          {/* Step Header Indicator */}
                          <div className="flex items-center justify-between mb-2.5">
                            <span
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                              style={{
                                background: isCurrent ? '#E65313' : isCompleted ? '#F0FDF4' : '#F3F4F6',
                                color: isCurrent ? '#FFFFFF' : isCompleted ? '#16A34A' : '#667085',
                              }}
                            >
                              Step 0{step.id}
                            </span>

                            {isCompleted ? (
                              <span className="text-green-600 font-extrabold text-[11px] flex items-center gap-0.5">
                                <CheckCircle2 size={13} /> Done
                              </span>
                            ) : isCurrent ? (
                              <span className="text-orange-600 font-extrabold text-[11px] uppercase tracking-wider">
                                Active
                              </span>
                            ) : null}
                          </div>

                          <h3 className="font-extrabold text-sm text-gray-800">{step.label}</h3>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefits grid */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800 mb-4">Why book with Bug Slayers?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {benefits.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div key={b.title} className="rounded-2xl p-4 flex items-start gap-3 transition-all hover:-translate-y-0.5"
                        style={{ background: '#FFFFFF', border: '1px solid #E2D8CE', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EE' }}>
                          <Icon size={17} style={{ color: '#E65313' }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{b.title}</h3>
                          <p className="text-xs mt-0.5 leading-relaxed text-gray-500">{b.desc}</p>
                        </div>
                      </div>
                    );
                  })}
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
