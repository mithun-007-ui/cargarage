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
  ChevronLeft, ChevronRight, AlertCircle, Wrench, Search,
  Check, Clock, Droplet, Wind, ShieldAlert, BatteryCharging,
  Circle, Cpu, Sparkles, Star, ArrowUpDown, Thermometer, Fan, Zap, Disc,
  ArrowRight, SquareCheck, Square
} from 'lucide-react';

const ICON_MAP = {
  Wrench, Droplet, Wind, ShieldAlert, BatteryCharging,
  Circle, Cpu, Sparkles, Star, ArrowUpDown, Thermometer,
  Fan, Zap, Disc, Sofa: Wrench
};

// Category accent colour sets — each category gets a unique visual identity
const CATEGORY_COLORS = {
  engine:     { icon: 'icon-amber',   tag: 'badge-yellow', dot: 'bg-amber-400',   ring: 'border-amber-200',  headerBg: '' },
  brakes:     { icon: 'icon-rose',    tag: 'badge-orange', dot: 'bg-rose-400',    ring: 'border-rose-200',   headerBg: '' },
  ac:         { icon: 'icon-cyan',    tag: 'badge-blue',   dot: 'bg-cyan-400',    ring: 'border-cyan-200',   headerBg: '' },
  electrical: { icon: 'icon-violet',  tag: 'badge-blue',   dot: 'bg-violet-400',  ring: 'border-violet-200', headerBg: '' },
  detailing:  { icon: 'icon-emerald', tag: 'badge-green',  dot: 'bg-emerald-400', ring: 'border-emerald-200',headerBg: '' },
};

const CATEGORIES = [
  { id: 'all',       label: 'All Services',       icon: '🔧' },
  { id: 'engine',    label: 'Engine & Fluids',    icon: '🛢️' },
  { id: 'brakes',    label: 'Brakes & Suspension',icon: '🛞' },
  { id: 'ac',        label: 'AC & Cooling',       icon: '❄️' },
  { id: 'electrical',label: 'Electricals',        icon: '⚡' },
  { id: 'detailing', label: 'Cleaning & Detailing',icon: '✨' },
];

const getServiceCategory = (id) => {
  if (['oil-change', 'engine-diagnosis', 'spark-plug-replacement', 'air-filter-replacement', 'general-maintenance'].includes(id)) return 'engine';
  if (['brake-service', 'wheel-alignment', 'tyre-replacement', 'suspension-check'].includes(id)) return 'brakes';
  if (['ac-service', 'coolant-replacement'].includes(id)) return 'ac';
  if (['battery-replacement'].includes(id)) return 'electrical';
  if (['car-wash', 'interior-cleaning', 'exterior-polishing'].includes(id)) return 'detailing';
  return 'engine';
};

