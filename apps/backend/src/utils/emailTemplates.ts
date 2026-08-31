export function generateInviteEmailHtml({ recipientName, senderName, documentName, link }: { recipientName: string; senderName: string; documentName: string; link: string; }): string {
  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
      <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; max-width: 576px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; background-color: #0d9488; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
              <span style="color: #ffffff; font-weight: bold; font-size: 18px;">e</span>
            </div>
            <span style="font-size: 20px; font-weight: bold; letter-spacing: -0.025em; color: #0f172a; margin-left: 8px; vertical-align: middle;">Ehastakshar</span>
          </div>
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #0d9488; background-color: #f0fdfa; padding: 4px 12px; border-radius: 9999px;">
            Action Required
          </span>
        </div>

        <!-- Content -->
        <div>
          <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 24px;">
            Signature Requested
          </h1>
          
          <div style="color: #475569; line-height: 1.625; margin-bottom: 24px;">
            <p style="margin-top: 0; margin-bottom: 16px;">Hello <span style="font-weight: 600; color: #0f172a;">${recipientName}</span>,</p>
            
            <p style="margin-top: 0; margin-bottom: 24px;">
              You've been invited by <span style="font-weight: 600; color: #0f172a;">${senderName}</span> to review and sign the document <strong>"${documentName}.pdf"</strong>.
            </p>

            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; font-size: 20px; vertical-align: middle;">
                  📄
                </div>
                <div style="display: inline-block; vertical-align: middle; margin-left: 12px;">
                  <p style="font-weight: 500; color: #0f172a; margin: 0; margin-bottom: 4px;">${documentName}.pdf</p>
                  <p style="font-size: 12px; color: #64748b; margin: 0;">Secure Digital Signature</p>
                </div>
              </div>
            </div>

            <p style="font-size: 14px; margin-top: 0; margin-bottom: 24px;">
              Please click the button below to securely review and sign this document.
            </p>
          </div>

          <div style="padding-top: 16px;">
            <a href="${link}" style="display: block; background-color: #0d9488; color: #ffffff; font-weight: 500; padding: 12px 24px; border-radius: 12px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); text-align: center; text-decoration: none;">
              Review & Sign Document
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
            Powered by securely encrypted signatures from <br />
            <strong style="color: #64748b;">Ehastakshar</strong>
          </p>
        </div>
      </div>
    </div>
  `;
}

export function generateCompletionEmailHtml({ documentName, link }: { documentName: string; link: string; }): string {
  return `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 24px;">
      <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; max-width: 576px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; background-color: #0d9488; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
              <span style="color: #ffffff; font-weight: bold; font-size: 18px;">e</span>
            </div>
            <span style="font-size: 20px; font-weight: bold; letter-spacing: -0.025em; color: #0f172a; margin-left: 8px; vertical-align: middle;">Ehastakshar</span>
          </div>
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #0ea5e9; background-color: #e0f2fe; padding: 4px 12px; border-radius: 9999px;">
            Completed
          </span>
        </div>

        <!-- Content -->
        <div>
          <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 24px;">
            Document Signed
          </h1>
          
          <div style="color: #475569; line-height: 1.625; margin-bottom: 24px;">
            <p style="margin-top: 0; margin-bottom: 16px;">Hello,</p>
            
            <p style="margin-top: 0; margin-bottom: 24px;">
              The document <strong>"${documentName}.pdf"</strong> has been completely signed! The copy of the completed document is available via the secure link below.
            </p>

            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; font-size: 20px; vertical-align: middle;">
                  📄
                </div>
                <div style="display: inline-block; vertical-align: middle; margin-left: 12px;">
                  <p style="font-weight: 500; color: #0f172a; margin: 0; margin-bottom: 4px;">${documentName}.pdf</p>
                  <p style="font-size: 12px; color: #10b981; margin: 0; font-weight: 600;">✓ Fully Signed & Audited</p>
                </div>
              </div>
            </div>
          </div>

          <div style="padding-top: 16px;">
            <a href="${link}" style="display: block; background-color: #0f172a; color: #ffffff; font-weight: 500; padding: 12px 24px; border-radius: 12px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); text-align: center; text-decoration: none;">
              Download Completed Document
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
            Powered by securely encrypted signatures from <br />
            <strong style="color: #64748b;">Ehastakshar</strong>
          </p>
        </div>
      </div>
    </div>
  `;
}
