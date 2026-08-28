"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle, Clock, Eye, Download, ExternalLink, Mail, Check, Key, PenTool, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentDetails {
  document: {
    id: string;
    title: string;
    status: string;
    signType: string;
    createdAt: string;
    updatedAt?: string;
    transactionId: string;
    fileUrl: string;
  };
  recipients: {
    id: string;
    name: string;
    email: string;
    status: string;
    signedAt: string | null;
  }[];
  auditTrail: {
    id: string;
    action: string;
    ipAddress: string | null;
    timestamp: string;
    recipientName: string | null;
    recipientEmail: string | null;
  }[];
}

export default function DocumentDetailsPage() {
  const params = useParams();
  const documentId = params.id as string;
  
  const [data, setData] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reminding, setReminding] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/document/details/${documentId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error("Failed to load document details");
        }
      } catch (error) {
        toast.error("An error occurred while fetching details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [documentId]);

  const handleViewPdf = async () => {
    if (!data?.document) return;
    try {
      setDownloading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/document/download/${documentId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      toast.error("An error occurred while opening the PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleRemind = async (recipientId: string) => {
    try {
      setReminding(recipientId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/document/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to send reminder");
      toast.success("Reminder sent successfully");
    } catch (error) {
      toast.error("Failed to send reminder");
    } finally {
      setReminding(null);
    }
  };

  const getActionDetails = (event: any) => {
    const { action, recipientName, recipientEmail } = event;
    const name = recipientName || "System";
    
    switch (action) {
      case 'UPLOADED': 
        return { 
          text: `Document uploaded and initialized`,
          subtitle: name,
          icon: <FileText size={18} />,
          color: "bg-slate-500",
          textColor: "text-slate-500"
        };
      case 'INVITE_SENT':
      case 'REMINDER_SENT':
        return { 
          text: `Invitation sent for signing`,
          subtitle: recipientEmail ? `${name} (${recipientEmail})` : name,
          icon: <Mail size={18} />,
          color: "bg-blue-500",
          textColor: "text-blue-500"
        };
      case 'LINK_CLICKED':
        return { 
          text: `${name} has opened the document link`,
          subtitle: recipientEmail ? `${name} (${recipientEmail})` : name,
          icon: <Eye size={18} />,
          color: "bg-purple-500",
          textColor: "text-purple-500"
        };
      case 'OTP_REQUESTED':
        return { 
          text: `OTP requested by ${name} for verification`,
          subtitle: recipientEmail ? `${name} (${recipientEmail})` : name,
          icon: <Key size={18} />,
          color: "bg-amber-500",
          textColor: "text-amber-500"
        };
      case 'OTP_VERIFIED':
        return { 
          text: `${name} identity verified successfully via OTP`,
          subtitle: recipientEmail ? `${name} (${recipientEmail})` : name,
          icon: <Check size={18} />,
          color: "bg-green-500",
          textColor: "text-green-500"
        };
      case 'SIGNED':
        return { 
          text: `${name} has successfully signed the document`,
          subtitle: recipientEmail ? `${name} (${recipientEmail})` : name,
          icon: <PenTool size={18} />,
          color: "bg-teal-500",
          textColor: "text-teal-500"
        };
      case 'COMPLETED':
        return { 
          text: `All parties have signed the document`,
          subtitle: "System",
          icon: <CheckCircle size={18} />,
          color: "bg-teal-600",
          textColor: "text-teal-600"
        };
      default:
        return { 
          text: action,
          subtitle: name,
          icon: <Activity size={18} />,
          color: "bg-slate-400",
          textColor: "text-slate-400"
        };
    }
  };

  const groupAuditTrailByDate = (trail: any[]) => {
    const groups: Record<string, any[]> = {};
    trail.forEach(event => {
      const dateObj = new Date(event.timestamp);
      const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const label = dateStr === todayStr ? 'Today' : dateStr;
      if (!groups[label]) groups[label] = [];
      groups[label].push(event);
    });
    return groups;
  };

  const formatTime12hr = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  const formatDateDDMMYYYY = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] text-slate-500">Loading details...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f7] text-slate-500">
        <p className="mb-4">Document not found.</p>
        <Link href="/esign" className="text-[#6b46c1] hover:underline cursor-pointer">Return to Dashboard</Link>
      </div>
    );
  }

  const { document, recipients, auditTrail } = data;
  const groupedAudit = groupAuditTrailByDate(auditTrail);
  const pendingRecipient = recipients.find(r => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-900 font-sans pb-12">
      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium">
          <Link href="/esign" className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-slate-900 font-semibold text-lg tracking-tight">Document Details</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-8 space-y-12">
        
        {/* Unified Document Header & Recipients Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <FileText size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                  {document.title}
                </h1>
                <div className="flex flex-wrap items-center space-x-3 mt-2 text-sm text-slate-500 font-medium">
                  <span>Transaction ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{document.transactionId}</span></span>
                  <span>•</span>
                  <span>Last updated {formatDateDDMMYYYY(document.updatedAt || document.createdAt)} {formatTime12hr(document.updatedAt || document.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={handleViewPdf}
                disabled={downloading}
                className="w-10 h-10 flex items-center justify-center border border-[#6b46c1]/30 text-[#6b46c1] rounded-lg hover:bg-[#6b46c1]/10 transition-colors cursor-pointer disabled:opacity-50"
                title="View PDF"
              >
                <Eye size={18} />
              </button>
              <button 
                onClick={handleViewPdf}
                disabled={downloading}
                className="w-10 h-10 flex items-center justify-center border border-[#6b46c1]/30 text-[#6b46c1] rounded-lg hover:bg-[#6b46c1]/10 transition-colors cursor-pointer disabled:opacity-50"
                title="Download PDF"
              >
                <Download size={18} />
              </button>
              
              {/* Remind Signers button */}
              {pendingRecipient && (
                <button 
                  onClick={() => handleRemind(pendingRecipient.id)}
                  disabled={reminding !== null}
                  className="flex-1 lg:flex-none px-6 py-2.5 bg-[#6b46c1] hover:bg-[#553c9a] text-white rounded-lg font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-70 flex items-center justify-center"
                >
                  {reminding ? "Sending..." : "Remind Signers"}
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  Recipients
                </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipients.map(rec => (
                  <div key={rec.id} className={`p-5 rounded-2xl border ${rec.status === 'SIGNED' ? 'border-teal-200 bg-teal-50/30' : 'border-[#d4a373]/30 bg-[#fffdf0]'} min-w-[280px] shadow-sm`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Signer</span>
                      <ExternalLink size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{rec.name}</h3>
                    <p className="text-sm text-slate-500 mb-5">{rec.email}</p>
                    <div className="flex items-center space-x-2">
                      {rec.status === 'SIGNED' ? (
                        <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-teal-100 text-teal-700 flex items-center uppercase tracking-wider">
                          <CheckCircle size={12} className="mr-1" />
                          {rec.status}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-amber-100/50 text-amber-700 flex items-center uppercase tracking-wider">
                          <Clock size={12} className="mr-1" />
                          {rec.status}
                        </span>
                      )}
                      <span className="text-[11px] font-bold bg-[#1e3a8a] text-white px-2 py-1 rounded-md uppercase tracking-wider">Digital</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
      
      {/* Divider */}
      <div className="w-full h-px bg-slate-200/60 my-10"></div>

      {/* Audit Trail Section - Full Width */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">Audit Trail</h2>
          <button className="text-[#6b46c1] text-sm font-semibold hover:underline cursor-pointer">
            Download Audit Trail
          </button>
        </div>

        <div className="space-y-12 pb-20 relative">
          
          {/* Main vertical line for the timeline */}
          <div className="absolute top-10 bottom-4 left-[31px] w-px bg-slate-300 -z-10 hidden md:block"></div>

          {Object.entries(groupedAudit).map(([dateLabel, events]) => (
            <div key={dateLabel}>
              <h4 className="text-sm font-bold text-slate-900 mb-6 sticky top-[72px] bg-[#f4f5f7]/90 backdrop-blur-sm py-2 z-10 w-max">{dateLabel}</h4>
              
              <div className="space-y-4">
                {events.map((event, i) => {
                  const details = getActionDetails(event);
                  return (
                    <div key={event.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center items-start gap-4 hover:shadow-md transition-shadow relative">
                      
                      {/* Icon placed inside the container, vertically centered */}
                      <div className={`w-11 h-11 rounded-full flex shrink-0 items-center justify-center text-white ${details.color} shadow-sm ring-4 ring-[#f4f5f7]`}>
                        {details.icon}
                      </div>

                      <div className="flex-1 flex flex-col md:flex-row md:justify-between md:items-center w-full gap-2">
                        <div>
                          <h4 className="font-bold text-slate-800 text-[15px]">{details.text}</h4>
                          <p className="text-sm text-slate-500 mt-0.5">{details.subtitle}</p>
                        </div>
                        <div className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          {formatDateDDMMYYYY(event.timestamp)} <span className="mx-1">|</span> {formatTime12hr(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {Object.keys(groupedAudit).length === 0 && (
            <p className="text-slate-500 italic">No audit events recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
