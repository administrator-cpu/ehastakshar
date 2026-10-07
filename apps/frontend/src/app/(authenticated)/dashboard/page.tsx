"use client";

import Link from 'next/link';
import { Smartphone, Fingerprint, Usb, Stamp } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function DashboardPage() {
  const { profile, isLoading } = useUser();

  return (
    <div className="min-h-screen relative bg-surface-container-lowest overflow-x-hidden pt-4 px-6 pb-12 md:pt-6 md:px-12 lg:pt-6 lg:px-16">
      {/* Premium Ambient Workspace Background */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] brand-gradient rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="font-jakarta text-[36px] md:text-[42px] font-bold tracking-tight text-primary">
            {isLoading ? "Loading..." : `Welcome back, ${profile?.firstName || 'User'}!`}
          </h1>
          <p className="font-inter text-body-lg text-on-surface-variant max-w-2xl">
            What would you like to do today? Select an action below to get started with your secure workflows.
          </p>
        </header>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* OTP-Based eSign Card (LIVE) */}
          <Link href="/esign" className="group block">
            <div className="h-full relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-outline-variant/40 p-6 lg:p-8 transition-all duration-500 ease-out-ui hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:border-amber-500/30 hover:-translate-y-1.5">
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] transition-all duration-500 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 text-amber-600">
                <Smartphone size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 transition-colors duration-500 border border-amber-500/10 relative overflow-hidden group-hover:shadow-md">
                  <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                  <Smartphone size={28} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-jakarta text-[22px] font-bold text-amber-900 group-hover:text-amber-600 transition-colors duration-300">OTP / Consent eSign</h3>
                  </div>
                  <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
                    Quick and accessible digital signing using secure mobile OTP authentication for everyday agreements.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-amber-600 font-bold transition-colors duration-300">
                  <span className="transition-all duration-300">Proceed to Sign</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-500 group-hover:translate-x-2 opacity-0 -translate-x-2 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Aadhaar-Based eSign Card (DULL) */}
          <Link href="#" className="group block cursor-default">
            <div className="h-full relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-outline-variant/40 p-6 lg:p-8 opacity-60 grayscale hover:grayscale-[0.5] transition-all duration-500">
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] text-indigo-600">
                <Fingerprint size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-500/10">
                  <Fingerprint size={28} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-jakarta text-[22px] font-bold text-indigo-900">Aadhaar eSign</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-500 px-2.5 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
                    Highly secure, legally binding signatures backed by UIDAI Aadhaar biometric or OTP authentication.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-slate-400 font-bold">
                  <span>Join Waitlist</span>
                </div>
              </div>
            </div>
          </Link>

          {/* DSC - Based eSign Card (DULL) */}
          <Link href="#" className="group block cursor-default">
            <div className="h-full relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-outline-variant/40 p-6 lg:p-8 opacity-60 grayscale hover:grayscale-[0.5] transition-all duration-500">
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] text-emerald-600">
                <Usb size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-500/10">
                  <Usb size={28} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-jakarta text-[22px] font-bold text-emerald-900">DSC eSign</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-500 px-2.5 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
                    Hardware-token based cryptographic signatures ensuring the highest level of regulatory compliance.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-slate-400 font-bold">
                  <span>Join Waitlist</span>
                </div>
              </div>
            </div>
          </Link>

          {/* eStamp Card (DULL) */}
          <Link href="#" className="group block cursor-default">
            <div className="h-full relative overflow-hidden rounded-[1.5rem] bg-white/40 backdrop-blur-md border border-outline-variant/40 p-6 lg:p-8 opacity-60 grayscale hover:grayscale-[0.5] transition-all duration-500">
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] text-amber-600">
                <Stamp size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-500/10">
                  <Stamp size={28} />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-jakarta text-[22px] font-bold text-amber-900">eStamp</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-500 px-2.5 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
                    Procure and apply legally binding digital corporate stamps and official state seals to your documents.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-slate-400 font-bold">
                  <span>Join Waitlist</span>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
