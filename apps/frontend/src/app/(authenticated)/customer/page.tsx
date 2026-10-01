"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';


interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  totalDocuments: number;
  completedDocuments: number;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/admin/customers`, {
        credentials: 'include'
      });
      if (!res.ok) {
        if (res.status === 401) {
           toast.error("Please log in to access this page");
           router.push("/login");
           setIsAuthorized(false);
           return;
        }
        if (res.status === 403) {
           toast.error("You do not have permission to view the Admin portal");
           router.push("/dashboard");
           setIsAuthorized(false);
           return;
        }
        throw new Error('Failed to fetch customers');
      }
      const data = await res.json();
      setCustomers(data);
      setIsAuthorized(true);
    } catch (error) {
      toast.error("Failed to load customers data");
      console.error(error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthorized === false || isAuthorized === null) {
    return null;
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(appliedSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <Users className="mr-3 text-indigo-600" size={32} />
              Customers
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your platform users and view their eSign document activity.
            </p>
          </div>
        </div>

        {/* Filters/Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email (Press Enter)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedSearch(searchInput);
                }
              }}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
            />
          </div>
          
          <div className="text-sm font-medium text-slate-500 px-2">
            Total Customers: <span className="text-indigo-600 font-bold">{customers.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-200 w-full">
              <thead className="bg-slate-50 w-full">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    S. No.
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Date of Joining
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Documents Usage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse bg-white">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-slate-200/80 rounded-md w-8"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200/80"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 bg-slate-200/80 rounded-md w-32"></div>
                            <div className="h-3 bg-slate-200/80 rounded-md w-48"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-2">
                        <div className="h-4 bg-slate-200/80 rounded-md w-24"></div>
                        <div className="h-3 bg-slate-200/80 rounded-md w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-y-2">
                        <div className="h-4 bg-slate-200/80 rounded-md w-20"></div>
                        <div className="h-3 bg-slate-200/80 rounded-md w-32"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                            <div className="text-sm text-slate-500">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-700">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(customer.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm font-bold text-teal-600">
                            <FileText size={14} className="mr-1.5" />
                            {customer.completedDocuments} Signed
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            out of {customer.totalDocuments} total uploaded
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm">
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
