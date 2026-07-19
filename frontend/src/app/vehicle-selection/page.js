'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { Car, ChevronRight, AlertCircle } from 'lucide-react';

export default function VehicleSelectionPage() {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [plateNumber, setPlateNumber] = useState('');
  const [error, setError] = useState('');

  // Load existing selection if any
  useEffect(() => {
    const saved = localStorage.getItem('booking_flow_vehicle');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMake(parsed.make || '');
        setModel(parsed.model || '');
        setYear(parsed.year || '2022');
        setPlateNumber(parsed.plateNumber || '');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!make || !model || !plateNumber) {
      setError('Please fill in all the vehicle details.');
      return;
    }
    setError('');
    
    const vehicleData = { make, model, year, plateNumber };
    localStorage.setItem('booking_flow_vehicle', JSON.stringify(vehicleData));
    
    // Redirect to choose services
    router.push('/services');
  };

  const popularCars = [
    { make: 'Tesla', model: 'Model 3', year: '2023' },
    { make: 'Toyota', model: 'RAV4', year: '2021' },
    { make: 'Ford', model: 'F-150', year: '2020' },
    { make: 'BMW', model: 'X5', year: '2022' }
  ];

  const selectPopular = (car) => {
    setMake(car.make);
    setModel(car.model);
    setYear(car.year);
    setPlateNumber(`CA-${Math.floor(100 + Math.random() * 900)}-XX`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="text-primary-600 border-b-2 border-primary-600 pb-1">1. Vehicle Selection</span>
            <span className="text-slate-300">2. Services</span>
            <span className="text-slate-300">3. Packages</span>
            <span className="text-slate-300">4. Estimate & Book</span>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                <Car size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800">Identify Your Vehicle</h1>
                <p className="text-sm text-slate-400">Tell us what you drive to customize your parts & service options.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick selectors */}
            <div className="mb-8">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Popular Vehicles</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {popularCars.map((car, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPopular(car)}
                    className="p-3 bg-slate-50 hover:bg-primary-50 border border-slate-100 hover:border-primary-200 rounded-xl text-left transition-all duration-200 cursor-pointer group"
                  >
                    <p className="text-xs font-semibold text-slate-400 group-hover:text-primary-600 uppercase">{car.make}</p>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-primary-800">{car.model}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Vehicle Make</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                    placeholder="e.g. Tesla, Honda, BMW"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Vehicle Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                    placeholder="e.g. Model Y, Civic, X5"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Model Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  >
                    {Array.from({ length: 15 }, (_, i) => 2026 - i).map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">License Plate Number</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-mono uppercase"
                    placeholder="e.g. CA-888-XX"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
                >
                  Continue to Services
                  <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
