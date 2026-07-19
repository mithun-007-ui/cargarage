'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ProgressBar from 'src/components/ProgressBar';
import VehicleBanner from 'src/components/VehicleBanner';
import BillSummary from 'src/components/BillSummary';
import { getMockDb } from 'src/lib/mockDb';
import {
  ChevronLeft, ChevronRight, AlertCircle, Car,
  Wrench, Droplet, Wind, ShieldAlert, BatteryCharging,
  Circle, SquareCheck, Square, Cpu, Sparkles, Star,
  ArrowUpDown, Thermometer, Fan, Zap, Disc
} from 'lucide-react';

const ICON_MAP = {
  Wrench, Droplet, Wind, ShieldAlert, BatteryCharging,
  Circle, Cpu, Sparkles, Star, ArrowUpDown, Thermometer,
  Fan, Zap, Disc,
  Sofa: Wrench, // fallback for Sofa
};

const SERVICE_COLORS = [
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-orange-50 text-orange-600 border-orange-100',
  'bg-red-50 text-red-600 border-red-100',
  'bg-cyan-50 text-cyan-600 border-cyan-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
  'bg-teal-50 text-teal-600 border-teal-100',
  'bg-rose-50 text-rose-600 border-rose-100',
  'bg-sky-50 text-sky-600 border-sky-100',
  'bg-lime-50 text-lime-600 border-lime-100',
  'bg-violet-50 text-violet-600 border-violet-100',
  'bg-pink-50 text-pink-600 border-pink-100',
  'bg-yellow-50 text-yellow-600 border-yellow-100',
];

export default function ChooseServicePage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const db = getMockDb();
    setServices(db.services);

    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    if (storedVehicle) {
      try { setVehicle(JSON.parse(storedVehicle)); } catch (e) { console.error(e); }
    }

    const storedServices = localStorage.getItem('booking_flow_services');
    if (storedServices) {
      try { setSelectedServices(JSON.parse(storedServices)); } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  const handleToggleService = (service) => {
    setError('');
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      return exists
        ? prev.filter(s => s.id !== service.id)
        : [...prev, { id: service.id, name: service.name, price: service.price, duration: service.duration }];
    });
  };

  const isSelected = (service) => selectedServices.some(s => s.id === service.id);

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service before continuing.');
      return;
    }
    localStorage.setItem('booking_flow_services', JSON.stringify(selectedServices));
    localStorage.setItem('booking_flow_service', JSON.stringify(selectedServices[0]));
    router.push('/packages');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-6">
        <div className="max-w-6xl mx-auto px-4">
          <ProgressBar currentStep={2} />

          {/* Vehicle Banner or Prompt */}
          {!isLoaded ? (
            <div className="mb-5 flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !vehicle ? (
            <div className="mb-5 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">No Vehicle Selected</h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Please select your vehicle details before proceeding with services so we can provide accurate pricing and packages.</p>
              <button
                onClick={() => router.push('/vehicle-selection')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                Select Your Vehicle <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="mb-5">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          {/* Services Content - Only show if vehicle is selected */}
          {isLoaded && vehicle && (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Services Grid */}
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Select Services</h1>
                      <p className="text-xs text-slate-400 mt-0.5">Choose one or more. Price updates instantly.</p>
                    </div>
                    {selectedServices.length > 0 && (
                      <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full border border-primary-200">
                        {selectedServices.length} selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((service, idx) => {
                      const selected = isSelected(service);
                      const IconComp = ICON_MAP[service.icon] || Wrench;
                      const colorClass = SERVICE_COLORS[idx % SERVICE_COLORS.length];
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleToggleService(service)}
                          className={`w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer group relative ${
                            selected
                              ? 'border-primary-500 bg-primary-50/30 shadow-md shadow-primary-500/10'
                              : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-sm'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className="absolute top-3 right-3">
                            {selected
                              ? <SquareCheck size={18} className="text-primary-600" />
                              : <Square size={18} className="text-slate-300 group-hover:text-slate-400" />}
                          </div>

                          <div className="flex items-start gap-3 pr-7">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                              <IconComp size={17} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-sm mb-0.5 ${selected ? 'text-primary-800' : 'text-slate-800'}`}>
                                {service.name}
                              </h3>
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{service.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`text-sm font-extrabold ${selected ? 'text-primary-700' : 'text-slate-700'}`}>
                                  ₹{service.price.toLocaleString('en-IN')}
                                </span>
                                {service.duration && (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium">
                                    ~{service.duration} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bill Summary Sidebar */}
                <div className="lg:col-span-1">
                  <BillSummary
                    vehicle={vehicle}
                    selectedServices={selectedServices}
                    selectedPackage={null}
                  />
                </div>
              </div>

              {/* Nav Buttons */}
              <div className="border-t border-slate-200 pt-5 mt-6 flex justify-between">
                <button
                  onClick={() => router.push('/vehicle-selection')}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
                >
                  <ChevronLeft size={15} /> Back
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
                >
                  Continue to Packages <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
