import React from 'react';
import Link from 'next/link';
import { PenTool, Stamp, User } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8 md:p-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome back, Ajay!
          </h1>
          <p className="text-lg text-slate-500">
            What would you like to do today?
          </p>
        </header>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* eSign Card */}
          <Link href="/esign" className="group block">
            <div className="h-full relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-teal-500/30">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity duration-300 group-hover:opacity-10">
                <PenTool size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 transition-colors duration-300 group-hover:bg-teal-600 group-hover:text-white">
                  <PenTool size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">eSign</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Upload documents, assign signers, and track the progress of your digital signatures securely.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-teal-600 font-semibold group-hover:underline underline-offset-4 decoration-2">
                  Go to eSign
                  <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Stamp Card */}
          <Link href="#" className="group block">
            <div className="h-full relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity duration-300 group-hover:opacity-10">
                <Stamp size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                  <Stamp size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Stamp</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Apply legally binding digital corporate stamps to your official organization documents.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-indigo-600 font-semibold group-hover:underline underline-offset-4 decoration-2">
                  Coming Soon
                </div>
              </div>
            </div>
          </Link>

          {/* Profile Card */}
          <Link href="#" className="group block">
            <div className="h-full relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/30">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity duration-300 group-hover:opacity-10">
                <User size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 transition-colors duration-300 group-hover:bg-amber-600 group-hover:text-white">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Profile</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Manage your account settings, digital certificates, and billing information.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-amber-600 font-semibold group-hover:underline underline-offset-4 decoration-2">
                  View Settings
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
