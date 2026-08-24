import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-40 bg-surface shadow-sm">
        <div className="flex items-center gap-8">
          <span className="font-jakarta text-headline-md font-bold text-primary">
            Ehastakshar
          </span>
          <div className="hidden md:flex gap-6 items-center">
            <Link
              className="text-on-surface-variant hover:text-secondary transition-colors font-inter text-label-md"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="text-on-surface-variant hover:text-secondary transition-colors font-inter text-label-md"
              href="#pricing"
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="bg-[#0D9488] text-white px-4 py-2 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.97] hover:bg-secondary/90">
            Login
          </Link>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 lg:px-container-padding overflow-hidden hero-gradient">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10 space-y-8">
              <h1 className="font-jakarta text-display-lg text-primary font-bold">
                India&apos;s Most Trusted Digital Signature Platform.
              </h1>
              <p className="font-inter text-body-lg text-on-surface-variant max-w-xl">
                Upload documents, add recipients, and get them signed securely with
                Aadhaar eSign or Simple eSign. Streamline your legal and business
                workflows with absolute precision.
              </p>
              <div className="flex flex-col gap-3 pt-4 w-fit">
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup" className="bg-[#0D9488] text-white px-8 py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.97] hover:bg-[#0f766e] shadow-sm flex items-center justify-center">
                    Get Started for FREE
                  </Link>
                  <button className="bg-transparent border border-[#1A365D] text-[#1A365D] px-8 py-3 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.97] hover:bg-[#1A365D]/5">
                    View Documentation
                  </button>
                </div>
                <p className="text-center text-sm font-inter text-on-surface-variant">
                  No credit card required
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant pt-4">
                <span className="flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-secondary text-sm"
                    data-icon="verified"
                  >
                    verified
                  </span>{" "}
                  MeitY Compliant
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-secondary text-sm"
                    data-icon="verified"
                  >
                    verified
                  </span>{" "}
                  CCA Authorized
                </span>
              </div>
            </div>

            {/* Mockup Display */}
            <div className="relative z-10 w-full h-[500px] lg:h-[600px]">
              <div className="absolute inset-0 bg-white rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-outline-variant/30 overflow-hidden flex flex-col">
                <div className="h-12 border-b border-outline-variant/50 bg-surface flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-surface-dim"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-dim"></div>
                    <div className="w-3 h-3 rounded-full bg-surface-dim"></div>
                  </div>
                  <div className="mx-auto text-xs text-outline font-medium">
                    NDA_Agreement_Final.pdf
                  </div>
                </div>
                <div className="flex-grow bg-surface-container-low p-6 flex justify-center overflow-hidden">
                  <div className="w-full max-w-sm bg-white shadow-sm border border-outline-variant/30 rounded flex flex-col h-full relative">
                    <div className="p-8 space-y-4 text-outline flex-grow">
                      <div className="h-4 w-3/4 bg-surface-variant rounded"></div>
                      <div className="h-2 w-full bg-surface-variant rounded"></div>
                      <div className="h-2 w-full bg-surface-variant rounded"></div>
                      <div className="h-2 w-5/6 bg-surface-variant rounded"></div>
                      <div className="pt-12">
                        <div className="w-48 h-24 border-2 border-dashed border-[#0D9488] bg-[#0D9488]/5 rounded flex items-center justify-center text-[#0D9488] relative group cursor-pointer hover:bg-[#0D9488]/10 transition-colors">
                          <span
                            className="material-symbols-outlined mb-1"
                            data-icon="draw"
                          >
                            draw
                          </span>
                          <span className="text-xs font-semibold block mt-6 absolute">
                            Click to Sign
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-outline-variant/30 flex items-center gap-3">
                      <span
                      className="material-symbols-outlined"
                      data-icon="fingerprint"
                    >
                      fingerprint
                    </span>
                      
                      <div>
                        <div className="text-xs font-semibold text-primary">
                          Aadhaar eSign Pending
                        </div>
                        <div className="text-[10px] text-outline">
                          Waiting for Rahul K.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
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
              {/* Feature 1: Aadhaar */}
              <div className="md:col-span-2 bg-surface rounded-xl p-8 border border-outline-variant/40 relative overflow-hidden flex flex-col justify-between group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-md">
                <div className="z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
                    <span
                      className="material-symbols-outlined"
                      data-icon="fingerprint"
                    >
                      fingerprint
                    </span>
                  </div>
                  <h3 className="font-jakarta text-headline-md text-primary font-bold mb-2">
                    Aadhaar-based Verification
                  </h3>
                  <p className="font-inter text-body-md text-on-surface-variant max-w-md">
                    Legally binding eSignatures utilizing UIDAI integration for
                    absolute identity assurance and non-repudiation.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-surface-variant/30 to-transparent"></div>
              </div>
              {/* Feature 2: Simple eSign */}
              <div className="bg-surface rounded-xl p-8 border border-outline-variant/40 flex flex-col justify-between group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-md">
                <div>
                  <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center text-[#0D9488] mb-6">
                    <span
                      className="material-symbols-outlined"
                      data-icon="ink_pen"
                    >
                      ink_pen
                    </span>
                  </div>
                  <h3 className="font-jakarta text-[20px] font-semibold text-primary mb-2">
                    Simple eSign
                  </h3>
                  <p className="font-inter text-sm text-on-surface-variant">
                    Quick, frictionless signing for internal documents and standard
                    agreements via email OTP.
                  </p>
                </div>
              </div>
              {/* Feature 3: Audit Trails */}
              <div className="bg-surface rounded-xl p-8 border border-outline-variant/40 flex flex-col justify-between group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-md">
                <div>
                  <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary mb-6">
                    <span
                      className="material-symbols-outlined"
                      data-icon="history"
                    >
                      history
                    </span>
                  </div>
                  <h3 className="font-jakarta text-[20px] font-semibold text-primary mb-2">
                    Comprehensive Audit Trails
                  </h3>
                  <p className="font-inter text-sm text-on-surface-variant">
                    Track every view, IP address, and signature with tamper-proof
                    cryptographic logs.
                  </p>
                </div>
              </div>
              {/* Feature 4: Team Management */}
              <div className="md:col-span-2 bg-primary rounded-xl p-8 border border-primary-container relative overflow-hidden flex flex-col justify-between text-on-primary group transition-transform duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-md">
                <div className="z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                    <span
                      className="material-symbols-outlined"
                      data-icon="groups"
                    >
                      groups
                    </span>
                  </div>
                  <h3 className="font-jakarta text-headline-md font-bold mb-2">
                    Enterprise Team Management
                  </h3>
                  <p className="font-inter text-body-md text-primary-fixed-dim max-w-md">
                    Organize departments, set granular access controls, and manage
                    document templates across your entire organization.
                  </p>
                </div>
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
                  Securely upload your PDF and place signature tags exactly where
                  needed.
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
                  Specify recipients and choose between Simple eSign or Aadhaar
                  authentication.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex-1 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/50 relative z-10 text-center glass-card hover:-translate-y-2 transition-transform duration-300 ease-out-ui hover:shadow-md">
                <div className="w-16 h-16 bg-[#0D9488] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md text-white">
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
              <Link href="/signup" className="bg-[#0D9488] text-white px-8 py-4 rounded font-inter text-label-md font-bold transition-transform duration-[150ms] ease-out-ui active:scale-[0.97] hover:bg-[#0f766e] shadow-lg flex items-center justify-center">
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