// Rich "what we do" data — step-by-step process per service
const SERVICE_PROCESS = {
  'general-maintenance': {
    steps: ['50-point vehicle health inspection', 'Engine bay fluid check & top-up', 'Brake, tyre & suspension visual audit', 'Battery voltage test & terminal clean', 'Wiper, light & horn functional test'],
    duration: '~2 hrs',
    warranty: '3 months',
    savings: 'Save ₹400 vs individual',
  },
  'oil-change': {
    steps: ['Drain old engine oil completely', 'Replace with fully synthetic Mobil1 / Castrol (up to 4L)', 'Fit new OES oil filter', 'Top-up engine oil to correct level', 'Dispose of waste oil responsibly'],
    duration: '~45 min',
    warranty: '6 months',
    savings: null,
  },
  'brake-service': {
    steps: ['Remove all four wheels for full access', 'Inspect front & rear brake pad thickness', 'Measure disc/rotor runout & thickness', 'Grease caliper slider pins', 'Top-up brake fluid to correct level'],
    duration: '~90 min',
    warranty: '6 months',
    savings: null,
  },
  'ac-service': {
    steps: ['Pressure-test AC system for leaks', 'Evacuate residual refrigerant safely', 'Recharge with eco-friendly refrigerant (correct spec)', 'Clean cabin air filter & evaporator coil', 'Test cabin cooling temperature output'],
    duration: '~60 min',
    warranty: '3 months',
    savings: null,
  },
  'battery-replacement': {
    steps: ['Load-test existing battery capacity', 'Select correct Amaron / Exide spec for vehicle', 'Safely disconnect old battery & dispose', 'Install new battery with terminal guard', 'Test alternator charging voltage'],
    duration: '~45 min',
    warranty: '12 months (mfg)',
    savings: null,
  },
  'wheel-alignment': {
    steps: ['Lift vehicle and mount on 3D alignment rack', 'Measure all four-wheel camber, caster & toe', 'Adjust steering geometry to OEM spec', 'Balance all four wheels (counterweights added)', 'Road-test and re-check steering pull'],
    duration: '~60 min',
    warranty: '3 months',
    savings: null,
  },
  'tyre-replacement': {
    steps: ['Recommend correct tyre size & load rating', 'Remove old tyre from rim using tyre machine', 'Mount new premium tyre & inflate to spec', 'Dynamic wheel balancing (counterweights)', 'Re-fit wheel with correct torque settings'],
    duration: '~90 min',
    warranty: 'As per brand',
    savings: null,
  },
  'engine-diagnosis': {
    steps: ['Connect OBD-II scanner to diagnostic port', 'Read all fault & pending DTC codes', 'Live data stream of RPM, temp, O2 sensors', 'Generate itemized fault report', 'Advise corrective repair actions with costs'],
    duration: '~60 min',
    warranty: 'Report valid 30 days',
    savings: null,
  },
  'car-wash': {
    steps: ['Pre-rinse to remove loose dirt & dust', 'High-foam shampoo applied to all surfaces', 'Pressure wash with soft mitt (no scratches)', 'Wheel & tyre cleaning with dedicated brush', 'Final rinse, dry & tyre shine application'],
    duration: '~30 min',
    warranty: null,
    savings: null,
  },
  'interior-cleaning': {
    steps: ['Deep vacuum of seats, carpet & boot', 'Dashboard & trim wipe-down with UV protectant', 'Leather/fabric seat spot cleaning', 'Door sill & footwell shampooing', 'Premium long-lasting fragrance treatment'],
    duration: '~60 min',
    warranty: null,
    savings: null,
  },
  'exterior-polishing': {
    steps: ['Clay bar decontamination of paint surface', 'Machine compound cut to remove swirl marks', 'Machine polish for gloss restoration', 'Liquid carnauba wax or sealant applied', 'Final buff & inspection under LED light'],
    duration: '~90 min',
    warranty: '3 months',
    savings: 'Shine lasts 90 days',
  },
  'suspension-check': {
    steps: ['Visual inspection of all shock absorbers', 'Check coil springs for cracks or sag', 'Inspect ball joints & tie-rod ends for play', 'Test steering rack for excessive movement', 'Report and quote on any required replacements'],
    duration: '~45 min',
    warranty: 'Report valid 30 days',
    savings: null,
  },
  'coolant-replacement': {
    steps: ['Drain old coolant from radiator & reservoir', 'Flush system with distilled water rinse', 'Refill with OEM-spec antifreeze mix (50:50)', 'Bleed air from cooling circuit', 'Test thermostat operation under temperature'],
    duration: '~40 min',
    warranty: '6 months',
    savings: null,
  },
  'air-filter-replacement': {
    steps: ['Remove & inspect engine air filter element', 'Inspect air intake box & duct for blockages', 'Fit new OEM or K&N performance filter', 'Check & replace cabin air filter if needed', 'Test airflow post-replacement'],
    duration: '~20 min',
    warranty: '6 months',
    savings: null,
  },
  'spark-plug-replacement': {
    steps: ['Remove ignition coils & plug access cover', 'Extract old plugs & measure electrode gap', 'Inspect for oil fouling or carbon build-up', 'Fit correct-spec NGK / Denso plugs to torque spec', 'Test cold-start and idle smoothness'],
    duration: '~30 min',
    warranty: '6 months',
    savings: null,
  },
};

const DEFAULT_PROCESS = {
  steps: ['Full diagnostic inspection', 'Genuine OEM parts fitted', 'Technician multi-point check', 'Post-service road test', '6-month service warranty'],
  duration: '~60 min',
  warranty: '6 months',
  savings: null,
};

