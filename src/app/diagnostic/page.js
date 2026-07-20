'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/Navbar';
import Footer from 'src/components/Footer';
import { useBooking } from 'src/context/BookingContext';
import { getMockDb } from 'src/lib/mockDb';
import { Sparkles, Wrench, AlertCircle, CheckCircle2, ChevronRight, Activity, Zap } from 'lucide-react';

export default function DiagnosticPage() {
  const router = useRouter();
  const { setSelectedServices, setPackage } = useBooking();
  
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      setError('Please describe your car issue first.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemDescription: description })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail ? (data.error + ': ' + data.detail) : (data.error || 'Failed to analyze problem.'));
      }

      // Map recommended IDs back to actual service objects from our mock DB
      const db = getMockDb();
      const mappedServices = (data.recommendedServiceIds || [])
        .map(id => db.services.find(s => s.id === id))
        .filter(Boolean);

      setResult({
        ...data,
        services: mappedServices
      });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBookServices = () => {
    if (!result || !result.services || result.services.length === 0) return;
    
    // Clear package if they are booking specific services from AI
    setPackage('none');
    
    // Add these services to cart
    setSelectedServices(result.services);
    
    // Go to vehicle selection to start booking flow
    router.push('/vehicle-selection');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F8F5F0' }}>
      <Navbar />

      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: '#FFF3EE', color: '#E65313' }}>
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Powered Assistant</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Describe your car&apos;s problem
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Not sure what&apos;s wrong? Tell our expert AI mechanic what you&apos;re experiencing (noises, smells, warning lights) and we&apos;ll diagnose it for you instantly.
            </p>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border mb-8" style={{ borderColor: '#E2D8CE' }}>
            <textarea
              className="w-full h-32 md:h-40 p-5 rounded-2xl border bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 resize-none text-lg transition-all"
              style={{ borderColor: '#E2D8CE', focusRingColor: '#E65313' }}
              placeholder="E.g. My car makes a high-pitched squealing noise when I brake, and the steering wheel vibrates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isAnalyzing}
            />

            {error && (
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 animate-shake">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !description.trim()}
                className="btn-primary py-3 px-8 text-base shadow-lg shadow-orange-500/20 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Activity size={20} className="animate-pulse" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Zap size={20} className="group-hover:scale-110 transition-transform" />
                    Diagnose Issue
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Animation */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-300">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E65313', borderTopColor: 'transparent' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wrench size={24} style={{ color: '#E65313' }} className="animate-pulse" />
                </div>
              </div>
              <p className="font-bold text-slate-700">Consulting AI Knowledge Base...</p>
              <p className="text-xs text-slate-400 mt-1">Cross-referencing symptoms with thousands of repair logs.</p>
            </div>
          )}

          {/* Results Area */}
          {result && !isAnalyzing && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Diagnosis Card */}
              <div className="bg-[#211F1D] rounded-3xl p-8 mb-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                
                <h2 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} /> AI Diagnosis Complete
                </h2>
                <h3 className="text-2xl font-black mb-4 leading-tight">
                  {result.diagnosis}
                </h3>
                <p className="text-slate-300 leading-relaxed max-w-2xl text-sm">
                  {result.explanation}
                </p>
              </div>

              {/* Recommended Services */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 px-2">
                  Recommended Solutions
                </h3>
                
                {result.services && result.services.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {result.services.map((service) => (
                      <div key={service.id} className="bg-white rounded-2xl p-5 border shadow-sm flex items-center justify-between" style={{ borderColor: '#E2D8CE' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#FFF3EE', color: '#E65313' }}>
                            <Wrench size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{service.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <span className="font-black text-lg text-slate-800">₹{service.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleBookServices}
                      className="w-full btn-primary py-4 text-lg justify-center shadow-lg shadow-orange-500/20 mt-4"
                    >
                      Book Recommended Services <ChevronRight size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 border text-center" style={{ borderColor: '#E2D8CE' }}>
                    <p className="font-bold text-slate-700">We couldn&apos;t match this to a standard service.</p>
                    <p className="text-sm text-slate-500 mt-2">Please book a General Engine Diagnosis so our mechanics can take a closer look.</p>
                    <button
                      onClick={() => {
                        const db = getMockDb();
                        const genService = db.services.find(s => s.id === 'engine-diagnosis');
                        if (genService) {
                          setPackage('none');
                          setSelectedServices([genService]);
                          router.push('/vehicle-selection');
                        }
                      }}
                      className="btn-primary mt-6 mx-auto"
                    >
                      Book Engine Diagnosis <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
