"use client";


import Link from 'next/link';
import { PenTool, Stamp, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function DashboardPage() {
  const { profile, isLoading } = useUser();

  return (
    <div className="min-h-screen relative bg-surface-container-lowest overflow-hidden p-6 md:p-12 lg:p-16">
      {/* Premium Ambient Workspace Background */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] brand-gradient rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="font-jakarta text-[40px] md:text-[48px] font-bold tracking-tight text-primary">
            {isLoading ? "Loading..." : `Welcome back, ${profile?.firstName || 'User'}!`}
          </h1>
          <p className="font-inter text-body-lg text-on-surface-variant max-w-2xl">
            What would you like to do today? Select an action below to get started with your secure workflows.
          </p>
        </header>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* eSign Card */}
          <Link href="/esign" className="group block">
            <div className="h-full relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-outline-variant/40 p-10 transition-all duration-500 ease-out-ui hover:shadow-[0_20px_40px_-15px_rgba(255,0,84,0.15)] hover:-translate-y-2">
              <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] transition-all duration-500 group-hover:opacity-10 group-hover:scale-110 group-hover:rotate-12 text-primary">
                <PenTool size={180} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-colors duration-500 border border-primary/10 relative overflow-hidden group-hover:shadow-md">
                  <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                  <PenTool size={32} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="font-jakarta text-[24px] font-bold text-primary mb-3">eSign</h3>
                  <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
                    Upload documents, assign signers, and track the progress of your digital signatures securely.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-primary font-bold transition-colors duration-300">
                  <span className="bg-clip-text group-hover:text-transparent group-hover:brand-gradient-text transition-all duration-300">Go to eSign</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-500 group-hover:translate-x-2 text-secondary opacity-0 -translate-x-2 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Stamp Card */}
          <Link href="#" className="group block cursor-default">
            <div className="h-full relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-outline-variant/40 p-10 transition-all duration-500 ease-out-ui">
              <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] text-slate-900 transition-all duration-500 group-hover:opacity-5 group-hover:scale-110">
                <Stamp size={180} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-slate-400 border border-outline-variant transition-colors duration-500 relative overflow-hidden">
                  <Stamp size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-jakarta text-[24px] font-bold text-slate-500">Stamp</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-full">Soon</span>
                  </div>
                  <p className="font-inter text-body-md text-slate-400 leading-relaxed">
                    Apply legally binding digital corporate stamps to your official organization documents.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Profile Card */}
          <Link href="/profile" className="group block">
            <div className="h-full relative overflow-hidden rounded-[2rem] bg-white/70 backdrop-blur-xl border border-outline-variant/40 p-10 transition-all duration-500 ease-out-ui hover:shadow-[0_20px_40px_-15px_rgba(255,0,84,0.15)] hover:-translate-y-2">
              <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] transition-all duration-500 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 text-primary">
                <User size={180} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-colors duration-500 border border-primary/10 relative overflow-hidden group-hover:shadow-md">
                  <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                  <User size={32} className="group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h3 className="font-jakarta text-[24px] font-bold text-primary mb-3">Profile</h3>
                  <p className="font-inter text-body-md text-on-surface-variant leading-relaxed">
                    Manage your account settings, digital certificates, and billing information.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-primary font-bold transition-colors duration-300">
                  <span className="bg-clip-text group-hover:text-transparent group-hover:brand-gradient-text transition-all duration-300">View Settings</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-500 group-hover:translate-x-2 text-secondary opacity-0 -translate-x-2 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