export default function ChooseServicePage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const db = getMockDb();
    const storedVehicle = localStorage.getItem('booking_flow_vehicle');
    const storedServices = localStorage.getItem('booking_flow_services');
    setTimeout(() => {
      setServices(db.services);
      if (storedVehicle) { try { setVehicle(JSON.parse(storedVehicle)); } catch (e) { console.error(e); } }
      if (storedServices) { try { setSelectedServices(JSON.parse(storedServices)); } catch (e) { console.error(e); } }
      setIsLoaded(true);
    }, 0);
  }, []);

  const handleToggleService = (service) => {
    setError('');
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      const next = exists
        ? prev.filter(s => s.id !== service.id)
        : [...prev, { id: service.id, name: service.name, price: service.price, duration: service.duration }];
      localStorage.setItem('booking_flow_services', JSON.stringify(next));
      if (next.length > 0) localStorage.setItem('booking_flow_service', JSON.stringify(next[0]));
      else localStorage.removeItem('booking_flow_service');
      return next;
    });
  };

  const isSelected = (service) => selectedServices.some(s => s.id === service.id);

  const handleContinue = () => {
    if (selectedServices.length === 0) { setError('Please select at least one service before continuing.'); return; }
    if (!vehicle) router.push('/vehicle-selection');
    else router.push('/packages');
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const serviceCategory = getServiceCategory(service.id);
    const matchesCategory = selectedCategory === 'all' || serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      <main className="flex-grow py-6 md:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

          {vehicle && <ProgressBar currentStep={2} />}

          {/* ── Page Header ── */}
          <div className="mb-8 mt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="section-label">Step 2 of 4 · Service Selection</span>
                <h1 className="text-2xl md:text-3xl font-black mt-1 tracking-tight flex items-center gap-2.5" style={{ color: '#202020' }}>
                  <div className="w-9 h-9 rounded-xl icon-orange flex items-center justify-center shrink-0">
                    <Wrench size={18} />
                  </div>
                  {vehicle ? `Services for ${vehicle.make} ${vehicle.model}` : 'Service Directory'}
                </h1>
                <p className="text-sm mt-1.5 max-w-lg" style={{ color: '#667085' }}>
                  {vehicle
                    ? 'Select one or more repair services. Prices shown are base estimates — final cost approved after inspection.'
                    : 'Browse transparent pricing, step-by-step service breakdowns, and certified inclusions.'}
                </p>
              </div>
              {selectedServices.length > 0 && (
                <div className="badge badge-orange shrink-0 text-sm font-bold px-4 py-2">
                  🛠 {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </div>

          {vehicle && (
            <div className="mb-6">
              <VehicleBanner vehicle={vehicle} compact />
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl p-4 flex items-center gap-2.5 text-sm animate-shake" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <AlertCircle size={16} className="shrink-0" style={{ color: '#DC2626' }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Search & Category Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search services…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full input-field"
                style={{ paddingLeft: '2.75rem', background: '#FFFFFF', border: '1px solid #E2D8CE' }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border cursor-pointer min-h-[40px]"
                  style={selectedCategory === cat.id
                    ? { background: '#E65313', borderColor: '#E65313', color: '#FFFFFF' }
                    : { background: '#FFFFFF', borderColor: '#E2D8CE', color: '#667085' }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Services Grid ── */}
            <div className="lg:col-span-8 space-y-4">
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredServices.map((service, idx) => {
                    const selected = isSelected(service);
                    const IconComp = ICON_MAP[service.icon] || Wrench;
                    const category = getServiceCategory(service.id);
                    const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.engine;
                    const process = SERVICE_PROCESS[service.id] || DEFAULT_PROCESS;
                    const isExpanded = expandedCard === service.id;

                    return (
                      <div
                        key={service.id}
                        className="rounded-2xl border-2 transition-all duration-200 flex flex-col group relative overflow-hidden"
                        style={selected
                          ? { borderColor: '#E65313', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(230,83,19,0.10)' }
                          : { background: '#FFFFFF', borderColor: '#E2D8CE' }}
                      >
                        {/* Card colour accent header strip */}
                        <div className={`h-1 w-full bg-gradient-to-r ${
                          category === 'engine'     ? 'from-amber-500 to-orange-400' :
                          category === 'brakes'     ? 'from-rose-500 to-red-400' :
                          category === 'ac'         ? 'from-cyan-500 to-blue-400' :
                          category === 'electrical' ? 'from-violet-500 to-purple-400' :
                          'from-emerald-500 to-teal-400'
                        } ${selected ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'} transition-opacity`} />

                        <div className="p-5 flex flex-col flex-1 cursor-pointer" onClick={() => handleToggleService(service)}>
                          {/* Header row */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                              <IconComp size={20} />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                              <h3 className="font-extrabold text-base leading-tight" style={{ color: '#202020' }}>
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                                <span className="text-lg font-black" style={{ color: '#E65313' }}>₹{service.price.toLocaleString('en-IN')}</span>
                                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#9CA3AF' }}>
                                  <Clock size={11} /> ~{service.duration} min
                                </span>
                                {process.warranty && (
                                  <span className={`${colors.tag} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                                    {process.warranty} warranty
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Checkbox */}
                            <div className="absolute top-4 right-4">
                              {selected
                                ? <SquareCheck style={{ color: '#E65313' }} size={22} />
                                : <Square style={{ color: '#E2D8CE' }} size={22} />
                              }
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm leading-relaxed mb-4" style={{ color: '#667085' }}>{service.description}</p>

                          {/* ── WHAT WE DO — Step-by-step process ── */}
                          <div className="pt-4 mt-auto" style={{ borderTop: '1px solid #E2D8CE' }}>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#9CA3AF' }}>
                              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                              What We Do — Service Process
                            </p>
                            <div className="space-y-2">
                              {(isExpanded ? process.steps : process.steps.slice(0, 3)).map((step, i) => (
                                <div key={i} className="step-bullet">
                                  <div className="step-bullet-icon">
                                    <Check size={9} style={{ color: '#16A34A' }} strokeWidth={3} />
                                  </div>
                                  <span style={{ color: '#374151' }}>{step}</span>
                                </div>
                              ))}
                              {process.steps.length > 3 && (
                                <button
                                  onClick={e => { e.stopPropagation(); setExpandedCard(isExpanded ? null : service.id); }}
                                  className="text-xs hover:text-primary-300 font-bold flex items-center gap-1 mt-1 cursor-pointer transition-colors"
                                  style={{ color: '#F28C45' }}
                                >
                                  {isExpanded
                                    ? '↑ Show less'
                                    : `+ ${process.steps.length - 3} more steps`
                                  }
                                </button>
                              )}
                            </div>

                            {/* Savings badge if applicable */}
                            {process.savings && (
                              <div className="mt-3 text-[11px] font-bold flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                                style={{ color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                <Star size={11} fill="currentColor" /> {process.savings}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selected CTA footer */}
                        {selected && (
                          <div className="px-5 py-3 flex items-center justify-between"
                            style={{ background: '#FFF3EE', borderTop: '1px solid #FFD9C8' }}>
                            <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#E65313' }}>
                              <Check size={12} strokeWidth={3} /> Added to your booking
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); handleToggleService(service); }}
                              className="text-xs transition-colors font-medium cursor-pointer hover:text-red-500"
                              style={{ color: '#9CA3AF' }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card p-16 text-center">
                  <AlertCircle size={32} className="mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                  <p className="font-bold text-base" style={{ color: '#202020' }}>No services match your search</p>
                  <p className="text-sm mt-1" style={{ color: '#667085' }}>Try resetting the search or select &quot;All Services&quot;.</p>
                </div>
              )}
            </div>

            {/* ── Bill Summary ── */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <BillSummary
                  vehicle={vehicle}
                  selectedServices={selectedServices}
                  selectedPackage={null}
                  isPublic={!vehicle}
                  onActionClick={handleContinue}
                />
              </div>
            </div>
          </div>

          {/* ── Bottom nav (booking flow only) ── */}
          {vehicle && (
            <div className="divider mt-8 pt-6 flex justify-between">
              <button
                onClick={() => router.push('/vehicle-selection')}
                className="btn-outline text-sm"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={handleContinue}
                className="btn-primary text-sm"
              >
                Continue to Packages <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
