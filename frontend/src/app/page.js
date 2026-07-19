'use client';

import React, { useEffect, useState } from 'react';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ServiceCard from 'src/components/ServiceCard';
import { getMockDb } from 'src/lib/mockDb';
import { ShieldCheck, CircleDollarSign, CalendarRange, ClipboardList, CheckSquare, ChevronRight, Activity, ArrowRight, Star } from 'lucide-react';
import LinkNext from 'next/link';

export default function HomePage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const db = getMockDb();
    setServices(db.services);
  }, []);

  const features = [
    {
      title: 'Transparent Pricing',
      description: 'No hidden fees or surprise markups. Get upfront price estimates before booking.',
      icon: CircleDollarSign,
      color: 'text-emerald-500 bg-emerald-50'
    },
    {
      title: 'Trusted Service',
      description: 'Our ASE-certified mechanics use state-of-the-art diagnostic tools and parts.',
      icon: ShieldCheck,
      color: 'text-primary-600 bg-primary-50'
    },
    {
      title: 'Easy Online Booking',
      description: 'Book your servicing slots online in seconds. Select date, time, and services easily.',
      icon: CalendarRange,
      color: 'text-indigo-500 bg-indigo-50'
    },
    {
      title: 'Vehicle Health Reports',
      description: 'Receive high-fidelity digital inspection reports directly on your dashboard.',
      icon: ClipboardList,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      title: 'Customer Repair Approval',
      description: 'Approve or reject recommended repairs item-by-item. Control what you pay for.',
      icon: CheckSquare,
      color: 'text-accent-500 bg-accent-50 font-semibold'
    }
  ];

  const steps = [
    { num: '01', title: 'Select Vehicle', desc: 'Specify make, model and mileage' },
    { num: '02', title: 'Choose Service', desc: 'Pick general or custom repairs' },
    { num: '03', title: 'Compare Packages', desc: 'Compare Silver, Gold & Platinum tiers' },
    { num: '04', title: 'Get Price Estimate', desc: 'Review itemized labor & part costs' },
    { num: '05', title: 'Book Slot', desc: 'Schedule a time convenient for you' },
    { num: '06', title: 'Track Service', desc: 'Get updates on vehicle progress' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 text-white overflow-hidden py-16 md:py-24 border-b border-primary-950">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Subtle accent light */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-accent-100 uppercase border border-white/15">
                <Activity size={14} className="text-accent-500 animate-pulse" />
                Next-Gen Automotive Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Transparent and Trusted <br />
                <span className="bg-gradient-to-r from-accent-500 to-orange-400 bg-clip-text text-transparent">
                  Vehicle Servicing
                </span>
              </h1>
              <p className="text-base md:text-lg text-primary-100 max-w-xl leading-relaxed">
                Take control of your car repairs. Schedule maintenance, receive real-time digital health inspections, and approve recommended repairs item-by-item.
              </p>
              
              {/* Call-to-actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <LinkNext
                  href="/vehicle-selection"
                  className="bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white px-8 py-3.5 rounded-xl font-bold transition-all text-center shadow-lg shadow-accent-500/25 hover:shadow-accent-500/35 border border-accent-600 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  Book a Service
                  <ArrowRight size={16} />
                </LinkNext>
                <LinkNext
                  href="/services"
                  className="bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white px-8 py-3.5 rounded-xl font-bold transition-all text-center border border-white/20 flex items-center justify-center gap-2 cursor-pointer text-sm hover:border-white/30"
                >
                  Explore Services
                </LinkNext>
              </div>

              {/* Quick reviews */}
              <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-1 text-accent-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs text-primary-200">
                  Trusted by over <strong className="text-white font-bold">12,000+ car owners</strong> nationwide.
                </span>
              </div>
            </div>

            {/* Hero Right Visual (SVG Interactive Automotive Graphics) */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="w-full max-w-md bg-slate-800/80 border border-slate-700/60 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">ENGINE_DIAGNOSTICS.SH</span>
                </div>
                
                {/* SVG Car Mockup */}
                <svg viewBox="0 0 400 200" className="w-full h-auto text-primary-500 fill-none stroke-current stroke-2 group-hover:scale-105 transition-transform duration-500">
                  {/* Garage hoist */}
                  <line x1="80" y1="170" x2="320" y2="170" stroke="#475569" strokeWidth="4" />
                  <line x1="120" y1="170" x2="120" y2="130" stroke="#475569" strokeWidth="4" />
                  <line x1="280" y1="170" x2="280" y2="130" stroke="#475569" strokeWidth="4" />
                  
                  {/* Car body */}
                  <path d="M 80,110 C 80,110 90,85 110,85 L 140,85 C 150,85 160,65 180,60 L 250,60 C 270,65 280,85 290,85 L 320,85 C 330,85 340,95 340,110 L 340,130 C 340,130 330,135 320,135 L 290,135 C 290,120 270,120 270,135 L 150,135 C 150,120 130,120 130,135 L 100,135 C 90,135 80,130 80,110 Z" stroke="#3b82f6" strokeWidth="3" />
                  {/* Car wheels */}
                  <circle cx="140" cy="135" r="15" stroke="#f97316" strokeWidth="3" />
                  <circle cx="280" cy="135" r="15" stroke="#f97316" strokeWidth="3" />
                  {/* Diagnostics scan rays */}
                  <path d="M 120,40 L 140,70" stroke="#f97316" strokeWidth="1" strokeDasharray="3,3" className="animate-pulse" />
                  <path d="M 200,30 L 200,60" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" />
                  <path d="M 280,40 L 270,70" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" className="animate-pulse" />
                  
                  {/* Sensor dots */}
                  <circle cx="140" cy="85" r="4" fill="#ef4444" className="animate-ping" />
                  <circle cx="210" cy="65" r="4" fill="#22c55e" />
                  <circle cx="280" cy="85" r="4" fill="#ef4444" className="animate-ping" />
                </svg>

                {/* Live Diagnostic Stats overlay */}
                <div className="mt-4 bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 font-mono text-[10px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>OBD-II DIAGNOSTICS:</span>
                    <span className="text-emerald-500 font-bold">CONNECTED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ENGINE EFFICIENCY:</span>
                    <span>94.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BRAKE PAD INTEGRITY:</span>
                    <span className="text-accent-500">32% [RECOMMEND PAD FLUSH]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary-600">Our Operations</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Popular Maintenance Services</h3>
            <p className="text-sm md:text-base text-slate-500">
              Select standard service checks designed to keep your vehicle performing at its peak reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="text-center mt-12">
            <LinkNext
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors group cursor-pointer"
            >
              Browse all repair services
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </LinkNext>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Features Info */}
            <div className="lg:col-span-5 space-y-5">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary-600">Why Choose Us</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                A Transparent Servicing Standard You Can Trust
              </h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                We believe transparency is key to great mechanical repairs. That is why we let you inspect reports and authorize individual costs before any wrench is turned.
              </p>
              
              <div className="pt-4">
                <LinkNext
                  href="/booking"
                  className="bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md shadow-primary-600/10 transition-all cursor-pointer"
                >
                  Schedule Your Inspection
                </LinkNext>
              </div>
            </div>

            {/* Features List */}
            <div className="lg:col-span-7 space-y-4">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">{feat.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-primary-600">Process Flow</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">How It Works</h3>
            <p className="text-sm md:text-base text-slate-500">
              We have streamlined vehicle care from booking to completion in six clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={step.num} className="bg-slate-50 rounded-2xl p-5 border border-slate-100/80 text-center relative group hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300">
                <span className="text-3xl font-black text-slate-200 group-hover:text-accent-500/25 transition-colors absolute top-3 right-4">{step.num}</span>
                <div className="text-xs font-extrabold text-primary-600 mb-6 uppercase tracking-wider">Step</div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <LinkNext
              href="/booking"
              className="bg-accent-500 hover:bg-accent-600 active:scale-[0.98] text-white px-8 py-3.5 rounded-xl font-bold transition-all text-center shadow-lg shadow-accent-500/20 hover:shadow-accent-500/35 border border-accent-600 flex items-center justify-center gap-2 cursor-pointer text-sm max-w-xs mx-auto"
            >
              Start Booking Now
              <ArrowRight size={16} />
            </LinkNext>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
