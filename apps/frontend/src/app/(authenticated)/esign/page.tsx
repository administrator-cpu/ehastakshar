"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft, Search, FolderOpen, FileText, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  total: number;
  pending: number;
  completed: number;
}

interface Document {
  id: string;
  title: string;
  status: string;
  signType: string;
  updatedAt: string;
  transactionId: string;
  uploaderName?: string;
}

export default function ESignDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, completed: 0 });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/dashboard`);
        url.searchParams.append("page", currentPage.toString());
        url.searchParams.append("limit", "10");
        if (searchQuery) {
          url.searchParams.append("search", searchQuery);
        }

        const response = await fetch(url.toString(), {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentDocuments(data.recentDocuments);
          setTotalPages(data.totalPages || 1);
          setIsAdmin(data.isAdmin || false);
        } else {
          toast.error("Failed to fetch dashboard metrics");
        }
      } catch (e) {
        console.error(e);
        toast.error("An error occurred while fetching metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentPage, searchQuery]);

  return (
    <div className="min-h-screen relative bg-surface-container-lowest text-slate-900 font-sans">
      {/* Premium Ambient Workspace Background */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
      
      {/* Top Nav */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-outline-variant/40 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">eSign Hub</h1>
        </div>
        
        <Link 
          href="/esign/send/digital"
          className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-400 active:scale-[0.97] transition-all duration-150 ease-out text-slate-900 px-6 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} />
          <span>Send for eSign</span>
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* Metrics Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded-md w-24"></div>
                  <div className="h-6 bg-slate-100 rounded-md w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-outline-variant/40 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-5">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <FileText size={26} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">Total Documents</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-outline-variant/40 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Clock size={26} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">Pending Signatures</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-outline-variant/40 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-5">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                <CheckCircle size={26} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-0.5">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-outline-variant/40 shadow-sm overflow-hidden relative z-10">
          <div className="p-6 border-b border-outline-variant/40 flex justify-between items-center bg-white/50">
            <h2 className="text-xl font-bold text-primary">Recent Documents</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(inputValue);
                    setCurrentPage(1); // Reset to first page on new search
                  }
                }}
                placeholder="Search documents..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-64"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="overflow-x-auto animate-pulse">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></th>
                    <th className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></th>
                    <th className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></th>
                    <th className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td className="p-4"><div className="h-5 bg-slate-100 rounded-md w-3/4"></div></td>
                      <td className="p-4"><div className="h-4 bg-slate-100 rounded-md w-20"></div></td>
                      <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-24"></div></td>
                      <td className="p-4"><div className="h-4 bg-slate-100 rounded-md w-28"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : recentDocuments.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center bg-white/30 border border-dashed border-outline-variant/60 rounded-xl m-6">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                <FolderOpen size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">No documents yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                You haven't sent any documents for e-signature yet. Click the "Send for eSign" button to get started.
              </p>
              <Link 
                href="/esign/send/digital"
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.97] transition-all duration-150 ease-out text-white px-6 py-3 rounded-full font-medium cursor-pointer shadow-sm"
              >
                <Plus size={18} />
                <span>Create New Document</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</th>
                    {isAdmin && <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>}
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[140px]">Updated On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDocuments.map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => router.push(`/esign/document/${doc.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-medium text-slate-900">{doc.title}</td>
                      {isAdmin && <td className="p-4 text-sm text-slate-600 font-medium">{doc.uploaderName || 'Unknown'}</td>}
                      <td className="p-4 text-sm text-slate-600">{doc.signType}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          doc.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                          doc.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-500">
                    Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
