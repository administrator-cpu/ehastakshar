"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Search, Plus, X, RefreshCw, Loader2 } from 'lucide-react';
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

  // Add Customer State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ fullName: '', email: '', phone: '', tempPassword: '' });

  const generateTempPassword = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz234679";
    const randomValues = crypto.getRandomValues(new Uint32Array(12));

    return Array.from(randomValues, value => charset[value % charset.length]).join("");
  };

  const handleOpenAddCustomer = () => {
    setNewCustomer({ fullName: '', email: '', phone: '', tempPassword: generateTempPassword() });
    setIsAddCustomerOpen(true);
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/admin/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCustomer)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add customer');
      }
      
      toast.success("Customer added successfully. An email has been sent.");
      setIsAddCustomerOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add customer");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Users className="mr-3 text-amber-600" size={32} />
              Customers
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your platform users and view their eSign document activity.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAddCustomer}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-amber-400 text-slate-900 text-sm font-medium rounded-xl hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-all"
            >
              <Plus size={18} className="mr-2" />
              Add Customer
            </button>
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
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 sm:text-sm transition-all"
            />
          </div>
          
          <div className="text-sm font-medium text-slate-500 px-2">
            Total Customers: <span className="text-amber-600 font-bold">{customers.length}</span>
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
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br bg-amber-50 flex items-center justify-center text-amber-600 font-bold uppercase">
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
                          <div className="flex items-center text-sm font-bold text-amber-600">
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

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm" onClick={() => !isSubmitting && setIsAddCustomerOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl leading-6 font-bold text-slate-900">
                    Add New Customer
                  </h3>
                  <button
                    onClick={() => !isSubmitting && setIsAddCustomerOpen(false)}
                    className="text-slate-400 hover:text-slate-500 focus:outline-none"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      placeholder="e.g. Ajay Negi"
                      value={newCustomer.fullName}
                      onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
                      className="mt-1.5 block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="e.g. ajay@example.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="mt-1.5 block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="e.g. 1234567890"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="mt-1.5 block w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="tempPassword" className="block text-sm font-semibold text-slate-700">Temporary Password</label>
                    <div className="mt-1.5 flex rounded-lg shadow-sm">
                      <div className="relative flex items-stretch flex-grow focus-within:z-10">
                        <input
                          type="text"
                          id="tempPassword"
                          required
                          readOnly
                          value={newCustomer.tempPassword}
                          className="block w-full border border-slate-300 rounded-none rounded-l-lg px-4 py-2.5 bg-slate-50 text-slate-900 font-mono text-sm focus:ring-amber-500 focus:border-amber-500 transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewCustomer({...newCustomer, tempPassword: generateTempPassword()})}
                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 text-sm font-medium rounded-r-lg text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      >
                        <RefreshCw size={16} className="text-slate-400" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      An email will be sent to the customer with these login details. They will be forced to change this password on their first login.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => !isSubmitting && setIsAddCustomerOpen(false)}
                      className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none transition-all"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center items-center px-4 py-2.5 bg-amber-400 text-slate-900 text-sm font-medium rounded-lg hover:bg-amber-400 focus:outline-none shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                      Add Customer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
