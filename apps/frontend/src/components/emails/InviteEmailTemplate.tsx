import React from 'react';

interface InviteEmailTemplateProps {
  recipientName: string;
  senderName: string;
  documentName: string;
}

export function InviteEmailTemplate({ recipientName, senderName, documentName }: InviteEmailTemplateProps) {
  return (
    <div className="font-sans text-slate-800 bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">e</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Ehastakshar</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            Action Required
          </span>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Signature Requested
          </h1>
          
          <div className="text-slate-600 leading-relaxed space-y-4">
            <p>Hello <span className="font-semibold text-slate-900">{recipientName}</span>,</p>
            
            <p>
              You've been invited by <span className="font-semibold text-slate-900">{senderName}</span> to review and sign the document <strong>"{documentName}.pdf"</strong>.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 my-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-sm border border-slate-200">
                  📄
                </div>
                <div>
                  <p className="font-medium text-slate-900">{documentName}.pdf</p>
                  <p className="text-xs text-slate-500">Secure Digital Signature</p>
                </div>
              </div>
            </div>

            <p className="text-sm">
              Please click the button below to securely review and sign this document.
            </p>
          </div>

          <div className="pt-4">
            <button className="bg-teal-600 text-white font-medium px-6 py-3 rounded-xl shadow-sm w-full hover:bg-teal-700 transition-colors">
              Review & Sign Document
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Powered by securely encrypted signatures from <br />
            <strong>Ehastakshar</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
