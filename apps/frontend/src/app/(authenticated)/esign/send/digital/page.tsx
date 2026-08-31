"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Users, X, AlertTriangle, Send, Eye, UserPlus, MapPin, Camera } from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateInviteEmailHtml } from '@/utils/emailTemplates';

import { toast } from 'sonner';

const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => <div className="p-8 text-slate-500 font-medium">Loading PDF viewer...</div>
});

interface Recipient {
  id: string;
  name: string;
  email: string;
  requireGps: boolean;
  requirePhoto: boolean;
}

export default function SendDigitalESignPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  // PDF state
  const [numPages, setNumPages] = useState<number>(0);
  
  // Modal state
  const [showAddSigner, setShowAddSigner] = useState(false);
  const [newSigner, setNewSigner] = useState({ name: '', email: '', requireGps: false, requirePhoto: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      handleFileSelection(droppedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit.");
      return;
    }
    setFile(selectedFile);
    setTitle(selectedFile.name.replace('.pdf', ''));
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleAddSignerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigner.name || !newSigner.email) return;
    
    setRecipients([...recipients, { 
      id: Math.random().toString(), 
      ...newSigner 
    }]);
    
    // Reset and close
    setNewSigner({ name: '', email: '', requireGps: false, requirePhoto: false });
    setShowAddSigner(false);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handleSend = async () => {
    if (!file) return toast.error("Please upload a PDF document.");
    if (!title) return toast.error("Please enter a document title.");
    if (recipients.length === 0) return toast.error("Please add at least one signer.");

    setIsSending(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    // Send recipients as a JSON string
    formData.append("recipients", JSON.stringify(recipients.map(r => ({ name: r.name, email: r.email, requireGps: r.requireGps, requirePhoto: r.requirePhoto }))));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/send`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to send document");
      }

      const data = await response.json();
      toast.success("Document sent successfully!");
      router.push('/esign');
    } catch (error) {
      console.error(error);
      toast.error("Error sending document. Please try again.");
    } finally {
      setIsSending(false);
      setShowReview(false);
    }
  };

  // Calculate Expiry Date for display
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  
  const isSendDisabled = !file || !title || recipients.length === 0;

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/esign/send/type" className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">New Digital eSign</h1>
            <p className="text-xs text-slate-500">Secure OTP-based signing</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowReview(true)}
          disabled={isSendDisabled}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 active:scale-[0.97] transition-all duration-150 ease-out disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100 text-white px-8 py-2.5 rounded-full font-medium shadow-sm cursor-pointer"
        >
          <span>Review & Send</span>
          <Send size={16} className="ml-1" />
        </button>
      </nav>

      {/* Main Split View - Fixed height container with scrolling children */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Document Preview (Scrolls independently) */}
        <div className="w-full lg:w-3/5 bg-slate-100 border-r border-slate-200 p-6 flex flex-col relative overflow-y-auto">
          
          <div className="mb-4 shrink-0">
             <label className="block text-sm font-semibold text-slate-700 mb-1">Document Title</label>
             <input 
               type="text" 
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="e.g. Employee NDA"
               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
             />
          </div>

          {!file ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl bg-white flex flex-col items-center justify-center hover:bg-slate-50 hover:border-teal-500/50 transition-colors cursor-pointer min-h-[400px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Upload a PDF</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                Drag and drop your document here, or click to browse. Max size 100MB.
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center bg-slate-200/50 rounded-2xl overflow-y-auto shadow-inner relative p-4 pb-20">
              <button 
                onClick={() => { setFile(null); setTitle(""); setNumPages(0); }}
                className="fixed lg:absolute top-8 right-8 lg:top-4 lg:right-4 z-10 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                title="Remove Document"
              >
                <X size={20} />
              </button>
              
              <PDFViewer 
                file={file} 
                numPages={numPages} 
                onDocumentLoadSuccess={onDocumentLoadSuccess} 
              />
            </div>
          )}
        </div>

        {/* Right Panel: Recipients Setup (Scrolls independently) */}
        <div className="w-full lg:w-2/5 bg-white p-6 overflow-y-auto">
          <div className="flex items-center space-x-3 mb-8 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Signers</h2>
              <p className="text-sm text-slate-500">Who needs to sign this document?</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between group">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{recipient.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{recipient.email}</p>
                    <div className="flex space-x-2 mt-2">
                      {recipient.requireGps && <span className="inline-flex items-center text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium"><MapPin size={10} className="mr-1"/> GPS Required</span>}
                      {recipient.requirePhoto && <span className="inline-flex items-center text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium"><Camera size={10} className="mr-1"/> Photo Required</span>}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeRecipient(recipient.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {recipients.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-500 text-sm">No signers added yet.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAddSigner(true)}
            className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 font-medium flex items-center justify-center hover:bg-slate-50 hover:border-teal-500/30 hover:text-teal-700 transition-colors active:scale-[0.98] cursor-pointer"
          >
            <UserPlus size={18} className="mr-2" />
            {recipients.length === 0 ? "Add Signer" : "Add Another Signer"}
          </button>
        </div>
      </div>

      {/* Add Signer Modal */}
      {showAddSigner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Add Signer</h3>
              <button onClick={() => setShowAddSigner(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSignerSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newSigner.name}
                    onChange={(e) => setNewSigner({...newSigner, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newSigner.email}
                    onChange={(e) => setNewSigner({...newSigner, email: e.target.value})}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-medium"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-800 mb-1">Additional security</label>
                  <p className="text-xs text-slate-500 mb-4">Make the recipients verify themselves with below details</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={newSigner.requireGps}
                          onChange={(e) => setNewSigner({...newSigner, requireGps: e.target.checked})}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-500/30 focus:outline-none checked:bg-teal-600 checked:border-teal-600 transition-colors cursor-pointer" 
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Capture GPS location</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={newSigner.requirePhoto}
                          onChange={(e) => setNewSigner({...newSigner, requirePhoto: e.target.checked})}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-500/30 focus:outline-none checked:bg-teal-600 checked:border-teal-600 transition-colors cursor-pointer" 
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Capture photo</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowAddSigner(false)}
                  className="px-6 py-2.5 rounded-full font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newSigner.name || !newSigner.email}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-[0.97] cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Send Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Review & Send</h3>
              <button onClick={() => setShowReview(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Expiry Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 shrink-0">
                <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Document Expiry Notice</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    This document will expire on <strong>{expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>. 
                    Recipients have 7 days to complete signing, otherwise it will be marked as expired.
                  </p>
                </div>
              </div>

              {/* Email Preview */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                  <Eye size={16} className="mr-2 text-slate-400" />
                  Email Invite Preview
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                    <p className="text-sm text-slate-500">Subject: <span className="font-medium text-slate-900">Action Required: Sign {title}</span></p>
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: generateInviteEmailHtml({
                        recipientName: recipients.length === 1 ? recipients[0].name.split(' ')[0] : 'Signer',
                        senderName: "Ehastakshar User",
                        documentName: title || "Document",
                        link: "#"
                      })
                    }} 
                  />
                </div>
              </div>

              {/* Recipients Summary */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                  <Users size={16} className="mr-2 text-slate-400" />
                  Sending to {recipients.length} Recipient(s)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recipients.map((r, i) => (
                    <div key={i} className="flex flex-col text-sm p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">{r.name}</span>
                        <div className="flex space-x-1">
                          {r.requireGps && <span className="text-[10px] uppercase tracking-wider font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">GPS Req</span>}
                          {r.requirePhoto && <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Photo Req</span>}
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs">{r.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setShowReview(false)}
                className="px-6 py-2.5 rounded-full font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-8 py-2.5 rounded-full font-medium shadow-sm transition-all active:scale-[0.97] cursor-pointer"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Send Invite</span>
                    <Send size={16} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
