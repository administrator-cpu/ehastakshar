import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Stamp } from 'lucide-react';

export default function StampPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <nav className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">E-Stamping (Coming Soon)</h1>
      </nav>
      
      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-20">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
          <Stamp size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Digital Stamping Features</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Legally binding digital stamping and franking features are currently under development. Stay tuned for updates!
        </p>
        <Link 
          href="/dashboard"
          className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
