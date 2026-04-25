import React, { useState, useRef } from 'react';
import { FileDown, Printer, RefreshCw } from 'lucide-react';

const MISSING_DOCS = [
  'Claim Form', 'Death Certificate', 'Attested Copy of CNIC', 'Affidavit',
  'Bank Account Details', 'Guardianship Certificate', 'Succession Certificate', 'Attested Copy of Salary Slip',
];

interface Props {
  claimNo: string;
  onGenerate: (docs: string[], department: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function MissingDocsInline({ claimNo, onGenerate, onCancel, loading }: Props) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [department, setDepartment] = useState('');
  const [generated, setGenerated] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const toggleDoc = (doc: string) => {
    setSelectedDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
    setGenerated(false);
  };

  const handleGenerate = async () => {
    if (selectedDocs.length === 0) return;
    await onGenerate(selectedDocs, department);
    setGenerated(true);
  };

  const handlePrint = () => {
    if (!letterRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Missing Documents - ${claimNo}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
        .header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
        .header img { height: 56px; width: 56px; object-fit: contain; }
        .header h2 { font-size: 18px; font-weight: bold; margin: 0; }
        .header p { font-size: 12px; color: #666; margin: 2px 0 0; }
        .body-text { font-size: 14px; line-height: 1.8; margin-bottom: 8px; }
        ul { padding-left: 24px; }
        ul li { font-size: 14px; margin-bottom: 4px; }
        .signature { margin-top: 48px; border-top: 1px solid #ccc; padding-top: 16px; }
        .signature p { font-size: 13px; margin: 2px 0; }
      </style></head><body>
      ${letterRef.current.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    // Use print-to-PDF via the same print flow
    handlePrint();
  };

  const handleRegenerate = () => {
    setGenerated(false);
    setSelectedDocs([]);
    setDepartment('');
  };

  const showPreview = selectedDocs.length > 0;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="mt-6 space-y-6">
      {/* Checklist Section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-1 text-base">Missing Documents — Claim #{claimNo}</h3>
        <p className="text-xs text-muted-foreground mb-4">Select the documents that are missing, then generate the letter.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {MISSING_DOCS.map(doc => (
            <label key={doc} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-muted/50 transition border border-transparent has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
              <input type="checkbox" checked={selectedDocs.includes(doc)} onChange={() => toggleDoc(doc)}
                className="rounded border-input accent-primary h-4 w-4" />
              <span className="text-sm text-card-foreground">{doc}</span>
            </label>
          ))}
        </div>

        <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
          placeholder="Enter Department"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-ring" />

        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={loading || selectedDocs.length === 0}
            className="action-btn flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <FileDown size={16} /> Generate Letter
          </button>
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border text-sm text-card-foreground hover:bg-muted transition">
            Cancel
          </button>
        </div>
      </div>

      {/* Live Letter Preview */}
      {showPreview && (
        <div className="flex flex-col items-center">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Letter Preview</h4>

          <div className="bg-white border border-border shadow-lg rounded-sm w-full max-w-[210mm] mx-auto"
            style={{ minHeight: '297mm', padding: '20mm 25mm', fontFamily: "'Times New Roman', serif" }}>
            <div ref={letterRef}>
              {/* Header */}
              <div className="header" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
                <img src="/images/slic-logo.png" alt="SLIC" style={{ height: '56px', width: '56px', objectFit: 'contain' }} />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>State Life Insurance Corporation of Pakistan</h2>
                  <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>Missing Documents Notification</p>
                </div>
              </div>

              {/* Date & Ref */}
              <p style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>Date: {today}</p>
              <p style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>Ref: Claim #{claimNo}</p>
              <p style={{ fontSize: '13px', color: '#333', marginBottom: '24px' }}>To: {department || '_______________'}</p>

              {/* Body */}
              <p style={{ fontSize: '14px', color: '#000', lineHeight: '1.8', marginBottom: '16px' }}>
                Dear Sir/Madam,
              </p>
              <p style={{ fontSize: '14px', color: '#000', lineHeight: '1.8', marginBottom: '16px' }}>
                This is to inform you that the following documents are missing/incomplete for the processing of Claim #{claimNo}. 
                Kindly arrange to submit the required documents at the earliest convenience.
              </p>

              {/* Document List */}
              <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                {selectedDocs.map(d => (
                  <li key={d} style={{ fontSize: '14px', color: '#000', marginBottom: '6px', lineHeight: '1.6' }}>{d}</li>
                ))}
              </ul>

              <p style={{ fontSize: '14px', color: '#000', lineHeight: '1.8', marginBottom: '8px' }}>
                Your prompt attention to this matter is appreciated.
              </p>
              <p style={{ fontSize: '14px', color: '#000', lineHeight: '1.8' }}>
                Regards,
              </p>

              {/* Signature */}
              <div className="signature" style={{ marginTop: '48px', borderTop: '1px solid #ccc', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: '2px 0' }}>Signature:</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginTop: '8px' }}>Zonal Head</p>
                <p style={{ fontSize: '12px', color: '#666' }}>State Life Insurance Corporation of Pakistan</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {generated && (
            <div className="flex gap-3 mt-4">
              <button onClick={handleDownloadPDF} className="action-btn py-2.5 px-5 rounded-xl flex items-center gap-2">
                <FileDown size={16} /> Download as PDF
              </button>
              <button onClick={handlePrint} className="action-btn py-2.5 px-5 rounded-xl flex items-center gap-2">
                <Printer size={16} /> Print
              </button>
              <button onClick={handleRegenerate} className="px-5 py-2.5 rounded-xl border border-border text-sm text-card-foreground hover:bg-muted transition flex items-center gap-2">
                <RefreshCw size={16} /> Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
