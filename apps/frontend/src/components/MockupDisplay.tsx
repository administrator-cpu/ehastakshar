"use client";

import { useState, useEffect } from "react";

export function MockupDisplay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { step: 0, delay: 1500 }, // Initial
      { step: 1, delay: 1500 }, // Move to Sign Button
      { step: 2, delay: 600 },  // Click Action
      { step: 3, delay: 1000 }, // OTP Modal Opens
      { step: 4, delay: 2500 }, // Typing OTP (staggered delay 2500ms)
      { step: 5, delay: 800 },  // Click Verify
      { step: 6, delay: 4000 }, // Success State
    ];

    let timeoutId: NodeJS.Timeout;

    const runSequence = (currentIndex: number) => {
      const current = sequence[currentIndex];
      setStep(current.step);

      const nextIndex = (currentIndex + 1) % sequence.length;
      timeoutId = setTimeout(() => {
        runSequence(nextIndex);
      }, current.delay);
    };

    runSequence(0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Custom styling for stagger and easing
  const customEasing = "cubic-bezier(0.32, 0.72, 0, 1)";
  const pointerEasing = "cubic-bezier(0.23, 1, 0.32, 1)";

  return (
    <div className="relative z-10 w-full h-[500px] lg:h-[600px] hover:-translate-y-2 transition-transform duration-700 ease-out-ui">
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes staggerDot {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .dot-anim {
          animation: staggerDot 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        .dot-1 { animation-delay: 200ms; }
        .dot-2 { animation-delay: 600ms; }
        .dot-3 { animation-delay: 1000ms; }
        .dot-4 { animation-delay: 1400ms; }
      `}} />

      {/* Glassmorphism Container */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden flex flex-col z-10">
        
        {/* Mac Window Controls */}
        <div className="h-12 border-b border-white/50 bg-white/40 flex items-center px-4 gap-2 group">
          <div className="flex gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-[#990000] opacity-100 font-bold" style={{ fontSize: '10px' }} data-icon="close">close</span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-[#995700] opacity-100 font-bold" style={{ fontSize: '10px' }} data-icon="remove">remove</span>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-[#006500] opacity-100 font-bold" style={{ fontSize: '10px' }} data-icon="open_in_full">open_in_full</span>
            </div>
          </div>
          <div className="mx-auto text-xs text-outline font-medium flex-1 text-center pr-10">
            NDA_Agreement_Final.pdf
          </div>
        </div>

        {/* Mock Document Content */}
        <div className="flex-grow p-6 flex justify-center overflow-hidden bg-gradient-to-b from-transparent to-surface-container-low/30 relative">
          <div className="w-full max-w-sm bg-white/90 shadow-sm border border-white/60 rounded flex flex-col h-full relative">
            <div className="p-8 space-y-4 text-outline flex-grow">
              <div className="h-4 w-3/4 bg-surface-variant/70 rounded"></div>
              <div className="h-2 w-full bg-surface-variant/70 rounded"></div>
              <div className="h-2 w-full bg-surface-variant/70 rounded"></div>
              <div className="h-2 w-5/6 bg-surface-variant/70 rounded"></div>
              
              <div className="pt-12 relative flex justify-center">
                {step < 6 ? (
                  <div className={`w-48 h-24 border-2 border-dashed border-amber-500 bg-amber-50 rounded-xl flex flex-col items-center justify-center text-amber-600 transition-all duration-300 ${(step === 1 || step === 2) ? 'bg-amber-100 scale-[0.97] shadow-inner' : 'animate-pulse'}`}>
                    <span className="material-symbols-outlined mb-1" data-icon="draw">draw</span>
                    <span className="text-xs font-semibold">Click to Sign</span>
                  </div>
                ) : (
                  <div 
                    className="w-48 h-24 border-2 border-emerald-500 bg-emerald-50 rounded-xl flex flex-col items-center justify-center text-emerald-600 transition-all duration-500 shadow-md scale-100"
                    style={{ transitionTimingFunction: customEasing }}
                  >
                    <span className="material-symbols-outlined mb-1 text-[28px]" data-icon="verified_user">verified_user</span>
                    <span className="text-xs font-semibold block">Signed by Ajay Negi</span>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/60 flex items-center gap-3 transition-transform duration-500">
              {step < 6 ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]" data-icon="pending">pending</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-amber-600">Signature Pending</div>
                    <div className="text-[10px] text-outline">Waiting for Ajay Negi</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]" data-icon="check_circle">check_circle</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-600">Document Signed</div>
                    <div className="text-[10px] text-outline">Verified via OTP</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        <div 
          className="absolute inset-0 z-20 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center transition-all duration-500"
          style={{ 
            opacity: (step >= 3 && step <= 5) ? 1 : 0, 
            pointerEvents: (step >= 3 && step <= 5) ? 'auto' : 'none',
            filter: (step >= 3 && step <= 5) ? 'blur(0)' : 'blur(2px)' // emil-design-eng: blur during transition
          }}
        >
          <div 
            className="bg-white p-6 rounded-2xl shadow-2xl w-72 border border-white/80 transition-all duration-500"
            style={{ 
              transform: (step >= 3 && step <= 5) ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              transitionTimingFunction: customEasing
            }}
          >
            <h3 className="text-primary font-jakarta font-bold text-lg mb-1">Verification Required</h3>
            <p className="text-outline text-xs mb-5">Enter the OTP sent to your email.</p>
            <div className="flex gap-3 justify-center mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-11 border border-outline-variant/60 rounded-lg flex items-center justify-center text-primary font-bold text-xl bg-surface-lowest shadow-inner relative">
                  {step >= 4 && (
                    <span className={`dot-anim dot-${i + 1}`}>•</span>
                  )}
                </div>
              ))}
            </div>
            <div 
              className={`w-full py-2.5 rounded-lg font-semibold text-sm text-center transition-all duration-200 ${(step === 5) ? 'brand-gradient text-white scale-[0.96] shadow-inner' : 'brand-gradient text-white shadow-md'}`}
            >
              Verify & Sign
            </div>
          </div>
        </div>

        {/* Custom Mouse Pointer */}
        <div 
          className="absolute z-50 pointer-events-none flex items-center justify-center"
          style={{
            top: step === 0 ? '90%' : 
                 step === 1 || step === 2 ? '48%' : 
                 step === 3 || step === 4 ? '55%' : 
                 step === 5 ? '61%' : '90%',
                 
            left: step === 0 ? '95%' : 
                  step === 1 || step === 2 ? '50%' : 
                  step === 3 || step === 4 ? '65%' : 
                  step === 5 ? '50%' : '95%',
                  
            transform: (step === 2 || step === 5) ? 'scale(0.8)' : 'scale(1)',
            opacity: step === 6 ? 0 : 1,
            transition: 'top 1000ms, left 1000ms, transform 200ms, opacity 300ms',
            transitionTimingFunction: pointerEasing,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)]">
            <path d="M5.5 3.21V20.8C5.5 21.46 6.27 21.82 6.77 21.4L11.52 17.13L15.42 22.8C15.65 23.14 16.1 23.25 16.47 23.06L18.42 22.06C18.79 21.87 18.94 21.43 18.75 21.07L14.77 15.26H20.25C20.91 15.26 21.28 14.49 20.85 14L6.75 2.5C6.31 2.11 5.5 2.42 5.5 3.21Z" fill="#111827"/>
            <path d="M5.5 3.21V20.8C5.5 21.46 6.27 21.82 6.77 21.4L11.52 17.13L15.42 22.8C15.65 23.14 16.1 23.25 16.47 23.06L18.42 22.06C18.79 21.87 18.94 21.43 18.75 21.07L14.77 15.26H20.25C20.91 15.26 21.28 14.49 20.85 14L6.75 2.5C6.31 2.11 5.5 2.42 5.5 3.21Z" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
      
      {/* Ambient Glows */}
      <div className="absolute top-10 right-10 w-72 h-72 brand-gradient rounded-full blur-[80px] opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute -bottom-10 left-10 w-96 h-96 bg-amber-400 rounded-full blur-[100px] opacity-15 pointer-events-none"></div>
    </div>
  );
}
