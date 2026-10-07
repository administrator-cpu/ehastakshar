"use client";

import { useState, useEffect } from "react";

export function MockupDisplay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { step: 0, delay: 1000 },  // Initial
      { step: 1, delay: 800 },   // Highlight field
      { step: 2, delay: 1000 },  // Cursor moves to field
      { step: 3, delay: 400 },   // Hover
      { step: 4, delay: 500 },   // Click
      { step: 5, delay: 600 },   // Field activated
      { step: 6, delay: 1500 },  // Toast: OTP sent
      { step: 7, delay: 800 },   // Modal appears
      { step: 8, delay: 300 },   // Type 1 ('7')
      { step: 9, delay: 300 },   // Mask 1, Type 2 ('4')
      { step: 10, delay: 300 },  // Mask 2, Type 3 ('9')
      { step: 11, delay: 500 },  // Mask 3, Type 4 ('2')
      { step: 12, delay: 600 },  // Mask 4, Button Activates
      { step: 13, delay: 1000 }, // Cursor moves to Button
      { step: 14, delay: 500 },  // Click Button
      { step: 15, delay: 1200 }, // Verifying identity...
      { step: 16, delay: 1200 }, // Creating signature...
      { step: 17, delay: 1200 }, // Modal fades, Stamp drops
      { step: 18, delay: 1000 }, // Securing document...
      { step: 19, delay: 1000 }, // Signature applied
      { step: 20, delay: 1500 }, // Audit trail generated
      { step: 21, delay: 4000 }, // Success state
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

  const customEasing = "cubic-bezier(0.32, 0.72, 0, 1)";
  const pointerEasing = "cubic-bezier(0.23, 1, 0.32, 1)";

  return (
    <div className="relative z-10 w-full h-[500px] lg:h-[600px] hover:-translate-y-2 transition-transform duration-700 ease-out-ui">
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes clickRipple {
          0% { transform: scale(0.5); opacity: 0.8; border-width: 4px; }
          100% { transform: scale(2); opacity: 0; border-width: 1px; }
        }
        @keyframes stampDrop {
          0% { transform: scale(1.5) rotate(-10deg); opacity: 0; }
          50% { transform: scale(0.9) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
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
                {step < 5 ? (
                  // Initial Dashed Box
                  <div className={`w-48 h-24 border-2 border-dashed border-amber-500 bg-amber-50 rounded-xl flex flex-col items-center justify-center text-amber-600 transition-all duration-300 ${(step === 3 || step === 4) ? 'bg-amber-100 scale-[0.97] shadow-inner' : (step === 1 || step === 2) ? 'ring-4 ring-amber-500/20 shadow-lg' : ''}`}>
                    <span className="material-symbols-outlined mb-1" data-icon="draw">draw</span>
                    <span className="text-xs font-semibold">Click to Sign</span>
                  </div>
                ) : step >= 5 && step < 17 ? (
                  // Activated Field Awaiting Signature
                  <div className="w-48 h-24 border-2 border-primary/40 bg-primary/5 rounded-xl flex flex-col items-center justify-center text-primary transition-all duration-500">
                    <span className="material-symbols-outlined mb-1 animate-pulse" data-icon="fingerprint">fingerprint</span>
                    <span className="text-[10px] font-semibold opacity-70">Awaiting Authentication</span>
                  </div>
                ) : (
                  // Final Digital Stamp
                  <div 
                    className="w-48 h-24 border-2 border-emerald-500 bg-emerald-50 rounded-xl flex flex-col items-center justify-center text-emerald-600 shadow-md relative overflow-hidden"
                    style={{ animation: 'stampDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                  >
                    <div className="absolute inset-0 bg-emerald-500/10 pattern-dots" />
                    <span className="material-symbols-outlined mb-1 text-[28px] relative z-10" data-icon="verified_user">verified_user</span>
                    <span className="text-xs font-semibold block relative z-10">Signed by Ajay Negi</span>
                    <span className="text-[8px] font-mono opacity-60 absolute bottom-2 right-3">ID: 9XF2-A4</span>
                  </div>
                )}
              </div>
            </div>

            {/* OTP Sent Toast (Step 6) */}
            <div 
              className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-500"
              style={{
                transform: step >= 6 && step <= 16 ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
                opacity: step >= 6 && step <= 16 ? 1 : 0,
                pointerEvents: 'none'
              }}
            >
              <span className="material-symbols-outlined text-[14px] text-blue-400" data-icon="mail">mail</span>
              OTP sent to a***@domain.com
            </div>

            {/* Processing Toasts (Step 18-20) */}
            <div 
              className="absolute bottom-6 left-6 right-6 bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500"
              style={{
                transform: step >= 18 && step <= 20 ? 'translateY(0)' : 'translateY(20px)',
                opacity: step >= 18 && step <= 20 ? 1 : 0,
                pointerEvents: 'none'
              }}
            >
              {step === 18 && <><span className="material-symbols-outlined text-[16px] text-amber-400 animate-pulse" data-icon="lock">lock</span> Securing document...</>}
              {step === 19 && <><span className="material-symbols-outlined text-[16px] text-emerald-400" data-icon="draw">draw</span> Signature logically applied.</>}
              {step === 20 && <><span className="material-symbols-outlined text-[16px] text-blue-400" data-icon="receipt_long">receipt_long</span> Audit trail generated.</>}
            </div>

            {/* Floating Badge (Original, hidden during detailed processing) */}
            <div 
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/60 flex items-center gap-3 transition-transform duration-500"
              style={{
                opacity: (step < 6 || step >= 21) ? 1 : 0,
                transform: (step < 6 || step >= 21) ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
              }}
            >
              {step < 21 ? (
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
                    <div className="text-[10px] text-outline">Verified & Secured</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        <div 
          className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center transition-all duration-700"
          style={{ 
            opacity: (step >= 7 && step <= 16) ? 1 : 0, 
            pointerEvents: (step >= 7 && step <= 16) ? 'auto' : 'none',
          }}
        >
          <div 
            className="bg-white p-6 rounded-2xl shadow-2xl w-72 border border-white/80 transition-all duration-500"
            style={{ 
              transform: (step >= 7 && step <= 16) ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
              transitionTimingFunction: customEasing
            }}
          >
            <h3 className="text-primary font-jakarta font-bold text-lg mb-1">Verification Required</h3>
            <p className="text-outline text-xs mb-5">Enter the OTP sent to your email.</p>
            <div className="flex gap-3 justify-center mb-6">
              {[1, 2, 3, 4].map((boxNum) => {
                let content = '';
                const baseStep = 7 + boxNum; // box 1 types at step 8
                if (step === baseStep) {
                  // Currently typing this box (flashing the digit)
                  if (boxNum === 1) content = '7';
                  if (boxNum === 2) content = '4';
                  if (boxNum === 3) content = '9';
                  if (boxNum === 4) content = '2';
                } else if (step > baseStep) {
                  // Already typed and masked
                  content = '•';
                }
                
                return (
                  <div key={boxNum} className={`w-10 h-11 border ${step >= baseStep ? 'border-primary border-b-2' : 'border-outline-variant/60'} rounded-lg flex items-center justify-center text-primary font-bold text-xl bg-surface-lowest shadow-inner relative transition-colors duration-200`}>
                    {content}
                  </div>
                );
              })}
            </div>
            <div 
              className={`w-full py-2.5 rounded-lg font-semibold text-sm text-center transition-all duration-300 ${
                (step >= 12) ? 'brand-gradient text-white shadow-md' : 'bg-surface-variant/30 text-outline'
              } ${step === 14 ? 'scale-[0.96] shadow-inner' : 'scale-100'}`}
            >
              {step >= 15 ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {step === 15 ? "Verifying identity..." : "Creating signature..."}
                </div>
              ) : (
                "Verify & Sign"
              )}
            </div>
          </div>
        </div>

        {/* Custom Mouse Pointer */}
        <div 
          className="absolute z-50 pointer-events-none flex items-center justify-center"
          style={{
            top: step <= 1 ? '90%' : 
                 step >= 2 && step <= 12 ? '48%' : 
                 step >= 13 && step <= 16 ? '61%' : '90%',
                 
            left: step <= 1 ? '95%' : 
                  step >= 2 && step <= 12 ? '50%' : 
                  step >= 13 && step <= 16 ? '50%' : '95%',
                  
            transform: (step === 4 || step === 14) ? 'scale(0.8)' : 'scale(1)',
            opacity: step >= 17 ? 0 : 1,
            transition: 'top 1000ms, left 1000ms, transform 200ms, opacity 300ms',
            transitionTimingFunction: pointerEasing,
          }}
        >
          {/* Click Ripple Effect */}
          <div 
            className="absolute pointer-events-none rounded-full border border-primary/80"
            style={{
              top: '-6px', left: '-6px',
              width: '24px', height: '24px',
              animation: (step === 4 || step === 14) ? 'clickRipple 0.6s ease-out forwards' : 'none',
              opacity: 0,
            }}
          ></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)] relative z-10">
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

