"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Users, X, AlertTriangle, Send, Eye, UserPlus, MapPin, Camera, Trash2, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { generateInviteEmailHtml } from '@/utils/emailTemplates';

import { toast } from 'sonner';

const PdfSkeleton = () => (
  <div className="w-full max-w-3xl h-[800px] bg-white shadow-xl rounded-xl mx-auto my-4 p-12 flex flex-col border border-slate-200 animate-in fade-in duration-500">
    <div className="animate-pulse space-y-8 mt-12">
      <div className="h-6 bg-slate-100 rounded-md w-3/4 mb-4"></div>
      <div className="h-4 bg-slate-100 rounded-md w-full mb-4"></div>
      <div className="h-4 bg-slate-100 rounded-md w-full mb-4"></div>
      <div className="h-4 bg-slate-100 rounded-md w-5/6 mb-4"></div>
      <div className="h-4 bg-slate-100 rounded-md w-full mb-4 mt-12"></div>
      <div className="h-4 bg-slate-100 rounded-md w-2/3 mb-4"></div>
      <div className="h-32 bg-slate-100 rounded-md w-full mt-20"></div>
    </div>
  </div>
);

const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => <PdfSkeleton />
});

interface Recipient {
  id: string;
  name: string;
  email: string;
  requireGps: boolean;
  requirePhoto: boolean;
  signaturePositions: any[];
}

