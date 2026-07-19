'use client';

import React, { useEffect, useState } from 'react';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ServiceCard from 'src/components/ServiceCard';
import { getMockDb, getReviews, addEmergencyRequest } from 'src/lib/mockDb';
import {
  ShieldCheck, CircleDollarSign, CalendarRange, ClipboardList, CheckSquare,
  ChevronRight, Activity, ArrowRight, Star, Phone, MessageCircle, Search,
  Wrench, ShieldAlert, Sparkles, Check, CheckCircle2, UserCheck, Flame,
  BadgeCheck, Clock, Award, Zap
} from 'lucide-react';
import LinkNext from 'next/link';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeBeforeAfter, setActiveBeforeAfter] = useState('paint');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [emergencyForm, setEmergencyForm] = useState({ name: '', phone: '', issue: '', location: '' });
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    const db = getMockDb();
    setServices(db.services.slice(0, 6));
    setReviews(getReviews().slice(0, 3));
  }, []);

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergencyForm.name || !emergencyForm.phone || !emergencyForm.location) return;
    setEmergencyLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    addEmergencyRequest(emergencyForm);
    setEmergencySubmitted(true);
    setEmergencyLoading(false);
    setEmergencyForm({ name: '', phone: '', issue: '', location: '' });
    setTimeout(() => setEmergencySubmitted(false), 5000);
  };

  const mechanics = [
    { name: 'David Miller', role: 'Master Diagnostic Technician', certs: 'ASE Certified Master', exp: '12 Yrs', initials: 'DM', color: 'from-blue-600 to-blue-800' },
    { name: 'Marcus Vance', role: 'Engine Rebuild Specialist', certs: 'ASE Engine Specialist', exp: '10 Yrs', initials: 'MV', color: 'from-violet-600 to-violet-800' },
    { name: 'Sarah Connor', role: 'Electrical & AC Specialist', certs: 'Advanced Diagnostics', exp: '8 Yrs', initials: 'SC', color: 'from-emerald-600 to-emerald-800' }
  ];

  const offers = [
    { code: 'SLAY10', title: 'Monsoon Care Package', desc: 'Get 10% flat off on any Gold Care or Platinum package bookings.', validity: 'Valid till 31st July', color: 'from-blue-900/40 to-primary-900/20', badge: 'bg-primary-600' },
    { code: 'WELCOME15', title: 'New Vehicle Welcome Discount', desc: 'Flat 15% discount on labor fees for your first registered vehicle.', validity: 'First Booking Only', color: 'from-amber-900/30 to-orange-900/20', badge: 'bg-accent-500' }
  ];

  const faqs = [
    { q: 'How does the digital health report approval work?', a: 'Once our technicians inspect your car, they generate an itemized digital health report showing part cost, labor cost, and priority. You can approve or reject each repair separately — we only charge for what you authorize.' },
    { q: 'Are your parts genuine?', a: 'Yes. Bug Slayers only uses OEM or premium OES equivalent parts that come with official warranties.' },
    { q: 'Is there a pickup and drop-off facility?', a: 'Absolutely. During booking, you can select "Pickup & Delivery" (₹499 valet fee) and specify your address. Our driver picks up your car and returns it once completed.' },
    { q: 'How can I reschedule or cancel my booking?', a: 'You can manage all bookings from your dashboard under "My Bookings". Rescheduling and cancellation are free up to 4 hours before the service slot.' },
    { q: 'Do you offer roadside assistance?', a: 'Yes, we provide 24/7 towing and roadside emergency help. Use our Emergency Breakdown Form below or call us directly for instant support.' }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const features = [
    { title: 'Transparent Pricing', description: 'No hidden fees or markups. Itemized estimates before any work starts.', icon: CircleDollarSign, accent: 'icon-emerald' },
    { title: 'ASE Certified Mechanics', description: 'Trained, certified technicians using genuine OEM or OES-equivalent parts.', icon: ShieldCheck, accent: 'icon-blue' },
    { title: 'Easy Online Booking', description: 'Select date, time, and services from your phone in under 2 minutes.', icon: CalendarRange, accent: 'icon-violet' },
    { title: 'Digital Health Reports', description: 'Receive detailed inspection reports with photos & component status.', icon: ClipboardList, accent: 'icon-amber' },
    { title: 'Item-by-Item Approval', description: 'You control every rupee. Approve or reject each recommended repair.', icon: CheckSquare, accent: 'icon-rose' },
  ];

  const steps = [
    { num: '01', title: 'Select Vehicle', desc: 'Enter make, model and mileage', icon: '🚗' },
    { num: '02', title: 'Choose Services', desc: 'Pick repairs with transparent pricing', icon: '🔧' },
    { num: '03', title: 'Pick a Package', desc: 'Compare Silver, Gold & Platinum', icon: '📦' },
    { num: '04', title: 'Get Estimate', desc: 'Review itemized costs instantly', icon: '📋' },
    { num: '05', title: 'Book Your Slot', desc: 'Schedule a convenient time', icon: '📅' },
    { num: '06', title: 'Track Progress', desc: 'Live status updates from the garage', icon: '📍' }
  ];

  const beforeAfterData = {
    paint: {
      beforeLabel: 'Dull, scratched paint with swirl marks and UV damage',
      afterLabel: 'Mirror-finish ceramic coat — protected for 90 days',
      detail: '9H Ceramic Shield Protection',
      stat: '60% better UV resistance',
      beforeIcon: '😔', afterIcon: '✨',
    },
    engine: {
      beforeLabel: 'Carbon build-up, oil sludge, grimy engine bay',
      afterLabel: 'Steam-cleaned, degreased, and decarbonized engine',
      detail: 'Full engine decarb + steam clean',
      stat: '15% improved fuel efficiency',
      beforeIcon: '💨', afterIcon: '💚',
    },
    headlight: {
      beforeLabel: 'Oxidized, yellowed lenses cutting light output by 60%',
      afterLabel: 'Crystal clear with anti-UV sealant and 60% more output',
      detail: 'UV polish + anti-fog coating',
      stat: '60% more light on road',
      beforeIcon: '🌫️', afterIcon: '💡',
    },
  };
  const ba = beforeAfterData[activeBeforeAfter];

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1220]">
      <Navbar />

      {/* ════════════════════════════════════
          HERO — Deep dark with blue glow
      ════════════════════════════════════ */}
      <section
        className="relative min-h-[95vh] flex items-center text-white overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(0,82,255,0.18) 0%, #060912 60%)' }}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Large background glow orb */}
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)' }} />

        <div className="content-wrapper relative z-10 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 glass-blue px-4 py-2 rounded-full text-xs font-bold tracking-wider text-primary-300 uppercase">
                <Activity size={13} className="text-primary-400 animate-pulse" />
                Bug Slayers · Premium Car Care
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06]">
                Premium Repairs<br />
                <span className="text-gradient-blue">With Full Control</span>
              </h1>

              <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                Transparent estimates, digital inspection reports, and item-by-item repair approval — before a single bolt is turned.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <LinkNext href="/vehicle-selection" className="btn-primary text-base">
                  Book a Service <ArrowRight size={18} />
                </LinkNext>
                <LinkNext href="/services" className="btn-ghost text-base">
                  Explore Services <ChevronRight size={18} />
                </LinkNext>
              </div>

              <div className="flex items-center gap-5 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
                </div>
                <span className="text-sm text-slate-400">
                  <strong className="text-white">12,000+</strong> satisfied customers across India
                </span>
              </div>
            </div>

            {/* Right — Car + floating badges */}
            <div className="relative flex justify-center items-center">
              {/* Glow rings */}
              <div className="absolute w-80 h-80 rounded-full glow-pulse pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)' }} />

              <svg viewBox="0 0 560 280" className="w-full max-w-lg h-auto relative z-10 drop-shadow-[0_0_50px_rgba(0,82,255,0.25)]" fill="none">
                <rect x="20" y="240" width="520" height="5" rx="2.5" fill="#1e2d45" opacity="0.6"/>
                <path d="M 80,200 L 80,170 C 80,165 85,160 90,158 L 150,140 C 165,128 190,110 230,108 L 330,108 C 370,108 395,126 410,140 L 470,158 C 475,160 480,165 480,170 L 480,200 Z" fill="#111827" stroke="#0052ff" strokeWidth="2"/>
                <path d="M 175,140 C 185,118 210,102 245,100 L 315,100 C 350,100 375,116 385,140 Z" fill="#0d1a30" stroke="#1e2d45" strokeWidth="1.5"/>
                <path d="M 185,140 C 195,120 215,106 248,104 L 295,104 C 310,104 330,118 340,140 Z" fill="#0052ff" opacity="0.15" stroke="#0052ff" strokeWidth="1" strokeOpacity="0.5"/>
                <ellipse cx="96" cy="175" rx="12" ry="8" fill="#0052ff" opacity="0.9"/>
                <ellipse cx="96" cy="175" rx="8" ry="5" fill="#93c5fd" opacity="0.9"/>
                <path d="M 84,172 L 30,160 M 84,175 L 25,175 M 84,178 L 30,190" stroke="#0052ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
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
                <rect x="260" y="158" width="40" height="5" rx="2.5" fill="#1e2d45" stroke="#0052ff" strokeWidth="0.8" opacity="0.6"/>
              </svg>

              {/* Floating trust badges */}
              {[
                { pos: '-top-4 -left-4 lg:-left-8', icon: <CircleDollarSign size={16} className="text-emerald-400"/>, label: 'Transparent', sub: 'Pricing' },
                { pos: 'top-1/3 -right-4 lg:-right-8', icon: <BadgeCheck size={16} className="text-blue-400"/>, label: 'ASE Certified', sub: 'Service' },
                { pos: '-bottom-4 right-12', icon: <CalendarRange size={16} className="text-amber-400"/>, label: 'Easy Online', sub: 'Booking' },
              ].map((b, i) => (
                <div key={i} className={`absolute ${b.pos} card-dark px-4 py-2.5 shadow-xl flex items-center gap-2.5 animate-float hover:border-primary-600/40 transition-colors z-20`}
                  style={{ animationDelay: `${i * 0.8}s` }}>
                  {b.icon}
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{b.sub}</p>
                    <p className="text-xs font-bold text-white">{b.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          STATS BAR — Subtle gradient stripe
      ════════════════════════════════════ */}
      <section className="py-8 border-y border-[#1e2d45]" style={{ background: 'linear-gradient(90deg, #111827, #141f33, #111827)' }}>
        <div className="content-wrapper">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '12,000+', label: 'Cars Serviced', icon: '🚗' },
              { num: '98%', label: 'Satisfaction Rate', icon: '⭐' },
              { num: '4.9/5', label: 'Google Rating', icon: '🏆' },
              { num: '24/7', label: 'Emergency Support', icon: '📞' },
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <p className="text-2xl font-black text-white">{s.num}</p>
                <p className="text-xs text-slate-500 font-medium">{s.icon} {s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          SERVICES — Light mid-navy with coloured cards
      ════════════════════════════════════ */}
      <section className="py-20 section-mid">
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="section-label">Our Services Catalog</p>
            <h2 className="section-title mt-2">Popular Maintenance Services</h2>
            <p className="section-sub mt-3">Certified checkups designed to keep your vehicle performing at its peak.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
          <div className="text-center mt-12">
            <LinkNext href="/services" className="inline-flex items-center gap-2 text-base font-bold text-primary-400 hover:text-primary-300 transition-colors group cursor-pointer">
              Browse all repair services <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </LinkNext>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          OFFERS — Deep dark with orange accents
      ════════════════════════════════════ */}
      <section className="py-16 border-y border-[#1e2d45]" style={{ background: 'linear-gradient(135deg, #060912, #0f1a08, #060912)' }}>
        <div className="content-wrapper">
          <div className="text-center mb-12">
            <p className="section-label" style={{ color: '#fb923c' }}>Deals &amp; Promotions</p>
            <h2 className="section-title mt-2">Active Workshop Coupons</h2>
            <p className="section-sub mt-2">Apply at checkout to redeem exclusive discounts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {offers.map((offer, idx) => (
              <div key={idx} className={`rounded-2xl border border-[#1e2d45] p-6 flex flex-col justify-between relative overflow-hidden group bg-gradient-to-br ${offer.color} hover:border-accent-500/30 transition-all`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-extrabold text-lg text-white">{offer.title}</h3>
                    <span className={`${offer.badge} text-white font-mono text-sm font-black px-3 py-1.5 rounded-xl shrink-0`}>{offer.code}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{offer.desc}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">{offer.validity}</span>
                  <span className="text-accent-400 flex items-center gap-1 text-xs font-bold">Active Deal <Flame size={11} fill="currentColor" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          BEFORE & AFTER — Darker section with vibrant panels
      ════════════════════════════════════ */}
      <section className="py-20 section-darker">
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label">Premium Gallery</p>
            <h2 className="section-title mt-2">Before &amp; After Transformations</h2>
            <p className="section-sub mt-3">Real results from our most popular services.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: 'paint', label: '✨ Exterior Polish' },
                { id: 'engine', label: '🔧 Engine Clean' },
                { id: 'headlight', label: '💡 Headlight Restore' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveBeforeAfter(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
                    activeBeforeAfter === tab.id
                      ? 'bg-primary-600 text-white border border-primary-500 shadow-lg shadow-primary-600/25'
                      : 'bg-[#111827] text-slate-400 border border-[#1e2d45] hover:text-white hover:border-primary-600/30'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Before */}
              <div className="rounded-3xl overflow-hidden border-2 border-[#1e2d45] group">
                <div className="relative h-52 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                  <div className="absolute top-3 left-3 bg-black/60 border border-white/10 text-white text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase backdrop-blur-sm">Before</div>
                  <div className="text-center space-y-3 px-8">
                    <div className="text-5xl">{ba.beforeIcon}</div>
                    <p className="text-sm text-slate-400 leading-relaxed">{ba.beforeLabel}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-28 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-1/3 rounded-full" />
                      </div>
                      <span className="text-xs text-red-400 font-bold">Poor</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111827] border-t border-[#1e2d45] px-5 py-3">
                  <p className="text-xs text-slate-500">Condition before Bug Slayers service</p>
                </div>
              </div>

              {/* After */}
              <div className="rounded-3xl overflow-hidden border-2 border-primary-600/50 group shadow-xl shadow-primary-900/20">
                <div className="relative h-52 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d1220, #0e2048, #0a1530)' }}>
                  <div className="absolute inset-0 bg-primary-600/6 pointer-events-none" />
                  <div className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase">After Bug Slayers</div>
                  <div className="text-center space-y-3 px-8">
                    <div className="text-5xl">{ba.afterIcon}</div>
                    <p className="text-sm text-white font-medium leading-relaxed">{ba.afterLabel}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-28 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full rounded-full" />
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">Excellent</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111827] border-t border-primary-600/20 px-5 py-3 flex justify-between items-center">
                  <p className="text-xs text-primary-400 font-semibold">{ba.detail}</p>
                  <span className="text-xs text-emerald-400 font-bold">{ba.stat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHY CHOOSE US — Blue-tinted section
      ════════════════════════════════════ */}
      <section className="py-20 border-y border-[#1e2d45]" style={{ background: 'linear-gradient(135deg, #060f24 0%, #0d1220 50%, #060f24 100%)' }}>
        <div className="content-wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <p className="section-label">Our Standard</p>
              <h2 className="section-title">Trusted Service You Can Actually Verify</h2>
              <p className="section-sub">We never start a repair without your explicit approval. View every cost line, every part, every labor charge — and decide what gets fixed.</p>
              <LinkNext href="/vehicle-selection" className="btn-primary">
                Schedule Inspection <ArrowRight size={16} />
              </LinkNext>
            </div>
            <div className="lg:col-span-7 space-y-3">
              {features.map(feat => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="card-glow p-5 flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${feat.accent}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base mb-1">{feat.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS — Mid-dark with numbered cards
      ════════════════════════════════════ */}
      <section className="py-20 section-mid">
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="section-label">Simple Process</p>
            <h2 className="section-title mt-2">How It Works</h2>
            <p className="section-sub mt-3">From booking to doorstep delivery in six transparent steps.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((step, i) => (
              <div key={step.num} className="card-glow p-5 text-center relative group">
                <span className="text-4xl font-black text-[#1e2d45] group-hover:text-primary-600/20 transition-colors absolute top-3 right-3 text-2xl">{step.num}</span>
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          MECHANICS — Dark with gradient avatars
      ════════════════════════════════════ */}
      <section className="py-20 border-y border-[#1e2d45]" style={{ background: 'linear-gradient(135deg, #0a0f1c, #111827)' }}>
        <div className="content-wrapper">
          <div className="text-center mb-14">
            <p className="section-label">Our Team</p>
            <h2 className="section-title mt-2">Meet Our ASE-Certified Mechanics</h2>
            <p className="section-sub mt-3">Professionals operating with precision tools and genuine parts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {mechanics.map((m, i) => (
              <div key={i} className="card-glow p-7 text-center space-y-4">
                <div className={`w-18 h-18 w-16 h-16 bg-gradient-to-br ${m.color} rounded-full flex items-center justify-center font-black text-xl text-white mx-auto shadow-lg`}>
                  {m.initials}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{m.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{m.role}</p>
                </div>
                <div className="bg-[#060912] rounded-2xl p-3 border border-[#1e2d45] flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400"><UserCheck size={12} className="text-primary-400" /> {m.exp} Exp</span>
                  <span className="badge-green text-[10px]">{m.certs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          REVIEWS — Warm dark section (slightly different tone)
      ════════════════════════════════════ */}
      <section className="py-20 section-darker">
        <div className="content-wrapper">
          <div className="text-center mb-14">
            <p className="section-label">Customer Stories</p>
            <h2 className="section-title mt-2">What Our Customers Say</h2>
            <p className="section-sub mt-3">Verified reviews submitted post-service by real car owners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.length > 0 ? reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="card-glow p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="mt-5 pt-4 border-t border-[#1e2d45] flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white">{rev.customerName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rev.vehicle}</p>
                  </div>
                  <span className="badge-green flex items-center gap-1"><Check size={9} strokeWidth={3} /> Verified</span>
                </div>
              </div>
            )) : [1, 2, 3].map(i => (
              <div key={i} className="card-dark p-6 space-y-3 animate-pulse">
                <div className="h-3 bg-[#1e2d45] rounded w-1/2" />
                <div className="h-16 bg-[#1e2d45] rounded" />
                <div className="h-3 bg-[#1e2d45] rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FAQ — Blue-tinted glow section
      ════════════════════════════════════ */}
      <section className="py-20 border-y border-[#1e2d45] section-glow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="section-label">Common Questions</p>
            <h2 className="section-title mt-2">Frequently Asked</h2>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Search FAQs…" value={faqSearch} onChange={e => setFaqSearch(e.target.value)}
              className="input-dark pl-11 pr-4 py-4" />
          </div>
          <div className="card-dark overflow-hidden divide-y divide-[#1e2d45]">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
              <div key={idx}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 text-base font-bold text-slate-200 hover:bg-white/2 flex justify-between items-center transition-colors cursor-pointer min-h-[56px] gap-4">
                  <span className="leading-snug">{faq.q}</span>
                  <span className="text-xl font-bold text-slate-500 shrink-0">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed animate-in">{faq.a}</div>
                )}
              </div>
            )) : (
              <div className="p-10 text-center text-sm text-slate-500 italic">No matching FAQs. Clear your search.</div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          EMERGENCY — Red-tinted dark section
      ════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #0d1220 40%, #060912 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(239,68,68,0.08) 0%, transparent 60%)' }} />
        <div className="content-wrapper relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
              <div className="w-14 h-14 bg-red-600/20 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto lg:mx-0">
                <ShieldAlert size={26} className="text-red-400 animate-pulse" />
              </div>
              <h2 className="section-title">24/7 Roadside Assistance</h2>
              <p className="section-sub">Car broke down or won&apos;t start? Submit your location and we&apos;ll dispatch a mechanic immediately.</p>
              <a href="tel:+919626757303" className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white px-7 py-4 rounded-xl font-extrabold text-sm shadow-lg shadow-red-900/30 transition-all border border-red-500 min-h-[48px] cursor-pointer">
                <Phone size={16} fill="currentColor" /> Call Dispatch: +91 9626757303
              </a>
            </div>
            <div className="lg:col-span-7">
              <div className="card-dark p-7 shadow-2xl border border-[#2a1515]">
                <h3 className="font-extrabold text-lg text-white mb-1">Submit Breakdown Request</h3>
                <p className="text-sm text-slate-500 mb-6">A nearby mechanic will be dispatched immediately.</p>
                {emergencySubmitted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-3 animate-in">
                    <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                    <p className="text-base font-bold text-emerald-400">Request Submitted!</p>
                    <p className="text-sm text-slate-400">Our dispatch team will call you on the number provided shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEmergencySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Your Name *</label>
                        <input type="text" required value={emergencyForm.name} onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })} className="input-dark" placeholder="e.g. Rahul Sharma" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Phone *</label>
                        <input type="tel" required value={emergencyForm.phone} onChange={e => setEmergencyForm({ ...emergencyForm, phone: e.target.value })} className="input-dark" placeholder="e.g. 96267 57303" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Your Current Location *</label>
                      <input type="text" required value={emergencyForm.location} onChange={e => setEmergencyForm({ ...emergencyForm, location: e.target.value })} className="input-dark" placeholder="e.g. Near Hopes College, Peelamedu" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5 tracking-wider">Describe Issue (optional)</label>
                      <input type="text" value={emergencyForm.issue} onChange={e => setEmergencyForm({ ...emergencyForm, issue: e.target.value })} className="input-dark" placeholder="e.g. Engine cut off with smoke" />
                    </div>
                    <button type="submit" disabled={emergencyLoading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-base transition-all border border-red-500 cursor-pointer disabled:opacity-50 min-h-[52px]">
                      {emergencyLoading ? 'Dispatching…' : '🚨 Dispatch Roadside Assistance'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 border border-emerald-400 cursor-pointer"
        title="Chat on WhatsApp">
        <MessageCircle size={22} fill="currentColor" />
      </a>

      <Footer />
    </div>
  );
}
