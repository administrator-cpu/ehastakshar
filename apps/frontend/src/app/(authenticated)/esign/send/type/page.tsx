import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Fingerprint, FileBadge } from 'lucide-react';

export default function ESignatureTypeSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center sticky top-0 z-50">
        <Link href="/esign" className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <span className="ml-4 font-medium text-slate-500">Back to eSign Hub</span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Select eSignature type</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Choose how you want your recipients to sign the document. Both methods provide legally binding electronic signatures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          
          {/* Digital eSign Card */}
          <Link href="/esign/send/digital" className="group block">
            <div className="h-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-teal-500 hover:-translate-y-1 relative overflow-hidden cursor-pointer active:scale-[0.98] ease-out">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <FileBadge size={32} />
                </div>
                
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ArrowRight size={20} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">Digital eSign</h3>
              <p className="text-slate-500 leading-relaxed text-base">
                Send documents for secure electronic signature via Email and OTP verification. Best for standard contracts and agreements.
              </p>
            </div>
          </Link>

          {/* Aadhaar eSign Card (Disabled) */}
          <div className="group block cursor-not-allowed opacity-60">
            <div className="h-full bg-slate-50 border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
              
              <div className="absolute top-6 right-8">
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                  <Fingerprint size={32} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Aadhaar eSign</h3>
              <p className="text-slate-500 leading-relaxed text-base">
                Highly secure, UIDAI-backed biometric/OTP signature for official and legally sensitive documents.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
