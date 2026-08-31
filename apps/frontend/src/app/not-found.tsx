import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function NotFound() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isLoggedIn = !!token;

  const redirectUrl = isLoggedIn ? '/dashboard' : '/';
  const buttonText = isLoggedIn ? 'Return to Dashboard' : 'Return to Home';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 hero-gradient flex-1">
      <div className="glass-card max-w-lg w-full rounded-2xl p-8 md:p-12 text-center shadow-lg transition-all duration-300 hover:shadow-xl relative overflow-hidden group/card">
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-error-container rounded-full flex items-center justify-center mx-auto mb-6 text-on-error-container shadow-sm">
            <span className="material-symbols-outlined text-[40px]">explore_off</span>
          </div>
          
          <h1 className="font-jakarta text-[80px] leading-none tracking-tighter text-primary font-bold mb-2">
            404
          </h1>
          <h2 className="font-jakarta text-[24px] text-primary font-semibold mb-4">
            Page Not Found
          </h2>
          
          <p className="font-inter text-[16px] text-on-surface-variant mb-8 max-w-[90%] mx-auto leading-relaxed">
            Oops! The page you are looking for doesn't exist, has been moved, or you don't have permission to access it.
          </p>
          
          <Link 
            href={redirectUrl}
            className="group inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-xl font-inter text-[15px] font-bold transition-all duration-300 ease-out-ui hover:-translate-y-1 hover:shadow-md active:scale-95 active:shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
              {isLoggedIn ? 'dashboard' : 'home'}
            </span>
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
