"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenTool, Stamp, User } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/esign', icon: PenTool, label: 'eSign' },
    { href: '/stamp', icon: Stamp, label: 'E-Stamp' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-20 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col items-center py-8 z-50 shadow-sm shrink-0">
      <div className="flex-1 flex flex-col space-y-6 w-full px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto relative group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <span className="absolute left-14 bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
