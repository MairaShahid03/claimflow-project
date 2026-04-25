import React from 'react';
import { CheckCircle } from 'lucide-react';

const WORKFLOW_STAGES = [
  { key: 'claim_intimation', label: 'Claim Intimation' },
  { key: 'requirements_manager', label: 'Requirements Manager' },
  { key: 'claim_payment_voucher', label: 'CPV' },
  { key: 'cpv_checking', label: 'CPV Checking' },
  { key: 'claim_incharge', label: 'Claim Incharge' },
  { key: 'phs_incharge', label: 'PHS Incharge' },
  { key: 'fa_incharge', label: 'F&A Incharge' },
  { key: 'auditor', label: 'Auditor' },
  { key: 'zhs', label: 'ZHS' },
  { key: 'cheque_preparation', label: 'Cheque Prep' },
  { key: 'claim_forwarding_letter', label: 'Forwarding' },
  { key: 'dispatching', label: 'Dispatching' },
];

interface ClaimProgressStepperProps {
  currentStage: string | null;
  completedStages?: string[];
}

export default function ClaimProgressStepper({ currentStage, completedStages }: ClaimProgressStepperProps) {
  const currentIdx = WORKFLOW_STAGES.findIndex(s => s.key === currentStage);
  const isDispatched = currentStage === 'dispatched';

  const getStatus = (idx: number, stageKey: string): 'completed' | 'active' | 'pending' => {
    if (isDispatched) return 'completed';
    if (completedStages?.includes(stageKey)) return 'completed';
    if (currentIdx === -1) return 'pending';
    if (idx < currentIdx) return 'completed';
    if (idx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="overflow-x-auto py-3 px-1">
      <div className="flex items-start min-w-[700px]">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const status = getStatus(idx, stage.key);
          const isLast = idx === WORKFLOW_STAGES.length - 1;

          return (
            <div key={stage.key} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center min-w-[56px]">
                {/* Circle */}
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0
                  ${status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : status === 'active'
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300/50'
                      : 'bg-muted border-border text-muted-foreground'
                  }
                `}>
                  {status === 'completed' ? <CheckCircle size={14} /> : idx + 1}
                </div>
                {/* Label */}
                <span className={`
                  text-[9px] mt-1.5 text-center leading-tight max-w-[60px]
                  ${status === 'completed'
                    ? 'text-green-600 font-semibold'
                    : status === 'active'
                      ? 'text-blue-600 font-bold'
                      : 'text-muted-foreground'
                  }
                `}>
                  {stage.label}
                </span>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 flex items-center pt-3.5 px-0.5">
                  <div className={`h-[2px] w-full rounded-full transition-all ${
                    status === 'completed' ? 'bg-green-500' : 'bg-border'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
