"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Smartphone, Fingerprint, Usb, Stamp, User, Users, Command, LogOut, Loader2 } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    // Check user role and password change requirement
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/user/me`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.profile?.mustChangePassword) {
          window.location.href = "/force-change-password";
          return;
        }
        if (data.profile?.role === 'ADMIN') {
          setIsAdmin(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
    }
  };

  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { href: '/dashboard', icon: Home, label: 'Dashboard', activeColor: 'text-slate-900', activeBg: 'bg-slate-100' },
      ]
    },
    {
      title: 'PRODUCTS',
      items: [
        { href: '/esign', icon: Smartphone, label: 'OTP eSign', activeColor: 'text-amber-700', activeBg: 'bg-amber-50', iconColor: 'text-amber-500' },
        { href: '#aadhaar', icon: Fingerprint, label: 'Aadhaar eSign', iconColor: 'text-indigo-500', isComingSoon: true },
        { href: '#dsc', icon: Usb, label: 'DSC eSign', iconColor: 'text-emerald-500', isComingSoon: true },
        { href: '#estamp', icon: Stamp, label: 'eStamp', iconColor: 'text-amber-500', isComingSoon: true },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        ...(isAdmin ? [{ href: '/customer', icon: Users, label: 'Customers', activeColor: 'text-slate-900', activeBg: 'bg-slate-100' }] : []),
        { href: '/profile', icon: User, label: 'Profile', activeColor: 'text-slate-900', activeBg: 'bg-slate-100' },
      ]
    }
  ];

  return (
    <>
      <aside className="w-20 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col items-center pt-8 pb-6 z-40 shadow-sm shrink-0">
        {/* Brand Header */}
        <div className="pb-8 flex justify-center w-full">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white shadow-md">
            <Command size={20} />
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-6 w-full px-4">
          {menuGroups.map((group, index) => (
            <div key={group.title} className="flex flex-col space-y-3 w-full items-center">
              {/* Subtle Divider between groups instead of text headers */}
              {index !== 0 && <div className="w-8 h-px bg-slate-100 mb-1 rounded-full"></div>}
              
              {group.items.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                const isComingSoon = link.isComingSoon;

                if (isComingSoon) {
                  return (
                    <div 
                      key={link.label}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto relative group text-slate-400 opacity-60 grayscale cursor-default"
                    >
                      <Icon size={22} className={link.iconColor || "text-slate-400"} />
                      
                      {/* Tooltip */}
                      <span className="absolute left-14 bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        {link.label} <span className="ml-1 text-slate-400 font-normal">(Soon)</span>
                      </span>
                    </div>
                  );
                }

                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto relative group ${
                      isActive 
                        ? `${link.activeBg || 'bg-slate-100'} ${link.activeColor || 'text-slate-900'} shadow-sm` 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? (link.iconColor || '') : 'group-hover:text-slate-600'} />
                    
                    {/* Tooltip */}
                    <span className="absolute left-14 bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto pt-4 w-full px-4 flex flex-col items-center">
          <div className="w-8 h-px bg-slate-100 mb-4 rounded-full"></div>
          <button 
            onClick={() => setIsLogoutDialogOpen(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto relative group text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
          >
            <LogOut size={22} strokeWidth={2} className="group-hover:text-rose-600 transition-colors" />
            
            {/* Tooltip */}
            <span className="absolute left-14 bg-rose-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => !isLoggingOut && setIsLogoutDialogOpen(false)}
          ></div>
          
          {/* Modal */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 max-w-sm w-full mx-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 mx-auto border border-rose-100 shadow-sm">
              <LogOut size={32} strokeWidth={2} />
            </div>
            
            <h3 className="text-2xl font-jakarta font-bold text-center text-slate-900 mb-3">
              Sign Out
            </h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              Are you sure you want to sign out? You will need to log back in to access your dashboard and documents.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsLogoutDialogOpen(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Sign Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
