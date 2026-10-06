import React from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { UserProvider } from '@/contexts/UserContext';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto">
          {children}
        </div>
      </div>
    </UserProvider>
  );
}
