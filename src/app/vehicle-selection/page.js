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

const LABEL = "text-sm font-bold text-slate-600 block mb-1.5";
const INPUT = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all min-h-[44px]";
const SELECT = INPUT + " cursor-pointer";

export default function VehicleSelectionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    make: '', model: '', plateNumber: '', year: String(CURRENT_YEAR),
    fuelType: '', transmission: '', kmReading: '', color: '',
  });
  const [savedVehicle, setSavedVehicle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('booking_flow_vehicle');
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
  }, []);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#060912] via-[#0d1220] to-[#060f24]">
      <Navbar />

      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <ProgressBar currentStep={1} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6">

            {/* ── Left: Form Card ── */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="bg-white rounded-3xl shadow-2xl shadow-primary-900/30 p-7 md:p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                    <Car size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-800">Enter Your Vehicle Details</h1>
                    <p className="text-sm text-slate-500 mt-0.5">All required fields are marked with *</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-sm text-red-700 animate-shake">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
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
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">km</span>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className={LABEL}>Vehicle Colour <span className="font-normal text-slate-400">(optional)</span></label>
                      <input
                        type="text" value={form.color}
                        onChange={e => handleChange('color', e.target.value)}
                        className={INPUT}
                        placeholder="e.g. Pearl White"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end mt-2">
                    <button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-8 py-3.5 rounded-xl font-bold transition-all text-base flex items-center gap-2 shadow-md shadow-primary-600/15 cursor-pointer min-h-[48px]"
                    >
                      Continue to Services
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Saved vehicle card */}
              {savedVehicle && (
                <div className="mt-5">
                  <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">Saved Vehicle</h2>
                  <div className="bg-[#111827] rounded-2xl border border-[#1e2d45] overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary-500/30 flex items-center justify-center text-sm font-black text-white border border-white/20">
                          {getBrandDisplay(savedVehicle.make).abbr}
                        </div>
                        <div>
                          <p className="text-white font-extrabold text-base">{savedVehicle.make} {savedVehicle.model}</p>
                          <p className="text-primary-200 text-xs mt-0.5">{savedVehicle.year} • {savedVehicle.fuelType} • {savedVehicle.transmission}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-200 text-[10px] uppercase font-bold">Reg. No.</p>
                        <p className="text-white font-mono font-bold text-sm">{savedVehicle.plateNumber}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5"><Gauge size={14} className="text-primary-400" /> {savedVehicle.kmReading ? parseInt(savedVehicle.kmReading).toLocaleString('en-IN') : '—'} km</div>
                      <div className="flex items-center gap-1.5"><Fuel size={14} className="text-primary-400" /> {savedVehicle.fuelType}</div>
                      <div className="flex items-center gap-1.5"><Settings size={14} className="text-primary-400" /> {savedVehicle.transmission}</div>
                      <div className="ml-auto flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 size={14} /> Saved
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Illustration + Benefits ── */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-8">
              {/* Car SVG illustration */}
              <div className="relative flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full bg-primary-600/8 glow-pulse" />
                </div>
                <svg viewBox="0 0 560 280" className="w-full max-w-lg h-auto relative z-10 drop-shadow-[0_0_50px_rgba(0,82,255,0.2)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="240" width="520" height="5" rx="2.5" fill="#1e2d45" opacity="0.6"/>
                  <path d="M 80,200 L 80,170 C 80,165 85,160 90,158 L 150,140 C 165,128 190,110 230,108 L 330,108 C 370,108 395,126 410,140 L 470,158 C 475,160 480,165 480,170 L 480,200 Z" fill="#111827" stroke="#0052ff" strokeWidth="2"/>
                  <path d="M 175,140 C 185,118 210,102 245,100 L 315,100 C 350,100 375,116 385,140 Z" fill="#0d1a30" stroke="#1e2d45" strokeWidth="1.5"/>
                  <path d="M 185,140 C 195,120 215,106 248,104 L 295,104 C 310,104 330,118 340,140 Z" fill="#0052ff" opacity="0.15" stroke="#0052ff" strokeWidth="1" strokeOpacity="0.4"/>
                  <ellipse cx="96" cy="175" rx="12" ry="8" fill="#0052ff" opacity="0.8"/>
                  <ellipse cx="96" cy="175" rx="8" ry="5" fill="#60a5fa" opacity="0.9"/>
                  <path d="M 84,172 L 30,160 M 84,175 L 25,175 M 84,178 L 30,190" stroke="#0052ff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
                  <rect x="460" y="168" width="16" height="14" rx="3" fill="#ef4444" opacity="0.7"/>
                  <circle cx="160" cy="215" r="28" fill="#0f172a" stroke="#1e2d45" strokeWidth="3"/>
                  <circle cx="160" cy="215" r="20" fill="#111827" stroke="#0052ff" strokeWidth="2.5" opacity="0.8"/>
                  <circle cx="160" cy="215" r="10" fill="#1e2d45"/>
                  {[0,60,120,180,240,300].map(deg => (
                    <line key={deg} x1="160" y1="215" x2={160 + 17 * Math.cos(deg * Math.PI / 180)} y2={215 + 17 * Math.sin(deg * Math.PI / 180)} stroke="#0052ff" strokeWidth="1.5" opacity="0.5"/>
                  ))}
                  <circle cx="400" cy="215" r="28" fill="#0f172a" stroke="#1e2d45" strokeWidth="3"/>
                  <circle cx="400" cy="215" r="20" fill="#111827" stroke="#0052ff" strokeWidth="2.5" opacity="0.8"/>
                  <circle cx="400" cy="215" r="10" fill="#1e2d45"/>
                  {[0,60,120,180,240,300].map(deg => (
                    <line key={deg} x1="400" y1="215" x2={400 + 17 * Math.cos(deg * Math.PI / 180)} y2={215 + 17 * Math.sin(deg * Math.PI / 180)} stroke="#0052ff" strokeWidth="1.5" opacity="0.5"/>
                  ))}
                  <rect x="260" y="158" width="40" height="5" rx="2.5" fill="#1e2d45" stroke="#0052ff" strokeWidth="0.8" opacity="0.7"/>
                </svg>
              </div>

              {/* Benefits grid */}
              <div>
                <h2 className="text-xl font-extrabold text-white mb-5">Why book with Bug Slayers?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div key={b.title} className="bg-[#111827] rounded-2xl p-5 border border-[#1e2d45] flex items-start gap-4 hover:border-primary-600/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-primary-600/15 flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{b.title}</h3>
                          <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
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
