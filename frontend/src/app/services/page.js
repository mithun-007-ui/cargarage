'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ServiceCard from 'src/components/ServiceCard';
import { getMockDb } from 'src/lib/mockDb';
import { ChevronLeft, ChevronRight, AlertCircle, Wrench } from 'lucide-react';

export default function ChooseServicePage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const db = getMockDb();
    setServices(db.services);

    // Retrieve selected vehicle from step 1
    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    if (storedVehicle) {
      try {
        setVehicle(JSON.parse(storedVehicle));
      } catch (e) {
        console.error(e);
      }
    }

    // Retrieve previous selected service if any
    const storedService = localStorage.getItem('booking_flow_service');
    if (storedService) {
      try {
        const parsedService = JSON.parse(storedService);
        setSelectedService(db.services.find(s => s.id === parsedService.id) || null);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setError('');
  };

  const handleContinue = () => {
    if (!selectedService) {
      setError('Please select a service before continuing.');
      return;
    }
    
    localStorage.setItem('booking_flow_service', JSON.stringify(selectedService));
    router.push('/packages');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider max-w-3xl mx-auto">
            <span className="text-emerald-600 font-medium">✓ 1. Vehicle Selection</span>
            <span className="text-primary-600 border-b-2 border-primary-600 pb-1">2. Choose Service</span>
            <span className="text-slate-300">3. Packages</span>
            <span className="text-slate-300">4. Estimate & Book</span>
          </div>

          {/* Selected Vehicle Info Banner */}
          {vehicle && (
            <div className="max-w-3xl mx-auto mb-6 bg-slate-100 border border-slate-200/50 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-slate-600">
              <span>Selected Vehicle: <strong>{vehicle.make} {vehicle.model} ({vehicle.year})</strong></span>
              <button 
                onClick={() => router.push('/vehicle-selection')}
                className="text-primary-600 hover:underline font-bold cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          <div className="text-center mb-10 max-w-xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Select Primary Service</h1>
            <p className="text-sm text-slate-400 mt-2">Pick the core maintenance check or repair your vehicle needs today.</p>
          </div>

          {error && (
            <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedService?.id === service.id}
                onSelect={handleSelectService}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="border-t border-slate-200 pt-6 flex justify-between max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/vehicle-selection')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            
            <button
              onClick={handleContinue}
              className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-1.5 shadow-md shadow-primary-600/10 cursor-pointer"
            >
              Continue to Packages
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
