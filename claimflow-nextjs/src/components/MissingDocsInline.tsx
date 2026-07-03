import React, { useState } from 'react';
import { Check } from 'lucide-react';

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

  const toggleDoc = (doc: string) => {
    setSelectedDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
  };

  const handleSubmit = async () => {
    if (selectedDocs.length === 0) return;
    await onGenerate(selectedDocs, '');
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Checklist Section */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-card-foreground mb-1 text-base">Missing Documents — Claim #{claimNo}</h3>
        <p className="text-xs text-muted-foreground mb-4">Select the documents that are missing, then save the checklist.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {MISSING_DOCS.map(doc => (
            <label key={doc} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-muted/50 transition border border-transparent has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
              <input type="checkbox" checked={selectedDocs.includes(doc)} onChange={() => toggleDoc(doc)}
                className="rounded border-input accent-primary h-4 w-4" />
              <span className="text-sm text-card-foreground">{doc}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={loading || selectedDocs.length === 0}
            className="action-btn flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Check size={16} /> Save Checklist
          </button>
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border text-sm text-card-foreground hover:bg-muted transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