export default function SendDigitalESignPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showReview, setShowReview] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'recipient' | 'security'>('recipient');
  const [enableWatermark, setEnableWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  
  // PDF state
  const [numPages, setNumPages] = useState<number>(0);
  const [activeSignerId, setActiveSignerId] = useState<string | null>(null);
  
  // Modal state
  const [showAddSigner, setShowAddSigner] = useState(false);
  const [newSigner, setNewSigner] = useState({ name: '', email: '', requireGps: false, requirePhoto: false });
  const [editSignerId, setEditSignerId] = useState<string | null>(null);
  
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
    
    if (editSignerId) {
      setRecipients(recipients.map(r => 
        r.id === editSignerId ? { ...r, ...newSigner } : r
      ));
    } else {
      setRecipients([...recipients, { 
        id: Math.random().toString(), 
        signaturePositions: [],
        ...newSigner 
      }]);
    }
    
    // Reset and close
    setNewSigner({ name: '', email: '', requireGps: false, requirePhoto: false });
    setEditSignerId(null);
    setShowAddSigner(false);
  };

  const handleEditSigner = (recipient: Recipient) => {
    setEditSignerId(recipient.id);
    setNewSigner({
      name: recipient.name,
      email: recipient.email,
      requireGps: recipient.requireGps,
      requirePhoto: recipient.requirePhoto
    });
    setShowAddSigner(true);
  };

  const moveRecipient = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === recipients.length - 1)) return;
    
    const newRecipients = [...recipients];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newRecipients[index], newRecipients[targetIndex]] = [newRecipients[targetIndex], newRecipients[index]];
    setRecipients(newRecipients);
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
    if (activeSignerId === id) setActiveSignerId(null);
  };

  const handleSend = async () => {
    if (!file) return toast.error("Please upload a PDF document.");
    if (!title) return toast.error("Please enter a document title.");
    if (recipients.length === 0) return toast.error("Please add at least one signer.");

    setIsSending(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("recipients", JSON.stringify(recipients.map(r => ({ 
      name: r.name, 
      email: r.email, 
      requireGps: r.requireGps, 
      requirePhoto: r.requirePhoto,
      signaturePositions: r.signaturePositions
    }))));
    
    if (enableWatermark && watermarkText.trim()) {
      formData.append("watermark", watermarkText.trim());
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/send`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errData = { error: "Unknown backend error" };
        try {
          errData = await response.json();
        } catch (e) {
          errData = { error: `Status: ${response.status} ${response.statusText}` };
        }
        throw new Error(`Backend Error: ${errData.error || JSON.stringify(errData)}`);
      }

      const data = await response.json();
      toast.success("Document sent successfully!");
      router.push('/esign');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error sending document. Please try again.");
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
        
        <div className="flex flex-col items-end">
          <button 
            type="button"
            onClick={() => {
              const hasMissingSignatures = recipients.some(r => !r.signaturePositions || r.signaturePositions.length === 0);
              if (hasMissingSignatures) {
                toast.error("Please place at least 1 signature for each signer");
                return;
              }
              setShowReview(true);
            }}
            disabled={isSendDisabled}
            className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-400 active:scale-[0.97] transition-all duration-150 ease-out disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100 text-slate-900 px-8 py-2.5 rounded-full font-medium shadow-sm cursor-pointer"
          >
            <span>Review & Send</span>
            <Send size={16} className="ml-1" />
          </button>
        </div>
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
               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
             />
          </div>

          {!file ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl bg-white flex flex-col items-center justify-center hover:bg-slate-50 hover:border-amber-500/50 transition-colors cursor-pointer min-h-[400px]"
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
              <div className="flex-1 flex flex-col relative min-h-0 bg-slate-200/50 rounded-2xl shadow-inner overflow-hidden">
              <button 
                onClick={() => { setFile(null); setTitle(""); setNumPages(0); setActiveSignerId(null); }}
                className="absolute top-4 right-4 z-20 bg-rose-500/90 hover:bg-rose-600 text-white p-2 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Remove Document"
              >
                <Trash2 size={18} />
              </button>

              {activeSignerId && (
                <div className="absolute top-4 left-4 right-16 z-20 bg-amber-400/90 text-slate-900 px-4 py-2 rounded-lg backdrop-blur-md shadow-sm flex items-center justify-between animate-in slide-in-from-top-2">
                  <div className="flex items-center space-x-2">
                    <Pencil size={16} />
                    <span className="text-sm font-semibold tracking-wide">Placing signature for <span className="font-bold underline underline-offset-2">{recipients.find(r => r.id === activeSignerId)?.name}</span></span>
                  </div>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveSignerId(null); }} className="text-xs font-bold bg-white text-amber-700 px-3 py-1 rounded-md hover:bg-amber-50 active:scale-95 transition-all cursor-pointer">Done</button>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto p-4 pb-20 flex flex-col items-center">
                <PDFViewer 
                  file={file} 
                  numPages={numPages} 
                  onDocumentLoadSuccess={onDocumentLoadSuccess} 
                  watermarkText={enableWatermark ? watermarkText : undefined}
                  isDraggable={!!activeSignerId}
                  activeSignerName={activeSignerId ? recipients.find(r => r.id === activeSignerId)?.name : undefined}
                  signaturePositions={activeSignerId ? recipients.find(r => r.id === activeSignerId)?.signaturePositions : []}
                  onSignaturePositionsChange={activeSignerId ? (newPos) => {
                    setRecipients(recipients.map(r => r.id === activeSignerId ? { ...r, signaturePositions: newPos } : r));
                  } : undefined}
                  onAddSignatureBox={activeSignerId ? (pageNumber) => {
                    setRecipients(recipients.map(r => r.id === activeSignerId ? { 
                      ...r, 
                      signaturePositions: [...r.signaturePositions, { pageNumber, pctX: 0.5, pctY: 0.5 }] 
                    } : r));
                  } : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Setup (Tabs: Recipients & Security) */}
        <div className="w-full lg:w-2/5 bg-white flex flex-col border-l border-slate-200">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('recipient')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'recipient' ? 'text-amber-600 border-b-2 border-amber-600 bg-slate-50/50' : 'text-slate-500 hover:text-slate-700 bg-white'}`}
            >
              Recipient
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'security' ? 'text-amber-600 border-b-2 border-amber-600 bg-slate-50/50' : 'text-slate-500 hover:text-slate-700 bg-white'}`}
            >
              Security
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'recipient' && (
              <>
                <div className="flex items-center space-x-3 mb-8 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add Signers</h2>
              <p className="text-sm text-slate-500">Who needs to sign this document?</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="flex flex-col mb-2">
                <div className="p-4 rounded-t-xl relative z-10 bg-slate-50 border border-slate-100 flex items-start justify-between group">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{recipient.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{recipient.email}</p>
                      <div className="flex space-x-2 mt-2">
                        {recipient.requireGps && <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"><MapPin size={10} className="mr-1"/> GPS Required</span>}
                        {recipient.requirePhoto && <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"><Camera size={10} className="mr-1"/> Photo Required</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => moveRecipient(index, 'up')}
                      disabled={index === 0}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors p-2 rounded-lg hover:bg-slate-200 active:scale-95 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveRecipient(index, 'down')}
                      disabled={index === recipients.length - 1}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors p-2 rounded-lg hover:bg-slate-200 active:scale-95 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditSigner(recipient)}
                      className="text-slate-400 hover:text-amber-600 transition-colors p-2 rounded-lg hover:bg-amber-50 active:scale-95 cursor-pointer"
                      title="Edit Signer"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => removeRecipient(recipient.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50 active:scale-95 cursor-pointer"
                      title="Remove Signer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-100/50 border-x border-b border-slate-100 rounded-b-xl px-4 py-3 -mt-3 flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium">
                    {recipient.signaturePositions.length} signature box{recipient.signaturePositions.length !== 1 && 'es'} placed
                  </div>
                  <button 
                    onClick={() => setActiveSignerId(activeSignerId === recipient.id ? null : recipient.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center transition-colors cursor-pointer ${activeSignerId === recipient.id ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    <Pencil size={12} className="mr-1.5" /> 
                    {activeSignerId === recipient.id ? 'Done Placing' : 'Place Signature'}
                  </button>
                </div>
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
            className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 font-medium flex items-center justify-center hover:bg-slate-50 hover:border-amber-500/30 hover:text-amber-700 transition-colors active:scale-[0.98] cursor-pointer"
          >
            <UserPlus size={18} className="mr-2" />
            {recipients.length === 0 ? "Add Signer" : "Add Another Signer"}
          </button>
              </>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center space-x-3 mb-8 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                    <p className="text-sm text-slate-500">Configure document protection.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">Add Watermark</h3>
                      <p className="text-xs text-slate-500 mt-1">Stamp text across all pages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={enableWatermark} onChange={(e) => setEnableWatermark(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {enableWatermark && (
                    <div className="mt-5 pt-5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Watermark Text</label>
                      <input 
                        type="text" 
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="e.g., CONFIDENTIAL"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Signer Modal */}
      {showAddSigner && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">{editSignerId ? "Edit Signer" : "Add Signer"}</h3>
              <button onClick={() => { setShowAddSigner(false); setEditSignerId(null); setNewSigner({ name: '', email: '', requireGps: false, requirePhoto: false }); }} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-200 transition-colors">
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
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
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
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
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
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-amber-500/30 focus:outline-none checked:bg-amber-600 checked:border-amber-600 transition-colors cursor-pointer" 
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
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-amber-500/30 focus:outline-none checked:bg-amber-600 checked:border-amber-600 transition-colors cursor-pointer" 
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
                  onClick={() => { setShowAddSigner(false); setEditSignerId(null); setNewSigner({ name: '', email: '', requireGps: false, requirePhoto: false }); }}
                  className="px-6 py-2.5 rounded-full font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newSigner.name || !newSigner.email}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-full font-medium transition-all shadow-sm active:scale-[0.97] cursor-pointer"
                >
                  {editSignerId ? "Save" : "Add"}
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
                          {r.requireGps && <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">GPS Req</span>}
                          {r.requirePhoto && <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Photo Req</span>}
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
                className="flex items-center bg-amber-400 hover:bg-amber-400 disabled:bg-amber-400 text-slate-900 px-8 py-2.5 rounded-full font-medium shadow-sm transition-all active:scale-[0.97] cursor-pointer"
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
