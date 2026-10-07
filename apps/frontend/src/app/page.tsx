import Link from "next/link";
import { MockupDisplay } from "../components/MockupDisplay";

export default function Home() {
  return (
    <>
      {/* Floating Navbar Container */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 w-full max-w-7xl mx-auto">
        <nav className="flex justify-between items-center w-full px-6 py-3 bg-white/70 backdrop-blur-sm border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
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
        <section className="relative pt-32 pb-32 px-6 lg:px-container-padding overflow-hidden hero-gradient">
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
              {/* <div className="flex flex-col gap-3 pt-4 w-fit">
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup" className="brand-gradient text-white px-8 py-3.5 rounded-full font-inter text-label-md font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:-translate-y-0.5 flex items-center justify-center">
                    Get Started for FREE
                  </Link>
                  <button className="bg-transparent border-2 border-primary/20 text-primary px-8 py-3.5 rounded-full font-inter text-label-md font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:bg-primary/5 hover:border-primary/40">
                    View Documentation
                  </button>
                </div>
                <p className="text-center text-sm font-inter text-on-surface-variant">
                  No credit card required
                </p>
              </div> */}
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
            <MockupDisplay />
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-outline-variant/30 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-container-padding text-center">
            <p className="text-sm font-semibold text-outline tracking-wider uppercase mb-8">Trusted by innovative teams</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">wifi</span> Fab5 Network</div>
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">support_agent</span> Samadhan</div>
              {/* <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">token</span> Nexus Inc</div>
              <div className="flex items-center gap-2 text-xl font-jakarta font-bold text-slate-800"><span className="material-symbols-outlined">language</span> Horizon</div> */}
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
                <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-amber-50 to-transparent opacity-100 transition-opacity duration-500"></div>
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
        <section className="relative py-32 px-6 lg:px-container-padding bg-surface-container-lowest overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center space-y-4 mb-20">
              <h2 className="font-jakarta text-[40px] text-primary font-bold tracking-tight">
                How It Works
              </h2>
              <p className="font-inter text-body-lg text-on-surface-variant">
                A streamlined, legally-binding process from upload to final signature.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 relative">
              {/* Glowing Dashed Connecting Line */}
              <div className="hidden md:block absolute top-[4.5rem] left-0 w-full h-0 border-t-2 border-dashed border-primary/20 -translate-y-1/2 z-0"></div>
              
              {/* Step 1 */}
              <div className="flex-1 bg-white/70 backdrop-blur-xl p-10 rounded-2xl border border-outline-variant/40 relative z-10 text-center group hover:-translate-y-2 transition-transform duration-500 ease-out-ui hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                {/* Floating Number Badge */}

                <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-sm text-primary group-hover:bg-primary/10 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform duration-300" data-icon="upload_file">upload_file</span>
                </div>
                <h4 className="font-jakarta text-[22px] font-bold text-primary mb-3">
                  Upload &amp; Prepare
                </h4>
                <p className="font-inter text-body-md text-on-surface-variant">
                  Securely upload your PDF document to our encrypted local vault to begin the signing process.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex-1 bg-white/70 backdrop-blur-xl p-10 rounded-2xl border border-outline-variant/40 relative z-10 text-center group hover:-translate-y-2 transition-transform duration-500 ease-out-ui hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                {/* Floating Number Badge */}
                {/* <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full brand-gradient text-white flex items-center justify-center font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">2</div> */}
                
                <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-amber-100 shadow-sm text-amber-600 group-hover:bg-amber-100 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform duration-300" data-icon="send">send</span>
                </div>
                <h4 className="font-jakarta text-[22px] font-bold text-primary mb-3">
                  Add Signers
                </h4>
                <p className="font-inter text-body-md text-on-surface-variant">
                  Specify your recipients and securely invite them via email for OTP-based Simple eSign authentication.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex-1 bg-white/70 backdrop-blur-xl p-10 rounded-2xl border border-outline-variant/40 relative z-10 text-center group hover:-translate-y-2 transition-transform duration-500 ease-out-ui hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
                {/* Floating Number Badge */}
                {/* <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full brand-gradient text-white flex items-center justify-center font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">3</div> */}
                
                <div className="w-20 h-20 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-md text-white transition-shadow duration-300 relative overflow-hidden">
                  <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform duration-300" data-icon="task_alt">task_alt</span>
                </div>
                <h4 className="font-jakarta text-[22px] font-bold text-primary mb-3">
                  Track &amp; Complete
                </h4>
                <p className="font-inter text-body-md text-on-surface-variant">
                  Monitor real-time progress and receive the legally binding, audit-trailed document.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Floating Vault Card */}
        <section className="py-24 px-6 lg:px-container-padding bg-surface-container-lowest">
          <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Ambient Glowing Orbs inside the card */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] brand-gradient rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
            
            <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
              <h2 className="font-jakarta text-[48px] md:text-[56px] leading-tight font-bold text-white tracking-tight">
                Ready to digitize your <br className="hidden md:block"/> workflows?
              </h2>
              <p className="font-inter text-body-lg text-slate-300">
                Join thousands of businesses trusting Ehastakshar's secure local vault for their critical document signing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link href="/signup" className="brand-gradient text-white px-10 py-4 rounded-full font-inter text-label-md font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:-translate-y-1 flex items-center justify-center">
                  Get Started for FREE
                </Link>
                <button className="bg-transparent border-2 border-slate-600 text-white px-10 py-4 rounded-full font-inter text-label-md font-bold transition-all duration-300 ease-out-ui active:scale-[0.97] hover:bg-white/10 hover:border-white/50">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Crisp White Footer */}
      <footer className="mt-auto w-full border-t border-slate-100 bg-white py-12 text-center text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <a href="https://thediv.in" target="_blank" rel="noopener noreferrer" className="group inline-flex flex-col items-center gap-2 transition-all duration-300">
            <div className="text-slate-500 font-inter font-medium group-hover:text-slate-900 transition-colors duration-300 flex items-center gap-1.5">
              Powered by: <span className="brand-gradient-text font-jakarta font-bold text-base tracking-wide">DIV</span>
            </div>
            <div className="text-slate-400 font-inter text-xs flex items-center gap-1">
              © DIV Private Limited. All Rights Reserved <span className="text-slate-300 font-mono font-bold group-hover:text-primary transition-colors duration-300">{`</>`}</span>
            </div>
          </a>
        </div>
      </footer>
    </>
  );
}
