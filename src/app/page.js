'use client';

import React, { useEffect, useState } from 'react';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import ServiceCard from 'src/components/ServiceCard';
import { getMockDb, getReviews, addEmergencyRequest } from 'src/lib/mockDb';
import {
  ShieldCheck, CircleDollarSign, CalendarRange, ClipboardList, CheckSquare,
  ChevronRight, ArrowRight, Star, Phone, MessageCircle,
  Wrench, ShieldAlert, Check, CheckCircle2, UserCheck,
  Clock, Award, Search, Calendar
} from 'lucide-react';
import LinkNext from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeBeforeAfter, setActiveBeforeAfter] = useState('paint');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [emergencyForm, setEmergencyForm] = useState({ name: '', phone: '', location: '', vehicleDetails: '', breakdownType: '', issue: '', towingRequired: false });
  const [submittedId, setSubmittedId] = useState('');
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    const db = getMockDb();
    setTimeout(() => {
      setServices(db.services.slice(0, 6));
      setReviews(getReviews().slice(0, 3));
    }, 0);
  }, []);

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergencyForm.name || !emergencyForm.phone || !emergencyForm.location || !emergencyForm.vehicleDetails || !emergencyForm.breakdownType) return;
    setEmergencyLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const newReq = addEmergencyRequest({
      name: emergencyForm.name,
      phone: emergencyForm.phone,
      location: emergencyForm.location,
      vehicleDetails: emergencyForm.vehicleDetails,
      breakdownType: emergencyForm.breakdownType,
      issue: emergencyForm.issue,
      towingRequired: emergencyForm.towingRequired
    });
    setSubmittedId(newReq.id);
    setEmergencySubmitted(true);
    setEmergencyLoading(false);
    setEmergencyForm({ name: '', phone: '', location: '', vehicleDetails: '', breakdownType: '', issue: '', towingRequired: false });
  };

  const features = [
    { title: 'Transparent Pricing', description: 'No hidden fees. Itemized estimates before any work starts.', icon: CircleDollarSign, accent: 'icon-emerald' },
    { title: 'ASE Certified Mechanics', description: 'Trained technicians using genuine OEM or OES-equivalent parts.', icon: ShieldCheck, accent: 'icon-blue' },
    { title: 'Easy Online Booking', description: 'Schedule a service from your phone in under 2 minutes.', icon: CalendarRange, accent: 'icon-amber' },
    { title: 'Digital Health Reports', description: 'Detailed inspection reports with photos & component status.', icon: ClipboardList, accent: 'icon-violet' },
    { title: 'Item-by-Item Approval', description: 'You control every rupee. Approve or reject each repair.', icon: CheckSquare, accent: 'icon-orange' },
  ];

  const steps = [
    { num: '01', title: 'Select Vehicle', desc: 'Enter make, model and mileage', icon: '🚗' },
    { num: '02', title: 'Choose Services', desc: 'Pick repairs with transparent pricing', icon: '🔧' },
    { num: '03', title: 'Pick a Package', desc: 'Compare Silver, Gold & Platinum', icon: '📦' },
    { num: '04', title: 'Get Estimate', desc: 'Review itemized costs instantly', icon: '📋' },
    { num: '05', title: 'Book Your Slot', desc: 'Schedule a convenient time', icon: '📅' },
    { num: '06', title: 'Track Progress', desc: 'Live status updates from the garage', icon: '📍' },
  ];

  const beforeAfterData = {
    paint: {
      title: 'Exterior Polish & Ceramic Coat',
      beforeSrc: '/images/polish_before.png',
      afterSrc: '/images/polish_after.png',
      beforeAlt: 'Car paint before exterior polishing — dull, scratched with UV damage',
      afterAlt: 'Car paint after Bug Slayers exterior polish — mirror finish ceramic coat',
      detail: '9H Ceramic Shield Protection',
      stat: '60% better UV resistance',
    },
    engine: {
      title: 'Engine Deep Clean',
      beforeSrc: '/images/engine_before.png',
      afterSrc: '/images/engine_after.png',
      beforeAlt: 'Engine bay before cleaning — carbon build-up, oil sludge and grime',
      afterAlt: 'Engine bay after Bug Slayers steam clean and decarb — spotless engine',
      detail: 'Full engine decarb + steam clean',
      stat: '15% improved fuel efficiency',
    },
    headlight: {
      title: 'Headlight Restoration',
      beforeSrc: '/images/headlight_before.png',
      afterSrc: '/images/headlight_after.png',
      beforeAlt: 'Headlight before restoration — oxidized and yellowed lens',
      afterAlt: 'Headlight after Bug Slayers restoration — crystal clear with UV sealant',
      detail: 'UV polish + anti-fog coating',
      stat: '60% more light output',
    },
  };

  const faqs = [
    { q: 'How does the digital health report approval work?', a: 'Once our technicians inspect your car, they generate an itemized digital health report showing part cost, labor cost, and priority. You can approve or reject each repair separately — we only charge for what you authorize.' },
    { q: 'Are your parts genuine?', a: 'Yes. Bug Slayers only uses OEM or premium OES equivalent parts that come with official warranties.' },
    { q: 'Is there a pickup and drop-off facility?', a: 'Absolutely. During booking, you can select "Pickup & Delivery" (₹499 valet fee) and specify your address. Our driver picks up your car and returns it once completed.' },
    { q: 'How can I reschedule or cancel my booking?', a: 'You can manage all bookings from your dashboard under "My Bookings". Rescheduling and cancellation are free up to 4 hours before the service slot.' },
    { q: 'Do you offer roadside assistance?', a: 'Yes, we provide 24/7 towing and roadside emergency help. Use our Emergency Breakdown Form below or call us directly for instant support.' },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const ba = beforeAfterData[activeBeforeAfter];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      {/* ════ HERO ════ */}
      <section className="relative flex flex-col lg:block overflow-hidden bg-white" style={{ borderBottom: '1px solid #E2D8CE' }}>
        {/* Right side background image (Full bleed on desktop, stacked on mobile) */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 w-full h-[280px] sm:h-[380px] lg:h-full z-0 order-last lg:order-none animate-slide-in">
          <div className="relative w-full h-full">
            <Image
              src="/images/hero_car.png"
              alt="Premium car — Bug Slayers professional car service"
              fill
              className="object-cover object-center lg:object-left"
              priority
            />
            {/* Smooth transition gradient overlays */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent" />
            <div className="lg:hidden absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            <div className="lg:hidden absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>

        {/* Content blend background overlay */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-white via-white to-transparent z-10" />

        {/* Content Container */}
        <div className="content-wrapper relative z-20 py-12 lg:py-20 flex flex-col justify-center min-h-[460px] lg:min-h-[580px]">
          <div className="max-w-xl lg:max-w-[540px] space-y-6">
            {/* Label */}
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#E65313' }}>
              Professional Car Care
            </p>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.08]" style={{ color: '#202020' }}>
              Your Car Deserves<br />
              <span style={{ color: '#E65313' }}>The Best Care</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg leading-relaxed text-gray-600">
              From routine maintenance to advanced repair, we keep your car running smooth, safe and new.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <LinkNext href="/vehicle-selection" className="btn-primary text-base flex items-center justify-center gap-2">
                <Calendar size={18} /> Book Service
              </LinkNext>
              <LinkNext href="/packages" className="btn-outline text-base bg-white flex items-center justify-center gap-2">
                View Pricing <ChevronRight size={18} />
              </LinkNext>
            </div>

            {/* Bottom features bar */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                <ShieldCheck size={16} className="text-gray-400 shrink-0" />
                <span>Certified Experts</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                <Wrench size={16} className="text-gray-400 shrink-0" />
                <span>Genuine Parts</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                <CircleDollarSign size={16} className="text-gray-400 shrink-0" />
                <span>Transparent Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ STATS BAR ════ */}
      <section style={{ background: '#211F1D', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="content-wrapper py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '12,000+', label: 'Cars Serviced' },
              { num: '98%', label: 'Satisfaction Rate' },
              { num: '4.9/5', label: 'Google Rating' },
              { num: '24/7', label: 'Emergency Support' },
            ].map((s, i) => (
              <div key={i} className="space-y-0.5">
                <p className="text-2xl font-black text-white">{s.num}</p>
                <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section className="py-16" style={{ background: '#F1E9DF' }}>
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label">Simple Process</p>
            <h2 className="section-title mt-2">How It Works</h2>
            <p className="section-sub mt-3">From booking to doorstep delivery in six transparent steps.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative h-full">
                {/* Connector line: sits at z-0 behind the cards */}
                {idx < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute h-px z-0"
                    style={{
                      background: '#E2D8CE',
                      top: '20px',
                      left: '50%',
                      width: '100%',
                    }}
                  />
                )}
                {/* Card: h-full forces equal height across all cards in the row */}
                <div className="card p-5 text-center hover:border-[#E65313] transition-colors relative z-10 h-full flex flex-col items-center" style={{ background: '#FFFFFF' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-xs font-black text-white relative z-20 shrink-0"
                    style={{ background: '#E65313' }}
                  >
                    {step.num}
                  </div>
                  <div className="text-2xl mb-2 shrink-0">{step.icon}</div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: '#202020' }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#667085' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ POPULAR SERVICES ════ */}
      <section className="py-16" style={{ background: '#F8F5F0' }}>
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label">Our Services Catalog</p>
            <h2 className="section-title mt-2">Popular Maintenance Services</h2>
            <p className="section-sub mt-3">Certified checkups designed to keep your vehicle performing at its peak.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
          <div className="text-center mt-10">
            <LinkNext
              href="/services"
              className="inline-flex items-center gap-2 text-base font-bold transition-colors group"
              style={{ color: '#E65313' }}
            >
              Browse all repair services <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </LinkNext>
          </div>
        </div>
      </section>

      {/* ════ WHY CHOOSE US ════ */}
      <section className="py-16" style={{ background: '#F1E9DF', borderTop: '1px solid #E2D8CE', borderBottom: '1px solid #E2D8CE' }}>
        <div className="content-wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
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
                  <div key={feat.title} className="card-hover p-5 flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${feat.accent}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base mb-1" style={{ color: '#202020' }}>{feat.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#667085' }}>{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════ PACKAGES TEASER ════ */}
      <section className="py-16" style={{ background: '#F8F5F0' }}>
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="section-label">Care Packages</p>
            <h2 className="section-title mt-2">Choose Your Service Package</h2>
            <p className="section-sub mt-3">Bundle services and save up to 25% with our Silver, Gold, or Platinum care plans.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { name: 'Silver Care', price: '₹1,499', items: ['24-Point Inspection', 'Synthetic Oil & Filter', 'Fluid Top-up'], color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
              { name: 'Gold Care', price: '₹2,499', items: ['Full Digital Scan', 'Premium Fluid Flush', 'Air & Cabin Filters'], color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', popular: true },
              { name: 'Platinum Care', price: '₹3,999', items: ['Priority 120-Point', 'Ultra Fluid Service', 'Full Alignment + Wiper'], color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
            ].map((pkg, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border-2 relative transition-all hover:-translate-y-1"
                style={{ background: '#FFFFFF', borderColor: pkg.popular ? pkg.color : '#E2D8CE' }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: pkg.color }}>Most Popular</div>
                )}
                <h3 className="font-extrabold text-lg mb-1" style={{ color: '#202020' }}>{pkg.name}</h3>
                <p className="text-3xl font-black mb-4" style={{ color: pkg.color }}>{pkg.price}</p>
                <ul className="space-y-2 mb-5">
                  {pkg.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: pkg.bg, border: `1px solid ${pkg.border}` }}>
                        <Check size={10} style={{ color: pkg.color }} strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <LinkNext href="/packages" className="block w-full text-center py-2.5 rounded-lg text-sm font-bold transition-all" style={{ background: pkg.bg, color: pkg.color, border: `1.5px solid ${pkg.border}` }}>
                  Choose Plan
                </LinkNext>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ BEFORE & AFTER ════ */}
      <section className="py-16" style={{ background: '#F1E9DF', borderTop: '1px solid #E2D8CE' }}>
        <div className="content-wrapper">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="section-label">Premium Gallery</p>
            <h2 className="section-title mt-2">Before &amp; After Transformations</h2>
            <p className="section-sub mt-3">Real results from our most popular services.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Tab Pills */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: 'paint', label: '✨ Exterior Polish' },
                { id: 'engine', label: '🔧 Engine Clean' },
                { id: 'headlight', label: '💡 Headlight Restore' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBeforeAfter(tab.id)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer min-h-[40px]"
                  style={
                    activeBeforeAfter === tab.id
                      ? { background: '#E65313', color: '#FFFFFF', border: '1px solid #E65313' }
                      : { background: '#FFFFFF', color: '#667085', border: '1px solid #E2D8CE' }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <p className="text-center font-bold mb-5" style={{ color: '#202020' }}>{ba.title}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Before */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #E2D8CE' }}>
                <div className="relative aspect-video w-full">
                  <div className="absolute top-3 left-3 z-10 text-white text-xs font-black px-3 py-1 rounded-full uppercase" style={{ background: 'rgba(0,0,0,0.65)' }}>Before</div>
                  <Image src={ba.beforeSrc} alt={ba.beforeAlt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                </div>
                <div className="px-5 py-3" style={{ background: '#F1E9DF', borderTop: '1px solid #E2D8CE' }}>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Condition before Bug Slayers service</p>
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid #E65313' }}>
                <div className="relative aspect-video w-full">
                  <div className="absolute top-3 left-3 z-10 text-white text-xs font-black px-3 py-1 rounded-full uppercase" style={{ background: '#E65313' }}>After Bug Slayers</div>
                  <Image src={ba.afterSrc} alt={ba.afterAlt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                </div>
                <div className="px-5 py-3 flex justify-between items-center" style={{ background: '#FFF3EE', borderTop: '1px solid #FFD9C8' }}>
                  <p className="text-xs font-semibold" style={{ color: '#E65313' }}>{ba.detail}</p>
                  <span className="text-xs font-bold" style={{ color: '#16A34A' }}>{ba.stat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ REVIEWS ════ */}
      <section className="py-16" style={{ background: '#F8F5F0' }}>
        <div className="content-wrapper">
          <div className="text-center mb-12">
            <p className="section-label">Customer Stories</p>
            <h2 className="section-title mt-2">What Our Customers Say</h2>
            <p className="section-sub mt-3">Verified reviews submitted post-service by real car owners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.length > 0 ? reviews.map((rev, idx) => (
              <div key={rev.id || idx} className="card p-6 flex flex-col justify-between hover:border-[#E65313] transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
                    {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-sm italic leading-relaxed" style={{ color: '#374151' }}>&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid #E2D8CE' }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#202020' }}>{rev.customerName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{rev.vehicle}</p>
                  </div>
                  <span className="badge badge-green flex items-center gap-1"><Check size={9} strokeWidth={3} /> Verified</span>
                </div>
              </div>
            )) : [1, 2, 3].map(i => (
              <div key={i} className="card p-6 space-y-3 animate-pulse">
                <div className="h-3 rounded w-1/2" style={{ background: '#F1E9DF' }} />
                <div className="h-16 rounded" style={{ background: '#F1E9DF' }} />
                <div className="h-3 rounded w-1/3" style={{ background: '#F1E9DF' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FAQ ════ */}
      <section className="py-16" style={{ background: '#F1E9DF', borderTop: '1px solid #E2D8CE', borderBottom: '1px solid #E2D8CE' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="section-label">Common Questions</p>
            <h2 className="section-title mt-2">Frequently Asked</h2>
          </div>
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search FAQs…"
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <div className="card overflow-hidden">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx < filteredFaqs.length - 1 ? '1px solid #E2D8CE' : 'none' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 text-base font-bold flex justify-between items-center transition-colors cursor-pointer min-h-[56px] gap-4 hover:bg-[#FAFAF8]"
                  style={{ color: '#202020' }}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <span className="text-xl font-bold shrink-0" style={{ color: '#9CA3AF' }}>{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm leading-relaxed animate-in" style={{ color: '#667085', borderTop: '1px solid #F1E9DF' }}>{faq.a}</div>
                )}
              </div>
            )) : (
              <div className="p-10 text-center text-sm italic" style={{ color: '#9CA3AF' }}>No matching FAQs. Clear your search.</div>
            )}
          </div>
        </div>
      </section>

      {/* ════ EMERGENCY / ROADSIDE ════ */}
      <section className="py-16 relative overflow-hidden" style={{ background: '#211F1D' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(220,38,38,0.06) 0%, transparent 60%)' }} />
        <div className="content-wrapper relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto lg:mx-0"
                style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)' }}
              >
                <ShieldAlert size={26} className="text-red-400" />
              </div>
              <h2 className="section-title text-white" style={{ color: '#FFFFFF' }}>24/7 Roadside Assistance</h2>
              <p className="text-base leading-relaxed" style={{ color: '#E5E7EB' }}>
                Car broke down or won&apos;t start? Submit your location and we&apos;ll dispatch a mechanic immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="tel:+919626757303"
                  className="inline-flex items-center justify-center gap-2.5 text-white px-6 py-3.5 rounded-lg font-extrabold text-sm transition-all min-h-[48px]"
                  style={{ background: '#DC2626', border: '1px solid rgba(220,38,38,0.5)' }}
                >
                  <Phone size={16} fill="currentColor" /> Call: +91 9626757303
                </a>
                <a
                  href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20emergency%20roadside%20help."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg font-extrabold text-sm transition-all min-h-[48px]"
                  style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', color: '#4ADE80' }}
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E2D8CE' }}>
                <div className="px-6 py-4" style={{ background: '#F8F5F0', borderBottom: '1px solid #E2D8CE' }}>
                  <h3 className="font-extrabold text-base" style={{ color: '#202020' }}>Submit Breakdown Request</h3>
                  <p className="text-sm" style={{ color: '#667085' }}>A nearby mechanic will be dispatched immediately.</p>
                </div>
                <div className="p-6">
                  {emergencySubmitted ? (
                    <div className="rounded-2xl p-8 text-center space-y-4 animate-in" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <CheckCircle2 size={36} className="mx-auto" style={{ color: '#16A34A' }} />
                      <div>
                        <p className="text-base font-bold" style={{ color: '#16A34A' }}>Request Submitted!</p>
                        <p className="text-xs mt-1" style={{ color: '#667085' }}>Your Emergency Dispatch ID is:</p>
                        <p className="font-mono text-lg px-3 py-1.5 rounded-lg inline-block mt-1.5 font-bold" style={{ color: '#202020', background: '#FFFFFF', border: '1px solid #E2D8CE' }}>
                          {submittedId}
                        </p>
                      </div>
                      <p className="text-xs max-w-sm mx-auto" style={{ color: '#667085' }}>Our dispatch team has received your request and will call you within 5 minutes.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEmergencySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Your Name *</label>
                          <input type="text" required value={emergencyForm.name} onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })} className="input-field" placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Phone *</label>
                          <input type="tel" required value={emergencyForm.phone} onChange={e => setEmergencyForm({ ...emergencyForm, phone: e.target.value })} className="input-field" placeholder="e.g. 96267 57303" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Vehicle Details *</label>
                          <input type="text" required value={emergencyForm.vehicleDetails} onChange={e => setEmergencyForm({ ...emergencyForm, vehicleDetails: e.target.value })} className="input-field" placeholder="e.g. Creta (TN38AB1234)" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Breakdown Type *</label>
                          <select required value={emergencyForm.breakdownType} onChange={e => setEmergencyForm({ ...emergencyForm, breakdownType: e.target.value })} className="input-field">
                            <option value="">Select Breakdown Type</option>
                            <option value="Engine Failure">Engine / Mechanical Failure</option>
                            <option value="Flat Tyre">Flat Tyre / Puncture</option>
                            <option value="Battery Issue">Battery Dead / No Start</option>
                            <option value="Accident">Accident / Collision</option>
                            <option value="Brake Issue">Brake Failure</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Towing Required?</label>
                          <select value={emergencyForm.towingRequired ? 'yes' : 'no'} onChange={e => setEmergencyForm({ ...emergencyForm, towingRequired: e.target.value === 'yes' })} className="input-field">
                            <option value="no">No - Fix on Site</option>
                            <option value="yes">Yes - Need Towing</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Current Location *</label>
                          <input type="text" required value={emergencyForm.location} onChange={e => setEmergencyForm({ ...emergencyForm, location: e.target.value })} className="input-field" placeholder="e.g. Near Hopes College" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase block mb-1.5 tracking-wider" style={{ color: '#667085' }}>Describe Issue (optional)</label>
                        <textarea
                          value={emergencyForm.issue}
                          onChange={e => setEmergencyForm({ ...emergencyForm, issue: e.target.value })}
                          className="input-field resize-none"
                          style={{ height: '5rem' }}
                          placeholder="e.g. Engine cuts off with smoke from the bonnet."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={emergencyLoading}
                        className="w-full text-white py-3.5 rounded-lg font-extrabold text-base transition-all cursor-pointer min-h-[52px]"
                        style={{ background: '#DC2626', opacity: emergencyLoading ? 0.6 : 1 }}
                      >
                        {emergencyLoading ? 'Dispatching Assistance...' : '🚨 Dispatch Roadside Assistance'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/919626757303?text=Hi%20Bug%20Slayers%2C%20I%20need%20help%20with%20my%20car."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 sm:right-6 text-white p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 z-40 cursor-pointer"
        style={{ background: '#16A34A' }}
        title="Chat on WhatsApp"
      >
        <MessageCircle size={22} fill="currentColor" />
      </a>

      <Footer />
    </div>
  );
}
