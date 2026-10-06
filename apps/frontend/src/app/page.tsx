import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Floating Navbar Container */}
      <div className="sticky top-4 z-50 px-4 md:px-8 w-full max-w-7xl mx-auto">
        <nav className="flex justify-between items-center w-full px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
          <div className="flex items-center gap-8">
            <span className="font-jakarta text-[22px] font-bold text-primary flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg brand-gradient text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[18px]" data-icon="draw">draw</span>
              </div>
              Ehastakshar
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="brand-gradient text-white px-6 py-2.5 rounded-full font-inter text-sm font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:shadow-[0_0_15px_rgba(255,0,84,0.4)] hover:-translate-y-0.5">
              Log In
            </Link>
          </div>
        </nav>
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 lg:px-container-padding overflow-hidden hero-gradient">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10 space-y-8">
              <h1 className="font-jakarta text-[56px] leading-[1.1] text-primary font-bold tracking-tight">
                The Secure <br className="hidden md:block" />
                <span className="brand-gradient-text">Digital Signature</span> Platform.
              </h1>
              <p className="font-inter text-body-lg text-on-surface-variant max-w-xl">
                Upload documents, add recipients, and get them signed securely with
                our seamless Simple eSign flow. Streamline your business workflows with absolute precision and robust audit trails.
              </p>
              <div className="flex flex-col gap-3 pt-4 w-fit">
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup" className="brand-gradient text-white px-8 py-3.5 rounded-full font-inter text-label-md font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:shadow-[0_0_24px_rgba(255,0,84,0.4)] hover:-translate-y-0.5 flex items-center justify-center">
                    Get Started for FREE
                  </Link>
                  <button className="bg-transparent border-2 border-primary/20 text-primary px-8 py-3.5 rounded-full font-inter text-label-md font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:bg-primary/5 hover:border-primary/40">
                    View Documentation
                  </button>
                </div>
                <p className="text-center text-sm font-inter text-on-surface-variant">
                  No credit card required
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-on-surface-variant pt-6">
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-[12px]" data-icon="security">security</span>
                  </div>
                  Secure Audit Trails
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-[12px]" data-icon="bolt">bolt</span>
                  </div>
                  Instant Verification
                </span>
              </div>
            </div>

            {/* Mockup Display */}
            <div className="relative z-10 w-full h-[500px] lg:h-[600px] hover:-translate-y-2 transition-transform duration-700 ease-out-ui">
              {/* Glassmorphism Container */}
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden flex flex-col z-10">
                <div className="h-12 border-b border-white/50 bg-white/40 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="mx-auto text-xs text-outline font-medium">
                    NDA_Agreement_Final.pdf
                  </div>
                </div>
                <div className="flex-grow p-6 flex justify-center overflow-hidden bg-gradient-to-b from-transparent to-surface-container-low/30">
                  <div className="w-full max-w-sm bg-white/90 shadow-sm border border-white/60 rounded flex flex-col h-full relative">
                    <div className="p-8 space-y-4 text-outline flex-grow">
                      <div className="h-4 w-3/4 bg-surface-variant/70 rounded"></div>
                      <div className="h-2 w-full bg-surface-variant/70 rounded"></div>
                      <div className="h-2 w-full bg-surface-variant/70 rounded"></div>
                      <div className="h-2 w-5/6 bg-surface-variant/70 rounded"></div>
                      <div className="pt-12">
                        <div className="w-48 h-24 border-2 border-dashed border-amber-500 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 relative group cursor-pointer hover:bg-amber-100 transition-colors animate-pulse hover:animate-none">
                          <span className="material-symbols-outlined mb-1" data-icon="draw">draw</span>
                          <span className="text-xs font-semibold block mt-6 absolute">Click to Sign</span>
                        </div>
                      </div>
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/60 flex items-center gap-3 hover:-translate-y-2 transition-transform duration-500">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]" data-icon="fingerprint">fingerprint</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-primary">Signature Pending</div>
                        <div className="text-[10px] text-outline">Waiting for Ajay Negi</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Massive Ambient Glows behind the glass */}
              <div className="absolute top-10 right-10 w-72 h-72 brand-gradient rounded-full blur-[80px] opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-10 left-10 w-96 h-96 bg-amber-400 rounded-full blur-[100px] opacity-15"></div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-outline-variant/30 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-container-padding text-center">
            <p className="text-sm font-semibold text-outline tracking-wider uppercase mb-8">Trusted by innovative teams</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">layers</span> Acme Corp</div>
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">api</span> GlobalTech</div>
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">token</span> Nexus Inc</div>
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">language</span> Horizon</div>
            </div>
          </div>
        </section>

        {/* Features Grid (Bento Style) */}
        <section
          className="py-24 px-6 lg:px-container-padding bg-surface-container-lowest"
          id="features"
        >
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="font-jakarta text-headline-lg text-primary font-bold">
                Precision Tools for Modern Agreements
              </h2>
              <p className="font-inter text-body-md text-on-surface-variant">
                Built for compliance, designed for speed. Experience a seamless
                signing workflow without compromising on legal validity.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
              {/* Feature 1: Simple eSign */}
              <div className="md:col-span-2 bg-surface rounded-xl p-8 border border-outline-variant/40 relative overflow-hidden flex flex-col justify-between group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-lg glass-card">
                <div className="z-10">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined" data-icon="ink_pen">ink_pen</span>
                  </div>
                  <h3 className="font-jakarta text-headline-md text-primary font-bold mb-2">
                    Frictionless Simple eSign
                  </h3>
                  <p className="font-inter text-body-md text-on-surface-variant max-w-md">
                    Quick, legally valid signing for internal documents and standard agreements via secure email OTP authentication. No complex setups required.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Feature 2: Audit Trails */}
              <div className="bg-surface rounded-xl p-8 border border-outline-variant/40 flex flex-col justify-between group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-lg glass-card">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined" data-icon="history">history</span>
                  </div>
                  <h3 className="font-jakarta text-[20px] font-semibold text-primary mb-2">
                    Comprehensive Audit Trails
                  </h3>
                  <p className="font-inter text-sm text-on-surface-variant">
                    Track every view, IP address, and signature with tamper-proof cryptographic logs ensuring non-repudiation.
                  </p>
                </div>
              </div>

              {/* Feature 3: Real-time Tracking */}
              <div className="bg-surface rounded-xl p-8 border border-outline-variant/40 flex flex-col justify-between group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-lg glass-card">
                <div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
                  </div>
                  <h3 className="font-jakarta text-[20px] font-semibold text-primary mb-2">
                    Real-time Tracking
                  </h3>
                  <p className="font-inter text-sm text-on-surface-variant">
                    Monitor document status instantly. Know exactly when recipients open, review, or finalize your agreements.
                  </p>
                </div>
              </div>

              {/* Feature 4: Secure Vault */}
              <div className="md:col-span-2 brand-gradient rounded-xl p-8 border border-transparent relative overflow-hidden flex flex-col justify-between text-white group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-xl">
                <div className="z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white mb-6 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined" data-icon="lock">lock</span>
                  </div>
                  <h3 className="font-jakarta text-headline-md font-bold mb-2">
                    Secure Local Vault
                  </h3>
                  <p className="font-inter text-body-md text-white/90 max-w-md">
                    Your documents are stored securely with enterprise-grade protection. Every finalized PDF is visually stamped and logically bound to its audit history.
                  </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 lg:px-container-padding bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-jakarta text-headline-lg text-primary font-bold">
                How It Works
              </h2>
              <p className="font-inter text-body-md text-on-surface-variant">
                A streamlined process from upload to final signature.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/30 -translate-y-1/2 z-0"></div>
              {/* Step 1 */}
              <div className="flex-1 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/50 relative z-10 text-center glass-card hover:-translate-y-2 transition-transform duration-300 ease-out-ui hover:shadow-md">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-outline-variant shadow-sm text-primary">
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="upload_file"
                  >
                    upload_file
                  </span>
                </div>
                <h4 className="font-jakarta text-[20px] font-semibold text-primary mb-3">
                  1. Upload &amp; Prepare
                </h4>
                <p className="font-inter text-sm text-on-surface-variant">
                  Securely upload your PDF document to our encrypted local vault to begin the signing process.
                </p>
              </div>
              {/* Step 2 */}
              <div className="flex-1 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/50 relative z-10 text-center glass-card hover:-translate-y-2 transition-transform duration-300 ease-out-ui hover:shadow-md">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 border border-outline-variant shadow-sm text-primary">
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="send"
                  >
                    send
                  </span>
                </div>
                <h4 className="font-jakarta text-[20px] font-semibold text-primary mb-3">
                  2. Add Signers
                </h4>
                <p className="font-inter text-sm text-on-surface-variant">
                  Specify your recipients and securely invite them via email for OTP-based Simple eSign authentication.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex-1 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/50 relative z-10 text-center glass-card hover:-translate-y-2 transition-transform duration-300 ease-out-ui hover:shadow-md">
                <div className="w-16 h-16 brand-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white">
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="task_alt"
                  >
                    task_alt
                  </span>
                </div>
                <h4 className="font-jakarta text-[20px] font-semibold text-primary mb-3">
                  3. Track &amp; Complete
                </h4>
                <p className="font-inter text-sm text-on-surface-variant">
                  Monitor real-time progress and receive the legally binding,
                  audit-trailed document.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 lg:px-container-padding bg-primary text-on-primary">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="font-jakarta text-[40px] font-bold">
              Ready to secure your workflows?
            </h2>
            <p className="font-inter text-body-lg text-primary-fixed-dim max-w-2xl mx-auto">
              Join thousands of Indian businesses trusting Ehastakshar for their
              critical document signing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup" className="brand-gradient text-white px-8 py-4 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.97] hover:opacity-90 shadow-lg flex items-center justify-center">
                Get Started for FREE
              </Link>
              <button className="bg-transparent border border-outline text-white px-8 py-4 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.97] hover:bg-white/5">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
