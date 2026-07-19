'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import { Car, ChevronRight, AlertCircle, CheckCircle2, Fuel, Settings, Gauge } from 'lucide-react';

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

// Helper for generating an abbreviation and color dynamically for unknown brands
function getBrandDisplay(make) {
  if (!make) return { abbr: 'XX', bg: '#1e40af', text: '#fff' };
  const str = String(make).trim();
  const abbr = str.slice(0, 2).toUpperCase();
  return { abbr, bg: '#1e40af', text: '#fff' };
}

export default function VehicleSelectionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    make: '', model: '', plateNumber: '', year: String(CURRENT_YEAR), fuelType: '', transmission: '', kmReading: '', color: '',
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
          year: parsed.year || String(CURRENT_YEAR), fuelType: parsed.fuelType || '', transmission: parsed.transmission || '', 
          kmReading: parsed.kmReading || '', color: parsed.color || ''
        });
        setSavedVehicle(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'make') next.model = ''; // Automatically clear model when brand changes
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
    const vehicleData = { ...form };
    localStorage.setItem('booking_flow_vehicle', JSON.stringify(vehicleData));
    setSavedVehicle(vehicleData);
    router.push('/services');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-3xl mx-auto px-4">
          <ProgressBar currentStep={1} />

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                <Car size={22} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800">Enter Your Vehicle Details</h1>
                <p className="text-xs text-slate-400">Manually enter your vehicle details below.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Vehicle Brand */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Vehicle Brand *
                  </label>
                  <select
                    required
                    value={form.make}
                    onChange={(e) => handleChange('make', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all cursor-pointer"
                  >
                    <option value="">Select Brand</option>
                    {Object.keys(BRAND_MODELS).map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Model */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Vehicle Model *
                  </label>
                  <select
                    required
                    disabled={!form.make}
                    value={form.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">Select Model</option>
                    {form.make && BRAND_MODELS[form.make]?.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Manufacturing Year */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Manufacturing Year *</label>
                  <select
                    value={form.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  >
                    {YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Fuel Type *</label>
                  <select
                    required value={form.fuelType}
                    onChange={(e) => handleChange('fuelType', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  >
                    <option value="">Select Fuel Type</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Transmission *</label>
                  <select
                    required value={form.transmission}
                    onChange={(e) => handleChange('transmission', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  >
                    <option value="">Select Transmission</option>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Registration Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.plateNumber}
                    onChange={(e) => handleChange('plateNumber', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-mono uppercase"
                    placeholder="e.g. TN38AB1234"
                  />
                </div>

                {/* KM Reading */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Current Kilometer Reading *
                  </label>
                  <div className="relative">
                    <input
                      type="number" required min="0"
                      value={form.kmReading}
                      onChange={(e) => handleChange('kmReading', e.target.value)}
                      className="w-full px-3 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                      placeholder="e.g. 28000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">km</span>
                  </div>
                </div>

                {/* Vehicle Color */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Vehicle Color (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                    placeholder="e.g. White"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-7 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-md shadow-primary-600/15 cursor-pointer"
                >
                  Continue to Services
                  <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Saved Vehicle Card */}
          {savedVehicle && (
            <div className="mt-5">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">Saved Vehicle</h2>
              <div className="bg-white rounded-2xl border border-primary-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-extrabold tracking-widest border border-white/10" style={{ backgroundColor: getBrandDisplay(savedVehicle.make).bg, color: getBrandDisplay(savedVehicle.make).text }}>
                      {getBrandDisplay(savedVehicle.make).abbr}
                    </div>
                    <div>
                      <p className="text-white font-extrabold text-base">{savedVehicle.make} {savedVehicle.model}</p>
                      <p className="text-primary-200 text-xs">{savedVehicle.year} • {savedVehicle.fuelType} • {savedVehicle.transmission} {savedVehicle.color ? `• ${savedVehicle.color}` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-200 text-[10px] uppercase font-bold">Reg. No.</p>
                    <p className="text-white font-mono font-bold text-sm">{savedVehicle.plateNumber}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center gap-6 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Gauge size={13} className="text-accent-500" />
                    <span>{savedVehicle.kmReading ? parseInt(savedVehicle.kmReading).toLocaleString('en-IN') : '—'} km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Fuel size={13} className="text-accent-500" />
                    <span>{savedVehicle.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Settings size={13} className="text-accent-500" />
                    <span>{savedVehicle.transmission}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 size={13} />
                    <span>Saved</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
